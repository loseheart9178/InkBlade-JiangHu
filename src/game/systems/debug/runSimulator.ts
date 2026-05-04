import { cardList, cardsById } from "../../content/cards";
import { charactersById } from "../../content/characters";
import { chaptersById, type ChapterId } from "../../content/chapters";
import { enemiesById, enemyList, type ChapterEnemyDefinition } from "../../content/enemies";
import { createCombat, endPlayerTurn, playCard } from "../combat/combat";
import type { CardDefinition, CardEffect, CardInstance, CombatState, EnemyIntent, EnemyState } from "../combat/types";
import {
  addRelic,
  advanceToNextChapter,
  claimBattleSpoils,
  claimChapterReward,
  createCardRewardDraft,
  createRun,
  createRunCompletionSnapshot,
  getRunFinalState,
  getUpgradeCandidates,
  healRun,
  recordRunCombatCombos,
  takeCardReward,
  travelToNode,
  upgradeDeckCard
} from "../run/run";
import type { MapNodeType, RunCompletionSnapshot, RunDeckEntry, RunFinalState, RunState } from "../run/types";
import { createDebugRun } from "./debugRun";

export type BattlePlanOutcome = "victory" | "defeat" | "timeout" | "missing-enemy";
export type FullRouteOutcome = "completed" | BattlePlanOutcome | "route-error";

export interface BattlePlanOptions {
  maxTurns?: number;
  preferDefenseAtIncomingDamage?: number;
  unsafeDamageTaken?: number;
  rngSeed?: number;
  maxCardsPerTurn?: number;
}

export interface BattlePlanResult {
  outcome: BattlePlanOutcome;
  chapterId: string;
  characterId: string;
  enemyId: string;
  enemyName?: string;
  turns: number;
  damageTaken: number;
  maxDamageTakenInTurn: number;
  cardsPlayed: number;
  warnings: string[];
  finalPlayerHp: number;
  enemyHpRemaining: number;
  comboTriggers: string[];
}

export interface RunPacingSummary {
  encounters: BattlePlanResult[];
  warnings: string[];
  averageTurnsByChapter: Record<string, number>;
  averageDamageTakenByChapter: Record<string, number>;
}

export interface FullRouteOptions extends BattlePlanOptions {
  mapSeed?: number;
}

export interface FullRouteResult {
  outcome: FullRouteOutcome;
  characterId: string;
  encounters: BattlePlanResult[];
  warnings: string[];
  completedChapterIds: ChapterId[];
  routeNodeIds: string[];
  finalPlayerHp: number;
  finalMaxHp: number;
  finalState?: RunFinalState;
  snapshot?: RunCompletionSnapshot;
}

const DEFAULT_MAX_TURNS = 45;
const DEFAULT_DEFENSE_THRESHOLD = 10;
const DEFAULT_UNSAFE_DAMAGE = 24;
const DEFAULT_MAX_CARDS_PER_TURN = 18;

