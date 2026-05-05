#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const nodeVersion = process.env.INKBLADE_PREFLIGHT_NODE ?? process.version;
const generatedAt = process.env.INKBLADE_PREFLIGHT_NOW ?? new Date().toISOString();
const branch = process.env.INKBLADE_PREFLIGHT_BRANCH ?? getGitValue(["branch", "--show-current"]);
const commit = process.env.INKBLADE_PREFLIGHT_COMMIT ?? getGitValue(["rev-parse", "--short", "HEAD"]);
const reportBalance = manifest.scripts?.["report:balance"];
const reportHandoff = manifest.scripts?.["report:handoff"];

process.stdout.write(`# Inkblade Handoff Preflight

Generated: ${generatedAt}

## Runtime

- Required Node: \`${manifest.engines?.node ?? "not declared"}\`
- Node runtime: \`${nodeVersion}\` ${isNode24OrNewer(nodeVersion) ? "PASS" : "FAIL"}

## Checkout

- Branch: \`${branch || "unknown"}\`
- Commit: \`${commit || "unknown"}\`

## Report Commands

- \`report:balance\`: ${reportBalance ? "PASS" : "FAIL"}${reportBalance ? ` — \`${reportBalance}\`` : ""}
- \`report:handoff\`: ${reportHandoff ? "PASS" : "FAIL"}${reportHandoff ? ` — \`${reportHandoff}\`` : ""}

## Handoff Documents

- \`docs/playtest/alpha-acceptance.md\`: ${fileExists("docs/playtest/alpha-acceptance.md") ? "PASS" : "FAIL"}
- \`docs/playtest/desktop-playtest-checklist.md\`: ${fileExists("docs/playtest/desktop-playtest-checklist.md") ? "PASS" : "FAIL"}
- \`docs/playtest/external-bug-intake.md\`: ${fileExists("docs/playtest/external-bug-intake.md") ? "PASS" : "FAIL"}

Next: run \`npm run report:balance\` then \`npm run report:handoff\`.
`);

function isNode24OrNewer(version) {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  return Number.isFinite(major) && major >= 24;
}

function fileExists(path) {
  return existsSync(resolve(root, path));
}

function getGitValue(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "unknown";
  }
}
