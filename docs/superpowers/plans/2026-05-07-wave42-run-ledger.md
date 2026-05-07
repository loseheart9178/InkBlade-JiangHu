# Wave 42 Run Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local recent-run ledger and best-run highlight to make the EA profile surface feel like a useful playtest record.

**Architecture:** Profile persistence owns bounded run records. A pure `runLedger` helper derives recent and best-run view records. The app controller records history at victory/defeat boundaries and renders compact DOM ledger cards. No platform service or renderer owns ledger rules.

**Tech Stack:** TypeScript, Vitest, Playwright, DOM/CSS.

---

## Files

- Modify `src/game/systems/profile/profile.ts`: persist and normalize `runRecords`.
- Create `src/game/systems/profile/runLedger.ts`: pure ledger derivation helpers.
- Create `tests/profile/run-ledger.test.ts`.
- Modify `tests/profile/profile-system.test.ts`.
- Modify `src/app/inkbladeController.ts`: record and render run ledger.
- Modify `src/styles/theme.css`: compact ledger styles.
- Modify `tests/e2e/playable-flow.spec.ts`.
- Modify `Documentation.md`.

## Acceptance Criteria

- [ ] `createProfile()` initializes `runRecords: []`.
- [ ] `normalizeProfile()` keeps valid recent run records, drops malformed records, and caps to 12.
- [ ] `recordProfileRunRecord(profile, input)` inserts newest first and caps old entries.
- [ ] Victory records include ending, character epilogue, fragments, challenge id, and newly completed goal ids.
- [ ] Defeat records include character, challenge id, and chapters reached.
- [ ] `evaluateRunLedger(profile)` returns recent records and a best-run highlight without mutating input.
- [ ] Title/debug profile shell displays `data-testid="profile-run-ledger"`.
- [ ] Completed-run summary displays the latest record and best-run highlight.
- [ ] No Steam/platform achievement, online account, analytics, or release packaging code is introduced.

## Task 1: Profile Run Ledger System

**Files:**

- Modify: `src/game/systems/profile/profile.ts`
- Create: `src/game/systems/profile/runLedger.ts`
- Create: `tests/profile/run-ledger.test.ts`
- Modify: `tests/profile/profile-system.test.ts`

- [ ] **Step 1: Write failing ledger tests**

Create `tests/profile/run-ledger.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createProfile, recordProfileRunRecord } from "../../src/game/systems/profile/profile";
import { evaluateRunLedger } from "../../src/game/systems/profile/runLedger";

describe("profile run ledger", () => {
  it("records recent runs newest first and caps history", () => {
    let profile = createProfile();
    for (let index = 0; index < 14; index += 1) {
      profile = recordProfileRunRecord(profile, {
        characterId: index % 2 === 0 ? "zhaoyun" : "diaochan",
        victory: index % 3 === 0,
        challengeId: index % 2 === 0 ? "inkRising" : "standard",
        endingId: index % 3 === 0 ? "ending_clear_seal" : undefined,
        chaptersCompleted: ["luoshui"].slice(0, 1),
        endedAtIso: `2026-05-07T00:${String(index).padStart(2, "0")}:00.000Z`
      });
    }

    expect(profile.runRecords).toHaveLength(12);
    expect(profile.runRecords[0].endedAtIso).toBe("2026-05-07T00:13:00.000Z");
    expect(profile.runRecords.at(-1)?.endedAtIso).toBe("2026-05-07T00:02:00.000Z");
  });

  it("keeps victory details and newly completed goals", () => {
    const profile = recordProfileRunRecord(createProfile(), {
      characterId: "zhaoyun",
      victory: true,
      challengeId: "inkRising",
      endingId: "ending_clear_seal",
      characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror"],
      newlyCompletedGoalIds: ["goal_first_victory", "goal_ink_rising_clear"],
      endedAtIso: "2026-05-07T01:00:00.000Z"
    });

    expect(profile.runRecords[0]).toMatchObject({
      characterId: "zhaoyun",
      victory: true,
      challengeId: "inkRising",
      endingId: "ending_clear_seal",
      characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror"],
      newlyCompletedGoalIds: ["goal_first_victory", "goal_ink_rising_clear"]
    });
  });

  it("derives the best run without mutating profile data", () => {
    let profile = createProfile();
    profile = recordProfileRunRecord(profile, {
      characterId: "diaochan",
      victory: false,
      challengeId: "standard",
      chaptersCompleted: ["luoshui", "bamboo"],
      endedAtIso: "2026-05-07T01:00:00.000Z"
    });
    profile = recordProfileRunRecord(profile, {
      characterId: "zhaoyun",
      victory: true,
      challengeId: "inkRising",
      endingId: "ending_clear_seal",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      endedAtIso: "2026-05-07T02:00:00.000Z"
    });
    const original = structuredClone(profile);

    const ledger = evaluateRunLedger(profile);

    expect(ledger.recentRecords).toHaveLength(2);
    expect(ledger.bestRun?.characterId).toBe("zhaoyun");
    expect(ledger.bestRun?.chaptersCompleted.length).toBe(4);
    expect(profile).toEqual(original);
  });
});
```

