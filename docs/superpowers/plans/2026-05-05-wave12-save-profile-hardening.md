# Wave 12 Save/Profile Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden legacy save/profile migration at low risk after Wave 11 closed the non-art alpha backlog.

**Architecture:** Keep persistence repair in pure TypeScript systems. DOM and Phaser must not own save/profile rules. Browser surfaces should benefit from stricter normalized state, but this wave does not need renderer changes.

**Tech Stack:** TypeScript, Vitest, existing save/profile systems.

---

## Context And Constraints

Use the bundled Node runtime in every worktree:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/superpowers/plans/2026-05-04-wave7-demo-hardening.md`
- `docs/superpowers/plans/2026-05-05-wave11-alpha-backlog-closure.md`

Current Wave 11 baseline:

- Branch: `codex/wave11-alpha-backlog-closure`
- Vitest: 18 files / 187 tests
- TypeScript: passed
- Vite build: passed without the previous Phaser chunk-size warning
- Playwright desktop: 27 Chromium tests
- Asset audit: runtime references 159, missing 0, card fallback debt 0
- Balance report: 12/12 routes, timeout risks 0, unsafe damage spikes 0

Implementation rules:

- Desktop browser remains the target, but this wave is pure system hardening.
- Use TDD for each behavior change.
- Workers must not edit `Documentation.md`, `README.md`, or playtest docs; integration will record release notes.
- Do not modify renderer, Phaser scene, card content, enemy content, or art assets.
- Milestone 58 remains deferred as an optional GPT Image 2 bitmap card-art quality pass.

## Task 1: Save Snapshot Screen Boundary Hardening

**Files:**

- Modify: `src/game/systems/save/save.ts`
- Modify: `tests/save/save-system.test.ts`
- Do not modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Write the failing stale-combat migration test**

In `tests/save/save-system.test.ts`, add a test that stores a legacy raw envelope where `screen` is `"map"` but a valid `combat` payload is also present:

```ts
it("drops stale combat payloads when loading non-combat save screens", () => {
  const storage = new MemoryStorage();
  const run = createRun("diaochan", { mapSeed: 14 });
  travelToNode(run, "battle-1");
  const combat = createCombat({
    character: charactersById.diaochan,
    cards: cardList,
    enemies: [enemiesById.enemy_ink_bandit],
    playerHp: run.hp,
    rngSeed: 33,
    relicIds: [...run.relicIds],
    shuffleDeck: false
  });

  storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
    version: 1,
    savedAt: "2026-05-05T00:00:00.000Z",
    state: {
      screen: "map",
      run,
      combat,
      rewardCardIds: [],
      deckOpen: false,
      message: "旧存档带着战斗残影。"
    }
  }));

  const loaded = loadSavedGame(storage);
  expect(loaded?.screen).toBe("map");
  expect(loaded?.combat).toBeUndefined();
  expect(loaded?.message).toContain("战斗残影");
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/save/save-system.test.ts --reporter=dot
```

Expected: fails because `normalizeSaveSnapshot` currently preserves a normalized combat payload even when the saved screen is not `"combat"`.

- [ ] **Step 3: Implement minimal normalization fix**

In `normalizeSaveSnapshot`:

```ts
const normalizedCombat = record.combat === undefined ? undefined : normalizeCombatState(record.combat);
if (record.screen === "combat" && !normalizedCombat) {
  return undefined;
}
const combat = record.screen === "combat" ? normalizedCombat : undefined;
```

Keep the existing fail-closed behavior for `"combat"` screens missing valid combat. Do not change controller continue behavior.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/save/save-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: save tests pass, TypeScript passes, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add src/game/systems/save/save.ts tests/save/save-system.test.ts
git commit -m "fix: drop stale combat from non-combat saves"
```

## Task 2: Profile Counter Migration Repair

**Files:**

- Modify: `src/game/systems/profile/profile.ts`
- Modify: `tests/profile/profile-system.test.ts`
- Do not modify: `src/game/systems/save/save.ts`

- [ ] **Step 1: Write the failing legacy-counter test**

In `tests/profile/profile-system.test.ts`, add:

```ts
it("repairs legacy profile counters so total runs cannot undercount outcomes", () => {
  const storage = new MemoryStorage();

  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
    version: 1,
    profile: {
      stats: {
        totalRuns: 1,
        victories: 2,
        defeats: 3
      },
      characterStats: {
        zhaoyun: {
          totalRuns: 0,
          victories: 1,
          defeats: 2,
          bestChaptersCompleted: 2
        }
      }
    }
  }));

  const profile = loadProfile(storage);
  expect(profile?.stats).toEqual({ totalRuns: 5, victories: 2, defeats: 3 });
  expect(profile?.characterStats.zhaoyun.totalRuns).toBe(3);
  expect(profile?.characterStats.zhaoyun.victories).toBe(1);
  expect(profile?.characterStats.zhaoyun.defeats).toBe(2);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-system.test.ts --reporter=dot
```

Expected: fails because `normalizeStats` currently preserves an undercounted `totalRuns`.

- [ ] **Step 3: Implement minimal profile repair**

In `normalizeStats`, compute wins/losses first and return `totalRuns` as at least their sum:

```ts
const victories = normalizeCount(stats.victories);
const defeats = normalizeCount(stats.defeats);
return {
  totalRuns: Math.max(normalizeCount(stats.totalRuns), victories + defeats),
  victories,
  defeats
};
```

Keep existing duplicate filtering and unlocked ending normalization unchanged.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: profile tests pass, TypeScript passes, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add src/game/systems/profile/profile.ts tests/profile/profile-system.test.ts
git commit -m "fix: repair undercounted profile totals"
```

## Task 3: Integration, Docs, And Release Gate

**Files:**

- Modify: `Documentation.md`
- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`

- [ ] **Step 1: Merge worker branches**

From the Wave 12 integration branch:

```bash
git merge --no-edit codex/wave12-save-screen-boundary
git merge --no-edit codex/wave12-profile-counter-repair
```

Expected: no file conflicts because the workers own separate system files.

- [ ] **Step 2: Update docs**

Record Wave 12 with:

```text
Wave 12 scope: save screen-boundary hardening and profile counter migration repair.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Full release gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

Expected: all commands pass. Vitest count should increase by 2.

- [ ] **Step 4: Commit integration branch**

```bash
git add Documentation.md README.md docs/playtest/alpha-acceptance.md src/game/systems/save/save.ts src/game/systems/profile/profile.ts tests/save/save-system.test.ts tests/profile/profile-system.test.ts
git commit -m "fix: harden save profile migration"
```

## Follow-Up Round Seed

After Wave 12 is verified and committed, choose one:

- Return to Milestone 58 if bitmap generation is available and worth the time.
- Continue low-conflict alpha hardening with simulator report artifact export or compendium unlock-depth presentation.
