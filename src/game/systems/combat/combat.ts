import { createRng, shuffleInPlace, type Rng } from "../../core/rng";
import type {
  CardDefinition,
  CardEffect,
  CardInstance,
  CardType,
  CombatState,
  CreateCombatInput,
  EnemyDefinition,
  EnemyIntent,
  EnemyState,
  MindState,
  PlayCardResult,
  StatusId
} from "./types";

export function createCombat(input: CreateCombatInput): CombatState {
  const rng = createRng(input.rngSeed);
  const cardDefinitions = Object.fromEntries(input.cards.map((card) => [card.id, card]));
  const draw = input.character.starterDeck.map((definitionId, index) => ({
    instanceId: `starter-${index + 1}`,
    definitionId
  }));

  if (input.shuffleDeck ?? true) {
    shuffleInPlace(draw, rng);
  }

  const enemies = input.enemies.map((enemy, index) => createEnemyState(enemy, index));

  const state: CombatState = {
    turn: 1,
    phase: "player",
    character: input.character,
    cardDefinitions,
    player: {
      id: "player",
      name: input.character.name,
      characterId: input.character.id,
      hp: input.character.maxHp,
      maxHp: input.character.maxHp,
      block: 0,
      statuses: {},
      energy: input.character.energyPerTurn,
      maxEnergy: input.character.energyPerTurn,
      drawPerTurn: input.character.drawPerTurn,
      resource: {
        id: input.character.resource.id,
        name: input.character.resource.name,
        value: input.character.resource.initial,
        max: input.character.resource.max
      },
      mind: "none",
      mindTendency: {
        ning: 0,
        nu: 0,
        bei: 0,
        mei: 0,
        luan: 0,
        wu: 0
      },
      inkMarks: 0
    },
    enemies,
    piles: {
      draw,
      hand: [],
      discard: [],
      exhaust: []
    },
    combatLog: [],
    playedCardTypesThisTurn: [],
    attacksPlayedThisTurn: 0,
    nextInstanceNumber: draw.length + 1
  };

  drawCards(state, state.player.drawPerTurn, rng);
  return state;
}

export function drawCards(state: CombatState, amount: number, rng: Rng): void {
  for (let count = 0; count < amount; count += 1) {
    if (state.piles.draw.length === 0) {
      if (state.piles.discard.length === 0) {
        return;
      }

      state.piles.draw.push(...state.piles.discard.splice(0));
      shuffleInPlace(state.piles.draw, rng);
    }

    const card = state.piles.draw.shift();
    if (card) {
      state.piles.hand.push(card);
    }
  }
}

export function playCard(state: CombatState, cardInstanceId: string, targetId: string): PlayCardResult {
  if (state.phase !== "player") {
    return { ok: false, state, reason: "combat-ended" };
  }

  const handIndex = state.piles.hand.findIndex((card) => card.instanceId === cardInstanceId);
  if (handIndex < 0) {
    return { ok: false, state, reason: "card-not-found" };
  }

  const card = state.piles.hand[handIndex];
  const definition = getCardDefinition(state, card);
  if (state.player.energy < definition.cost) {
    return { ok: false, state, reason: "not-enough-energy" };
  }

  const target = resolveTarget(state, definition.target, targetId);
  if (!target && definition.target !== "none") {
    return { ok: false, state, reason: "invalid-target" };
  }

  state.player.energy -= definition.cost;
  state.piles.hand.splice(handIndex, 1);

  for (const effect of definition.effects) {
    applyEffect(state, effect, target?.id ?? "player");
  }

  for (const type of definition.types) {
    state.playedCardTypesThisTurn.push(type);
  }

  applyCharacterCardHooks(state, definition, target?.id ?? "player");

  if (definition.exhaust) {
    state.piles.exhaust.push(card);
  } else {
    state.piles.discard.push(card);
  }

  updateCombatOutcome(state);
  return { ok: true, state };
}

export function endPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== "player") {
    return state;
  }

  discardNonRetainedCards(state);
  executeEnemyIntents(state);
  updateCombatOutcome(state);

  if (state.phase === "player") {
    beginPlayerTurn(state);
  }

  return state;
}

function createEnemyState(definition: EnemyDefinition, index: number): EnemyState {
  return {
    id: `enemy-${index + 1}`,
    definitionId: definition.id,
    name: definition.name,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    block: 0,
    statuses: {},
    intents: definition.intents.length > 0 ? definition.intents : [{ type: "idle" }],
    intentIndex: 0,
    currentIntent: definition.intents[0] ?? { type: "idle" }
  };
}

function getCardDefinition(state: CombatState, card: CardInstance): CardDefinition {
  const definition = state.cardDefinitions[card.definitionId];
  if (!definition) {
    throw new Error(`Unknown card definition: ${card.definitionId}`);
  }

  return definition;
}

function resolveTarget(state: CombatState, target: CardDefinition["target"], targetId: string) {
  if (target === "self") {
    return state.player;
  }

  if (target === "enemy") {
    return state.enemies.find((enemy) => enemy.id === targetId && enemy.hp > 0);
  }

  return undefined;
}

function applyEffect(state: CombatState, effect: CardEffect, targetId: string): void {
  switch (effect.action) {
    case "damage":
      damageEnemy(state, targetId, getPlayerDamageAmount(state, effect.amount));
      break;
    case "block":
      state.player.block += getPlayerBlockAmount(state, effect.amount);
      break;
    case "draw":
      drawCards(state, effect.amount, createRng(state.turn * 101 + state.nextInstanceNumber));
      break;
    case "gainResource":
      gainResource(state, effect.amount);
      break;
    case "applyStatus":
      applyStatus(state, targetId, effect.status, effect.amount);
      break;
    case "gainInk":
      state.player.inkMarks += effect.amount;
      break;
    case "setMind":
      setMind(state, effect.mind, effect.amount ?? 1);
      break;
  }
}