In `tests/profile/profile-system.test.ts`, extend default and malformed profile assertions:

```ts
expect(profile.runRecords).toEqual([]);
```

and add a malformed stored record case that proves invalid entries are dropped while a valid legacy record survives.

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/run-ledger.test.ts tests/profile/profile-system.test.ts --reporter=dot
```

Expected: FAIL because `runRecords`, `recordProfileRunRecord`, and `evaluateRunLedger` do not exist.

- [ ] **Step 3: Extend profile persistence**

In `src/game/systems/profile/profile.ts`, add:

```ts
export const PROFILE_RUN_RECORD_LIMIT = 12;

export interface ProfileRunRecord {
  id: string;
  characterId: string;
  victory: boolean;
  challengeId?: string;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted: string[];
  unlockedFragments: string[];
  newlyCompletedGoalIds: ProfileGoalId[];
  endedAtIso: string;
}

export interface RecordProfileRunRecordInput {
  characterId: string;
  victory: boolean;
  challengeId?: string;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted?: readonly string[];
  unlockedFragments?: readonly string[];
  newlyCompletedGoalIds?: readonly ProfileGoalId[];
  endedAtIso?: string;
}
```

Add `runRecords: ProfileRunRecord[]` to `PlayerProfile`, initialize it in `createProfile()`, normalize it in `normalizeProfile()`, and add:

```ts
export function recordProfileRunRecord(profile: PlayerProfile, input: RecordProfileRunRecordInput): PlayerProfile {
  const normalized = normalizeProfile(profile);
  const record = normalizeRunRecord({
    id: createRunRecordId(normalized, input),
    characterId: input.characterId,
    victory: input.victory,
    challengeId: input.challengeId,
    endingId: input.endingId,
    characterEpilogueId: input.characterEpilogueId,
    chaptersCompleted: [...(input.chaptersCompleted ?? [])],
    unlockedFragments: [...(input.unlockedFragments ?? [])],
    newlyCompletedGoalIds: [...(input.newlyCompletedGoalIds ?? [])],
    endedAtIso: input.endedAtIso ?? new Date().toISOString()
  });

  if (!record) {
    return normalized;
  }

  return {
    ...normalized,
    runRecords: [record, ...normalized.runRecords].slice(0, PROFILE_RUN_RECORD_LIMIT)
  };
}
```

Use helper functions to keep only non-empty strings, valid goal ids, valid booleans, and ISO-like string timestamps. Invalid run records should be dropped.

- [ ] **Step 4: Add pure ledger helper**

Create `src/game/systems/profile/runLedger.ts`:

```ts
import { normalizeProfile, type PlayerProfile, type ProfileRunRecord } from "./profile";

export interface ProfileRunLedger {
  recentRecords: ProfileRunRecord[];
  bestRun?: ProfileRunRecord;
}

export function evaluateRunLedger(profile: PlayerProfile): ProfileRunLedger {
  const normalized = normalizeProfile(profile);
  const recentRecords = [...normalized.runRecords];
  const bestRun = recentRecords
    .slice()
    .sort((left, right) => compareRunRecords(right, left))[0];

  return {
    recentRecords,
    bestRun
  };
}

function compareRunRecords(left: ProfileRunRecord, right: ProfileRunRecord): number {
  if (left.victory !== right.victory) {
    return left.victory ? 1 : -1;
  }
  const chapterDelta = left.chaptersCompleted.length - right.chaptersCompleted.length;
  if (chapterDelta !== 0) {
    return chapterDelta;
  }
  return left.endedAtIso.localeCompare(right.endedAtIso);
}
```

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/run-ledger.test.ts tests/profile/profile-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/game/systems/profile/profile.ts src/game/systems/profile/runLedger.ts tests/profile/run-ledger.test.ts tests/profile/profile-system.test.ts
git commit -m "feat: add local run ledger"
```

