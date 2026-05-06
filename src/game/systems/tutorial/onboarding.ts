import type { CombatState } from "../combat/types";

export const COMBAT_ONBOARDING_HINT_IDS = [
  "combat-energy",
  "combat-hand",
  "combat-intent",
  "combat-block",
  "combat-end-turn"
] as const;

export const CHARACTER_ONBOARDING_HINT_IDS = [
  "character-zhaoyun",
  "character-diaochan",
  "character-caiwenji",
  "character-zhugeliang"
] as const;

export const SURFACE_ONBOARDING_HINT_IDS = [
  "map-route",
  "map-mind",
  "map-ink",
  "reward-choice",
  "method-overview"
] as const;

export const ONBOARDING_HINT_IDS = [
  ...COMBAT_ONBOARDING_HINT_IDS,
  ...CHARACTER_ONBOARDING_HINT_IDS,
  ...SURFACE_ONBOARDING_HINT_IDS
] as const;

export type OnboardingHintId = typeof ONBOARDING_HINT_IDS[number];
export type CombatOnboardingHintId = OnboardingHintId;
export type SurfaceOnboardingHintId = typeof SURFACE_ONBOARDING_HINT_IDS[number];
export type CharacterOnboardingHintId = typeof CHARACTER_ONBOARDING_HINT_IDS[number];
export type CombatOnboardingAnchor = "energy" | "hand" | "intent" | "block" | "end-turn";

export interface CombatOnboardingHint {
  id: CombatOnboardingHintId;
  anchor: CombatOnboardingAnchor;
  title: string;
  body: string;
}

export interface SurfaceOnboardingHint {
  id: SurfaceOnboardingHintId;
  title: string;
  body: string;
}

const ONBOARDING_HINT_COPY: Record<OnboardingHintId, { title: string; body: string }> = {
  "combat-energy": {
    title: "真气",
    body: "每回合回复真气。卡牌左上角是费用，灰掉时只是暂时不够。"
  },
  "combat-hand": {
    title: "手牌",
    body: "底部招式本回合可用。先看费用和目标，再决定出招顺序。"
  },
  "combat-intent": {
    title: "敌意",
    body: "中上方符印是敌人的下次行动。先读杀意，再取攻守。"
  },
  "combat-block": {
    title: "护甲",
    body: "护甲会先挡攻击伤害。防御招式打出后，看角色旁的护甲数。"
  },
  "combat-end-turn": {
    title: "收势",
    body: "没有合适招式时结束回合；敌人行动后会重新抽牌并回真气。"
  },
  "character-zhaoyun": {
    title: "赵云",
    body: "枪势会放大攻势。连续第三张攻击还会触发破阵，适合算好出招节奏。"
  },
  "character-diaochan": {
    title: "貂蝉",
    body: "舞势既能转成进攻，也能换来魅惑与闪避。留意控制后的回合差。"
  },
  "character-caiwenji": {
    title: "蔡文姬",
    body: "音律会驱动净化与余韵。先稳住节奏，再让琴曲把收益滚起来。"
  },
  "character-zhugeliang": {
    title: "诸葛亮",
    body: "筹策能支撑观星与阵法。先看牌序，再决定何时布阵压住局势。"
  },
  "map-route": {
    title: "路线",
    body: "精英、商店、休息与事件会把构筑带向不同方向，先想这一章缺什么。"
  },
  "map-mind": {
    title: "心境",
    body: "心境不只是标签，它会影响事件、牌效与后续抉择。"
  },
  "map-ink": {
    title: "墨痕",
    body: "墨痕是整局长期代价。战后掉血只是表面，路线规划才是关键。"
  },
  "reward-choice": {
    title: "奖励",
    body: "三选一是在定构筑方向，跳过也可以是在保护牌组纯度。"
  },
  "method-overview": {
    title: "心法",
    body: "心法会提供整局被动成长，后续精英还能继续推进它的境界。"
  }
};

const MAP_ONBOARDING_HINT_IDS = ["map-route", "map-mind", "map-ink"] as const;
const REWARD_ONBOARDING_HINT_IDS = ["reward-choice"] as const;
const METHOD_ONBOARDING_HINT_IDS = ["method-overview"] as const;

