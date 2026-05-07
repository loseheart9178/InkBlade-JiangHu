# Wave 40 Challenge Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add desktop-visible challenge profiles so EA players can start repeatable run variants without debug tools.

**Architecture:** Challenge profile definitions live in content data, while pure system helpers apply start and combat modifiers. Run state owns the selected `challengeId`; combat consumes numeric modifiers; DOM title UI exposes selection and passes it to the controller. Phaser remains a renderer and receives no challenge rules.

**Tech Stack:** TypeScript, Vitest, Playwright, Vite, DOM/CSS.

---

## Files

- Create `src/game/content/challenges.ts`: profile definitions and ids.
- Create `src/game/systems/challenges/challenges.ts`: resolver and modifier helpers.
- Modify `src/game/systems/run/types.ts`: add `ChallengeProfileId` to `CreateRunOptions` and `RunState`.
- Modify `src/game/systems/run/run.ts`: apply start modifiers and normalize older runs.
- Modify `src/game/systems/combat/types.ts`: add optional enemy challenge pressure fields and `CreateCombatInput.challengeModifiers`.
- Modify `src/game/systems/combat/combat.ts`: apply enemy HP and attack modifiers.
- Modify `src/game/systems/debug/runSimulator.ts`: pass challenge profile through simulation.
- Modify `src/game/systems/debug/balanceReport.ts`: include active challenge profile in report evidence and markdown.
- Modify `src/app/appShell.ts`: render title challenge choices.
- Modify `src/app/gameApp.ts`: track selected challenge id and pass it to runtime.
- Modify `src/app/inkbladeController.ts`: accept selected challenge id, pass combat modifiers, and show challenge in run status.
- Modify `src/styles/theme.css`: desktop title challenge selector styling.
- Create `tests/challenges/challenge-system.test.ts`.
- Modify `tests/run/run-system.test.ts`.
- Modify `tests/playtest/run-simulator.test.ts`.
- Modify `tests/e2e/playable-flow.spec.ts`.
- Modify `Documentation.md`.

## Acceptance Criteria

- [ ] At least four profiles exist: `standard`, `scarcity`, `inkRising`, and `ironRain`.
- [ ] Default run behavior remains baseline-compatible and records `challengeId: "standard"`.
- [ ] `scarcity` deterministically changes start gold, max HP, and effective map seed.
- [ ] Combat enemy max HP and attack pressure can be modified by challenge profile.
- [ ] Simulator and balance report accept a `challengeId`.
- [ ] Balance report markdown states the active challenge.
- [ ] Title screen exposes polished challenge choices with `data-testid="challenge-<id>"`.
- [ ] Browser test can select `墨潮压境`, start a run, and see that challenge in run status.

## Task 1: Challenge Data And Run Contract

**Files:**

- Create: `src/game/content/challenges.ts`
- Create: `src/game/systems/challenges/challenges.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/run/run.ts`
- Create: `tests/challenges/challenge-system.test.ts`
- Modify: `tests/run/run-system.test.ts`

- [ ] **Step 1: Write failing challenge data tests**

Create `tests/challenges/challenge-system.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { challengeProfiles, challengesById, DEFAULT_CHALLENGE_PROFILE_ID } from "../../src/game/content/challenges";
import { applyChallengeToRunStart, getChallengeCombatModifiers, resolveChallengeProfile } from "../../src/game/systems/challenges/challenges";
import { charactersById } from "../../src/game/content/characters";

describe("challenge profiles", () => {
  it("defines the EA challenge profile set", () => {
    expect(DEFAULT_CHALLENGE_PROFILE_ID).toBe("standard");
    expect(challengeProfiles.map((profile) => profile.id)).toEqual(["standard", "scarcity", "inkRising", "ironRain"]);
    expect(challengesById.inkRising.name).toBe("墨潮压境");
    expect(challengeProfiles.every((profile) => profile.summary.length >= 6)).toBe(true);
  });

  it("resolves unknown ids to the standard profile", () => {
    expect(resolveChallengeProfile("missing").id).toBe("standard");
    expect(resolveChallengeProfile(undefined).id).toBe("standard");
  });

  it("applies deterministic start modifiers", () => {
    const start = applyChallengeToRunStart(charactersById.zhaoyun, resolveChallengeProfile("scarcity"), 100);
    expect(start.challengeId).toBe("scarcity");
    expect(start.mapSeed).toBe(107);
    expect(start.maxHp).toBe(charactersById.zhaoyun.maxHp - 4);
    expect(start.hp).toBe(start.maxHp);
    expect(start.gold).toBe(55);
  });

  it("creates combat modifiers from profiles", () => {
    expect(getChallengeCombatModifiers("standard")).toEqual({ enemyMaxHpMultiplier: 1, enemyAttackBonus: 0 });
    expect(getChallengeCombatModifiers("inkRising").enemyMaxHpMultiplier).toBeGreaterThan(1);
    expect(getChallengeCombatModifiers("ironRain").enemyAttackBonus).toBe(1);
  });
});
```

