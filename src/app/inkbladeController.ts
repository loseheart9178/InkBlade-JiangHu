import { cardList, cardsById } from "../game/content/cards";
import { charactersById } from "../game/content/characters";
import { enemiesById } from "../game/content/enemies";
import { eventsById, type GameEventChoice } from "../game/content/events";
import { relicsById } from "../game/content/relics";
import { createCombat, endPlayerTurn, playCard } from "../game/systems/combat/combat";
import type { CardDefinition, CombatState } from "../game/systems/combat/types";
import {
  addRelic,
  createRun,
  getAvailableNodes,
  getCurrentNode,
  getUpgradeCandidates,
  healRun,
  removeDeckCard,
  takeCardReward,
  travelToNode,
  upgradeDeckCard,
  type MapNode,
  type RunState
} from "../game/systems/run";

type Screen = "title" | "map" | "combat" | "reward" | "event" | "shop" | "rest" | "victory" | "defeat";

const SHOP_CARD_PRICE = 35;
const SHOP_REMOVE_PRICE = 50;
const SHOP_RELIC_IDS = ["relic_old_wooden_sword", "relic_black_paper_umbrella"];

interface ControllerState {
  screen: Screen;
  run?: RunState;
  combat?: CombatState;
  rewardCards: CardDefinition[];
  message: string;
}

export function createInkbladeController(host: HTMLElement) {
  const state: ControllerState = {
    screen: "title",
    rewardCards: [],
    message: ""
  };

  const render = () => {
    host.innerHTML = "";

    if (state.screen === "map") {
      renderMap(host, state, render);
      return;
    }

    if (state.screen === "combat") {
      renderCombat(host, state, render);
      return;
    }

    if (state.screen === "reward") {
      renderReward(host, state, render);
      return;
    }

    if (state.screen === "event") {
      renderEvent(host, state, render);
      return;
    }

    if (state.screen === "shop") {
      renderShop(host, state, render);
      return;
    }

    if (state.screen === "rest") {
      renderRest(host, state, render);
      return;
    }

    if (state.screen === "victory" || state.screen === "defeat") {
      renderResult(host, state, render);
    }
  };

  return {
    startRun(characterId: string) {
      state.run = createRun(characterId);
      state.combat = undefined;
      state.rewardCards = [];
      state.message = `${charactersById[characterId].name}踏入洛水黑雨。`;
      state.screen = "map";
      render();
    }
  };
}

function renderMap(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const current = getCurrentNode(run);
  const available = getAvailableNodes(run);
  const panel = createPanel("screen-map", "洛水残照");
  panel.classList.add("map-screen");

  panel.append(createRunStatus(run, state.message));

  const path = document.createElement("div");
  path.className = "route-map";

  for (const node of run.mapNodes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `map-node map-node--${node.type}`;
    button.dataset.testid = `map-node-${node.id}`;
    button.textContent = node.label;
    button.disabled = !available.some((item) => item.id === node.id);

    if (node.id === current.id) {
      button.classList.add("is-current");
      button.disabled = true;
    }

    if (run.visitedNodeIds.includes(node.id)) {
      button.classList.add("is-visited");
    }

    button.addEventListener("click", () => {
      travelToNode(run, node.id);
      enterNode(state, node);
      render();
    });
    path.append(button);
  }

  panel.append(path);
  host.append(panel);
}

function enterNode(state: ControllerState, node: MapNode): void {
  if (node.type === "battle" || node.type === "elite" || node.type === "boss") {
    startCombatForNode(state, node);
    return;
  }

  if (node.type === "event") {
    state.message = "黑雨敲船，旧事浮上水面。";
    state.screen = "event";
    return;
  }

  if (node.type === "shop") {
    state.message = "游商把残页、药囊和旧剑谱排在茶桌上。";
    state.screen = "shop";
    return;
  }

  if (node.type === "rest") {
    state.message = "残佛无言，雨声洗去一身墨气。";
    state.screen = "rest";
  }
}

