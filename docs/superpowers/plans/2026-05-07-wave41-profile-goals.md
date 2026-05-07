# Wave 41 Profile Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local profile goals so EA players see clear replay objectives after runs.

**Architecture:** Goal definitions live in `src/game/content/goals.ts`. Pure profile helpers calculate progress and persist completed goal ids. The app controller displays newly completed goals on run summary and a read-only profile goals shell from the title/debug profile surface. No renderer or platform achievement service owns goal rules.

**Tech Stack:** TypeScript, Vitest, Playwright, DOM/CSS.

---

## Files

- Create `src/game/content/goals.ts`: local goal definitions.
- Create `src/game/systems/profile/goals.ts`: progress evaluation and completion helpers.
- Modify `src/game/systems/profile/profile.ts`: persist `completedGoalIds` and normalize legacy profiles.
- Modify `src/game/systems/save/save.ts` only if save/profile typing needs import adjustment.
- Modify `src/app/inkbladeController.ts`: show profile goals and run-summary newly completed goals.
- Modify `src/styles/theme.css`: compact goal list and run-summary callout styles.
- Create `tests/profile/profile-goals.test.ts`.
- Modify `tests/profile/profile-system.test.ts`.
- Modify `tests/e2e/playable-flow.spec.ts`.
- Modify `Documentation.md`.

## Acceptance Criteria

- [ ] At least 12 `ProfileGoalDefinition` entries exist.
- [ ] `createProfile()` includes `completedGoalIds: []`.
- [ ] `normalizeProfile()` preserves valid legacy goal ids and drops invalid entries.
- [ ] `evaluateProfileGoals(profile)` returns deterministic progress records.
- [ ] `recordCompletedGoals(profile)` returns newly completed ids once.
- [ ] Run summary displays newly completed goals after a completed/debug ending run.
- [ ] Title debug profile shell shows profile goal progress.
- [ ] No Steam/platform achievement integration is introduced.

## Task 1: Goal Data And Profile System

**Files:**

- Create: `src/game/content/goals.ts`
- Create: `src/game/systems/profile/goals.ts`
- Modify: `src/game/systems/profile/profile.ts`
- Create: `tests/profile/profile-goals.test.ts`
- Modify: `tests/profile/profile-system.test.ts`

- [ ] **Step 1: Write failing goal tests**

Create `tests/profile/profile-goals.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { profileGoals } from "../../src/game/content/goals";
import { createProfile, recordCompletedRun } from "../../src/game/systems/profile/profile";
import { evaluateProfileGoals, recordCompletedGoals } from "../../src/game/systems/profile/goals";

describe("profile goals", () => {
  it("defines a replayable local goal set", () => {
    expect(profileGoals.length).toBeGreaterThanOrEqual(12);
    expect(profileGoals.map((goal) => goal.id)).toEqual(expect.arrayContaining([
      "goal_first_run",
      "goal_first_victory",
      "goal_zhaoyun_mastery",
      "goal_ink_rising_clear",
      "goal_lore_collector"
    ]));
  });

  it("evaluates profile progress without mutating the profile", () => {
    const profile = recordCompletedRun(createProfile(), {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror", "fragment_nameless_historian"]
    });
    const records = evaluateProfileGoals(profile);

    expect(records.find((record) => record.goal.id === "goal_first_victory")?.completed).toBe(true);
    expect(records.find((record) => record.goal.id === "goal_lore_collector")?.progress.current).toBe(2);
    expect(profile.completedGoalIds).toEqual([]);
  });

  it("records newly completed goals only once", () => {
    const profile = recordCompletedRun(createProfile(), {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror"]
    });

    const first = recordCompletedGoals(profile);
    const second = recordCompletedGoals(first.profile);

    expect(first.newlyCompletedGoalIds).toContain("goal_first_victory");
    expect(second.newlyCompletedGoalIds).toEqual([]);
  });
});
```

In `tests/profile/profile-system.test.ts`, extend `createProfile()` and malformed normalization assertions with:

```ts
expect(profile.completedGoalIds).toEqual([]);
```

and for raw profile normalization:

```ts
completedGoalIds: ["goal_first_run", "bad_goal", "goal_first_run"]
```

expect:

```ts
expect(profile?.completedGoalIds).toEqual(["goal_first_run"]);
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-goals.test.ts tests/profile/profile-system.test.ts --reporter=dot
```

Expected: FAIL because goal data/helpers and `completedGoalIds` do not exist.

- [ ] **Step 3: Add goal definitions**

Create `src/game/content/goals.ts`:

