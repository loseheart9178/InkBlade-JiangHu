import { profileGoals } from "../../src/game/content/goals";
import { evaluateProfileGoals, recordCompletedGoals } from "../../src/game/systems/profile/goals";
import { createProfile, recordCompletedRun, recordRunResult } from "../../src/game/systems/profile/profile";

describe("profile goals", () => {
  it("defines a replayable local goal set", () => {
    expect(profileGoals.length).toBeGreaterThanOrEqual(12);
    expect(profileGoals.map((goal) => goal.id)).toEqual(expect.arrayContaining([
      "goal_first_run",
      "goal_first_victory",
      "goal_zhaoyun_mastery",
      "goal_diaochan_mastery",
      "goal_caiwenji_mastery",
      "goal_zhugeliang_mastery",
      "goal_all_heroes_started",
      "goal_three_endings",
      "goal_lore_collector",
      "goal_epilogue_collector",
      "goal_ink_rising_clear",
      "goal_iron_rain_clear"
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

    expect(records.find((record) => record.goal.id === "goal_first_run")?.completed).toBe(true);
    expect(records.find((record) => record.goal.id === "goal_first_victory")?.completed).toBe(true);
    expect(records.find((record) => record.goal.id === "goal_zhaoyun_mastery")?.completed).toBe(true);
    expect(records.find((record) => record.goal.id === "goal_lore_collector")?.progress.current).toBe(2);
    expect(records.find((record) => record.goal.id === "goal_epilogue_collector")?.progress.current).toBe(1);
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

    expect(first.newlyCompletedGoalIds).toEqual(expect.arrayContaining([
      "goal_first_run",
      "goal_first_victory",
      "goal_zhaoyun_mastery"
    ]));
    expect(first.profile.completedGoalIds).toEqual(expect.arrayContaining(first.newlyCompletedGoalIds));
    expect(second.newlyCompletedGoalIds).toEqual([]);
    expect(second.profile.completedGoalIds).toEqual(first.profile.completedGoalIds);
  });

  it("tracks challenge victories only for victorious challenge runs", () => {
    const defeat = recordRunResult(createProfile(), {
      characterId: "diaochan",
      victory: false,
      challengeId: "inkRising"
    });
    const victory = recordRunResult(defeat, {
      characterId: "diaochan",
      victory: true,
      challengeId: "inkRising"
    });
    const duplicate = recordRunResult(victory, {
      characterId: "zhaoyun",
      victory: true,
      challengeId: "inkRising"
    });

    expect(defeat.challengeVictories).toEqual([]);
    expect(victory.challengeVictories).toEqual(["inkRising"]);
    expect(duplicate.challengeVictories).toEqual(["inkRising"]);
    expect(evaluateProfileGoals(victory).find((record) => record.goal.id === "goal_ink_rising_clear")?.completed).toBe(true);
  });
});
