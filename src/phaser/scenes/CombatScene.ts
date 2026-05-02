import Phaser from "phaser";
import { battlefieldAssets } from "../../game/content/visuals";

export class CombatScene extends Phaser.Scene {
  public constructor() {
    super("combat");
  }

  public preload(): void {
    this.load.svg("battlefield-luoshui", battlefieldAssets.luoshui.assetPath);
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#efe2c3");
    this.add.image(width / 2, height / 2, "battlefield-luoshui").setDisplaySize(width, height).setAlpha(0.92);

    this.drawInkLandscape(width, height);
    this.drawFigure(width * 0.28, height * 0.54, 0xb7352a);
    this.drawFigure(width * 0.72, height * 0.5, 0x2f7c6e);
    this.addInkDrift(width, height);
  }

  private drawInkLandscape(width: number, height: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2c2924, 0.16);

    const baseY = height * 0.58;
    graphics.beginPath();
    graphics.moveTo(0, baseY);
    graphics.lineTo(width * 0.16, height * 0.32);
    graphics.lineTo(width * 0.28, baseY * 0.92);
    graphics.lineTo(width * 0.42, height * 0.25);
    graphics.lineTo(width * 0.56, baseY);
    graphics.lineTo(width * 0.72, height * 0.35);
    graphics.lineTo(width, baseY * 0.92);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.closePath();
    graphics.fillPath();

    graphics.lineStyle(3, 0x111111, 0.28);
    this.strokeQuadratic(graphics, width * 0.08, height * 0.72, width * 0.38, height * 0.62, width * 0.58, height * 0.7);
    this.strokeQuadratic(graphics, width * 0.58, height * 0.7, width * 0.76, height * 0.78, width * 0.94, height * 0.64);
  }

  private drawFigure(x: number, y: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 0.38);
    graphics.fillCircle(x, y - 72, 28);
    graphics.fillEllipse(x, y, 88, 150);
    graphics.lineStyle(5, color, 0.55);
    this.strokeQuadratic(graphics, x - 92, y - 8, x, y - 70, x + 92, y - 6);

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

  private strokeQuadratic(
    graphics: Phaser.GameObjects.Graphics,
    startX: number,
    startY: number,
    controlX: number,
    controlY: number,
    endX: number,
    endY: number
  ): void {
    let previousX = startX;
    let previousY = startY;

    for (let step = 1; step <= 18; step += 1) {
      const t = step / 18;
      const inv = 1 - t;
      const x = inv * inv * startX + 2 * inv * t * controlX + t * t * endX;
      const y = inv * inv * startY + 2 * inv * t * controlY + t * t * endY;
      graphics.lineBetween(previousX, previousY, x, y);
      previousX = x;
      previousY = y;
    }
  }
}