export function simulateBattlePlan(run: RunState, enemyId: string, options: BattlePlanOptions = {}): BattlePlanResult {
  const enemy = enemiesById[enemyId];
  if (!enemy) {
    return createMissingEnemyResult(run, enemyId);
  }

  const character = charactersById[run.characterId];
  if (!character) {
    return createMissingCharacterResult(run, enemy);
  }

  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const unsafeDamageTaken = options.unsafeDamageTaken ?? DEFAULT_UNSAFE_DAMAGE;
  const combat = createCombat({
    character: {
      ...character,
      maxHp: run.maxHp,
      starterDeck: getRunDeckCardIds(run)
    },
    cards: cardList,
    enemies: [enemy],
    playerHp: Math.min(run.hp, run.maxHp),
    upgradedCardInstanceIds: getUpgradedStarterInstanceIds(run.deck),
    rngSeed: options.rngSeed ?? createSimulationSeed(run, enemyId),
    relicIds: [...run.relicIds],
    methodIds: [...run.methodIds],
    methodLevels: { ...(run.methodLevels ?? {}) }
  });

  const initialHp = combat.player.hp;
  let turns = 0;
  let cardsPlayed = 0;
  let maxDamageTakenInTurn = 0;

  while (combat.phase === "player" && turns < maxTurns) {
    const cardsPlayedThisTurn = playPlayerTurn(combat, options);
    cardsPlayed += cardsPlayedThisTurn;
    turns += 1;

    if (combat.phase !== "player") {
      break;
    }

    const hpBeforeEnemyTurn = combat.player.hp;
    endPlayerTurn(combat);
    maxDamageTakenInTurn = Math.max(maxDamageTakenInTurn, Math.max(0, hpBeforeEnemyTurn - combat.player.hp));
  }

  const outcome = getOutcome(combat);
  const damageTaken = Math.max(0, initialHp - combat.player.hp);
  const warnings = createBattleWarnings({
    outcome,
    chapterId: run.chapterId,
    characterId: run.characterId,
    enemyId,
    maxDamageTakenInTurn,
    unsafeDamageTaken
  });

  return {
    outcome,
    chapterId: run.chapterId,
    characterId: run.characterId,
    enemyId,
    enemyName: enemy.name,
    turns,
    damageTaken,
    maxDamageTakenInTurn,
    cardsPlayed,
    warnings,
    finalPlayerHp: combat.player.hp,
    enemyHpRemaining: getAliveEnemyHp(combat),
    comboTriggers: [...combat.comboTriggersThisCombat]
  };
}

export function summarizeRunPacing(
  chapterIds: string[],
  characterIds: string[],
  options: BattlePlanOptions = {}
): RunPacingSummary {
  const encounters: BattlePlanResult[] = [];
  const warnings: string[] = [];

  for (const chapterId of chapterIds) {
    if (!isChapterId(chapterId)) {
      warnings.push(`missing chapter: ${chapterId}`);
      continue;
    }

    const chapterEnemies = enemyList.filter((enemy) => enemy.chapter === chapterId);
    if (chapterEnemies.length === 0) {
      warnings.push(`missing enemy pool: ${chapterId}`);
      continue;
    }

    for (const characterId of characterIds) {
      if (!charactersById[characterId]) {
        warnings.push(`missing character: ${characterId}`);
        continue;
      }

      const run = createPacingRun(chapterId, characterId);
      for (const enemy of chapterEnemies) {
        const result = simulateBattlePlan(run, enemy.id, options);
        encounters.push(result);
        warnings.push(...result.warnings);
      }
    }
  }

  return {
    encounters,
    warnings,
    averageTurnsByChapter: averageByChapter(encounters, (result) => result.turns),
    averageDamageTakenByChapter: averageByChapter(encounters, (result) => result.damageTaken)
  };
}

export function simulateFullRoute(characterId: string, options: FullRouteOptions = {}): FullRouteResult {
  if (!charactersById[characterId]) {
    return {
      outcome: "missing-enemy",
      characterId,
      encounters: [],
      warnings: [`missing character: ${characterId}`],
      completedChapterIds: [],
      routeNodeIds: [],
      finalPlayerHp: 0,
      finalMaxHp: 0
    };
  }

  const run = createRun(characterId, { mapSeed: options.mapSeed ?? 9001 });
  const encounters: BattlePlanResult[] = [];
  const warnings: string[] = [];
  const routeNodeIds: string[] = [];

  while (true) {
    applyChapterEntryRouteGrowth(run);
    const route = getAlphaRouteNodeIds(run.chapterId);
    for (const nodeId of route) {
      const node = run.mapNodes.find((item) => item.id === nodeId);
      if (!node) {
        warnings.push(`missing route node: ${run.chapterId}/${nodeId}`);
        return createFullRouteResult("route-error", run, characterId, encounters, warnings, routeNodeIds);
      }

      try {
        travelToNode(run, nodeId);
      } catch {
        warnings.push(`unreachable route node: ${run.chapterId}/${run.currentNodeId}->${nodeId}`);
        return createFullRouteResult("route-error", run, characterId, encounters, warnings, routeNodeIds);
      }

      routeNodeIds.push(`${run.chapterId}:${nodeId}`);

      if (node.type === "rest") {
        applyRestRouteChoice(run);
        continue;
      }

      if (node.type === "event") {
        applyEventRouteChoice(run);
        continue;
      }

      if (node.type === "shop") {
        applyShopRouteChoice(run);
        continue;
      }

      if (!isCombatNodeType(node.type)) {
        continue;
      }

      if (!node.enemyId) {
        warnings.push(`missing node enemy: ${run.chapterId}/${node.id}`);
        return createFullRouteResult("missing-enemy", run, characterId, encounters, warnings, routeNodeIds);
      }

      const result = simulateBattlePlan(run, node.enemyId, options);
      encounters.push(result);
      warnings.push(...result.warnings);
      run.hp = result.finalPlayerHp;

      if (result.outcome !== "victory") {
        return createFullRouteResult(result.outcome, run, characterId, encounters, warnings, routeNodeIds);
      }

      recordRunCombatCombos(run, result.comboTriggers);
      claimBattleSpoils(run, node.type);
      applyBattleRouteReward(run, node.type);
    }

    const advanced = advanceToNextChapter(run);
    if (!advanced) {
      const snapshot = createRunCompletionSnapshot(run);
      return createFullRouteResult(snapshot ? "completed" : "route-error", run, characterId, encounters, warnings, routeNodeIds, snapshot);
    }
  }
}