function startCombatForNode(state: ControllerState, node: MapNode): void {
  const run = requireRun(state);
  const character = charactersById[run.characterId];
  const enemy = node.enemyId ? enemiesById[node.enemyId] : enemiesById.enemy_ink_bandit;

  state.combat = createCombat({
    character: {
      ...character,
      starterDeck: run.deck.map((entry) => entry.cardId)
    },
    cards: cardList,
    playerHp: run.hp,
    enemies: [enemy],
    relicIds: [...run.relicIds],
    upgradedCardInstanceIds: getUpgradedCombatInstanceIds(run),
    rngSeed: run.deck.length + run.rewardHistory.length + 17,
    shuffleDeck: true
  });
  state.message = `${enemy.name}显出意图。`;
  state.screen = "combat";
}

function renderCombat(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const combat = requireCombat(state);
  const enemy = combat.enemies[0];
  const panel = createPanel("screen-combat", "回合 " + combat.turn);
  panel.classList.add("combat-screen");

  const top = document.createElement("div");
  top.className = "combat-topbar";
  top.append(
    createMeter("player-hp", combat.player.name, combat.player.hp, combat.player.maxHp, "朱砂"),
    createIntent(enemy.currentIntent),
    createMeter("enemy-hp", enemy.name, enemy.hp, enemy.maxHp, "青墨")
  );

  const field = document.createElement("div");
  field.className = "combat-field";
  field.innerHTML = `
    <div class="combatant combatant--player">
      <div class="portrait-ring portrait-ring--red">${combat.player.name.slice(0, 1)}</div>
      <div class="resource-pill">${combat.player.resource.name} ${combat.player.resource.value}/${combat.player.resource.max}</div>
      <div class="status-line" data-testid="player-status">护甲 ${combat.player.block} · 心境 ${formatMind(combat.player.mind)} · 墨痕 ${combat.player.inkMarks}</div>
    </div>
    <div class="duel-mark">对决</div>
    <div class="combatant combatant--enemy">
      <div class="portrait-ring portrait-ring--teal">${enemy.name.slice(0, 1)}</div>
      <div class="status-line" data-testid="enemy-status">护甲 ${enemy.block} · 魅惑 ${enemy.statuses.charm ?? 0} · 虚弱 ${enemy.statuses.weak ?? 0}</div>
    </div>
  `;

  const hand = document.createElement("div");
  hand.className = "hand-zone";
  hand.dataset.testid = "hand-zone";

  const energy = document.createElement("div");
  energy.className = "energy-orb";
  energy.dataset.testid = "energy";
  energy.textContent = `${combat.player.energy}/${combat.player.maxEnergy}`;
  hand.append(energy);

  for (const card of combat.piles.hand) {
    const definition = combat.cardDefinitions[card.definitionId];
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = `combat-card card-type-${definition.types[0]}`;
    if (card.upgraded) {
      cardButton.classList.add("is-upgraded");
    }
    cardButton.dataset.testid = `card-${card.instanceId}`;
    cardButton.disabled = definition.cost > combat.player.energy;
    cardButton.innerHTML = `
      <span class="card-cost">${definition.cost}</span>
      <strong>${definition.name}${card.upgraded ? " +" : ""}</strong>
      <small>${formatTypes(definition.types)}</small>
      <span>${definition.description ?? ""}</span>
    `;
    cardButton.addEventListener("click", () => {
      const targetId = definition.target === "enemy" ? enemy.id : "player";
      const result = playCard(combat, card.instanceId, targetId);
      state.message = result.ok ? `${definition.name}已出。` : explainPlayFailure(result.reason);
      handleCombatAfterAction(state);
      render();
    });
    hand.append(cardButton);
  }

  const controls = document.createElement("div");
  controls.className = "combat-controls";
  const endTurn = document.createElement("button");
  endTurn.type = "button";
  endTurn.dataset.testid = "end-turn";
  endTurn.textContent = "结束回合";
  endTurn.addEventListener("click", () => {
    endPlayerTurn(combat);
    state.message = "敌意落下，新的回合开始。";
    handleCombatAfterAction(state);
    render();
  });
  controls.append(
    createPileCounter("抽牌", combat.piles.draw.length),
    createPileCounter("弃牌", combat.piles.discard.length),
    createPileCounter("消耗", combat.piles.exhaust.length),
    endTurn
  );

  panel.append(top, field, createMessage(state.message), hand, controls);
  host.append(panel);

  run.hp = combat.player.hp;
}

