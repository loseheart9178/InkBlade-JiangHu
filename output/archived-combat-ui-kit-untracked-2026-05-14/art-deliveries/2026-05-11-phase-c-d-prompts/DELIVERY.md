# Phase C + D 卡牌美术提示词交付文档

日期：2026-05-11  
批次：V11–V15（共 37 张）  
负责人：Cascade

---

## 交付说明

### 技术合同

- **尺寸**：1024×1536 PNG，竖版
- **主体位置**：画面上中部 48%–60% 区域
- **底部安全区**：下方 28% 仅允许水墨迷雾、纸质纹理，无重要元素
- **禁止元素**：文字、UI、边框、水印、现代特效、英文字母、无关道具

### 风格合同

| 批次 | 角色 | 前缀 | 调色盘要点 |
|------|------|------|-----------|
| V11 | 赵云 | `foundation-v11-zhao-` | 白甲、银枪、黑发、朱砂+金色点缀 |
| V12 | 貂蝉（红色合同） | `foundation-red-v12-diao-` | 深朱砂红、暖白罗衣、团扇、红绸。**禁用翡翠/青/蓝绿** |
| V13 | 蔡文姬 | `foundation-v13-cai-` | 深靛蓝/玉色罗衣、古琴、翠玉声波。禁用大红、橙色 |
| V14 | 诸葛亮（星阵合同） | `foundation-star-v14-zhuge-` | 旧宣纸底、淡灰黑水墨、老金星线、白羽扇、八卦阵 |
| V15 | 混合 wave27 | 各自前缀 | 按角色适用上述各合同 |

### 生成建议

1. 按批次顺序生成：V11 → V12 → V13 → V14 → V15
2. 每批生成完毕后告知，立即导入绑定和测试
3. 若某张图质量不满意，提供时间戳，单独重新生成

---

## V11 — 赵云 wave10（7 张）

### 01 `foundation-v11-zhao-guardian.png`
**绑定**：`zhao_guardian`（护主 / 1费 Common：护甲8，施加1层护主）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun stands between an unseen presence behind him and an incoming threat ahead — his body leans forward, silver spear planted across the front of the composition as an absolute barrier. His white armor faces the threat, his back to whoever he protects. The spear is not attacking but blocking; the stance is pure defense. His white cloak is pressed against his body by the wind of the oncoming strike.
The composition should feel like an unmovable wall formed from one person's will. White armor foreground, teal guard energy at the spear, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor.
```

---

### 02 `foundation-v11-zhao-qixing-spear.png`
**绑定**：`zhao_qixing_spear`（七星枪影 / 2费 Rare 攻击：七段连击每段5伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun's single spear strike leaves seven distinct afterimage trails — seven spear-tip positions are visible simultaneously, each leaving a faint gold ink ghost. The afterimages fan out in a tight arc, showing the complete seven-point sequence of the technique. At the center, Zhao Yun himself is slightly blurred with motion, his spear moving too fast to be fixed in one place.
The seven gold afterimage dots form a loose Dipper constellation pattern in the composition. The actual spear paths between them glow with aged-gold ink light. White armor at the center axis. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor.
```

---

### 03 `foundation-v11-zhao-single-rider.png`
**绑定**：`zhao_single_rider`（单骑救主 / 2费 Rare 技法：护甲14，施加2层护主，抽1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun alone on his white horse, charging through a closing corridor of ink-black enemy banners and shadow silhouettes. He rides with one arm holding the reins and the other clutching something precious to his chest — the impression of a rescued person, but only suggested, not shown explicitly. The surrounding enemy presence is represented as flat ink shadows and dark banner strokes pressing in from both sides, but they cannot close the gap in time.
The composition should feel like a single streak of white light through darkness — inevitable and complete. White horse and armor as the dominant bright element against converging ink darkness, gold trail behind. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, showing the rescued figure clearly.
```

---

### 04 `foundation-v11-zhao-stable-formation.png`
**绑定**：`zhao_stable_formation`（稳阵 / 1费 Common 技法：获得1枪势，抽1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun adjusts his stance — he steps back slightly and re-plants his spear in a more balanced, grounded position. The motion is deliberate recalibration rather than attack or retreat. His posture is lower than usual, center of gravity settled. Around his planted spear base, small teal formation lines radiate outward, suggesting the energy of a reorganized position.
The mood should feel like composed readiness — a warrior who has taken a breath and found a better footing. Low grounded stance, teal formation ring at foot of spear, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor. Avoid combat aggression — this is a preparatory skill.
```

