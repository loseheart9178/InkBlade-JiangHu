import { describe, expect, it } from "vitest";
import { cardList } from "../../src/game/content/cards";
import { charactersById } from "../../src/game/content/characters";
import { challengeProfiles, challengesById, DEFAULT_CHALLENGE_PROFILE_ID } from "../../src/game/content/challenges";
import { enemiesById } from "../../src/game/content/enemies";
import {
  applyChallengeToRunStart,
  getChallengeCombatModifiers,
  resolveChallengeProfile
} from "../../src/game/systems/challenges/challenges";
import { createCombat, endPlayerTurn } from "../../src/game/systems/combat/combat";

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
});