function handleCombatAfterAction(state: ControllerState): void {
  const run = requireRun(state);
  const combat = requireCombat(state);
  run.hp = combat.player.hp;

  if (combat.phase === "lost") {
    state.screen = "defeat";
    state.message = "黑雨没过衣袂，本次行旅止于此处。";
    return;
  }

  if (combat.phase === "won") {
    const node = getCurrentNode(run);
    if (node.type === "boss") {
      state.screen = "victory";
      state.message = "墨影董卓崩散，洛水重映天光。";
      return;
    }

    state.rewardCards = createRewardCards(run);
    state.screen = "reward";
    state.message = "战斗胜利，选择一式武学。";
  }
}

function renderReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-reward", "战利");
  panel.classList.add("reward-screen");
  panel.append(createMessage(state.message));

  const rewards = document.createElement("div");
  rewards.className = "reward-cards";
  for (const card of state.rewardCards) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `reward-card card-type-${card.types[0]}`;
    button.dataset.testid = "reward-card";
    button.innerHTML = `<strong>${card.name}</strong><span>${card.description ?? ""}</span>`;
    button.addEventListener("click", () => {
      takeCardReward(run, card);
      run.gold += 12;
      state.message = `获得${card.name}，并拾得12枚铜钱。`;
      state.screen = "map";
      render();
    });
    rewards.append(button);
  }

  const skip = document.createElement("button");
  skip.type = "button";
  skip.textContent = "跳过，取15铜钱";
  skip.addEventListener("click", () => {
    run.gold += 15;
    state.message = "你收起铜钱，继续前行。";
    state.screen = "map";
    render();
  });

  panel.append(rewards, skip);
  host.append(panel);
}

function renderEvent(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const event = eventsById.event_black_rain_ferry;
  const panel = createPanel("screen-event", event.title);
  panel.classList.add("event-screen");
  panel.append(createMessage(event.description));

  for (const choice of event.choices) {
    const action = createAction(choice.label, choice.summary, () => {
      applyEventChoice(run, choice);
      state.message = `${event.title}：${choice.label}`;
      state.screen = "map";
      render();
    });
    action.dataset.testid = `event-choice-${choice.id}`;
    panel.append(action);
  }

  host.append(panel);
}

function applyEventChoice(run: RunState, choice: GameEventChoice): void {
  const effect = choice.effect;

  if (effect.type === "gold") {
    run.gold += effect.amount;
  }

  if (effect.type === "heal") {
    healRun(run, effect.amount);
  }

  if (effect.type === "card") {
    takeCardReward(run, cardsById[effect.cardId]);
    if (effect.hpLoss) {
      run.hp = Math.max(1, run.hp - effect.hpLoss);
    }
  }

  if (effect.type === "mind") {
    run.rewardHistory.push(`mind:${effect.mind}:${effect.amount}`);
  }
}

