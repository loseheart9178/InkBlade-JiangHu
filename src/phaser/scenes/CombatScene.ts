import Phaser from "phaser";
import { battlefieldAssets } from "../../game/content/visuals";

export class CombatScene extends Phaser.Scene {
  public constructor() {
    super("combat");
  }

  public preload(): void {
    this.load.image("battlefield-luoshui", battlefieldAssets.luoshui.assetPath);
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#efe2c3");
    this.add.image(width / 2, height / 2, "battlefield-luoshui").setDisplaySize(width, height).setAlpha(0.98);
    this.addInkDrift(width, height);
  }

  private addInkDrift(width: number, height: number): void {
    for (let index = 0; index < 14; index += 1) {
      const spot = this.add.circle(width * (0.08 + index * 0.065), height * (0.18 + (index % 5) * 0.12), 3 + (index % 4) * 2, 0x111111, 0.12);
      this.tweens.add({
        targets: spot,
        y: spot.y + 18 + (index % 3) * 10,
        alpha: 0.04,
        duration: 2400 + index * 170,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

}
