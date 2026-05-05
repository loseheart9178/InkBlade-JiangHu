import { createRng, shuffleInPlace, type Rng } from "../../core/rng";
import { methodsById, type MethodId } from "../../content/methods";
import { relicsById } from "../../content/relics";
import { defaultComboRules, exhaustAttackComboRule } from "./combos";
import type {
  CardDefinition,
  ComboEffect,
  ComboRule,
  CardEffect,
  CardInstance,
  CardType,
  CardVisualCueId,
  CombatState,
  CreateCombatInput,
  EnemyDefinition,
  EnemyIntentEffect,
  EnemyIntent,
  EchoQueueItem,
  EnemyState,
  MindState,
  PlayCardResult,
  StatusId,
  CombatVisualEventKind,
  CombatVisualTarget,
  CombatVisualTone,
  FormationId
} from "./types";

export function createCombat(input: CreateCombatInput): CombatState {
  const rng = createRng(input.rngSeed);
  const cardDefinitions = Object.fromEntries(input.cards.map((card) => [card.id, card]));
  const upgradedIds = new Set(input.upgradedCardInstanceIds ?? []);
  const draw = input.character.starterDeck.map((definitionId, index) => {
    const instanceId = `starter-${index + 1}`;
    return {
      instanceId,
      definitionId,
      upgraded: upgradedIds.has(instanceId)
    };
  });

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
      hp: input.playerHp ?? input.character.maxHp,
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
    visualEvents: [],
    relicIds: input.relicIds ?? [],
    relicMemory: {},
    methodIds: input.methodIds ?? [],
    methodLevels: { ...(input.methodLevels ?? {}) },
    methodMemory: {},
    echoQueue: [],
    playedCardTypesThisTurn: [],
    comboTriggersThisTurn: [],
    comboTriggersThisCombat: [],
    lastPlayedCardExhaustedThisTurn: false,
    attacksPlayedThisTurn: 0,
    nextInstanceNumber: draw.length + 1,
    nextVisualEventId: 1
  };

  applyCombatStartRelics(state);
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
      handleCardDrawn(state, card);
    }
  }
}

export function playCard(state: CombatState, cardInstanceId: string, targetId: string): PlayCardResult {
  ensureComboTracking(state);

  if (state.phase !== "player") {
    return { ok: false, state, reason: "combat-ended" };
  }

  const handIndex = state.piles.hand.findIndex((card) => card.instanceId === cardInstanceId);
  if (handIndex < 0) {
    return { ok: false, state, reason: "card-not-found" };
  }

  const card = state.piles.hand[handIndex];
  const definition = getCardDefinition(state, card);
  const cost = getCardCost(definition, card);
  if (state.player.energy < cost) {
    return { ok: false, state, reason: "not-enough-energy" };
  }

  const target = resolveTarget(state, definition.target, targetId);
  if (!target && definition.target !== "none") {
    return { ok: false, state, reason: "invalid-target" };
  }

  state.player.energy -= cost;
  state.piles.hand.splice(handIndex, 1);
  const previousCardWasExhausted = state.lastPlayedCardExhaustedThisTurn;

  for (const effect of getCardEffects(definition, card)) {
    applyEffect(state, definition, card, effect, target?.id ?? "player");
  }

  for (const type of definition.types) {
    state.playedCardTypesThisTurn.push(type);
    applyComboHooks(state, target?.id ?? "player", type === "attack" && previousCardWasExhausted);
  }

  applyCharacterCardHooks(state, definition, target?.id ?? "player");
  pushSignatureCardVisualEvent(state, definition);

  if (definition.exhaust) {
    state.piles.exhaust.push(card);
  } else {
    state.piles.discard.push(card);
  }

  state.lastPlayedCardExhaustedThisTurn = Boolean(definition.exhaust);
  updateCombatOutcome(state);
  return { ok: true, state };
}

export function endPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== "player") {
    return state;
  }

  discardNonRetainedCards(state);
  triggerFormationTurnEnd(state);
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
    phaseIntents: definition.phaseIntents,
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

function getCardCost(definition: CardDefinition, card: CardInstance): number {
  return card.upgraded && definition.upgrade?.cost !== undefined ? definition.upgrade.cost : definition.cost;
}

