# Wave 66 Post-EA Candidate Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-run the release-style closeout after Waves 59-65 and leave the repo in a documented EA candidate state with zero remaining planned waves.

**Architecture:** Do not expand gameplay scope. Treat Wave66 as a candidate gate: run deterministic audits, tests, build, Playwright, balance, handoff, and budget commands; then update only closeout documentation with the exact evidence and residual risks.

**Tech Stack:** TypeScript, Vitest, Vite, Playwright Chromium, Node report scripts, generated asset audit, performance budget, Markdown docs.

---

## Task 1: Candidate Gate Baseline

**Files:**
- Modify: `docs/superpowers/plans/2026-05-09-wave66-post-ea-candidate-gate.md`

- [x] **Step 1: Confirm branch and workspace**

Run:

```bash
git status --short --branch
git worktree list
```

Expected: branch is `codex/wave66-post-ea-candidate-gate`; only local `node_modules` symlink may appear as untracked during verification and must be removed before commit.

- [x] **Step 2: Run generated asset and card-art audits**

Run:

```bash
node scripts/audit-generated-assets.mjs
node scripts/card-art-quality-report.mjs
```

Expected: asset audit reports missing 0 and card fallback debt 0; card-art quality report completes without missing files.

- [x] **Step 3: Run performance budget**

Run:

```bash
node scripts/perf-budget.mjs --build
```

Expected: PASS with Phaser, other JS, CSS, public assets, generated cards, sprites, single card PNG, raster size, and asset-audit counts under Wave65 budgets.

## Task 2: Full Test And Browser Gate

**Files:**
- Modify: `docs/superpowers/plans/2026-05-09-wave66-post-ea-candidate-gate.md`

- [x] **Step 1: Run static and unit gates**

Run:

```bash
node node_modules/typescript/bin/tsc --noEmit
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
```

Expected: TypeScript exits 0; Vitest exits 0 with all files and tests passing.

- [x] **Step 2: Run production build**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
```

Expected: Vite exits 0 and emits the same chunk family protected by the Wave65 budget.

- [x] **Step 3: Run full Chromium e2e**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
```

Expected: all Chromium e2e tests pass, including playable-flow, visual-smoke, and responsive-a11y.

## Task 3: Balance And Handoff Artifacts

**Files:**
- Generate local artifact: `reports/balance-report.md` (ignored)
- Generate local artifact: `reports/alpha-handoff.md` (ignored)
- Modify: `docs/superpowers/plans/2026-05-09-wave66-post-ea-candidate-gate.md`

- [x] **Step 1: Run handoff preflight**

Run:

```bash
node scripts/handoff-preflight.mjs
```

Expected: runtime, package scripts, and handoff docs report PASS.

- [x] **Step 2: Generate balance report**

Run:

```bash
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
```

Expected: report exits 0, writes `reports/balance-report.md`, and reports 12/12 completed routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0.

- [x] **Step 3: Generate alpha handoff report**

Run:

```bash
node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
```

Expected: report exits 0 and writes `reports/alpha-handoff.md` using the generated balance artifact.

## Task 4: Documentation Closeout

**Files:**
- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-08-post-ea-autonomous-polish-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-09-wave66-post-ea-candidate-gate.md`

- [x] **Step 1: Update project status log**

Add a top `Documentation.md` entry for Wave66 with:

```text
Wave 66 Post-EA Candidate Gate completed in `.worktrees/wave66-post-ea-candidate-gate` on branch `codex/wave66-post-ea-candidate-gate`.
```

Include the exact command list and results from Tasks 1-3, plus note any local-only ignored artifacts under `reports/`.

- [x] **Step 2: Mark roadmap closed**

In `docs/superpowers/plans/2026-05-08-post-ea-autonomous-polish-roadmap.md`, update:

```text
After Wave 66, no planned post-EA waves remain.
```

Mark Wave66 status complete and state the candidate is ready for external EA review if every gate is green.

- [x] **Step 3: Run final whitespace check**

Run:

```bash
git diff --check
```

Expected: exits 0.

- [ ] **Step 4: Commit and integrate**

Before commit:

```bash
rm node_modules
git status --short
```

Then commit in the Wave66 worktree, cherry-pick to the main worktree, rerun main sanity, remove the worktree, and delete `codex/wave66-post-ea-candidate-gate`.

## Verification Result

```text
git status --short --branch && git worktree list
Result: branch codex/wave66-post-ea-candidate-gate in .worktrees/wave66-post-ea-candidate-gate; main worktree remained on codex/wave47-relic-fit-system. Local node_modules symlink was present only for verification and will be removed before commit.

node scripts/audit-generated-assets.mjs
Result: passed. runtime references 228, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 122, source sheets 21, prompt queue targets 54.

node scripts/card-art-quality-report.mjs
Result: passed. cards 150, missing files 0, duplicate asset groups 31, replacement queue 148.

node scripts/perf-budget.mjs --build
Result: passed. Phaser 1.15 MiB raw / 311.3 KiB gzip; largest other JS 310.7 KiB raw / 79.2 KiB gzip; largest CSS 120.0 KiB; public/assets 222.95 MiB; generated/cards 36.56 MiB; sprites 31.23 MiB; largest card PNG 806.3 KiB; largest non-source raster 3.43 MiB; asset audit missing 0, card fallback debt 0, runtime files 151, source sheets 21.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 37 files / 270 tests.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
Result: passed, 40 Chromium tests.

node scripts/handoff-preflight.mjs
Result: passed as checklist. Node v24.14.0 PASS, report scripts PASS, handoff documents PASS.

node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
Result: passed. 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, highest healing pressure high.

node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
Result: passed. Local ignored artifact generated with Wave66 candidate baseline.
```

Notes:

- `reports/balance-report.md` and `reports/alpha-handoff.md` were generated as ignored local handoff artifacts.
- `tests/e2e/visual-smoke.spec.ts` four-character combat screenshot timeout was raised from 80s to 140s because the full Chromium suite can run that heavy screenshot path for about 1.5 minutes under three-worker load.
- `scripts/alpha-handoff-report.mjs`, `README.md`, and `docs/playtest/alpha-acceptance.md` were refreshed from stale Wave20/WSL-era wording to the Wave66 macOS/Node candidate baseline.