---

### 05 `foundation-v11-zhao-sweep.png`
**绑定**：`zhao_sweep`（横扫 / 1费 Common 攻击：造成9伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun executes a full horizontal spear sweep — his body is turning, both arms extended, the spear traveling in a wide red arc across the mid-composition. The sweep path is marked by a bold cinnabar-red ink arc from left to right, showing the full range of the strike. Dust and red ink fragments scatter along the arc's path.
His stance is open and committed to the sweep. The horizontal momentum is clear from his body lean. No target is shown — the arc alone implies everything that stood in its path is gone. Red sweep arc, white armor lean, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor.
```

---

### 06 `foundation-v11-zhao-thrust.png`
**绑定**：`zhao_thrust`（突刺 / 1费 Common 攻击：造成8伤，获得1枪势）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun drives his silver spear directly forward in a pure straight thrust — the spear tip is aimed at the viewer, perfectly centered. Rain streaks fall diagonally across the composition and the spear cuts through them without deflecting. A cinnabar-red energy corona forms at the spear tip on contact, the point of maximum focus.
His body is completely aligned behind the thrust: arm extended, shoulder dropped, weight fully committed. The composition axis is the spear itself — vertical and unwavering. Red corona at tip, silver spear body, white armor behind, diagonal rain. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor.
```

---

### 07 `foundation-v11-zhao-white-dragon.png`
**绑定**：`zhao_white_dragon`（白龙探爪 / 1费 Common 攻击：造成6伤，抽1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun's spear tip is surrounded by a coiling white dragon claw — not a full dragon, just the reaching claw and the suggestion of white dragon presence at the spear point. The claw curls forward around the tip as if the spear and the dragon are one strike. Aged-gold constellation lines trace the dragon form loosely above and behind the claw. The dragon's reaching motion mirrors the thrusting spear.
The mood should feel like a strike that reaches farther than it should — an extension of the warrior into something beyond. White dragon claw at spear tip, gold constellation dragon outline, white armor. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, realistic dragon.
```

---

## V12 — 貂蝉 wave10 红色合同（6 张）

**红色合同**：深朱砂红、暖白罗衣、黑墨发丝、团扇、飘红绸。**禁用翡翠/青/蓝绿/霓虹绿。**

### 08 `foundation-red-v12-diao-falling-fan.png`
**绑定**：`diao_falling_fan`（落英扇 / 1费 Common 攻击：造成6伤，施加1层魅惑）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan releases her round fan in a downward throw — the fan spins as it falls, its circular edge trailing cinnabar-red petal blade marks as it descends. Each rotation leaves a red petal impression in the air, forming a falling spiral of crimson flower petals around the spinning fan. The fan itself is the weapon; the petals are the damage.
Diao Chan's hand is extended above in the releasing gesture, fingers open. The fan is shown at mid-descent, spinning, already trailing its petal arc. Her white sleeve trails upward from the release. Cinnabar-red petal blade spiral, spinning round fan in descent, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green. The fan is a weapon in this card, not a decoration.
```

---

