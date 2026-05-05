# Wave 23 Balance Report Watchlist Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the deterministic balance report's healing-pressure watchlist concise by aggregating pressure per character instead of repeating one entry per route.

**Architecture:** Keep the change inside the pure debug report system. `src/game/systems/debug/balanceReport.ts` should still derive all findings from `BalanceRouteEvidence`, but the watchlist line should group by character and show the highest pressure level, completed route count, and lowest HP band already present in the aggregate.

**Tech Stack:** TypeScript, Vitest, bundled Node v24.14.0, existing `scripts/balance-report.mjs`.

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
- `src/game/systems/debug/balanceReport.ts`

Current issue:

- `scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` emits a findings line like `Healing pressure watchlist: 赵云:high, 貂蝉:high, ...` with one item per route.
- With 3 seeds and 4 characters that creates 12 repeated watchlist entries.
- Wave 22 made the balance numbers more important to read, so the report should summarize at character granularity.

Desired output shape:

```text
Healing pressure watchlist: 赵云:high lowest HP 29/38/43 across 3 routes; 貂蝉:high lowest HP 26/37/37 across 3 routes; 蔡文姬:high lowest HP 10/21/23 across 3 routes; 诸葛亮:high lowest HP 8/10/14 across 3 routes.
```

## Task 1: Planning Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave23-balance-report-watchlist.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Record planning entry**

Add a top `Documentation.md` entry with docs read, current issue, plan path, and next step.

- [ ] **Step 2: Verify**

```bash
grep -n "Wave 23 Balance Report" Documentation.md docs/superpowers/plans/2026-05-05-wave23-balance-report-watchlist.md
git diff --check
```

- [ ] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave23-balance-report-watchlist.md
git commit -m "docs: plan wave23 balance report watchlist"
```

## Task 2: Failing Watchlist Regression

**Files:**

- Modify: `tests/playtest/run-simulator.test.ts`

- [ ] **Step 1: Add markdown assertion**

In `builds a deterministic multi-seed balance aggregate`, after `const report = createBalanceReport({ seeds: [9001, 9002, 9003] });`, add:

```ts
const markdown = formatBalanceReportMarkdown(report);
const watchlistLine = markdown
  .split("\n")
  .find((line) => line.startsWith("- Healing pressure watchlist:"));

expect(watchlistLine).toContain("诸葛亮:high lowest HP 8/10/14 across 3 routes");
expect(watchlistLine).toContain("赵云:high lowest HP 29/38/43 across 3 routes");
expect(watchlistLine?.match(/诸葛亮/g)).toHaveLength(1);
expect(watchlistLine?.match(/赵云/g)).toHaveLength(1);
```

- [ ] **Step 2: Verify red**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts --reporter=dot
```

Expected first result: fail because the current line repeats route-level entries and does not include lowest HP bands.

## Task 3: Aggregate Watchlist Finding

**Files:**

- Modify: `src/game/systems/debug/balanceReport.ts`

- [ ] **Step 1: Add helper**

Add a helper near `createFindings`:

```ts
function createHealingPressureWatchlist(routes: BalanceRouteEvidence[], aggregate: BalanceReportAggregate): string[] {
  return characterList
    .map((character) => {
      const characterRoutes = routes.filter((route) => route.characterId === character.id);
      if (characterRoutes.length === 0) {
        return undefined;
      }

      const highestPressure = characterRoutes.reduce<BalanceHealingPressure["rating"]>((highest, route) => {
        return PRESSURE_ORDER[route.healingPressure.rating] > PRESSURE_ORDER[highest] ? route.healingPressure.rating : highest;
      }, "low");

      if (highestPressure === "low") {
        return undefined;
      }

      const characterAggregate = aggregate.characters[character.id];
      const lowestBand = `${characterAggregate.minLowestPostCombatHp}/${characterAggregate.medianLowestPostCombatHp}/${characterAggregate.maxLowestPostCombatHp}`;
      return `${character.name}:${highestPressure} lowest HP ${lowestBand} across ${characterAggregate.totalRuns} routes`;
    })
    .filter((item): item is string => Boolean(item));
}
```

- [ ] **Step 2: Use helper in findings**

Replace the current route-level `stressedRoutes` block with:

```ts
const stressedCharacters = createHealingPressureWatchlist(routes, aggregate);
if (stressedCharacters.length > 0) {
  findings.push(`Healing pressure watchlist: ${stressedCharacters.join("; ")}.`);
}
```

- [ ] **Step 3: Verify focused test**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts --reporter=dot
```

Expected: pass.

## Task 4: Documentation And Gate

**Files:**

- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-05-wave23-balance-report-watchlist.md`

- [ ] **Step 1: Verify report output**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 | grep "Healing pressure watchlist"
```

Expected: one watchlist item per character, separated by semicolons, with Zhuge Liang `8/10/14`.

- [ ] **Step 2: Run broad gates**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

- [ ] **Step 3: Record final Documentation entry**

Record changed files, subagent/worktree status, verification commands/results, and residual risks.

- [ ] **Step 4: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave23-balance-report-watchlist.md src/game/systems/debug/balanceReport.ts tests/playtest/run-simulator.test.ts
git commit -m "test: summarize balance watchlist by character"
```

## Acceptance

- Multi-seed balance report still passes completion and safety assertions.
- The healing-pressure watchlist finding contains one entry per stressed character, not one entry per route.
- The watchlist includes lowest HP bands from the aggregate table.
- Full Vitest, TypeScript, Vite build, and `git diff --check` pass.
