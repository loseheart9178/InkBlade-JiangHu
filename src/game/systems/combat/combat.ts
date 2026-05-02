import { createRng, shuffleInPlace, type Rng } from "../../core/rng";
import { methodsById, type MethodId } from "../../content/methods";
import { defaultComboRules, exhaustAttackComboRule } from "./combos";
import type {
  CardDefinition,
  ComboEffect,
  ComboRule,
  CardEffect,
  CardInstance,
  CardType,
  CombatState,
  CreateCombatInput,
  EnemyDefinition,
  EnemyIntentEffect,
  EnemyIntent,
  EnemyState,
  MindState,
  PlayCardResult,
  StatusId,
  CombatVisualEventKind,
  CombatVisualTarget,
  CombatVisualTone
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
    methodMemory: {},
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
    case "applyStatus":
      applyStatus(state, targetId, effect.status, effect.amount);
      if (effect.status === "charm" && targetId !== "player") {
        triggerQingchengCharmMethod(state, targetId);
      }
      break;
    case "gainInk":
      gainInk(state, effect.amount);
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

  if ((state.player.statuses.dodge ?? 0) > 0) {
    state.player.statuses.dodge = Math.max(0, (state.player.statuses.dodge ?? 0) - 1);
    pushVisualEvent(state, "status", "player", "闪避", "teal");
    return;
  }

  if ((state.player.statuses.guard ?? 0) > 0) {
    const reduced = Math.min(4 * (state.player.statuses.guard ?? 0), amount);
    amount -= reduced;
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
}

function gainResource(state: CombatState, amount: number): void {
  state.player.resource.value = clamp(state.player.resource.value + amount, 0, state.player.resource.max);
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
    pushVisualEvent(state, "trigger", "center", "破阵", "gold");
    triggerBreakFormationRelics(state);
  }

  if (state.character.id === "diaochan" && definition.types.includes("body")) {
    gainResource(state, 1);
    triggerJinghongDanceMethod(state);
  }
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

function advanceIntent(enemy: EnemyState): void {
  enemy.intentIndex += 1;
  enemy.currentIntent = enemy.intents[enemy.intentIndex % enemy.intents.length] ?? enemy.currentIntent;
}

function beginPlayerTurn(state: CombatState): void {
  ensureComboTracking(state);
  state.turn += 1;
  state.player.block = 0;
  state.player.energy = state.player.maxEnergy;
  state.playedCardTypesThisTurn = [];
  state.comboTriggersThisTurn = [];
  state.lastPlayedCardExhaustedThisTurn = false;
  state.attacksPlayedThisTurn = 0;
  drawCards(state, state.player.drawPerTurn - state.piles.hand.length, createRng(state.turn * 1009));
  pushVisualEvent(state, "turn", "center", `回合 ${state.turn}`, "neutral");
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

function triggerInkRelics(state: CombatState, inkAmount: number): void {
  if (inkAmount > 0 && hasRelic(state, "relic_black_paper_umbrella")) {
    state.player.block += 2;
    state.combatLog.push("黑纸伞");
    pushVisualEvent(state, "block", "player", "+2 护甲", "ink", 2);
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

function hasMethod(state: CombatState, methodId: MethodId): boolean {
  return state.methodIds.includes(methodId);
}

function triggerMethodOnce(state: CombatState, methodId: MethodId, target: CombatVisualTarget, tone: CombatVisualTone): boolean {
  if (!hasMethod(state, methodId) || state.methodMemory[methodId]) {
    return false;
  }

  const method = methodsById[methodId];
  state.methodMemory[methodId] = true;
  state.combatLog.push(method.name);
  pushVisualEvent(state, "trigger", target, method.name, tone);
  return true;
}

function triggerDragonSpearChainMethod(state: CombatState, rule: ComboRule): void {
  if (state.character.id !== "zhaoyun" || rule.id !== "lianzhan") {
    return;
  }

  if (triggerMethodOnce(state, "method_dragon_spear_chain", "player", "gold")) {
    gainResource(state, 1);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "gold", 1);
  }
}

function triggerChangbanGuardMethod(state: CombatState): void {
  if (state.character.id !== "zhaoyun") {
    return;
  }

  if (triggerMethodOnce(state, "method_changban_guard", "player", "teal")) {
    state.player.statuses.guard = (state.player.statuses.guard ?? 0) + 1;
    pushVisualEvent(state, "status", "player", "护主 +1", "teal", 1);
  }
}

function triggerJinghongDanceMethod(state: CombatState): void {
  if (state.character.id !== "diaochan") {
    return;
  }

  if (triggerMethodOnce(state, "method_jinghong_dance", "player", "gold")) {
    gainResource(state, 1);
    pushVisualEvent(state, "resource", "player", `${state.player.resource.name} +1`, "gold", 1);
  }
}

function triggerQingchengCharmMethod(state: CombatState, targetId: string): void {
  if (state.character.id !== "diaochan") {
    return;
  }

  if (triggerMethodOnce(state, "method_qingcheng_charm", "enemy", "teal")) {
    applyStatus(state, targetId, "charm", 1);
  }
}

function isBasicAttack(definition: CardDefinition): boolean {
  return definition.types.includes("attack") && (
    definition.rarity === "starter" ||
    definition.id === "strike" ||
    definition.id === "zhao_strike" ||
    definition.id === "diao_strike"
  );
}

function settleInkMarks(state: CombatState): void {
  if (state.player.inkMarks <= 0) {
    return;
  }

  state.player.hp = Math.max(1, state.player.hp - state.player.inkMarks);
  state.combatLog.push("墨痕结算");
  pushVisualEvent(state, "ink", "player", `墨痕 -${state.player.inkMarks}`, "ink", state.player.inkMarks);
}

function pushVisualEvent(
  state: CombatState,
  kind: CombatVisualEventKind,
  target: CombatVisualTarget,
  label: string,
  tone: CombatVisualTone,
  amount?: number
): void {
  state.visualEvents.push({
    id: state.nextVisualEventId,
    kind,
    target,
    label,
    tone,
    amount
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

  if (!state.methodMemory || typeof state.methodMemory !== "object") {
    state.methodMemory = {};
  }

  if (typeof state.lastPlayedCardExhaustedThisTurn !== "boolean") {
    state.lastPlayedCardExhaustedThisTurn = false;
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