### 09 `foundation-red-v12-diao-glance.png`
**绑定**：`diao_glance`（回眸 / 1费 Common：施加2层魅惑）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan turns her head over her shoulder in a single backward glance — the moment of the 回眸 (backward look). Her face is three-quarter profile, eyes meeting the viewer directly with calm, complete authority. From her gaze, faint cinnabar-red ripple rings expand outward like the aftershock of a stone dropped in still water. The rings are not water but charm energy radiating from the look itself.
Her white robe and red silk sash are slightly displaced from the turn. Her round fan is lowered at her side. The entire composition pivots on the single meeting of eyes. Cinnabar-red charm ripples from gaze point, white robe in mid-turn, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green. The charm effect should use red/cinnabar palette, not traditional teal.
```

---

### 10 `foundation-red-v12-diao-hongyan.png`
**绑定**：`diao_hongyan`（红颜 / 1费 Common 攻击：造成5伤，施加1层魅惑）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan stands in the center of the composition, her presence alone the weapon — her red silk ribbons extend outward in all directions like the petals of a fully opened flower. A faint flower shadow falls across her from above, as if she herself is the bloom. One hand holds her fan raised; the other arm is extended with a ribbon crossing through where a flower shadow intersects. The combination of red ribbons and the flower shadow creates the visual poem of 红颜 — beautiful face, inevitable consequence.
The composition is centered and symmetrical, with Diao Chan as the axis. Red silk ribbons as petals, ink-wash flower shadow, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green.
```

---

### 11 `foundation-red-v12-diao-red-ribbon.png`
**绑定**：`diao_red_ribbon`（红绫牵 / 1费 Uncommon：施加2层魅惑，若目标有魅惑则造成8伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan extends one arm, a long cinnabar-red ribbon extending from her wrist and crossing the composition — the ribbon end is loosely knotted around an invisible wrist, binding the unseen enemy to her. The ribbon is taut with tension: she is pulling, and the pull is absolute. The knot at the far end is the key detail — a cinnabar heart-knot, the traditional binding.
Her posture is gently commanding, not violent — this is control through silk, not force. Her expression is composed and certain. Round fan at her side, red ribbon stretching from wrist to the edge of the frame. Cinnabar-red ribbon with heart-knot binding, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green. Avoid violent imagery — the control is through beauty.
```

---

### 12 `foundation-red-v12-diao-sleeve-blade.png`
**绑定**：`diao_sleeve_blade`（袖中刃 / 0费 Common 攻击：造成4伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan's long white sleeve suddenly billows open to reveal a short blade emerging from within — the blade is already extended, the reveal already complete. The sleeve fabric flows around the blade like a flower opening to show its center. The blade catches cinnabar-red lamplight; its emergence was seamless, betraying nothing until the moment of contact.
Her expression shows no change from before the reveal — the same gentle composure. Her round fan is in the other hand, unchanged. The blade is the only evidence that anything happened. White sleeve opening around emerging blade, cinnabar-red blade light, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green. The blade should be subtle in size — this is a concealed weapon, not a sword.
```

---

### 13 `foundation-red-v12-diao-step-lotus.png`
**绑定**：`diao_step_lotus`（步步生莲 / 0费 Rare 技法：此回合闪避一次攻击）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan moves through the composition in a series of precisely placed steps — at each footfall position, a cinnabar-red lotus blossom blooms from the paper itself, petals opening in the ink-wash style. The step sequence is visible as a path of red lotuses, each one marking where she has been. She is shown mid-movement between two blossom points, her feet light above the paper.
The lotuses are not decorative but structural — they mark the path of an evasion that cannot be followed. Her white robe trails upward from the motion. Red silk sash winds between the lotus positions. Cinnabar-red lotus blooms at each step position, mid-movement figure above, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green. Avoid standard combat poses — this is evasion expressed as dance.
```

---

## V13 — 蔡文姬 wave10（8 张）

### 14 `foundation-v13-cai-broken-string.png`
**绑定**：`cai_broken_string`（断弦 / 1费 Common 攻击：造成7伤，施加1层噪音）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji's guqin has a string that snaps mid-play — the broken string recoils violently and cuts outward through the composition as a slicing force. The broken end flies toward the target with musical and physical violence simultaneously. The snap creates a jagged disruption in the sound-rings that had been expanding outward, now fractured into chaotic fragments.
Her expression holds the shock of a performer who has just discovered the weapon in her instrument. The broken string tip trails teal-jade energy that has turned dark and jagged at the break point. Musical violence: broken string flying outward, fractured sound rings, dark jade-teal fragments, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face. The aggression comes from broken music, not martial action.
```