- [ ] **Step 2: Write failing run contract tests**

In `tests/run/run-system.test.ts`, add:

```ts
it("records the selected challenge profile and applies start modifiers", () => {
  const run = createRun("zhaoyun", { mapSeed: 100, challengeId: "scarcity" });

  expect(run.challengeId).toBe("scarcity");
  expect(run.mapSeed).toBe(107);
  expect(run.gold).toBe(55);
  expect(run.maxHp).toBe(68);
  expect(run.hp).toBe(68);
});
```

- [ ] **Step 3: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/run/run-system.test.ts --reporter=dot
```

Expected: FAIL because challenge modules and `RunState.challengeId` do not exist yet.

- [ ] **Step 4: Add challenge content data**

Create `src/game/content/challenges.ts`:

```ts
export type ChallengeProfileId = "standard" | "scarcity" | "inkRising" | "ironRain";

export interface ChallengeProfileDefinition {
  id: ChallengeProfileId;
  name: string;
  summary: string;
  detail: string;
  difficulty: "baseline" | "hard";
  mapSeedOffset: number;
  startingGold: number;
  maxHpDelta: number;
  enemyMaxHpMultiplier: number;
  enemyAttackBonus: number;
}

export const DEFAULT_CHALLENGE_PROFILE_ID: ChallengeProfileId = "standard";

export const challengeProfiles: ChallengeProfileDefinition[] = [
  {
    id: "standard",
    name: "行云常路",
    summary: "标准行旅",
    detail: "保留当前 EA 基准数值，适合首次体验。",
    difficulty: "baseline",
    mapSeedOffset: 0,
    startingGold: 99,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 0
  },
  {
    id: "scarcity",
    name: "雨夜穷途",
    summary: "资源紧缺",
    detail: "初始铜钱减少，最大生命略低，路线种子偏移。",
    difficulty: "hard",
    mapSeedOffset: 7,
    startingGold: 55,
    maxHpDelta: -4,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 0
  },
  {
    id: "inkRising",
    name: "墨潮压境",
    summary: "敌血微涨",
    detail: "敌人生命小幅提高，路线种子偏移，考验构筑输出。",
    difficulty: "hard",
    mapSeedOffset: 13,
    startingGold: 85,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1.08,
    enemyAttackBonus: 0
  },
  {
    id: "ironRain",
    name: "铁雨试锋",
    summary: "攻势更烈",
    detail: "敌方攻击每段额外提高一点，路线种子偏移。",
    difficulty: "hard",
    mapSeedOffset: 21,
    startingGold: 80,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 1
  }
];

export const challengesById: Record<ChallengeProfileId, ChallengeProfileDefinition> = Object.fromEntries(
  challengeProfiles.map((profile) => [profile.id, profile])
) as Record<ChallengeProfileId, ChallengeProfileDefinition>;
```

- [ ] **Step 5: Add system helpers**

Create `src/game/systems/challenges/challenges.ts`:

```ts
import { challengesById, DEFAULT_CHALLENGE_PROFILE_ID, type ChallengeProfileDefinition, type ChallengeProfileId } from "../../content/challenges";
import type { CharacterDefinition } from "../combat/types";

export interface ChallengeRunStart {
  challengeId: ChallengeProfileId;
  mapSeed: number;
  hp: number;
  maxHp: number;
  gold: number;
}