function playPlayerTurn(state: CombatState, options: BattlePlanOptions): number {
  const maxCardsPerTurn = options.maxCardsPerTurn ?? DEFAULT_MAX_CARDS_PER_TURN;
  let cardsPlayed = 0;

  while (state.phase === "player" && cardsPlayed < maxCardsPerTurn) {
    const choice = chooseNextCard(state, options);
    if (!choice) {
      break;
    }

    const result = playCard(state, choice.card.instanceId, choice.targetId);
    if (!result.ok) {
      break;
    }

    cardsPlayed += 1;
  }

  return cardsPlayed;
}

function chooseNextCard(state: CombatState, options: BattlePlanOptions): { card: CardInstance; targetId: string } | undefined {
  const playable = getPlayableCards(state);
  if (playable.length === 0) {
    return undefined;
  }

  const enemy = getPrimaryEnemy(state);
  const lethalAttack = enemy
    ? playable.find(({ card, definition }) => definition.types.includes("attack") && estimateCardDamage(state, card, definition) >= enemy.hp + enemy.block)
    : undefined;
  if (lethalAttack && enemy) {
    return { card: lethalAttack.card, targetId: enemy.id };
  }

  const incomingDamage = Math.max(0, estimateIncomingDamage(state) - state.player.block);
  const latePressureAttack = enemy && state.turn >= 8 && incomingDamage <= (options.unsafeDamageTaken ?? DEFAULT_UNSAFE_DAMAGE)
    ? getBestAttackCard(state, playable)
    : undefined;
  if (latePressureAttack && enemy) {
    return { card: latePressureAttack.card, targetId: enemy.id };
  }

  const defenseThreshold = options.preferDefenseAtIncomingDamage ?? DEFAULT_DEFENSE_THRESHOLD;
  if (incomingDamage >= defenseThreshold) {
    const defensiveCard = getBestDefensiveCard(playable);
    if (defensiveCard) {
      return { card: defensiveCard.card, targetId: getTargetId(state, defensiveCard.definition) };
    }
  }

  const cleanseCard = hasCleanseTargets(state) ? getBestCleanseCard(playable) : undefined;
  if (cleanseCard) {
    return { card: cleanseCard.card, targetId: getTargetId(state, cleanseCard.definition) };
  }

  const setupCard = getBestSetupCard(state, playable);
  if (setupCard) {
    return { card: setupCard.card, targetId: getTargetId(state, setupCard.definition) };
  }

  const pressureAttack = enemy ? getBestAttackCard(state, playable) : undefined;
  if (pressureAttack && enemy) {
    return { card: pressureAttack.card, targetId: enemy.id };
  }

  const utilityCard = getBestUtilityCard(playable);
  if (utilityCard) {
    return { card: utilityCard.card, targetId: getTargetId(state, utilityCard.definition) };
  }

  const blockCard = getBestDefensiveCard(playable);
  if (blockCard) {
    return { card: blockCard.card, targetId: getTargetId(state, blockCard.definition) };
  }

  const fallback = playable[0];
  return { card: fallback.card, targetId: getTargetId(state, fallback.definition) };
}