---

### 15 `foundation-v13-cai-clean-string.png`
**绑定**：`cai_clean_string`（净弦 / 1费 Uncommon：净化1层噪音，获得1层余韵）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji carefully runs her finger along a single guqin string to clean and re-tune it — the motion is precise and tender. Where her finger passes, the string brightens from dull gray to jade-teal clarity. A small clean rain bead sits on the string at the point her finger has just passed, as if the string has been washed. The string vibrates with a pure, single note.
Her posture is bent slightly over the guqin, focused on the single string rather than the whole instrument. This is a maintenance act, not a performance. The rest of the strings are visible but darker — only this one has been cleaned. Single brightened string, jade-teal clarity glow, rain bead, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face.
```

---

### 16 `foundation-v13-cai-clear-tone.png`
**绑定**：`cai_clear_tone`（清音 / 1费 Common 攻击：造成6伤，若有余韵则多造成4伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji strikes a single clean note that crosses through bamboo — a pure jade-teal sound wave traveling horizontally through the composition, passing through a cluster of bamboo stalks without deflecting them, cutting through cleanly. The sound wave is clear and sharp, not spreading: a single focused tone rather than a ring. Where it passes through the bamboo, the bamboo sways but does not break.
The note's clarity is its force. Her playing posture is precise and minimalist — one focused pluck. Pale jade-teal focused sound blade through bamboo, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face.
```

---

### 17 `foundation-v13-cai-echoing-melody.png`
**绑定**：`cai_echoing_melody`（余韵 / 1费 Common：获得2层余韵）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
A sound ring from Cai Wenji's guqin expands outward — but as it does, it leaves a smaller echo ring behind at its origin point. The echo ring is quieter in color, a softer jade-teal than the main ring. As the main ring expands further, another echo appears, then another. The composition shows the main ring and two concentric echo rings, each slightly smaller and paler, the past notes refusing to fully fade.
No guqin or figure is needed — just the expanding ring and its trailing echoes. The rings should feel like memory: present and past simultaneously. Three concentric jade-teal sound rings of decreasing intensity, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, characters, weapons.
```

---

### 18 `foundation-v13-cai-five-tones-start.png`
**绑定**：`cai_five_tones_start`（五音初起 / 1费 Uncommon：激活五音序列，获得1层宫音）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji touches the first string of her guqin and five distinct seal-marks begin to awaken above the instrument — each one a different tone-glyph (宫商角徵羽), all five slowly illuminating in pale aged-gold as the first note resonates. Only the first (宫 Gong) is fully lit; the other four are dim outlines waiting to be activated. The sequence has begun.
Her expression holds the focused attention of someone who has started something that cannot be stopped. Her guqin floats slightly above the surface in the ink-wash style. Five gold tone-seal awakening sequence above guqin, first seal fully lit, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face, actual Chinese characters in the seals (use abstract glyph forms).
```

---

### 19 `foundation-v13-cai-listen-still.png`
**绑定**：`cai_listen_still`（静听 / 1费 Common 技法：护甲5，获得1层余韵）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji sits in stillness, her guqin resting untouched beside her — she is not playing but listening. Her head is slightly tilted toward a faint sound ripple that hangs in the air to one side of her. A single calm jade-teal sound ring is visible, very faint, at the periphery of the composition. She hears something others cannot.
Her posture is entirely still and receptive. No dramatic motion, no active playing. The composition is quiet — defined by what is absent. Seated still figure, single faint peripheral sound ring, calm warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face. Avoid any sense of action or combat — this is pure stillness.
```

---

### 20 `foundation-v13-cai-shang-tone.png`
**绑定**：`cai_shang_tone`（商音 / 1费 Common 攻击：造成8伤，若有余韵则追加1层易伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji strikes the second string with force — the 商 (Shang) tone rings out as a sharp, cutting sound blade. Unlike the gentle circular waves of her healing tones, the Shang tone is angular and aggressive: it travels as a narrow wedge-shaped arc, gold-edged and hard. The sound blade cuts across the composition diagonally, gold and sharp. This is the martial application of the Shang metal tone.
Her playing posture leans into the strike rather than releasing away from it — the force goes into the string and comes back out as a blade. Gold-edged angular Shang sound blade, aggressive diagonal, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face. The aggression is musical and angular, not martial.
```

