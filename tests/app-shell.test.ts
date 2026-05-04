import { createAppShell } from "../src/app/appShell";
import { mountGameApp, type GameAppRuntime } from "../src/app/gameApp";
import { createRun } from "../src/game/systems/run";
import { loadProfile, loadSavedGame, PROFILE_STORAGE_KEY, SAVE_STORAGE_KEY, type GameStorage } from "../src/game/systems/save/save";

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

describe("app shell", () => {
  it("creates the canvas host, HUD host, and primary action", () => {
    const root = document.createElement("div");

    const shell = createAppShell(root);

    expect(shell.phaserHost.id).toBe("phaser-host");
    expect(shell.hudHost.id).toBe("hud-host");
    expect(root.querySelector('[data-testid="start-run"]')).not.toBeNull();
    expect(root.textContent).toContain("云水江湖");
  });

  it("mounts the root shell before resolving the lazy game runtime", async () => {
    const root = document.createElement("div");
    const runtimeLoadOrder: string[] = [];
    const runtime: GameAppRuntime = {
      startRun: vi.fn(),
      continueRun: vi.fn(() => true),
      hasSavedRun: vi.fn(() => false),
      clearSavedRun: vi.fn()
    };

    const mounted = mountGameApp(root, {
      loadRuntime: async () => {
        runtimeLoadOrder.push(root.querySelector('[data-testid="start-run"]') ? "shell-ready" : "shell-missing");
        return runtime;
      }
    });

    expect(root.querySelector('[data-testid="start-run"]')).not.toBeNull();
    expect(root.querySelector<HTMLButtonElement>('[data-testid="continue-run"]')?.disabled).toBe(true);
    expect(runtimeLoadOrder).toEqual([]);

    await mounted.runtimeReady;

    expect(runtimeLoadOrder).toEqual(["shell-ready"]);
    await mounted.start();

    expect(runtime.startRun).toHaveBeenCalledWith("zhaoyun");
  });

  it("keeps the title shell usable when storage has corrupt profile data and a migratable run", async () => {
    const root = document.createElement("div");
    const storage = new MemoryStorage();
    const run = createRun("zhaoyun", { mapSeed: 19 });
    storage.setItem(PROFILE_STORAGE_KEY, "{broken profile json");
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
      version: 0,
      savedAt: "2026-05-03T00:00:00.000Z",
      state: {
        screen: "map",
        run: {
          characterId: run.characterId,
          mapSeed: run.mapSeed,
          hp: run.hp,
          maxHp: run.maxHp,
          gold: run.gold,
          currentNodeId: run.currentNodeId,
          deck: run.deck,
          relicIds: run.relicIds,
          mapNodes: run.mapNodes,
          visitedNodeIds: run.visitedNodeIds,
          nextDeckInstanceNumber: run.nextDeckInstanceNumber,
          rewardHistory: run.rewardHistory
        }
      }
    }));

    const runtime: GameAppRuntime = {
      startRun: vi.fn(),
      continueRun: vi.fn(() => loadSavedGame(storage) !== undefined),
      hasSavedRun: vi.fn(() => loadSavedGame(storage) !== undefined),
      clearSavedRun: vi.fn()
    };

    const mounted = mountGameApp(root, {
      loadRuntime: async () => {
        loadProfile(storage);
        return runtime;
      }
    });

    await mounted.runtimeReady;

    expect(root.querySelector('[data-testid="screen-title"]')).not.toBeNull();
    expect(root.querySelector<HTMLButtonElement>('[data-testid="continue-run"]')?.disabled).toBe(false);

    root.querySelector<HTMLButtonElement>('[data-testid="continue-run"]')?.click();
    await Promise.resolve();

    expect(runtime.continueRun).toHaveBeenCalled();
  });
});
