import Phaser from "phaser";
import { createAppShell } from "./appShell";
import { createPhaserConfig } from "./phaserConfig";

export interface MountedGameApp {
  shellRoot: HTMLElement;
  start(): Phaser.Game;
}

export function mountGameApp(root: HTMLElement): MountedGameApp {
  const shell = createAppShell(root);
  let game: Phaser.Game | undefined;

  const start = () => {
    if (!game) {
      game = new Phaser.Game(createPhaserConfig(shell.phaserHost));
      shell.root.classList.add("is-running");
      shell.startButton.textContent = "行旅中";
      shell.startButton.disabled = true;
    }

    return game;
  };

  shell.startButton.addEventListener("click", start);

  return {
    shellRoot: shell.root,
    start
  };
}