function getPlayableCards(state: CombatState): Array<{ card: CardInstance; definition: CardDefinition }> {
  return state.piles.hand
    .map((card) => ({ card, definition: state.cardDefinitions[card.definitionId] }))
    .filter(({ definition }) => Boolean(definition))
    .filter(({ card, definition }) => state.player.energy >= getCardCost(card, definition))
    .filter(({ definition }) => definition.target !== "enemy" || Boolean(getPrimaryEnemy(state)));
}

function getBestBlockCard(cards: Array<{ card: CardInstance; definition: CardDefinition }>): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards
    .filter(({ definition }) => hasAnyEffect(definition, ["block"]))
    .sort((left, right) => getBlockAmount(right.definition) - getBlockAmount(left.definition))[0];
}

function getBestDefensiveCard(cards: Array<{ card: CardInstance; definition: CardDefinition }>): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards
    .filter(({ definition }) => getDefensiveScore(definition) > 0)
    .sort((left, right) => getDefensiveScore(right.definition) - getDefensiveScore(left.definition))[0];
}

function getBestAttackCard(
  state: CombatState,
  cards: Array<{ card: CardInstance; definition: CardDefinition }>
): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards
    .filter(({ definition }) => definition.types.includes("attack"))
    .sort((left, right) => estimateCardDamage(state, right.card, right.definition) - estimateCardDamage(state, left.card, left.definition))[0];
}

function getBestUtilityCard(cards: Array<{ card: CardInstance; definition: CardDefinition }>): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards
    .filter(({ definition }) => hasAnyEffect(definition, ["draw", "cleanseCards", "scry", "setFormation", "gainResource"]))
    .sort((left, right) => getUtilityScore(right.definition) - getUtilityScore(left.definition))[0];
}

function getBestCleanseCard(cards: Array<{ card: CardInstance; definition: CardDefinition }>): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards
    .filter(({ definition }) => hasAnyEffect(definition, ["cleanseCards"]))
    .sort((left, right) => getUtilityScore(right.definition) - getUtilityScore(left.definition))[0];
}

function getBestSetupCard(
  state: CombatState,
  cards: Array<{ card: CardInstance; definition: CardDefinition }>
): { card: CardInstance; definition: CardDefinition } | undefined {
  return cards.find(({ definition }) => {
    if (definition.cost > 1) {
      return false;
    }

    return getDefinitionEffects(definition).some((effect) => {
      if (effect.action === "setFormation") {
        return state.activeFormation?.id !== effect.formation;
      }

      if (effect.action === "draw") {
        return state.player.energy > definition.cost;
      }

      return effect.action === "scry" && definition.cost === 0;
    });
  });
}

function getTargetId(state: CombatState, definition: CardDefinition): string {
  if (definition.target === "enemy") {
    return getPrimaryEnemy(state)?.id ?? "enemy-1";
  }

  return "player";
}

function getPrimaryEnemy(state: CombatState): EnemyState | undefined {
  return state.enemies.find((enemy) => enemy.hp > 0);
}

function getAliveEnemyHp(state: CombatState): number {
  return state.enemies.reduce((total, enemy) => total + Math.max(0, enemy.hp), 0);
}

function estimateIncomingDamage(state: CombatState): number {
  return state.enemies
    .filter((enemy) => enemy.hp > 0)
    .reduce((total, enemy) => total + estimateIntentDamage(enemy.currentIntent, enemy), 0);
}

function estimateIntentDamage(intent: EnemyIntent, enemy: EnemyState): number {
  if (intent.type === "attack") {
    return estimateEnemyDamage(enemy, intent.damage) * intent.hits;
  }

  if (intent.type === "special") {
    return intent.effects.reduce((total, effect) => {
      if (effect.action !== "damage") {
        return total;
      }

      return total + estimateEnemyDamage(enemy, effect.amount) * (effect.hits ?? 1);
    }, 0);
  }

  return 0;
}