```ts
export type ProfileGoalId =
  | "goal_first_run"
  | "goal_first_victory"
  | "goal_zhaoyun_mastery"
  | "goal_diaochan_mastery"
  | "goal_caiwenji_mastery"
  | "goal_zhugeliang_mastery"
  | "goal_all_heroes_started"
  | "goal_three_endings"
  | "goal_lore_collector"
  | "goal_epilogue_collector"
  | "goal_ink_rising_clear"
  | "goal_iron_rain_clear";

export type ProfileGoalMetric =
  | "totalRuns"
  | "victories"
  | "characterVictory"
  | "charactersStarted"
  | "endingsUnlocked"
  | "fragmentsUnlocked"
  | "epiloguesUnlocked"
  | "challengeVictory";

export interface ProfileGoalDefinition {
  id: ProfileGoalId;
  title: string;
  summary: string;
  metric: ProfileGoalMetric;
  target: number;
  characterId?: string;
  challengeId?: string;
}

export const profileGoals: ProfileGoalDefinition[] = [
  { id: "goal_first_run", title: "初入江湖", summary: "完成任意一局行旅。", metric: "totalRuns", target: 1 },
  { id: "goal_first_victory", title: "一卷定尘", summary: "赢得任意结局。", metric: "victories", target: 1 },
  { id: "goal_zhaoyun_mastery", title: "白龙归阵", summary: "用赵云完成一次胜利。", metric: "characterVictory", target: 1, characterId: "zhaoyun" },
  { id: "goal_diaochan_mastery", title: "闭月照影", summary: "用貂蝉完成一次胜利。", metric: "characterVictory", target: 1, characterId: "diaochan" },
  { id: "goal_caiwenji_mastery", title: "清音续命", summary: "用蔡文姬完成一次胜利。", metric: "characterVictory", target: 1, characterId: "caiwenji" },
  { id: "goal_zhugeliang_mastery", title: "卧龙观星", summary: "用诸葛亮完成一次胜利。", metric: "characterVictory", target: 1, characterId: "zhugeliang" },
  { id: "goal_all_heroes_started", title: "四路开卷", summary: "四名角色都至少开始过一局。", metric: "charactersStarted", target: 4 },
  { id: "goal_three_endings", title: "三问史书", summary: "解锁三个世界结局。", metric: "endingsUnlocked", target: 3 },
  { id: "goal_lore_collector", title: "墨录拾遗", summary: "收录十条墨录残页。", metric: "fragmentsUnlocked", target: 10 },
  { id: "goal_epilogue_collector", title: "众生归页", summary: "解锁四个角色结局。", metric: "epiloguesUnlocked", target: 4 },
  { id: "goal_ink_rising_clear", title: "踏破墨潮", summary: "在墨潮压境试炼中取胜。", metric: "challengeVictory", target: 1, challengeId: "inkRising" },
  { id: "goal_iron_rain_clear", title: "铁雨无声", summary: "在铁雨试锋试炼中取胜。", metric: "challengeVictory", target: 1, challengeId: "ironRain" }
];

export const profileGoalsById = Object.fromEntries(profileGoals.map((goal) => [goal.id, goal])) as Record<ProfileGoalId, ProfileGoalDefinition>;
```

- [ ] **Step 4: Extend profile type and normalization**

In `src/game/systems/profile/profile.ts`, import `profileGoalsById` and `ProfileGoalId`, add to `PlayerProfile`:

```ts
completedGoalIds: ProfileGoalId[];
challengeVictories?: string[];
```

Add to `RecordRunResultInput`:

```ts
challengeId?: string;
```

Initialize in `createProfile()`:

```ts
completedGoalIds: [],
challengeVictories: []
```

When recording a victorious run with a challenge id:

```ts
challengeVictories: result.victory && result.challengeId
  ? addUnique(normalized.challengeVictories ?? [], result.challengeId)
  : [...(normalized.challengeVictories ?? [])]
```

Normalize:

```ts
completedGoalIds: uniqueStrings(profile.completedGoalIds).filter((goalId): goalId is ProfileGoalId => goalId in profileGoalsById),
challengeVictories: uniqueStrings(profile.challengeVictories)
```

- [ ] **Step 5: Add goal progress helpers**

Create `src/game/systems/profile/goals.ts`:

```ts
import { profileGoals, type ProfileGoalDefinition, type ProfileGoalId } from "../../content/goals";
import { normalizeProfile, type PlayerProfile } from "./profile";

export interface ProfileGoalProgress {
  current: number;
  target: number;
}

export interface ProfileGoalRecord {
  goal: ProfileGoalDefinition;
  progress: ProfileGoalProgress;
  completed: boolean;
  recorded: boolean;
}

export interface RecordCompletedGoalsResult {
  profile: PlayerProfile;
  newlyCompletedGoalIds: ProfileGoalId[];
}

export function evaluateProfileGoals(profile: PlayerProfile): ProfileGoalRecord[] {
  const normalized = normalizeProfile(profile);
  const completed = new Set(normalized.completedGoalIds);
  return profileGoals.map((goal) => {
    const current = getGoalCurrentValue(normalized, goal);
    return {
      goal,
      progress: { current, target: goal.target },
      completed: current >= goal.target,
      recorded: completed.has(goal.id)
    };
  });
}

export function recordCompletedGoals(profile: PlayerProfile): RecordCompletedGoalsResult {
  const normalized = normalizeProfile(profile);
  const recorded = new Set(normalized.completedGoalIds);
  const newlyCompletedGoalIds = evaluateProfileGoals(normalized)
    .filter((record) => record.completed && !recorded.has(record.goal.id))
    .map((record) => record.goal.id);

  return {
    profile: {
      ...normalized,
      completedGoalIds: [...normalized.completedGoalIds, ...newlyCompletedGoalIds]
    },
    newlyCompletedGoalIds
  };
}

function getGoalCurrentValue(profile: PlayerProfile, goal: ProfileGoalDefinition): number {
  if (goal.metric === "totalRuns") {
    return profile.stats.totalRuns;
  }
  if (goal.metric === "victories") {
    return profile.stats.victories;
  }
  if (goal.metric === "characterVictory" && goal.characterId) {
    return profile.characterStats[goal.characterId]?.victories ?? 0;
  }
  if (goal.metric === "charactersStarted") {
    return Object.values(profile.characterStats).filter((stats) => stats.totalRuns > 0).length;
  }
  if (goal.metric === "endingsUnlocked") {
    return profile.unlockedEndings.length;
  }
  if (goal.metric === "fragmentsUnlocked") {
    return profile.unlockedFragments.length;
  }
  if (goal.metric === "epiloguesUnlocked") {
    return profile.unlockedCharacterEpilogues.length;
  }
  if (goal.metric === "challengeVictory" && goal.challengeId) {
    return profile.challengeVictories?.includes(goal.challengeId) ? 1 : 0;
  }
  return 0;
}
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-goals.test.ts tests/profile/profile-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/game/content/goals.ts src/game/systems/profile/goals.ts src/game/systems/profile/profile.ts tests/profile/profile-goals.test.ts tests/profile/profile-system.test.ts
git commit -m "feat: add local profile goals"
```

## Task 2: App Surfaces For Goals

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/app-settings.test.ts` only if controller construction tests need fixture updates.

- [ ] **Step 1: Write failing browser test**

In `tests/e2e/playable-flow.spec.ts`, add:

```ts
test("profile goals surface opens from the title debug profile shell", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("profile-goals-list")).toBeVisible();
  await expect(page.getByTestId("profile-goal-item").first()).toContainText(/初入江湖|一卷定尘/);
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "profile goals surface"
```

Expected: FAIL because no profile goals list is rendered.

- [ ] **Step 3: Record completed goals after run completion**

In `src/app/inkbladeController.ts`, import:

```ts
import { evaluateProfileGoals, recordCompletedGoals } from "../game/systems/profile/goals";
```

Add to `CompletedRunSummaryView`:

```ts
newlyCompletedGoalIds?: string[];
```

After `recordCompletedRun(...)` in `completeRunWithEnding`, call:

```ts
const goalResult = recordCompletedGoals(state.profile);
state.profile = goalResult.profile;
```

Store `newlyCompletedGoalIds` on `completedRunSummary`.

- [ ] **Step 4: Render goal surfaces**

Add helper functions in `src/app/inkbladeController.ts`:

```ts
function createProfileGoalsList(profile: PlayerProfile, highlightIds: readonly string[] = []): HTMLElement {
  const list = document.createElement("div");
  list.className = "profile-goals-list";
  list.dataset.testid = "profile-goals-list";
  const highlights = new Set(highlightIds);
  for (const record of evaluateProfileGoals(profile)) {
    const item = document.createElement("article");
    item.className = record.completed ? "profile-goal-item is-complete" : "profile-goal-item";
    item.dataset.testid = "profile-goal-item";
    if (highlights.has(record.goal.id)) {
      item.classList.add("is-new");
    }
    item.innerHTML = `
      <strong>${record.goal.title}</strong>
      <span>${record.goal.summary}</span>
      <small>${Math.min(record.progress.current, record.progress.target)} / ${record.progress.target}</small>
    `;
    list.append(item);
  }
  return list;
}
```

Append this list in `renderRunSummary` and `showRunSummaryShell`.

- [ ] **Step 5: Add CSS**

In `src/styles/theme.css`, add compact styles:

```css
.profile-goals-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 10px;
}

.profile-goal-item {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid rgba(44, 41, 36, 0.18);
  border-radius: 8px;
  background: rgba(255, 252, 239, 0.78);
}

.profile-goal-item.is-complete {
  border-color: rgba(47, 124, 110, 0.42);
}

.profile-goal-item.is-new {
  border-color: rgba(183, 53, 42, 0.64);
  box-shadow: inset 0 0 0 1px rgba(183, 53, 42, 0.18);
}
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "profile goals surface"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-goals.test.ts tests/profile/profile-system.test.ts tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts tests/app-settings.test.ts
git commit -m "feat: show profile goals in app"
```

## Task 3: Documentation And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-goals.test.ts tests/profile/profile-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "profile goals|summary|compendium"
```

- [ ] **Step 2: Update Documentation.md**

Record docs read, worker commits, RED/GREEN notes, verification output, known gaps, and next milestone.

- [ ] **Step 3: Commit docs**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave41 profile goals"
```

## Plan Self-Review

- Spec coverage: Tasks cover goal data, profile persistence, progress evaluation, app surfaces, tests, documentation, and local-only scope.
- Deferred-work scan: No task depends on platform services, mobile layout, or future art generation.
- Type consistency: `ProfileGoalId`, `completedGoalIds`, `challengeVictories`, and `newlyCompletedGoalIds` are named consistently across tasks.
