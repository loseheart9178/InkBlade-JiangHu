import { chaptersById, type ChapterId } from "../../content/chapters";
import type { CardInstance, CombatPiles, CombatState } from "../combat/types";
import { normalizeProfile, type PlayerProfile } from "../profile/profile";
import type { BattleSpoils, MapNode, MapNodeType, RunDeckEntry, RunFinalState, RunLogbookState, RunState } from "../run/types";

export const SAVE_STORAGE_KEY = "inkblade-jianghu:run-save:v1";
export const PROFILE_STORAGE_KEY = "inkblade-jianghu:profile:v1";
export const SAVE_SCHEMA_VERSION = 1;
export const PROFILE_SCHEMA_VERSION = 1;

export type SaveableScreen = "map" | "combat" | "reward" | "methodReward" | "chapterReward" | "event" | "shop" | "rest" | "bossReward" | "finalChoice";

export interface GameStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ControllerSaveSnapshot {
  screen: SaveableScreen;
  run: RunState;
  combat?: CombatState;
  rewardCardIds: string[];
  pendingSpoils?: BattleSpoils;
  deckOpen: boolean;
  message: string;
}

interface SaveEnvelope {
  version: typeof SAVE_SCHEMA_VERSION;
  savedAt: string;
  state: ControllerSaveSnapshot;
}

interface ProfileEnvelope {
  version: typeof PROFILE_SCHEMA_VERSION;
  savedAt: string;
  profile: PlayerProfile;
}

export function saveGameState(storage: GameStorage | undefined, snapshot: ControllerSaveSnapshot): void {
  const normalized = normalizeSaveSnapshot(snapshot);
  if (!storage || !normalized) {
    return;
  }

  safeSetItem(storage, SAVE_STORAGE_KEY, JSON.stringify(createEnvelope(normalized)));
}

export function loadSavedGame(storage: GameStorage | undefined): ControllerSaveSnapshot | undefined {
  if (!storage) {
    return undefined;
  }

  const raw = safeGetItem(storage, SAVE_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const state = readSavePayload(parsed);
    if (!state) {
      return undefined;
    }

    return state;
  } catch {
    return undefined;
  }
}

export function hasSavedGame(storage: GameStorage | undefined): boolean {
  return loadSavedGame(storage) !== undefined;
}

export function clearSavedGame(storage: GameStorage | undefined): void {
  safeRemoveItem(storage, SAVE_STORAGE_KEY);
}

export function saveProfile(storage: GameStorage | undefined, profile: PlayerProfile): void {
  if (!storage) {
    return;
  }

  safeSetItem(storage, PROFILE_STORAGE_KEY, JSON.stringify(createProfileEnvelope(normalizeProfile(profile))));
}

