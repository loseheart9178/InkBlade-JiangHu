import { cardsById } from "../../content/cards";
import type { MindState } from "../combat/types";
import type { RunFinalState, RunState } from "../run/types";

export type EndingId =
  | "ending_clear_seal"
  | "ending_burn_book"
  | "ending_rewrite_fate"
  | "ending_heart_demon"
  | "ending_hidden_wu";

export interface EndingDefinition {
  id: EndingId;
  title: string;
  summary: string;
  body: string;
}

export interface InkHistory {
  totalGained: number;
  highestInCombat: number;
  disasterCardsPlayed: number;
}

export interface EndingEvaluationInput {
  mindTendencies: Record<Exclude<MindState, "none">, number>;
  inkHistory?: Partial<InkHistory>;
}

const ENDINGS: Record<EndingId, EndingDefinition> = {
  ending_clear_seal: {
    id: "ending_clear_seal",
    title: "清明封印",
    summary: "封印墨渊，记住痛苦，也让江湖继续向前。",
    body: "你以宁静之心按下最后一笔。墨渊没有被抹去，只被封在清明的水光之下。亡魂仍被记得，但墨色不再替他们吞噬活人。"
  },
  ending_burn_book: {
    id: "ending_burn_book",
    title: "焚书断墨",
    summary: "焚毁墨书，斩断灾源，也承担遗忘的代价。",
    body: "朱火沿着书脊燃起，旧怨与未竟之愿一同化作灰烬。江湖从墨灾中醒来，却有许多名字再也无人能够念出。"
  },
  ending_rewrite_fate: {
    id: "ending_rewrite_fate",
    title: "执笔改命",
    summary: "接管墨书，改写部分悲剧，并引出新的因果。",
    body: "你没有合上墨书，而是握住了笔。几段命运被重新写亮，几场离散被短暂补全；可每一个新字，都在纸背生出新的债。"
  },
  ending_heart_demon: {
    id: "ending_heart_demon",
    title: "心魔成渊",
    summary: "执念与墨灾合流，江湖落入新的墨色秩序。",
    body: "墨色终于不再反抗你，因为你已成为它的中心。江湖安静下来，像被收入一卷永不褪色的旧书，所有人都活在你的执念里。"
  },
  ending_hidden_wu: {
    id: "ending_hidden_wu",
    title: "隐藏清悟",
    summary: "放下执笔之心，让墨书不再属于任何人。",
    body: "你看见最后一页空着，却没有写下自己的名字。黑水自行退去，亡魂自行选择留下或离开；江湖第一次不由胜者、败者或执笔者定稿。"
  }
};

export const endingPriority: EndingId[] = [
  "ending_hidden_wu",
  "ending_heart_demon",
  "ending_rewrite_fate",
  "ending_burn_book",
  "ending_clear_seal"
];

export const endingList: EndingDefinition[] = endingPriority.map((endingId) => ENDINGS[endingId]);

export const endingsById: Record<EndingId, EndingDefinition> = ENDINGS;

export function evaluateEnding(input: EndingEvaluationInput): EndingDefinition {
  const mind = normalizeMindTendencies(input.mindTendencies);
  const ink = normalizeInkHistory(input.inkHistory);

  if (qualifiesForHiddenWu(mind, ink)) {
    return ENDINGS.ending_hidden_wu;
  }

  if (qualifiesForHeartDemon(mind, ink)) {
    return ENDINGS.ending_heart_demon;
  }

  if (qualifiesForRewriteFate(mind, ink)) {
    return ENDINGS.ending_rewrite_fate;
  }

  if (qualifiesForBurnBook(mind, ink)) {
    return ENDINGS.ending_burn_book;
  }

  return ENDINGS.ending_clear_seal;
}

export function evaluateRunEnding(finalState: RunFinalState, run: RunState): EndingDefinition | undefined {
  if (finalState.status !== "endingReady") {
    return undefined;
  }

  return evaluateEnding(createEndingEvaluationInputFromRun(run));
}

export function createEndingEvaluationInputFromRun(run: RunState): EndingEvaluationInput {
  return {
    mindTendencies: normalizeMindTendencies(run.mindTendencies),
    inkHistory: createInkHistoryFromRun(run)
  };
}

function createInkHistoryFromRun(run: RunState): InkHistory {
  const inkRewards = run.rewardHistory.filter((item) => cardsById[item]?.rarity === "ink" || item.startsWith("ink_")).length;
  const inkComboTriggers = run.comboRewardHistory.filter((item) => item === "moxi").length;
  const disasterCardsPlayed = inkRewards + inkComboTriggers;
  return {
    totalGained: disasterCardsPlayed * 2 + Math.max(0, run.mindTendencies?.luan ?? 0),
    highestInCombat: Math.max(0, Math.min(9, inkRewards + inkComboTriggers)),
    disasterCardsPlayed
  };
}

function qualifiesForHiddenWu(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const extremeAttachment = Math.max(mind.nu, mind.bei, mind.mei, mind.luan);
  return mind.wu >= 8 && extremeAttachment <= 5 && ink.totalGained <= 2 && ink.highestInCombat <= 2 && ink.disasterCardsPlayed === 0;
}

function qualifiesForHeartDemon(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const extremeMind = mind.luan >= 6 || Math.max(mind.nu, mind.bei, mind.mei) >= 5;
  const extremeInk = ink.totalGained >= 16 || ink.highestInCombat >= 8 || ink.disasterCardsPlayed >= 6;
  return extremeMind && extremeInk;
}

function qualifiesForRewriteFate(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const inkDebt = ink.totalGained >= 10 || ink.highestInCombat >= 5 || ink.disasterCardsPlayed >= 4;
  const acceptsInkLogic = mind.wu + mind.luan + mind.mei >= 5;
  return inkDebt && acceptsInkLogic;
}

function qualifiesForBurnBook(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const bookHostility = mind.nu >= 5 && mind.wu >= 2;
  const inkHasNotTakenOver = ink.totalGained < 10 && ink.highestInCombat < 5 && ink.disasterCardsPlayed < 4;
  return bookHostility && inkHasNotTakenOver;
}

function normalizeMindTendencies(tendencies: EndingEvaluationInput["mindTendencies"]): EndingEvaluationInput["mindTendencies"] {
  return {
    ning: Math.max(0, tendencies.ning ?? 0),
    nu: Math.max(0, tendencies.nu ?? 0),
    bei: Math.max(0, tendencies.bei ?? 0),
    mei: Math.max(0, tendencies.mei ?? 0),
    luan: Math.max(0, tendencies.luan ?? 0),
    wu: Math.max(0, tendencies.wu ?? 0)
  };
}

function normalizeInkHistory(history: Partial<InkHistory> | undefined): InkHistory {
  return {
    totalGained: Math.max(0, history?.totalGained ?? 0),
    highestInCombat: Math.max(0, history?.highestInCombat ?? 0),
    disasterCardsPlayed: Math.max(0, history?.disasterCardsPlayed ?? 0)
  };
}
