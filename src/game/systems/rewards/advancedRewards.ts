import { cardsById } from "../../content/cards";
import { methodsById, type MethodId } from "../../content/methods";
import { relicsById } from "../../content/relics";
import { getNextRelicReward } from "../run/run";
import type { MapNodeType, RunState } from "../run/types";

export type AdvancedRewardChoiceType = "rareCard" | "relic" | "methodUpgrade" | "cleanseCard";

export interface AdvancedRewardChoice {
  id: string;
  type: AdvancedRewardChoiceType;
  title: string;
  summary: string;
  cardId?: string;
  relicId?: string;
  methodId?: string;
}

export interface AdvancedRewardDraft {
  choices: AdvancedRewardChoice[];
  reason: string;
}

export function createAdvancedRewardDraft(run: RunState, nodeType: MapNodeType = "boss"): AdvancedRewardDraft {
  const choices: AdvancedRewardChoice[] = [];
  const rareCardId = getRareBuildCard(run);
  const methodId = getUpgradeableMethodId(run);

  choices.push({
    id: `rare-card-${rareCardId}`,
    type: "rareCard",
    title: cardsById[rareCardId]?.name ?? "高阶武学",
    summary: `获得${cardsById[rareCardId]?.name ?? rareCardId}，补强当前角色流派。`,
    cardId: rareCardId
  });

  if (methodId) {
    const method = methodsById[methodId as MethodId];
    choices.push({
      id: `method-upgrade-${methodId}`,
      type: "methodUpgrade",
      title: `${method?.name ?? "心法"}进境`,
      summary: method?.upgrades?.[2]?.description ?? "提升一门已习得心法。",
      methodId
    });
  }

  choices.push({
    id: "cleanse-card-common_jiexue",
    type: "cleanseCard",
    title: "清音解秽",
    summary: "获得解穴，保证后续章节有稳定的状态污染反制。",
    cardId: "common_jiexue"
  });

  return {
    choices: choices.slice(0, 4),
    reason: run.chapterId === "changan" ? "墨城奖励偏向稀有武学、法宝联动与心法进境。" : "竹林奖励开始强调净化、心法进境与法宝反制。"
  };
}

function getRareBuildCard(run: RunState): string {
  if (run.characterId === "diaochan") {
    return run.deck.some((card) => card.cardId === "diao_lijian") ? "diao_jinghong_strike" : "diao_closed_moon";
  }

  return run.deck.some((card) => card.cardId === "zhao_spear_wall") ? "zhao_single_rider" : "zhao_qixing_spear";
}

function getUpgradeableMethodId(run: RunState): string | undefined {
  return run.methodIds.find((methodId) => (run.methodLevels?.[methodId] ?? 1) < 2);
}

function getAdvancedRelicId(run: RunState, nodeType: MapNodeType): string | undefined {
  if (run.chapterId === "bamboo" && !run.relicIds.includes("relic_qingyin_jade")) {
    return "relic_qingyin_jade";
  }

  if (run.chapterId === "changan" && !run.relicIds.includes("relic_scribe_red_seal")) {
    return "relic_scribe_red_seal";
  }

  return getNextRelicReward(run, nodeType === "boss" ? ["relic_qingyin_jade", "relic_scribe_red_seal"] : undefined);
}
