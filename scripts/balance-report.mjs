#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputMarkdown = process.argv.includes("--markdown");

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
  const report = createBalanceReport({ routeSeed: 9001 });
  process.stdout.write(outputMarkdown ? formatBalanceReportMarkdown(report) : `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await server.close();
}