export function normalizeOnboardingHintIds(value: unknown): OnboardingHintId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter(isOnboardingHintId)));
}

export function dismissOnboardingHint(
  dismissedHintIds: readonly string[],
  hintId: OnboardingHintId
): OnboardingHintId[] {
  return normalizeOnboardingHintIds([...dismissedHintIds, hintId]);
}

export function createCombatOnboardingHints(
  combat: CombatState,
  dismissedHintIds: readonly string[]
): CombatOnboardingHint[] {
  const dismissed = new Set(normalizeOnboardingHintIds(dismissedHintIds));
  const combatHints: CombatOnboardingHint[] = COMBAT_ONBOARDING_HINT_IDS
    .filter((hintId) => !dismissed.has(hintId))
    .filter((hintId) => isCombatHintContextAvailable(combat, hintId))
    .map((hintId) => ({
      id: hintId,
      anchor: getCombatHintAnchor(hintId),
      title: ONBOARDING_HINT_COPY[hintId].title,
      body: ONBOARDING_HINT_COPY[hintId].body
    }));
  const characterHintId = getCharacterOnboardingHintId(combat.player.characterId);

  if (!dismissed.has(characterHintId)) {
    combatHints.push({
      id: characterHintId,
      anchor: "hand",
      title: ONBOARDING_HINT_COPY[characterHintId].title,
      body: ONBOARDING_HINT_COPY[characterHintId].body
    });
  }

  return combatHints;
}

export function createMapOnboardingHints(dismissedHintIds: readonly string[]): SurfaceOnboardingHint[] {
  return createSurfaceOnboardingHints(MAP_ONBOARDING_HINT_IDS, dismissedHintIds);
}

export function createRewardOnboardingHints(dismissedHintIds: readonly string[]): SurfaceOnboardingHint[] {
  return createSurfaceOnboardingHints(REWARD_ONBOARDING_HINT_IDS, dismissedHintIds);
}

export function createMethodOnboardingHints(dismissedHintIds: readonly string[]): SurfaceOnboardingHint[] {
  return createSurfaceOnboardingHints(METHOD_ONBOARDING_HINT_IDS, dismissedHintIds);
}

function createSurfaceOnboardingHints(
  hintIds: readonly SurfaceOnboardingHintId[],
  dismissedHintIds: readonly string[]
): SurfaceOnboardingHint[] {
  const dismissed = new Set(normalizeOnboardingHintIds(dismissedHintIds));
  return hintIds
    .filter((hintId) => !dismissed.has(hintId))
    .map((hintId) => ({
      id: hintId,
      title: ONBOARDING_HINT_COPY[hintId].title,
      body: ONBOARDING_HINT_COPY[hintId].body
    }));
}

function isCombatHintContextAvailable(combat: CombatState, hintId: typeof COMBAT_ONBOARDING_HINT_IDS[number]): boolean {
  if (combat.phase !== "player") {
    return false;
  }

  if (hintId === "combat-energy") {
    return combat.player.maxEnergy > 0;
  }

  if (hintId === "combat-hand") {
    return combat.piles.hand.length > 0;
  }

  if (hintId === "combat-intent") {
    return combat.enemies.some((enemy) => Boolean(enemy.currentIntent));
  }

  if (hintId === "combat-block") {
    return true;
  }

  return hintId === "combat-end-turn";
}

function getCombatHintAnchor(hintId: typeof COMBAT_ONBOARDING_HINT_IDS[number]): CombatOnboardingAnchor {
  if (hintId === "combat-energy") {
    return "energy";
  }

  if (hintId === "combat-intent") {
    return "intent";
  }

  if (hintId === "combat-block") {
    return "block";
  }

  if (hintId === "combat-end-turn") {
    return "end-turn";
  }

  return "hand";
}

function getCharacterOnboardingHintId(characterId: string): CharacterOnboardingHintId {
  if (characterId === "diaochan") {
    return "character-diaochan";
  }

  if (characterId === "caiwenji") {
    return "character-caiwenji";
  }

  if (characterId === "zhugeliang") {
    return "character-zhugeliang";
  }

  return "character-zhaoyun";
}

function isOnboardingHintId(value: unknown): value is OnboardingHintId {
  return ONBOARDING_HINT_IDS.includes(value as OnboardingHintId);
}
