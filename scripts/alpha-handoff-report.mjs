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

- Wave 66 candidate gate: TypeScript, Vitest 37 files / 270 tests, Vite build, full Chromium e2e, visual smoke, responsive/a11y, asset audit, card-art quality report, performance budget PASS, balance, and handoff report are green.
- Desktop Chromium remains the active external QA target; Wave65 protects narrow mobile layout smoke coverage, while touch QA and mobile release support remain out of current EA scope.
- Current asset gate: asset audit 228 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0 / GPT2 runtime assets 122 / source sheets 21.
- Current art ledger: 150 cards, missing files 0, duplicate asset groups 31, replacement queue 148; remaining queue items are non-blocking art backlog rather than EA blockers.
- Wave 24 balance report label: markdown starts \`# Wave 24 Alpha Balance Report\` with report id \`wave24-alpha-balance-v1\`.
- Current multi-seed balance artifact: 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, Zhuge Liang lowest HP band 8/10/15.
- Waves 59-65 completed post-EA commercial polish across card art, premium card frames, combat HUD feedback, scene surfaces, route cinematics, responsive/a11y checks, and performance budgets.
- No planned post-EA autonomous waves remain after Wave66; future work should be filed as external review feedback or deferred backlog.

## Local Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Direct runtime:

\`\`\`bash
node node_modules/vite/bin/vite.js --host 127.0.0.1
\`\`\`

## Verification Commands

\`\`\`bash
node scripts/audit-generated-assets.mjs
node scripts/card-art-quality-report.mjs
node scripts/perf-budget.mjs --build
node node_modules/typescript/bin/tsc --noEmit
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
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
