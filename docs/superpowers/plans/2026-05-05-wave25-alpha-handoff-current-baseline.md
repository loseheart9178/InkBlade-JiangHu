# Wave 25 Alpha Handoff Current Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the generated alpha handoff report so external playtest handoff notes carry the current Wave 23/24 balance evidence instead of stopping at Wave 20/22.

**Architecture:** Keep the handoff script a deterministic markdown renderer. Update the static acceptance baseline text in `scripts/alpha-handoff-report.mjs`, pin the new handoff evidence in `tests/playtest/alpha-handoff-report-script.test.ts`, and refresh the alpha acceptance table row that describes what the handoff artifact includes.

**Tech Stack:** Node script, TypeScript/Vitest test harness, bundled Node v24.14.0.

---

## Context And Constraints

Use the bundled Node runtime for commands:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs/files read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/playtest/alpha-acceptance.md`
- `scripts/alpha-handoff-report.mjs`
- `tests/playtest/alpha-handoff-report-script.test.ts`
- `scripts/balance-report.mjs`
- `src/game/systems/debug/balanceReport.ts`

Current issue:

- `scripts/alpha-handoff-report.mjs` still describes the current baseline through Wave 20/21/22 only.
- It omits Wave 23's character-level healing-pressure watchlist readability and Wave 24's `# Wave 24 Alpha Balance Report` / `wave24-alpha-balance-v1` metadata.
- `tests/playtest/alpha-handoff-report-script.test.ts` only asserts the older Wave 20/21/22 baseline snippets, so handoff drift can persist.
- `docs/playtest/alpha-acceptance.md` still says the alpha handoff artifact includes the Wave 20 baseline.

Desired handoff output snippets:

```text
- Wave 20 full desktop gate remains the latest full Chromium e2e gate...
- Wave 23 balance report readability: healing pressure is summarized once per stressed character with aggregate lowest HP bands.
- Wave 24 balance report label: markdown starts `# Wave 24 Alpha Balance Report` with report id `wave24-alpha-balance-v1`.
- Current multi-seed balance artifact: Wave 24 report id, 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, Zhuge Liang lowest HP band 8/10/14.
```

## Task 1: Planning Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave25-alpha-handoff-current-baseline.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Record planning entry**

Add a top `Documentation.md` entry with docs read, stale handoff evidence, plan path, and next step.

- [ ] **Step 2: Verify**

```bash
grep -n "Wave 25 Alpha Handoff Current Baseline" Documentation.md docs/superpowers/plans/2026-05-05-wave25-alpha-handoff-current-baseline.md
git diff --check
```

- [ ] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave25-alpha-handoff-current-baseline.md
git commit -m "docs: plan wave25 alpha handoff baseline"
```

## Task 2: Failing Handoff Baseline Regression

**Files:**

- Modify: `tests/playtest/alpha-handoff-report-script.test.ts`

- [ ] **Step 1: Add current baseline assertions**

In `writes the same markdown report to stdout and an explicit artifact path`, keep stdout/artifact parity checks and add assertions:

```ts
expect(stdout).toContain("Wave 20 full desktop gate remains the latest full Chromium e2e gate");
expect(stdout).toContain("Wave 23 balance report readability");
expect(stdout).toContain("healing pressure is summarized once per stressed character");
expect(stdout).toContain("Wave 24 balance report label");
expect(stdout).toContain("# Wave 24 Alpha Balance Report");
expect(stdout).toContain("wave24-alpha-balance-v1");
expect(stdout).toContain("Current multi-seed balance artifact: Wave 24 report id, 12/12 routes, 84 combat samples");
expect(stdout).not.toContain("current Wave 20 baseline");
```

- [ ] **Step 2: Verify red**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts --reporter=dot
```

Expected first result: fail because the handoff script still omits Wave 23/24 current baseline text.

## Task 3: Handoff Script Refresh

**Files:**

- Modify: `scripts/alpha-handoff-report.mjs`

- [ ] **Step 1: Refresh acceptance baseline bullets**

Replace the existing Wave 20/21/22 and multi-seed bullets under `## Current Acceptance Baseline` with:

