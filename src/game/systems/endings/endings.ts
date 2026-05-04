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

export type FinalChoiceId =
  | "final_seal_moyuan"
  | "final_burn_ink_book"
  | "final_claim_ink_book"
  | "final_merge_heart_demon"
  | "final_lay_down_brush";

export interface FinalChoiceDefinition {
  id: FinalChoiceId;
  title: string;
  summary: string;
  body: string;
  endingId: EndingId;
  hidden?: boolean;
}

export interface FinalChoiceAvailability extends FinalChoiceDefinition {
  eligible: boolean;
  requirement: string;
}

export type CharacterEpilogueId =
  | "epilogue_zhaoyun_white_dragon_return"
  | "epilogue_zhaoyun_lone_spear_breaks_army"
  | "epilogue_zhaoyun_bingsha_tonggui"
  | "epilogue_zhaoyun_changban_nameless"
  | "epilogue_diaochan_closed_moon_return"
  | "epilogue_diaochan_red_dust_scheme"
  | "epilogue_diaochan_heart_demon_charm"
  | "epilogue_diaochan_nameless_freedom"
  | "epilogue_caiwenji_clear_tone_ferry"
  | "epilogue_caiwenji_broken_string_last_sound"
  | "epilogue_caiwenji_sorrow_demon"
  | "epilogue_caiwenji_five_tones_one"
  | "epilogue_zhugeliang_wolong_return"
  | "epilogue_zhugeliang_borrow_wind_fate"
  | "epilogue_zhugeliang_fate_chess_player"
  | "epilogue_zhugeliang_empty_city_clear_mind";

export interface CharacterEpilogueDefinition {
  id: CharacterEpilogueId;
  characterId: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang";
  title: string;
  summary: string;
  body: string;
}

