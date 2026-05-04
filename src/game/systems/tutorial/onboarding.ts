import type { CombatState } from "../combat/types";

export const COMBAT_ONBOARDING_HINT_IDS = [
  "combat-energy",
  "combat-hand",
  "combat-intent",
  "combat-block",
  "combat-end-turn"
] as const;

export type CombatOnboardingHintId = typeof COMBAT_ONBOARDING_HINT_IDS[number];
export type CombatOnboardingAnchor = "energy" | "hand" | "intent" | "block" | "end-turn";

export interface CombatOnboardingHint {
  id: CombatOnboardingHintId;
  anchor: CombatOnboardingAnchor;
  title: string;
  body: string;
}

const COMBAT_ONBOARDING_HINTS: Record<CombatOnboardingHintId, CombatOnboardingHint> = {
  "combat-energy": {
    id: "combat-energy",
    anchor: "energy",
    title: "真气",
    body: "每回合回复真气。卡牌左上角是费用，灰掉时只是暂时不够。"
  },
  "combat-hand": {
    id: "combat-hand",
    anchor: "hand",
    title: "手牌",
    body: "底部招式本回合可用。先看费用和目标，再决定出招顺序。"
  },
  "combat-intent": {
    id: "combat-intent",
    anchor: "intent",
    title: "敌意",
    body: "中上方符印是敌人的下次行动。先读杀意，再取攻守。"
  },
  "combat-block": {
    id: "combat-block",
    anchor: "block",
    title: "护甲",
    body: "护甲会先挡攻击伤害。防御招式打出后，看角色旁的护甲数。"
  },
  "combat-end-turn": {
    id: "combat-end-turn",
    anchor: "end-turn",
    title: "收势",
    body: "没有合适招式时结束回合；敌人行动后会重新抽牌并回真气。"
  }
};

export function normalizeOnboardingHintIds(value: unknown): CombatOnboardingHintId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter(isCombatOnboardingHintId)));
}

export function dismissOnboardingHint(
  dismissedHintIds: readonly string[],
  hintId: CombatOnboardingHintId
): CombatOnboardingHintId[] {
  return normalizeOnboardingHintIds([...dismissedHintIds, hintId]);
}

export function createCombatOnboardingHints(
  combat: CombatState,
  dismissedHintIds: readonly string[]
): CombatOnboardingHint[] {
  const dismissed = new Set(normalizeOnboardingHintIds(dismissedHintIds));
  return COMBAT_ONBOARDING_HINT_IDS
    .filter((hintId) => !dismissed.has(hintId))
    .filter((hintId) => isCombatHintContextAvailable(combat, hintId))
    .map((hintId) => COMBAT_ONBOARDING_HINTS[hintId]);
}

function isCombatHintContextAvailable(combat: CombatState, hintId: CombatOnboardingHintId): boolean {
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

function isCombatOnboardingHintId(value: unknown): value is CombatOnboardingHintId {
  return COMBAT_ONBOARDING_HINT_IDS.includes(value as CombatOnboardingHintId);
}
