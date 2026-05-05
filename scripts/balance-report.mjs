#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputMarkdown = process.argv.includes("--markdown");
const outputPath = getOutputPath(process.argv);
const seeds = getSeeds(process.argv);

const server = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: {
    middlewareMode: true
  }
});

try {
  const { createBalanceReport, formatBalanceReportMarkdown } = await server.ssrLoadModule(
    "/src/game/systems/debug/balanceReport.ts"
  );
  const report = createBalanceReport(seeds.length > 0 ? { seeds } : { routeSeed: 9001 });
  const payload = outputMarkdown ? formatBalanceReportMarkdown(report) : `${JSON.stringify(report, null, 2)}\n`;
  process.stdout.write(payload);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, payload, "utf8");
  }
} finally {
  await server.close();
}

function getOutputPath(argv) {
  const outputFlagIndex = argv.indexOf("--out");
  if (outputFlagIndex === -1) {
    return undefined;
  }

  const value = argv[outputFlagIndex + 1];
  return value && !value.startsWith("--") ? resolve(root, value) : undefined;
}

function getSeeds(argv) {
  const seedFlagIndex = argv.indexOf("--seeds");
  if (seedFlagIndex === -1) {
    return [];
  }

  const value = argv[seedFlagIndex + 1] ?? "";
  return value
    .split(",")
    .map((seed) => Number(seed.trim()))
    .filter((seed) => Number.isFinite(seed));
}
