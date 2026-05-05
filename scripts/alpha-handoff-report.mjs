#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCheckoutMetadata } from "./git-metadata.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = getFlagValue(process.argv, "--out");
const balanceReportPath = getFlagValue(process.argv, "--balance-report");
const checkout = resolveCheckoutMetadata(root, {
  branchOverride: process.env.INKBLADE_HANDOFF_BRANCH,
  commitOverride: process.env.INKBLADE_HANDOFF_COMMIT
});
const report = renderReport({
  generatedAt: process.env.INKBLADE_HANDOFF_NOW ?? new Date().toISOString(),
  branch: checkout.branch,
  commit: checkout.commit,
  balanceReportPath
});

process.stdout.write(report);

if (outputPath) {
  const resolvedOutput = resolve(root, outputPath);
  await mkdir(dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, report, "utf8");
}

function renderReport({ generatedAt, branch, commit, balanceReportPath }) {
  const balanceLine = balanceReportPath
    ? `- Balance artifact: \`${balanceReportPath}\`\n`
    : "- Balance artifact: not attached; generate one with `node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md`.\n";

  return `# Inkblade Alpha Handoff Report

Generated: ${generatedAt}
Branch: \`${branch || "unknown"}\`
Commit: \`${commit || "unknown"}\`

## Current Acceptance Baseline

- Desktop Chromium is the active alpha target; mobile layout and touch QA remain out of scope.
- Wave 14 full release gate: Vitest 19 files / 192 tests, TypeScript, Vite build, Playwright 27 Chromium tests, asset audit, and balance artifact stdout match.
- Wave 15 handoff kit: refreshed desktop playtest checklist and external bug intake guide.
- Milestone 58 remains optional GPT Image 2 bitmap card-art quality backlog.

## Local Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Bundled runtime:

\`\`\`bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js --host 127.0.0.1
\`\`\`

## Verification Commands

\`\`\`bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
\`\`\`

## Playtest Documents

- Alpha acceptance: \`docs/playtest/alpha-acceptance.md\`
- Desktop checklist: \`docs/playtest/desktop-playtest-checklist.md\`
- External bug intake: \`docs/playtest/external-bug-intake.md\`
${balanceLine}
## Debug Notes

- Mark every report that used \`调试跳章\` / debug skip.
- For compendium issues, distinguish current-run logbook fragments from profile-recorded \`已录\` entries.
- Attach screenshot, console errors, missing asset URLs, route tags, character, save/reload state, and branch/commit.
`;
}

function getFlagValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  const value = argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}
