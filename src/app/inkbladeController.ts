import { cardList, cardsById } from "../game/content/cards";
import { createAudioFeedback, type AudioFeedback, type AudioSurface } from "./audioFeedback";
import { loadSettings, saveSettings, type DesktopSettings } from "./settingsPersistence";
import type { ChallengeProfileId } from "../game/content/challenges";
import { chapterList } from "../game/content/chapters";
import { charactersById } from "../game/content/characters";
import { enemiesById } from "../game/content/enemies";
import { eventsById, type EventChoiceEffect, type GameEventChoice } from "../game/content/events";
import {
  formatGlossaryTooltip,
  getCardGlossarySurfaces,
  getGlossaryEntry,
  getIntentGlossarySurface,
  type GlossaryEntry
} from "../game/content/glossary";
import { relicsById } from "../game/content/relics";
import { battlefieldAssets, cardArtById, combatPortraitsById, getCombatAttackSprite, signatureVfxByCue } from "../game/content/visuals";
import {
  clearSavedGame,
  hasSavedGame,
  loadProfile,
  loadSavedGame,
  saveProfile,
  saveGameState,
  type ControllerSaveSnapshot,
  type GameStorage,
  type SaveableScreen
} from "../game/systems/save/save";
import { createCombat, endPlayerTurn, playCard } from "../game/systems/combat/combat";
import type { CardDefinition, CardEffect, CombatState, CombatVisualEvent, EnemyIntentEffect, MindState, StatusId } from "../game/systems/combat/types";
import { analyzeDeckArchetypes, getCardArchetypeRole } from "../game/systems/deck/archetype";
import { createDeckBuildRecap, type DeckBuildRecap } from "../game/systems/deck/buildRecap";
import { createRewardBuildFit } from "../game/systems/deck/rewardFit";
import { createFinalBossDebugRun } from "../game/systems/debug/debugRun";
import {
  characterEpiloguesById,
  endingsById,
  evaluateRunEnding,
  getAvailableFinalChoices,
  getFinalChoiceForEnding,
  selectCharacterEpilogue,
  selectFinalChoice,
  type CharacterEpilogueDefinition,
  type EndingDefinition,
  type FinalChoiceSelection
} from "../game/systems/endings/endings";
import { applyEventChoiceEffects, getAvailableEventChoices } from "../game/systems/events/eventEffects";
import { getUnlockedLogbookEntries, recordLogbookBoss, recordLogbookEvent } from "../game/systems/logbook/logbook";
import { claimMethodReward, createMethodRewardDraft, getRunMethods, shouldOfferMethodReward } from "../game/systems/methods/methods";
import { createProfile, recordCompletedRun, recordProfileRunRecord, recordRunResult, type PlayerProfile, type ProfileRunRecord } from "../game/systems/profile/profile";
import { evaluateProfileGoals, recordCompletedGoals } from "../game/systems/profile/goals";
import { evaluateRunLedger } from "../game/systems/profile/runLedger";
import { createRelicBuildFit } from "../game/systems/relics/relicBuildFit";
import { describeRelicSource } from "../game/systems/relics/relicEffects";
import { createAdvancedRewardDraft, type AdvancedRewardChoice } from "../game/systems/rewards/advancedRewards";
import { buildCompendium, getCompendiumCategoryLabel, type CompendiumCategory, type CompendiumFilters, type CompendiumItem } from "../game/systems/compendium/compendium";
import { getChallengeCombatModifiers, resolveChallengeProfile } from "../game/systems/challenges/challenges";
import {
  createCombatOnboardingHints,
  createMapOnboardingHints,
  createMethodOnboardingHints,
  createRewardOnboardingHints,
  dismissOnboardingHint,
  type CombatOnboardingHint,
  type SurfaceOnboardingHint
} from "../game/systems/tutorial/onboarding";
import {
  addRelic,
  advanceToNextChapter,
  claimBattleSpoils,
  claimChapterReward,
  claimMethodUpgrade,
  createChapterRewardChoices,
  createCardRewardDraft,
  createCardRewardReasonMap,
  createMapNodePreview,
  createRun,
  createShopDraft,
  createRunCompletionSnapshot,
  getAvailableNodes,
  getCurrentChapter,
  getNextChapter,
  getComboRewardHint,
  getComboRewardPrimaryCardId,
  getCurrentNode,
  getUpgradeCandidates,
  healRun,
  recordRunFinalChoice,
  recordRunCombatCombos,
  removeDeckCard,
  takeCardReward,
  travelToNode,
  upgradeDeckCard,
  type BattleSpoils,
  type MapNode,
  type RunCompletionSnapshot,
  type RunState
} from "../game/systems/run";

export type Screen = "title" | "map" | "combat" | "reward" | "methodReward" | "chapterReward" | "event" | "shop" | "rest" | "bossReward" | "finalChoice" | "logbook" | "compendium" | "runSummary" | "victory" | "defeat";
type CompendiumReturnScreen = Exclude<Screen, "compendium">;
type MapRouteState = "current" | "available" | "visited" | "locked";

const SHOP_REMOVE_PRICE = 50;

interface ControllerState {
  screen: Screen;
  run?: RunState;
  combat?: CombatState;
  rewardCards: CardDefinition[];
  pendingSpoils?: BattleSpoils;
  logbookReturnScreen?: Screen;
  deckOpen: boolean;
  compendiumFilters: Required<CompendiumFilters>;
  compendiumReturnScreen?: CompendiumReturnScreen;
  settings: DesktopSettings;
  profile: PlayerProfile;
  completedRunSummary?: CompletedRunSummaryView;
  debugToolsEnabled: boolean;
  message: string;
}

interface ControllerOptions {
  storage?: GameStorage;
  debugToolsEnabled?: boolean;
  audioFeedback?: AudioFeedback;
}

interface CompletedRunSummaryView {
  completion: RunCompletionSnapshot;
  ending: EndingDefinition;
  characterEpilogue: CharacterEpilogueDefinition;
  buildRecap: DeckBuildRecap;
  profile: PlayerProfile;
  newlyCompletedGoalIds?: string[];
}

export function createInkbladeController(host: HTMLElement, options: ControllerOptions = {}) {
  const initialSettings = loadSettings(options.storage);
  const audioFeedback = options.audioFeedback ?? createAudioFeedback(initialSettings);
  const state: ControllerState = {
    screen: "title",
    rewardCards: [],
    deckOpen: false,
    compendiumFilters: createDefaultCompendiumFilters(),
    settings: initialSettings,
    profile: loadProfile(options.storage) ?? createProfile(),
    debugToolsEnabled: options.debugToolsEnabled ?? false,
    message: ""
  };
  audioFeedback.setSettings(state.settings);
  applySettingsToHost(host, state.settings);

  const render = () => {
    host.innerHTML = "";
    syncAudioSurface(state, audioFeedback);

    if (state.screen === "map") {
      renderMap(host, state, render, options.storage, audioFeedback);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "combat") {
      renderCombat(host, state, render, options.storage, audioFeedback);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "reward") {
      renderReward(host, state, render, options.storage, audioFeedback);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "methodReward") {
      renderMethodReward(host, state, render, options.storage, audioFeedback);
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
      renderBossReward(host, state, render, options.storage);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "finalChoice") {
      renderFinalChoice(host, state, render, options.storage);
      renderDeckOverlayIfOpen(host, state, render);
      persistControllerState(state, options.storage);
      return;
    }

    if (state.screen === "logbook") {
      renderLogbook(host, state, render);
      return;
    }

    if (state.screen === "compendium") {
      renderCompendium(host, state, render);
      return;
    }

    if (state.screen === "runSummary") {
      renderRunSummary(host, state, render);
      return;
    }

    if (state.screen === "victory" || state.screen === "defeat") {
      renderResult(host, state, render);
      clearSavedGame(options.storage);
    }
  };

  installTitleShellControls(host, state, render, options.storage, audioFeedback);
  syncAudioSurface(state, audioFeedback);

  return {
    startRun(characterId: string, challengeId?: ChallengeProfileId) {
      audioFeedback.playUi();
      state.run = createRun(characterId, { mapSeed: generateMapSeed(), challengeId });
      state.combat = undefined;
      state.rewardCards = [];
      state.pendingSpoils = undefined;
      state.deckOpen = false;
      state.completedRunSummary = undefined;
      state.message = `${charactersById[characterId].name}踏入${getCurrentChapter(state.run).name}。`;
      state.screen = "map";
      render();
    },
    continueRun() {
      audioFeedback.playUi();
      const saved = loadSavedGame(options.storage);
      if (!saved) {
        return false;
      }

      state.run = saved.run;
      state.combat = saved.combat;
      state.rewardCards = saved.rewardCardIds.map((id) => cardsById[id]).filter((card): card is CardDefinition => Boolean(card));
      state.pendingSpoils = saved.pendingSpoils;
      state.deckOpen = false;
      state.profile = loadProfile(options.storage) ?? state.profile;
      state.completedRunSummary = undefined;
      state.message = saved.message || "旧存档已续上。";
      state.screen = saved.screen;
      render();
      return true;
    },
    hasSavedRun() {
      return hasSavedGame(options.storage);
    },
    clearSavedRun() {
      audioFeedback.playUi();
      clearSavedGame(options.storage);
    },
    dispose() {
      audioFeedback.dispose();
    }
  };
}

export function mapScreenToAudioSurface(screen: Screen, returnScreen?: Screen): AudioSurface {
  if ((screen === "compendium" || screen === "logbook") && returnScreen) {
    return mapScreenToAudioSurface(returnScreen);
  }

  if (screen === "map" || screen === "combat" || screen === "event" || screen === "shop" || screen === "rest") {
    return screen;
  }

  if (screen === "reward" || screen === "methodReward" || screen === "chapterReward" || screen === "bossReward") {
    return "reward";
  }

  if (screen === "finalChoice" || screen === "victory" || screen === "defeat" || screen === "runSummary") {
    return "final";
  }

  return "title";
}

function syncAudioSurface(state: ControllerState, audioFeedback: AudioFeedback): void {
  const returnScreen = state.screen === "compendium" ? state.compendiumReturnScreen : state.screen === "logbook" ? state.logbookReturnScreen : undefined;
  audioFeedback.setSurface(mapScreenToAudioSurface(state.screen, returnScreen));
}

function installTitleShellControls(host: HTMLElement, state: ControllerState, render: () => void, storage: GameStorage | undefined, audioFeedback: AudioFeedback): void {
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
    settings.addEventListener("click", () => {
      audioFeedback.playUi();
      showSettingsShell(host, state, storage, audioFeedback);
    });
    actions.append(settings);
  }

  if (!actions.querySelector("[data-testid='compendium-title-open']")) {
    const compendium = document.createElement("button");
    compendium.type = "button";
    compendium.dataset.testid = "compendium-title-open";
    compendium.textContent = "墨录图鉴";
    compendium.addEventListener("click", () => {
      audioFeedback.playUi();
      state.compendiumFilters = createDefaultCompendiumFilters();
      showCompendiumTitleShell(host, state);
    });
    actions.append(compendium);
  }

  if (!state.debugToolsEnabled) {
    actions.querySelectorAll<HTMLElement>(".title-debug-action").forEach((button) => button.remove());
    return;
  }

  if (!actions.querySelector("[data-testid='debug-run-summary']")) {
    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "title-debug-action";
    summary.dataset.testid = "debug-run-summary";
    summary.textContent = "档案战报";
    summary.addEventListener("click", () => {
      audioFeedback.playUi();
      showRunSummaryShell(host, state, render);
    });
    actions.append(summary);
  }

  if (!actions.querySelector("[data-testid='debug-ending-summary']")) {
    const completed = document.createElement("button");
    completed.type = "button";
    completed.className = "title-debug-action";
    completed.dataset.testid = "debug-ending-summary";
    completed.textContent = "终章战报";
    completed.addEventListener("click", () => {
      audioFeedback.playUi();
      const selectedChallengeId = title.querySelector<HTMLElement>(".challenge-choice.is-selected")?.dataset.challengeId;
      state.run = createCompletedDebugRun(resolveChallengeProfile(selectedChallengeId).id);
      completeRunWithEnding(state, storage);
      audioFeedback.playVictory();
      render();
    });
    actions.append(completed);
  }

  if (!actions.querySelector("[data-testid='debug-final-route']")) {
    const finalRoute = document.createElement("button");
    finalRoute.type = "button";
    finalRoute.className = "title-debug-action";
    finalRoute.dataset.testid = "debug-final-route";
    finalRoute.textContent = "终章路线";
    finalRoute.addEventListener("click", () => {
      audioFeedback.playUi();
      state.run = createFinalBossDebugRun();
      state.combat = undefined;
      state.pendingSpoils = undefined;
      state.completedRunSummary = undefined;
      state.rewardCards = [];
      state.deckOpen = false;
      state.screen = "map";
      state.message = "墨渊照心已展开，黑水镜尽头只余无名史官。";
      render();
    });
    actions.append(finalRoute);
  }
}