export interface ChallengeCombatModifiers {
  enemyMaxHpMultiplier: number;
  enemyAttackBonus: number;
}

export function resolveChallengeProfile(id: unknown): ChallengeProfileDefinition {
  return typeof id === "string" && id in challengesById
    ? challengesById[id as ChallengeProfileId]
    : challengesById[DEFAULT_CHALLENGE_PROFILE_ID];
}

export function applyChallengeToRunStart(character: CharacterDefinition, profile: ChallengeProfileDefinition, baseMapSeed: number): ChallengeRunStart {
  const maxHp = Math.max(1, character.maxHp + profile.maxHpDelta);
  return {
    challengeId: profile.id,
    mapSeed: baseMapSeed + profile.mapSeedOffset,
    hp: maxHp,
    maxHp,
    gold: profile.startingGold
  };
}

export function getChallengeCombatModifiers(id: unknown): ChallengeCombatModifiers {
  const profile = resolveChallengeProfile(id);
  return {
    enemyMaxHpMultiplier: profile.enemyMaxHpMultiplier,
    enemyAttackBonus: profile.enemyAttackBonus
  };
}
```

- [ ] **Step 6: Wire run state**

In `src/game/systems/run/types.ts`, import `ChallengeProfileId` and update:

```ts
import type { ChallengeProfileId } from "../../content/challenges";
```

Add to `RunState`:

```ts
challengeId: ChallengeProfileId;
```

Update `CreateRunOptions`:

```ts
export interface CreateRunOptions {
  mapSeed?: number;
  challengeId?: ChallengeProfileId;
}
```

In `src/game/systems/run/run.ts`, import:

```ts
import { applyChallengeToRunStart, resolveChallengeProfile } from "../challenges/challenges";
```

Inside `createRun`, after `const mapSeed = options.mapSeed ?? 0;`, add:

```ts
const challengeStart = applyChallengeToRunStart(character, resolveChallengeProfile(options.challengeId), mapSeed);
```

Set these fields in returned state:

```ts
challengeId: challengeStart.challengeId,
mapSeed: challengeStart.mapSeed,
hp: challengeStart.hp,
maxHp: challengeStart.maxHp,
gold: challengeStart.gold,
mapNodes: createChapterOneMap(characterId, challengeStart.mapSeed),
```

- [ ] **Step 7: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/run/run-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/game/content/challenges.ts src/game/systems/challenges/challenges.ts src/game/systems/run/types.ts src/game/systems/run/run.ts tests/challenges/challenge-system.test.ts tests/run/run-system.test.ts
git commit -m "feat: add challenge profile run contract"
```

Expected: focused tests pass and TypeScript passes.

## Task 2: Combat Pressure And Balance Report

**Files:**

- Modify: `src/game/systems/combat/types.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/game/systems/debug/runSimulator.ts`
- Modify: `src/game/systems/debug/balanceReport.ts`
- Modify: `tests/challenges/challenge-system.test.ts`
- Modify: `tests/playtest/run-simulator.test.ts`

- [ ] **Step 1: Write failing combat/report tests**

Add to `tests/challenges/challenge-system.test.ts`:

```ts
import { cardList } from "../../src/game/content/cards";
import { enemiesById } from "../../src/game/content/enemies";
import { createCombat, endPlayerTurn } from "../../src/game/systems/combat/combat";

it("applies challenge pressure to combat enemies", () => {
  const combat = createCombat({
    character: charactersById.zhaoyun,
    cards: cardList,
    enemies: [enemiesById.enemy_ink_bandit],
    rngSeed: 1,
    shuffleDeck: false,
    challengeModifiers: { enemyMaxHpMultiplier: 1.08, enemyAttackBonus: 1 }
  });

  expect(combat.enemies[0].maxHp).toBe(Math.ceil(enemiesById.enemy_ink_bandit.maxHp * 1.08));
  const before = combat.player.hp;
  endPlayerTurn(combat);
  expect(before - combat.player.hp).toBeGreaterThanOrEqual(1);
});
```

In `tests/playtest/run-simulator.test.ts`, add:

