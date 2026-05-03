import { methodList, methodsById, type MethodDefinition, type MethodId } from "../../content/methods";
import { analyzeDeckArchetypes } from "../deck/archetype";
import { getRunDeckCardDefinitions } from "../run/run";
import type { RunState } from "../run/types";

export interface MethodRewardDraft {
  methods: MethodDefinition[];
  reason: string;
}

export function createMethodRewardDraft(run: RunState, count = 3): MethodRewardDraft {
  normalizeRunMethods(run);
  const deckAnalysis = analyzeDeckArchetypes(getRunDeckCardDefinitions(run));
  const unowned = methodList.filter((method) => method.characterId === run.characterId && !run.methodIds.includes(method.id));
  const sorted = [...unowned].sort((left, right) => {
    const leftMatch = deckAnalysis.top?.id === left.archetypeId ? 0 : 1;
    const rightMatch = deckAnalysis.top?.id === right.archetypeId ? 0 : 1;
    return leftMatch - rightMatch || methodList.indexOf(left) - methodList.indexOf(right);
  });

  return {
    methods: sorted.slice(0, count),
    reason: deckAnalysis.top ? `顺着${deckAnalysis.top.label}定一门心法。` : "心法会让流派在战斗中留下稳定回响。"
  };
}

export function claimMethodReward(run: RunState, methodId: MethodId | string): boolean {
  normalizeRunMethods(run);
  const method = methodsById[methodId as MethodId];
  if (!method || method.characterId !== run.characterId || run.methodIds.includes(method.id)) {
    return false;
  }

  run.methodIds.push(method.id);
  run.methodLevels![method.id] = 1;
  run.rewardHistory.push(`method:${method.id}`);
  return true;
}

export function getRunMethods(run: RunState): MethodDefinition[] {
  normalizeRunMethods(run);
  return run.methodIds.map((id) => methodsById[id as MethodId]).filter((method): method is MethodDefinition => Boolean(method));
}

export function shouldOfferMethodReward(run: RunState): boolean {
  normalizeRunMethods(run);
  return run.methodIds.length === 0;
}

export function normalizeRunMethods(run: RunState): void {
  if (!Array.isArray(run.methodIds)) {
    run.methodIds = [];
  }

  if (!run.methodLevels || typeof run.methodLevels !== "object") {
    run.methodLevels = {};
  }

  for (const methodId of run.methodIds) {
    run.methodLevels[methodId] = Math.max(1, run.methodLevels[methodId] ?? 1);
  }
}
