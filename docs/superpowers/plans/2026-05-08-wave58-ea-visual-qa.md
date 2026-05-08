# Wave 58 EA Visual QA Gate

Date: 2026-05-08
Branch: `codex/wave58-ea-visual-qa`
Worktree: `.worktrees/wave58-ea-visual-qa`

## Goal

Close the EA build with repeatable visual and systems gates, and only fix issues that would block a release-grade review.

## Scope

- Run the full deterministic and browser QA matrix.
- Check title, map, combat, reward, shop, event, rest, compendium, run summary, victory, and defeat presentation.
- Refresh the handoff artifacts and summarize residual non-blocking risks.
- Do not add new gameplay content unless a blocker forces a minimal fix.

## Acceptance

- TypeScript, Vitest, Vite build, asset audit, balance report, handoff report, visual smoke, and playable-flow gates are green.
- No release-blocking layout, overlap, or interaction regressions remain.
- The EA closeout note clearly separates final polish from post-EA backlog.

## Verification

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/audit-generated-assets.mjs
Result: passed. runtime references 228, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 104, source sheets 21, prompt queue targets 54.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/card-art-quality-report.mjs
Result: passed. cards 150, missing files 0, duplicate asset groups 35, replacement queue 150.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 34 files / 264 tests.

NAPI_RS_FORCE_WASI=1 /Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
Result: passed. Wave 24 Alpha Balance Report, 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
Result: passed; local handoff artifact refreshed.

NAPI_RS_FORCE_WASI=1 /Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
Result: passed, 37 Chromium tests.

NAPI_RS_FORCE_WASI=1 /Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.

git diff --check
Result: passed.
```

## Notes

- The build currently keeps `build.cssMinify: false` because `lightningcss` native loading is blocked under this Codex runtime; the application build still passes cleanly.
- The historical Wave 21 common card-face tests were updated to accept the six Wave 57 replacement assets while preserving the rest of the batch expectations.
- Balance watchlists still show all four heroes under high healing pressure, but the representative routes remain green.