```ts
it("includes challenge profile context in balance reports", () => {
  const report = createBalanceReport({ routeSeed: 9001, challengeId: "inkRising" });
  const markdown = formatBalanceReportMarkdown(report);

  expect(report.challenge?.id).toBe("inkRising");
  expect(markdown).toContain("- Challenge: 墨潮压境 (inkRising)");
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
```

Expected: FAIL because `challengeModifiers`, `challengeId`, and `report.challenge` are not wired.

- [ ] **Step 3: Add combat modifiers**

In `src/game/systems/combat/types.ts`, add:

```ts
export interface ChallengeCombatModifiers {
  enemyMaxHpMultiplier: number;
  enemyAttackBonus: number;
}
```

Add to `EnemyState`:

```ts
challengeAttackBonus?: number;
```

Add to `CreateCombatInput`:

```ts
challengeModifiers?: ChallengeCombatModifiers;
```

In `src/game/systems/combat/combat.ts`, change enemy creation to:

```ts
const enemies = input.enemies.map((enemy, index) => createEnemyState(enemy, index, input.challengeModifiers));
```

Update `createEnemyState`:

```ts
function createEnemyState(definition: EnemyDefinition, index: number, challengeModifiers?: ChallengeCombatModifiers): EnemyState {
  const maxHp = Math.max(1, Math.ceil(definition.maxHp * (challengeModifiers?.enemyMaxHpMultiplier ?? 1)));
  return {
    id: `enemy-${index + 1}`,
    definitionId: definition.id,
    name: definition.name,
    hp: maxHp,
    maxHp,
    block: 0,
    statuses: {},
    intents: definition.intents.length > 0 ? definition.intents : [{ type: "idle" }],
    phaseIntents: definition.phaseIntents,
    intentIndex: 0,
    currentIntent: definition.intents[0] ?? { type: "idle" },
    challengeAttackBonus: challengeModifiers?.enemyAttackBonus
  };
}
```

Update `getModifiedEnemyDamage` return:

```ts
return Math.max(0, Math.floor(baseDamage * charmMultiplier * weakMultiplier) + (enemy.challengeAttackBonus ?? 0));
```

- [ ] **Step 4: Wire simulator and balance report**

In `src/game/systems/debug/runSimulator.ts`, import `ChallengeProfileId` and `getChallengeCombatModifiers`, add `challengeId?: ChallengeProfileId` to `BattlePlanOptions` or `FullRouteOptions`, pass `challengeId` to `createRun`, and pass `challengeModifiers: getChallengeCombatModifiers(run.challengeId)` to `createCombat`.

In `src/game/systems/debug/balanceReport.ts`, import `resolveChallengeProfile` and `ChallengeProfileId`, add `challengeId?: ChallengeProfileId` to `BalanceReportOptions`, add:

```ts
challenge?: {
  id: ChallengeProfileId;
  name: string;
};
```

to `BalanceReport`, set it from the resolved profile, and add to markdown near the seed:

```ts
`- Challenge: ${report.challenge.name} (${report.challenge.id})`,
```

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/game/systems/combat/types.ts src/game/systems/combat/combat.ts src/game/systems/debug/runSimulator.ts src/game/systems/debug/balanceReport.ts tests/challenges/challenge-system.test.ts tests/playtest/run-simulator.test.ts
git commit -m "feat: add challenge combat pressure reports"
```

Expected: focused tests pass and TypeScript passes.

## Task 3: Desktop Title Challenge Selector

**Files:**

- Modify: `src/app/appShell.ts`
- Modify: `src/app/gameApp.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/app-settings.test.ts` only if controller API typing requires it.

- [ ] **Step 1: Write failing browser test**

In `tests/e2e/playable-flow.spec.ts`, add near the title tests:

```ts
test("challenge profile can be selected before starting a run", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("challenge-inkRising").click();
  await expect(page.getByTestId("challenge-inkRising")).toHaveClass(/is-selected/);
  await page.getByTestId("start-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-challenge")).toContainText("墨潮压境");
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "challenge profile"
```

Expected: FAIL because the title has no challenge buttons.

- [ ] **Step 3: Render challenge choices**

In `src/app/appShell.ts`, import `challengeProfiles` and `ChallengeProfileId`, add `challengeButtons` to `AppShell`, create a `.challenge-select` after character select, and add buttons:

```ts
const challengeSelect = document.createElement("div");
challengeSelect.className = "challenge-select";
challengeSelect.dataset.testid = "challenge-select";

