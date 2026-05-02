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
  const controller = createInkbladeController(shell.hudHost);
  let selectedCharacterId = "zhaoyun";

  shell.hudHost.querySelectorAll<HTMLButtonElement>("[data-character-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCharacterId = button.dataset.characterId ?? "zhaoyun";
      shell.hudHost.querySelectorAll("[data-character-id]").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });

  const start = () => {
    if (!game) {
      game = new Phaser.Game(createPhaserConfig(shell.phaserHost));
      shell.root.classList.add("is-running");
    }

    controller.startRun(selectedCharacterId);
    return game;
  };

  shell.startButton.addEventListener("click", start);

  return {
    shellRoot: shell.root,
    start
  };
}
