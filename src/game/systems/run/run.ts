import { cardsById } from "../../content/cards";
import { charactersById } from "../../content/characters";
import { relicsById } from "../../content/relics";
import type { CardArchetypeId, CardDefinition } from "../combat/types";
import type { BattleSpoils, CardRewardDraft, CreateRunOptions, MapNode, MapNodeType, RunState } from "./types";

const RELIC_REWARD_POOL = ["relic_old_wooden_sword", "relic_black_paper_umbrella"];
const ZHAO_REWARD_POOL = [
  "zhao_thrust",
  "zhao_guardian",
  "zhao_white_dragon",
  "zhao_white_horse_breakout",
  "zhao_return_spear",
  "zhao_break_spear",
  "zhao_river_guard",
  "zhao_spear_wall",
  "zhao_seven_entries"
];
const DIAO_REWARD_POOL = [
  "diao_hongyan",
  "diao_glance",
  "diao_red_ribbon",
  "diao_flying_sleeves",
  "diao_lijian",
  "diao_step_lotus",
  "diao_lotus_blade",
  "diao_mirror_flower",
  "diao_jinghong_strike"
];
const ELITE_ZHAO_REWARD_POOL = ["zhao_qixing_spear", "zhao_seven_entries", "zhao_spear_wall", "zhao_break_spear", "zhao_single_rider"];
const ELITE_DIAO_REWARD_POOL = ["diao_closed_moon", "diao_jinghong_strike", "diao_mirror_flower", "diao_step_lotus", "diao_red_ribbon"];
const COMMON_REWARD_POOL = [
  "common_pifeng",
  "common_duanzhu",
  "common_gedang",
  "common_xieli",
  "common_tuna",
  "common_qingshen",
  "mind_jingxin",
  "mind_nuzhan",
  "common_mirror_armor"
];

const ARCHETYPE_LABELS: Record<CardArchetypeId, string> = {
  "zhao-spear-chain": "连斩枪势流",
  "zhao-guardian-counter": "护主防反流",
  "diao-dance-chain": "舞势连击流",
  "diao-charm-control": "魅惑控制流"
};

const COMBO_ARCHETYPE_PREFERENCES: Record<string, Partial<Record<string, CardArchetypeId>>> = {
  zhaoyun: {
    lianzhan: "zhao-spear-chain",
    duanzhao: "zhao-spear-chain",
    xinren: "zhao-spear-chain",
    moxi: "zhao-spear-chain",
    xushi: "zhao-guardian-counter",
    jingshou: "zhao-guardian-counter",
    gushou: "zhao-guardian-counter"
  },
  diaochan: {
    lianzhan: "diao-dance-chain",
    zhuiying: "diao-dance-chain",
    duanzhao: "diao-dance-chain",
    moxi: "diao-dance-chain",
    xushi: "diao-charm-control",
    jingshou: "diao-charm-control",
    xinren: "diao-charm-control",
    gushou: "diao-charm-control"
  }
};

interface ComboRewardRule {
  id: string;
  name: string;
  hint: string;
  byCharacter?: Partial<Record<string, string[]>>;
  cardIds: string[];
}

interface ComboRewardBias {
  comboId: string;
  comboName: string;
  hint: string;
  primaryCardId: string;
  candidateCardIds: string[];
}