---

### 21 `foundation-v13-cai-soul-ferry.png`
**绑定**：`cai_soul_ferry`（渡魂曲 / 2费 Rare：治愈8生命，净化所有噪音，获得3层余韵）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji plays a complete passage of profound guqin music — the sound rises as a luminous boat formed entirely of jade-gold sound waves, floating upward through the ink mist. The boat is not physical but musical: its hull is a curved sound wave, its sail a softer ripple. It carries something unseen upward, away from the dark mist below. This is music as a crossing — from suffering to peace, from noise to silence.
Her figure is below, still playing, anchoring the boat with her strings. The soul-boat rises above her in the upper composition. Jade-gold luminous music-boat rising through ink mist, figure below playing, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face, literal souls or ghosts.
```

---

## V14 — 诸葛亮 wave10 星阵合同（8 张）

**星阵合同**：暖旧宣纸、淡灰黑水墨、老金星线、白羽扇、古天文仪、八卦阵图、竹简、白色和哑蓝灰袍。

### 22 `foundation-star-v14-zhuge-deduction.png`
**绑定**：`zhuge_deduction`（推演 / 1费 Common：窥视牌堆顶3张，取1放回）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang studies a spread of bamboo slips arranged in a star-grid pattern before him — each slip carries a faint star-trail mark, and connecting lines between them form a deduction diagram. His feather fan is set aside; both hands are engaged in rearranging and reading the slips. His eyes trace a logical path between three specific slips, highlighting a chain of inference. The star-grid glows faintly with aged-gold constellation ink.
The composition should feel like thought made visible — a map of conclusions forming. Bamboo slip star-grid, aged-gold deduction lines, white and muted blue-gray robes. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, weapons, modern effects. The aged-gold should be restrained, not glowing.
```

---

### 23 `foundation-star-v14-zhuge-empty-city.png`
**绑定**：`zhuge_empty_city`（空城 / 1费 Common 技法：闪避本回合下次攻击）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang sits alone at the open gate of a city tower, playing his guqin with complete calm — his feather fan rests beside him, and far below in the ink-mist distance, the shapes of an approaching army are visible only as dark shadow suggestions. The city behind him is empty. He plays, unconcerned. His composure is the only defense.
The composition places him at the gate tower in the upper-middle, the distant army shadows in the far lower-middle ink mist. His white and muted blue-gray robes against the empty sky. Calm solitary figure at tower gate, distant army in mist, aged-gold guqin string glow, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, combat action, modern effects.
```

---

### 24 `foundation-star-v14-zhuge-fire-array.png`
**绑定**：`zhuge_fire_array`（火阵 / 1费 Common 攻击：对敌施加1层燃烧）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang holds his feather fan before a formation diagram burning over a paper map — the fire formation sigil glows in cinnabar-red and ember-gold as it ignites. The bagua-pattern formation is shown as a circular array of eight fire-positions marked with formation nodes, each beginning to glow. The feather fan seems to be conducting the fire's arrangement, not fighting it.
The fire is strategic, not wild — contained within the formation geometry. Cinnabar-red formation nodes on aged map, conducting feather fan, ember-gold fire diagram glow, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright neon, female face, weapons, wild uncontrolled fire. The fire is ordered by a formation.
```

---

