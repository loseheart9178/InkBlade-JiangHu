import { createAppShell } from "../src/app/appShell";
import { mountGameApp, type GameAppRuntime } from "../src/app/gameApp";

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
});

