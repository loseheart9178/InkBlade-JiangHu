import { cardList, cardsById } from "../game/content/cards";
import { charactersById } from "../game/content/characters";
import { enemiesById } from "../game/content/enemies";
import { eventsById } from "../game/content/events";
import { relicsById } from "../game/content/relics";
import { cardArtById, combatPortraitsById, combatSpriteSheetsById, signatureVfxByCue } from "../game/content/visuals";
import {
  clearSavedGame,
  hasSavedGame,
  loadSavedGame,
  saveGameState,
  type ControllerSaveSnapshot,
  type GameStorage,
  type SaveableScreen
} from "../game/systems/save/save";
import { createCombat, endPlayerTurn, playCard } from "../game/systems/combat/combat";
import type { CardDefinition, CardEffect, CombatState, CombatVisualEvent, StatusId } from "../game/systems/combat/types";
import { analyzeDeckArchetypes, getCardArchetypeRole } from "../game/systems/deck/archetype";
import { applyEventChoiceEffects, getAvailableEventChoices } from "../game/systems/events/eventEffects";
import { getUnlockedLogbookEntries, recordLogbookBoss, recordLogbookEvent } from "../game/systems/logbook/logbook";
import { claimMethodReward, createMethodRewardDraft, getRunMethods, shouldOfferMethodReward } from "../game/systems/methods/methods";
import { describeRelicSource, getShopRelicPool } from "../game/systems/relics/relicEffects";
import { createAdvancedRewardDraft, type AdvancedRewardChoice } from "../game/systems/rewards/advancedRewards";
import {
  addRelic,
  advanceToNextChapter,
  claimBattleSpoils,
  claimChapterReward,
  claimMethodUpgrade,
  createChapterRewardChoices,
  createCardRewardDraft,
  createCardRewardReasonMap,
  createRun,
  getAvailableNodes,
  getCurrentChapter,
  getNextChapter,
  getComboRewardHint,
  getComboRewardPrimaryCardId,
  getCurrentNode,
  getUpgradeCandidates,
  healRun,
  recordRunCombatCombos,
  removeDeckCard,
  takeCardReward,
  travelToNode,
  upgradeDeckCard,
  type BattleSpoils,
  type MapNode,
  type RunState
} from "../game/systems/run";

type Screen = "title" | "map" | "combat" | "reward" | "methodReward" | "chapterReward" | "event" | "shop" | "rest" | "bossReward" | "logbook" | "victory" | "defeat";

const SHOP_CARD_PRICE = 35;
const SHOP_REMOVE_PRICE = 50;

interface SettingsState {
  reducedMotion: boolean;
  fastCombatText: boolean;
  masterVolume: number;
  musicVolume: number;
}

interface ControllerState {
  screen: Screen;
  run?: RunState;
  combat?: CombatState;
  rewardCards: CardDefinition[];
  pendingSpoils?: BattleSpoils;
  deckOpen: boolean;
  settings: SettingsState;
  message: string;
}

interface ControllerOptions {
  storage?: GameStorage;
}