function estimateEnemyDamage(enemy: EnemyState, baseDamage: number): number {
  const charm = enemy.statuses.charm ?? 0;
  const weak = enemy.statuses.weak ?? 0;
  const charmMultiplier = Math.max(0.5, 1 - charm * 0.05);
  const weakMultiplier = weak > 0 ? 0.75 : 1;
  return Math.floor(Math.max(0, baseDamage) * charmMultiplier * weakMultiplier);
}

function estimateCardDamage(state: CombatState, card: CardInstance, definition: CardDefinition): number {
  return getCardEffects(card, definition).reduce((total, effect) => {
    if (effect.action !== "damage") {
      return total;
    }

    let amount = effect.amount;
    if (card.upgraded && !definition.upgrade?.effects) {
      amount += 3;
    }

    if (state.player.mind === "nu") {
      amount += 2;
    }

    return total + amount;
  }, 0);
}

function getBlockAmount(definition: CardDefinition): number {
  return definition.effects.reduce((total, effect) => effect.action === "block" ? total + effect.amount : total, 0);
}

function getDefensiveScore(definition: CardDefinition): number {
  return getDefinitionEffects(definition).reduce((total, effect) => {
    if (effect.action === "block") {
      return total + effect.amount;
    }

    if (effect.action === "applyStatus" && effect.status === "dodge" && definition.target === "self") {
      return total + effect.amount * 14;
    }

    if (effect.action === "applyStatus" && effect.status === "guard" && definition.target === "self") {
      return total + effect.amount * 5;
    }

    if (effect.action === "applyStatus" && effect.status === "weak" && definition.target === "enemy") {
      return total + effect.amount * 6;
    }

    if (effect.action === "applyStatus" && effect.status === "charm" && definition.target === "enemy") {
      return total + effect.amount * 2;
    }

    if (effect.action === "setFormation" && effect.blockAtTurnEnd) {
      return total + effect.blockAtTurnEnd * Math.max(1, effect.duration);
    }

    if (effect.action === "queueEcho") {
      return total + effect.effects.reduce((echoTotal, echoEffect) => echoEffect.action === "block" ? echoTotal + echoEffect.amount : echoTotal, 0);
    }

    return total;
  }, 0);
}

function getUtilityScore(definition: CardDefinition): number {
  return getDefinitionEffects(definition).reduce((total, effect) => {
    if (effect.action === "draw") {
      return total + effect.amount * 6;
    }

    if (effect.action === "cleanseCards") {
      return total + effect.amount * 4;
    }

    if (effect.action === "scry") {
      return total + effect.amount;
    }

    if (effect.action === "setFormation") {
      return total + effect.duration * 2 + (effect.damageAtTurnEnd ?? 0) + (effect.drawAtTurnStart ?? 0) * 4;
    }

    if (effect.action === "gainResource") {
      return total + effect.amount * 2;
    }

    return total;
  }, 0);
}

function hasAnyEffect(definition: CardDefinition, actions: CardEffect["action"][]): boolean {
  return getDefinitionEffects(definition).some((effect) => actions.includes(effect.action));
}

function getCardCost(card: CardInstance, definition: CardDefinition): number {
  return card.upgraded && definition.upgrade?.cost !== undefined ? definition.upgrade.cost : definition.cost;
}

function getCardEffects(card: CardInstance, definition: CardDefinition): CardEffect[] {
  return card.upgraded && definition.upgrade?.effects ? definition.upgrade.effects : definition.effects;
}

function getDefinitionEffects(definition: CardDefinition): CardEffect[] {
  return definition.upgrade?.effects ?? definition.effects;
}

function hasCleanseTargets(state: CombatState): boolean {
  return [...state.piles.hand, ...state.piles.discard, ...state.piles.draw].some((card) => {
    const definition = state.cardDefinitions[card.definitionId];
    return definition?.rarity === "status" || definition?.rarity === "curse";
  });
}

function getRunDeckCardIds(run: RunState): string[] {
  return run.deck.length > 0 ? run.deck.map((entry) => entry.cardId) : (charactersById[run.characterId]?.starterDeck ?? []);
}

function getUpgradedStarterInstanceIds(deck: RunDeckEntry[]): string[] {
  return deck.flatMap((entry, index) => entry.upgraded ? [`starter-${index + 1}`] : []);
}

