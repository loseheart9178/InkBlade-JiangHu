import Phaser from "phaser";
import { battlefieldAssets } from "../../game/content/visuals";

type BattlefieldId = keyof typeof battlefieldAssets;

interface SetBattlefieldEventDetail {
  chapterId?: string;
}

interface CombatActionEventDetail {
  action: "idle" | "hit" | "attack" | "skill";
  characterId: string;
  isPlayer: boolean;
}

export class CombatScene extends Phaser.Scene {
  private battlefieldImage?: Phaser.GameObjects.Image;
  private activeBattlefieldId: BattlefieldId = "luoshui";
  private characterEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  
  private readonly handleSetBattlefield = (event: Event): void => {
    const detail = (event as CustomEvent<SetBattlefieldEventDetail>).detail;
    this.setBattlefield(detail?.chapterId);
  };

  private readonly handleCombatAction = (event: Event): void => {
    const detail = (event as CustomEvent<CombatActionEventDetail>).detail;
    if (!detail) return;
    this.playCombatAction(detail.action, detail.characterId, detail.isPlayer);
  };

  public constructor() {
    super("combat");
  }

  public preload(): void {
    for (const battlefield of Object.values(battlefieldAssets)) {
      this.load.image(getBattlefieldTextureKey(battlefield.id), battlefield.assetPath);
    }
    
    this.load.atlas(
      "inkblade-combat-vfx-atlas-v2",
      "/assets/generated/ui/combat-dark-kit-v2/vfx/inkblade-combat-vfx-atlas-v2.png",
      "/assets/generated/ui/combat-dark-kit-v2/vfx/inkblade-combat-vfx-atlas-v2.json"
    );
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#efe2c3");
    this.battlefieldImage = this.add
      .image(width / 2, height / 2, getBattlefieldTextureKey(this.activeBattlefieldId))
      .setDisplaySize(width, height)
      .setAlpha(0.98);
    this.addInkDrift(width, height);

    // Create a dynamic ink drop texture to ensure we don't see "black boxes"
    // Use a radial alpha gradient to make it look like a soft ink wash
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 32, 32);
    graphics.generateTexture("ink-drop", 64, 64);
    
    window.addEventListener("inkblade:set-battlefield", this.handleSetBattlefield);
    window.addEventListener("inkblade:combat-action", this.handleCombatAction);
    
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("inkblade:set-battlefield", this.handleSetBattlefield);
      window.removeEventListener("inkblade:combat-action", this.handleCombatAction);
      this.characterEmitters.forEach(emitter => emitter.destroy());
      this.characterEmitters.clear();
    });
  }

  private playCombatAction(action: "idle" | "hit" | "attack" | "skill", characterId: string, isPlayer: boolean): void {
    const { width, height } = this.scale;
    const x = isPlayer ? width * 0.28 : width * 0.72;
    const y = height * 0.88; // Lowered to align with character base/feet
    
    switch (action) {
      case "idle":
        this.updateCharacterAura(characterId, x, y, isPlayer);
        break;
      case "hit":
        this.cameras.main.shake(200, 0.012);
        this.playVfx("heavy_hit", isPlayer);
        this.flashScreen(0x111111, 0.1, 150);
        break;
      case "attack":
        this.updateCharacterAura(characterId, x, y, isPlayer, true);
        this.time.delayedCall(150, () => {
          this.playVfx(characterId, !isPlayer);
        });
        break;
      case "skill":
        this.cameras.main.zoomTo(1.15, 400, "Cubic.easeOut", true);
        this.flashScreen(0xffffff, 0.15, 300);
        this.time.delayedCall(1600, () => {
          this.cameras.main.zoomTo(1, 600, "Cubic.easeIn", true);
        });
        break;
    }
  }

  private updateCharacterAura(id: string, x: number, y: number, isPlayer: boolean, intense: boolean = false): void {
    if (this.characterEmitters.has(id)) {
      const emitter = this.characterEmitters.get(id)!;
      if (intense) {
        emitter.explode(20);
      }
      return;
    }

    let color = 0x2f7c6e; // Teal (Zhao Yun, Zhuge Liang, Cai Wenji)
    if (id === "diaochan" || id.includes("red") || id.includes("scribe")) color = 0x7f1f1a; // Red
    else if (id.includes("ink") || id.includes("enemy")) color = 0x111111; // Ink

    const emitter = this.add.particles(x, y, "ink-drop", {
      scale: { start: 0.1, end: 0.5 },
      alpha: { start: 0.25, end: 0 },
      speed: { min: 5, max: 25 },
      lifespan: { min: 1000, max: 2000 },
      frequency: 800,
      gravityY: -10,
      blendMode: Phaser.BlendModes.NORMAL,
      tint: color
    });

    this.characterEmitters.set(id, emitter);
  }

  private flashScreen(color: number, alpha: number, duration: number): void {
    const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, color, alpha);
    flash.setOrigin(0);
    flash.setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }

  private playVfx(type: string, onPlayer: boolean): void {
    const x = onPlayer ? this.scale.width * 0.28 : this.scale.width * 0.72;
    const y = this.scale.height * 0.7;
    
    let frameName = "";
    if (type === "zhaoyun") frameName = "vfx_zhaoyun_spear_thrust";
    else if (type === "diaochan") frameName = "vfx_diaochan_fan_sleeve_slash";
    else if (type === "heavy_hit") frameName = "vfx_heavy_hit_ink_splatter";
    else if (type === "zhugeliang") frameName = "vfx_zhugeliang_bagua_star_array";
    else if (type === "caiwenji") frameName = "vfx_caiwenji_healing_sound_wave";
    else if (type === "fatal_strike") frameName = "vfx_fatal_strike_screen_cut";
    
    if (!frameName) return;

    const vfx = this.add.sprite(x, y, "inkblade-combat-vfx-atlas-v2", frameName);
    vfx.setBlendMode(Phaser.BlendModes.ADD);
    vfx.setScale(1.6);
    vfx.setAlpha(0);
    
    this.tweens.add({
      targets: vfx,
      alpha: 1,
      scale: 1.9,
      duration: 180,
      yoyo: true,
      hold: 120,
      onComplete: () => {
        vfx.destroy();
      }
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