export function loadProfile(storage: GameStorage | undefined): PlayerProfile | undefined {
  if (!storage) {
    return undefined;
  }

  const raw = safeGetItem(storage, PROFILE_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    return readProfilePayload(JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

export function clearProfile(storage: GameStorage | undefined): void {
  safeRemoveItem(storage, PROFILE_STORAGE_KEY);
}

function createEnvelope(snapshot: ControllerSaveSnapshot): SaveEnvelope {
  return {
    version: SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state: snapshot
  };
}

function createProfileEnvelope(profile: PlayerProfile): ProfileEnvelope {
  return {
    version: PROFILE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    profile
  };
}

const SAVEABLE_SCREENS: readonly SaveableScreen[] = [
  "map",
  "combat",
  "reward",
  "methodReward",
  "chapterReward",
  "event",
  "shop",
  "rest",
  "bossReward",
  "finalChoice"
];

const MAP_NODE_TYPES: readonly MapNodeType[] = ["start", "battle", "elite", "event", "shop", "rest", "boss"];

function readSavePayload(value: unknown): ControllerSaveSnapshot | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const version = typeof record.version === "number" ? record.version : undefined;
  if (version !== undefined && version > SAVE_SCHEMA_VERSION) {
    return undefined;
  }

  const payload = record.state !== undefined ? record.state : record;
  return normalizeSaveSnapshot(payload);
}

function readProfilePayload(value: unknown): PlayerProfile | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const version = typeof record.version === "number" ? record.version : undefined;
  if (version !== undefined && version > PROFILE_SCHEMA_VERSION) {
    return undefined;
  }

  return normalizeProfile(record.profile !== undefined ? record.profile as Partial<PlayerProfile> : record as Partial<PlayerProfile>);
}

function normalizeSaveSnapshot(value: unknown): ControllerSaveSnapshot | undefined {
  const record = asRecord(value);
  if (!record || !isSaveableScreen(record.screen)) {
    return undefined;
  }

  const run = normalizeRunState(record.run);
  if (!run) {
    return undefined;
  }

  const normalizedCombat = record.combat === undefined ? undefined : normalizeCombatState(record.combat);
  if (record.screen === "combat" && !normalizedCombat) {
    return undefined;
  }
  const combat = record.screen === "combat" ? normalizedCombat : undefined;

  return {
    screen: record.screen,
    run,
    combat,
    rewardCardIds: stringArray(record.rewardCardIds),
    pendingSpoils: normalizeBattleSpoils(record.pendingSpoils),
    deckOpen: typeof record.deckOpen === "boolean" ? record.deckOpen : false,
    message: typeof record.message === "string" ? record.message : ""
  };
}

function normalizeRunState(value: unknown): RunState | undefined {
  const candidate = asRecord(value);
  if (!candidate) {
    return undefined;
  }

  const characterId = nonEmptyString(candidate.characterId);
  const maxHp = finiteNumber(candidate.maxHp);
  const hp = finiteNumber(candidate.hp);
  const deck = normalizeRunDeck(candidate.deck);
  const mapNodes = normalizeMapNodes(candidate.mapNodes);
  const currentNodeId = nonEmptyString(candidate.currentNodeId);

  if (!characterId || maxHp === undefined || hp === undefined || deck.length === 0 || mapNodes.length === 0 || !currentNodeId) {
    return undefined;
  }

  if (!mapNodes.some((node) => node.id === currentNodeId) || !hasValidConnections(mapNodes)) {
    return undefined;
  }

  const chapterId = normalizeChapterId(candidate.chapterId);
  const methodIds = uniqueStringArray(candidate.methodIds);

  return {
    characterId,
    chapterId,
    completedChapterIds: normalizeChapterIds(candidate.completedChapterIds),
    mapSeed: nonNegativeNumber(candidate.mapSeed, 0),
    hp: Math.min(Math.max(0, hp), Math.max(0, maxHp)),
    maxHp: Math.max(0, maxHp),
    gold: nonNegativeNumber(candidate.gold, 0),
    deck,
    relicIds: uniqueStringArray(candidate.relicIds),
    methodIds,
    methodLevels: normalizeMethodLevels(candidate.methodLevels, methodIds),
    logbook: normalizeLogbook(candidate.logbook),
    mindTendencies: normalizeMindTendencies(candidate.mindTendencies),
    mapNodes,
    currentNodeId,
    visitedNodeIds: stringArray(candidate.visitedNodeIds).filter((id) => mapNodes.some((node) => node.id === id)),
    nextDeckInstanceNumber: normalizeNextDeckInstanceNumber(candidate.nextDeckInstanceNumber, deck),
    rewardHistory: stringArray(candidate.rewardHistory),
    chapterRewardHistory: stringArray(candidate.chapterRewardHistory),
    lastCombatComboTriggers: stringArray(candidate.lastCombatComboTriggers),
    comboRewardHistory: stringArray(candidate.comboRewardHistory),
    finalState: normalizeFinalState(candidate.finalState, chapterId)
  };
}

function normalizeRunDeck(value: unknown): RunDeckEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index): RunDeckEntry[] => {
    if (typeof entry === "string" && entry.length > 0) {
      return [{ instanceId: `run-card-${index + 1}`, cardId: entry }];
    }

    const record = asRecord(entry);
    const cardId = record ? nonEmptyString(record.cardId) : undefined;
    if (!record || !cardId) {
      return [];
    }

    return [{
      instanceId: nonEmptyString(record.instanceId) ?? `run-card-${index + 1}`,
      cardId,
      ...(typeof record.upgraded === "boolean" ? { upgraded: record.upgraded } : {})
    }];
  });
}

