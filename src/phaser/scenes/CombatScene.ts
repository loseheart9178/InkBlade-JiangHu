import Phaser from "phaser";
import { battlefieldAssets } from "../../game/content/visuals";

type BattlefieldId = keyof typeof battlefieldAssets;

interface SetBattlefieldEventDetail {
  chapterId?: string;
}

export class CombatScene extends Phaser.Scene {
  private battlefieldImage?: Phaser.GameObjects.Image;
  private activeBattlefieldId: BattlefieldId = "luoshui";
  private readonly handleSetBattlefield = (event: Event): void => {
    const detail = (event as CustomEvent<SetBattlefieldEventDetail>).detail;
    this.setBattlefield(detail?.chapterId);
  };

  public constructor() {
    super("combat");
  }

  public preload(): void {
    for (const battlefield of Object.values(battlefieldAssets)) {
      this.load.image(getBattlefieldTextureKey(battlefield.id), battlefield.assetPath);
    }
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#efe2c3");
    this.battlefieldImage = this.add
      .image(width / 2, height / 2, getBattlefieldTextureKey(this.activeBattlefieldId))
      .setDisplaySize(width, height)
      .setAlpha(0.98);
    this.addInkDrift(width, height);
    window.addEventListener("inkblade:set-battlefield", this.handleSetBattlefield);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("inkblade:set-battlefield", this.handleSetBattlefield);
    });
  }

  private setBattlefield(chapterId: string | undefined): void {
    const battlefieldId = isBattlefieldId(chapterId) ? chapterId : "luoshui";

    if (battlefieldId === this.activeBattlefieldId || !this.battlefieldImage) {
      return;
    }

    this.activeBattlefieldId = battlefieldId;
    this.battlefieldImage.setTexture(getBattlefieldTextureKey(battlefieldId));
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

function getBattlefieldTextureKey(id: string): string {
  return `battlefield-${id}`;
}

function isBattlefieldId(id: string | undefined): id is BattlefieldId {
  return typeof id === "string" && id in battlefieldAssets;
}