```md
- Wave 20 full desktop gate remains the latest full Chromium e2e gate: Vitest 23 files / 198 tests, TypeScript, Vite build, Playwright 27 Chromium desktop tests, asset audit 159 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0, and balance artifact stdout match.
- Wave 21 art gate: Vitest 24 files / 200 tests, TypeScript, Vite build, Playwright visual smoke 3 Chromium tests, asset audit 159 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0 / GPT2 runtime assets 72 / source sheets 21.
- Wave 22 balance stability: multi-seed balance remains 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, and Zhuge Liang lowest HP band improved to 8/10/14.
- Wave 23 balance report readability: healing pressure is summarized once per stressed character with aggregate lowest HP bands, making Zhuge Liang `8/10/14` visible in the watchlist instead of repeated route labels.
- Wave 24 balance report label: markdown starts `# Wave 24 Alpha Balance Report` with report id `wave24-alpha-balance-v1`.
- Wave 15-19 handoff kit: refreshed desktop playtest checklist, external bug intake guide, alpha handoff report, npm report scripts, Node 24 runtime docs, and handoff preflight.
- Current multi-seed balance artifact: Wave 24 report id, 12/12 routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, Zhuge Liang lowest HP band 8/10/14.
```

- [ ] **Step 2: Verify focused test**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts --reporter=dot
```

Expected: pass.

## Task 4: Acceptance Docs And Gate

**Files:**

- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-05-wave25-alpha-handoff-current-baseline.md`

- [ ] **Step 1: Refresh alpha acceptance handoff artifact row**

In the verification table, replace:

```md
| Alpha handoff report artifact | `node scripts/alpha-handoff-report.mjs --out ... --balance-report ...` | Passed: artifact matched stdout and includes the Wave 20 baseline |
```

with:

```md
| Alpha handoff report artifact | `node scripts/alpha-handoff-report.mjs --out ... --balance-report ...` | Passed: artifact matched stdout and includes the Wave 24 report label/id plus Wave 23 watchlist readability baseline |
```

- [ ] **Step 2: Verify generated handoff output**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/alpha-handoff-report.mjs --out D:/tmp/inkblade-wave25-alpha-handoff.md --balance-report reports/balance-report.md > /mnt/d/tmp/inkblade-wave25-alpha-handoff-stdout.md
test -s /mnt/d/tmp/inkblade-wave25-alpha-handoff.md
cmp /mnt/d/tmp/inkblade-wave25-alpha-handoff.md /mnt/d/tmp/inkblade-wave25-alpha-handoff-stdout.md
grep -n "Wave 24 balance report label\\|wave24-alpha-balance-v1\\|Wave 23 balance report readability" /mnt/d/tmp/inkblade-wave25-alpha-handoff.md
```

- [ ] **Step 3: Run broad gates**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts tests/playtest/package-report-scripts.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

- [ ] **Step 4: Record final Documentation entry**

Record changed files, subagent/worktree status, verification commands/results, and residual risks.

- [ ] **Step 5: Commit**

```bash
git add Documentation.md docs/playtest/alpha-acceptance.md docs/superpowers/plans/2026-05-05-wave25-alpha-handoff-current-baseline.md scripts/alpha-handoff-report.mjs tests/playtest/alpha-handoff-report-script.test.ts
git commit -m "test: refresh alpha handoff baseline"
```

## Acceptance

- Generated alpha handoff report includes Wave 23 watchlist readability evidence.
- Generated alpha handoff report includes Wave 24 report title and id.
- Alpha acceptance verification table no longer says the handoff artifact only includes the Wave 20 baseline.
- Handoff artifact stdout parity remains intact.
- Focused handoff tests, full Vitest, TypeScript, Vite build, and `git diff --check` pass.