### 25 `foundation-star-v14-zhuge-plan-set.png`
**绑定**：`zhuge_plan_set`（计定 / 1费 Uncommon：抽2张牌，弃1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang places a single chess piece (围棋 stone) onto a formation diagram with complete finality — the piece lands at the convergence point of several aged-gold strategy lines, and as it settles, a sealed scroll appears beside it as if the placement itself completed the plan. His expression is one of quiet conclusion: the calculation is done, the outcome already determined.
His feather fan is held loosely in his other hand — it is no longer needed. The chess piece is the only action required. Single placed stone at plan convergence point, sealed scroll appearing, finality expression, aged-gold strategy lines, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, weapons, modern effects.
```

---

### 26 `foundation-star-v14-zhuge-starfall.png`
**绑定**：`zhuge_starfall`（星落 / 3费 Rare 攻击：造成28伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang raises his feather fan to the sky and guides a falling star down through the composition — the star descends as a streak of aged-gold light along the fan's direction, growing brighter as it falls. The fan serves as a conductor's baton and the star obeys. Below the star's path, the air is compressed into rings of displaced gold ink. This is the decisive strike: a star made to fall.
His posture is raised, commanding, his full height extended into the gesture. The falling star occupies the upper-to-middle axis of the composition. Falling gold star streak guided by feather fan, compression rings below, conductor posture, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright neon, female face, modern sci-fi starfall. This is classical ink-wash astronomy weaponized.
```

---

### 27 `foundation-star-v14-zhuge-stone-array.png`
**绑定**：`zhuge_stone_array`（石阵 / 1费 Common 技法：护甲10）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang's stone formation array is shown as a circular arrangement of eight formation stones, each marked with an aged-gold bagua diagram node, connected by teal-gray formation lines. The stones themselves glow faintly with contained defensive energy. Above them, a single teal-jade ring seals the formation closed. Zhuge Liang's feather fan is at the center, the key that holds the formation stable.
The composition should feel like an impenetrable geometric defense — the beauty of pure defense expressed as architecture. Stone formation circle, bagua nodes, teal-jade sealing ring, feather fan at center, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, weapons, modern effects. No figure needed — just the formation.
```

---

### 28 `foundation-star-v14-zhuge-straw-boats.png`
**绑定**：`zhuge_straw_boats`（草船 / 2费 Uncommon：获得当前枪势×2的护甲）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang's straw boats drift through dense river mist — two dark grass-covered boat shapes visible in the ink mist, arrows beginning to thud into their straw exteriors. The boats are collecting the enemy's arrows intentionally. Far back in the mist, the vague shapes of the enemy shore are barely visible. The river is midnight-gray ink wash. Aged-gold star lines map the boat positions and trajectory.
The composition centers on the boats in the mist, arrows embedded in straw, the enemy arrows now Zhuge Liang's arrows. Dark river mist, straw boats with arrows, aged-gold trajectory lines, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, modern weapons. The arrows should be traditional fletched arrow design.
```

---

### 29 `foundation-star-v14-zhuge-wind-array.png`
**绑定**：`zhuge_wind_array`（风阵 / 1费 Common：施加1层风势，抽1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
Zhuge Liang fans his white feather fan in a slow circular sweep — the fan generates a wind formation spiral that rises in the upper composition, a clockwise vortex of pale gray-white wind lines centered on the fan's arc. The spiral is ordered and geometric: this is a controlled wind born from calculation, not weather. Aged-gold formation nodes mark the eight compass points around the spiral's edge.
His stance is deliberate and measured — one smooth fan-stroke, the full weight of the wind obeying. Wind formation spiral above feather fan, eight formation nodes at periphery, pale gray wind lines, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, female face, weapons, natural storm imagery. The wind is mathematical, not atmospheric.
```

---

## V15 — wave27 Phase D 混合（8 张）

### 30 `foundation-v15-cai-cleansing-rain.png`
**绑定**：`cai_cleansing_rain`（洗雨调 / 1费 Uncommon：净化2层负面，获得1层余韵）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Cai Wenji plays in the rain — soft rain falls across her guqin strings, and as it does, the rain and the guqin sound become indistinguishable. Sound rings and rain rings overlap and merge. Where the rain falls on the strings, the strings brighten and purify. The rain is the music and the music is the rain. Her robes are lightly touched by rain but she plays without stopping.
Her expression is serene acceptance — the rain is welcome, not an interruption. Rain falling across guqin strings, overlapping sound rings and rain rings, jade-teal brightening at contact points, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright red, warm orange, neon glow, male face.
```

