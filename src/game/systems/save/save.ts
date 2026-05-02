import type { CombatState } from "../combat/types";
import type { BattleSpoils, RunState } from "../run/types";

export const SAVE_STORAGE_KEY = "inkblade-jianghu:run-save:v1";
export const SAVE_SCHEMA_VERSION = 1;

export type SaveableScreen = "map" | "combat" | "reward" | "event" | "shop" | "rest" | "bossReward";

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

export function saveGameState(storage: GameStorage | undefined, snapshot: ControllerSaveSnapshot): void {
  if (!storage || !isSaveableSnapshot(snapshot)) {
    return;
  }

  storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createEnvelope(snapshot)));
}

export function loadSavedGame(storage: GameStorage | undefined): ControllerSaveSnapshot | undefined {
  if (!storage) {
    return undefined;
  }

  const raw = storage.getItem(SAVE_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const envelope = JSON.parse(raw) as Partial<SaveEnvelope>;
    if (envelope.version !== SAVE_SCHEMA_VERSION || !envelope.state || !isSaveableSnapshot(envelope.state)) {
      return undefined;
    }

    return envelope.state;
  } catch {
    return undefined;
  }
}

export function hasSavedGame(storage: GameStorage | undefined): boolean {
  return loadSavedGame(storage) !== undefined;
}

export function clearSavedGame(storage: GameStorage | undefined): void {
  storage?.removeItem(SAVE_STORAGE_KEY);
}

function createEnvelope(snapshot: ControllerSaveSnapshot): SaveEnvelope {
  return {
    version: SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state: snapshot
  };
}

function isSaveableSnapshot(value: unknown): value is ControllerSaveSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<ControllerSaveSnapshot>;
  return (
    isSaveableScreen(snapshot.screen) &&
    isRunStateLike(snapshot.run) &&
    Array.isArray(snapshot.rewardCardIds) &&
    typeof snapshot.deckOpen === "boolean" &&
    typeof snapshot.message === "string" &&
    (snapshot.combat === undefined || isCombatStateLike(snapshot.combat))
  );
}

function isSaveableScreen(screen: unknown): screen is SaveableScreen {
  return screen === "map" || screen === "combat" || screen === "reward" || screen === "event" || screen === "shop" || screen === "rest" || screen === "bossReward";
}

function isRunStateLike(run: unknown): run is RunState {
  if (!run || typeof run !== "object") {
    return false;
  }

  const candidate = run as Partial<RunState>;
  return (
    typeof candidate.characterId === "string" &&
    typeof candidate.mapSeed === "number" &&
    typeof candidate.hp === "number" &&
    typeof candidate.maxHp === "number" &&
    typeof candidate.gold === "number" &&
    typeof candidate.currentNodeId === "string" &&
    Array.isArray(candidate.deck) &&
    Array.isArray(candidate.relicIds) &&
    Array.isArray(candidate.mapNodes) &&
    Array.isArray(candidate.visitedNodeIds) &&
    typeof candidate.nextDeckInstanceNumber === "number" &&
    Array.isArray(candidate.rewardHistory)
  );
}

function isCombatStateLike(combat: unknown): combat is CombatState {
  if (!combat || typeof combat !== "object") {
    return false;
  }

  const candidate = combat as Partial<CombatState>;
  return (
    typeof candidate.turn === "number" &&
    (candidate.phase === "player" || candidate.phase === "won" || candidate.phase === "lost") &&
    typeof candidate.player === "object" &&
    Array.isArray(candidate.enemies) &&
    typeof candidate.piles === "object" &&
    typeof candidate.cardDefinitions === "object"
  );
}
