import {
  challengesById,
  DEFAULT_CHALLENGE_PROFILE_ID,
  type ChallengeProfileDefinition,
  type ChallengeProfileId
} from "../../content/challenges";
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

export function applyChallengeToRunStart(
  character: CharacterDefinition,
  profile: ChallengeProfileDefinition,
  baseMapSeed: number
): ChallengeRunStart {
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