function getCardEffects(definition: CardDefinition, card: CardInstance): CardEffect[] {
  return card.upgraded && definition.upgrade?.effects ? definition.upgrade.effects : definition.effects;
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

function applyEffect(state: CombatState, definition: CardDefinition, card: CardInstance, effect: CardEffect, targetId: string): void {
  switch (effect.action) {
    case "damage":
      damageEnemy(state, targetId, getPlayerDamageAmount(state, definition, card, effect.amount));
      break;
    case "block":
      {
        const amount = getPlayerBlockAmount(state, card, effect.amount);
        state.player.block += amount;
        pushVisualEvent(state, "block", "player", `+${amount} 护甲`, "teal", amount);
        triggerChangbanGuardMethod(state);
      }
      break;
    case "draw":
      drawCards(state, effect.amount, createRng(state.turn * 101 + state.nextInstanceNumber));
      pushVisualEvent(state, "draw", "player", `抽牌 +${effect.amount}`, "neutral", effect.amount);
      break;
    case "gainResource":
      gainResource(state, effect.amount);
      pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +${effect.amount}`, "gold", effect.amount);
      break;
    case "scry":
      scryTopCards(state, effect.amount);
      break;
    case "setFormation":
      setFormation(state, effect.formation, effect.name, effect.duration, {
        blockAtTurnEnd: effect.blockAtTurnEnd,
        damageAtTurnEnd: effect.damageAtTurnEnd,
        drawAtTurnStart: effect.drawAtTurnStart
      });
      break;
    case "applyStatus":
      applyStatus(state, targetId, effect.status, effect.amount);
      if (effect.status === "charm" && targetId !== "player") {
        triggerQingchengCharmMethod(state, targetId);
        triggerCharmThresholdRelics(state, targetId);
      }
      break;
    case "gainInk":
      gainInk(state, effect.amount);
      break;
    case "cleanseCards":
      cleanseCards(state, effect.amount);
      break;
    case "queueEcho":
      queueEcho(state, definition, card, targetId, effect.effects);
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
  const beforeHp = enemy.hp;
  enemy.block -= blocked;
  enemy.hp = Math.max(0, enemy.hp - (amount - blocked));
  const dealt = beforeHp - enemy.hp;
  if (dealt > 0) {
    pushVisualEvent(state, "damage", "enemy", `-${dealt}`, "red", dealt);
  } else if (amount > 0) {
    pushVisualEvent(state, "block", "enemy", "护甲挡下", "neutral");
  }

  refreshEnemyPhase(state, enemy);
}

function getPlayerDamageAmount(state: CombatState, definition: CardDefinition, card: CardInstance, baseAmount: number): number {
  let amount = baseAmount;
  if (card.upgraded && !definition.upgrade?.effects) {
    amount += 3;
  }

  if (state.player.mind === "nu") {
    amount += 2;
  }

  if ((state.player.statuses.weak ?? 0) > 0) {
    amount = Math.floor(amount * 0.75);
    state.player.statuses.weak = Math.max(0, (state.player.statuses.weak ?? 0) - 1);
  }

  if (hasRelic(state, "relic_old_wooden_sword") && isBasicAttack(definition)) {
    amount += 2;
  }

  if (hasRelic(state, "relic_jianghu_whetstone") && definition.types.includes("attack")) {
    amount += 1;
  }

  return amount;
}

function getPlayerBlockAmount(state: CombatState, card: CardInstance, baseAmount: number): number {
  let amount = baseAmount;
  const definition = getCardDefinition(state, card);
  if (card.upgraded && !definition.upgrade?.effects) {
    amount += 3;
  }

  if (state.player.mind === "ning") {
    amount += 2;
  }

  return amount;
}

function damagePlayer(state: CombatState, rawAmount: number): void {
  let amount = Math.max(0, rawAmount);
  let guardReduced = 0;

  if ((state.player.statuses.dodge ?? 0) > 0) {
    state.player.statuses.dodge = Math.max(0, (state.player.statuses.dodge ?? 0) - 1);
    pushVisualEvent(state, "status", "player", "闪避", "teal");
    return;
  }

  if ((state.player.statuses.guard ?? 0) > 0) {
    const reduced = Math.min(4 * (state.player.statuses.guard ?? 0), amount);
    amount -= reduced;
    guardReduced = reduced;
    state.player.statuses.guard = 0;
  }

  if ((state.player.statuses.vulnerable ?? 0) > 0) {
    amount = Math.floor(amount * 1.5);
    state.player.statuses.vulnerable = Math.max(0, (state.player.statuses.vulnerable ?? 0) - 1);
  }

  const blocked = Math.min(state.player.block, amount);
  const beforeHp = state.player.hp;
  state.player.block -= blocked;
  state.player.hp = Math.max(0, state.player.hp - (amount - blocked));
  const dealt = beforeHp - state.player.hp;
  if (dealt > 0) {
    pushVisualEvent(state, "damage", "player", `-${dealt}`, "red", dealt);
  } else if (amount > 0) {
    pushVisualEvent(state, "block", "player", "护甲挡下", "neutral");
  }

  if (guardReduced > 0) {
    triggerGuardSuccessRelics(state);
  }
}

function gainResource(state: CombatState, amount: number): void {
  state.player.resource.value = clamp(state.player.resource.value + amount, 0, state.player.resource.max);
}

function queueEcho(state: CombatState, definition: CardDefinition, card: CardInstance, targetId: string, effects: CardEffect[]): void {
  if (effects.length === 0) {
    return;
  }

  ensureEchoQueue(state);
  if (state.echoQueue.length >= 3) {
    return;
  }

  state.echoQueue.push({
    id: state.nextInstanceNumber,
    sourceCardId: card.definitionId,
    sourceName: definition.name,
    targetId,
    effects
  });
  state.nextInstanceNumber += 1;
  state.combatLog.push("余韵");
  pushVisualEvent(state, "trigger", "player", "余韵", "teal");
}

function scryTopCards(state: CombatState, amount: number): number {
  const count = Math.min(Math.max(0, amount), state.piles.draw.length);
  if (count === 0) {
    state.combatLog.push("观星");
    pushVisualEvent(state, "trigger", "player", "观星", "gold");
    return 0;
  }

  const inspected = state.piles.draw.splice(0, count);
  const movedToBottom = inspected.splice(0, 1);
  state.piles.draw.unshift(...inspected);
  state.piles.draw.push(...movedToBottom);
  state.combatLog.push("观星");
  pushVisualEvent(state, "trigger", "player", "观星", "gold", count);
  return movedToBottom.length;
}

function setFormation(
  state: CombatState,
  formation: FormationId,
  name: string,
  duration: number,
  effects: { blockAtTurnEnd?: number; damageAtTurnEnd?: number; drawAtTurnStart?: number }
): void {
  state.activeFormation = {
    id: formation,
    name,
    duration,
    blockAtTurnEnd: effects.blockAtTurnEnd,
    damageAtTurnEnd: effects.damageAtTurnEnd,
    drawAtTurnStart: effects.drawAtTurnStart
  };
  state.combatLog.push(name);
  pushVisualEvent(state, "trigger", "center", name, "gold");
}

function gainInk(state: CombatState, amount: number): void {
  state.player.inkMarks += amount;
  pushVisualEvent(state, "ink", "player", `墨痕 +${amount}`, "ink", amount);
  triggerInkRelics(state, amount);
}

function applyStatus(state: CombatState, targetId: string, status: StatusId, amount: number): void {
  const target = targetId === "player" ? state.player : state.enemies.find((enemy) => enemy.id === targetId);
  if (!target) {
    return;
  }

  target.statuses[status] = (target.statuses[status] ?? 0) + amount;
  pushVisualEvent(state, "status", targetId === "player" ? "player" : "enemy", `${formatStatus(status)} +${amount}`, status === "ink" ? "ink" : "teal", amount);
}

function setMind(state: CombatState, mind: MindState, amount: number): void {
  state.player.mind = mind;
  if (mind !== "none") {
    state.player.mindTendency[mind] += amount;
    pushVisualEvent(state, "status", "player", `心境：${formatMind(mind)}`, "gold", amount);
    triggerMindRelics(state);
  }
}

function applyCharacterCardHooks(state: CombatState, definition: CardDefinition, targetId: string): void {
  if (definition.types.includes("attack")) {
    state.attacksPlayedThisTurn += 1;
    triggerThirdAttackRelics(state, targetId);
  }

  if (state.character.id === "zhaoyun" && definition.types.includes("attack") && state.attacksPlayedThisTurn === 3) {
    damageEnemy(state, targetId, 4);
    gainResource(state, 1);
    state.combatLog.push("破阵");
    pushVisualEvent(state, "trigger", "center", "破阵", "gold");
    triggerBreakFormationRelics(state);
  }

  if (state.character.id === "diaochan" && definition.types.includes("body")) {
    gainResource(state, 1);
    triggerBodyRelics(state);
    triggerJinghongDanceMethod(state);
  }

  if (state.character.id === "caiwenji") {
    if (isEchoOrQinCard(definition)) {
      triggerQingyinEchoMethod(state);
      triggerEchoingJadeChimeRelic(state);
    }

    if (isCleanseCard(definition)) {
      triggerHujiaCleanseMethod(state);
    }
  }

  if (state.character.id === "zhugeliang") {
    if (isScryCard(definition)) {
      triggerStarObservationMethod(state);
      triggerAstrolabeShardRelic(state);
    }

    if (isFormationCard(definition)) {
      triggerWindArrayMethod(state);
      triggerStarlitTacticalMapRelic(state);
    }
  }
}

function pushSignatureCardVisualEvent(state: CombatState, definition: CardDefinition): void {
  if (!definition.visualCue) {
    return;
  }

  state.combatLog.push(definition.name);
  pushVisualEvent(state, "trigger", "center", definition.name, getVisualCueTone(definition.visualCue), undefined, definition.id, definition.visualCue);
}

function getVisualCueTone(cue: CardVisualCueId): CombatVisualTone {
  if (cue.startsWith("diao-")) {
    return "red";
  }

  return cue === "zhao-spear-wall" ? "teal" : "gold";
}

function applyComboHooks(state: CombatState, targetId: string, attackAfterExhaustedCard: boolean): void {
  for (const rule of defaultComboRules) {
    if (hasTriggeredCombo(state, rule.id) || !matchesComboSequence(state.playedCardTypesThisTurn, rule.sequence)) {
      continue;
    }

    executeComboRule(state, rule, targetId);
  }

  if (attackAfterExhaustedCard && !hasTriggeredCombo(state, exhaustAttackComboRule.id)) {
    executeComboRule(state, exhaustAttackComboRule, targetId);
  }
}

function hasTriggeredCombo(state: CombatState, comboId: string): boolean {
  return state.comboTriggersThisTurn.includes(comboId);
}

function matchesComboSequence(history: CardType[], sequence: CardType[]): boolean {
  if (history.length < sequence.length) {
    return false;
  }

  return sequence.every((type, index) => history[history.length - sequence.length + index] === type);
}

function executeComboRule(state: CombatState, rule: ComboRule, targetId: string): void {
  state.comboTriggersThisTurn.push(rule.id);
  state.comboTriggersThisCombat.push(rule.id);
  state.combatLog.push(rule.name);
  pushVisualEvent(state, "trigger", "center", rule.name, rule.tone);

  for (const effect of rule.effects) {
    executeComboEffect(state, effect, targetId);
  }

  triggerDragonSpearChainMethod(state, rule);
}

function executeComboEffect(state: CombatState, effect: ComboEffect, targetId: string): void {
  if (effect.action === "damage") {
    damageEnemy(state, targetId, effect.amount);
    return;
  }

  if (effect.action === "block") {
    state.player.block += effect.amount;
    pushVisualEvent(state, "block", "player", `+${effect.amount} 护甲`, "teal", effect.amount);
    return;
  }

  if (effect.action === "draw") {
    drawCards(state, effect.amount, createRng(state.turn * 307 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", `抽牌 +${effect.amount}`, "neutral", effect.amount);
    return;
  }

  gainInk(state, effect.amount);
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
      executeEnemyAttack(state, enemy, intent.damage, intent.hits);
    }

    if (intent.type === "block") {
      enemy.block += intent.block;
      pushVisualEvent(state, "block", "enemy", `+${intent.block} 护甲`, "teal", intent.block);
    }

    if (intent.type === "special") {
      state.combatLog.push(intent.name);
      pushVisualEvent(state, "trigger", "enemy", intent.name, "gold");
      for (const effect of intent.effects) {
        executeEnemyIntentEffect(state, enemy, effect);
      }
    }

    advanceIntent(enemy);
  }
}

function executeEnemyIntentEffect(state: CombatState, enemy: EnemyState, effect: EnemyIntentEffect): void {
  if (effect.action === "damage") {
    executeEnemyAttack(state, enemy, effect.amount, effect.hits ?? 1);
    return;
  }

  if (effect.action === "block") {
    enemy.block += effect.amount;
    pushVisualEvent(state, "block", "enemy", `+${effect.amount} 护甲`, "teal", effect.amount);
    return;
  }

  if (effect.action === "applyStatus") {
    applyStatus(state, effect.target === "player" ? "player" : enemy.id, effect.status, effect.amount);
    return;
  }

  if (effect.action === "addCardToDiscard") {
    addCardToDiscard(state, effect.cardId, effect.amount);
    return;
  }

  if (effect.action === "gainInk") {
    gainInk(state, effect.amount);
    return;
  }

  healEnemy(state, enemy, effect.amount);
}

function executeEnemyAttack(state: CombatState, enemy: EnemyState, damage: number, hits: number): void {
  for (let hit = 0; hit < hits; hit += 1) {
    damagePlayer(state, getModifiedEnemyDamage(enemy, damage));
  }
}

function getModifiedEnemyDamage(enemy: EnemyState, baseDamage: number): number {
  const charm = enemy.statuses.charm ?? 0;
  const weak = enemy.statuses.weak ?? 0;
  const charmMultiplier = Math.max(0.5, 1 - charm * 0.05);
  const weakMultiplier = weak > 0 ? 0.75 : 1;
  if (weak > 0) {
    enemy.statuses.weak = Math.max(0, weak - 1);
  }
  return Math.floor(baseDamage * charmMultiplier * weakMultiplier);
}

function healEnemy(state: CombatState, enemy: EnemyState, amount: number): void {
  const before = enemy.hp;
  enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(0, amount));
  const healed = enemy.hp - before;
  if (healed > 0) {
    pushVisualEvent(state, "resource", "enemy", `回复 +${healed}`, "gold", healed);
  }
}

function addCardToDiscard(state: CombatState, cardId: string, amount: number): void {
  const definition = state.cardDefinitions[cardId];
  if (!definition || amount <= 0) {
    return;
  }

  for (let index = 0; index < amount; index += 1) {
    state.piles.discard.push({
      instanceId: `generated-${state.nextInstanceNumber}`,
      definitionId: cardId
    });
    state.nextInstanceNumber += 1;
  }

  state.combatLog.push(definition.name);
  pushVisualEvent(state, "status", "player", `${definition.name}入弃牌 +${amount}`, "ink", amount);
}

function cleanseCards(state: CombatState, amount: number): void {
  if (amount <= 0) {
    return;
  }

  let remaining = amount;
  let removed = 0;
  for (const pileName of ["hand", "discard", "draw"] as const) {
    const pile = state.piles[pileName];
    for (let index = pile.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const definition = state.cardDefinitions[pile[index].definitionId];
      if (definition?.rarity !== "status" && definition?.rarity !== "curse") {
        continue;
      }

      state.piles.exhaust.push(pile[index]);
      pile.splice(index, 1);
      remaining -= 1;
      removed += 1;
    }
  }

  if (removed <= 0) {
    state.combatLog.push("清音解秽");
    pushVisualEvent(state, "status", "player", "无秽可清", "teal");
    return;
  }

  for (const enemy of state.enemies) {
    if (enemy.definitionId === "boss_qin_demon_echo" && enemy.hp > 0) {
      enemy.block = Math.max(0, enemy.block - removed * 4);
    }
  }

  state.combatLog.push("清音解秽");
  pushVisualEvent(state, "status", "player", `净化 ${removed}`, "teal", removed);
  triggerCleanseRelics(state);
  triggerQingyuQinhui(state);
}

function handleCardDrawn(state: CombatState, card: CardInstance): void {
  const definition = getCardDefinition(state, card);
  if (definition.rarity !== "status" && definition.rarity !== "curse") {
    return;
  }

  triggerQinDemonStatusDraw(state);
  triggerBrokenStringRelic(state);
  triggerQingyuQinhui(state);
}

function triggerQinDemonStatusDraw(state: CombatState): void {
  const qinDemon = state.enemies.find((enemy) => enemy.definitionId === "boss_qin_demon_echo" && enemy.hp > 0);
  if (!qinDemon) {
    return;
  }

  qinDemon.block += 4;
  state.combatLog.push("悲声回环");
  pushVisualEvent(state, "block", "enemy", "+4 护甲", "teal", 4);
}

function advanceIntent(enemy: EnemyState): void {
  enemy.intentIndex += 1;
  enemy.currentIntent = enemy.intents[enemy.intentIndex % enemy.intents.length] ?? enemy.currentIntent;
}

function refreshEnemyPhase(state: CombatState, enemy: EnemyState): void {
  if (!enemy.phaseIntents || enemy.hp <= 0) {
    return;
  }

  const hpRatio = enemy.hp / enemy.maxHp;
  const nextPhase = enemy.phaseIntents
    .filter((phase) => hpRatio <= phase.thresholdHpRatio)
    .sort((left, right) => left.thresholdHpRatio - right.thresholdHpRatio)[0];

  if (!nextPhase || enemy.phase === nextPhase.phase) {
    return;
  }

  enemy.phase = nextPhase.phase;
  enemy.intents = nextPhase.intents.length > 0 ? nextPhase.intents : enemy.intents;
  enemy.intentIndex = 0;
  enemy.currentIntent = enemy.intents[0] ?? enemy.currentIntent;
  state.combatLog.push(nextPhase.phase);
  pushVisualEvent(state, "trigger", "enemy", nextPhase.phase, "gold");
}

function beginPlayerTurn(state: CombatState): void {
  ensureComboTracking(state);
  ensureEchoQueue(state);
  state.turn += 1;
  state.player.block = 0;
  state.player.energy = state.player.maxEnergy;
  state.playedCardTypesThisTurn = [];
  state.comboTriggersThisTurn = [];
  state.lastPlayedCardExhaustedThisTurn = false;
  state.attacksPlayedThisTurn = 0;
  triggerEchoQueue(state);
  triggerFormationTurnStart(state);
  drawCards(state, state.player.drawPerTurn - state.piles.hand.length, createRng(state.turn * 1009));
  pushVisualEvent(state, "turn", "center", `回合 ${state.turn}`, "neutral");
}

function triggerEchoQueue(state: CombatState): void {
  if (state.echoQueue.length === 0) {
    return;
  }

  const queue = state.echoQueue.splice(0, 3);
  state.combatLog.push("余韵");
  pushVisualEvent(state, "trigger", "player", "余韵", "teal");

  for (const echo of queue) {
    const source = state.cardDefinitions[echo.sourceCardId];
    if (!source) {
      continue;
    }

    const card = {
      instanceId: `echo-${echo.id}`,
      definitionId: echo.sourceCardId
    };
    const targetId = resolveEchoTargetId(state, echo);
    for (const effect of echo.effects) {
      if (effect.action === "queueEcho") {
        continue;
      }
      applyEffect(state, source, card, effect, targetId);
    }
  }
}

function resolveEchoTargetId(state: CombatState, echo: EchoQueueItem): string {
  if (echo.targetId === "player") {
    return "player";
  }

  const originalTarget = state.enemies.find((enemy) => enemy.id === echo.targetId && enemy.hp > 0);
  return originalTarget?.id ?? state.enemies.find((enemy) => enemy.hp > 0)?.id ?? echo.targetId;
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

function applyCombatStartRelics(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_white_feather_fan", "player", "gold")) {
    const moved = scryTopCards(state, 3);
    if (moved > 0) {
      gainResource(state, 1);
      pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "gold", 1);
    }
  }

  if (hasRelic(state, "relic_red_lacquer_token")) {
    state.player.block += 2;
    state.combatLog.push("朱漆令");
    pushVisualEvent(state, "block", "player", "+2 护甲", "gold", 2);
  }

  if (hasRelic(state, "relic_traveling_cloak")) {
    state.player.block += 3;
    state.combatLog.push("行脚斗篷");
    pushVisualEvent(state, "block", "player", "+3 护甲", "teal", 3);
  }

  if (hasRelic(state, "relic_closed_moon_sachet")) {
    const enemy = state.enemies.find((item) => item.hp > 0);
    if (enemy) {
      enemy.statuses.charm = (enemy.statuses.charm ?? 0) + 2;
      if (state.enemies.length === 1) {
        enemy.statuses.weak = (enemy.statuses.weak ?? 0) + 1;
      }
      state.combatLog.push("闭月香囊");
      pushVisualEvent(state, "trigger", "enemy", "闭月香囊", "gold");
    }
  }
}

function triggerFormationTurnStart(state: CombatState): void {
  const formation = state.activeFormation;
  if (!formation || formation.duration <= 0) {
    return;
  }

  if ((formation.drawAtTurnStart ?? 0) > 0) {
    drawCards(state, formation.drawAtTurnStart ?? 0, createRng(state.turn * 461 + state.nextInstanceNumber));
    state.combatLog.push(formation.name);
    pushVisualEvent(state, "draw", "player", `抽牌 +${formation.drawAtTurnStart}`, "gold", formation.drawAtTurnStart);
  }
}

function triggerFormationTurnEnd(state: CombatState): void {
  const formation = state.activeFormation;
  if (!formation || formation.duration <= 0) {
    return;
  }

  if ((formation.blockAtTurnEnd ?? 0) > 0) {
    state.player.block += formation.blockAtTurnEnd ?? 0;
    state.combatLog.push(formation.name);
    pushVisualEvent(state, "block", "player", `+${formation.blockAtTurnEnd} 护甲`, "gold", formation.blockAtTurnEnd);
  }

  if ((formation.damageAtTurnEnd ?? 0) > 0) {
    const enemy = state.enemies.find((item) => item.hp > 0);
    if (enemy) {
      state.combatLog.push(formation.name);
      damageEnemy(state, enemy.id, formation.damageAtTurnEnd ?? 0);
    }
  }

  formation.duration -= 1;
  if (formation.duration <= 0) {
    state.activeFormation = undefined;
  }
}

function triggerInkRelics(state: CombatState, inkAmount: number): void {
  if (inkAmount > 0 && hasRelic(state, "relic_black_paper_umbrella")) {
    state.player.block += 2;
    state.combatLog.push("黑纸伞");
    pushVisualEvent(state, "block", "player", "+2 护甲", "ink", 2);
  }

  if (inkAmount > 0 && triggerRelicOnce(state, "relic_ink_washstone", "player", "ink")) {
    drawCards(state, 1, createRng(state.turn * 419 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }

  if (inkAmount > 0 && triggerRelicOnce(state, "relic_unwritten_inkstone", "player", "ink")) {
    state.player.block += 2;
    drawCards(state, 1, createRng(state.turn * 421 + state.nextInstanceNumber));
    pushVisualEvent(state, "block", "player", "+2 护甲", "ink", 2);
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }
}

function triggerBreakFormationRelics(state: CombatState): void {
  if (!hasRelic(state, "relic_white_dragon_tassel") || state.relicMemory.relic_white_dragon_tassel) {
    return;
  }

  state.player.energy += 1;
  drawCards(state, 1, createRng(state.turn * 211 + state.nextInstanceNumber));
  state.relicMemory.relic_white_dragon_tassel = true;
  state.combatLog.push("白龙枪缨");
  pushVisualEvent(state, "trigger", "player", "白龙枪缨", "gold");
}

function hasRelic(state: CombatState, relicId: string): boolean {
  return state.relicIds.includes(relicId);
}

function triggerRelicOnce(state: CombatState, relicId: string, target: CombatVisualTarget, tone: CombatVisualTone): boolean {
  if (!hasRelic(state, relicId) || state.relicMemory[relicId]) {
    return false;
  }

  const relic = relicsById[relicId];
  state.relicMemory[relicId] = true;
  state.combatLog.push(relic?.name ?? relicId);
  pushVisualEvent(state, "trigger", target, relic?.name ?? relicId, tone);
  return true;
}

function triggerThirdAttackRelics(state: CombatState, targetId: string): void {
  if (state.attacksPlayedThisTurn !== 3) {
    return;
  }

  if (triggerRelicOnce(state, "relic_dragon_scale_tip", "enemy", "red")) {
    damageEnemy(state, targetId, 3);
  }

  if (triggerRelicOnce(state, "relic_cloud_dragon_scale", "player", "teal")) {
    gainResource(state, 1);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "teal", 1);
  }
}

function triggerGuardSuccessRelics(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_changban_iron_seal", "player", "teal")) {
    drawCards(state, 1, createRng(state.turn * 431 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }

  if (triggerRelicOnce(state, "relic_white_cloak_knot", "player", "teal")) {
    state.player.block += 3;
    pushVisualEvent(state, "block", "player", "+3 护甲", "teal", 3);
  }
}

function triggerBodyRelics(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_lotus_step_bell", "player", "teal")) {
    drawCards(state, 1, createRng(state.turn * 443 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }

  if (triggerRelicOnce(state, "relic_moon_shadow_bell", "player", "teal")) {
    state.player.statuses.dodge = (state.player.statuses.dodge ?? 0) + 1;
    pushVisualEvent(state, "status", "player", "闪避 +1", "teal", 1);
  }
}

function triggerCharmThresholdRelics(state: CombatState, targetId: string): void {
  const enemy = state.enemies.find((item) => item.id === targetId);
  if (!enemy || (enemy.statuses.charm ?? 0) < 4) {
    return;
  }

  if (triggerRelicOnce(state, "relic_half_moon_hairpin", "enemy", "teal")) {
    enemy.statuses.vulnerable = (enemy.statuses.vulnerable ?? 0) + 1;
    pushVisualEvent(state, "status", "enemy", "易伤 +1", "teal", 1);
  }

  if (triggerRelicOnce(state, "relic_silk_scheme_token", "player", "teal")) {
    drawCards(state, 1, createRng(state.turn * 449 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }
}

function triggerMindRelics(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_silent_zither_string", "player", "gold")) {
    state.player.block += 2;
    pushVisualEvent(state, "block", "player", "+2 护甲", "gold", 2);
  }

  if (triggerRelicOnce(state, "relic_still_heart_lantern", "player", "gold")) {
    state.player.block += 4;
    drawCards(state, 1, createRng(state.turn * 457 + state.nextInstanceNumber));
    pushVisualEvent(state, "block", "player", "+4 护甲", "gold", 4);
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }
}

function triggerCleanseRelics(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_qingyin_jade", "player", "teal")) {
    state.player.block += 2;
    drawCards(state, 1, createRng(state.turn * 467 + state.nextInstanceNumber));
    pushVisualEvent(state, "block", "player", "+2 护甲", "teal", 2);
  }

  if (triggerRelicOnce(state, "relic_clear_rain_score", "player", "teal")) {
    gainResource(state, 1);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "teal", 1);
  }
}

function triggerQingyuQinhui(state: CombatState): void {
  if (!triggerRelicOnce(state, "relic_qingyu_qinhui", "player", "teal")) {
    return;
  }

  gainResource(state, 1);
  pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "gold", 1);
}

function triggerBrokenStringRelic(state: CombatState): void {
  if (!triggerRelicOnce(state, "relic_broken_string", "enemy", "ink")) {
    return;
  }

  const enemy = state.enemies.find((item) => item.hp > 0);
  if (enemy) {
    enemy.block = Math.max(0, enemy.block - 2);
    pushVisualEvent(state, "block", "enemy", "护甲 -2", "ink", 2);
  }
}

function triggerEchoingJadeChimeRelic(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_echoing_jade_chime", "player", "teal")) {
    drawCards(state, 1, createRng(state.turn * 479 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }

  if (triggerRelicOnce(state, "relic_orchid_jade_pick", "player", "teal")) {
    state.player.block += 3;
    pushVisualEvent(state, "block", "player", "+3 护甲", "teal", 3);
  }
}

function triggerStarlitTacticalMapRelic(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_starlit_tactical_map", "player", "gold")) {
    gainResource(state, 1);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "gold", 1);
  }

  if (triggerRelicOnce(state, "relic_bagua_copper_coin", "player", "gold")) {
    state.player.block += 4;
    pushVisualEvent(state, "block", "player", "+4 护甲", "gold", 4);
  }
}

function triggerAstrolabeShardRelic(state: CombatState): void {
  if (triggerRelicOnce(state, "relic_astrolabe_shard", "player", "gold")) {
    drawCards(state, 1, createRng(state.turn * 491 + state.nextInstanceNumber));
    pushVisualEvent(state, "draw", "player", "抽牌 +1", "neutral", 1);
  }
}

function hasMethod(state: CombatState, methodId: MethodId): boolean {
  return state.methodIds.includes(methodId);
}

function triggerMethodOnce(state: CombatState, methodId: MethodId, target: CombatVisualTarget, tone: CombatVisualTone): boolean {
  if (!hasMethod(state, methodId) || state.methodMemory[methodId]) {
    return false;
  }

  const method = methodsById[methodId];
  state.methodMemory[methodId] = true;
  const label = getMethodLevel(state, methodId) >= 2 ? `${method.name}·进境` : method.name;
  state.combatLog.push(label);
  pushVisualEvent(state, "trigger", target, label, tone);
  return true;
}

function triggerDragonSpearChainMethod(state: CombatState, rule: ComboRule): void {
  if (state.character.id !== "zhaoyun" || rule.id !== "lianzhan") {
    return;
  }

  if (triggerMethodOnce(state, "method_dragon_spear_chain", "player", "gold")) {
    const amount = getMethodLevel(state, "method_dragon_spear_chain") >= 2 ? 2 : 1;
    gainResource(state, amount);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +${amount}`, "gold", amount);
  }
}

