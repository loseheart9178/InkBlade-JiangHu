import { describe, expect, it } from "vitest";
import { charactersById } from "../../src/game/content/characters";
import { challengeProfiles, challengesById, DEFAULT_CHALLENGE_PROFILE_ID } from "../../src/game/content/challenges";
import {
  applyChallengeToRunStart,
  getChallengeCombatModifiers,
  resolveChallengeProfile
} from "../../src/game/systems/challenges/challenges";

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
