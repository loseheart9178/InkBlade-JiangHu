import { cardsById } from "../../src/game/content/cards";
import { createCombat } from "../../src/game/systems/combat/combat";
import { cardList } from "../../src/game/content/cards";
import { charactersById } from "../../src/game/content/characters";
import { enemiesById } from "../../src/game/content/enemies";
import { createRun, takeCardReward, travelToNode, upgradeDeckCard } from "../../src/game/systems/run/run";
import { claimMethodReward } from "../../src/game/systems/methods/methods";
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
    claimMethodReward(run, "method_dragon_spear_chain");

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
    expect(loaded?.run.methodIds).toEqual(["method_dragon_spear_chain"]);
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

  it("persists a final-choice snapshot so a completed boss route can continue", () => {
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun", { mapSeed: 9 });

    const snapshot: ControllerSaveSnapshot = {
      screen: "finalChoice",
      run,
      rewardCardIds: [],
      deckOpen: false,
      message: "墨渊照心，最后一笔等待落下。"
    };

    saveGameState(storage, snapshot);

    const loaded = loadSavedGame(storage);
    expect(loaded?.screen).toBe("finalChoice");
    expect(loaded?.run.characterId).toBe("zhaoyun");
    expect(loaded?.message).toContain("最后一笔");
  });

  it("rejects invalid or mismatched save envelopes", () => {
    const storage = new MemoryStorage();

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ version: 999, state: {} }));
    expect(loadSavedGame(storage)).toBeUndefined();

    storage.setItem(SAVE_STORAGE_KEY, "{broken json");
    expect(loadSavedGame(storage)).toBeUndefined();
  });

  it("migrates an older compatible map snapshot to current defaults", () => {
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun", { mapSeed: 12 });
    const [firstNode, ...remainingNodes] = run.mapNodes;
    const legacyRun = {
      characterId: run.characterId,
      mapSeed: run.mapSeed,
      hp: run.hp,
      maxHp: run.maxHp,
      gold: run.gold,
      currentNodeId: run.currentNodeId,
      deck: run.deck.map(({ instanceId, cardId }) => ({ instanceId, cardId })),
      relicIds: run.relicIds,
      mapNodes: [
        { ...firstNode, floor: undefined, lane: undefined },
        ...remainingNodes
      ],
      visitedNodeIds: run.visitedNodeIds,
      nextDeckInstanceNumber: run.nextDeckInstanceNumber,
      rewardHistory: run.rewardHistory
    };

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
      version: 0,
      savedAt: "2026-05-03T00:00:00.000Z",
      state: {
        screen: "map",
        run: legacyRun
      }
    }));

    const loaded = loadSavedGame(storage);
    expect(loaded?.screen).toBe("map");
    expect(loaded?.rewardCardIds).toEqual([]);
    expect(loaded?.deckOpen).toBe(false);
    expect(loaded?.message).toBe("");
    expect(loaded?.run.chapterId).toBe("luoshui");
    expect(loaded?.run.completedChapterIds).toEqual([]);
    expect(loaded?.run.methodIds).toEqual([]);
    expect(loaded?.run.methodLevels).toEqual({});
    expect(loaded?.run.logbook).toEqual({ eventIds: [], bossIds: [], fragmentIds: [] });
    expect(loaded?.run.mindTendencies).toEqual({ ning: 0, nu: 0, bei: 0, mei: 0, luan: 0, wu: 0 });
    expect(loaded?.run.chapterRewardHistory).toEqual([]);
    expect(loaded?.run.lastCombatComboTriggers).toEqual([]);
    expect(loaded?.run.comboRewardHistory).toEqual([]);
    expect(loaded?.run.finalState).toEqual({ status: "inProgress", chapterId: "luoshui" });
    expect(loaded?.run.mapNodes[0].floor).toBe(0);
    expect(loaded?.run.mapNodes[0].lane).toBe(0);
  });

  it("fails closed for incompatible run snapshots", () => {
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun", { mapSeed: 5 });

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
      version: 1,
      savedAt: "2026-05-03T00:00:00.000Z",
      state: {
        screen: "map",
        run: {
          ...run,
          currentNodeId: "missing-node"
        },
        rewardCardIds: [],
        deckOpen: false,
        message: "This node no longer exists."
      }
    }));

    expect(loadSavedGame(storage)).toBeUndefined();

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
      version: 1,
      savedAt: "2026-05-03T00:00:00.000Z",
      state: {
        screen: "combat",
        run,
        rewardCardIds: [],
        deckOpen: false,
        message: "Combat was missing."
      }
    }));

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