function triggerChangbanGuardMethod(state: CombatState): void {
  if (state.character.id !== "zhaoyun") {
    return;
  }

  if (triggerMethodOnce(state, "method_changban_guard", "player", "teal")) {
    const amount = getMethodLevel(state, "method_changban_guard") >= 2 ? 2 : 1;
    state.player.statuses.guard = (state.player.statuses.guard ?? 0) + amount;
    pushVisualEvent(state, "status", "player", `护主 +${amount}`, "teal", amount);
  }
}

function triggerJinghongDanceMethod(state: CombatState): void {
  if (state.character.id !== "diaochan") {
    return;
  }

  if (triggerMethodOnce(state, "method_jinghong_dance", "player", "gold")) {
    const amount = getMethodLevel(state, "method_jinghong_dance") >= 2 ? 2 : 1;
    gainResource(state, amount);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +${amount}`, "gold", amount);
  }
}

function triggerQingchengCharmMethod(state: CombatState, targetId: string): void {
  if (state.character.id !== "diaochan") {
    return;
  }

  if (triggerMethodOnce(state, "method_qingcheng_charm", "enemy", "teal")) {
    applyStatus(state, targetId, "charm", getMethodLevel(state, "method_qingcheng_charm") >= 2 ? 2 : 1);
  }
}

function triggerQingyinEchoMethod(state: CombatState): void {
  if (triggerMethodOnce(state, "method_qingyin_echo", "player", "teal")) {
    const amount = getMethodLevel(state, "method_qingyin_echo") >= 2 ? 2 : 1;
    gainResource(state, amount);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +${amount}`, "gold", amount);
  }
}

