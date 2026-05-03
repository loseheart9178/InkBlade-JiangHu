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
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror", "fragment_nameless_historian"]
    });

    expect(next.stats.totalRuns).toBe(1);
    expect(next.stats.victories).toBe(1);
    expect(next.characterStats.diaochan.totalRuns).toBe(1);
    expect(next.characterStats.diaochan.bestChaptersCompleted).toBe(4);
    expect(next.characterStats.diaochan.unlockedEndings).toContain("ending_burn_book");
    expect(next.unlockedEndings).toContain("ending_burn_book");
    expect(next.unlockedFragments).toEqual(["fragment_heart_mirror", "fragment_nameless_historian"]);
  });

  it("persists profile separately from the current run save slot", () => {
    const storage = new MemoryStorage();
    const profile = recordCompletedRun(createProfile(), {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      chaptersCompleted: ["luoshui", "bamboo", "changan", "moyuan"],
      unlockedFragments: ["fragment_heart_mirror"]
    });

    saveProfile(storage, profile);

    expect(storage.getItem(PROFILE_STORAGE_KEY)).toContain("ending_clear_seal");
    expect(loadProfile(storage)?.stats.totalRuns).toBe(1);
    expect(loadProfile(storage)?.unlockedFragments).toContain("fragment_heart_mirror");
  });
});
