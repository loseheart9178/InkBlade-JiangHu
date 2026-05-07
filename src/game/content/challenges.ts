export type ChallengeProfileId = "standard" | "scarcity" | "inkRising" | "ironRain";

export interface ChallengeProfileDefinition {
  id: ChallengeProfileId;
  name: string;
  summary: string;
  detail: string;
  difficulty: "baseline" | "hard";
  mapSeedOffset: number;
  startingGold: number;
  maxHpDelta: number;
  enemyMaxHpMultiplier: number;
  enemyAttackBonus: number;
}

export const DEFAULT_CHALLENGE_PROFILE_ID: ChallengeProfileId = "standard";

export const challengeProfiles: ChallengeProfileDefinition[] = [
  {
    id: "standard",
    name: "行云常路",
    summary: "标准江湖行旅",
    detail: "保留当前 EA 基准数值，适合首次体验。",
    difficulty: "baseline",
    mapSeedOffset: 0,
    startingGold: 99,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 0
  },
  {
    id: "scarcity",
    name: "雨夜穷途",
    summary: "资源紧缺开局",
    detail: "初始铜钱减少，最大生命略低，路线种子偏移。",
    difficulty: "hard",
    mapSeedOffset: 7,
    startingGold: 55,
    maxHpDelta: -4,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 0
  },
  {
    id: "inkRising",
    name: "墨潮压境",
    summary: "敌血微涨压境",
    detail: "敌人生命小幅提高，路线种子偏移，考验构筑输出。",
    difficulty: "hard",
    mapSeedOffset: 13,
    startingGold: 85,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1.08,
    enemyAttackBonus: 0
  },
  {
    id: "ironRain",
    name: "铁雨试锋",
    summary: "敌方攻势更烈",
    detail: "敌方攻击每段额外提高一点，路线种子偏移。",
    difficulty: "hard",
    mapSeedOffset: 21,
    startingGold: 80,
    maxHpDelta: 0,
    enemyMaxHpMultiplier: 1,
    enemyAttackBonus: 1
  }
];

export const challengesById: Record<ChallengeProfileId, ChallengeProfileDefinition> = Object.fromEntries(
  challengeProfiles.map((profile) => [profile.id, profile])
) as Record<ChallengeProfileId, ChallengeProfileDefinition>;
