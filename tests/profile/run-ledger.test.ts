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
        chaptersCompleted: ["luoshui"],
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