function getOutcome(state: CombatState): BattlePlanOutcome {
  if (state.phase === "won") {
    return "victory";
  }

  if (state.phase === "lost") {
    return "defeat";
  }

  return "timeout";
}

function createBattleWarnings(input: {
  outcome: BattlePlanOutcome;
  chapterId: string;
  characterId: string;
  enemyId: string;
  maxDamageTakenInTurn: number;
  unsafeDamageTaken: number;
}): string[] {
  const label = `${input.chapterId}/${input.characterId}/${input.enemyId}`;
  const warnings: string[] = [];

  if (input.outcome === "timeout") {
    warnings.push(`timeout-prone encounter: ${label}`);
  }

  if (input.maxDamageTakenInTurn > input.unsafeDamageTaken) {
    warnings.push(`unsafe damage spike: ${label} took ${input.maxDamageTakenInTurn}`);
  }

  return warnings;
}

function createMissingEnemyResult(run: RunState, enemyId: string): BattlePlanResult {
  return {
    outcome: "missing-enemy",
    chapterId: run.chapterId,
    characterId: run.characterId,
    enemyId,
    turns: 0,
    damageTaken: 0,
    maxDamageTakenInTurn: 0,
    cardsPlayed: 0,
    warnings: [`missing enemy: ${enemyId}`],
    finalPlayerHp: run.hp,
    enemyHpRemaining: 0,
    comboTriggers: []
  };
}

function createMissingCharacterResult(run: RunState, enemy: ChapterEnemyDefinition): BattlePlanResult {
  return {
    outcome: "missing-enemy",
    chapterId: run.chapterId,
    characterId: run.characterId,
    enemyId: enemy.id,
    enemyName: enemy.name,
    turns: 0,
    damageTaken: 0,
    maxDamageTakenInTurn: 0,
    cardsPlayed: 0,
    warnings: [`missing character: ${run.characterId}`],
    finalPlayerHp: run.hp,
    enemyHpRemaining: enemy.maxHp,
    comboTriggers: []
  };
}

function averageByChapter(encounters: BattlePlanResult[], selectValue: (result: BattlePlanResult) => number): Record<string, number> {
  const totals: Record<string, { value: number; count: number }> = {};
  for (const encounter of encounters) {
    totals[encounter.chapterId] ??= { value: 0, count: 0 };
    totals[encounter.chapterId].value += selectValue(encounter);
    totals[encounter.chapterId].count += 1;
  }

  return Object.fromEntries(
    Object.entries(totals).map(([chapterId, total]) => [chapterId, total.count > 0 ? total.value / total.count : 0])
  );
}

const ALPHA_SIMULATION_CARD_IDS: Record<string, string[]> = {
  zhaoyun: [
    "zhao_qixing_spear",
    "zhao_seven_entries",
    "zhao_spear_wall",
    "zhao_river_guard",
    "zhao_white_horse_breakout",
    "zhao_return_spear",
    "common_gedang",
    "common_jiexue",
    "common_xixin"
  ],
  diaochan: [
    "diao_closed_moon",
    "diao_jinghong_strike",
    "diao_lijian",
    "diao_mirror_flower",
    "diao_lotus_blade",
    "diao_flying_sleeves",
    "common_zhuiying",
    "common_jiexue",
    "common_xixin"
  ],
  caiwenji: [
    "cai_final_song",
    "cai_soul_ferry",
    "cai_hujia_beat",
    "cai_clean_string",
    "cai_five_tones_start",
    "cai_shang_tone",
    "cai_listen_still",
    "common_jiexue",
    "common_xixin"
  ],
  zhugeliang: [
    "zhuge_starfall",
    "zhuge_borrow_wind",
    "zhuge_plan_set",
    "zhuge_straw_boats",
    "zhuge_wind_array",
    "zhuge_empty_city",
    "zhuge_deduction",
    "common_jiexue",
    "common_xixin"
  ]
};

const ALPHA_SIMULATION_RELIC_IDS: Record<string, string[]> = {
  zhaoyun: ["relic_dragon_scale_tip", "relic_changban_iron_seal", "relic_old_wooden_sword"],
  diaochan: ["relic_lotus_step_bell", "relic_silent_zither_string", "relic_black_paper_umbrella"],
  caiwenji: ["relic_clear_rain_charm", "relic_broken_string", "relic_memory_bamboo_slip"],
  zhugeliang: ["relic_red_lacquer_token", "relic_memory_bamboo_slip", "relic_ink_washstone"]
};

