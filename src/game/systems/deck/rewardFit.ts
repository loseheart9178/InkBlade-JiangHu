import type { CardArchetypeId, CardDefinition, CardType } from "../combat/types";
import { ARCHETYPE_LABELS, analyzeDeckArchetypes } from "./archetype";

export type RewardBuildFitTone = "main" | "branch" | "utility" | "risk";

export interface RewardBuildFit {
  label: string;
  detail: string;
  tone: RewardBuildFitTone;
}

const TYPE_LABELS: Record<CardType, string> = {
  attack: "攻击",
  skill: "技法",
  body: "身法",
  power: "心法",
  mind: "心境",
  ink: "墨灾"
};

export function createRewardBuildFit(currentDeck: readonly CardDefinition[], rewardCard: CardDefinition): RewardBuildFit {
  const deck = [...currentDeck];
  const analysis = analyzeDeckArchetypes(deck);
  const rewardArchetypes = rewardCard.archetypes ?? [];

  if (rewardCard.types.includes("ink") || rewardCard.rarity === "ink") {
    return {
      label: "墨灾取势",
      detail: "高收益武学，但会牵动墨痕与结局风险。",
      tone: "risk"
    };
  }

  if (!analysis.top) {
    return {
      label: "开局定向",
      detail:
        rewardArchetypes.length > 0
          ? `可向${formatArchetypeLabels(rewardArchetypes)}成型。`
          : `提供${formatCardTypes(rewardCard.types)}基础能力。`,
      tone: "utility"
    };
  }

  if (rewardArchetypes.includes(analysis.top.id)) {
    return {
      label: "顺势精进",
      detail: `继续强化${analysis.top.label}。`,
      tone: "main"
    };
  }

  if (rewardArchetypes.length > 0) {
    return {
      label: "另开支路",
      detail: `可转向${formatArchetypeLabels(rewardArchetypes)}。`,
      tone: "branch"
    };
  }

  return {
    label: "补足周旋",
    detail: `补充${formatCardTypes(rewardCard.types)}能力，缓解当前牌组短板。`,
    tone: "utility"
  };
}

function formatArchetypeLabels(archetypes: readonly CardArchetypeId[]): string {
  return archetypes.map((id) => ARCHETYPE_LABELS[id]).join("、");
}

function formatCardTypes(types: readonly CardType[]): string {
  return types.map((type) => TYPE_LABELS[type]).join("、");
}