function renderShop(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-shop", "茶亭游商");
  panel.classList.add("shop-screen");
  panel.append(createRunStatus(run, state.message));

  const shopCards = [cardsById.common_pifeng, cardsById.common_tuna, cardsById.ink_moren];
  const list = document.createElement("div");
  list.className = "shop-list";

  for (const card of shopCards) {
    const button = createAction(card.name, `${card.description ?? ""} 价格${SHOP_CARD_PRICE}`, () => {
      if (run.gold < SHOP_CARD_PRICE) {
        state.message = "铜钱不足。";
        render();
        return;
      }

      run.gold -= SHOP_CARD_PRICE;
      takeCardReward(run, card);
      state.message = `购得${card.name}。`;
      render();
    });
    button.dataset.testid = `shop-card-${card.id}`;
    list.append(button);
  }

  const relicList = document.createElement("div");
  relicList.className = "shop-list shop-list--relics";
  for (const relicId of SHOP_RELIC_IDS) {
    const relic = relicsById[relicId];
    const owned = run.relicIds.includes(relic.id);
    const button = createAction(relic.name, `${relic.description} 价格${relic.price}`, () => {
      if (owned) {
        state.message = `已持有${relic.name}。`;
        render();
        return;
      }

      if (run.gold < relic.price) {
        state.message = "铜钱不足。";
        render();
        return;
      }

      run.gold -= relic.price;
      addRelic(run, relic.id);
      state.message = `购得法宝：${relic.name}。`;
      render();
    });
    button.dataset.testid = `shop-relic-${relic.id}`;
    button.disabled = owned;
    relicList.append(button);
  }

  const serviceList = document.createElement("div");
  serviceList.className = "shop-list shop-list--services";
  const removable = getShopRemovalCandidate(run);
  const removeButton = createAction(
    "洗去旧招",
    removable ? `删去${cardsById[removable.cardId].name}，价格${SHOP_REMOVE_PRICE}` : "牌组过薄，暂不可删牌。",
    () => {
      if (!removable) {
        state.message = "牌组过薄，暂不可删牌。";
        render();
        return;
      }

      if (run.gold < SHOP_REMOVE_PRICE) {
        state.message = "铜钱不足。";
        render();
        return;
      }

      run.gold -= SHOP_REMOVE_PRICE;
      removeDeckCard(run, removable.instanceId);
      state.message = `删去${cardsById[removable.cardId].name}。`;
      render();
    }
  );
  removeButton.dataset.testid = "shop-remove-card";
  removeButton.disabled = !removable;
  serviceList.append(removeButton);

  const leave = createAction("离开茶亭", "继续行旅", () => {
    state.message = "茶香在身后淡去。";
    state.screen = "map";
    render();
  });
  leave.dataset.testid = "shop-leave";
  panel.append(list, relicList, serviceList, leave);
  host.append(panel);
}

function renderRest(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-rest", "废寺静修");
  panel.classList.add("rest-screen");
  panel.append(createRunStatus(run, state.message));

  const heal = createAction("调息疗伤", "回复最大生命30%", () => {
    const healed = healRun(run, Math.ceil(run.maxHp * 0.3));
    state.message = `回复${healed}点生命。`;
    state.screen = "map";
    render();
  });
  heal.dataset.testid = "rest-heal";

  const candidate = getUpgradeCandidates(run)[0];
  const upgrade = createAction(
    "磨砺招式",
    candidate ? `精修${cardsById[candidate.cardId].name}：伤害或护甲+3。` : "所有招式都已精修。",
    () => {
      if (!candidate) {
        state.message = "暂无可精修的招式。";
        render();
        return;
      }

      upgradeDeckCard(run, candidate.instanceId);
      state.message = `精修${cardsById[candidate.cardId].name}。`;
      state.screen = "map";
      render();
    }
  );
  upgrade.dataset.testid = "rest-upgrade-card";
  upgrade.disabled = !candidate;
  panel.append(heal, upgrade);
  host.append(panel);
}

function renderResult(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = state.run;
  const panel = createPanel(state.screen === "victory" ? "screen-victory" : "screen-defeat", state.screen === "victory" ? "本章告捷" : "梦醒听雨亭");
  panel.classList.add("result-screen");
  panel.append(createMessage(state.message));

  const restart = document.createElement("button");
  restart.type = "button";
  restart.textContent = "再入江湖";
  restart.addEventListener("click", () => {
    state.run = createRun(run?.characterId ?? "zhaoyun");
    state.combat = undefined;
    state.message = "黑雨仍未停。";
    state.screen = "map";
    render();
  });
  panel.append(restart);
  host.append(panel);
}