---

### 31 `foundation-red-v15-diao-silk-snare.png`
**绑定**：`diao_silk_snare`（绫罗缚心 / 1费 Uncommon：施加2层魅惑，若目标有魅惑则追加易伤）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Diao Chan extends both hands forward, and between them a length of cinnabar-red silk is stretched taut — in the center of the silk, a complex knot is formed, a binding heart-knot that tightens when the silk is pulled. The silk traps the shape of an invisible heart between the knot's loops. The snare is already set; the victim does not yet know.
Her expression is gentle and precise — the craftsperson's focus of someone who has tied this knot a thousand times. Red silk ribbons, central cinnabar heart-knot, hands holding the trap open, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid jade, teal, cyan, blue-green, emerald, neon green.
```

---

### 32 `foundation-v15-zhao-cloud-pierce.png`
**绑定**：`zhao_cloud_pierce`（云龙穿阵 / 1费 Common 攻击：造成7伤，穿透护甲）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun drives his spear upward through a dense ink-cloud formation — the spear tip pierces through layers of dark cloud and the cloud separates around the penetrating point. A white dragon silhouette trails behind the spear's path through the cloud, formed by displaced cloud-ink. The cloud was supposed to be impenetrable; the spear disagrees.
The composition shows the spear entering from below and emerging at the top of the cloud layer, still moving. The dragon trace is the path of the pierce. Spear piercing cloud layer, white dragon trace of penetration, dark ink cloud parting, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor.
```

---

### 33 `foundation-v15-zhao-oath-guard.png`
**绑定**：`zhao_oath_guard`（白袍护誓 / 1费 Uncommon 技法：护甲10，若护主层数≥2则护甲翻倍）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with slight sepia tone.
Zhao Yun kneels briefly on one knee, his spear planted before him, his white cloak spreading around him like a vow made physical. This is not defeat — this is the posture of an oath: the white cloak becomes the seal of the promise, and his guard position with the spear is the defense that will not break. A faint teal ward energy rises from the cloak edges.
The composition should feel like a moment of absolute commitment — the oath and the guard as one gesture. White cloak spreading from kneeling position, planted spear, teal ward energy at cloak edges, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright teal, cyan, emerald, neon green, female face, modern armor. Avoid defeat — this is a vow, not a fall.
```

---

### 34 `foundation-star-v15-zhuge-bamboo-slips.png`
**绑定**：`zhuge_bamboo_slips`（简策 / 1费 Uncommon：获得当前策数×1护甲，抽1张牌）

```
Vertical 1024x1536 wuxia card illustration on warm aged xuan-paper with aged gold constellation lines.
A set of bamboo slips is spread open in a fan — the slips are marked with faint star-plot lines connecting dots across their surface, forming a continuous calculation map across the whole spread. Each slip carries a portion of a larger diagram; together they reveal a complete strategic picture. Aged-gold star trails connect the dots across the slip boundaries.
No figure needed — just the bamboo slip spread and its star-calculation lines. The composition should feel like intelligence made tangible: every slip is a thought, the whole spread is a strategy. Bamboo slip spread with star-grid calculation, aged-gold connection lines, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
No text, no UI, no frame, no watermark.
Avoid bright colors, characters, weapons, modern effects.
```

---

### 35 `foundation-v15-common-tashui.png`
**绑定**：`common_tashui`（踏水 / 0费 Common：若本回合已出过牌，护甲4）

```
Vertical 1024x1536 ink-wash card illustration on warm aged xuan-paper, no character.
A single foot steps onto the surface of dark ink-water — the surface dimples but does not break. Small concentric rings radiate outward from the contact point, ink-water displaced by a weight that the water somehow supports. The foot is bare and light. The ink-water surface is otherwise still. The step is impossibly gentle.
No figure above the ankle — just the single bare foot and the water's response. The contact point is centered in the composition. The rings are small and precise. Single bare foot on ink-water surface, small contact rings, dark ink-water, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
Delicate ink-wash. No text, no UI, no frame, no watermark.
Avoid bright colors, characters, weapons.
```

---

### 36 `foundation-v15-common-cangfeng.png`
**绑定**：`common_cangfeng`（藏锋 / 1费 Common：护甲7，若本回合未造成伤害则护甲12）

```
Vertical 1024x1536 ink-wash card illustration on warm aged xuan-paper, no character.
A short blade rests flat on a bed of teal-gray brush shadow strokes — the blade is completely still and clearly hidden within the visual noise of the shadow strokes, nearly invisible. But it is there. The blade is not concealed by a physical cover but by the ink shadows themselves; it blends with the brushwork until the eye adjusts.
The composition is subtle and quiet — the discovery of the concealed blade is the whole visual. Only those looking carefully will find it. Short blade concealed within teal brush shadow strokes, near-invisible, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
Delicate ink-wash. No text, no UI, no frame, no watermark.
Avoid bright colors, characters, faces.
```

---

### 37 `foundation-v15-mind-zhaoxin.png`
**绑定**：`mind_zhaoxin`（照心 / 1费 Rare 心境：进入照心，每回合抽1张额外牌）

```
Vertical 1024x1536 ink-wash card illustration on warm aged xuan-paper, mind card — no character, abstract mind state.
A circular mirror opens in the ink-wash mist — its surface is perfectly still and bright, reflecting not a scene but an inner light. Through the mirror's clear center, a single aged-gold light seam opens vertically, like a door of pure clarity cracking open in the darkness. The surrounding mist is dark gray; the mirror is the only source of light in the composition.
The composition should feel like the moment between confusion and understanding — the exact instant of mental clarity. A still mirror circle, central gold clarity seam opening, surrounding dark gray mist, warm paper. Upper-middle composition. Lower 28 percent clean crop-safe paper mist only.
Delicate ink-wash. No text, no UI, no frame, no watermark.
Avoid bright neon, characters, weapons. The gold must be aged and restrained, not glowing.
```

---

## 文件命名汇总

```
V11 赵云 wave10 (7张):
foundation-v11-zhao-guardian.png
foundation-v11-zhao-qixing-spear.png
foundation-v11-zhao-single-rider.png
foundation-v11-zhao-stable-formation.png
foundation-v11-zhao-sweep.png
foundation-v11-zhao-thrust.png
foundation-v11-zhao-white-dragon.png