const COMBO_REWARD_RULES: ComboRewardRule[] = [
  {
    id: "lianzhan",
    name: "连斩",
    hint: "奖励池偏向低费攻击与连击抽牌。",
    byCharacter: {
      zhaoyun: ["zhao_white_dragon"],
      diaochan: ["diao_sleeve_blade", "diao_jinghong_strike"]
    },
    cardIds: ["common_feishi", "zhao_seven_entries", "zhao_qixing_spear"]
  },
  {
    id: "xushi",
    name: "蓄势",
    hint: "奖励池偏向技法起手和攻势衔接。",
    byCharacter: {
      zhaoyun: ["zhao_river_guard", "zhao_return_spear"],
      diaochan: ["diao_red_ribbon", "diao_lijian"]
    },
    cardIds: ["common_tuna", "common_gedang"]
  },
  {
    id: "zhuiying",
    name: "追影",
    hint: "奖励池偏向身法入攻和位移追击。",
    byCharacter: {
      diaochan: ["diao_lotus_blade"],
      zhaoyun: ["zhao_thrust", "zhao_white_horse_breakout"]
    },
    cardIds: ["common_zhuiying", "diao_flying_sleeves", "common_qingshen"]
  },
  {
    id: "jingshou",
    name: "静守",
    hint: "奖励池偏向心境防守与稳态护甲。",
    byCharacter: {
      zhaoyun: ["zhao_spear_wall"],
      diaochan: ["diao_mirror_flower"]
    },
    cardIds: ["mind_jingxin", "common_mirror_armor", "common_tuna"]
  },
  {
    id: "xinren",
    name: "心刃",
    hint: "奖励池偏向心境切入与攻势爆发。",
    byCharacter: {
      zhaoyun: ["zhao_seven_entries"],
      diaochan: ["diao_lijian"]
    },
    cardIds: ["mind_nuzhan", "common_feishi", "zhao_white_dragon"]
  },
  {
    id: "gushou",
    name: "固守",
    hint: "奖励池偏向连续技法与高护甲牌。",
    byCharacter: {
      zhaoyun: ["zhao_guardian", "zhao_spear_wall"],
      diaochan: ["diao_glance", "diao_mirror_flower"]
    },
    cardIds: ["common_mirror_armor", "common_gedang"]
  },
  {
    id: "moxi",
    name: "墨袭",
    hint: "奖励池打开墨灾特供牌，偏向墨痕攻势。",
    cardIds: ["ink_modian", "mind_luanxin", "ink_moren", "ink_luoshui_tide"]
  },
  {
    id: "duanzhao",
    name: "断招",
    hint: "奖励池偏向消耗牌和低费补牌。",
    cardIds: ["common_feishi", "common_qingshen", "diao_sleeve_blade"]
  }
];

export function createRun(characterId: string, options: CreateRunOptions = {}): RunState {
  const character = charactersById[characterId];
  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  const mapSeed = options.mapSeed ?? 0;

  const deck = character.starterDeck.map((cardId, index) => ({
    instanceId: `run-card-${index + 1}`,
    cardId
  }));

  return {
    characterId,
    mapSeed,
    hp: character.maxHp,
    maxHp: character.maxHp,
    gold: 99,
    deck,
    relicIds: [getStartingRelicId(characterId)],
    mapNodes: createChapterOneMap(characterId, mapSeed),
    currentNodeId: "start",
    visitedNodeIds: [],
    nextDeckInstanceNumber: deck.length + 1,
    rewardHistory: [],
    lastCombatComboTriggers: [],
    comboRewardHistory: []
  };
}

export function recordRunCombatCombos(run: RunState, comboTriggers: string[]): RunState {
  normalizeRunComboFields(run);
  run.lastCombatComboTriggers = comboTriggers.filter(Boolean);

  if (run.lastCombatComboTriggers.length > 0) {
    run.comboRewardHistory.push(...run.lastCombatComboTriggers);
    if (run.comboRewardHistory.length > 24) {
      run.comboRewardHistory.splice(0, run.comboRewardHistory.length - 24);
    }
  }

  return run;
}

export function createCardRewardDraft(run: RunState, nodeType: MapNodeType = "battle"): CardRewardDraft {
  normalizeRunComboFields(run);
  const comboBias = getComboRewardBias(run);
  const offset = run.rewardHistory.length;
  const cards: CardDefinition[] = [];

  if (comboBias) {
    addCardsById(cards, comboBias.candidateCardIds.slice(0, 2));
  }

  if (nodeType === "elite" || nodeType === "boss") {
    addRotatedCards(cards, getEliteRewardPool(run.characterId), offset, 1);
  }

  addRotatedCards(cards, getRoleRewardPool(run.characterId), offset + (comboBias ? 1 : 0), 1);
  addRotatedCards(cards, COMMON_REWARD_POOL, offset + cards.length, 3);
  addRotatedCards(cards, getRoleRewardPool(run.characterId), offset + cards.length + 1, 3);

  const rewardCards = cards.slice(0, 3);

  return {
    cards: rewardCards,
    comboId: comboBias?.comboId,
    comboName: comboBias?.comboName,
    comboHint: comboBias?.hint,
    comboPrimaryCardId: comboBias?.primaryCardId,
    reasons: createCardRewardReasonMap(run, rewardCards)
  };
}

export function createRewardCards(run: RunState, nodeType: MapNodeType = "battle"): CardDefinition[] {
  return createCardRewardDraft(run, nodeType).cards;
}

export function getComboRewardHint(run: RunState): string | undefined {
  return getComboRewardBias(run)?.hint;
}