function createPacingRun(chapterId: ChapterId, characterId: string): RunState {
  const chapterOrder = chaptersById[chapterId].order;
  const run = createDebugRun({
    chapterId,
    characterId,
    cardIds: getAlphaSimulationCards(characterId, chapterOrder),
    relicIds: getAlphaSimulationRelics(characterId, chapterOrder),
    methodIds: getAlphaSimulationMethodIds(characterId),
    methodLevels: getAlphaSimulationMethodLevels(characterId, chapterOrder)
  });

  const maxHpBonus = Math.max(0, chapterOrder - 1) * 20 + (chapterId === "moyuan" ? 20 : 0);
  run.maxHp += maxHpBonus;
  run.hp = run.maxHp;
  upgradeFirstDeckCards(run, 4 + chapterOrder * 4);
  return run;
}

function getAlphaSimulationCards(characterId: string, chapterOrder: number): string[] {
  const cards = ALPHA_SIMULATION_CARD_IDS[characterId] ?? ALPHA_SIMULATION_CARD_IDS.zhaoyun;
  return cards.slice(0, Math.min(cards.length, 2 + chapterOrder * 2));
}

function getAlphaSimulationRelics(characterId: string, chapterOrder: number): string[] {
  const relics = ALPHA_SIMULATION_RELIC_IDS[characterId] ?? [];
  return relics.slice(0, Math.max(0, chapterOrder - 1));
}

function getAlphaSimulationMethodIds(characterId: string): string[] {
  if (characterId === "diaochan") {
    return ["method_qingcheng"];
  }

  if (characterId === "caiwenji") {
    return ["method_qingyin"];
  }

  if (characterId === "zhugeliang") {
    return ["method_bazhen"];
  }

  return ["method_longdan"];
}

function getAlphaSimulationMethodLevels(characterId: string, chapterOrder: number): Record<string, number> {
  const level = chapterOrder >= 3 ? 2 : 1;
  return Object.fromEntries(getAlphaSimulationMethodIds(characterId).map((methodId) => [methodId, level]));
}

function getAlphaRouteNodeIds(chapterId: ChapterId): string[] {
  if (chapterId === "changan") {
    return ["event-1", "shop-1", "rest-1", "battle-3", "boss"];
  }

  if (chapterId === "moyuan") {
    return ["event-1", "rest-1", "boss"];
  }

  return ["event-1", "rest-1", "battle-3", "boss"];
}

function isCombatNodeType(nodeType: MapNodeType): nodeType is "battle" | "elite" | "boss" {
  return nodeType === "battle" || nodeType === "elite" || nodeType === "boss";
}

function applyRestRouteChoice(run: RunState): void {
  healRun(run, Math.ceil(run.maxHp * 0.35));
  const candidate = getUpgradeCandidates(run)[0];
  if (candidate) {
    upgradeDeckCard(run, candidate.instanceId);
  }
}

function applyChapterEntryRouteGrowth(run: RunState): void {
  const chapterOrder = chaptersById[run.chapterId].order;
  const baseHp = charactersById[run.characterId]?.maxHp ?? run.maxHp;
  const targetMaxHp = baseHp + Math.max(0, chapterOrder - 1) * 18 + (run.chapterId === "moyuan" ? 12 : 0);
  if (run.maxHp < targetMaxHp) {
    const increase = targetMaxHp - run.maxHp;
    run.maxHp = targetMaxHp;
    run.hp = Math.min(run.maxHp, run.hp + increase);
  }
  if (run.chapterId === "moyuan") {
    run.hp = Math.max(run.hp, Math.ceil(run.maxHp * 0.75));
  }

  takeRouteSupportCards(run, Math.max(1, chapterOrder - 1));
  for (const relicId of getAlphaSimulationRelics(run.characterId, chapterOrder)) {
    if (!run.relicIds.includes(relicId)) {
      addRelic(run, relicId);
    }
  }

  for (const methodId of getAlphaSimulationMethodIds(run.characterId)) {
    if (!run.methodIds.includes(methodId)) {
      run.methodIds.push(methodId);
    }
    run.methodLevels ??= {};
    run.methodLevels[methodId] = Math.max(run.methodLevels[methodId] ?? 1, chapterOrder >= 3 ? 2 : 1);
  }

  upgradeFirstDeckCards(run, 3 + chapterOrder * 2);
}