function showSettingsShell(host: HTMLElement, state: ControllerState, storage: GameStorage | undefined, audioFeedback: AudioFeedback): void {
  removeTitleShellOverlay(host);
  const panel = createPanel("screen-settings", "设置");
  panel.classList.add("settings-screen", "title-shell-panel");
  panel.dataset.titleShellOverlay = "true";

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = "设置保存在本机，和当前行旅存档分开。";

  const updateSettings = (patch: Partial<DesktopSettings>) => {
    state.settings = { ...state.settings, ...patch };
    saveSettings(storage, state.settings);
    audioFeedback.setSettings(state.settings);
    applySettingsToHost(host, state.settings);
    audioFeedback.playUi();
  };

  const settingsList = document.createElement("div");
  settingsList.className = "settings-list";
  settingsList.append(
    createSettingToggle(
      "setting-reduced-motion",
      "减少动态",
      "压低非必要动效，保留关键战斗反馈。",
      state.settings.reducedMotion,
      (checked) => {
        updateSettings({ reducedMotion: checked });
      }
    ),
    createSettingToggle(
      "setting-fast-combat-text",
      "快速战斗文字",
      "缩短战斗浮字停留时间，方便重复跑图。",
      state.settings.fastCombatText,
      (checked) => {
        updateSettings({ fastCombatText: checked });
      }
    ),
    createSettingToggle(
      "setting-muted",
      "静音",
      "关闭所有程序音效反馈。",
      state.settings.muted,
      (checked) => {
        updateSettings({ muted: checked });
      }
    ),
    createSettingRange("setting-master-volume", "主音量", state.settings.masterVolume, (value) => updateSettings({ masterVolume: value })),
    createSettingRange("setting-music-volume", "音乐音量", state.settings.musicVolume, (value) => updateSettings({ musicVolume: value })),
    createSettingRange("setting-sfx-volume", "音效音量", state.settings.sfxVolume, (value) => updateSettings({ sfxVolume: value }))
  );

  const back = createAction("返回", "收起设置，留在标题。", () => {
    audioFeedback.playUi();
    removeTitleShellOverlay(host);
  });
  back.dataset.testid = "settings-back";

  panel.append(note, settingsList, back);
  host.append(panel);
}

function showRunSummaryShell(host: HTMLElement, state: ControllerState, render: () => void): void {
  removeTitleShellOverlay(host);
  const panel = createPanel("screen-run-summary", "行旅结算");
  panel.classList.add("run-summary-screen", "title-shell-panel");
  panel.dataset.titleShellOverlay = "true";

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = "档案中的行旅与结局会保存在本机。";

  const stats = document.createElement("div");
  stats.className = "run-summary-stats";
  stats.append(
    createRunSummaryStat("总行旅", `${state.profile.stats.totalRuns}`, "profile-total-runs"),
    createRunSummaryStat("胜利", `${state.profile.stats.victories}`),
    createRunSummaryStat("梦醒", `${state.profile.stats.defeats}`),
    createRunSummaryStat("结局", formatUnlockedEndingTitles(state.profile), "profile-unlocked-endings"),
    createRunSummaryStat("角色结局", formatUnlockedCharacterEpilogueTitles(state.profile), "profile-unlocked-epilogues"),
    createRunSummaryStat("墨录残页", `${state.profile.unlockedFragments.length}`),
    createRunSummaryStat("角色档案", `${Object.keys(state.profile.characterStats).length}`)
  );

  const goals = createProfileGoalsList(state.profile);
  const ledger = createProfileRunLedger(state.profile);

  const actions = document.createElement("div");
  actions.className = "run-summary-actions";
  const back = createAction("返回标题", "收起战报，回到标题。", () => removeTitleShellOverlay(host));
  back.dataset.testid = "run-summary-back";
  const logbook = createAction("打开墨录", state.run ? "查看本局已录残页。" : "当前没有正在进行的行旅。", () => {
    if (!state.run) {
      return;
    }

    removeTitleShellOverlay(host);
    openLogbook(state, render);
  });
  logbook.dataset.testid = "run-summary-logbook";
  logbook.disabled = !state.run;
  actions.append(back, logbook);

  panel.append(note, stats, goals, ledger, actions);
  host.append(panel);
}

function showCompendiumTitleShell(host: HTMLElement, state: ControllerState): void {
  removeTitleShellOverlay(host);
  const panel = createCompendiumPanel(
    state,
    () => showCompendiumTitleShell(host, state),
    () => removeTitleShellOverlay(host),
    "返回标题",
    "收起图鉴，回到主菜单。"
  );
  panel.classList.add("title-shell-panel");
  panel.dataset.titleShellOverlay = "true";
  host.append(panel);
}

function renderCompendium(host: HTMLElement, state: ControllerState, render: () => void): void {
  const panel = createCompendiumPanel(
    state,
    render,
    () => {
      state.screen = state.compendiumReturnScreen ?? "map";
      state.compendiumReturnScreen = undefined;
      render();
    },
    "返回行旅",
    "回到打开图鉴前的界面。"
  );

  if (state.run) {
    panel.insertBefore(createRunStatus(state.run, "墨录图鉴已展开，当前行旅仍留在原处。"), panel.children[1] ?? null);
  }

  host.append(panel);
}

function createCompendiumPanel(
  state: ControllerState,
  refresh: () => void,
  onBack: () => void,
  backTitle: string,
  backBody: string
): HTMLElement {
  const compendium = buildCompendium(state.compendiumFilters, state.profile);
  const referenceCount = Math.max(0, compendium.filteredCount - compendium.unlockSummary.total);
  const panel = createPanel("screen-compendium", "墨录图鉴");
  panel.classList.add("compendium-screen");
  panel.dataset.unlockedCount = `${compendium.unlockSummary.unlocked}`;
  panel.dataset.lockedCount = `${compendium.unlockSummary.locked}`;
  panel.dataset.referenceCount = `${referenceCount}`;

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = "卡牌、法宝、敌影、招式链与残页汇在一处，方便开局前和行旅中快速翻查。";

  const tabs = document.createElement("div");
  tabs.className = "compendium-tabs";
  const allTab = createCompendiumTab("all", "全部", compendium.totalCount, state.compendiumFilters.category === "all", () => {
    state.compendiumFilters = { ...state.compendiumFilters, category: "all", character: "all", rarity: "all", chapter: "all", unlock: "all" };
    refresh();
  });
  tabs.append(allTab);
  for (const category of compendium.facets.categories) {
    tabs.append(createCompendiumTab(category.id as CompendiumCategory, category.label, category.count, state.compendiumFilters.category === category.id, () => {
      state.compendiumFilters = {
        ...state.compendiumFilters,
        category: category.id as CompendiumCategory,
        character: "all",
        rarity: "all",
        chapter: "all",
        unlock: "all"
      };
      refresh();
    }));
  }

  const filters = document.createElement("div");
  filters.className = "compendium-filters";
  filters.append(
    createCompendiumSelect("compendium-filter-character", "角色", state.compendiumFilters.character, compendium.facets.characters, (value) => {
      state.compendiumFilters = { ...state.compendiumFilters, character: value };
      refresh();
    }),
    createCompendiumSelect("compendium-filter-rarity", "稀有度", state.compendiumFilters.rarity, compendium.facets.rarities, (value) => {
      state.compendiumFilters = { ...state.compendiumFilters, rarity: value };
      refresh();
    }),
    createCompendiumSelect("compendium-filter-chapter", "章节", state.compendiumFilters.chapter, compendium.facets.chapters, (value) => {
      state.compendiumFilters = { ...state.compendiumFilters, chapter: value as Required<CompendiumFilters>["chapter"] };
      refresh();
    }),
    createCompendiumSelect("compendium-filter-unlock", "收录", state.compendiumFilters.unlock, createCompendiumUnlockFacets(compendium.filteredCount, compendium.unlockSummary), (value) => {
      state.compendiumFilters = { ...state.compendiumFilters, unlock: value as Required<CompendiumFilters>["unlock"] };
      refresh();
    })
  );

  const summary = document.createElement("div");
  summary.className = "compendium-summary";
  summary.dataset.testid = "compendium-summary";
  summary.textContent = `显示 ${compendium.filteredCount} / ${compendium.totalCount} 条 · 已录 ${compendium.unlockSummary.unlocked} · 未录 ${compendium.unlockSummary.locked} · 参照 ${referenceCount}`;

  const list = document.createElement("div");
  list.className = "compendium-list";
  if (compendium.groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "compendium-empty";
    empty.dataset.testid = "compendium-empty";
    empty.textContent = "暂无符合筛选的墨录。";
    list.append(empty);
  }

  for (const group of compendium.groups) {
    const section = document.createElement("section");
    section.className = "compendium-group";
    const heading = document.createElement("h3");
    heading.textContent = `${getCompendiumCategoryLabel(group.id)} ${group.items.length}`;
    section.append(heading);

    const grid = document.createElement("div");
    grid.className = "compendium-item-grid";
    for (const item of group.items) {
      grid.append(createCompendiumItemCard(item));
    }
    section.append(grid);
    list.append(section);
  }

  const back = createAction(backTitle, backBody, onBack);
  back.dataset.testid = "compendium-back";

  panel.append(note, tabs, filters, summary, list, back);
  return panel;
}

function createCompendiumTab(id: CompendiumCategory | "all", label: string, count: number, active: boolean, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = active ? "compendium-tab is-active" : "compendium-tab";
  button.dataset.testid = `compendium-tab-${id}`;
  button.innerHTML = `<strong>${label}</strong><span>${count}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function createCompendiumSelect(
  testId: string,
  label: string,
  value: string,
  facets: Array<{ id: string; label: string; count: number }>,
  onChange: (value: string) => void
): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className = "compendium-filter";
  const text = document.createElement("span");
  text.textContent = label;
  const select = document.createElement("select");
  select.dataset.testid = testId;
  select.append(new Option("全部", "all"));
  for (const facet of facets) {
    select.append(new Option(`${facet.label} ${facet.count}`, facet.id));
  }
  select.value = value;
  select.addEventListener("change", () => onChange(select.value));
  wrapper.append(text, select);
  return wrapper;
}

function createCompendiumUnlockFacets(
  filteredCount: number,
  unlockSummary: { total: number; unlocked: number; locked: number }
): Array<{ id: string; label: string; count: number }> {
  return [
    { id: "reference", label: "参照", count: Math.max(0, filteredCount - unlockSummary.total) },
    { id: "unlocked", label: "已录", count: unlockSummary.unlocked },
    { id: "locked", label: "未录", count: unlockSummary.locked }
  ];
}

function createCompendiumItemCard(item: CompendiumItem): HTMLElement {
  const article = document.createElement("article");
  const unlockState = item.unlockState ?? "reference";
  article.className = `compendium-item compendium-item--${item.category}`;
  article.dataset.testid = "compendium-item";
  article.dataset.category = item.category;
  article.dataset.unlockState = unlockState;
  if (item.unlockReason) {
    article.dataset.unlockReason = item.unlockReason;
  }

  const heading = document.createElement("div");
  heading.className = "compendium-item-heading";
  const title = document.createElement("h4");
  title.textContent = item.title;
  const unlockBadge = document.createElement("span");
  unlockBadge.className = `compendium-unlock-badge compendium-unlock-badge--${unlockState}`;
  unlockBadge.dataset.testid = "compendium-unlock-badge";
  unlockBadge.textContent = formatCompendiumUnlockState(unlockState);
  unlockBadge.title = item.unlockReason ?? unlockBadge.textContent;
  heading.append(title, unlockBadge);

  const subtitle = document.createElement("small");
  subtitle.textContent = item.subtitle;
  const body = document.createElement("p");
  body.textContent = item.body;
  const meta = document.createElement("div");
  meta.className = "compendium-meta";
  for (const entry of item.meta.filter(Boolean).slice(0, 4)) {
    const chip = document.createElement("span");
    chip.textContent = entry;
    meta.append(chip);
  }

  article.append(heading, subtitle, body, meta);
  return article;
}

function formatCompendiumUnlockState(state: NonNullable<CompendiumItem["unlockState"]>): string {
  switch (state) {
    case "unlocked":
      return "已录";
    case "locked":
      return "未录";
    case "reference":
      return "参照";
  }
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

function createSettingRange(testId: string, title: string, value: number, onChange: (value: number) => void): HTMLElement {
  const row = document.createElement("label");
  row.className = "settings-row";

  const copy = document.createElement("span");
  copy.innerHTML = `<strong>${title}</strong><small>${value}%</small>`;

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.value = `${value}`;
  input.dataset.testid = testId;
  input.addEventListener("input", () => {
    const nextValue = Number(input.value);
    copy.innerHTML = `<strong>${title}</strong><small>${nextValue}%</small>`;
    onChange(nextValue);
  });

  row.append(copy, input);
  return row;
}

function createRunSummaryStat(label: string, value: string, testId?: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "run-summary-stat";
  row.dataset.testid = testId ?? "run-summary-stat";
  row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  return row;
}

function removeTitleShellOverlay(host: HTMLElement): void {
  host.querySelectorAll<HTMLElement>("[data-title-shell-overlay='true']").forEach((item) => item.remove());
}

function applySettingsToHost(host: HTMLElement, settings: DesktopSettings): void {
  host.classList.toggle("prefers-reduced-motion", settings.reducedMotion);
  host.classList.toggle("prefers-fast-combat-text", settings.fastCombatText);
}

function getDebugSkipChapterHandler(state: ControllerState, render: () => void): (() => void) | undefined {
  return state.debugToolsEnabled ? () => skipChapterForDebug(state, render) : undefined;
}

function renderMap(
  host: HTMLElement,
  state: ControllerState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const current = getCurrentNode(run);
  const available = getAvailableNodes(run);
  const panel = createPanel("screen-map", chapter.mapTitle);
  panel.classList.add("map-screen");

  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));
  if (run.completedChapterIds.length === 0 && run.currentNodeId === "start") {
    const hints = createMapOnboardingHints(state.settings.dismissedOnboardingHintIds);
    if (hints.length > 0) {
      panel.append(createSurfaceOnboardingStrip(hints, state, render, storage, audioFeedback));
    }
  }

  const path = document.createElement("div");
  path.className = "route-map";
  const mapColumns = Math.max(...run.mapNodes.map((node) => node.floor)) + 1;
  path.style.setProperty("--map-columns", `${mapColumns}`);
  const availableIds = new Set(available.map((item) => item.id));
  path.append(createRouteConnectorLayer(run, current, availableIds, mapColumns));

  for (const node of run.mapNodes) {
    const preview = createMapNodePreview(run, node);
    const routeState = getMapRouteState(run, node, current, availableIds);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `map-node map-node--${node.type}`;
    button.classList.add(`is-${routeState}`);
    button.dataset.testid = `map-node-${node.id}`;
    button.dataset.floor = `${node.floor}`;
    button.dataset.lane = `${node.lane}`;
    button.dataset.previewTone = preview.tone;
    button.dataset.routeState = routeState;
    button.style.gridColumn = `${node.floor + 1}`;
    button.style.gridRow = `${node.lane + 1}`;
    button.innerHTML = `
      <span class="map-node-icon">${getMapNodeIcon(node.type)}</span>
      <span class="map-node-state" data-testid="map-node-state-${escapeAttribute(node.id)}">${formatMapRouteState(routeState)}</span>
      <strong>${escapeHtml(node.label)}</strong>
      <small>${escapeHtml(formatMapNodeMeta(node))}</small>
      <span class="map-node-preview" data-testid="map-node-preview-${escapeAttribute(node.id)}">${escapeHtml(preview.detail)}</span>
      <span class="map-node-reward" data-testid="map-node-reward-${escapeAttribute(node.id)}">${escapeHtml(preview.reward)}</span>
      <span class="map-node-tags" aria-hidden="true">${preview.tags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}</span>
    `;
    button.disabled = routeState !== "available";
    const connectionTitle = node.connections.length > 0 ? `通向：${node.connections.map((id) => getMapNodeLabel(run, id)).join("、")}` : "本章首领";
    button.title = `${preview.title}：${preview.detail}；${preview.reward}。${connectionTitle}`;
    button.setAttribute("aria-label", `${preview.title}，${preview.detail}，${preview.reward}`);

    if (node.id === current.id) {
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
  mountChapterPanel(host, panel, run);
}

function createRouteConnectorLayer(run: RunState, current: MapNode, availableIds: Set<string>, mapColumns: number): SVGSVGElement {
  const laneCount = Math.max(...run.mapNodes.map((node) => node.lane)) + 1;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const nodeMap = new Map(run.mapNodes.map((node) => [node.id, node]));
  svg.classList.add("route-connectors");
  svg.dataset.testid = "route-connectors";
  svg.setAttribute("viewBox", `0 0 ${mapColumns * 100 + Math.max(0, mapColumns - 1) * 18} ${laneCount * 112 + Math.max(0, laneCount - 1) * 14}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  for (const node of run.mapNodes) {
    for (const targetId of node.connections) {
      const target = nodeMap.get(targetId);
      if (!target) {
        continue;
      }

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const state = node.id === current.id && availableIds.has(target.id)
        ? "available"
        : run.visitedNodeIds.includes(node.id)
          ? "visited"
          : "locked";
      line.classList.add("route-connector", `route-connector--${state}`);
      line.dataset.testid = `route-connector-${node.id}-${target.id}`;
      line.dataset.routeConnectorState = state;
      line.setAttribute("x1", `${node.floor * 118 + 53}`);
      line.setAttribute("y1", `${node.lane * 126 + 56}`);
      line.setAttribute("x2", `${target.floor * 118 + 53}`);
      line.setAttribute("y2", `${target.lane * 126 + 56}`);
      svg.append(line);
    }
  }

  return svg;
}