## Task 2: App Ledger Surfaces

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser tests**

In `tests/e2e/playable-flow.spec.ts`, add:

```ts
test("run ledger appears in the title debug profile shell", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("debug-ending-summary").click();
  await expect(page.getByTestId("profile-run-ledger")).toBeVisible();
  await expect(page.getByTestId("profile-run-record").first()).toContainText(/赵云|胜利|清悟|封印/);

  await page.reload();
  await page.getByTestId("debug-run-summary").click();
  await expect(page.getByTestId("profile-run-ledger")).toBeVisible();
  await expect(page.getByTestId("profile-best-run")).toContainText(/赵云|4/);
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "run ledger"
```

Expected: FAIL because no run ledger DOM exists.

- [ ] **Step 3: Record ledger at victory and defeat**

In `src/app/inkbladeController.ts`, import:

```ts
import { recordProfileRunRecord } from "../game/systems/profile/profile";
import { evaluateRunLedger } from "../game/systems/profile/runLedger";
```

Use existing imports carefully; `recordProfileRunRecord` should be added to the existing profile import.

After `recordCompletedGoals()` in `completeRunWithEnding()`, call `recordProfileRunRecord()` with completion data and `goalResult.newlyCompletedGoalIds`, then save the resulting profile and render the latest record in summary.

In `recordDefeatIfNeeded()`, call `recordProfileRunRecord()` after `recordRunResult()` with `victory: false`, `run.characterId`, `run.challengeId`, and `run.completedChapterIds`.

- [ ] **Step 4: Render ledger cards**

Add `createProfileRunLedger(profile)` in `src/app/inkbladeController.ts`:

```ts
function createProfileRunLedger(profile: PlayerProfile): HTMLElement {
  const ledger = evaluateRunLedger(profile);
  const section = document.createElement("section");
  section.className = "profile-run-ledger";
  section.dataset.testid = "profile-run-ledger";

  const best = document.createElement("div");
  best.className = "profile-best-run";
  best.dataset.testid = "profile-best-run";
  best.textContent = ledger.bestRun
    ? `最佳行旅 ${formatRunRecordLine(ledger.bestRun)}`
    : "最佳行旅 尚未记录";
  section.append(best);

  const list = document.createElement("div");
  list.className = "profile-run-records";
  for (const record of ledger.recentRecords.slice(0, 6)) {
    const item = document.createElement("article");
    item.className = record.victory ? "profile-run-record is-victory" : "profile-run-record";
    item.dataset.testid = "profile-run-record";
    item.textContent = formatRunRecordLine(record);
    list.append(item);
  }
  section.append(list);
  return section;
}
```

Use local formatting helpers that resolve character names, challenge names, ending titles, and chapter count. Avoid `innerHTML`.

Append this ledger in `showRunSummaryShell()` and `renderRunSummary()` near the profile goals list.

- [ ] **Step 5: Add CSS**

In `src/styles/theme.css`, add compact styles:

```css
.profile-run-ledger {
  display: grid;
  width: min(720px, 100%);
  gap: 10px;
}

.profile-best-run,
.profile-run-record {
  padding: 9px 11px;
  border: 1px solid rgba(44, 41, 36, 0.2);
  border-radius: 7px;
  background: rgba(255, 252, 239, 0.72);
}

.profile-run-records {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 8px;
}

.profile-run-record.is-victory {
  border-color: rgba(47, 124, 110, 0.38);
}
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "run ledger|profile goals|challenge goal"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/run-ledger.test.ts tests/profile/profile-system.test.ts tests/profile/profile-goals.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show profile run ledger"
```

## Task 3: Documentation And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/run-ledger.test.ts tests/profile/profile-system.test.ts tests/profile/profile-goals.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
```

- [ ] **Step 2: Update Documentation.md**

Record docs read, worker commits, RED/GREEN notes, verification output, known gaps, and next milestone.

- [ ] **Step 3: Commit docs**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave42 run ledger"
```

## Plan Self-Review

- Spec coverage: The plan covers persistence, normalization, pure derivation, app recording, UI display, tests, and documentation.
- Scope check: The plan stays local-only and excludes platform achievements, accounts, analytics, release packaging, mobile layout, and replay playback.
- Type consistency: `ProfileRunRecord`, `recordProfileRunRecord`, `runRecords`, and `evaluateRunLedger` are named consistently across tasks.