export function getComboRewardPrimaryCardId(run: RunState): string | undefined {
  return getComboRewardBias(run)?.primaryCardId;
}

export function createCardRewardReasonMap(run: RunState, cards: CardDefinition[]): Record<string, string> {
  const comboBias = getComboRewardBias(run);
  const preferredArchetype = comboBias ? getComboPreferredArchetype(run.characterId, comboBias.comboId) : undefined;
  const reasons: Record<string, string> = {};

  for (const card of cards) {
    reasons[card.id] = createCardRewardReason(card, comboBias, preferredArchetype);
  }

  return reasons;
}

export function addRelic(run: RunState, relicId: string): boolean {
  if (!relicsById[relicId]) {
    throw new Error(`Unknown relic: ${relicId}`);
  }

  if (run.relicIds.includes(relicId)) {
    return false;
  }

  run.relicIds.push(relicId);
  return true;
}

export function hasRunRelic(run: RunState, relicId: string): boolean {
  return run.relicIds.includes(relicId);
}

export function getNextRelicReward(run: RunState, pool: string[] = RELIC_REWARD_POOL): string | undefined {
  return pool.find((relicId) => !run.relicIds.includes(relicId));
}

export function claimRelicReward(run: RunState, pool: string[] = RELIC_REWARD_POOL): string | undefined {
  const relicId = getNextRelicReward(run, pool);
  if (!relicId) {
    return undefined;
  }

  addRelic(run, relicId);
  return relicId;
}

export function claimBattleSpoils(run: RunState, nodeType: MapNodeType): BattleSpoils {
  const gold = getBattleGold(nodeType);
  const relicId = nodeType === "elite" || nodeType === "boss" ? claimRelicReward(run) : undefined;
  run.gold += gold;

  return relicId ? { gold, relicId } : { gold };
}

export function getCurrentNode(run: RunState): MapNode {
  const node = run.mapNodes.find((item) => item.id === run.currentNodeId);
  if (!node) {
    throw new Error(`Current node missing: ${run.currentNodeId}`);
  }

  return node;
}

export function getAvailableNodes(run: RunState): MapNode[] {
  const current = getCurrentNode(run);
  return current.connections.map((id) => getNode(run, id));
}

export function travelToNode(run: RunState, nodeId: string): RunState {
  const current = getCurrentNode(run);
  if (!current.connections.includes(nodeId)) {
    throw new Error(`Cannot travel from ${current.id} to ${nodeId}`);
  }

  if (!run.visitedNodeIds.includes(current.id)) {
    run.visitedNodeIds.push(current.id);
  }

  run.currentNodeId = nodeId;
  return run;
}

export function takeCardReward(run: RunState, card: CardDefinition): RunState {
  run.deck.push({
    instanceId: `run-card-${run.nextDeckInstanceNumber}`,
    cardId: card.id
  });
  run.nextDeckInstanceNumber += 1;
  run.rewardHistory.push(card.id);
  return run;
}

export function healRun(run: RunState, amount: number): number {
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + amount);
  return run.hp - before;
}

export function removeDeckCard(run: RunState, instanceId: string): boolean {
  const index = run.deck.findIndex((entry) => entry.instanceId === instanceId);
  if (index < 0) {
    return false;
  }

  run.deck.splice(index, 1);
  return true;
}

export function getRunDeckCardDefinitions(run: RunState): CardDefinition[] {
  return run.deck.map((entry) => {
    const card = cardsById[entry.cardId];
    if (!card) {
      throw new Error(`Unknown run deck card: ${entry.cardId}`);
    }

    return card;
  });
}

export function getUpgradeCandidates(run: RunState): RunState["deck"] {
  return run.deck.filter((entry) => !entry.upgraded);
}

export function upgradeDeckCard(run: RunState, instanceId: string): boolean {
  const entry = run.deck.find((item) => item.instanceId === instanceId);
  if (!entry || entry.upgraded) {
    return false;
  }

  entry.upgraded = true;
  return true;
}

function getComboRewardBias(run: RunState): ComboRewardBias | undefined {
  normalizeRunComboFields(run);
  const rule = getLatestComboRewardRule(run.lastCombatComboTriggers);
  if (!rule) {
    return undefined;
  }

  const candidateCardIds = getComboCandidateCardIds(rule, run.characterId).filter((cardId) => Boolean(cardsById[cardId]));
  const primaryCardId = candidateCardIds[0];
  if (!primaryCardId) {
    return undefined;
  }

  return {
    comboId: rule.id,
    comboName: rule.name,
    hint: `招式回响：${rule.name}，${rule.hint}`,
    primaryCardId,
    candidateCardIds
  };
}

