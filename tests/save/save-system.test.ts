import { cardsById } from "../../src/game/content/cards";
import { createCombat } from "../../src/game/systems/combat/combat";
import { cardList } from "../../src/game/content/cards";
import { charactersById } from "../../src/game/content/characters";
import { enemiesById } from "../../src/game/content/enemies";
import { createRun, takeCardReward, travelToNode, upgradeDeckCard } from "../../src/game/systems/run/run";
import {
  clearSavedGame,
  loadSavedGame,
  SAVE_STORAGE_KEY,
  saveGameState,
  type ControllerSaveSnapshot,
  type GameStorage
} from "../../src/game/systems/save/save";

class MemoryStorage implements GameStorage {
  private readonly items = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  public removeItem(key: string): void {
    this.items.delete(key);
  }
}

describe("save system", () => {
  it("persists a run snapshot with reward cards and upgraded deck state", () => {
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun", { mapSeed: 7 });
    travelToNode(run, "event-1");
    takeCardReward(run, cardsById.zhao_thrust);
    upgradeDeckCard(run, run.deck[0].instanceId);

    const snapshot: ControllerSaveSnapshot = {
      screen: "reward",
      run,
      rewardCardIds: ["zhao_thrust", "common_pifeng"],
      pendingSpoils: { gold: 12 },
      deckOpen: false,
      message: "战斗胜利，选择一式武学。"
    };

    saveGameState(storage, snapshot);

    const loaded = loadSavedGame(storage);
    expect(loaded?.screen).toBe("reward");
    expect(loaded?.run.currentNodeId).toBe("event-1");
    expect(loaded?.run.mapSeed).toBe(7);
    expect(loaded?.run.deck[0].upgraded).toBe(true);
    expect(loaded?.rewardCardIds).toEqual(["zhao_thrust", "common_pifeng"]);
    expect(loaded?.pendingSpoils).toEqual({ gold: 12 });
  });

  it("persists an in-combat snapshot so continue can restore a fight", () => {
    const storage = new MemoryStorage();
    const run = createRun("diaochan", { mapSeed: 4 });
    travelToNode(run, "battle-1");
    const combat = createCombat({
      character: charactersById.diaochan,
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      playerHp: run.hp,
      rngSeed: 22,
      relicIds: [...run.relicIds],
      shuffleDeck: false
    });

    const snapshot: ControllerSaveSnapshot = {
      screen: "combat",
      run,
      combat,
      rewardCardIds: [],
      deckOpen: false,
      message: "墨化山贼显出意图。"
    };

    saveGameState(storage, snapshot);

    const loaded = loadSavedGame(storage);
    expect(loaded?.screen).toBe("combat");
    expect(loaded?.combat?.player.characterId).toBe("diaochan");
    expect(loaded?.combat?.piles.hand.length).toBeGreaterThan(0);
    expect(loaded?.run.currentNodeId).toBe("battle-1");
  });

  it("rejects invalid or mismatched save envelopes", () => {
    const storage = new MemoryStorage();

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ version: 999, state: {} }));
    expect(loadSavedGame(storage)).toBeUndefined();

    storage.setItem(SAVE_STORAGE_KEY, "{broken json");
    expect(loadSavedGame(storage)).toBeUndefined();
  });

  it("clears the saved game slot", () => {
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun");

    saveGameState(storage, {
      screen: "map",
      run,
      rewardCardIds: [],
      deckOpen: false,
      message: "黑雨仍未停。"
    });

    expect(storage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
    clearSavedGame(storage);
    expect(storage.getItem(SAVE_STORAGE_KEY)).toBeNull();
  });
});