function normalizeMapNodes(value: unknown): MapNode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index): MapNode[] => {
    const record = asRecord(entry);
    const id = record ? nonEmptyString(record.id) : undefined;
    const type = record && isMapNodeType(record.type) ? record.type : undefined;
    if (!record || !id || !type) {
      return [];
    }

    return [{
      id,
      type,
      label: nonEmptyString(record.label) ?? id,
      floor: integerNumber(record.floor, index),
      lane: integerNumber(record.lane, 0),
      ...(typeof record.enemyId === "string" && record.enemyId.length > 0 ? { enemyId: record.enemyId } : {}),
      ...(typeof record.eventId === "string" && record.eventId.length > 0 ? { eventId: record.eventId } : {}),
      connections: stringArray(record.connections)
    }];
  });
}

function hasValidConnections(mapNodes: readonly MapNode[]): boolean {
  const nodeIds = new Set(mapNodes.map((node) => node.id));
  return mapNodes.every((node) => node.connections.every((id) => nodeIds.has(id)));
}

function normalizeMethodLevels(value: unknown, methodIds: readonly string[]): Record<string, number> {
  const levels: Record<string, number> = {};
  const record = asRecord(value);
  if (record) {
    for (const [methodId, level] of Object.entries(record)) {
      levels[methodId] = Math.max(1, integerNumber(level, 1));
    }
  }

  for (const methodId of methodIds) {
    levels[methodId] = Math.max(1, levels[methodId] ?? 1);
  }

  return levels;
}

function normalizeLogbook(value: unknown): RunLogbookState {
  const record = asRecord(value);
  return {
    eventIds: stringArray(record?.eventIds),
    bossIds: stringArray(record?.bossIds),
    fragmentIds: stringArray(record?.fragmentIds)
  };
}

function normalizeMindTendencies(value: unknown): RunState["mindTendencies"] {
  const record = asRecord(value);
  return {
    ning: nonNegativeNumber(record?.ning, 0),
    nu: nonNegativeNumber(record?.nu, 0),
    bei: nonNegativeNumber(record?.bei, 0),
    mei: nonNegativeNumber(record?.mei, 0),
    luan: nonNegativeNumber(record?.luan, 0),
    wu: nonNegativeNumber(record?.wu, 0)
  };
}

function normalizeFinalState(value: unknown, fallbackChapterId: ChapterId): RunFinalState {
  const record = asRecord(value);
  const status = record?.status === "endingReady" ? "endingReady" : "inProgress";
  const chapterId = normalizeChapterId(record?.chapterId, fallbackChapterId);

  return {
    status,
    chapterId,
    ...(typeof record?.bossId === "string" && record.bossId.length > 0 ? { bossId: record.bossId } : {}),
    ...(typeof record?.finalChoiceId === "string" && record.finalChoiceId.length > 0 ? { finalChoiceId: record.finalChoiceId } : {}),
    ...(typeof record?.worldEndingId === "string" && record.worldEndingId.length > 0 ? { worldEndingId: record.worldEndingId } : {}),
    ...(typeof record?.characterEpilogueId === "string" && record.characterEpilogueId.length > 0 ? { characterEpilogueId: record.characterEpilogueId } : {})
  };
}

function normalizeNextDeckInstanceNumber(value: unknown, deck: readonly RunDeckEntry[]): number {
  const fromDeck = deck.reduce((highest, entry) => {
    const match = /^run-card-(\d+)$/.exec(entry.instanceId);
    return match ? Math.max(highest, Number(match[1]) + 1) : highest;
  }, deck.length + 1);
  return Math.max(fromDeck, integerNumber(value, fromDeck));
}

function normalizeBattleSpoils(value: unknown): BattleSpoils | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const gold = finiteNumber(record.gold);
  if (gold === undefined) {
    return undefined;
  }

  return {
    gold: Math.max(0, gold),
    ...(typeof record.relicId === "string" && record.relicId.length > 0 ? { relicId: record.relicId } : {})
  };
}

