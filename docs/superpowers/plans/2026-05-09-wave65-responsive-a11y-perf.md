# Wave 65 Responsive A11y Perf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add candidate-gate coverage for responsive layout, keyboard/focus accessibility, reduced-motion behavior, and build/asset budgets before the final Wave66 closeout.

**Architecture:** Keep gameplay systems untouched. Add one focused Playwright spec for narrow-screen and keyboard paths, one lightweight Node budget script for build/assets, and minimal DOM/CSS affordance fixes where the tests expose missing state.

**Tech Stack:** TypeScript, Playwright, Vitest, Vite, Node filesystem/zlib APIs, CSS focus and responsive rules.

---

## Task 1: Performance Budget Script

**Files:**
- Create: `scripts/perf-budget.mjs`
- Create: `tests/playtest/perf-budget-script.test.ts`
- Modify: `package.json`

- [x] **Step 1: Write failing tests**

Add Vitest coverage that imports `evaluatePerfBudget` from `scripts/perf-budget.mjs`, creates temporary fixture `dist/assets` and `public/assets`, and asserts:

```ts
expect(evaluatePerfBudget({ projectRoot, distDir }).failures).toEqual([]);
expect(failingResult.failures.some((failure) => failure.id === "card-png-size")).toBe(true);
expect(failingResult.failures.some((failure) => failure.id === "asset-audit-missing")).toBe(true);
```

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/playtest/perf-budget-script.test.ts --reporter=dot
```

Expected: fail because `scripts/perf-budget.mjs` does not exist.

- [x] **Step 2: Implement budget evaluator and CLI**

Implement `scripts/perf-budget.mjs` with exported `evaluatePerfBudget(options)` and a CLI that supports `--build`, `--dist <path>`, and default project root. Budgets:

```js
phaser chunk raw <= 1.40 MiB
phaser chunk gzip <= 380 KiB
other JS chunk raw <= 450 KiB
other JS chunk gzip <= 110 KiB
CSS raw <= 180 KiB
public/assets <= 260 MiB
public/assets/generated/cards <= 45 MiB
public/assets/sprites <= 40 MiB
single card PNG <= 1.0 MiB
single non-source raster <= 4.5 MiB
asset audit missingCount === 0
asset audit cardFallbackDebtCount === 0
asset audit uniqueRuntimeFileCount <= 180
asset audit sourceSheetCount <= 25
```

Add package script:

```json
"perf:budget": "node scripts/perf-budget.mjs --build"
```

- [x] **Step 3: Verify script tests and real budget**

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/playtest/perf-budget-script.test.ts --reporter=dot
npm run perf:budget
```

Result: `node node_modules/vitest/vitest.mjs run tests/playtest/perf-budget-script.test.ts --reporter=dot` passed, 1 file / 3 tests. `node scripts/perf-budget.mjs --build` passed on the current Wave65 baseline.

## Task 2: Responsive And Keyboard Browser Gate

**Files:**
- Create: `tests/e2e/responsive-a11y.spec.ts`
- Modify: `src/app/appShell.ts`
- Modify: `src/styles/theme.css`

- [x] **Step 1: Write failing Playwright checks**

Add a Playwright spec with three tests:

1. `390x844` title and map smoke: no horizontal document overflow, title CTA visible, selected character/challenge exposes `aria-pressed="true"`, map node visible after keyboard-started run.
2. Keyboard path: `Tab` to character/challenge/start buttons, activate with `Enter`/`Space`, then `Tab` to the first available route node and activate it with `Enter`.
3. Reduced-motion combat: enable reduced motion in settings, enter combat, assert `#hud-host.prefers-reduced-motion`, card/intent/hand visible, screenshots stay below 5 MiB.

Expected first failure: selected character/challenge buttons lack `aria-pressed`; focus-visible style may also be missing.

- [x] **Step 2: Add minimal ARIA/focus affordances**

In `src/app/appShell.ts`, initialize character/challenge selected state with:

```ts
characterButton.setAttribute("aria-pressed", index === 0 ? "true" : "false");
challengeButton.setAttribute("aria-pressed", index === 0 ? "true" : "false");
```

In the title event handlers, keep `aria-pressed` synchronized when selection changes.

In `src/styles/theme.css`, add a single visible focus treatment for HUD controls:

```css
.hud-host button:focus-visible,
.hud-host input:focus-visible,
.hud-host select:focus-visible {
  outline: 3px solid rgba(238, 190, 91, 0.96);
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(47, 124, 110, 0.24);
}
```

- [x] **Step 3: Verify Playwright gate**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/responsive-a11y.spec.ts --project=chromium
```

Result: passed, 3 Chromium tests.

## Task 3: Screenshot Helper Guardrails

**Files:**
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [x] **Step 1: Add screenshot upper bound**

For both `capturePlaytestScreenshot` helpers, keep the existing lower bound and add:

```ts
expect(screenshot.byteLength).toBeLessThan(5 * 1024 * 1024);
```

- [x] **Step 2: Verify existing visual smoke**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium --grep "title character select|desktop combat smoke"
```

Result: passed, 2 Chromium tests.

## Task 4: Documentation And Integration

**Files:**
- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-08-post-ea-autonomous-polish-roadmap.md`

- [x] Record Wave65 changes and verification.
- [x] Mark Wave65 complete after verification and state Wave66 is the only remaining wave.
- [x] Run `git diff --check`, TypeScript, targeted Vitest, `node scripts/perf-budget.mjs --build`, responsive/a11y Playwright, visual smoke, full Vitest, and Vite build.
- [ ] Commit, cherry-pick to the main worktree, run main sanity, remove the worktree, then begin Wave66.

## Verification Result

```text
node node_modules/vitest/vitest.mjs run tests/playtest/perf-budget-script.test.ts --reporter=dot
Result: passed, 1 file / 3 tests. The temp build-dir cleanup test was red first, then green after the try/finally fix.

node scripts/perf-budget.mjs --build
Result: passed. Phaser 1.15 MiB raw / 311.3 KiB gzip; largest other JS 310.7 KiB raw / 79.2 KiB gzip; largest CSS 120.0 KiB; public/assets 222.95 MiB; generated/cards 36.56 MiB; sprites 31.23 MiB; largest card PNG 806.3 KiB; largest non-source raster 3.43 MiB; asset audit missing 0, card fallback debt 0, runtime files 151, source sheets 21.

node node_modules/vitest/vitest.mjs run tests/playtest/perf-budget-script.test.ts tests/app-shell.test.ts --reporter=dot
Result: passed, 2 files / 7 tests.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/responsive-a11y.spec.ts --project=chromium
Result: passed, 3 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium --grep "title character select|desktop combat smoke"
Result: passed, 2 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 37 files / 270 tests.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

git diff --check
Result: passed.
```
