import { createAppShell, type AppShell } from "./appShell";

interface GameAppStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface GameRuntimeOptions {
  storage?: GameAppStorage;
}

export interface GameAppRuntime {
  startRun(characterId: string): unknown;
  continueRun(): boolean;
  hasSavedRun(): boolean;
  clearSavedRun(): void;
  dispose?(): void;
}

export type GameRuntimeLoader = (shell: AppShell, options: GameRuntimeOptions) => Promise<GameAppRuntime>;

export interface MountGameAppOptions extends GameRuntimeOptions {
  loadRuntime?: GameRuntimeLoader;
}

export interface MountedGameApp {
  shellRoot: HTMLElement;
  runtimeReady: Promise<GameAppRuntime>;
  start(): Promise<unknown>;
}

export function mountGameApp(root: HTMLElement, options: MountGameAppOptions = {}): MountedGameApp {
  const shell = createAppShell(root);
  let selectedCharacterId = "zhaoyun";
  let runtime: GameAppRuntime | undefined;

  shell.hudHost.querySelector<HTMLElement>(".title-screen")?.setAttribute("data-testid", "screen-title");
  shell.root.dataset.runtime = "loading";
  shell.continueButton.disabled = true;
  shell.clearSaveButton.disabled = true;

  const runtimeReady = Promise.resolve()
    .then(() => (options.loadRuntime ?? loadDefaultGameRuntime)(shell, options))
    .then((loadedRuntime) => {
      runtime = loadedRuntime;
      shell.root.dataset.runtime = "ready";
      refreshSaveButtons();
      return loadedRuntime;
    })
    .catch((error: unknown) => {
      shell.root.dataset.runtime = "error";
      shell.startButton.disabled = true;
      shell.continueButton.disabled = true;
      shell.clearSaveButton.disabled = true;
      throw error;
    });

  function refreshSaveButtons() {
    const hasSave = runtime?.hasSavedRun() ?? false;
    shell.continueButton.disabled = !hasSave;
    shell.clearSaveButton.disabled = !hasSave;
  }

  shell.hudHost.querySelectorAll<HTMLButtonElement>("[data-character-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCharacterId = button.dataset.characterId ?? "zhaoyun";
      shell.hudHost.querySelectorAll("[data-character-id]").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });

  const start = async () => {
    const activeRuntime = await runtimeReady;
    const activeGame = activeRuntime.startRun(selectedCharacterId);
    refreshSaveButtons();
    return activeGame;
  };

  shell.startButton.addEventListener("click", () => {
    void start();
  });
  shell.continueButton.addEventListener("click", () => {
    void runtimeReady.then((activeRuntime) => {
      if (!activeRuntime.continueRun()) {
        shell.root.classList.remove("is-running");
      }
      refreshSaveButtons();
    });
  });
  shell.clearSaveButton.addEventListener("click", () => {
    void runtimeReady.then((activeRuntime) => {
      activeRuntime.clearSavedRun();
      refreshSaveButtons();
    });
  });

  return {
    shellRoot: shell.root,
    runtimeReady,
    start
  };
}

async function loadDefaultGameRuntime(shell: AppShell, options: GameRuntimeOptions): Promise<GameAppRuntime> {
  const [{ createInkbladeController }, { createPhaserGame }] = await Promise.all([
    import("./inkbladeController"),
    import("./phaserConfig")
  ]);
  const controller = createInkbladeController(shell.hudHost, {
    storage: options.storage ?? (typeof window !== "undefined" ? window.localStorage : undefined)
  });
  let game: unknown;

  const ensureGame = () => {
    if (!game) {
      game = createPhaserGame(shell.phaserHost);
      shell.root.classList.add("is-running");
    }

    return game;
  };

  return {
    startRun(characterId: string) {
      const activeGame = ensureGame();
      controller.startRun(characterId);
      return activeGame;
    },
    continueRun() {
      const didContinue = controller.continueRun();
      if (didContinue) {
        ensureGame();
      } else {
        shell.root.classList.remove("is-running");
      }
      return didContinue;
    },
    hasSavedRun() {
      return controller.hasSavedRun();
    },
    clearSavedRun() {
      controller.clearSavedRun();
      shell.root.classList.remove("is-running");
    },
    dispose() {
      controller.dispose();
    }
  };
}