function getMapRouteState(run: RunState, node: MapNode, current: MapNode, availableIds: Set<string>): MapRouteState {
  if (node.id === current.id) {
    return "current";
  }

  if (run.visitedNodeIds.includes(node.id)) {
    return "visited";
  }

  if (availableIds.has(node.id)) {
    return "available";
  }

  return "locked";
}

function formatMapRouteState(routeState: MapRouteState): string {
  const labels: Record<MapRouteState, string> = {
    current: "当前",
    available: "可走",
    visited: "已行",
    locked: "未通"
  };
  return labels[routeState];
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

function skipChapterForDebug(state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const nextChapter = getNextChapter(run);
  if (!nextChapter) {
    state.combat = undefined;
    state.pendingSpoils = undefined;
    state.rewardCards = [];
    state.deckOpen = false;
    state.message = "调试跳章：已在最后一章。";
    state.screen = "map";
    render();
    return;
  }

  state.combat = undefined;
  state.pendingSpoils = undefined;
  state.rewardCards = [];
  state.deckOpen = false;
  state.completedRunSummary = undefined;
  if (advanceToNextChapter(run)) {
    state.message = `调试跳章：${nextChapter.name}已展开。`;
  }
  state.screen = "map";
  render();
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
    challengeModifiers: getChallengeCombatModifiers(run.challengeId),
    shuffleDeck: true
  });
  state.message = `${enemy.name}显出意图。`;
  state.screen = "combat";
}

