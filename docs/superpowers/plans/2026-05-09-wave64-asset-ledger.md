# Wave 64 Asset Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the top low-resolution starter/common card art debt and refresh the asset ledger so the next post-EA queue is honest.

**Architecture:** Keep the runtime art binding model unchanged. Add versioned Wave64 PNG assets, switch only the affected card-art bindings, update deterministic data tests, then regenerate the audit/report artifacts.

**Tech Stack:** TypeScript content modules, Vitest data tests, Vite build, Playwright visual smoke, macOS `sips` for asset normalization.

---

## Scope

Wave64 targets the top quality-report dimension/crop findings:

- Starter: `zhao_strike`, `zhao_guard`, `zhao_longdan`, `diao_strike`, `diao_guard`, `diao_lingbo`, `cai_plain_strike`, `cai_pluck_string`, `cai_gong_tone`, `zhuge_fan_strike`, `zhuge_guard`.
- Common: `common_duanzhu`, `common_feishi`, `common_xieli`.

The wave does not expand gameplay content or change card math. Ink/mind/status vector placeholders remain explicitly deferred to the next art queue if they are not above the acceptance threshold after this pass.

## Tasks

### Task 1: Normalize Wave64 Card Assets

**Files:**
- Create: `public/assets/generated/cards/wave64-*.png`

- [x] Crop high-resolution character source sheets into unique 512x768 starter card faces.
- [x] Normalize the three common-card replacements to 512x768 PNGs.
- [x] Verify every new asset exists and has `512x768` dimensions.

### Task 2: Bind Runtime Card Art

**Files:**
- Modify: `src/game/content/visuals.ts`
- Modify: `src/game/content/cardArt/wave10CommonCardArt.ts`

- [x] Switch the eleven starter card bindings to `wave64-*-gpt2.png`.
- [x] Switch `common_duanzhu`, `common_feishi`, and `common_xieli` to `wave64-common-*-gpt2.png`.
- [x] Run content tests that assert the new paths exist.

### Task 3: Update Tests And Ledger

**Files:**
- Create: `tests/data/wave64-card-art.test.ts`
- Modify: `tests/data/wave21-gpt2-card-art.test.ts`
- Modify: `tests/data/wave10-common-card-art.test.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `public/assets/generated/asset-audit.json`
- Modify: `reports/card-art-quality-report.json`
- Modify: `reports/card-art-quality-report.md`

- [x] Add Wave64-specific assertions for all 14 replacements.
- [x] Update older Wave21 tests so "latest generated bitmap runtime assets" means Wave64 for the replaced cards.
- [x] Regenerate asset audit and card-art quality report.
- [x] Confirm the top queue no longer starts with low-resolution starter/common cards.

### Task 4: Documentation And Verification

**Files:**
- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-08-post-ea-autonomous-polish-roadmap.md`

- [x] Mark Wave64 complete in the post-EA roadmap after verification.
- [x] Record commands, results, residual queue, and generated-image provenance in `Documentation.md`.
- [x] Run `git diff --check`.
- [x] Run TypeScript, targeted Vitest, full Vitest if time allows, Vite build, and at least one visual smoke/card-art browser gate.
- [ ] Commit Wave64, cherry-pick to the main worktree, run main sanity checks, remove the worktree, and continue to Wave65.

## Result

Wave64 replaced 14 top quality-report dimension findings with 512x768 generated PNG card faces:

- Eleven starter card faces from the existing high-resolution Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang GPT2 source sheets.
- Three common card faces for `common_duanzhu`, `common_feishi`, and `common_xieli`; `common_feishi` used a new built-in `gpt-image-2` generation saved under `/Users/lushihao/.codex/generated_images/019e062b-68bb-7612-a1ce-93441b49eaa8/` and copied into the workspace as a versioned runtime asset.

The asset audit now recognizes both `gpt2-*` prefixes and `*-gpt2.png` suffixes as GPT2 runtime assets, so Wave57/Wave59/Wave64 generated card faces are counted consistently.

## Verification

```text
node scripts/audit-generated-assets.mjs
Result: passed. runtime references 228, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 122, source sheets 21, prompt queue targets 54.

node scripts/card-art-quality-report.mjs
Result: passed. cards 150, missing files 0, duplicate asset groups 31, replacement queue 148, dimension/crop signals 0.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/data/wave64-card-art.test.ts tests/data/wave21-gpt2-card-art.test.ts tests/data/wave10-common-card-art.test.ts tests/data/content.test.ts tests/data/card-art-quality-report.test.ts --reporter=dot
Result: passed, 5 files / 39 tests.

git diff --check
Result: passed.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 36 files / 267 tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.
```
