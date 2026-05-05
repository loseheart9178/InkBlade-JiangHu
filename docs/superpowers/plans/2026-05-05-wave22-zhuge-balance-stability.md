# Wave 22 Zhuge Liang Balance Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or an equivalent PM -> Explorer -> Builder -> Tester -> Reporter flow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Zhuge Liang's deterministic multi-seed route from a near-death watchlist band of `3/3/7` lowest post-combat HP to a safer alpha band while keeping him a lower-HP, high-strategy character.

**Architecture:** Keep all gameplay changes in data-driven card/relic/simulation files. Do not move balance logic into Phaser or DOM controllers. Prefer conservative defensive/control tuning on Zhuge formation and scry cards over raw max-HP increases, because the character setting defines him as a low-HP strategist rather than a tank.

**Tech Stack:** TypeScript data content, pure run simulator, Vitest balance regressions, bundled Node v24.14.0, Vite build, focused Playwright desktop route smoke.

---

## Context And Constraints

Use the bundled Node runtime for verification commands:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/playtest/alpha-acceptance.md`

Current baseline from `scripts/balance-report.mjs --markdown --seeds 9001,9002,9003`:

- Routes completed: 12/12.
- Combat samples: 84.
- Timeout risks: 0.
- Unsafe damage spikes: 0.
- Zhuge Liang lowest post-combat HP band: `3/3/7`.
- Zhuge Liang route turns: 91 / 87 / 83 total turns for seeds 9001 / 9002 / 9003.
- Zhuge Liang total damage taken: 245 / 288 / 240.

Implementation rules:

- Keep Zhuge Liang's max HP at the setting-document value of 66 unless data-only card tuning cannot solve the issue.
- Do not weaken enemies globally to fix a single character's route pressure.
- Do not adjust simulator thresholds to hide pressure.
- Do not reduce completion evidence for Zhao Yun, Diao Chan, or Cai Wenji.

## Task 1: Planning Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave22-zhuge-balance-stability.md`
- Modify: `Documentation.md`

- [x] **Step 1: Record planning entry**

Add a top `Documentation.md` entry with the docs read, baseline balance numbers, branch, and next step.

- [x] **Step 2: Verify**

```bash
grep -n "Wave 22 Zhuge Liang" Documentation.md docs/superpowers/plans/2026-05-05-wave22-zhuge-balance-stability.md
git diff --check
```

- [x] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave22-zhuge-balance-stability.md
git commit -m "docs: plan wave22 zhuge balance stability"
```

## Task 2: Balance Regression Test

**Files:**

- Modify: `tests/playtest/run-simulator.test.ts`

- [x] **Step 1: Add failing regression**

In the multi-seed aggregate test, assert:

```ts
const zhuge = report.aggregate.characters.zhugeliang;
expect(zhuge.completed).toBe(3);
expect(zhuge.minLowestPostCombatHp).toBeGreaterThanOrEqual(8);
expect(zhuge.medianLowestPostCombatHp).toBeGreaterThanOrEqual(8);
expect(zhuge.timeoutRiskCount).toBe(0);
expect(zhuge.unsafeSpikeCount).toBe(0);
```

Keep the existing all-route completion checks.

- [x] **Step 2: Verify red**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts --reporter=dot
```

Expected first result: fail because current Zhuge min lowest post-combat HP is 3.

## Task 3: Conservative Zhuge Card Tuning

**Files:**

- Modify: `src/game/content/cards.ts`

- [x] **Step 1: Improve defensive control, not raw HP**

Try the smallest card-data tuning that clears the new test:

- Raise `zhuge_guard` from 5/8 block to 6/9 block if needed.
- Raise `zhuge_small_eight_array` immediate block and/or end-turn block by 1 if needed.
- Raise `zhuge_empty_city`, `zhuge_stone_array`, or `zhuge_straw_boats` block by 1-2 if needed.
- Avoid buffing direct damage unless timeouts or extreme turn counts require it.

Update descriptions and upgrade descriptions to match effects.

- [x] **Step 2: Keep content integrity tests green**

If content tests validate descriptions/effects, update only the expected data or text needed by the new values.

## Task 4: Verification And Balance Evidence

**Files:**

- Modify: `Documentation.md`
- Modify if acceptance numbers change: `docs/playtest/alpha-acceptance.md`, `docs/playtest/desktop-playtest-checklist.md`, `README.md`, `scripts/alpha-handoff-report.mjs`, and related tests.

- [x] **Step 1: Run focused simulator test**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts --reporter=dot
```

- [x] **Step 2: Run multi-seed balance artifact check**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out D:/tmp/inkblade-wave22-balance-report.md > /mnt/d/tmp/inkblade-wave22-balance-stdout.md
test -s /mnt/d/tmp/inkblade-wave22-balance-report.md
cmp /mnt/d/tmp/inkblade-wave22-balance-report.md /mnt/d/tmp/inkblade-wave22-balance-stdout.md
```

- [x] **Step 3: Run broad gates**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
git diff --check
```

- [x] **Step 4: Document results and commit**

Record the final Zhuge HP band, any tradeoffs, verification results, subagent/worktree status, and next step in `Documentation.md`, then commit:

```bash
git add .
git commit -m "fix: stabilize zhuge balance route"
```

## Acceptance

- Multi-seed routes still complete `12/12`.
- Zhuge Liang completed routes remain `3/3`.
- Zhuge Liang `minLowestPostCombatHp >= 8` and `medianLowestPostCombatHp >= 8`.
- Timeout risks remain 0.
- Unsafe damage spikes remain 0.
- TypeScript, full Vitest, Vite build, and focused desktop final-boss Playwright route pass.
