import { createProfile, recordRunResult, unlockLogbookFragment } from "../../src/game/systems/profile/profile";

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
});