V12 貂蝉 wave10 红色 (6张):
foundation-red-v12-diao-falling-fan.png
foundation-red-v12-diao-glance.png
foundation-red-v12-diao-hongyan.png
foundation-red-v12-diao-red-ribbon.png
foundation-red-v12-diao-sleeve-blade.png
foundation-red-v12-diao-step-lotus.png

V13 蔡文姬 wave10 (8张):
foundation-v13-cai-broken-string.png
foundation-v13-cai-clean-string.png
foundation-v13-cai-clear-tone.png
foundation-v13-cai-echoing-melody.png
foundation-v13-cai-five-tones-start.png
foundation-v13-cai-listen-still.png
foundation-v13-cai-shang-tone.png
foundation-v13-cai-soul-ferry.png

V14 诸葛亮 wave10 星阵 (8张):
foundation-star-v14-zhuge-deduction.png
foundation-star-v14-zhuge-empty-city.png
foundation-star-v14-zhuge-fire-array.png
foundation-star-v14-zhuge-plan-set.png
foundation-star-v14-zhuge-starfall.png
foundation-star-v14-zhuge-stone-array.png
foundation-star-v14-zhuge-straw-boats.png
foundation-star-v14-zhuge-wind-array.png

V15 wave27 Phase D 混合 (8张):
foundation-v15-cai-cleansing-rain.png
foundation-red-v15-diao-silk-snare.png
foundation-v15-zhao-cloud-pierce.png
foundation-v15-zhao-oath-guard.png
foundation-star-v15-zhuge-bamboo-slips.png
foundation-v15-common-tashui.png
foundation-v15-common-cangfeng.png
foundation-v15-mind-zhaoxin.png
```