function getComboPreferredArchetype(characterId: string, comboId: string): CardArchetypeId | undefined {
  return COMBO_ARCHETYPE_PREFERENCES[characterId]?.[comboId];
}

function createCardRewardReason(
  card: CardDefinition,
  comboBias: ComboRewardBias | undefined,
  preferredArchetype: CardArchetypeId | undefined
): string {
  const cardArchetypes = card.archetypes ?? [];

  if (preferredArchetype && cardArchetypes.includes(preferredArchetype)) {
    return `推荐：契合${ARCHETYPE_LABELS[preferredArchetype]}这一流派，承接${comboBias?.comboName ?? "当前"}招式。`;
  }

  if (cardArchetypes.length > 0) {
    return `推荐：补强${ARCHETYPE_LABELS[cardArchetypes[0]]}这一流派。`;
  }

  if (comboBias && comboBias.candidateCardIds.includes(card.id)) {
    return `推荐：承接${comboBias.comboName}招式回响，补足当前流派节奏。`;
  }

  if (card.types.includes("attack")) {
    return "推荐：补足输出密度，保持流派进攻节奏。";
  }

  if (card.types.includes("body")) {
    return "推荐：补足身法起手，帮助流派招式链转动。";
  }

  if (card.types.includes("mind")) {
    return "推荐：补足心境入口，增加流派攻防转向。";
  }

  if (card.rarity === "ink" || card.types.includes("ink")) {
    return "推荐：墨灾高收益入口，注意墨痕代价。";
  }

  return "推荐：补足防御与过牌，稳住第一章流派节奏。";
}

function getLatestComboRewardRule(comboTriggers: string[]): ComboRewardRule | undefined {
  for (let index = comboTriggers.length - 1; index >= 0; index -= 1) {
    const rule = COMBO_REWARD_RULES.find((item) => item.id === comboTriggers[index]);
    if (rule) {
      return rule;
    }
  }

  return undefined;
}

function getComboCandidateCardIds(rule: ComboRewardRule, characterId: string): string[] {
  return [...(rule.byCharacter?.[characterId] ?? []), ...rule.cardIds];
}

function addCardsById(cards: CardDefinition[], cardIds: string[]): void {
  for (const cardId of cardIds) {
    const card = cardsById[cardId];
    if (card && !cards.some((item) => item.id === card.id)) {
      cards.push(card);
    }
  }
}

function addRotatedCards(cards: CardDefinition[], cardIds: string[], offset: number, desiredCount: number): void {
  if (cardIds.length === 0 || cards.length >= desiredCount) {
    return;
  }

  for (let index = 0; index < cardIds.length && cards.length < desiredCount; index += 1) {
    const cardId = cardIds[(offset + index) % cardIds.length];
    addCardsById(cards, [cardId]);
  }
}

function getRoleRewardPool(characterId: string): string[] {
  return characterId === "diaochan" ? DIAO_REWARD_POOL : ZHAO_REWARD_POOL;
}

function getEliteRewardPool(characterId: string): string[] {
  return characterId === "diaochan" ? ELITE_DIAO_REWARD_POOL : ELITE_ZHAO_REWARD_POOL;
}

function normalizeRunComboFields(run: RunState): void {
  if (!Array.isArray(run.lastCombatComboTriggers)) {
    run.lastCombatComboTriggers = [];
  }

  if (!Array.isArray(run.comboRewardHistory)) {
    run.comboRewardHistory = [];
  }
}

function getNode(run: RunState, nodeId: string): MapNode {
  const node = run.mapNodes.find((item) => item.id === nodeId);
  if (!node) {
    throw new Error(`Map node missing: ${nodeId}`);
  }

  return node;
}

function getStartingRelicId(characterId: string): string {
  if (characterId === "diaochan") {
    return "relic_closed_moon_sachet";
  }

  return "relic_white_dragon_tassel";
}

function getBattleGold(nodeType: MapNodeType): number {
  if (nodeType === "elite") {
    return 25;
  }

  if (nodeType === "boss") {
    return 50;
  }

  return nodeType === "battle" ? 12 : 0;
}

