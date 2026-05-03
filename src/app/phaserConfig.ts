import Phaser from "phaser";
import { CombatScene } from "../phaser/scenes/CombatScene";

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#efe2c3",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parent.clientWidth || window.innerWidth,
      height: parent.clientHeight || window.innerHeight
    },
    scene: [CombatScene],
    render: {
      antialias: true,
      pixelArt: false
    }
  };
}

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game(createPhaserConfig(parent));
}