function renderCombat(host: HTMLElement, state: ControllerState, render: () => void, storage: GameStorage | undefined, audioFeedback: AudioFeedback): void {
  const run = requireRun(state);
  const combat = requireCombat(state);
  const enemy = combat.enemies[0];
  const playerPortrait = getCombatPortrait(combat.player.characterId);
  const enemyPortrait = getCombatPortrait(enemy.definitionId);
  const latestDamageTarget = getLatestDamageTarget(combat);
  const playerIsAttacking = latestDamageTarget === "enemy";
  const enemyIsAttacking = latestDamageTarget === "player";
  const intentPresentation = getIntentPresentation(enemy.currentIntent);
  const playerSprite = playerIsAttacking ? getCombatAttackSprite(combat.player.characterId) : undefined;
  const enemySprite = enemyIsAttacking ? getCombatAttackSprite(enemy.definitionId) : undefined;
  const comboTrail = createComboTrailMetadata(combat);
  const panel = createPanel("screen-combat", "回合 " + combat.turn);
  panel.classList.add("combat-screen");
  panel.classList.add(`combat-screen--${run.chapterId}`);
  panel.dataset.battlefield = run.chapterId;

  const top = document.createElement("div");
  top.className = "combat-topbar";
  top.append(
    createMeter("player-hp", combat.player.name, combat.player.hp, combat.player.maxHp, "朱砂", playerPortrait.assetPath),
    createIntent(enemy.currentIntent),
    createMeter("enemy-hp", enemy.name, enemy.hp, enemy.maxHp, "青墨", enemyPortrait.assetPath)
  );

  const field = document.createElement("div");
  field.className = "combat-field";
  field.dataset.intentType = intentPresentation.type;
  field.dataset.intentPressure = intentPresentation.pressure;
  field.innerHTML = `
    <div class="combatant combatant--player ${createCombatantFeedbackClasses(combat, "player")} ${hasRecentVisual(combat, "player", "damage") ? "is-hit" : ""} ${hasRecentVisual(combat, "player", "block") ? "is-guarding" : ""}">
      ${createCombatResourcePill("player", combat.player.resource.name, `${combat.player.resource.value}/${combat.player.resource.max}`)}
      ${createCombatStatusLine("player", [
        { label: "护甲", value: `${combat.player.block}`, tone: "block" },
        { label: "心境", value: formatMind(combat.player.mind), tone: "mind" },
        { label: "墨痕", value: `${combat.player.inkMarks}`, tone: "ink" }
      ], combat.player.statuses)}
      ${createTargetFeedbackMarkup(combat, "player")}
      <div class="combat-standee combat-standee--player combat-standee--${playerPortrait.accent} ${playerIsAttacking ? "is-attacking" : ""}">
        ${playerSprite ? `<div class="combat-sprite combat-sprite--player is-attacking" data-testid="combat-sprite-player" style="--sprite-url: url('${playerSprite.assetPath}')"></div>` : ""}
        <img class="combat-standee-art" data-testid="combat-standee-player" src="${getStandeePath(playerPortrait)}" alt="${playerPortrait.alt}">
      </div>
    </div>
    <div class="duel-column ${combat.playedCardTypesThisTurn.length > 0 ? "is-combo-active" : ""}" data-intent-pressure="${intentPresentation.pressure}">
      <div class="duel-mark">对决</div>
      <div class="combo-trail" data-testid="combo-trail" title="${escapeAttribute(comboTrail.title)}" aria-label="${escapeAttribute(comboTrail.ariaLabel)}" data-glossary-id="${escapeAttribute(comboTrail.glossaryIds.join(" "))}"><span>招式</span><strong>${escapeHtml(comboTrail.text)}</strong></div>
      ${createPlayedFeedbackMarkup(combat)}
    </div>
    <div class="combatant combatant--enemy ${createCombatantFeedbackClasses(combat, "enemy")} is-pressure-${intentPresentation.type} is-pressure-${intentPresentation.pressure} ${hasRecentVisual(combat, "enemy", "damage") ? "is-hit" : ""} ${hasRecentVisual(combat, "enemy", "status") ? "is-marked" : ""}">
      ${createCombatResourcePill("enemy", "敌势", `${enemy.intentIndex + 1}/${enemy.intents.length}`)}
      ${createCombatStatusLine("enemy", [
        { label: "护甲", value: `${enemy.block}`, tone: "block" }
      ], enemy.statuses)}
      ${createTargetFeedbackMarkup(combat, "enemy")}
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
    const cost = getDisplayCost(definition, card.upgraded);
    const playable = cost <= combat.player.energy;
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = `combat-card card-type-${definition.types[0]}`;
    if (card.upgraded) {
      cardButton.classList.add("is-upgraded");
    }
    if (!playable) {
      cardButton.classList.add("is-unplayable");
      cardButton.dataset.disabledReason = "energy";
      cardButton.title = `内力不足：需要${cost}，当前${combat.player.energy}`;
    }
    cardButton.dataset.testid = `card-${card.instanceId}`;
    cardButton.dataset.playable = playable ? "true" : "false";
    cardButton.disabled = !playable;
    cardButton.innerHTML = `
      ${createCardArtMarkup(definition)}
      ${createCardChromeMarkup(definition)}
      <span class="card-cost" data-testid="card-cost" aria-label="消耗 ${cost}">${cost}</span>
      <strong>${definition.name}${card.upgraded ? " +" : ""}</strong>
      <small class="card-type-line">${formatTypes(definition.types)}</small>
      ${createCardKeywordRowMarkup(definition)}
      <span class="card-description">${getDisplayDescription(definition, card.upgraded)}</span>
    `;
    cardButton.addEventListener("click", () => {
      const targetId = definition.target === "enemy" ? enemy.id : "player";
      const result = playCard(combat, card.instanceId, targetId);
      state.message = result.ok ? `${definition.name}已出。` : explainPlayFailure(result.reason);
      if (result.ok) {
        audioFeedback.playCard();
      }
      handleCombatAfterAction(state, storage, audioFeedback);
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
    audioFeedback.playUi();
    endPlayerTurn(combat);
    state.message = "敌意落下，新的回合开始。";
    handleCombatAfterAction(state, storage, audioFeedback);
    render();
  });
  controls.append(
    createPileCounter("draw", "抽牌", combat.piles.draw.length),
    createPileCounter("discard", "弃牌", combat.piles.discard.length),
    createPileCounter("exhaust", "消耗", combat.piles.exhaust.length),
    endTurn
  );

  panel.append(top, createCombatBuildReadout(run, combat), field, createCombatOnboardingRail(state, combat, render, storage, audioFeedback), createMessage(state.message), createCombatLog(combat), hand, controls);
  host.append(panel);
  dispatchBattlefieldChange(run.chapterId);

  run.hp = combat.player.hp;
}

function createCombatBuildReadout(run: RunState, combat: CombatState): HTMLElement {
  const readout = document.createElement("div");
  readout.className = "combat-build-readout";
  readout.dataset.testid = "combat-build-readout";
  const relicNames = combat.relicIds.map((id) => relicsById[id]?.name ?? id).slice(0, 4).join("、") || "未持有";
  const methodNames = getRunMethods(run).map((method) => method.name).slice(0, 3).join("、") || "未定";
  readout.innerHTML = `
    <span><b>法宝</b> ${escapeHtml(relicNames)}</span>
    <span><b>心法</b> ${escapeHtml(methodNames)}</span>
    <span><b>招式链</b> ${escapeHtml(formatComboTrail(combat))}</span>
  `;
  return readout;
}

function createCombatOnboardingRail(
  state: ControllerState,
  combat: CombatState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): HTMLElement {
  const rail = document.createElement("div");
  rail.className = "onboarding-rail";
  rail.dataset.testid = "onboarding-rail";

  const hints = createCombatOnboardingHints(combat, state.settings.dismissedOnboardingHintIds);
  for (const hint of hints) {
    rail.append(createCombatOnboardingHint(hint, state, render, storage, audioFeedback));
  }

  return rail;
}

function createCombatOnboardingHint(
  hint: CombatOnboardingHint,
  state: ControllerState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): HTMLElement {
  const element = document.createElement("article");
  element.className = `onboarding-hint onboarding-hint--${hint.anchor}`;
  element.dataset.testid = `onboarding-hint-${hint.id}`;
  element.innerHTML = `
    <strong>${escapeHtml(hint.title)}</strong>
    <span>${escapeHtml(hint.body)}</span>
  `;

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "onboarding-dismiss";
  dismiss.dataset.testid = `onboarding-dismiss-${hint.id}`;
  dismiss.setAttribute("aria-label", `关闭${hint.title}提示`);
  dismiss.textContent = "×";
  dismiss.addEventListener("click", () => {
    state.settings = {
      ...state.settings,
      dismissedOnboardingHintIds: dismissOnboardingHint(state.settings.dismissedOnboardingHintIds, hint.id)
    };
    saveSettings(storage, state.settings);
    audioFeedback.playUi();
    render();
  });

  element.append(dismiss);
  return element;
}

function createSurfaceOnboardingStrip(
  hints: SurfaceOnboardingHint[],
  state: ControllerState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): HTMLElement {
  const strip = document.createElement("div");
  strip.className = "surface-hint-strip";
  strip.dataset.testid = "surface-hint-strip";

  for (const hint of hints) {
    const article = document.createElement("article");
    article.className = "surface-hint";
    article.dataset.testid = `surface-hint-${hint.id}`;
    article.innerHTML = `
      <strong>${escapeHtml(hint.title)}</strong>
      <span>${escapeHtml(hint.body)}</span>
    `;

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "surface-hint-dismiss";
    dismiss.dataset.testid = `surface-hint-dismiss-${hint.id}`;
    dismiss.setAttribute("aria-label", `关闭${hint.title}提示`);
    dismiss.textContent = "×";
    dismiss.addEventListener("click", () => {
      state.settings = {
        ...state.settings,
        dismissedOnboardingHintIds: dismissOnboardingHint(state.settings.dismissedOnboardingHintIds, hint.id)
      };
      saveSettings(storage, state.settings);
      audioFeedback.playUi();
      render();
    });

    article.append(dismiss);
    strip.append(article);
  }

  return strip;
}

function dispatchBattlefieldChange(chapterId: RunState["chapterId"]): void {
  const battlefieldId = battlefieldAssets[chapterId] ? chapterId : "luoshui";
  window.dispatchEvent(new CustomEvent("inkblade:set-battlefield", {
    detail: {
      chapterId: battlefieldId
    }
  }));
}

function mountChapterPanel(host: HTMLElement, panel: HTMLElement, run: RunState): void {
  applyChapterPanelContext(panel, run);
  host.append(panel);
  dispatchBattlefieldChange(run.chapterId);
}

function applyChapterPanelContext(panel: HTMLElement, run: RunState): void {
  const battlefieldId = battlefieldAssets[run.chapterId] ? run.chapterId : "luoshui";
  panel.classList.add("chapter-panel", `chapter-panel--${battlefieldId}`);
  panel.dataset.battlefield = battlefieldId;
}

function handleCombatAfterAction(state: ControllerState, storage: GameStorage | undefined, audioFeedback: AudioFeedback): void {
  const run = requireRun(state);
  const combat = requireCombat(state);
  run.hp = combat.player.hp;

  if (combat.phase === "lost") {
    recordDefeatIfNeeded(state, storage);
    audioFeedback.playDefeat();
    state.screen = "defeat";
    state.message = "黑雨没过衣袂，本次行旅止于此处。";
    return;
  }

  if (combat.phase === "won") {
    audioFeedback.playVictory();
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

function renderMethodReward(
  host: HTMLElement,
  state: ControllerState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): void {
  const run = requireRun(state);
  const node = getCurrentNode(run);
  const draft = createMethodRewardDraft(run);
  const panel = createPanel("screen-method-reward", "心法");
  panel.classList.add("method-reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));
  if (run.methodIds.length === 0) {
    const hints = createMethodOnboardingHints(state.settings.dismissedOnboardingHintIds);
    if (hints.length > 0) {
      panel.append(createSurfaceOnboardingStrip(hints, state, render, storage, audioFeedback));
    }
  }
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
  mountChapterPanel(host, panel, run);
}

function renderReward(
  host: HTMLElement,
  state: ControllerState,
  render: () => void,
  storage: GameStorage | undefined,
  audioFeedback: AudioFeedback
): void {
  const run = requireRun(state);
  const panel = createPanel("screen-reward", "战利");
  panel.classList.add("reward-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));
  if (run.rewardHistory.length === 0) {
    const hints = createRewardOnboardingHints(state.settings.dismissedOnboardingHintIds);
    if (hints.length > 0) {
      panel.append(createSurfaceOnboardingStrip(hints, state, render, storage, audioFeedback));
    }
  }
  const stage = document.createElement("div");
  stage.className = "scene-surface reward-stage";
  stage.dataset.testid = "reward-stage";
  stage.append(createMessage(state.message));
  stage.append(createSpoilsSummary(state.pendingSpoils));
  const comboHint = getComboRewardHint(run);
  const comboPrimaryCardId = getComboRewardPrimaryCardId(run);
  const rewardReasons = createCardRewardReasonMap(run, state.rewardCards);
  const currentDeckCards = getRunCardDefinitions(run);
  const archetypeAnalysis = analyzeDeckArchetypes(currentDeckCards);
  if (comboHint) {
    stage.append(createRewardComboHint(comboHint));
  }

  const rewards = document.createElement("div");
  rewards.className = "reward-cards";
  rewards.dataset.testid = "reward-card-case";
  for (const card of state.rewardCards) {
    const isComboBiased = card.id === comboPrimaryCardId;
    const fit = createRewardBuildFit(currentDeckCards, card);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `reward-card card-type-${card.types[0]}`;
    if (isComboBiased) {
      button.classList.add("is-combo-biased");
    }
    button.dataset.testid = "reward-card";
    button.dataset.comboBiased = isComboBiased ? "true" : "false";
    button.dataset.buildFitTone = fit.tone;
    button.innerHTML = `
      ${createCardArtMarkup(card)}
      ${createCardChromeMarkup(card)}
      <span class="card-cost" data-testid="card-cost" aria-label="消耗 ${getDisplayCost(card)}">${getDisplayCost(card)}</span>
      ${isComboBiased ? `<span class="reward-combo-mark">招式回响</span>` : ""}
      <strong>${card.name}</strong>
      <small class="card-type-line">${formatTypes(card.types)}</small>
      ${createCardKeywordRowMarkup(card)}
      <span class="card-description">${card.description ?? ""}</span>
      <span class="reward-archetype-role" data-testid="reward-archetype-role">${getCardArchetypeRole(card, archetypeAnalysis)}</span>
      <span class="reward-build-fit reward-build-fit--${fit.tone}" data-testid="reward-build-fit">${fit.label}</span>
      <span class="reward-build-fit-detail" data-testid="reward-build-fit-detail">${fit.detail}</span>
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
  skip.className = "reward-skip";
  skip.dataset.testid = "reward-skip";
  skip.textContent = "跳过，另取3铜钱";
  skip.addEventListener("click", () => {
    run.gold += 3;
    state.message = "你收起额外铜钱，继续前行。";
    state.pendingSpoils = undefined;
    state.screen = "map";
    render();
  });

  const footer = document.createElement("div");
  footer.className = "reward-footer";
  footer.dataset.testid = "reward-footer";
  footer.append(skip);

  stage.append(rewards, footer);
  panel.append(stage);
  mountChapterPanel(host, panel, run);
}