function normalizeCombatState(value: unknown): CombatState | undefined {
  const candidate = asRecord(value);
  if (!candidate || !isCombatPhase(candidate.phase)) {
    return undefined;
  }

  const turn = finiteNumber(candidate.turn);
  const player = asRecord(candidate.player);
  const enemies = Array.isArray(candidate.enemies) ? candidate.enemies : undefined;
  const piles = normalizeCombatPiles(candidate.piles);
  const cardDefinitions = asRecord(candidate.cardDefinitions);
  const character = asRecord(candidate.character);
  if (turn === undefined || !player || !enemies || !piles || !cardDefinitions || !character) {
    return undefined;
  }

  return {
    ...(value as CombatState),
    turn,
    phase: candidate.phase,
    player: candidate.player as CombatState["player"],
    enemies: enemies as CombatState["enemies"],
    piles,
    cardDefinitions: cardDefinitions as CombatState["cardDefinitions"],
    character: candidate.character as CombatState["character"],
    combatLog: stringArray(candidate.combatLog),
    visualEvents: Array.isArray(candidate.visualEvents) ? candidate.visualEvents as CombatState["visualEvents"] : [],
    relicIds: uniqueStringArray(candidate.relicIds),
    relicMemory: asRecord(candidate.relicMemory) as CombatState["relicMemory"] | undefined ?? {},
    methodIds: uniqueStringArray(candidate.methodIds),
    methodLevels: normalizeMethodLevels(candidate.methodLevels, uniqueStringArray(candidate.methodIds)),
    methodMemory: asRecord(candidate.methodMemory) as CombatState["methodMemory"] | undefined ?? {},
    echoQueue: Array.isArray(candidate.echoQueue) ? candidate.echoQueue as CombatState["echoQueue"] : [],
    playedCardTypesThisTurn: stringArray(candidate.playedCardTypesThisTurn) as CombatState["playedCardTypesThisTurn"],
    comboTriggersThisTurn: stringArray(candidate.comboTriggersThisTurn),
    comboTriggersThisCombat: stringArray(candidate.comboTriggersThisCombat),
    lastPlayedCardExhaustedThisTurn: typeof candidate.lastPlayedCardExhaustedThisTurn === "boolean" ? candidate.lastPlayedCardExhaustedThisTurn : false,
    attacksPlayedThisTurn: integerNumber(candidate.attacksPlayedThisTurn, 0),
    nextInstanceNumber: integerNumber(candidate.nextInstanceNumber, 1),
    nextVisualEventId: integerNumber(candidate.nextVisualEventId, 1)
  };
}

function normalizeCombatPiles(value: unknown): CombatPiles | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  return {
    draw: normalizeCombatCards(record.draw),
    hand: normalizeCombatCards(record.hand),
    discard: normalizeCombatCards(record.discard),
    exhaust: normalizeCombatCards(record.exhaust)
  };
}

function normalizeCombatCards(value: unknown): CardInstance[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index): CardInstance[] => {
    const record = asRecord(entry);
    const definitionId = record ? nonEmptyString(record.definitionId) : undefined;
    if (!record || !definitionId) {
      return [];
    }

    return [{
      instanceId: nonEmptyString(record.instanceId) ?? `combat-card-${index + 1}`,
      definitionId,
      ...(typeof record.upgraded === "boolean" ? { upgraded: record.upgraded } : {})
    }];
  });
}

function isSaveableScreen(screen: unknown): screen is SaveableScreen {
  return SAVEABLE_SCREENS.includes(screen as SaveableScreen);
}

function isMapNodeType(type: unknown): type is MapNodeType {
  return MAP_NODE_TYPES.includes(type as MapNodeType);
}

function isCombatPhase(phase: unknown): phase is CombatState["phase"] {
  return phase === "player" || phase === "won" || phase === "lost";
}

function normalizeChapterId(value: unknown, fallback: ChapterId = "luoshui"): ChapterId {
  return isChapterId(value) ? value : fallback;
}

function normalizeChapterIds(value: unknown): ChapterId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isChapterId);
}

function isChapterId(value: unknown): value is ChapterId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(chaptersById, value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function uniqueStringArray(value: unknown): string[] {
  return Array.from(new Set(stringArray(value)));
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  const normalized = finiteNumber(value);
  return normalized === undefined ? fallback : Math.max(0, normalized);
}

function integerNumber(value: unknown, fallback: number): number {
  const normalized = finiteNumber(value);
  return normalized === undefined ? fallback : Math.max(0, Math.floor(normalized));
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function safeGetItem(storage: GameStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(storage: GameStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Persistence is opportunistic; gameplay should continue if the browser denies storage.
  }
}

function safeRemoveItem(storage: GameStorage | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Clearing is best-effort for the same reason as saving.
  }
}
