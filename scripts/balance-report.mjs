#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputMarkdown = process.argv.includes("--markdown");
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
  process.stdout.write(outputMarkdown ? formatBalanceReportMarkdown(report) : `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await server.close();
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