function createChapterOneMap(characterId: string, mapSeed: number): MapNode[] {
  const firstEvent = getCharacterEventNode(characterId);
  const eliteEnemyId = mapSeed % 2 === 0 ? "elite_sword_echo" : "elite_blood_banner";
  const secondEliteEnemyId = mapSeed % 5 === 0 ? "elite_blood_banner" : "elite_sword_echo";
  const secondBattleEnemyId = mapSeed % 4 === 1 ? "enemy_paper_umbrella" : "enemy_faceless_soldier";
  const thirdBattleEnemyId = mapSeed % 3 === 2 ? "enemy_faceless_soldier" : "enemy_paper_umbrella";
  const sideBattleEnemyId = mapSeed % 2 === 0 ? "enemy_ink_bandit" : "enemy_faceless_soldier";
  const lateEventId = mapSeed % 2 === 0 ? "event_black_rain_ferry" : firstEvent.eventId;

  return [
    {
      id: "start",
      type: "start",
      label: "黑雨渡口",
      floor: 0,
      lane: 1,
      connections: ["battle-1", "event-1", "battle-side-1"]
    },
    {
      id: "battle-1",
      type: "battle",
      label: "墨化山贼",
      floor: 1,
      lane: 0,
      enemyId: "enemy_ink_bandit",
      connections: ["shop-1", "battle-2"]
    },
    {
      id: "event-1",
      type: "event",
      label: firstEvent.label,
      floor: 1,
      lane: 1,
      eventId: firstEvent.eventId,
      connections: ["battle-2", "rest-1"]
    },
    {
      id: "battle-side-1",
      type: "battle",
      label: sideBattleEnemyId === "enemy_ink_bandit" ? "雨巷山贼" : "无面游兵",
      floor: 1,
      lane: 2,
      enemyId: sideBattleEnemyId,
      connections: ["event-2", "shop-1"]
    },
    {
      id: "shop-1",
      type: "shop",
      label: "茶亭游商",
      floor: 2,
      lane: 0,
      connections: ["elite-1", "rest-1"]
    },
    {
      id: "battle-2",
      type: "battle",
      label: secondBattleEnemyId === "enemy_paper_umbrella" ? "纸伞巡夜" : "无面兵卒",
      floor: 2,
      lane: 1,
      enemyId: secondBattleEnemyId,
      connections: ["rest-1", "battle-3"]
    },
    {
      id: "event-2",
      type: "event",
      label: lateEventId === "event_black_rain_ferry" ? "黑雨渡口" : firstEvent.label,
      floor: 2,
      lane: 2,
      eventId: lateEventId,
      connections: ["battle-2b", "rest-1"]
    },
    {
      id: "elite-1",
      type: "elite",
      label: eliteEnemyId === "elite_sword_echo" ? "剑痴残影" : "血旗都尉",
      floor: 3,
      lane: 0,
      enemyId: eliteEnemyId,
      connections: ["elite-2", "battle-3"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "废寺静修",
      floor: 3,
      lane: 1,
      connections: ["battle-3", "event-3"]
    },
    {
      id: "battle-2b",
      type: "battle",
      label: "墨潮伏兵",
      floor: 3,
      lane: 2,
      enemyId: mapSeed % 3 === 0 ? "enemy_paper_umbrella" : "enemy_ink_bandit",
      connections: ["battle-3", "event-3"]
    },
    {
      id: "elite-2",
      type: "elite",
      label: secondEliteEnemyId === "elite_sword_echo" ? "剑痴残影" : "血旗都尉",
      floor: 4,
      lane: 0,
      enemyId: secondEliteEnemyId,
      connections: ["boss"]
    },
    {
      id: "battle-3",
      type: "battle",
      label: thirdBattleEnemyId === "enemy_paper_umbrella" ? "纸伞女鬼" : "无面伏兵",
      floor: 4,
      lane: 1,
      enemyId: thirdBattleEnemyId,
      connections: ["boss"]
    },
    {
      id: "event-3",
      type: "event",
      label: "墨碑听潮",
      floor: 4,
      lane: 2,
      eventId: "event_black_rain_ferry",
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "墨影董卓",
      floor: 5,
      lane: 1,
      enemyId: "boss_ink_dongzhuo",
      connections: []
    }
  ];
}

function getCharacterEventNode(characterId: string): { label: string; eventId: string } {
  if (characterId === "zhaoyun") {
    return { label: "长坂回声", eventId: "event_changban_echo" };
  }

  if (characterId === "diaochan") {
    return { label: "宫灯旧宴", eventId: "event_palace_lantern_banquet" };
  }

  return { label: "黑雨渡口", eventId: "event_black_rain_ferry" };
}
