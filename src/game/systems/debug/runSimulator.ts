import { cardList } from "../../content/cards";
import { charactersById } from "../../content/characters";
import { chaptersById, type ChapterId } from "../../content/chapters";
import { enemiesById, enemyList, type ChapterEnemyDefinition } from "../../content/enemies";
import { createCombat, endPlayerTurn, playCard } from "../combat/combat";
import type { CardDefinition, CardEffect, CardInstance, CombatState, EnemyIntent, EnemyState } from "../combat/types";
import type { RunDeckEntry, RunState } from "../run/types";
import { createDebugRun } from "./debugRun";

export type BattlePlanOutcome = "victory" | "defeat" | "timeout" | "missing-enemy";

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

const DEFAULT_MAX_TURNS = 14;
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

      const run = createDebugRun({ chapterId, characterId });
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
  const defenseThreshold = options.preferDefenseAtIncomingDamage ?? DEFAULT_DEFENSE_THRESHOLD;
  if (incomingDamage >= defenseThreshold) {
    const blockCard = getBestBlockCard(playable);
    if (blockCard) {
      return { card: blockCard.card, targetId: getTargetId(state, blockCard.definition) };
    }
  }

  const utilityCard = playable.find(({ definition }) => hasAnyEffect(definition, ["gainResource", "draw", "cleanseCards"]));
  if (utilityCard) {
    return { card: utilityCard.card, targetId: getTargetId(state, utilityCard.definition) };
  }

  const blockCard = playable.find(({ definition }) => hasAnyEffect(definition, ["block"]));
  if (blockCard) {
    return { card: blockCard.card, targetId: getTargetId(state, blockCard.definition) };
  }

  const attackCard = enemy ? playable.find(({ definition }) => definition.types.includes("attack")) : undefined;
  if (attackCard && enemy) {
    return { card: attackCard.card, targetId: enemy.id };
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