function renderEvent(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const current = getCurrentNode(run);
  const event = eventsById[current.eventId ?? "event_black_rain_ferry"];
  const eventScene = getEventScene(event.id);
  const panel = createPanel("screen-event", event.title);
  panel.classList.add("event-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));

  const layout = document.createElement("div");
  layout.className = "scene-surface event-layout";
  layout.dataset.testid = "event-layout";
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
      <span class="event-kicker" data-testid="event-kicker">${eventScene.kicker}</span>
      <h3>${event.title}</h3>
      <p>${event.description}</p>
    </div>
  `;
  layout.append(hero);

  const choices = document.createElement("div");
  choices.className = "event-choices event-choice-rail";
  choices.dataset.testid = "event-choices";

  for (const choice of getAvailableEventChoices(event, run.characterId)) {
    const action = createEventChoiceAction(choice, () => {
      const beforeLogbookCount = getUnlockedLogbookEntries(run).length;
      applyEventChoiceEffects(run, choice);
      recordLogbookEvent(run, event.id);
      const afterLogbookCount = getUnlockedLogbookEntries(run).length;
      const unlockedText = afterLogbookCount > beforeLogbookCount ? " · 墨录 +1" : "";
      state.message = `${event.title}：${choice.label}${unlockedText}`;
      state.screen = "map";
      render();
    });
    choices.append(action);
  }

  layout.append(choices);
  panel.append(layout);
  mountChapterPanel(host, panel, run);
}

function renderShop(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const shopDraft = createShopDraft(run);
  const panel = createPanel("screen-shop", "茶亭游商");
  panel.classList.add("shop-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));

  const scene = document.createElement("div");
  scene.className = "scene-surface shop-scene";
  scene.dataset.testid = "shop-scene";

  const marquee = document.createElement("div");
  marquee.className = "shop-marquee";
  marquee.dataset.testid = "shop-marquee";
  marquee.innerHTML = `
    <span>茶亭灯影</span>
    <strong>铜钱 ${run.gold}</strong>
    <span>江湖行货</span>
  `;
  scene.append(marquee);

  const list = document.createElement("div");
  list.className = "shop-list";

  for (const offer of shopDraft.cards) {
    const button = createShopCardAction(run, offer, () => {
      if (run.gold < offer.price) {
        state.message = "铜钱不足。";
        render();
        return;
      }

      run.gold -= offer.price;
      takeCardReward(run, offer.card);
      state.message = `购得${offer.card.name}。`;
      render();
    });
    list.append(button);
  }

  const cardSection = document.createElement("section");
  cardSection.className = "shop-section shop-section--cards";
  cardSection.dataset.testid = "shop-section-cards";
  cardSection.innerHTML = `<h3 class="shop-section-title">武学札</h3>`;
  cardSection.append(list);

  const relicList = document.createElement("div");
  relicList.className = "shop-list shop-list--relics";
  for (const offer of shopDraft.relics) {
    const relic = offer.relic;
    const owned = run.relicIds.includes(relic.id);
    const button = createShopRelicAction(run, offer, owned, () => {
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
    relicList.append(button);
  }

  const relicSection = document.createElement("section");
  relicSection.className = "shop-section shop-section--relics";
  relicSection.dataset.testid = "shop-section-relics";
  relicSection.innerHTML = `<h3 class="shop-section-title">法宝匣</h3>`;
  relicSection.append(relicList);

  const serviceList = document.createElement("div");
  serviceList.className = "shop-list shop-list--services";
  const removable = getShopRemovalCandidate(run);
  const removeButton = createShopRemoveAction(run, removable, SHOP_REMOVE_PRICE, () => {
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
  });
  serviceList.append(removeButton);

  const serviceSection = document.createElement("section");
  serviceSection.className = "shop-section shop-section--services";
  serviceSection.dataset.testid = "shop-section-services";
  serviceSection.innerHTML = `<h3 class="shop-section-title">修整事</h3>`;
  serviceSection.append(serviceList);

  const leave = createAction("离开茶亭", "继续行旅", () => {
    state.message = "茶香在身后淡去。";
    state.screen = "map";
    render();
  });
  leave.dataset.testid = "shop-leave";
  leave.classList.add("shop-leave-action");
  const footer = document.createElement("div");
  footer.className = "shop-footer";
  footer.dataset.testid = "shop-footer";
  footer.append(leave);
  scene.append(cardSection, relicSection, serviceSection, footer);
  panel.append(scene);
  mountChapterPanel(host, panel, run);
}

function createShopCardAction(run: RunState, offer: ReturnType<typeof createShopDraft>["cards"][number], onClick: () => void): HTMLButtonElement {
  const { card, label, note, price, slotId } = offer;
  const button = document.createElement("button");
  const affordable = run.gold >= price;
  const type = card.types[0] ?? "skill";
  const fit = createRewardBuildFit(getRunCardDefinitions(run), card);
  button.type = "button";
  button.className = `choice-action shop-item shop-item--card card-type-${type}`;
  button.dataset.testid = `shop-card-${slotId}`;
  button.dataset.shopCardId = card.id;
  button.dataset.shopSlot = slotId;
  button.dataset.affordable = `${affordable}`;
  button.dataset.shopAffordable = `${affordable}`;
  button.dataset.buildFitTone = fit.tone;
  button.innerHTML = `
    <span class="shop-meta-row">
      <span>${escapeHtml(label)}</span>
      <i class="shop-slot-note">${escapeHtml(note)}</i>
    </span>
    ${createCardArtMarkup(card)}
    ${createCardChromeMarkup(card)}
    <span class="card-cost" data-testid="card-cost" aria-label="消耗 ${getDisplayCost(card)}">${getDisplayCost(card)}</span>
    <strong>${escapeHtml(card.name)}</strong>
    <small class="card-type-line">${escapeHtml(formatTypes(card.types))}</small>
    ${createCardKeywordRowMarkup(card)}
    <span class="description card-description">${escapeHtml(card.description ?? "")}</span>
    <span class="shop-build-fit shop-build-fit--${fit.tone}" data-testid="shop-build-fit">${escapeHtml(fit.label)}</span>
    <span class="shop-build-fit-detail" data-testid="shop-build-fit-detail">${escapeHtml(fit.detail)}</span>
    <span class="shop-price-chip" data-testid="shop-price-chip">${price}铜钱</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function createShopRelicAction(
  run: RunState,
  offer: ReturnType<typeof createShopDraft>["relics"][number],
  owned: boolean,
  onClick: () => void
): HTMLButtonElement {
  const { relic, label, note, slotId } = offer;
  const button = document.createElement("button");
  const affordable = run.gold >= relic.price;
  const stateLabel = owned ? "已持有" : affordable ? "可购" : "铜钱不足";
  const fit = createRelicBuildFit(getRunCardDefinitions(run), run.characterId, relic);
  button.type = "button";
  button.className = "choice-action shop-item shop-item--relic";
  button.dataset.testid = `shop-relic-${slotId}`;
  button.dataset.shopRelicId = relic.id;
  button.dataset.shopSlot = slotId;
  button.dataset.owned = `${owned}`;
  button.dataset.shopOwned = `${owned}`;
  button.dataset.affordable = `${affordable}`;
  button.dataset.shopAffordable = `${affordable}`;
  button.dataset.buildFitTone = fit.tone;
  button.disabled = owned;
  button.innerHTML = `
    <span class="shop-meta-row">
      <span>${escapeHtml(label)}</span>
      <i class="shop-slot-note">${escapeHtml(note)}</i>
    </span>
    <span class="shop-meta-row">
      <span>${escapeHtml(describeRelicSource(relic.id))}</span>
      <span>${escapeHtml(stateLabel)}</span>
    </span>
    <strong>${escapeHtml(relic.name)}</strong>
    <small class="relic-trigger-text">${escapeHtml(relic.triggerText ?? "常驻生效。")}</small>
    <span class="description">${escapeHtml(relic.description)}</span>
    <span class="shop-relic-fit shop-relic-fit--${fit.tone}" data-testid="shop-relic-fit">${escapeHtml(fit.label)}</span>
    <span class="shop-relic-fit-detail" data-testid="shop-relic-fit-detail">${escapeHtml(fit.detail)}</span>
    <span class="shop-price-chip" data-testid="shop-price-chip">${relic.price}铜钱</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function createShopRemoveAction(
  run: RunState,
  removable: RunState["deck"][number] | undefined,
  price: number,
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  const affordable = run.gold >= price;
  const targetName = removable ? cardsById[removable.cardId].name : "牌组过薄";
  button.type = "button";
  button.className = "choice-action shop-item shop-item--service";
  button.dataset.testid = "shop-remove-card";
  button.dataset.affordable = `${affordable}`;
  button.dataset.shopAffordable = `${affordable}`;
  button.disabled = !removable;
  button.innerHTML = `
    <strong>洗去旧招</strong>
    <span class="shop-service-target">${removable ? `删去${escapeHtml(targetName)}` : escapeHtml("牌组过薄，暂不可删牌。")}</span>
    <span class="description">${removable ? escapeHtml("从牌组中移除这张旧招。") : escapeHtml("至少保留基础行旅所需的招式。")}</span>
    <span class="shop-price-chip" data-testid="shop-price-chip">${price}铜钱</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function renderRest(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const panel = createPanel("screen-rest", "废寺静修");
  panel.classList.add("rest-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));

  const heal = createAction("调息疗伤", "回复最大生命30%", () => {
    const healed = healRun(run, Math.ceil(run.maxHp * 0.3));
    state.message = `回复${healed}点生命。`;
    state.screen = "map";
    render();
  });
  heal.dataset.testid = "rest-heal";
  heal.classList.add("choice-action--rest", "choice-action--rest-heal");

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
  upgrade.classList.add("choice-action--rest", "choice-action--rest-upgrade");
  upgrade.disabled = !candidate;

  const scene = document.createElement("div");
  scene.className = "scene-surface rest-scene";
  scene.dataset.testid = "rest-scene";
  const hero = document.createElement("section");
  hero.className = "rest-hero";
  hero.dataset.testid = "rest-hero";
  hero.innerHTML = `
    <span class="rest-seal">息</span>
    <h3>废寺夜火</h3>
    <p>半檐旧雨未干，炉中药香压住黑墨寒气。</p>
  `;
  const actions = document.createElement("div");
  actions.className = "rest-actions";
  actions.dataset.testid = "rest-actions";
  actions.append(heal, upgrade);
  scene.append(hero, actions);
  panel.append(scene);
  mountChapterPanel(host, panel, run);
}

function renderChapterReward(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const panel = createPanel("screen-chapter-reward", "章末悟境");
  panel.classList.add("chapter-reward-screen", "reward-screen", "transition-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));
  panel.append(
    createChapterTransitionHero(run, "chapterReward"),
    createMessage(`${chapter.name}的残页落定，选择一项带入下一段江湖的成长。`),
    createTransitionSpoilsDossier(state.pendingSpoils, "chapter")
  );

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
  advanced.className = "advanced-reward-list transition-choice-section";
  advanced.dataset.testid = "advanced-reward-dossier";
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

  const chapterChoices = document.createElement("section");
  chapterChoices.className = "transition-choice-section chapter-reward-dossier";
  chapterChoices.dataset.testid = "chapter-reward-dossier";
  chapterChoices.innerHTML = `
    <small>章末抄录</small>
    <h3>${escapeHtml(chapter.name)}留下的成长</h3>
  `;
  chapterChoices.append(choices);

  panel.append(chapterChoices, advanced);
  mountChapterPanel(host, panel, run);
}

function renderBossReward(host: HTMLElement, state: ControllerState, render: () => void, storage: GameStorage | undefined): void {
  const run = requireRun(state);
  const chapter = getCurrentChapter(run);
  const nextChapter = getNextChapter(run);
  const panel = createPanel("screen-boss-reward", "首领战利");
  panel.classList.add("boss-reward-screen", "reward-screen", "transition-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), () => openCompendium(state, render), getDebugSkipChapterHandler(state, render)));
  panel.append(
    createChapterTransitionHero(run, "bossReward"),
    createMessage(nextChapter ? `${chapter.name}已经写完，下一页通向${nextChapter.name}。` : `${chapter.name}的墨色暂时退去。`),
    createTransitionSpoilsDossier(state.pendingSpoils, "boss")
  );

  const continueButton = createAction(nextChapter ? "前往下一章" : "收束本章", nextChapter ? `带着章末成长进入${nextChapter.name}。` : "带着战利离开此地。", () => {
    state.pendingSpoils = undefined;
    if (advanceToNextChapter(run)) {
      state.screen = "map";
      state.message = `雨声渐近，${nextChapter?.name ?? "下一章"}展开。`;
    } else {
      const completion = createRunCompletionSnapshot(run);
      if (completion) {
        state.screen = "finalChoice";
        state.message = "无名史官的笔落入黑水，最后一页等你定稿。";
      } else {
        state.screen = "victory";
        state.message = `${chapter.name}暂告一段落，新的江湖仍在远处。`;
      }
    }
    render();
  });
  continueButton.classList.add("transition-primary-action");
  continueButton.dataset.testid = "boss-reward-continue";
  panel.append(continueButton);
  mountChapterPanel(host, panel, run);
}

function renderFinalChoice(host: HTMLElement, state: ControllerState, render: () => void, storage: GameStorage | undefined): void {
  const run = requireRun(state);
  const panel = createPanel("screen-final-choice", "终局选择");
  panel.classList.add("final-choice-screen", "result-screen", "transition-screen");
  panel.append(createRunStatus(run, state.message, () => openDeck(state, render), () => openLogbook(state, render), undefined, getDebugSkipChapterHandler(state, render)));
  panel.append(
    createFinalChoiceRitual(run),
    createMessage("墨书摊开，黑水照见你的心境与墨痕。可见的道路并不都能抵达；不可见的路，只有真正放下时才会显形。")
  );

  const list = document.createElement("div");
  list.className = "final-choice-list";
  const choices = getAvailableFinalChoices(run);
  panel.dataset.finalChoiceCount = `${choices.length}`;
  for (const choice of choices) {
    const button = createAction(choice.title, `${choice.summary} ${choice.eligible ? "" : `未满足：${choice.requirement}`}`, () => {
      const selection = selectFinalChoice(run, choice.id);
      if (!selection) {
        state.message = `此刻尚不能选择${choice.title}。`;
        render();
        return;
      }

      completeRunWithEnding(state, storage, selection);
      render();
    });
    button.classList.add("final-choice-option");
    button.classList.add(choice.eligible ? "is-eligible" : "is-locked");
    button.dataset.testid = "final-choice-option";
    button.dataset.choiceId = choice.id;
    button.dataset.choiceEligible = `${choice.eligible}`;
    button.dataset.choiceRequirement = choice.requirement;
    button.disabled = !choice.eligible;
    button.insertAdjacentHTML(
      "beforeend",
      `<span class="final-choice-state" data-testid="final-choice-option-state">${choice.eligible ? "可定稿" : "墨色未足"}</span>`
    );
    list.append(button);
  }

  panel.append(list);
  mountChapterPanel(host, panel, run);
}

function createChapterTransitionHero(run: RunState, kind: "chapterReward" | "bossReward"): HTMLElement {
  const chapter = getCurrentChapter(run);
  const nextChapter = getNextChapter(run);
  const isChapterReward = kind === "chapterReward";
  const hero = document.createElement("section");
  hero.className = `transition-hero transition-hero--${isChapterReward ? "chapter" : "boss"}`;
  hero.dataset.testid = isChapterReward ? "chapter-transition-hero" : "boss-transition-hero";
  hero.innerHTML = `
    <small>${isChapterReward ? "章末幕" : nextChapter ? "行旅过场" : "终局幕前"}</small>
    <h3 data-testid="${isChapterReward ? "chapter-transition-title" : "boss-transition-title"}">${escapeHtml(
      isChapterReward
        ? `${chapter.name} · 残页落定`
        : nextChapter
          ? `${chapter.name} → ${nextChapter.name}`
          : `${chapter.name} · 终页将启`
    )}</h3>
    <p>${escapeHtml(isChapterReward ? chapter.bossVictoryCopy : nextChapter ? `${chapter.subtitle} 下一卷将把你带向${nextChapter.subtitle}` : "黑水照见所有来路，最后的落笔已经近了。")}</p>
  `;
  hero.append(
    createTransitionMeta([
      { label: "当前章", value: chapter.mapTitle, testId: "transition-current-chapter" },
      { label: nextChapter ? "下一章" : "下一幕", value: nextChapter?.mapTitle ?? "终局选择", testId: "transition-next-chapter" },
      { label: "已过章节", value: `${run.completedChapterIds.length}` },
      { label: "心境", value: formatRunMindTendencies(run) }
    ]),
    createChapterProgress(run)
  );
  return hero;
}

function createFinalChoiceRitual(run: RunState): HTMLElement {
  const chapter = getCurrentChapter(run);
  const character = charactersById[run.characterId];
  const choices = getAvailableFinalChoices(run);
  const eligibleCount = choices.filter((choice) => choice.eligible).length;
  const ritual = document.createElement("section");
  ritual.className = "final-choice-ritual transition-hero transition-hero--final";
  ritual.dataset.testid = "final-choice-ritual";
  ritual.innerHTML = `
    <small>墨书终页</small>
    <h3>谁来定稿这场黑雨</h3>
    <p>${escapeHtml(chapter.bossVictoryCopy)} ${escapeHtml(character.name)}站在墨渊之前，选择不再只是奖励，而是把这一局写成何种结局。</p>
  `;
  ritual.append(
    createTransitionMeta([
      { label: "执笔者", value: character.name, testId: "final-choice-character" },
      { label: "终局候选", value: `${eligibleCount}/${choices.length}`, testId: "final-choice-eligible-count" },
      { label: "墨录残页", value: `${getUnlockedLogbookEntries(run).length}` },
      { label: "心境", value: formatRunMindTendencies(run) }
    ]),
    createChapterProgress(run)
  );
  return ritual;
}

function createRunSummaryDossier(summary: CompletedRunSummaryView): HTMLElement {
  const character = charactersById[summary.completion.characterId];
  const dossier = document.createElement("section");
  dossier.className = "run-summary-dossier transition-hero transition-hero--summary";
  dossier.dataset.testid = "run-summary-dossier";
  dossier.innerHTML = `
    <small>终局战报</small>
    <h3>${escapeHtml(summary.ending.title)}</h3>
    <p>${escapeHtml(character.name)}的行旅已经归卷：江湖结局写作“${summary.ending.title}”，角色后日谈落为“${summary.characterEpilogue.title}”。</p>
  `;
  dossier.append(createTransitionMeta([
    { label: "角色", value: character.name },
    { label: "章节", value: `${summary.completion.completedChapterIds.length}` },
    { label: "生命", value: `${summary.completion.hp}/${summary.completion.maxHp}` },
    { label: "铜钱", value: `${summary.completion.gold}` },
    { label: "牌组", value: `${summary.completion.deckSize}` },
    { label: "法宝", value: `${summary.completion.relicCount}` },
    { label: "新目标", value: `${summary.newlyCompletedGoalIds?.length ?? 0}` }
  ]));
  return dossier;
}

function createResultDossier(screen: "victory" | "defeat", run: RunState | undefined): HTMLElement {
  const isVictory = screen === "victory";
  const character = run ? charactersById[run.characterId] : undefined;
  const chapter = run ? getCurrentChapter(run) : undefined;
  const dossier = document.createElement("section");
  dossier.className = `result-dossier transition-hero transition-hero--${isVictory ? "victory" : "defeat"}`;
  dossier.dataset.testid = "result-dossier";
  dossier.innerHTML = `
    <small>${isVictory ? "胜局收束" : "梦醒卷宗"}</small>
    <h3 data-testid="result-outcome">${isVictory ? "本章告捷" : "黑雨止步"}</h3>
    <p>${escapeHtml(isVictory ? "此段江湖暂时收束，新的雨声仍在远处。" : "这一夜没能走到天明，但卷宗仍记下你抵达过哪里、带着什么醒来。")}</p>
  `;

  if (!run || !character || !chapter) {
    dossier.append(createTransitionMeta([{ label: "记录", value: "未留下完整行旅" }]));
    return dossier;
  }

  dossier.append(createTransitionMeta([
    { label: "角色", value: character.name, testId: "result-character" },
    { label: "所在章", value: chapter.name, testId: "result-chapter" },
    { label: "已过章节", value: `${run.completedChapterIds.length}` },
    { label: "生命", value: `${Math.max(0, run.hp)}/${run.maxHp}` },
    { label: "牌组", value: `${run.deck.length}` },
    { label: "法宝", value: `${run.relicIds.length}` },
    { label: "心境", value: formatRunMindTendencies(run) }
  ]));
  return dossier;
}

function createTransitionMeta(items: Array<{ label: string; value: string; testId?: string }>): HTMLElement {
  const meta = document.createElement("div");
  meta.className = "transition-meta";
  meta.dataset.testid = "transition-meta";
  for (const item of items) {
    const chip = document.createElement("span");
    if (item.testId) {
      chip.dataset.testid = item.testId;
    }
    chip.innerHTML = `<small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.value)}</strong>`;
    meta.append(chip);
  }
  return meta;
}

function createChapterProgress(run: RunState): HTMLElement {
  const currentChapter = getCurrentChapter(run);
  const nextChapter = getNextChapter(run);
  const progress = document.createElement("div");
  progress.className = "chapter-transition-progress";
  progress.dataset.testid = "chapter-transition-progress";

  for (const chapter of chapterList) {
    const state = getChapterProgressState(run, chapter.id, currentChapter.id, nextChapter?.id);
    const item = document.createElement("span");
    item.className = `chapter-progress-item chapter-progress-item--${state}`;
    item.dataset.chapterId = chapter.id;
    item.dataset.chapterState = state;
    item.innerHTML = `
      <small>${chapter.order}</small>
      <strong>${escapeHtml(chapter.name)}</strong>
      <em>${formatChapterProgressState(state)}</em>
    `;
    progress.append(item);
  }

  return progress;
}

function getChapterProgressState(
  run: RunState,
  chapterId: RunState["chapterId"],
  currentChapterId: RunState["chapterId"],
  nextChapterId: RunState["chapterId"] | undefined
): "complete" | "current" | "next" | "final" | "locked" {
  if (chapterId === currentChapterId && !nextChapterId && run.completedChapterIds.includes(chapterId)) {
    return "final";
  }

  if (chapterId === currentChapterId) {
    return "current";
  }

  if (run.completedChapterIds.includes(chapterId)) {
    return "complete";
  }

  if (chapterId === nextChapterId) {
    return "next";
  }

  return "locked";
}

function formatChapterProgressState(state: "complete" | "current" | "next" | "final" | "locked"): string {
  switch (state) {
    case "complete":
      return "已定";
    case "current":
      return "此章";
    case "next":
      return "将至";
    case "final":
      return "终页";
    case "locked":
      return "未至";
  }
}

function createTransitionSpoilsDossier(spoils: BattleSpoils | undefined, kind: "chapter" | "boss"): HTMLElement {
  const dossier = document.createElement("section");
  dossier.className = `transition-spoils transition-spoils--${kind}`;
  dossier.dataset.testid = `${kind}-spoils-dossier`;
  dossier.innerHTML = `
    <small>${kind === "chapter" ? "战后入册" : "首领战利"}</small>
    <h3>${kind === "chapter" ? "余墨、铜钱与法宝已经归档" : "收拢战利，准备换幕"}</h3>
  `;
  dossier.append(createSpoilsSummary(spoils));
  return dossier;
}

function renderLogbook(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = requireRun(state);
  const entries = getUnlockedLogbookEntries(run);
  const panel = createPanel("screen-logbook", "墨录");
  panel.classList.add("logbook-screen");
  panel.append(createRunStatus(run, "已录下的江湖残页。", () => openDeck(state, render), undefined, undefined, getDebugSkipChapterHandler(state, render)));

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

  const back = createAction("返回上一步", "收起墨录，继续行旅。", () => {
    state.screen = state.logbookReturnScreen ?? "map";
    state.logbookReturnScreen = undefined;
    render();
  });
  back.dataset.testid = "logbook-back";
  panel.append(list, back);
  mountChapterPanel(host, panel, run);
}

function renderResult(host: HTMLElement, state: ControllerState, render: () => void): void {
  const run = state.run;
  const resultScreen = state.screen === "victory" ? "victory" : "defeat";
  const panel = createPanel(resultScreen === "victory" ? "screen-victory" : "screen-defeat", resultScreen === "victory" ? "本章告捷" : "梦醒听雨亭");
  panel.classList.add("result-screen", "transition-screen", `result-screen--${resultScreen}`);
  panel.append(createResultDossier(resultScreen, run), createMessage(state.message));

  const restart = document.createElement("button");
  restart.type = "button";
  restart.className = "choice-action result-primary-action";
  restart.dataset.testid = "result-restart";
  restart.innerHTML = "<strong>再入江湖</strong><span>从新的渡口重新开局。</span>";
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

function renderRunSummary(host: HTMLElement, state: ControllerState, render: () => void): void {
  const summary = state.completedRunSummary;
  const panel = createPanel("screen-run-summary", "行旅结算");
  panel.classList.add("run-summary-screen", "result-screen", "transition-screen");

  if (!summary) {
    panel.append(createMessage("尚无可结算的行旅。"));
    host.append(panel);
    return;
  }

  const character = charactersById[summary.completion.characterId];
  const ending = document.createElement("section");
  ending.className = "ending-summary";
  ending.dataset.testid = "ending-summary";
  ending.innerHTML = `
    <small data-testid="ending-id">${summary.ending.id}</small>
    <h3 data-testid="ending-title">${summary.ending.title}</h3>
    <p>${summary.ending.summary}</p>
    <p>${summary.ending.body}</p>
  `;

  const epilogue = document.createElement("section");
  epilogue.className = "character-epilogue-summary";
  epilogue.dataset.testid = "character-epilogue-summary";
  epilogue.innerHTML = `
    <small data-testid="character-epilogue-id">${summary.characterEpilogue.id}</small>
    <h3 data-testid="character-epilogue-title">${summary.characterEpilogue.title}</h3>
    <p>${summary.characterEpilogue.summary}</p>
    <p>${summary.characterEpilogue.body}</p>
  `;

  const stats = document.createElement("div");
  stats.className = "run-summary-stats";
  stats.append(
    createRunSummaryStat("角色", character.name, "run-summary-character"),
    createRunSummaryStat("已过章节", `${summary.completion.completedChapterIds.length}`, "run-summary-chapters"),
    createRunSummaryStat("墨录残页", `${summary.completion.unlockedFragmentIds.length}`),
    createRunSummaryStat("牌组", `${summary.completion.deckSize}`),
    createRunSummaryStat("法宝", `${summary.completion.relicCount}`),
    createRunSummaryStat("总行旅", `${summary.profile.stats.totalRuns}`, "profile-total-runs"),
    createRunSummaryStat("已解锁结局", formatUnlockedEndingTitles(summary.profile), "profile-unlocked-endings"),
    createRunSummaryStat("角色结局", formatUnlockedCharacterEpilogueTitles(summary.profile), "profile-unlocked-epilogues")
  );

  const goals = createProfileGoalsList(summary.profile, summary.newlyCompletedGoalIds);
  const buildRecap = createRunBuildRecapPanel(summary.buildRecap);
  const ledger = createProfileRunLedger(summary.profile);
  const summaryScroll = document.createElement("div");
  summaryScroll.className = "run-summary-scroll";
  summaryScroll.dataset.testid = "run-summary-scroll";
  summaryScroll.append(ending, epilogue, stats, buildRecap, goals, ledger);

  const restart = createAction("再入江湖", "以同一角色重新开局。", () => {
    state.run = createRun(summary.completion.characterId);
    state.combat = undefined;
    state.pendingSpoils = undefined;
    state.rewardCards = [];
    state.completedRunSummary = undefined;
    state.deckOpen = false;
    state.message = "黑雨仍未停。";
    state.screen = "map";
    render();
  });
  restart.classList.add("result-primary-action");
  restart.dataset.testid = "run-summary-restart";

  panel.append(createRunSummaryDossier(summary), createMessage(state.message), summaryScroll, restart);
  host.append(panel);
}

function completeRunWithEnding(state: ControllerState, storage: GameStorage | undefined, selection?: FinalChoiceSelection): boolean {
  const run = requireRun(state);
  const finalSelection = selection ?? createAutomaticFinalChoiceSelection(run);
  if (!finalSelection) {
    return false;
  }

  recordRunFinalChoice(run, {
    finalChoiceId: finalSelection.choice.id,
    worldEndingId: finalSelection.ending.id,
    characterEpilogueId: finalSelection.characterEpilogue.id
  });

  const completion = createRunCompletionSnapshot(run);
  if (!completion) {
    return false;
  }

  state.profile = recordCompletedRun(state.profile, {
    characterId: completion.characterId,
    victory: true,
    endingId: finalSelection.ending.id,
    characterEpilogueId: finalSelection.characterEpilogue.id,
    chaptersCompleted: completion.completedChapterIds,
    unlockedFragments: completion.unlockedFragmentIds,
    challengeId: run.challengeId
  });
  const goalResult = recordCompletedGoals(state.profile);
  state.profile = recordProfileRunRecord(goalResult.profile, {
    characterId: completion.characterId,
    victory: true,
    challengeId: run.challengeId,
    endingId: finalSelection.ending.id,
    characterEpilogueId: finalSelection.characterEpilogue.id,
    chaptersCompleted: completion.completedChapterIds,
    unlockedFragments: completion.unlockedFragmentIds,
    newlyCompletedGoalIds: goalResult.newlyCompletedGoalIds
  });
  saveProfile(storage, state.profile);
  clearSavedGame(storage);
  const buildRecap = createDeckBuildRecap({
    cards: getRunCardDefinitions(run),
    methodNames: getRunMethods(run).map((method) => method.name),
    relicNames: run.relicIds.map((id) => relicsById[id]?.name ?? id),
    challengeName: resolveChallengeProfile(run.challengeId).name
  });
  state.completedRunSummary = {
    completion,
    ending: finalSelection.ending,
    characterEpilogue: finalSelection.characterEpilogue,
    buildRecap,
    profile: state.profile,
    newlyCompletedGoalIds: goalResult.newlyCompletedGoalIds
  };
  state.screen = "runSummary";
  state.message = `${charactersById[completion.characterId].name}抵达${finalSelection.ending.title}与${finalSelection.characterEpilogue.title}。`;
  return true;
}

function createAutomaticFinalChoiceSelection(run: RunState): FinalChoiceSelection | undefined {
  const finalState = createRunCompletionSnapshot(run)?.finalState;
  if (!finalState) {
    return undefined;
  }

  const ending = evaluateRunEnding(finalState, run);
  if (!ending) {
    return undefined;
  }

  const choice = getFinalChoiceForEnding(ending.id);
  const characterEpilogue = selectCharacterEpilogue(run, ending.id);
  if (!choice || !characterEpilogue) {
    return undefined;
  }

  return {
    choice,
    ending,
    characterEpilogue
  };
}

function recordDefeatIfNeeded(state: ControllerState, storage: GameStorage | undefined): void {
  const run = requireRun(state);
  state.profile = recordRunResult(state.profile, {
    characterId: run.characterId,
    victory: false,
    chaptersCompleted: run.completedChapterIds,
    challengeId: run.challengeId
  });
  state.profile = recordProfileRunRecord(state.profile, {
    characterId: run.characterId,
    victory: false,
    challengeId: run.challengeId,
    chaptersCompleted: run.completedChapterIds
  });
  saveProfile(storage, state.profile);
  clearSavedGame(storage);
}

function createCompletedDebugRun(challengeId?: ChallengeProfileId): RunState {
  const run = createRun("zhaoyun", { mapSeed: 52, challengeId });
  run.mindTendencies = { ning: 5, nu: 0, bei: 0, mei: 0, luan: 0, wu: 8 };
  recordLogbookEvent(run, "event_heart_mirror");
  recordLogbookBoss(run, "boss_nameless_historian");

  while (advanceToNextChapter(run)) {
    // Advance through the deterministic chapter spine to the final state.
  }

  return run;
}

function formatUnlockedEndingTitles(profile: PlayerProfile): string {
  const titles = profile.unlockedEndings.map((endingId) => endingsById[endingId as keyof typeof endingsById]?.title ?? endingId);
  return titles.length > 0 ? titles.join("、") : "未解锁";
}

function formatUnlockedCharacterEpilogueTitles(profile: PlayerProfile): string {
  const titles = (profile.unlockedCharacterEpilogues ?? []).map((epilogueId) => characterEpiloguesById[epilogueId as keyof typeof characterEpiloguesById]?.title ?? epilogueId);
  return titles.length > 0 ? titles.join("、") : "未解锁";
}

function createProfileGoalsList(profile: PlayerProfile, highlightIds: readonly string[] = []): HTMLElement {
  const list = document.createElement("div");
  list.className = "profile-goals-list";
  list.dataset.testid = "profile-goals-list";

  const highlights = new Set(highlightIds);
  for (const record of evaluateProfileGoals(profile)) {
    const item = document.createElement("article");
    item.className = record.completed ? "profile-goal-item is-complete" : "profile-goal-item";
    item.dataset.testid = "profile-goal-item";
    item.dataset.profileGoalId = record.goal.id;
    if (highlights.has(record.goal.id)) {
      item.classList.add("is-new");
    }

    const title = document.createElement("strong");
    title.textContent = record.goal.title;
    const summary = document.createElement("span");
    summary.textContent = record.goal.summary;
    const progress = document.createElement("small");
    progress.textContent = `${Math.min(record.progress.current, record.progress.target)} / ${record.progress.target}`;

    item.append(title, summary, progress);
    list.append(item);
  }

  return list;
}

function createProfileRunLedger(profile: PlayerProfile): HTMLElement {
  const ledger = evaluateRunLedger(profile);
  const section = document.createElement("section");
  section.className = "profile-run-ledger";
  section.dataset.testid = "profile-run-ledger";

  const bestRun = document.createElement("div");
  bestRun.className = "profile-best-run";
  bestRun.dataset.testid = "profile-best-run";
  const bestLabel = document.createElement("span");
  const bestValue = document.createElement("strong");
  if (ledger.bestRun) {
    bestLabel.textContent = "最佳行旅";
    bestValue.textContent = formatProfileRunRecordLine(ledger.bestRun);
  } else {
    bestLabel.textContent = "";
    bestValue.textContent = "最佳行旅 尚未记录";
  }
  bestRun.append(bestLabel, bestValue);
  section.append(bestRun);

  const list = document.createElement("div");
  list.className = "profile-run-records";
  for (const record of ledger.recentRecords.slice(0, 6)) {
    list.append(createProfileRunRecordItem(record));
  }

  if (ledger.recentRecords.length === 0) {
    const empty = document.createElement("p");
    empty.className = "profile-run-record-empty";
    empty.textContent = "暂无行旅履历。";
    list.append(empty);
  }

  section.append(list);
  return section;
}

function createRunBuildRecapPanel(recap: DeckBuildRecap): HTMLElement {
  const section = document.createElement("section");
  section.className = "run-build-recap";
  section.dataset.testid = "run-build-recap";

  const primary = document.createElement("div");
  primary.className = "run-build-primary";
  primary.dataset.testid = "run-build-primary";

  const label = document.createElement("span");
  label.textContent = "本局流派";
  const title = document.createElement("strong");
  title.textContent = recap.primaryLabel;
  const summary = document.createElement("small");
  summary.textContent = recap.summary;
  primary.append(label, title, summary);

  const signatures = document.createElement("div");
  signatures.className = "run-build-signatures";
  const signatureNames = recap.signatureCards.length > 0 ? recap.signatureCards : ["尚无代表招式"];
  for (const name of signatureNames) {
    const chip = document.createElement("span");
    chip.dataset.testid = "run-build-signature-card";
    chip.textContent = name;
    signatures.append(chip);
  }

  const details = document.createElement("div");
  details.className = "run-build-details";
  for (const line of [...recap.typeBreakdown, ...recap.tacticalNotes, ...recap.supportSignals]) {
    const item = document.createElement("span");
    item.textContent = line;
    details.append(item);
  }

  section.append(primary, signatures, details);
  return section;
}

function createDeckBuildCompassPanel(recap: DeckBuildRecap, methodSummary: string): HTMLElement {
  const section = document.createElement("section");
  section.className = "deck-build-compass";
  section.dataset.testid = "deck-build-compass";

  const primary = document.createElement("div");
  primary.className = "deck-build-primary";
  primary.dataset.testid = "deck-build-primary";
  const label = document.createElement("span");
  label.textContent = "当前流派";
  const title = document.createElement("strong");
  title.textContent = recap.primaryLabel;
  const summary = document.createElement("small");
  summary.textContent = recap.summary;
  primary.append(label, title, summary);

  const signatures = document.createElement("div");
  signatures.className = "deck-build-signatures";
  const signatureNames = recap.signatureCards.length > 0 ? recap.signatureCards : ["尚无代表招式"];
  for (const name of signatureNames) {
    const chip = document.createElement("span");
    chip.dataset.testid = "deck-build-signature-card";
    chip.textContent = name;
    signatures.append(chip);
  }

  const details = document.createElement("div");
  details.className = "deck-build-details";
  const supportSignals = recap.supportSignals.some((signal) => signal.startsWith("心法 ")) ? recap.supportSignals : [`心法 ${methodSummary}`, ...recap.supportSignals];
  for (const line of [...recap.typeBreakdown, ...recap.tacticalNotes, ...supportSignals]) {
    const item = document.createElement("span");
    if (line.startsWith("心法 ")) {
      item.dataset.testid = "deck-method-summary";
    }
    item.textContent = line;
    details.append(item);
  }

  section.append(primary, signatures, details);
  return section;
}

function createProfileRunRecordItem(record: ProfileRunRecord): HTMLElement {
  const item = document.createElement("article");
  item.className = record.victory ? "profile-run-record is-victory" : "profile-run-record";
  item.dataset.testid = "profile-run-record";

  const title = document.createElement("strong");
  title.textContent = formatProfileRunRecordLine(record);

  const meta = document.createElement("span");
  meta.textContent = formatProfileRunRecordMeta(record);

  item.append(title, meta);
  return item;
}

function formatProfileRunRecordLine(record: ProfileRunRecord): string {
  const characterName = charactersById[record.characterId]?.name ?? record.characterId;
  const result = record.victory ? "胜利" : "梦醒";
  const chapters = `${record.chaptersCompleted.length}章`;
  const challenge = resolveChallengeProfile(record.challengeId).name;
  const ending = record.endingId ? endingsById[record.endingId as keyof typeof endingsById]?.title ?? record.endingId : undefined;
  return [characterName, result, chapters, challenge, ending].filter(Boolean).join(" · ");
}

function formatProfileRunRecordMeta(record: ProfileRunRecord): string {
  const details: string[] = [];
  if (record.endingId) {
    const ending = endingsById[record.endingId as keyof typeof endingsById];
    if (ending) {
      details.push(`结局 ${ending.summary}`);
    }
  }

  if (record.newlyCompletedGoalIds.length > 0) {
    details.push(`新目标 ${record.newlyCompletedGoalIds.length}`);
  }

  if (record.unlockedFragments.length > 0) {
    details.push(`残页 ${record.unlockedFragments.length}`);
  }

  return details.length > 0 ? details.join(" · ") : "未触发新解锁";
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

function createRunStatus(
  run: RunState,
  message: string,
  onDeckClick?: () => void,
  onLogbookClick?: () => void,
  onCompendiumClick?: () => void,
  onDebugSkipChapterClick?: () => void
): HTMLElement {
  const status = document.createElement("div");
  status.className = "run-status";
  const relicNames = run.relicIds.map((id) => relicsById[id]?.name ?? id).join("、");
  const methodNames = getRunMethods(run).map((method) => `${method.name}${(run.methodLevels?.[method.id] ?? 1) > 1 ? "·进境" : ""}`).join("、") || "未定";
  const logbookCount = getUnlockedLogbookEntries(run).length;
  const archetypeAnalysis = analyzeDeckArchetypes(getRunCardDefinitions(run));
  const chapter = getCurrentChapter(run);
  const challenge = resolveChallengeProfile(run.challengeId);
  status.innerHTML = `
    <span data-testid="run-chapter">章节 ${chapter.name}</span>
    <span data-testid="run-challenge">试炼 ${challenge.name}</span>
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

  if (onCompendiumClick) {
    const compendiumButton = document.createElement("button");
    compendiumButton.type = "button";
    compendiumButton.className = "deck-open-button compendium-open-button";
    compendiumButton.dataset.testid = "compendium-open";
    compendiumButton.textContent = "墨录图鉴";
    compendiumButton.addEventListener("click", onCompendiumClick);
    status.append(compendiumButton);
  }

  if (onDebugSkipChapterClick) {
    const nextChapter = getNextChapter(run);
    const debugSkipButton = document.createElement("button");
    debugSkipButton.type = "button";
    debugSkipButton.className = "deck-open-button debug-skip-chapter-button";
    debugSkipButton.dataset.testid = "debug-skip-chapter";
    debugSkipButton.textContent = "调试跳章";
    debugSkipButton.title = nextChapter ? `跳过当前章，进入${nextChapter.name}` : "已经没有下一章";
    debugSkipButton.disabled = !nextChapter;
    debugSkipButton.addEventListener("click", onDebugSkipChapterClick);
    status.append(debugSkipButton);
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

function createCombatResourcePill(owner: "player" | "enemy", label: string, value: string): string {
  return `
    <div class="resource-pill resource-pill--${owner}" data-testid="${owner}-resource" aria-label="${escapeAttribute(`${label} ${value}`)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function createCombatStatusLine(
  owner: "player" | "enemy",
  chips: Array<{ label: string; value: string; tone: "block" | "mind" | "ink" }>,
  statuses: Partial<Record<StatusId, number>>
): string {
  return `
    <div class="status-line status-line--${owner}" data-testid="${owner}-status">
      ${chips.map((chip) => createStatusChipMarkup(chip.label, chip.value, chip.tone)).join("")}
      ${formatStatusBadges(statuses)}
    </div>
  `;
}

function createStatusChipMarkup(label: string, value: string, tone: "block" | "mind" | "ink"): string {
  return `
    <span class="status-chip status-chip--${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </span>
  `;
}

function getIntentPresentation(intent: CombatState["enemies"][number]["currentIntent"]): { type: string; pressure: string; icon: string } {
  if (intent.type === "attack") {
    const totalDamage = intent.damage * intent.hits;
    return {
      type: "attack",
      pressure: totalDamage >= 14 ? "high" : totalDamage >= 8 ? "medium" : "low",
      icon: "杀"
    };
  }

  if (intent.type === "block") {
    return {
      type: "block",
      pressure: intent.block >= 12 ? "high" : intent.block >= 7 ? "medium" : "low",
      icon: "守"
    };
  }

  if (intent.type === "special") {
    const hostileWeight = intent.effects.reduce((weight, effect) => {
      if (effect.action === "damage") {
        return weight + effect.amount * (effect.hits ?? 1);
      }

      if (effect.action === "applyStatus" && effect.target === "player") {
        return weight + effect.amount * 3;
      }

      if (effect.action === "addCardToDiscard" || effect.action === "gainInk") {
        return weight + effect.amount * 2;
      }

      return weight;
    }, 0);

    return {
      type: "special",
      pressure: hostileWeight >= 12 ? "high" : hostileWeight >= 5 ? "medium" : "low",
      icon: "术"
    };
  }

  return { type: "idle", pressure: "low", icon: "息" };
}

function createIntent(intent: CombatState["enemies"][number]["currentIntent"]): HTMLElement {
  const box = document.createElement("div");
  const presentation = getIntentPresentation(intent);
  box.className = `intent-box intent-box--${presentation.type} intent-box--pressure-${presentation.pressure}`;
  box.dataset.testid = "intent";
  box.dataset.intentType = presentation.type;
  box.dataset.intentPressure = presentation.pressure;
  const surface = getIntentGlossarySurface(intent);
  const intentDetail = describeIntent(intent);
  const tooltip = surface.entry ? formatGlossaryTooltip(surface.entry, intentDetail) : intentDetail;
  if (surface.entry) {
    box.dataset.glossaryId = surface.entry.id;
  }
  box.title = tooltip;
  box.setAttribute("aria-label", `敌人意图：${tooltip}`);
  box.innerHTML = `
    <span class="combat-intent-icon" aria-hidden="true">${presentation.icon}</span>
    <span class="combat-intent-kicker">敌意</span>
    <span class="combat-intent-pressure" data-testid="intent-pressure">${formatIntentPressure(presentation.pressure)}</span>
    <strong class="combat-intent-title" data-testid="combat-intent-title">${escapeHtml(formatIntentTitle(intent))}</strong>
    <span class="combat-intent-detail" data-testid="combat-intent-detail">${escapeHtml(intentDetail)}</span>
    <span class="combat-intent-chips">${formatIntentChips(intent).map(createIntentChipMarkup).join("")}</span>
  `;
  return box;
}

function formatIntentPressure(pressure: string): string {
  if (pressure === "high") {
    return "重压";
  }

  if (pressure === "medium") {
    return "逼近";
  }

  return "轻势";
}

function formatIntentTitle(intent: CombatState["enemies"][number]["currentIntent"]): string {
  if (intent.type === "attack") {
    return intent.hits > 1 ? `杀意 ${intent.damage}x${intent.hits}` : `杀意 ${intent.damage}`;
  }

  if (intent.type === "block") {
    return `运功 ${intent.block}`;
  }

  if (intent.type === "special") {
    return intent.name;
  }

  return "观望";
}

function formatIntentChips(intent: CombatState["enemies"][number]["currentIntent"]): string[] {
  if (intent.type === "attack") {
    return [`伤害 ${intent.damage}`, `${intent.hits}段`];
  }

  if (intent.type === "block") {
    return [`护甲 ${intent.block}`];
  }

  if (intent.type === "special") {
    return intent.effects.slice(0, 3).map(formatIntentEffectChip);
  }

  return ["无行动"];
}

function formatIntentEffectChip(effect: EnemyIntentEffect): string {
  if (effect.action === "damage") {
    return `伤害 ${effect.amount}${effect.hits && effect.hits > 1 ? `x${effect.hits}` : ""}`;
  }

  if (effect.action === "block") {
    return `护甲 ${effect.amount}`;
  }

  if (effect.action === "applyStatus") {
    return `${formatStatus(effect.status)} ${effect.amount}`;
  }

  if (effect.action === "addCardToDiscard") {
    return `状态牌 ${effect.amount}`;
  }

  if (effect.action === "gainInk") {
    return `墨痕 ${effect.amount}`;
  }

  return `回复 ${effect.amount}`;
}

function createIntentChipMarkup(label: string): string {
  return `<span class="combat-intent-chip" data-testid="combat-intent-chip">${escapeHtml(label)}</span>`;
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

function createPileCounter(kind: "draw" | "discard" | "exhaust", label: string, count: number): HTMLElement {
  const item = document.createElement("span");
  const iconByKind: Record<"draw" | "discard" | "exhaust", string> = {
    draw: "抽",
    discard: "弃",
    exhaust: "耗"
  };
  const glossaryByKind: Record<"draw" | "discard" | "exhaust", string> = {
    draw: "resource.drawPile",
    discard: "resource.discardPile",
    exhaust: "resource.exhaustPile"
  };
  const ariaLabel = `${label}堆 ${count} 张`;
  item.className = `pile-counter pile-counter--${kind}`;
  item.dataset.testid = `pile-counter-${kind}`;
  item.dataset.glossaryId = glossaryByKind[kind];
  item.title = ariaLabel;
  item.setAttribute("aria-label", ariaLabel);
  item.innerHTML = `
    <span class="pile-counter-icon" aria-hidden="true">${iconByKind[kind]}</span>
    <span class="pile-counter-label">${label}</span>
    <strong>${count}</strong>
  `;
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

function createComboTrailMetadata(combat: CombatState): { text: string; title: string; ariaLabel: string; glossaryIds: string[] } {
  const comboIds = (combat.comboTriggersThisTurn ?? []).slice(-2);
  if (comboIds.length > 0) {
    const entries = comboIds
      .map((comboId) => getGlossaryEntry(`combo.${comboId}`))
      .filter((entry): entry is GlossaryEntry => Boolean(entry));
    const text = entries.length > 0 ? entries.map((entry) => entry.label).join(" / ") : formatComboTrail(combat);
    const detail = entries.length > 0 ? entries.map((entry) => formatGlossaryTooltip(entry)).join("；") : "本回合已触发招式链。";
    const title = `招式链：${detail}`;
    return {
      text,
      title,
      ariaLabel: title,
      glossaryIds: entries.map((entry) => entry.id)
    };
  }

  const recentTypes = combat.playedCardTypesThisTurn.slice(-4);
  const entries = recentTypes
    .map((type) => getGlossaryEntry(`cardType.${type}`))
    .filter((entry): entry is GlossaryEntry => Boolean(entry));
  const detail = entries.length > 0
    ? `已出招式：${entries.map((entry) => `${entry.label}：${entry.description}`).join("；")}`
    : "本回合还未形成招式链。按顺序出牌可触发连招。";
  const title = `招式链：${detail}`;
  return {
    text: recentTypes.length > 0 ? formatTypes(recentTypes) : "待发",
    title,
    ariaLabel: title,
    glossaryIds: entries.map((entry) => entry.id)
  };
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

function createCombatantFeedbackClasses(combat: CombatState, target: "player" | "enemy"): string {
  const feedback = getLatestTargetFeedback(combat, target);
  if (!feedback) {
    return "";
  }

  return `is-target-feedback is-feedback-${feedback.kind} is-feedback-${feedback.tone}`;
}

function createTargetFeedbackMarkup(combat: CombatState, target: "player" | "enemy"): string {
  const feedback = getLatestTargetFeedback(combat, target);
  if (!feedback) {
    return "";
  }

  const label = formatTargetFeedbackKind(feedback.kind);
  return `
    <div class="target-feedback target-feedback--${target} target-feedback--${feedback.kind} target-feedback--${feedback.tone}" data-testid="target-feedback-${target}" data-feedback-kind="${feedback.kind}" data-feedback-tone="${feedback.tone}">
      <span>${label}</span>
      <strong>${escapeHtml(feedback.label)}</strong>
    </div>
  `;
}

function getLatestTargetFeedback(combat: CombatState, target: "player" | "enemy"): CombatVisualEvent | undefined {
  const recentEvents = combat.visualEvents.slice(-6);
  for (let index = recentEvents.length - 1; index >= 0; index -= 1) {
    const event = recentEvents[index];
    if (event.target === target && event.kind !== "turn") {
      return event;
    }
  }

  return undefined;
}

function formatTargetFeedbackKind(kind: CombatVisualEvent["kind"]): string {
  const labels: Record<CombatVisualEvent["kind"], string> = {
    damage: "受击",
    block: "护体",
    status: "状态",
    resource: "蓄势",
    ink: "墨痕",
    draw: "抽牌",
    trigger: "触发",
    turn: "回合"
  };
  return labels[kind];
}

function createPlayedFeedbackMarkup(combat: CombatState): string {
  const recentTypes = combat.playedCardTypesThisTurn.slice(-3);
  if (recentTypes.length === 0) {
    return `<div class="played-feedback played-feedback--idle" data-testid="played-feedback" data-played-count="0"><span>出招</span><strong>候势</strong></div>`;
  }

  return `
    <div class="played-feedback" data-testid="played-feedback" data-played-count="${recentTypes.length}">
      <span>刚出</span>
      <strong>${escapeHtml(formatTypes(recentTypes))}</strong>
    </div>
  `;
}

function createAction(title: string, body: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-action";
  button.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function createEventChoiceAction(choice: GameEventChoice, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-action choice-action--event";
  button.dataset.testid = `event-choice-${choice.id}`;
  button.innerHTML = `
    <strong>${escapeHtml(choice.label)}</strong>
    <span>${escapeHtml(choice.summary)}</span>
    <span class="event-effect-row">
      ${choice.effects.map(createEventEffectChipMarkup).join("")}
    </span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function createEventEffectChipMarkup(effect: EventChoiceEffect): string {
  const descriptor = describeEventEffect(effect);
  return `<span class="event-effect-chip event-effect-chip--${descriptor.tone}" data-testid="event-effect-chip" data-effect-tone="${descriptor.tone}">${escapeHtml(descriptor.label)}</span>`;
}

function describeEventEffect(effect: EventChoiceEffect): { label: string; tone: "gain" | "cost" | "ink" | "mind" | "upgrade" } {
  if (effect.type === "gold") {
    return effect.amount >= 0
      ? { label: `铜钱 +${effect.amount}`, tone: "gain" }
      : { label: `铜钱 ${effect.amount}`, tone: "cost" };
  }

  if (effect.type === "heal") {
    return { label: `生命 +${effect.amount}`, tone: "gain" };
  }

  if (effect.type === "hpLoss") {
    return { label: `生命 -${effect.amount}`, tone: "cost" };
  }

  if (effect.type === "card") {
    return { label: `获得 ${cardsById[effect.cardId]?.name ?? effect.cardId}`, tone: "gain" };
  }

  if (effect.type === "inkCardOffer") {
    return { label: `墨灾 ${cardsById[effect.cardId]?.name ?? effect.cardId}`, tone: "ink" };
  }

  if (effect.type === "removeStarter") {
    return { label: "删初始牌", tone: "upgrade" };
  }

  if (effect.type === "upgrade") {
    return { label: "精修牌", tone: "upgrade" };
  }

  return { label: `心境 ${formatMindLabel(effect.mind)} +${effect.amount}`, tone: "mind" };
}

function formatMindLabel(mind: Exclude<MindState, "none">): string {
  const labels: Record<Exclude<MindState, "none">, string> = {
    ning: "宁",
    nu: "怒",
    bei: "悲",
    mei: "魅",
    luan: "乱",
    wu: "悟"
  };
  return labels[mind];
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
  state.logbookReturnScreen = state.screen;
  state.screen = "logbook";
  render();
}

function openCompendium(state: ControllerState, render: () => void): void {
  state.deckOpen = false;
  state.compendiumReturnScreen = state.screen === "compendium" ? state.compendiumReturnScreen : state.screen as CompendiumReturnScreen;
  state.compendiumFilters = createDefaultCompendiumFilters();
  state.screen = "compendium";
  render();
}

function createDefaultCompendiumFilters(): Required<CompendiumFilters> {
  return {
    category: "all",
    character: "all",
    rarity: "all",
    chapter: "all",
    unlock: "all"
  };
}

function renderDeckOverlayIfOpen(host: HTMLElement, state: ControllerState, render: () => void): void {
  if (!state.deckOpen || !state.run) {
    return;
  }

  const run = state.run;
  const runCards = getRunCardDefinitions(run);
  const archetypeAnalysis = analyzeDeckArchetypes(runCards);
  const methodNames = getRunMethods(run).map((method) => method.name);
  const buildRecap = createDeckBuildRecap({
    cards: runCards,
    methodNames,
    relicNames: run.relicIds.map((id) => relicsById[id]?.name ?? id),
    challengeName: resolveChallengeProfile(run.challengeId).name
  });
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
  summary.setAttribute("aria-label", `当前流派：${archetypeAnalysis.summary}`);
  summary.append(createDeckBuildCompassPanel(buildRecap, methodNames.join("、") || "未定"));

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
      <span class="card-cost" data-testid="card-cost" aria-label="消耗 ${getDisplayCost(card, entry.upgraded)}">${getDisplayCost(card, entry.upgraded)}</span>
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
  const entries = getCardGlossarySurfaces(card)
    .map((surface) => surface.entry)
    .filter((entry): entry is GlossaryEntry => Boolean(entry))
    .slice(0, 4);
  return `<span class="card-keyword-row" data-testid="card-keyword-row">${entries.map(createGlossaryChipMarkup).join("")}</span>`;
}

function createGlossaryChipMarkup(entry: GlossaryEntry): string {
  const tooltip = formatGlossaryTooltip(entry);
  return `<i class="glossary-chip" data-testid="glossary-chip" data-glossary-id="${escapeAttribute(entry.id)}" title="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}" role="note">${escapeHtml(entry.label)}</i>`;
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

  if (effect.action === "scry") {
    return "观星";
  }

  if (effect.action === "setFormation") {
    return effect.name;
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

  if (eventId.includes("qingyin") || eventId.includes("grave_song")) {
    return { key: "score", mark: "音", kicker: "蔡文姬 · 残谱" };
  }

  if (eventId.includes("star_board") || eventId.includes("empty_city")) {
    return { key: "stars", mark: "星", kicker: "诸葛亮 · 星盘" };
  }

  if (eventId.includes("inn") || eventId.includes("river_bones") || eventId.includes("mountain_pass") || eventId.includes("training_yard")) {
    return { key: "road", mark: "途", kicker: "江湖岔路" };
  }

  if (eventId.includes("seller_contract") || eventId.includes("name_register")) {
    return { key: "contract", mark: "契", kicker: "墨书契约" };
  }

  if (eventId.includes("cloud_water") || eventId.includes("heart_mirror") || eventId.includes("unwritten")) {
    return { key: "mirror", mark: "梦", kicker: "墨渊照心" };
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

  return entries.map(([status, amount]) => {
    const layers = amount ?? 0;
    const entry = getGlossaryEntry(`status.${status}`);
    const label = formatStatus(status);
    const tooltip = entry ? formatGlossaryTooltip(entry, `${label} ${layers}层。`) : `${label} ${layers}`;
    return `<span class="status-badge" data-testid="status-badge" data-glossary-id="${escapeAttribute(entry?.id ?? `status.${status}`)}" title="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}"><span>${escapeHtml(label)}</span> <strong>${layers}</strong></span>`;
  }).join("");
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

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
  return screen === "map" || screen === "combat" || screen === "reward" || screen === "methodReward" || screen === "chapterReward" || screen === "event" || screen === "shop" || screen === "rest" || screen === "bossReward" || screen === "finalChoice";
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