function damageEnemy(state: CombatState, enemyId: string, rawAmount: number): void {
  const enemy = state.enemies.find((item) => item.id === enemyId);
  if (!enemy || enemy.hp <= 0) {
    return;
  }

  const amount = Math.max(0, rawAmount);
  const blocked = Math.min(enemy.block, amount);
  enemy.block -= blocked;
  enemy.hp = Math.max(0, enemy.hp - (amount - blocked));
}

function getPlayerDamageAmount(state: CombatState, baseAmount: number): number {
  let amount = baseAmount;
  if (state.player.mind === "nu") {
    amount += 2;
  }

  return amount;
}

function getPlayerBlockAmount(state: CombatState, baseAmount: number): number {
  let amount = baseAmount;
  if (state.player.mind === "ning") {
    amount += 2;
  }

  return amount;
}

function damagePlayer(state: CombatState, rawAmount: number): void {
  let amount = Math.max(0, rawAmount);

  if ((state.player.statuses.dodge ?? 0) > 0) {
    state.player.statuses.dodge = Math.max(0, (state.player.statuses.dodge ?? 0) - 1);
    return;
  }

  if ((state.player.statuses.guard ?? 0) > 0) {
    const reduced = Math.min(4 * (state.player.statuses.guard ?? 0), amount);
    amount -= reduced;
    state.player.statuses.guard = 0;
  }

  const blocked = Math.min(state.player.block, amount);
  state.player.block -= blocked;
  state.player.hp = Math.max(0, state.player.hp - (amount - blocked));
}

function gainResource(state: CombatState, amount: number): void {
  state.player.resource.value = clamp(state.player.resource.value + amount, 0, state.player.resource.max);
}

function applyStatus(state: CombatState, targetId: string, status: StatusId, amount: number): void {
  const target = targetId === "player" ? state.player : state.enemies.find((enemy) => enemy.id === targetId);
  if (!target) {
    return;
  }

  target.statuses[status] = (target.statuses[status] ?? 0) + amount;
}

function setMind(state: CombatState, mind: MindState, amount: number): void {
  state.player.mind = mind;
  if (mind !== "none") {
    state.player.mindTendency[mind] += amount;
  }
}

function applyCharacterCardHooks(state: CombatState, definition: CardDefinition, targetId: string): void {
  if (definition.types.includes("attack")) {
    state.attacksPlayedThisTurn += 1;
  }

  if (state.character.id === "zhaoyun" && definition.types.includes("attack") && state.attacksPlayedThisTurn === 3) {
    damageEnemy(state, targetId, 4);
    gainResource(state, 1);
    state.combatLog.push("破阵");
  }

  if (state.character.id === "diaochan" && definition.types.includes("body")) {
    gainResource(state, 1);
  }
}

function discardNonRetainedCards(state: CombatState): void {
  const retained: CardInstance[] = [];
  const discarded: CardInstance[] = [];

  for (const card of state.piles.hand) {
    const definition = getCardDefinition(state, card);
    if (definition.retain) {
      retained.push(card);
    } else {
      discarded.push(card);
    }
  }

  state.piles.hand = retained;
  state.piles.discard.push(...discarded);
}

function executeEnemyIntents(state: CombatState): void {
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const intent = enemy.currentIntent;
    if (intent.type === "attack") {
      for (let hit = 0; hit < intent.hits; hit += 1) {
        damagePlayer(state, getModifiedEnemyDamage(enemy, intent.damage));
      }
    }

    if (intent.type === "block") {
      enemy.block += intent.block;
    }

    advanceIntent(enemy);
  }
}

function getModifiedEnemyDamage(enemy: EnemyState, baseDamage: number): number {
  const charm = enemy.statuses.charm ?? 0;
  const weak = enemy.statuses.weak ?? 0;
  const charmMultiplier = Math.max(0.5, 1 - charm * 0.05);
  const weakMultiplier = weak > 0 ? 0.75 : 1;
  return Math.floor(baseDamage * charmMultiplier * weakMultiplier);
}

function advanceIntent(enemy: EnemyState): void {
  enemy.intentIndex += 1;
  enemy.currentIntent = enemy.intents[enemy.intentIndex % enemy.intents.length] ?? enemy.currentIntent;
}

function beginPlayerTurn(state: CombatState): void {
  state.turn += 1;
  state.player.block = 0;
  state.player.energy = state.player.maxEnergy;
  state.playedCardTypesThisTurn = [];
  state.attacksPlayedThisTurn = 0;
  drawCards(state, state.player.drawPerTurn - state.piles.hand.length, createRng(state.turn * 1009));
}

function updateCombatOutcome(state: CombatState): void {
  if (state.phase !== "player") {
    return;
  }

  if (state.player.hp <= 0) {
    state.phase = "lost";
    return;
  }

  if (state.enemies.every((enemy) => enemy.hp <= 0)) {
    settleInkMarks(state);
    state.phase = "won";
  }
}

function settleInkMarks(state: CombatState): void {
  if (state.player.inkMarks <= 0) {
    return;
  }

  state.player.hp = Math.max(1, state.player.hp - state.player.inkMarks);
  state.combatLog.push("墨痕结算");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