export function createInkbladeController(host: HTMLElement, options: ControllerOptions = {}) {
  const state: ControllerState = {
    screen: "title",
    rewardCards: [],
    deckOpen: false,
    settings: {
      reducedMotion: false,
      fastCombatText: false,
      masterVolume: 80,
      musicVolume: 70
    },
    message: ""
  };

  const render = () => {
    host.innerHTML = "";

    if (state.screen === "map") {
      renderMap(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "combat") {
      renderCombat(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "reward") {
      renderReward(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "methodReward") {
      renderMethodReward(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "chapterReward") {
      renderChapterReward(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "event") {
      renderEvent(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "shop") {
      renderShop(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "rest") {
      renderRest(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "bossReward") {
      renderBossReward(host, state, render);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "logbook") {
      renderLogbook(host, state, render);
      return;
    }

    if (state.screen === "victory" || state.screen === "defeat") {
      renderResult(host, state, render);
      clearSavedGame(options.storage);
    }
  };

  installTitleShellControls(host, state, render);

  return {
    startRun(characterId: string) {
      state.run = createRun(characterId, { mapSeed: generateMapSeed() });
      state.combat = undefined;
      state.rewardCards = [];
      state.pendingSpoils = undefined;
      state.deckOpen = false;
      state.message = `${charactersById[characterId].name}踏入${getCurrentChapter(state.run).name}。`;
      state.screen = "map";
      render();
    },
    continueRun() {
      const saved = loadSavedGame(options.storage);
      if (!saved) {
        return false;
      }

      state.run = saved.run;
      state.combat = saved.combat;
      state.rewardCards = saved.rewardCardIds.map((id) => cardsById[id]).filter((card): card is CardDefinition => Boolean(card));
      state.pendingSpoils = saved.pendingSpoils;
      state.deckOpen = false;
      state.message = saved.message || "旧存档已续上。";
      state.screen = saved.screen;
      render();
      return true;
    },
    hasSavedRun() {
      return hasSavedGame(options.storage);
    },
    clearSavedRun() {
      clearSavedGame(options.storage);
    }
  };
}

function installTitleShellControls(host: HTMLElement, state: ControllerState, render: () => void): void {
  const title = host.querySelector<HTMLElement>(".title-screen");
  if (!title) {
    return;
  }

  title.dataset.testid = "screen-title";
  const actions = title.querySelector<HTMLElement>(".title-actions") ?? title;

  if (!actions.querySelector("[data-testid='settings-open']")) {
    const settings = document.createElement("button");
    settings.type = "button";
    settings.dataset.testid = "settings-open";
    settings.textContent = "设置";
    settings.addEventListener("click", () => showSettingsShell(host, state));
    actions.append(settings);
  }

  if (!actions.querySelector("[data-testid='debug-run-summary']")) {
    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "title-debug-action";
    summary.dataset.testid = "debug-run-summary";
    summary.textContent = "战报壳";
    summary.addEventListener("click", () => showRunSummaryShell(host, state, render));
    actions.append(summary);
  }
}

function showSettingsShell(host: HTMLElement, state: ControllerState): void {
  removeTitleShellOverlay(host);
  const panel = createPanel("screen-settings", "设置");
  panel.classList.add("settings-screen", "title-shell-panel");
  panel.dataset.titleShellOverlay = "true";

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = "桌面行旅设置先落下外壳，音频与持久化会随档案系统接入。";

  const settingsList = document.createElement("div");
  settingsList.className = "settings-list";
  settingsList.append(
    createSettingToggle(
      "setting-reduced-motion",
      "减少动态",
      "压低非必要动效，保留关键战斗反馈。",
      state.settings.reducedMotion,
      (checked) => {
        state.settings.reducedMotion = checked;
        host.classList.toggle("prefers-reduced-motion", checked);
      }
    ),
    createSettingToggle(
      "setting-fast-combat-text",
      "快速战斗文字",
      "缩短战斗浮字停留时间，方便重复跑图。",
      state.settings.fastCombatText,
      (checked) => {
        state.settings.fastCombatText = checked;
      }
    ),
    createSettingRange("setting-master-volume", "主音量", state.settings.masterVolume),
    createSettingRange("setting-music-volume", "音乐音量", state.settings.musicVolume)
  );

  const back = createAction("返回", "收起设置，留在标题。", () => removeTitleShellOverlay(host));
  back.dataset.testid = "settings-back";

  panel.append(note, settingsList, back);
  host.append(panel);
}

function showRunSummaryShell(host: HTMLElement, state: ControllerState, render: () => void): void {
  removeTitleShellOverlay(host);
  const run = state.run ?? createRun("zhaoyun", { mapSeed: 46 });
  const panel = createPanel("screen-run-summary", "行旅结算");
  panel.classList.add("run-summary-screen", "title-shell-panel");
  panel.dataset.titleShellOverlay = "true";

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = state.run ? "本次行旅暂结于此，后续会写入档案与结局。" : "调试战报样例，用于档案与结局接入前验证桌面外壳。";

  const stats = document.createElement("div");
  stats.className = "run-summary-stats";
  const character = charactersById[run.characterId];
  const chapter = getCurrentChapter(run);
  const logbookCount = getUnlockedLogbookEntries(run).length;
  stats.append(
    createRunSummaryStat("结果", state.screen === "defeat" ? "梦醒" : "调试样例"),
    createRunSummaryStat("角色", character.name),
    createRunSummaryStat("当前章节", chapter.name),
    createRunSummaryStat("已过章节", `${run.completedChapterIds.length}`),
    createRunSummaryStat("法宝", `${run.relicIds.length}`),
    createRunSummaryStat("牌组", `${run.deck.length}`),
    createRunSummaryStat("墨录残页", `${logbookCount}`),
    createRunSummaryStat("铜钱", `${run.gold}`)
  );

  const actions = document.createElement("div");
  actions.className = "run-summary-actions";
  const back = createAction("返回标题", "收起战报，回到标题。", () => removeTitleShellOverlay(host));
  back.dataset.testid = "run-summary-back";
  const logbook = createAction("打开墨录", state.run ? "查看本局已录残页。" : "调试样例尚未接入档案残页。", () => {
    if (!state.run) {
      return;
    }

    removeTitleShellOverlay(host);
    openLogbook(state, render);
  });
  logbook.dataset.testid = "run-summary-logbook";
  logbook.disabled = !state.run;
  actions.append(back, logbook);

  panel.append(note, stats, actions);
  host.append(panel);
}

function createSettingToggle(testId: string, title: string, description: string, checked: boolean, onChange: (checked: boolean) => void): HTMLElement {
  const row = document.createElement("label");
  row.className = "settings-row";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.dataset.testid = testId;
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));

  const copy = document.createElement("span");
  copy.innerHTML = `<strong>${title}</strong><small>${description}</small>`;
  row.append(input, copy);
  return row;
}

function createSettingRange(testId: string, title: string, value: number): HTMLElement {
  const row = document.createElement("label");
  row.className = "settings-row settings-row--disabled";

  const copy = document.createElement("span");
  copy.innerHTML = `<strong>${title}</strong><small>音频系统接入后启用。</small>`;

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.value = `${value}`;
  input.disabled = true;
  input.dataset.testid = testId;

  row.append(copy, input);
  return row;
}

function createRunSummaryStat(label: string, value: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "run-summary-stat";
  row.dataset.testid = "run-summary-stat";
  row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  return row;
}

function removeTitleShellOverlay(host: HTMLElement): void {
  host.querySelectorAll<HTMLElement>("[data-title-shell-overlay='true']").forEach((item) => item.remove());
}

function renderMap(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const current = getCurrentNode(run);
  const available = getAvailableNodes(run);
  const panel = createPanel("screen-map", chapter.mapTitle);
  panel.classList.add("map-screen");

  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));

  const path = document.createElement("div");
  path.className = "route-map";
  path.style.setProperty("--map-columns", `${Math.max(...run.mapNodes.map((node) => node.floor)) + 1}`);

  for (const node of run.mapNodes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `map-node map-node--${node.type}`;
    button.dataset.testid = `map-node-${node.id}`;
    button.dataset.floor = `${node.floor}`;
    button.dataset.lane = `${node.lane}`;
    button.style.gridColumn = `${node.floor + 1}`;
    button.style.gridRow = `${node.lane + 1}`;
    button.innerHTML = `<span class="map-node-icon">${getMapNodeIcon(node.type)}</span><strong>${node.label}</strong><small>${formatMapNodeMeta(node)}</small>`;
    button.disabled = !available.some((item) => item.id === node.id);
    button.title = node.connections.length > 0 ? `通向：${node.connections.map((id) => getMapNodeLabel(run, id)).join("、")}` : "本章首领";

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
    methodIds: [...(run.methodIds ?? [])],
    methodLevels: { ...(run.methodLevels ?? {}) },
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
  const playerPortrait = getCombatPortrait(combat.player.characterId);
  const enemyPortrait = getCombatPortrait(enemy.definitionId);
  const latestDamageTarget = getLatestDamageTarget(combat);
  const playerIsAttacking = latestDamageTarget === "enemy";
  const enemyIsAttacking = latestDamageTarget === "player";
  const playerSprite = playerIsAttacking ? getCombatSprite(combat.player.characterId) : undefined;
  const enemySprite = enemyIsAttacking ? getCombatSprite(enemy.definitionId) : undefined;
  const panel = createPanel("screen-combat", "回合 " + combat.turn);
  panel.classList.add("combat-screen");
  panel.classList.add(`combat-screen--${run.chapterId}`);

  const top = document.createElement("div");
  top.className = "combat-topbar";
  top.append(
    createMeter("player-hp", combat.player.name, combat.player.hp, combat.player.maxHp, "朱砂", playerPortrait.assetPath),
    createIntent(enemy.currentIntent),
    createMeter("enemy-hp", enemy.name, enemy.hp, enemy.maxHp, "青墨", enemyPortrait.assetPath)
  );

  const field = document.createElement("div");
  field.className = "combat-field";
  field.innerHTML = `
    <div class="combatant combatant--player ${hasRecentVisual(combat, "player", "damage") ? "is-hit" : ""} ${hasRecentVisual(combat, "player", "block") ? "is-guarding" : ""}">
      <div class="resource-pill">${combat.player.resource.name} ${combat.player.resource.value}/${combat.player.resource.max}</div>
      <div class="status-line" data-testid="player-status">护甲 ${combat.player.block} · 心境 ${formatMind(combat.player.mind)} · 墨痕 ${combat.player.inkMarks}${formatStatusBadges(combat.player.statuses)}</div>
      <div class="combat-standee combat-standee--player combat-standee--${playerPortrait.accent} ${playerIsAttacking ? "is-attacking" : ""}">
        ${playerSprite ? `<div class="combat-sprite combat-sprite--player is-attacking" data-testid="combat-sprite-player" style="--sprite-url: url('${playerSprite.assetPath}')"></div>` : ""}
        <img class="combat-standee-art" data-testid="combat-standee-player" src="${getStandeePath(playerPortrait)}" alt="${playerPortrait.alt}">
      </div>
    </div>
    <div class="duel-column">
      <div class="duel-mark">对决</div>
      <div class="combo-trail" data-testid="combo-trail"><span>招式</span><strong>${formatComboTrail(combat)}</strong></div>
    </div>
    <div class="combatant combatant--enemy ${hasRecentVisual(combat, "enemy", "damage") ? "is-hit" : ""} ${hasRecentVisual(combat, "enemy", "status") ? "is-marked" : ""}">
      <div class="resource-pill">敌势 ${enemy.intentIndex + 1}/${enemy.intents.length}</div>
      <div class="status-line" data-testid="enemy-status">护甲 ${enemy.block}${formatStatusBadges(enemy.statuses)}</div>
      <div class="combat-standee combat-standee--enemy combat-standee--${enemyPortrait.accent} ${enemyIsAttacking ? "is-attacking" : ""}">
        ${enemySprite ? `<div class="combat-sprite combat-sprite--enemy is-attacking" data-testid="combat-sprite-enemy" style="--sprite-url: url('${enemySprite.assetPath}')"></div>` : ""}
        <img class="combat-standee-art" data-testid="combat-standee-enemy" src="${getStandeePath(enemyPortrait)}" alt="${enemyPortrait.alt}">
      </div>
    </div>
  `;
  field.append(createCombatVfxLayer(combat), createCombatFloatLayer(combat));

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
    cardButton.disabled = getDisplayCost(definition, card.upgraded) > combat.player.energy;
    cardButton.innerHTML = `
      ${createCardArtMarkup(definition)}
      ${createCardChromeMarkup(definition)}
      <span class="card-cost">${getDisplayCost(definition, card.upgraded)}</span>
      <strong>${definition.name}${card.upgraded ? " +" : ""}</strong>
      <small class="card-type-line">${formatTypes(definition.types)}</small>
      ${createCardKeywordRowMarkup(definition)}
      <span class="card-description">${getDisplayDescription(definition, card.upgraded)}</span>
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

  panel.append(top, field, createMessage(state.message), createCombatLog(combat), hand, controls);
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
    recordRunCombatCombos(run, combat.comboTriggersThisCombat ?? []);
    state.pendingSpoils = claimBattleSpoils(run, node.type);

    if (node.type === "boss") {
      recordLogbookBoss(run, node.enemyId ?? combat.enemies[0].definitionId);
      if (shouldOfferMethodReward(run)) {
        state.screen = "methodReward";
        state.message = "黑雨将散，先定一门心法。";
        return;
      }

      state.screen = "chapterReward";
      state.message = `${getCurrentChapter(run).bossVictoryCopy} 选择一项章末成长。`;
      return;
    }

    if (node.type === "elite" && shouldOfferMethodReward(run)) {
      state.screen = "methodReward";
      state.message = "精英战后，残卷显出可修心法。";
      return;
    }

    state.rewardCards = createCardRewardDraft(run, node.type).cards;
    state.screen = "reward";
    state.message = "战斗胜利，选择一式武学。";
  }
}

function renderMethodReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const node = getCurrentNode(run);
  const draft = createMethodRewardDraft(run);
  const panel = createPanel("screen-method-reward", "心法");
  panel.classList.add("method-reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));
  panel.append(createMessage(draft.reason));
  panel.append(createSpoilsSummary(state.pendingSpoils));

  const list = document.createElement("div");
  list.className = "method-reward-list";

  for (const method of draft.methods) {
    const button = createAction(method.name, `${method.description} ${method.triggerText}`, () => {
      if (!claimMethodReward(run, method.id)) {
        state.message = "这门心法暂不可修。";
        render();
        return;
      }

      state.message = `习得心法：${method.name}。`;
      if (node.type === "boss") {
        state.screen = "chapterReward";
      } else {
        state.rewardCards = createCardRewardDraft(run, node.type).cards;
        state.screen = "reward";
      }
      render();
    });
    button.classList.add("method-choice");
    button.dataset.testid = `method-choice-${method.id}`;
    list.append(button);
  }

  if (draft.methods.length === 0) {
    const continueButton = createAction("继续", "没有新的心法可修，收起战利。", () => {
      if (node.type === "boss") {
        state.screen = "chapterReward";
      } else {
        state.rewardCards = createCardRewardDraft(run, node.type).cards;
        state.screen = "reward";
      }
      render();
    });
    continueButton.dataset.testid = "method-choice-continue";
    list.append(continueButton);
  }

  panel.append(list);
  host.append(panel);
}

function renderReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-reward", "战利");
  panel.classList.add("reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));
  panel.append(createMessage(state.message));
  panel.append(createSpoilsSummary(state.pendingSpoils));
  const comboHint = getComboRewardHint(run);
  const comboPrimaryCardId = getComboRewardPrimaryCardId(run);
  const rewardReasons = createCardRewardReasonMap(run, state.rewardCards);
  const archetypeAnalysis = analyzeDeckArchetypes(getRunCardDefinitions(run));
  if (comboHint) {
    panel.append(createRewardComboHint(comboHint));
  }

  const rewards = document.createElement("div");
  rewards.className = "reward-cards";
  for (const card of state.rewardCards) {
    const isComboBiased = card.id === comboPrimaryCardId;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `reward-card card-type-${card.types[0]}`;
    if (isComboBiased) {
      button.classList.add("is-combo-biased");
    }
    button.dataset.testid = "reward-card";
    button.dataset.comboBiased = isComboBiased ? "true" : "false";
    button.innerHTML = `
      ${createCardArtMarkup(card)}
      ${createCardChromeMarkup(card)}
      ${isComboBiased ? `<span class="reward-combo-mark">招式回响</span>` : ""}
      <strong>${card.name}</strong>
      <small class="card-type-line">${formatTypes(card.types)}</small>
      ${createCardKeywordRowMarkup(card)}
      <span class="card-description">${card.description ?? ""}</span>
      <span class="reward-archetype-role" data-testid="reward-archetype-role">${getCardArchetypeRole(card, archetypeAnalysis)}</span>
      <span class="reward-reason" data-testid="reward-reason">${rewardReasons[card.id] ?? ""}</span>
    `;
    button.addEventListener("click", () => {
      takeCardReward(run, card);
      state.message = `获得${card.name}。`;
      state.pendingSpoils = undefined;
      state.screen = "map";
      render();
    });
    rewards.append(button);
  }

  const skip = document.createElement("button");
  skip.type = "button";
  skip.textContent = "跳过，另取3铜钱";
  skip.addEventListener("click", () => {
    run.gold += 3;
    state.message = "你收起额外铜钱，继续前行。";
    state.pendingSpoils = undefined;
    state.screen = "map";
    render();
  });

  panel.append(rewards, skip);
  host.append(panel);
}

function renderEvent(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const current = getCurrentNode(run);
  const event = eventsById[current.eventId ?? "event_black_rain_ferry"];
  const eventScene = getEventScene(event.id);
  const panel = createPanel("screen-event", event.title);
  panel.classList.add("event-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));

  const layout = document.createElement("div");
  layout.className = "event-layout";
  const hero = document.createElement("section");
  hero.className = "event-hero";
  hero.dataset.testid = "event-hero";
  hero.innerHTML = `
    <div class="event-scene event-scene--${eventScene.key}" data-testid="event-scene" aria-hidden="true">
      <span class="event-scene-mark">${eventScene.mark}</span>
      <span class="event-scene-brush event-scene-brush--one"></span>
      <span class="event-scene-brush event-scene-brush--two"></span>
    </div>
    <div class="event-copy">
      <span class="event-kicker">${eventScene.kicker}</span>
      <h3>${event.title}</h3>
      <p>${event.description}</p>
    </div>
  `;
  layout.append(hero);

  const choices = document.createElement("div");
  choices.className = "event-choices";

  for (const choice of getAvailableEventChoices(event, run.characterId)) {
    const action = createAction(choice.label, choice.summary, () => {
      applyEventChoiceEffects(run, choice);
      recordLogbookEvent(run, event.id);
      state.message = `${event.title}：${choice.label}`;
      state.screen = "map";
      render();
    });
    action.classList.add("choice-action--event");
    action.dataset.testid = `event-choice-${choice.id}`;
    choices.append(action);
  }

  layout.append(choices);
  panel.append(layout);
  host.append(panel);
}

function renderShop(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-shop", "茶亭游商");
  panel.classList.add("shop-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));

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
  for (const relicId of getShopRelicPool(run.characterId).slice(0, 3)) {
    const relic = relicsById[relicId];
    const owned = run.relicIds.includes(relic.id);
    const button = createAction(relic.name, `${describeRelicSource(relic.id)}。${relic.description} 价格${relic.price}`, () => {
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
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));

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

function renderChapterReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const panel = createPanel("screen-chapter-reward", "章末悟境");
  panel.classList.add("chapter-reward-screen", "reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));
  panel.append(createMessage(`${chapter.name}的残页落定，选择一项带入下一段江湖的成长。`));
  panel.append(createSpoilsSummary(state.pendingSpoils));

  const choices = document.createElement("div");
  choices.className = "chapter-reward-list";

  for (const choice of createChapterRewardChoices(run)) {
    const button = createAction(choice.title, choice.summary, () => {
      const claimed = claimChapterReward(run, choice.id);
      state.message = claimed ? `章末成长：${claimed.title}。` : "这项成长暂不可得。";
      state.screen = "bossReward";
      render();
    });
    button.classList.add("chapter-reward-choice");
    button.dataset.testid = "chapter-reward-choice";
    button.dataset.choiceId = choice.id;
    choices.append(button);
  }

  const advancedDraft = createAdvancedRewardDraft(run, "boss");
  const advancedClaimed = hasAdvancedRewardClaimed(run, chapter.id);
  const advanced = document.createElement("div");
  advanced.className = "advanced-reward-list";
  advanced.append(createMessage(advancedDraft.reason));

  for (const choice of advancedDraft.choices) {
    const button = createAction(choice.title, choice.summary, () => {
      if (advancedClaimed) {
        state.message = "本章高阶战利已经入囊。";
        render();
        return;
      }

      state.message = claimAdvancedReward(run, choice, chapter.id);
      render();
    });
    button.classList.add("advanced-reward-choice");
    button.dataset.testid = "advanced-reward-choice";
    button.dataset.choiceId = choice.id;
    button.disabled = advancedClaimed;
    advanced.append(button);
  }

  panel.append(choices, advanced);
  host.append(panel);
}

function renderBossReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const nextChapter = getNextChapter(run);
  const panel = createPanel("screen-boss-reward", "首领战利");
  panel.classList.add("reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render)));
  panel.append(createMessage(nextChapter ? `${chapter.name}已经写完，下一页通向${nextChapter.name}。` : `${chapter.name}的墨色暂时退去。`));
  panel.append(createSpoilsSummary(state.pendingSpoils));

  const continueButton = createAction(nextChapter ? "前往下一章" : "收束本章", nextChapter ? `带着章末成长进入${nextChapter.name}。` : "带着战利离开此地。", () => {
    state.pendingSpoils = undefined;
    if (advanceToNextChapter(run)) {
      state.screen = "map";
      state.message = `雨声渐近，${nextChapter?.name ?? "下一章"}展开。`;
    } else {
      state.screen = "victory";
      state.message = `${chapter.name}暂告一段落，新的江湖仍在远处。`;
    }
    render();
  });
  continueButton.dataset.testid = "boss-reward-continue";
  panel.append(continueButton);
  host.append(panel);
}

function renderLogbook(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const entries = getUnlockedLogbookEntries(run);
  const panel = createPanel("screen-logbook", "墨录");
  panel.classList.add("logbook-screen");
  panel.append(createRunStatus(run, "已录下的江湖残页。", () => openDeck(state, render)));

  const list = document.createElement("div");
  list.className = "logbook-list";

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "logbook-empty";
    empty.textContent = "尚无残页。江湖还未把这一路写进墨里。";
    list.append(empty);
  }

  for (const entry of entries) {
    const item = document.createElement("article");
    item.className = "logbook-entry";
    item.dataset.testid = "logbook-entry";
    item.innerHTML = `<strong>${entry.title}</strong><p>${entry.body}</p>`;
    list.append(item);
  }

  const back = createAction("返回地图", "收起墨录，继续行旅。", () => {
    state.screen = "map";
    render();
  });
  back.dataset.testid = "logbook-back";
  panel.append(list, back);
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
    state.pendingSpoils = undefined;
    state.deckOpen = false;
    state.message = "黑雨仍未停。";
    state.screen = "map";
    render();
  });
  panel.append(restart);
  host.append(panel);
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

function createRunStatus(run: RunState, message: string, onDeckClick?: () => void, onLogbookClick?: () => void): HTMLElement {
  const status = document.createElement("div");
  status.className = "run-status";
  const relicNames = run.relicIds.map((id) => relicsById[id]?.name ?? id).join("、");
  const methodNames = getRunMethods(run).map((method) => `${method.name}${(run.methodLevels?.[method.id] ?? 1) > 1 ? "·进境" : ""}`).join("、") || "未定";
  const logbookCount = getUnlockedLogbookEntries(run).length;
  const archetypeAnalysis = analyzeDeckArchetypes(getRunCardDefinitions(run));
  const chapter = getCurrentChapter(run);
  status.innerHTML = `
    <span data-testid="run-chapter">章节 ${chapter.name}</span>
    <span>生命 ${run.hp}/${run.maxHp}</span>
    <span>铜钱 ${run.gold}</span>
    <span>牌组 ${run.deck.length}</span>
    <span data-testid="run-relics">法宝 ${relicNames}</span>
    <span data-testid="run-methods">心法 ${methodNames}</span>
    <span data-testid="run-logbook">墨录 ${logbookCount}</span>
    <span data-testid="run-mind-tendencies">心境 ${formatRunMindTendencies(run)}</span>
    <span data-testid="run-archetype">流派 ${archetypeAnalysis.summary}</span>
    <em>${message}</em>
  `;

  if (onDeckClick) {
    const deckButton = document.createElement("button");
    deckButton.type = "button";
    deckButton.className = "deck-open-button";
    deckButton.dataset.testid = "deck-open";
    deckButton.textContent = "检视牌组";
    deckButton.addEventListener("click", onDeckClick);
    status.append(deckButton);
  }

  if (onLogbookClick) {
    const logbookButton = document.createElement("button");
    logbookButton.type = "button";
    logbookButton.className = "deck-open-button logbook-open-button";
    logbookButton.dataset.testid = "logbook-open";
    logbookButton.textContent = "墨录";
    logbookButton.addEventListener("click", onLogbookClick);
    status.append(logbookButton);
  }

  return status;
}

function createSpoilsSummary(spoils: BattleSpoils | undefined): HTMLElement {
  const summary = document.createElement("div");
  summary.className = "spoils-summary";
  summary.dataset.testid = "spoils-summary";

  if (!spoils) {
    summary.textContent = "战利已经入囊。";
    return summary;
  }

  const parts = [`铜钱 +${spoils.gold}`];
  if (spoils.relicId) {
    parts.push(`法宝 ${relicsById[spoils.relicId]?.name ?? spoils.relicId}`);
    parts.push(describeRelicSource(spoils.relicId));
  }
  summary.textContent = parts.join(" · ");
  return summary;
}

function hasAdvancedRewardClaimed(run: RunState, chapterId: string): boolean {
  return run.rewardHistory.some((entry) => entry.startsWith(`advancedReward:${chapterId}:`));
}

function claimAdvancedReward(run: RunState, choice: AdvancedRewardChoice, chapterId: string): string {
  if (hasAdvancedRewardClaimed(run, chapterId)) {
    return "本章高阶战利已经入囊。";
  }

  let message = "";

  if ((choice.type === "rareCard" || choice.type === "cleanseCard") && choice.cardId && cardsById[choice.cardId]) {
    takeCardReward(run, cardsById[choice.cardId]);
    message = `高阶战利：获得${cardsById[choice.cardId].name}。`;
  }

  if (choice.type === "relic" && choice.relicId) {
    const relic = relicsById[choice.relicId];
    message = addRelic(run, choice.relicId) ? `高阶战利：获得法宝${relic?.name ?? choice.relicId}。` : `已持有${relic?.name ?? choice.relicId}。`;
  }

  if (choice.type === "methodUpgrade" && choice.methodId) {
    const method = getRunMethods(run).find((item) => item.id === choice.methodId);
    message = claimMethodUpgrade(run, choice.methodId) ? `高阶战利：${method?.name ?? "心法"}进境。` : "这门心法暂不可进境。";
  }

  run.rewardHistory.push(`advancedReward:${chapterId}:${choice.id}`);
  return message || "高阶战利已经入囊。";
}

function createRewardComboHint(hint: string): HTMLElement {
  const element = document.createElement("div");
  element.className = "reward-combo-hint";
  element.dataset.testid = "reward-combo-hint";
  element.textContent = hint;
  return element;
}

function createMeter(testId: string, label: string, value: number, max: number, accent: string, portraitPath?: string): HTMLElement {
  const meter = document.createElement("div");
  meter.className = "combat-meter";
  meter.dataset.testid = testId;
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  meter.innerHTML = `
    ${portraitPath ? `<img class="meter-avatar" data-testid="${testId}-portrait" src="${portraitPath}" alt="">` : ""}
    <div class="meter-copy">
      <span>${label}</span>
      <strong>${value}/${max}</strong>
      <div class="meter-track"><i style="width: ${percent}%"></i></div>
      <small>${accent}</small>
    </div>
  `;
  return meter;
}

function createIntent(intent: CombatState["enemies"][number]["currentIntent"]): HTMLElement {
  const box = document.createElement("div");
  box.className = "intent-box";
  box.dataset.testid = "intent";
  box.title = describeIntent(intent);
  if (intent.type === "attack") {
    box.textContent = intent.hits > 1 ? `杀意 ${intent.damage}x${intent.hits}` : `杀意 ${intent.damage}`;
  } else if (intent.type === "block") {
    box.textContent = `运功 ${intent.block}`;
  } else if (intent.type === "special") {
    box.textContent = intent.name;
  } else {
    box.textContent = "观望";
  }
  return box;
}

function describeIntent(intent: CombatState["enemies"][number]["currentIntent"]): string {
  if (intent.type === "attack") {
    return intent.hits > 1 ? `造成${intent.damage}点伤害，共${intent.hits}段。` : `造成${intent.damage}点伤害。`;
  }

  if (intent.type === "block") {
    return `获得${intent.block}点护甲。`;
  }

  if (intent.type === "special") {
    return intent.effects.map((effect) => {
      if (effect.action === "damage") {
        return effect.hits && effect.hits > 1 ? `造成${effect.amount}点伤害，共${effect.hits}段` : `造成${effect.amount}点伤害`;
      }

      if (effect.action === "block") {
        return `获得${effect.amount}点护甲`;
      }

      if (effect.action === "applyStatus") {
        return `${effect.target === "player" ? "玩家" : "自身"}获得${formatStatus(effect.status)} ${effect.amount}`;
      }

      if (effect.action === "addCardToDiscard") {
        return `加入${effect.amount}张状态牌到弃牌堆`;
      }

      if (effect.action === "gainInk") {
        return `玩家获得墨痕 ${effect.amount}`;
      }

      return `回复${effect.amount}点生命`;
    }).join("，") + "。";
  }

  return "本回合不行动。";
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

function createCombatLog(combat: CombatState): HTMLElement {
  const log = document.createElement("div");
  log.className = "combat-log";
  log.dataset.testid = "combat-log";
  const entries = combat.combatLog.slice(-4);

  if (entries.length === 0) {
    log.textContent = "雨声未歇，招式待发。";
    return log;
  }

  for (const entry of entries) {
    const item = document.createElement("span");
    item.textContent = entry;
    log.append(item);
  }

  return log;
}

function formatComboTrail(combat: CombatState): string {
  const comboNames = (combat.comboTriggersThisTurn ?? []).map(formatComboName).filter(Boolean);
  if (comboNames.length > 0) {
    return comboNames.slice(-2).join(" / ");
  }

  const recentTypes = combat.playedCardTypesThisTurn.slice(-4);
  return recentTypes.length > 0 ? formatTypes(recentTypes) : "待发";
}

function formatComboName(comboId: string): string {
  const names: Record<string, string> = {
    lianzhan: "连斩",
    xushi: "蓄势",
    zhuiying: "追影",
    jingshou: "静守",
    xinren: "心刃",
    gushou: "固守",
    moxi: "墨袭",
    duanzhao: "断招"
  };
  return names[comboId] ?? comboId;
}

function createCombatFloatLayer(combat: CombatState): HTMLElement {
  const layer = document.createElement("div");
  layer.className = "combat-float-layer";
  layer.dataset.testid = "combat-floats";

  for (const event of combat.visualEvents.slice(-6)) {
    const item = document.createElement("span");
    item.className = `visual-float visual-float--${event.target} visual-float--${event.tone}`;
    item.dataset.testid = "combat-float";
    item.textContent = event.label;
    layer.append(item);
  }

  return layer;
}

function createCombatVfxLayer(combat: CombatState): HTMLElement {
  const layer = document.createElement("div");
  layer.className = "combat-vfx-layer";
  layer.dataset.testid = "combat-vfx-layer";

  for (const event of combat.visualEvents.slice(-8)) {
    const effectClass = getCombatVfxClass(event);
    if (!effectClass) {
      continue;
    }

    const item = document.createElement("span");
    item.className = `combat-vfx ${effectClass} combat-vfx--${event.target} combat-vfx--${event.tone}`;
    item.dataset.testid = getCombatVfxTestId(event);
    item.setAttribute("aria-hidden", "true");
    layer.append(item);
  }

  return layer;
}

function getCombatVfxClass(event: CombatVisualEvent): string | undefined {
  if (event.visualCue) {
    return signatureVfxByCue[event.visualCue]?.className;
  }

  return undefined;
}

function getCombatVfxTestId(event: CombatVisualEvent): string {
  if (event.visualCue) {
    return signatureVfxByCue[event.visualCue]?.testId ?? "combat-vfx-signature";
  }

  if (event.kind === "block" || event.kind === "status" || event.kind === "resource") {
    return "combat-vfx-sigil";
  }

  if (event.kind === "ink" || event.tone === "ink") {
    return "combat-vfx-ink";
  }

  return "combat-vfx-seal";
}

function createAction(title: string, body: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-action";
  button.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function getMapNodeIcon(type: MapNode["type"]): string {
  const icons: Record<MapNode["type"], string> = {
    start: "渡",
    battle: "战",
    elite: "煞",
    event: "事",
    shop: "商",
    rest: "息",
    boss: "魇"
  };
  return icons[type];
}

function formatMapNodeMeta(node: MapNode): string {
  const names: Record<MapNode["type"], string> = {
    start: "起点",
    battle: "寻常战",
    elite: "精英",
    event: "奇遇",
    shop: "游商",
    rest: "静修",
    boss: "首领"
  };
  return `${names[node.type]} · 第${node.floor + 1}程`;
}

function getMapNodeLabel(run: RunState, nodeId: string): string {
  return run.mapNodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}

function openDeck(state: ControllerState, render: () => void): void {
  state.deckOpen = true;
  render();
}

function openLogbook(state: ControllerState, render: () => void): void {
  state.deckOpen = false;
  state.screen = "logbook";
  render();
}

function renderDeckOverlayIfOpen(host: HTMLElement, state: ControllerState, render: () => void): void {
  if (!state.deckOpen || !state.run) {
    return;
  }

  const run = state.run;
  const archetypeAnalysis = analyzeDeckArchetypes(getRunCardDefinitions(run));
  const methodNames = getRunMethods(run).map((method) => method.name).join("、") || "未定";
  const overlay = document.createElement("div");
  overlay.className = "deck-overlay";
  overlay.dataset.testid = "deck-viewer";

  const panel = document.createElement("section");
  panel.className = "deck-panel";

  const header = document.createElement("div");
  header.className = "deck-panel-header";
  const title = document.createElement("h2");
  title.textContent = `牌组 ${run.deck.length}`;
  const close = document.createElement("button");
  close.type = "button";
  close.dataset.testid = "deck-close";
  close.textContent = "返回";
  close.addEventListener("click", () => {
    state.deckOpen = false;
    render();
  });
  header.append(title, close);

  const summary = document.createElement("div");
  summary.className = "deck-archetype-summary";
  summary.dataset.testid = "deck-archetype-summary";
  const visibleScores = archetypeAnalysis.scores.filter((score) => score.cardCount > 0).slice(0, 3);
  summary.innerHTML = `
    <strong>当前流派：${archetypeAnalysis.summary}</strong>
    <span>${visibleScores.length > 0 ? visibleScores.map((score) => `${score.label} ${score.cardCount}`).join(" · ") : "多拿带有流派标签的武学后会开始成型。"}</span>
    <small data-testid="deck-method-summary">心法 ${methodNames}</small>
  `;

  const list = document.createElement("div");
  list.className = "deck-card-list";
  for (const entry of run.deck) {
    const card = cardsById[entry.cardId];
    const item = document.createElement("article");
    item.className = `deck-card card-type-${card.types[0]}`;
    item.dataset.testid = "deck-card";
    item.innerHTML = `
      ${createCardArtMarkup(card)}
      ${createCardChromeMarkup(card)}
      <span class="card-cost">${getDisplayCost(card, entry.upgraded)}</span>
      <strong>${card.name}${entry.upgraded ? " +" : ""}</strong>
      <small class="card-type-line">${formatTypes(card.types)}</small>
      ${createCardKeywordRowMarkup(card)}
      <span class="card-description">${getDisplayDescription(card, entry.upgraded)}</span>
    `;
    list.append(item);
  }

  panel.append(header, summary, list);
  overlay.append(panel);
  host.append(overlay);
}

function getRunCardDefinitions(run: RunState): CardDefinition[] {
  return run.deck.map((entry) => cardsById[entry.cardId]).filter((card): card is CardDefinition => Boolean(card));
}

function hasRecentVisual(combat: CombatState, target: "player" | "enemy", kind: string): boolean {
  return combat.visualEvents.slice(-6).some((event) => event.target === target && event.kind === kind);
}

function getLatestDamageTarget(combat: CombatState): "player" | "enemy" | undefined {
  for (let index = combat.visualEvents.length - 1; index >= 0; index -= 1) {
    const event = combat.visualEvents[index];
    if (event.kind === "damage" && (event.target === "player" || event.target === "enemy")) {
      return event.target;
    }
  }

  return undefined;
}

function getCombatPortrait(id: string) {
  return combatPortraitsById[id] ?? {
    assetPath: "/assets/characters/ink-bandit.svg",
    standeePath: "/assets/characters/ink-bandit.svg",
    alt: "Ink silhouette",
    accent: "ink" as const
  };
}

function getStandeePath(portrait: ReturnType<typeof getCombatPortrait>): string {
  return portrait.standeePath ?? portrait.assetPath;
}

function getCombatSprite(id: string) {
  if (id === "zhaoyun") {
    return combatSpriteSheetsById.zhaoyun_attack;
  }

  if (id === "diaochan") {
    return combatSpriteSheetsById.diaochan_attack;
  }

  if (id === "enemy_paper_umbrella") {
    return combatSpriteSheetsById.paper_umbrella_attack;
  }

  if (id === "elite_sword_echo") {
    return combatSpriteSheetsById.sword_echo_attack;
  }

  if (id === "elite_blood_banner") {
    return combatSpriteSheetsById.blood_banner_attack;
  }

  if (id === "boss_ink_dongzhuo") {
    return combatSpriteSheetsById.ink_dongzhuo_boss_attack;
  }

  if (id === "enemy_bamboo_wraith" || id === "elite_qin_score") {
    return combatSpriteSheetsById.bamboo_wraith_attack;
  }

  if (id === "enemy_broken_scholar") {
    return combatSpriteSheetsById.broken_scholar_attack;
  }

  if (id === "enemy_bamboo_soldier" || id === "elite_bamboo_phalanx") {
    return combatSpriteSheetsById.bamboo_soldier_attack;
  }

  if (id === "boss_qin_demon_echo") {
    return combatSpriteSheetsById.qin_demon_attack;
  }

  if (id === "enemy_history_scribe" || id === "enemy_ink_market_guard" || id === "enemy_nameless_citizen" || id === "elite_memory_stela" || id === "elite_lubu_shadow") {
    return combatSpriteSheetsById.history_scribe_attack;
  }

  if (id === "boss_scribe_officer") {
    return combatSpriteSheetsById.scribe_officer_attack;
  }

  return combatSpriteSheetsById.ink_bandit_attack;
}

function createCardArtMarkup(card: CardDefinition): string {
  const art = getCardArt(card);
  return `<span class="card-art card-art--${art.accent}"><img data-testid="card-art" src="${art.assetPath}" alt="${art.alt}"></span>`;
}

function createCardChromeMarkup(card: CardDefinition): string {
  return `
    <span class="card-chrome-row">
      <span class="card-type-badge card-type-badge--${card.types[0]}" data-testid="card-type-badge">${formatTypes(card.types)}</span>
      <span class="card-rarity-mark card-rarity-mark--${card.rarity}" data-testid="card-rarity-mark">${formatRarity(card.rarity)}</span>
    </span>
  `;
}

function createCardKeywordRowMarkup(card: CardDefinition): string {
  const labels = getCardKeywordLabels(card);
  return `<span class="card-keyword-row" data-testid="card-keyword-row">${labels.map((label) => `<i>${label}</i>`).join("")}</span>`;
}

function getCardKeywordLabels(card: CardDefinition): string[] {
  const labels = new Set<string>();

  for (const type of card.types) {
    if (type === "attack") {
      labels.add("伤害");
    } else if (type === "skill") {
      labels.add("技法");
    } else if (type === "body") {
      labels.add("身法");
    } else if (type === "mind") {
      labels.add("心境");
    } else if (type === "ink") {
      labels.add("墨痕");
    }
  }

  for (const effect of card.effects) {
    labels.add(formatEffectKeyword(effect));
  }

  for (const keyword of card.keywords ?? []) {
    if (keyword === "qin") {
      labels.add("琴音");
    } else if (keyword === "echo") {
      labels.add("余韵");
    } else if (keyword === "cleanse") {
      labels.add("净化");
    }
  }

  if (card.retain) {
    labels.add("保留");
  }

  if (card.exhaust) {
    labels.add("消耗");
  }

  return Array.from(labels).filter(Boolean).slice(0, 4);
}

function formatEffectKeyword(effect: CardEffect): string {
  if (effect.action === "damage") {
    return "破势";
  }

  if (effect.action === "block") {
    return "护甲";
  }

  if (effect.action === "draw") {
    return "抽牌";
  }

  if (effect.action === "gainResource") {
    return "蓄势";
  }

  if (effect.action === "gainInk") {
    return "墨痕";
  }

  if (effect.action === "setMind") {
    return `入${formatMind(effect.mind)}`;
  }

  if (effect.action === "cleanseCards") {
    return "净化";
  }

  if (effect.action === "queueEcho") {
    return "余韵";
  }

  return formatStatus(effect.status);
}

function getCardArt(card: CardDefinition) {
  return cardArtById[card.id] ?? cardArtById[`type_${card.types[0]}`] ?? cardArtById.type_skill;
}

function getDisplayCost(card: CardDefinition, upgraded?: boolean): number {
  return upgraded && card.upgrade?.cost !== undefined ? card.upgrade.cost : card.cost;
}

function getDisplayDescription(card: CardDefinition, upgraded?: boolean): string {
  return upgraded && card.upgrade?.description ? card.upgrade.description : card.description ?? "";
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

function getEventScene(eventId: string): { key: string; mark: string; kicker: string } {
  if (eventId === "event_changban_echo") {
    return { key: "changban", mark: "忠", kicker: "长坂回声" };
  }

  if (eventId === "event_palace_lantern_banquet") {
    return { key: "palace", mark: "舞", kicker: "宫灯旧宴" };
  }

  if (eventId.includes("bamboo") || eventId.includes("qin") || eventId.includes("string")) {
    return { key: "bamboo", mark: "音", kicker: "竹林听雨" };
  }

  if (eventId.includes("history") || eventId.includes("market") || eventId.includes("chess") || eventId.includes("stelae") || eventId.includes("stage")) {
    return { key: "changan", mark: "史", kicker: "长安墨城" };
  }

  return { key: "ferry", mark: "渡", kicker: "黑雨渡口" };
}

function formatStatusBadges(statuses: Partial<Record<StatusId, number>>): string {
  const entries = (Object.entries(statuses) as Array<[StatusId, number | undefined]>)
    .filter(([, amount]) => (amount ?? 0) > 0);

  if (entries.length === 0) {
    return "";
  }

  return ` · ${entries.map(([status, amount]) => `${formatStatus(status)} ${amount}`).join(" · ")}`;
}

function formatRarity(rarity: string): string {
  const names: Record<string, string> = {
    starter: "初",
    common: "凡",
    uncommon: "奇",
    rare: "绝",
    event: "缘",
    ink: "墨",
    status: "态",
    curse: "咒"
  };
  return names[rarity] ?? rarity;
}

function formatStatus(status: string): string {
  const names: Record<string, string> = {
    charm: "魅惑",
    weak: "虚弱",
    vulnerable: "易伤",
    dodge: "闪避",
    guard: "护主",
    ink: "墨化"
  };
  return names[status] ?? status;
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

function formatRunMindTendencies(run: RunState): string {
  const tendencies = run.mindTendencies ?? {
    ning: 0,
    nu: 0,
    bei: 0,
    mei: 0,
    luan: 0,
    wu: 0
  };
  const visible = Object.entries(tendencies).filter(([, amount]) => amount > 0);
  return visible.length > 0 ? visible.map(([mind, amount]) => `${formatMind(mind)}${amount}`).join(" / ") : "未定";
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

function persistControllerState(state: ControllerState, storage: GameStorage | undefined): void {
  if (!state.run || !isSaveableScreen(state.screen)) {
    return;
  }

  if (state.screen === "combat" && !state.combat) {
    return;
  }

  const snapshot: ControllerSaveSnapshot = {
    screen: state.screen,
    run: state.run,
    combat: state.screen === "combat" ? state.combat : undefined,
    rewardCardIds: state.rewardCards.map((card) => card.id),
    pendingSpoils: state.pendingSpoils,
    deckOpen: state.deckOpen,
    message: state.message
  };

  saveGameState(storage, snapshot);
}

function isSaveableScreen(screen: Screen): screen is SaveableScreen {
  return screen === "map" || screen === "combat" || screen === "reward" || screen === "methodReward" || screen === "chapterReward" || screen === "event" || screen === "shop" || screen === "rest" || screen === "bossReward";
}

function generateMapSeed(): number {
  return Math.floor(Date.now() % 100_000);
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
