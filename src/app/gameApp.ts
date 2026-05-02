import Phaser from "phaser";
import { createAppShell } from "./appShell";
import { createInkbladeController } from "./inkbladeController";
import { createPhaserConfig } from "./phaserConfig";

export interface MountedGameApp {
  shellRoot: HTMLElement;
  start(): Phaser.Game;
}

export function mountGameApp(root: HTMLElement): MountedGameApp {
  const shell = createAppShell(root);
  let game: Phaser.Game | undefined;
  const controller = createInkbladeController(shell.hudHost, {
    storage: typeof window !== "undefined" ? window.localStorage : undefined
  });
  let selectedCharacterId = "zhaoyun";

  const ensureGame = () => {
    if (!game) {
      game = new Phaser.Game(createPhaserConfig(shell.phaserHost));
      shell.root.classList.add("is-running");
    }

    return game;
  };

  const refreshSaveButtons = () => {
    const hasSave = controller.hasSavedRun();
    shell.continueButton.disabled = !hasSave;
    shell.clearSaveButton.disabled = !hasSave;
  };

  shell.hudHost.querySelectorAll<HTMLButtonElement>("[data-character-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCharacterId = button.dataset.characterId ?? "zhaoyun";
      shell.hudHost.querySelectorAll("[data-character-id]").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });

  const start = () => {
    const activeGame = ensureGame();
    controller.startRun(selectedCharacterId);
    refreshSaveButtons();
    return activeGame;
  };

  shell.startButton.addEventListener("click", start);
  shell.continueButton.addEventListener("click", () => {
    const activeGame = ensureGame();
    if (!controller.continueRun()) {
      shell.root.classList.remove("is-running");
    }
    refreshSaveButtons();
    return activeGame;
  });
  shell.clearSaveButton.addEventListener("click", () => {
    controller.clearSavedRun();
    refreshSaveButtons();
  });
  refreshSaveButtons();

  return {
    shellRoot: shell.root,
    start
  };
}
