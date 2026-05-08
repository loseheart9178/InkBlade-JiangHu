import type { RelicDefinition } from "../../content/relics";
import type { CardArchetypeId, CardDefinition } from "../combat/types";
import { ARCHETYPE_LABELS, analyzeDeckArchetypes } from "../deck/archetype";

export type RelicBuildFitTone = "main" | "branch" | "utility" | "risk";

export interface RelicBuildFit {
  label: string;
  detail: string;
  tone: RelicBuildFitTone;
}

export function createRelicBuildFit(currentDeck: readonly CardDefinition[], characterId: string, relic: RelicDefinition): RelicBuildFit {
  const deck = [...currentDeck];
  const analysis = analyzeDeckArchetypes(deck);
  const text = `${relic.triggerText ?? ""}${relic.description}`;

  if (text.includes("墨痕") || text.includes("墨灾")) {
    return {
      label: "墨灾奇物",
      detail: "围绕墨痕收益运转，适合愿意承担墨灾风险的构筑。",
      tone: "risk"
    };
  }

  if (!analysis.top && relic.archetypeId) {
    return {
      label: "开局法门",
      detail: `可围绕${formatArchetypeLabel(relic.archetypeId)}开始定型。`,
      tone: "utility"
    };
  }

  if (analysis.top && relic.archetypeId === analysis.top.id) {
    return {
      label: "流派共鸣",
      detail: `继续强化${analysis.top.label}的长期节奏。`,
      tone: "main"
    };
  }

  if (relic.archetypeId) {
    return {
      label: relic.character === characterId ? "本命支路" : "另觅法门",
      detail: `可转向${formatArchetypeLabel(relic.archetypeId)}。`,
      tone: "branch"
    };
  }

  if (text.includes("心境")) {
    return {
      label: "心境辅佐",
      detail: "支持心境切换后的防守或节奏收益。",
      tone: "utility"
    };
  }

  return {
    label: "通用稳固",
    detail: "不挑流派，提供所有流派都能使用的长期收益。",
    tone: "utility"
  };
}

function formatArchetypeLabel(archetypeId: CardArchetypeId): string {
  return ARCHETYPE_LABELS[archetypeId] ?? archetypeId;
}
