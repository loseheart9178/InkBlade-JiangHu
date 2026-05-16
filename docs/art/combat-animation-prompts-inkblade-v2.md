# 《云水江湖》战斗动画资产优化提示词 (Inkblade v2)

> 来源：`docs/art/combat-animation-prompts-v1.md`
> 设定补强：`docs/云水江湖_世界观与背景故事设定文档_v0.3.md`、`docs/yunshui_game_prd_v1.md`、四名角色设定文档。
> 用途：面向 GPT Image / DALL-E / Midjourney / Stable Diffusion 的战斗序列帧与 VFX 资产生成。

## 全局美术约束

```text
Inkblade: Tales of Jianghu, Chinese ink-wash wuxia roguelike game asset, xuan paper texture, controlled ink diffusion, brush-stroke silhouettes, readable 2D game sprite design, side-view combat staging, high contrast edges, no UI text, no logos, no watermark, no photorealism, no 3D render, no modern clothing, no cyberpunk, no western fantasy armor, clean separation between frames, production-ready game asset.
```

## 资产 1：四主角战斗序列帧总表

```text
Use case: stylized-concept
Asset type: 2D combat character sprite sheet atlas for a Phaser browser game.
Primary request: Create one clean 4-row sprite sheet atlas for Inkblade: Tales of Jianghu. Each row is one playable character, shown in side-view combat stance with 6 sequential animation frames from left to right: idle anticipation, motion start, peak action, impact or channel, recovery, return to idle.
World setting: A water-ink wuxia jianghu corrupted by the Ink Calamity, where human obsession becomes martial arts, heart demons, ghostly memory, and living black ink.
Canvas and layout: wide sprite sheet atlas, 4 horizontal rows, 6 equal frame cells per row, consistent character scale and ground line, generous padding around each figure, clean frame boundaries without printed labels or text.
Style: premium hand-painted 2D ink-wash game art, xuan paper grain, brushwork silhouettes, restrained color accents, crisp readable edges for later cutout, not photorealistic, not 3D, not chibi.

Row 1 Zhao Yun, White Dragon Breaks Formation: young heroic Chinese spear warrior, white robe and silver light armor, dark blue inner cloth, dragon-scale shoulder and bracer motifs, long spear with white dragon tassel, calm determined eyes. Animation is a defensive spear spin into a ground-butt strike, silver-blue dragon-scale aura and faint white dragon ink trail, stable low stance, restrained heroic force.
Row 2 Diao Chan, Moon-Hiding Dance Shadow: elegant dangerous female dancer martial artist, red and white hanfu dancer outfit with light armor, long sleeves, crimson ribbon, folding fan and hidden sleeve blade. Animation is a charming fan spin into a crescent sleeve slash, vermilion petals and black ink flower motes, beautiful but lethal, no revealing costume.
Row 3 Zhuge Liang, Sleeping Dragon Observes Stars: calm strategist in moon-white scholar robes and gray-blue cloak, white feather fan, composed eyes, star chart and bagua motifs. Animation is a formation-casting sequence: feather fan rises, hands form a seal, pale-gold starlight descends, blue-gold bagua star array blooms underfoot, the body remains controlled and dignified.
Row 4 Cai Wenji, Clear Tone Ferries Souls: serene female guqin musician in pale cyan and white Han-inspired robes, soft green scarf, ancient guqin floating before her, bamboo jade hairpin. Animation is a healing qin performance: hands pluck strings, pale moon-white and cyan sound ripples expand, ink-like musical runes and water rings cleanse dark stains, quiet strength and sorrow.

Avoid: text labels, numbers, logos, watermarks, cropped weapons, merged limbs, duplicated faces, extra arms, extra fingers, western fantasy armor, sci-fi glow, modern clothing, photoreal faces, heavy 3D rendering, noisy backgrounds, busy scenery behind frames.
```

## 资产 2：战斗 VFX 水墨特效总表