function applyEventRouteChoice(run: RunState): void {
  takeRouteSupportCards(run, 1);
  healRun(run, Math.ceil(run.maxHp * 0.12));
}

function applyShopRouteChoice(run: RunState): void {
  takeRouteSupportCards(run, 2);
  const relicId = getRouteRelicId(run);
  if (relicId && !run.relicIds.includes(relicId)) {
    addRelic(run, relicId);
  }
  run.gold = Math.max(0, run.gold - 45);
}

function applyBattleRouteReward(run: RunState, nodeType: MapNodeType): void {
  if (nodeType === "boss") {
    const chapterReward = createChapterRewardChoicesForRoute(run);
    if (chapterReward) {
      claimChapterReward(run, chapterReward);
    }
    return;
  }

  const draft = createCardRewardDraft(run, nodeType);
  const preferredCard = draft.cards[0];
  if (preferredCard) {
    takeCardReward(run, preferredCard);
  }
}

function takeRouteSupportCards(run: RunState, count: number): void {
  const pool = ALPHA_SIMULATION_CARD_IDS[run.characterId] ?? ALPHA_SIMULATION_CARD_IDS.zhaoyun;
  const chapterOffset = Math.max(0, chaptersById[run.chapterId].order - 1) * 2;
  const existingCards = new Set(run.deck.map((entry) => entry.cardId));
  let added = 0;

  for (let index = 0; index < pool.length && added < count; index += 1) {
    const cardId = pool[(chapterOffset + index + run.rewardHistory.length) % pool.length];
    const card = cardsById[cardId];
    if (!card || existingCards.has(card.id)) {
      continue;
    }

    takeCardReward(run, card);
    existingCards.add(card.id);
    added += 1;
  }
}

function getRouteRelicId(run: RunState): string | undefined {
  const relics = ALPHA_SIMULATION_RELIC_IDS[run.characterId] ?? [];
  return relics[Math.max(0, chaptersById[run.chapterId].order - 2)];
}

function createChapterRewardChoicesForRoute(run: RunState): string | undefined {
  const choices = createChapterRewardDraftIds(run);
  const lowHpMaxChoice = run.hp < Math.ceil(run.maxHp * 0.45) ? choices.find((id) => id.endsWith("-max-hp")) : undefined;
  return lowHpMaxChoice ?? choices.find((id) => id.endsWith("-rare-card")) ?? choices[0];
}

function createChapterRewardDraftIds(run: RunState): string[] {
  return [`${run.chapterId}-max-hp`, `${run.chapterId}-upgrade`, `${run.chapterId}-rare-card`];
}

function createFullRouteResult(
  outcome: FullRouteOutcome,
  run: RunState,
  characterId: string,
  encounters: BattlePlanResult[],
  warnings: string[],
  routeNodeIds: string[],
  snapshot?: RunCompletionSnapshot
): FullRouteResult {
  return {
    outcome,
    characterId,
    encounters,
    warnings,
    completedChapterIds: [...run.completedChapterIds],
    routeNodeIds: [...routeNodeIds],
    finalPlayerHp: run.hp,
    finalMaxHp: run.maxHp,
    finalState: getRunFinalState(run),
    snapshot
  };
}

function upgradeFirstDeckCards(run: RunState, count: number): void {
  for (const entry of run.deck.slice(0, count)) {
    if (cardsById[entry.cardId]?.upgrade) {
      entry.upgraded = true;
    }
  }
}

function createSimulationSeed(run: RunState, enemyId: string): number {
  return Math.abs(run.mapSeed * 131 + hashString(run.characterId) * 17 + hashString(run.chapterId) * 29 + hashString(enemyId));
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }

  return hash >>> 0;
}

function isChapterId(chapterId: string): chapterId is ChapterId {
  return chapterId in chaptersById;
}