function triggerHujiaCleanseMethod(state: CombatState): void {
  if (triggerMethodOnce(state, "method_hujia_cleanse", "player", "teal")) {
    const amount = getMethodLevel(state, "method_hujia_cleanse") >= 2 ? 5 : 3;
    state.player.block += amount;
    pushVisualEvent(state, "block", "player", `+${amount} 护甲`, "teal", amount);
  }
}

function triggerStarObservationMethod(state: CombatState): void {
  if (triggerMethodOnce(state, "method_star_observation", "player", "gold")) {
    const amount = getMethodLevel(state, "method_star_observation") >= 2 ? 2 : 1;
    gainResource(state, amount);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +${amount}`, "gold", amount);
  }
}

function triggerWindArrayMethod(state: CombatState): void {
  if (triggerMethodOnce(state, "method_wind_array", "player", "gold")) {
    const amount = getMethodLevel(state, "method_wind_array") >= 2 ? 5 : 3;
    state.player.block += amount;
    pushVisualEvent(state, "block", "player", `+${amount} 护甲`, "gold", amount);
  }
}

function getMethodLevel(state: CombatState, methodId: MethodId): number {
  return Math.max(1, state.methodLevels?.[methodId] ?? 1);
}

function isEchoOrQinCard(definition: CardDefinition): boolean {
  return (definition.keywords ?? []).some((keyword) => keyword === "echo" || keyword === "qin");
}

function isCleanseCard(definition: CardDefinition): boolean {
  return (definition.keywords ?? []).includes("cleanse") || definition.effects.some((effect) => effect.action === "cleanseCards");
}

function isScryCard(definition: CardDefinition): boolean {
  return (definition.keywords ?? []).includes("scry") || definition.effects.some((effect) => effect.action === "scry");
}

function isFormationCard(definition: CardDefinition): boolean {
  return (definition.keywords ?? []).includes("formation") || definition.effects.some((effect) => effect.action === "setFormation");
}

function isBasicAttack(definition: CardDefinition): boolean {
  return definition.types.includes("attack") && (
    definition.rarity === "starter" ||
    definition.id === "strike" ||
    definition.id === "zhao_strike" ||
    definition.id === "diao_strike" ||
    definition.id === "zhuge_fan_strike"
  );
}

function settleInkMarks(state: CombatState): void {
  if (state.player.inkMarks <= 0) {
    return;
  }

  const reduction = hasRelic(state, "relic_clear_rain_charm") ? 1 : 0;
  const inkLoss = Math.max(0, state.player.inkMarks - reduction);
  state.player.hp = Math.max(1, state.player.hp - inkLoss);
  state.combatLog.push("墨痕结算");
  if (reduction > 0) {
    state.combatLog.push("清雨符");
    pushVisualEvent(state, "trigger", "player", "清雨符", "ink");
  }
  pushVisualEvent(state, "ink", "player", `墨痕 -${inkLoss}`, "ink", inkLoss);
}

function pushVisualEvent(
  state: CombatState,
  kind: CombatVisualEventKind,
  target: CombatVisualTarget,
  label: string,
  tone: CombatVisualTone,
  amount?: number,
  sourceCardId?: string,
  visualCue?: CardVisualCueId
): void {
  state.visualEvents.push({
    id: state.nextVisualEventId,
    kind,
    target,
    label,
    tone,
    amount,
    sourceCardId,
    visualCue
  });
  state.nextVisualEventId += 1;

  if (state.visualEvents.length > 12) {
    state.visualEvents.splice(0, state.visualEvents.length - 12);
  }
}

function ensureComboTracking(state: CombatState): void {
  if (!Array.isArray(state.comboTriggersThisTurn)) {
    state.comboTriggersThisTurn = [];
  }

  if (!Array.isArray(state.comboTriggersThisCombat)) {
    state.comboTriggersThisCombat = [];
  }

  if (!Array.isArray(state.methodIds)) {
    state.methodIds = [];
  }

  if (!state.methodLevels || typeof state.methodLevels !== "object") {
    state.methodLevels = {};
  }

  if (!state.methodMemory || typeof state.methodMemory !== "object") {
    state.methodMemory = {};
  }

  if (typeof state.lastPlayedCardExhaustedThisTurn !== "boolean") {
    state.lastPlayedCardExhaustedThisTurn = false;
  }

  ensureEchoQueue(state);
}

function ensureEchoQueue(state: CombatState): void {
  if (!Array.isArray(state.echoQueue)) {
    state.echoQueue = [];
  }
}

function formatStatus(status: StatusId): string {
  const names: Record<StatusId, string> = {
    charm: "魅惑",
    weak: "虚弱",
    vulnerable: "易伤",
    dodge: "闪避",
    guard: "护主",
    ink: "墨"
  };
  return names[status];
}

function formatMind(mind: MindState): string {
  const names: Record<MindState, string> = {
    none: "无",
    ning: "宁",
    nu: "怒",
    bei: "悲",
    mei: "魅",
    luan: "乱",
    wu: "悟"
  };
  return names[mind];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
