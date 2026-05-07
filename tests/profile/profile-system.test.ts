import { createProfile, recordCompletedRun, recordRunResult, unlockLogbookFragment } from "../../src/game/systems/profile/profile";
import { loadProfile, PROFILE_STORAGE_KEY, saveProfile, type GameStorage } from "../../src/game/systems/save/save";

class MemoryStorage implements GameStorage {
  private readonly items = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  public removeItem(key: string): void {
    this.items.delete(key);
  }
}

describe("profile system", () => {
  it("records persistent run stats and unlocked fragments", () => {
    const profile = createProfile();
    expect(profile.completedGoalIds).toEqual([]);
    expect(profile.challengeVictories).toEqual([]);
    expect(profile.runRecords).toEqual([]);

    const next = recordRunResult(profile, {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      chaptersCompleted: ["luoshui", "bamboo", "changan"]
    });
    const withFragment = unlockLogbookFragment(next, "fragment_changban_echo");

    expect(withFragment.version).toBe(1);
    expect(withFragment.stats.totalRuns).toBe(1);
    expect(withFragment.stats.victories).toBe(1);
    expect(withFragment.stats.defeats).toBe(0);
    expect(withFragment.characterStats.zhaoyun.victories).toBe(1);
    expect(withFragment.characterStats.zhaoyun.bestChaptersCompleted).toBe(3);
    expect(withFragment.unlockedFragments).toContain("fragment_changban_echo");
    expect(withFragment.unlockedEndings).toContain("ending_clear_seal");
  });

  it("records completed ending runs with character stats and fragment unlocks", () => {
    const next = recordCompletedRun(createProfile(), {
      characterId: "diaochan",
      victory: true,
      endingId: "ending_burn_book",
      characterEpilogueId: "epilogue_diaochan_red_dust_scheme",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror", "fragment_nameless_historian"]
    });

    expect(next.stats.totalRuns).toBe(1);
    expect(next.stats.victories).toBe(1);
    expect(next.characterStats.diaochan.totalRuns).toBe(1);
    expect(next.characterStats.diaochan.bestChaptersCompleted).toBe(4);
    expect(next.characterStats.diaochan.unlockedEndings).toContain("ending_burn_book");
    expect(next.characterStats.diaochan.unlockedCharacterEpilogues).toContain("epilogue_diaochan_red_dust_scheme");
    expect(next.unlockedEndings).toContain("ending_burn_book");
    expect(next.unlockedCharacterEpilogues).toContain("epilogue_diaochan_red_dust_scheme");
    expect(next.unlockedFragments).toEqual(["fragment_heart_mirror", "fragment_nameless_historian"]);
  });

  it("persists profile separately from the current run save slot", () => {
    const storage = new MemoryStorage();
    const profile = recordCompletedRun(createProfile(), {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror"]
    });

    saveProfile(storage, profile);

    expect(storage.getItem(PROFILE_STORAGE_KEY)).toContain("ending_clear_seal");
    expect(storage.getItem(PROFILE_STORAGE_KEY)).toContain("epilogue_zhaoyun_white_dragon_return");
    expect(loadProfile(storage)?.stats.totalRuns).toBe(1);
    expect(loadProfile(storage)?.unlockedFragments).toContain("fragment_heart_mirror");
    expect(loadProfile(storage)?.unlockedCharacterEpilogues).toContain("epilogue_zhaoyun_white_dragon_return");
  });

  it("migrates an older raw profile payload without losing compatible progress", () => {
    const storage = new MemoryStorage();

    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
      version: 0,
      stats: {
        totalRuns: 3,
        victories: 1,
        defeats: 2
      },
      characterStats: {
        zhaoyun: {
          totalRuns: 2,
          victories: 1,
          defeats: 1,
          bestChaptersCompleted: 3,
          unlockedEndings: ["ending_clear_seal", "ending_clear_seal"]
        }
      },
      unlockedFragments: ["fragment_heart_mirror", "fragment_heart_mirror", 99],
      unlockedEndings: ["ending_clear_seal"],
      completedGoalIds: ["goal_first_run", "bad_goal", "goal_first_run"],
      challengeVictories: ["inkRising", "inkRising", "", 42],
      runRecords: [
        {
          id: "run_legacy_valid",
          characterId: "zhaoyun",
          victory: true,
          challengeId: "inkRising",
          endingId: "ending_clear_seal",
          characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
          chaptersCompleted: ["luoshui", "luoshui", "", 7, "bamboo"],
          unlockedFragments: ["fragment_heart_mirror", "fragment_heart_mirror", false],
          newlyCompletedGoalIds: ["goal_first_victory", "bad_goal", "goal_first_victory"],
          endedAtIso: "2026-05-07T01:00:00.000Z"
        },
        {
          id: "",
          characterId: "diaochan",
          victory: false,
          chaptersCompleted: ["luoshui"],
          unlockedFragments: [],
          newlyCompletedGoalIds: [],
          endedAtIso: "2026-05-07T02:00:00.000Z"
        },
        {
          id: "run_missing_character",
          victory: false,
          endedAtIso: "2026-05-07T03:00:00.000Z"
        }
      ],
      legacyDebugSkip: true
    }));

    const profile = loadProfile(storage);
    expect(profile?.version).toBe(1);
    expect(profile?.stats).toEqual({ totalRuns: 3, victories: 1, defeats: 2 });
    expect(profile?.characterStats.zhaoyun.bestChaptersCompleted).toBe(3);
    expect(profile?.characterStats.zhaoyun.unlockedEndings).toEqual(["ending_clear_seal"]);
    expect(profile?.characterStats.zhaoyun.unlockedCharacterEpilogues).toEqual([]);
    expect(profile?.unlockedFragments).toEqual(["fragment_heart_mirror"]);
    expect(profile?.unlockedEndings).toEqual(["ending_clear_seal"]);
    expect(profile?.unlockedCharacterEpilogues).toEqual([]);
    expect(profile?.completedGoalIds).toEqual(["goal_first_run"]);
    expect(profile?.challengeVictories).toEqual(["inkRising"]);
    expect(profile?.runRecords).toEqual([
      {
        id: "run_legacy_valid",
        characterId: "zhaoyun",
        victory: true,
        challengeId: "inkRising",
        endingId: "ending_clear_seal",
        characterEpilogueId: "epilogue_zhaoyun_white_dragon_return",
        chaptersCompleted: ["luoshui", "bamboo"],
        unlockedFragments: ["fragment_heart_mirror"],
        newlyCompletedGoalIds: ["goal_first_victory"],
        endedAtIso: "2026-05-07T01:00:00.000Z"
      }
    ]);
    expect(storage.getItem(PROFILE_STORAGE_KEY)).toContain("legacyDebugSkip");
  });

  it("normalizes malformed profile fields to safe defaults", () => {
    const storage = new MemoryStorage();

    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
      version: 1,
      profile: {
        stats: {
          totalRuns: "bad",
          victories: -4,
          defeats: null
        },
        characterStats: {
          diaochan: {
            totalRuns: 2,
            victories: "bad",
            defeats: 1,
            bestChaptersCompleted: -3,
            unlockedEndings: ["ending_burn_book", ""],
            unlockedCharacterEpilogues: [false, "epilogue_diaochan_red_dust_scheme"]
          }
        },
        unlockedFragments: "not-an-array",
        unlockedEndings: ["ending_burn_book", "ending_burn_book"],
        completedGoalIds: ["goal_first_victory", "goal_missing", "goal_first_victory"],
        challengeVictories: ["ironRain", false, "ironRain"],
        runRecords: [
          {
            id: "run_valid_defeat",
            characterId: "diaochan",
            victory: false,
            chaptersCompleted: ["luoshui", "luoshui", ""],
            unlockedFragments: ["fragment_heart_mirror", "fragment_heart_mirror"],
            newlyCompletedGoalIds: ["goal_first_run", "missing_goal"],
            endedAtIso: "2026-05-07T04:00:00.000Z"
          },
          {
            id: "run_bad_victory_type",
            characterId: "zhaoyun",
            victory: "false",
            endedAtIso: "2026-05-07T05:00:00.000Z"
          }
        ]
      }
    }));

    const profile = loadProfile(storage);
    expect(profile?.stats).toEqual({ totalRuns: 0, victories: 0, defeats: 0 });
    expect(profile?.characterStats.diaochan).toEqual({
      totalRuns: 2,
      victories: 0,
      defeats: 1,
      bestChaptersCompleted: 0,
      unlockedEndings: ["ending_burn_book"],
      unlockedCharacterEpilogues: ["epilogue_diaochan_red_dust_scheme"]
    });
    expect(profile?.unlockedFragments).toEqual([]);
    expect(profile?.unlockedEndings).toEqual(["ending_burn_book"]);
    expect(profile?.unlockedCharacterEpilogues).toEqual([]);
    expect(profile?.completedGoalIds).toEqual(["goal_first_victory"]);
    expect(profile?.challengeVictories).toEqual(["ironRain"]);
    expect(profile?.runRecords).toEqual([
      {
        id: "run_valid_defeat",
        characterId: "diaochan",
        victory: false,
        chaptersCompleted: ["luoshui"],
        unlockedFragments: ["fragment_heart_mirror"],
        newlyCompletedGoalIds: ["goal_first_run"],
        endedAtIso: "2026-05-07T04:00:00.000Z"
      }
    ]);
  });

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
});