export interface FinalChoiceSelection {
  choice: FinalChoiceDefinition;
  ending: EndingDefinition;
  characterEpilogue: CharacterEpilogueDefinition;
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

const FINAL_CHOICES: Record<FinalChoiceId, FinalChoiceDefinition> = {
  final_seal_moyuan: {
    id: "final_seal_moyuan",
    title: "封印墨渊",
    summary: "以宁与悟压住黑水，保存记忆，却不让记忆继续吞噬现实。",
    body: "你将墨书合拢，以最后一缕清明封住墨渊。亡魂的名字仍在水下发光，江湖却终于能从黑雨里抬头。",
    endingId: "ending_clear_seal"
  },
  final_burn_ink_book: {
    id: "final_burn_ink_book",
    title: "焚毁墨书",
    summary: "以怒火和明悟烧断墨灾源头，让江湖迅速醒来，也让许多旧愿散去。",
    body: "朱火从笔锋燃起，一页页烧过未竟之愿。墨灾退得很快，快到有些名字还没来得及被你再念一遍。",
    endingId: "ending_burn_book"
  },
  final_claim_ink_book: {
    id: "final_claim_ink_book",
    title: "接管墨书",
    summary: "握住执笔之权，改写一部分悲剧，同时背下新生因果。",
    body: "你没有放开那支笔。几处旧伤被你改成生路，几段死别被你续成重逢；可纸背立刻渗出新的墨债。",
    endingId: "ending_rewrite_fate"
  },
  final_merge_heart_demon: {
    id: "final_merge_heart_demon",
    title: "与心魔合一",
    summary: "承认执念即是力量，取代无名史官，成为新的墨灾核心。",
    body: "你向水中倒影伸手。心魔不再嘶吼，因为它终于有了你的声音；江湖安静下来，安静得像一场永不醒来的梦。",
    endingId: "ending_heart_demon"
  },
  final_lay_down_brush: {
    id: "final_lay_down_brush",
    title: "放下笔",
    summary: "不封、不焚、不执掌，让墨书从此不再由任何人定稿。",
    body: "你看见空白的末页，也看见自己仍能写下名字。你最终只是把笔放回水面，让亡魂和生者各自选择去处。",
    endingId: "ending_hidden_wu",
    hidden: true
  }
};

const FINAL_CHOICE_REQUIREMENTS: Record<FinalChoiceId, string> = {
  final_seal_moyuan: "宁/悟清明且墨痕未深。",
  final_burn_ink_book: "怒意足够，且仍有悟心辨明代价。",
  final_claim_ink_book: "墨灾债重，且心境已接近执笔改命。",
  final_merge_heart_demon: "墨痕极深，并有乱、怒、悲或魅的极端执念。",
  final_lay_down_brush: "悟极高，远离极端执念，且几乎未借墨灾。"
};

export const finalChoiceOrder: FinalChoiceId[] = [
  "final_seal_moyuan",
  "final_burn_ink_book",
  "final_claim_ink_book",
  "final_merge_heart_demon",
  "final_lay_down_brush"
];

export const finalChoiceList: FinalChoiceDefinition[] = finalChoiceOrder.map((choiceId) => FINAL_CHOICES[choiceId]);

export const finalChoicesById: Record<FinalChoiceId, FinalChoiceDefinition> = FINAL_CHOICES;

export const characterEpiloguesById: Record<CharacterEpilogueId, CharacterEpilogueDefinition> = {
  epilogue_zhaoyun_white_dragon_return: {
    id: "epilogue_zhaoyun_white_dragon_return",
    characterId: "zhaoyun",
    title: "白龙归阵",
    summary: "赵云承认守护有边界，仍以清明之心继续持枪。",
    body: "白袍将军将无名战旗插回岸边。他没有再许下救尽天下的誓言，只把长枪指向仍能抵达的生路。"
  },
  epilogue_zhaoyun_lone_spear_breaks_army: {
    id: "epilogue_zhaoyun_lone_spear_breaks_army",
    characterId: "zhaoyun",
    title: "孤枪破军",
    summary: "赵云以极致武勇破开墨灾，却离安静越来越远。",
    body: "他冲出墨渊时，枪锋仍带火色。无人能挡那一骑白影，但每当夜雨落下，他仍会听见更远处的呼救。"
  },
  epilogue_zhaoyun_bingsha_tonggui: {
    id: "epilogue_zhaoyun_bingsha_tonggui",
    characterId: "zhaoyun",
    title: "兵煞同归",
    summary: "赵云无法放下未救之人，随兵煞回到永战不休的长坂。",
    body: "黑水重新铺成战场。赵云没有倒下，只是再也没有走出那阵马蹄声；每一次突围后，前方仍有新的旗倒下。"
  },
  epilogue_zhaoyun_changban_nameless: {
    id: "epilogue_zhaoyun_changban_nameless",
    characterId: "zhaoyun",
    title: "长坂无名",
    summary: "赵云放下名将之名，将功业归还给无数无名者。",
    body: "他把自己的名字从墨书边角抹去，只留下那些士卒、百姓和孩童的名。白龙仍在江湖，只是不再要求世人认出他。"
  },
  epilogue_diaochan_closed_moon_return: {
    id: "epilogue_diaochan_closed_moon_return",
    characterId: "diaochan",
    title: "闭月归心",
    summary: "貂蝉放下被凝视的旧局，成为自己的执笔者。",
    body: "宫灯一盏盏熄灭，她终于没有为任何人的目光起舞。折扇收拢时，月影仍在，却不再像一只锁。"
  },
  epilogue_diaochan_red_dust_scheme: {
    id: "epilogue_diaochan_red_dust_scheme",
    characterId: "diaochan",
    title: "红颜杀局",
    summary: "貂蝉以权谋反制权谋，在红尘暗线中握住刀柄。",
    body: "红绫从墨渊边缘垂入人间。那些曾把她写成棋子的人，后来都发现整座棋盘早已换了主人。"
  },
  epilogue_diaochan_heart_demon_charm: {
    id: "epilogue_diaochan_heart_demon_charm",
    characterId: "diaochan",
    title: "心魔倾城",
    summary: "貂蝉拥抱操控人心的力量，成为新的倾城心魔。",
    body: "她不再抗拒所有视线，而是让视线成为红线。凡看见她的人，都以为自己自由，却一步步走进她的舞影。"
  },
  epilogue_diaochan_nameless_freedom: {
    id: "epilogue_diaochan_nameless_freedom",
    characterId: "diaochan",
    title: "无名自由",
    summary: "貂蝉抹去史书中的名字，从此只作为自己存在。",
    body: "墨书最后只留下一抹月白。世人仍谈闭月，却再也无法把她钉回旧宴；江湖某处，有人轻声笑着合上折扇。"
  },
  epilogue_caiwenji_clear_tone_ferry: {
    id: "epilogue_caiwenji_clear_tone_ferry",
    characterId: "caiwenji",
    title: "清音渡魂",
    summary: "蔡文姬接纳悲伤，以琴声渡过墨灾亡魂。",
    body: "她没有让悲声止息，只让它们终于能被听见。琴音过处，黑水中浮起一盏盏青灯，照着亡魂归路。"
  },
  epilogue_caiwenji_broken_string_last_sound: {
    id: "epilogue_caiwenji_broken_string_last_sound",
    characterId: "caiwenji",
    title: "断弦绝响",
    summary: "蔡文姬斩断过去，换来强大而清冷的安静。",
    body: "最后一根琴弦断开，墨渊骤然无声。她走过人间时再不被亡魂牵住衣袖，只是那份安静冷得像雪。"
  },
  epilogue_caiwenji_sorrow_demon: {
    id: "epilogue_caiwenji_sorrow_demon",
    characterId: "caiwenji",
    title: "悲音成魔",
    summary: "蔡文姬沉溺旧梦，化为永奏哀歌的心魔。",
    body: "琴声没有尽头，故人也就没有真正离开。她坐在黑水中央一遍遍续曲，听众越来越多，却无人能醒。"
  },
  epilogue_caiwenji_five_tones_one: {
    id: "epilogue_caiwenji_five_tones_one",
    characterId: "caiwenji",
    title: "五音归一",
    summary: "蔡文姬将悲、怒、宁、乱与悟化为完整曲章。",
    body: "宫商角徵羽在水面合为一声。她终于明白悲伤不是归处，而是一段可以被奏完、也可以继续向前的桥。"
  },
  epilogue_zhugeliang_wolong_return: {
    id: "epilogue_zhugeliang_wolong_return",
    characterId: "zhugeliang",
    title: "卧龙归山",
    summary: "诸葛亮承认人谋有限，放下执掌全局的执棋之心。",
    body: "羽扇拂过水面，万千棋子散作山风。他仍会推演人间风雨，却不再把众生都压进一局胜负。"
  },
  epilogue_zhugeliang_borrow_wind_fate: {
    id: "epilogue_zhugeliang_borrow_wind_fate",
    characterId: "zhugeliang",
    title: "借风改命",
    summary: "诸葛亮借墨渊之力改写败局，也背下新的因果。",
    body: "东风再起时，几场本该失败的战局被吹向另一种结局。诸葛亮知道那不是天命宽恕，只是债期延后。"
  },
  epilogue_zhugeliang_fate_chess_player: {
    id: "epilogue_zhugeliang_fate_chess_player",
    characterId: "zhugeliang",
    title: "天命棋手",
    summary: "诸葛亮以秩序之名执掌墨书，将众生纳入棋局。",
    body: "他终于看见所有分支，也终于不再询问每一枚棋子的意愿。江湖因此少了混乱，也少了许多未被允许的可能。"
  },
  epilogue_zhugeliang_empty_city_clear_mind: {
    id: "epilogue_zhugeliang_empty_city_clear_mind",
    characterId: "zhugeliang",
    title: "空城明心",
    summary: "诸葛亮放下胜负，以无兵之城守住本心。",
    body: "城门大开，风穿堂而过。他没有再落子，只在空城中点一盏灯，让后来人知道此处曾有人拒绝改写一切。"
  }
};

const EPILOGUE_BY_CHARACTER_AND_ENDING: Record<string, Record<EndingId, CharacterEpilogueId>> = {
  zhaoyun: {
    ending_clear_seal: "epilogue_zhaoyun_white_dragon_return",
    ending_burn_book: "epilogue_zhaoyun_lone_spear_breaks_army",
    ending_rewrite_fate: "epilogue_zhaoyun_lone_spear_breaks_army",
    ending_heart_demon: "epilogue_zhaoyun_bingsha_tonggui",
    ending_hidden_wu: "epilogue_zhaoyun_changban_nameless"
  },
  diaochan: {
    ending_clear_seal: "epilogue_diaochan_closed_moon_return",
    ending_burn_book: "epilogue_diaochan_red_dust_scheme",
    ending_rewrite_fate: "epilogue_diaochan_red_dust_scheme",
    ending_heart_demon: "epilogue_diaochan_heart_demon_charm",
    ending_hidden_wu: "epilogue_diaochan_nameless_freedom"
  },
  caiwenji: {
    ending_clear_seal: "epilogue_caiwenji_clear_tone_ferry",
    ending_burn_book: "epilogue_caiwenji_broken_string_last_sound",
    ending_rewrite_fate: "epilogue_caiwenji_broken_string_last_sound",
    ending_heart_demon: "epilogue_caiwenji_sorrow_demon",
    ending_hidden_wu: "epilogue_caiwenji_five_tones_one"
  },
  zhugeliang: {
    ending_clear_seal: "epilogue_zhugeliang_wolong_return",
    ending_burn_book: "epilogue_zhugeliang_wolong_return",
    ending_rewrite_fate: "epilogue_zhugeliang_borrow_wind_fate",
    ending_heart_demon: "epilogue_zhugeliang_fate_chess_player",
    ending_hidden_wu: "epilogue_zhugeliang_empty_city_clear_mind"
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

  if (finalState.worldEndingId && endingsById[finalState.worldEndingId as EndingId]) {
    return endingsById[finalState.worldEndingId as EndingId];
  }

  return evaluateEnding(createEndingEvaluationInputFromRun(run));
}

export function createEndingEvaluationInputFromRun(run: RunState): EndingEvaluationInput {
  return {
    mindTendencies: normalizeMindTendencies(run.mindTendencies),
    inkHistory: createInkHistoryFromRun(run)
  };
}

export function getAvailableFinalChoices(run: RunState): FinalChoiceAvailability[] {
  const input = createEndingEvaluationInputFromRun(run);
  const choices = finalChoiceList
    .map((choice) => ({
      ...choice,
      eligible: isFinalChoiceEligible(choice.id, input),
      requirement: FINAL_CHOICE_REQUIREMENTS[choice.id]
    }))
    .filter((choice) => !choice.hidden || choice.eligible);

  if (choices.some((choice) => choice.eligible)) {
    return choices;
  }

  return choices.map((choice) => choice.id === "final_seal_moyuan"
    ? {
        ...choice,
        eligible: true,
        requirement: `${choice.requirement} 若无其它抉择可承接此局，封印为默认收束。`
      }
    : choice);
}

export function selectFinalChoice(run: RunState, choiceId: FinalChoiceId): FinalChoiceSelection | undefined {
  const choice = getAvailableFinalChoices(run).find((item) => item.id === choiceId);
  if (!choice?.eligible) {
    return undefined;
  }

  const ending = endingsById[choice.endingId];
  const characterEpilogue = selectCharacterEpilogue(run, ending.id);
  if (!characterEpilogue) {
    return undefined;
  }

  return {
    choice,
    ending,
    characterEpilogue
  };
}

export function selectCharacterEpilogue(run: Pick<RunState, "characterId">, endingId: EndingId): CharacterEpilogueDefinition | undefined {
  const epilogueId = EPILOGUE_BY_CHARACTER_AND_ENDING[run.characterId]?.[endingId] ?? EPILOGUE_BY_CHARACTER_AND_ENDING.zhaoyun[endingId];
  return characterEpiloguesById[epilogueId];
}

export function getFinalChoiceForEnding(endingId: EndingId): FinalChoiceDefinition | undefined {
  return finalChoiceList.find((choice) => choice.endingId === endingId);
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

function isFinalChoiceEligible(choiceId: FinalChoiceId, input: EndingEvaluationInput): boolean {
  const mind = normalizeMindTendencies(input.mindTendencies);
  const ink = normalizeInkHistory(input.inkHistory);

  if (choiceId === "final_lay_down_brush") {
    return qualifiesForHiddenWu(mind, ink);
  }

  if (choiceId === "final_merge_heart_demon") {
    return qualifiesForHeartDemon(mind, ink);
  }

  if (choiceId === "final_claim_ink_book") {
    return qualifiesForRewriteFate(mind, ink);
  }

  if (choiceId === "final_burn_ink_book") {
    return qualifiesForBurnBook(mind, ink);
  }

  return qualifiesForClearSeal(mind, ink);
}

function qualifiesForHiddenWu(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const extremeAttachment = Math.max(mind.nu, mind.bei, mind.mei, mind.luan);
  return mind.wu >= 8 && extremeAttachment <= 5 && ink.totalGained <= 2 && ink.highestInCombat <= 2 && ink.disasterCardsPlayed === 0;
}

function qualifiesForClearSeal(mind: EndingEvaluationInput["mindTendencies"], ink: InkHistory): boolean {
  const calmInsight = mind.ning + mind.wu >= 4;
  const inkHasNotTakenOver = ink.totalGained < 10 && ink.highestInCombat < 5 && ink.disasterCardsPlayed < 4;
  return calmInsight && inkHasNotTakenOver;
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