function createRewardCards(run: RunState): CardDefinition[] {
  const zhao = [cardsById.zhao_thrust, cardsById.zhao_guardian, cardsById.zhao_white_dragon, cardsById.zhao_break_spear];
  const diao = [cardsById.diao_hongyan, cardsById.diao_glance, cardsById.diao_red_ribbon, cardsById.diao_step_lotus];
  const common = [cardsById.common_pifeng, cardsById.common_gedang, cardsById.mind_jingxin, cardsById.ink_modian];
  const rolePool = run.characterId === "zhaoyun" ? zhao : diao;
  const offset = run.rewardHistory.length % rolePool.length;

  return [rolePool[offset], common[offset % common.length], common[(offset + 1) % common.length]];
}

function createPanel(testId: string, title: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "game-panel";
  panel.dataset.testid = testId;
  const heading = document.createElement("h2");
  heading.textContent = title;
  panel.append(heading);
  return panel;
}

function createRunStatus(run: RunState, message: string): HTMLElement {
  const status = document.createElement("div");
  status.className = "run-status";
  const relicNames = run.relicIds.map((id) => relicsById[id]?.name ?? id).join("、");
  status.innerHTML = `
    <span>生命 ${run.hp}/${run.maxHp}</span>
    <span>铜钱 ${run.gold}</span>
    <span>牌组 ${run.deck.length}</span>
    <span data-testid="run-relics">法宝 ${relicNames}</span>
    <em>${message}</em>
  `;
  return status;
}

function createMeter(testId: string, label: string, value: number, max: number, accent: string): HTMLElement {
  const meter = document.createElement("div");
  meter.className = "combat-meter";
  meter.dataset.testid = testId;
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  meter.innerHTML = `
    <span>${label}</span>
    <strong>${value}/${max}</strong>
    <div class="meter-track"><i style="width: ${percent}%"></i></div>
    <small>${accent}</small>
  `;
  return meter;
}

function createIntent(intent: CombatState["enemies"][number]["currentIntent"]): HTMLElement {
  const box = document.createElement("div");
  box.className = "intent-box";
  if (intent.type === "attack") {
    box.textContent = intent.hits > 1 ? `杀意 ${intent.damage}x${intent.hits}` : `杀意 ${intent.damage}`;
  } else if (intent.type === "block") {
    box.textContent = `运功 ${intent.block}`;
  } else {
    box.textContent = "观望";
  }
  return box;
}

function createPileCounter(label: string, count: number): HTMLElement {
  const item = document.createElement("span");
  item.className = "pile-counter";
  item.textContent = `${label} ${count}`;
  return item;
}

function createMessage(message: string): HTMLElement {
  const element = document.createElement("p");
  element.className = "game-message";
  element.textContent = message;
  return element;
}

function createAction(title: string, body: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-action";
  button.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function getUpgradedCombatInstanceIds(run: RunState): string[] {
  return run.deck.flatMap((entry, index) => entry.upgraded ? [`starter-${index + 1}`] : []);
}

function getShopRemovalCandidate(run: RunState): RunState["deck"][number] | undefined {
  if (run.deck.length <= 5) {
    return undefined;
  }

  return run.deck.find((entry) => cardsById[entry.cardId].rarity === "starter") ?? run.deck[0];
}

function formatTypes(types: string[]): string {
  const names: Record<string, string> = {
    attack: "攻",
    skill: "技",
    body: "身法",
    mind: "心境",
    ink: "墨灾",
    power: "能力"
  };
  return types.map((type) => names[type] ?? type).join(" / ");
}

function formatMind(mind: string): string {
  const names: Record<string, string> = {
    none: "无",
    ning: "宁",
    nu: "怒",
    bei: "悲",
    mei: "魅",
    luan: "乱",
    wu: "悟"
  };
  return names[mind] ?? mind;
}

function explainPlayFailure(reason: string): string {
  if (reason === "not-enough-energy") {
    return "真气不足，无法出牌。";
  }

  if (reason === "invalid-target") {
    return "此招没有合适目标。";
  }

  return "此招暂不可用。";
}

function requireRun(state: ControllerState): RunState {
  if (!state.run) {
    throw new Error("Run has not started.");
  }

  return state.run;
}

function requireCombat(state: ControllerState): CombatState {
  if (!state.combat) {
    throw new Error("Combat has not started.");
  }

  return state.combat;
}