```text
Use case: stylized-concept
Asset type: 2D VFX sprite atlas for additive/screen blending in Phaser.
Primary request: Create one clean VFX atlas for Inkblade: Tales of Jianghu containing 8 isolated ink-wash combat effects. Arrange them in a 4 by 2 grid with generous spacing. Each effect is centered in its cell with no text, no labels, no UI, no watermark.
World setting: The Ink Calamity turns obsession, memory, wounds, music, star charts, red silk, and brush strokes into visible martial force.
Canvas and layout: black background for additive/screen blending, except the low-HP vignette and card dissolve may include white-paper negative-space forms inside their cells. High contrast, transparent-ready edges, strong silhouettes, no environment.
Style: traditional Chinese ink wash, xuan-paper brush texture visible inside strokes, game VFX asset, sharp readable silhouettes, premium 2D hand-painted look.

Cell 1 Zhao Yun spear thrust trail: a sharp straight thrust trail made of dark blue, silver, and white ink splatter, spear-like piercing line, white dragon breath implied in the motion.
Cell 2 Diao Chan fan and sleeve slash: elegant crescent slash made from crimson silk, vermilion petals, and black ink, fan-blade shape, graceful but deadly.
Cell 3 heavy hit ink splatter: violent burst of thick black ink and dark red undertone, brush impact spreading outward like a weapon hitting wet paper.
Cell 4 Zhuge Liang bagua star array: top-down glowing Eight Trigrams and ancient star chart magic circle, pale gold and light blue ink lines, precise but hand-brushed.
Cell 5 Cai Wenji healing sound wave: expanding circular ripples in pale green, cyan, and moon-white ink, ancient musical-note-like runes, soft cleansing aura.
Cell 6 low HP ink vignette: screen-edge frame effect with chaotic creeping dark red and black ink stains, clear center, danger and pressure, paper-negative center.
Cell 7 card play dissolve: rectangular paper-card silhouette dissolving into thick black ink droplets, smoke, and brush dust, magical casting transition.
Cell 8 fatal strike screen cut: massive horizontal black brush stroke slash across the cell, rough edges, high-speed dry-brush fragments, dramatic final blow.

Avoid: text, labels, UI buttons, realistic blood gore, photoreal smoke, neon sci-fi particles, lens flares, 3D bevels, symmetrical plastic shapes, low contrast, busy scenery.
```

## Phaser 切片映射

本批生成图不是严格整数单帧尺寸网格，因此使用 Phaser atlas JSON，而不是 `load.spritesheet` 的固定 `frameWidth/frameHeight`。

### 角色动作 Atlas

```ts
this.load.atlas(
  "inkblade-combat-character-atlas-v2",
  "/assets/generated/sprites/inkblade-combat-character-atlas-v2.png",
  "/assets/generated/sprites/inkblade-combat-character-atlas-v2.json"
);
```

帧序列：

| 动画 | 帧名 |
|---|---|
| 赵云技能 | `zhaoyun_skill_00_idle` → `zhaoyun_skill_05_return` |
| 貂蝉技能 | `diaochan_skill_00_idle` → `diaochan_skill_05_return` |
| 诸葛亮技能 | `zhugeliang_skill_00_idle` → `zhugeliang_skill_05_return` |
| 蔡文姬技能 | `caiwenji_skill_00_idle` → `caiwenji_skill_05_return` |

### 战斗 VFX Atlas

```ts
this.load.atlas(
  "inkblade-combat-vfx-atlas-v2",
  "/assets/generated/ui/combat-dark-kit-v2/vfx/inkblade-combat-vfx-atlas-v2.png",
  "/assets/generated/ui/combat-dark-kit-v2/vfx/inkblade-combat-vfx-atlas-v2.json"
);
```

VFX 帧名：

| 效果 | 帧名 |
|---|---|
| 赵云枪影拖尾 | `vfx_zhaoyun_spear_thrust` |
| 貂蝉扇/袖刃划痕 | `vfx_diaochan_fan_sleeve_slash` |
| 重击墨迹 | `vfx_heavy_hit_ink_splatter` |
| 诸葛亮八卦星阵 | `vfx_zhugeliang_bagua_star_array` |
| 蔡文姬治愈音波 | `vfx_caiwenji_healing_sound_wave` |
| 濒死边缘墨染 | `vfx_low_hp_ink_vignette` |
| 卡牌打出消散 | `vfx_card_play_dissolve` |
| 终结击杀横劈 | `vfx_fatal_strike_screen_cut` |