for (const [index, challenge] of challengeProfiles.entries()) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.challengeId = challenge.id;
  button.dataset.testid = `challenge-${challenge.id}`;
  button.className = index === 0 ? "challenge-choice is-selected" : "challenge-choice";
  button.innerHTML = `<span>${challenge.name}</span><small>${challenge.summary}</small>`;
  button.setAttribute("aria-label", `${challenge.name}，${challenge.summary}`);
  challengeSelect.append(button);
}
```

Append `challengeSelect` before `titleActions`.

- [ ] **Step 4: Pass selected challenge to runtime**

In `src/app/gameApp.ts`, import `ChallengeProfileId`, track:

```ts
let selectedChallengeId: ChallengeProfileId = "standard";
```

Update `GameAppRuntime.startRun` and the wrapper to accept:

```ts
startRun(characterId: string, challengeId?: ChallengeProfileId): unknown;
```

Add a click listener for `[data-challenge-id]` that mirrors character selection and sets `selectedChallengeId`.

Call:

```ts
const activeGame = activeRuntime.startRun(selectedCharacterId, selectedChallengeId);
```

In `src/app/inkbladeController.ts`, import `ChallengeProfileId`, `resolveChallengeProfile`, and `getChallengeCombatModifiers`; update controller `startRun(characterId: string, challengeId?: ChallengeProfileId)` to call:

```ts
state.run = createRun(characterId, { mapSeed: generateMapSeed(), challengeId });
```

In `startCombatForNode`, pass:

```ts
challengeModifiers: getChallengeCombatModifiers(run.challengeId),
```

In `createRunStatus`, include a stat element:

```ts
const challenge = resolveChallengeProfile(run.challengeId);
const challengeBadge = document.createElement("span");
challengeBadge.dataset.testid = "run-challenge";
challengeBadge.textContent = `试炼 ${challenge.name}`;
```

- [ ] **Step 5: Add CSS**

In `src/styles/theme.css`, add:

```css
.challenge-select {
  display: grid;
  grid-template-columns: repeat(4, minmax(118px, 1fr));
  gap: 8px;
}

.title-screen .challenge-choice {
  display: grid;
  min-width: 0;
  min-height: 58px;
  gap: 2px;
  padding: 8px 10px;
  color: #2c2924;
  text-align: left;
  background: rgba(255, 252, 239, 0.9);
  border-color: rgba(47, 124, 110, 0.32);
  box-shadow: none;
}

.title-screen .challenge-choice small {
  color: rgba(44, 41, 36, 0.72);
  font-size: 12px;
  line-height: 1.2;
}

.title-screen .challenge-choice.is-selected {
  border-color: rgba(183, 53, 42, 0.72);
  box-shadow: inset 0 0 0 1px rgba(183, 53, 42, 0.22);
}
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "challenge profile"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/app/appShell.ts src/app/gameApp.ts src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts tests/app-settings.test.ts
git commit -m "feat: expose challenge profiles on title"
```

Expected: browser challenge test, focused app tests, and TypeScript pass.

## Task 4: Documentation And Final Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/run/run-system.test.ts tests/playtest/run-simulator.test.ts tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "challenge|settings|boots"
```

- [ ] **Step 2: Update Documentation.md**

Add a top status entry with:

- docs read
- worker commits integrated
- RED/GREEN notes
- verification commands/results
- known gaps
- next milestone

- [ ] **Step 3: Commit documentation**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave40 challenge profiles"
```

## Plan Self-Review

- Spec coverage: Tasks cover profile data, run persistence, deterministic start modifiers, combat pressure, balance report context, title UI, browser validation, and docs. Steam/storefront/release packaging remains excluded.
- Deferred-work scan: This plan avoids vague future-work markers and provides exact file paths, command lines, and concrete code snippets.
- Type consistency: `ChallengeProfileId`, `challengeId`, `ChallengeCombatModifiers`, `enemyMaxHpMultiplier`, and `enemyAttackBonus` are named consistently across tasks.
