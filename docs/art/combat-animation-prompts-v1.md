# 《云水江湖》角色专属战斗动效与特效美术资产需求清单 (v1.0)

> **文档说明**：
> 本文档包含了为提升《云水江湖》战斗沉浸感所需的美术资产提示词（Prompts）。
> 资产分为**角色序列帧（Sprite Sheets）**和**水墨视觉特效（VFX）**两大类。
> 请使用 Midjourney (V6)、DALL-E 3 或 Stable Diffusion 等 AI 工具生成。为了方便后期在 Phaser 中制作序列帧或粒子特效，所有提示词均已加入 `transparent background, clean edge, sprite sheet style` 等要求。

---

## 1. 角色专属序列帧动效 (Character Sprite Sheets)

**通用提示词后缀 (适用于所有角色动画)：**
`traditional Chinese ink wash painting style, wuxia, 2D game sprite sheet, side view, flat colors, clean edges, transparent background, solid white background, high contrast, dynamic pose --ar 16:9`

### 1.1 赵云 (ZHAOYUN) - 枪客
*   **待机 (Idle)**
    *   **Prompt**: `A 2D game sprite sheet of a handsome ancient Chinese warrior in silver and dark blue armor, white cape. He is in a low, stable martial arts stance, holding a long spear diagonally downwards. The cape and red spear tassel are gently fluttering in the wind. Ink wash painting style, sequence frames.`
*   **受击 (Hit)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese warrior in silver armor recoiling slightly from a hit. He takes a half step back, upper body leaning back to absorb the impact, but his eyes are sharp and focused. The red tassel on his spear shakes violently. Ink wash painting style, sequence frames.`
*   **技能/防反 (Skill/Block)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese warrior in silver armor performing a defensive spear spin. He spins the spear rapidly with one hand, ending by striking the ground with the spear butt. Faint silver dragon scale aura around him. Ink wash painting style, sequence frames.`

### 1.2 貂蝉 (DIAOCHAN) - 舞者
*   **待机 (Idle)**
    *   **Prompt**: `A 2D game sprite sheet of an elegant ancient Chinese female dancer in red and white flowing robes. She is standing sideways, holding a folding fan half-covering her face, with long water sleeves drooping naturally. Gentle, breathing-like rhythmic movement. Ink wash painting style, sequence frames.`
*   **受击 (Hit)**
    *   **Prompt**: `A 2D game sprite sheet of an elegant Chinese female dancer in red robes being hit. She spins gracefully half a turn to absorb the force, her long red silk sleeves trailing chaotically in the air like a ribbon, landing elegantly. Ink wash painting style, sequence frames.`
*   **技能/魅惑 (Skill/Charm)**
    *   **Prompt**: `A 2D game sprite sheet of an elegant Chinese female dancer in red robes performing a charming spin. She tosses her fan slightly or spins in place, surrounded by faint pink and black ink flower petals and aura. Ink wash painting style, sequence frames.`

### 1.3 诸葛亮 (ZHUGELIANG) - 谋士
*   **待机 (Idle)**
    *   **Prompt**: `A 2D game sprite sheet of a calm ancient Chinese strategist in loose light blue and grey robes. He stands tall with one hand behind his back, gently waving a feather fan with the other. He looks slightly upwards. A faint Bagua star chart pattern glows under his feet. Ink wash painting style, sequence frames.`
*   **受击 (Hit)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese strategist in loose robes receiving a hit. His body barely moves, but a glowing ink-wash Bagua shield appears instantly in front of him to block the attack. He slightly frowns. Ink wash painting style, sequence frames.`
*   **技能/观星 (Skill/Magic)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese strategist casting a spell. He throws his feather fan into the air where it floats, hands forming a mudra seal. The Bagua star chart under his feet glows brightly, and starlight descends upon him. Ink wash painting style, sequence frames.`

### 1.4 蔡文姬 (CAIWENJI) - 琴师
*   **待机 (Idle)**
    *   **Prompt**: `A 2D game sprite sheet of a serene ancient Chinese female musician in pale green and white Hanfu. She is sitting (or hovering low) with an ancient Guqin zither floating in front of her. Her hands hover over the strings, eyes closed. Faint cyan musical notes and ink ripples slowly expand from her. Ink wash painting style, sequence frames.`
*   **受击 (Hit)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese female musician being disrupted. The strings of her Guqin vibrate violently, creating distorted visual sound waves. She leans forward slightly, hands quickly pressing on the strings to silence the noise. Ink wash painting style, sequence frames.`
*   **技能/清心 (Skill/Heal)**
    *   **Prompt**: `A 2D game sprite sheet of a Chinese female musician playing the Guqin rapidly. Her fingers pluck the strings with glowing light. Soft, healing pale-moon-white ripples of light and ink wash expand outwards from the zither. Ink wash painting style, sequence frames.`

---

## 2. 战斗UI与环境水墨特效 (Combat UI & Environment VFX)

**通用提示词后缀 (适用于特效)：**
`isolated on solid black background, pure black background, VFX asset for games, highly detailed, high contrast` (特效资产建议在纯黑背景上生成，方便在引擎中使用 Additive 或 Screen 混合模式直接叠加，或后期提取 Alpha 通道)。

### 2.1 基础攻击与命中拖尾 (Attack Trails & Hit FX)
*   **赵云 - 枪影拖尾 (Spear Thrust Trail)**
    *   **Prompt**: `A sharp, straight thrusting motion trail made of dark blue and silver ink wash splatters. Resembles a spear strike piercing through the air, aggressive and fast. VFX asset, isolated on solid black background.`
*   **貂蝉 - 袖刃/扇击划痕 (Fan/Sleeve Slash)**
    *   **Prompt**: `A crescent-shaped, elegant but deadly slash effect made of crimson red and black ink wash. Looks like a ribbon or a sharp fan blade cutting through the air. VFX asset, isolated on solid black background.`
*   **通用 - 重击顿帧墨迹 (Heavy Hit Ink Splatter)**
    *   **Prompt**: `A violent, explosive burst of thick black ink splatter. High impact, dynamic outward spread, like a heavy brush stroke hitting paper. VFX asset for a heavy attack impact, isolated on solid black background.`

### 2.2 技能与状态特效 (Skill & Status VFX)
*   **诸葛亮 - 八卦阵纹 (Bagua Star Array)**
    *   **Prompt**: `A glowing, intricate Bagua (Eight Trigrams) and ancient Chinese star chart magic circle. Drawn in ethereal light blue and pale gold ink wash lines. Flat top-down view, meant to be placed on the ground. VFX asset, isolated on solid black background.`
*   **蔡文姬 - 治愈音波 (Healing Sound Wave)**
    *   **Prompt**: `Gentle, expanding circular ripples made of pale green and white ink wash and stylized ancient Chinese musical notes. Soft, ethereal, and healing vibe. VFX asset, isolated on solid black background.`
*   **濒死状态边缘墨染 (Low HP Screen Vignette)**
    *   **Prompt**: `A screen vignette frame effect. The edges are covered in chaotic, creeping dark red and black ink wash stains, leaving the center clear. Intense, dangerous feeling. VFX asset, isolated on solid white background.` (这个建议白底方便抠图取反)

### 2.3 UI 交互特效 (UI Interaction FX)
*   **卡牌打出消散特效 (Card Play Dissolve)**
    *   **Prompt**: `A transition effect showing thick black ink rapidly spreading and dissolving a rectangular shape into flying ink droplets and smoke. Magic spell casting vibe. VFX asset, isolated on solid white background.`
*   **终结击杀横劈 (Fatal Strike Screen Cut)**
    *   **Prompt**: `A single, massive, horizontal brush stroke of thick black ink slashing across the screen. Rough edges, high speed, extremely dramatic and contrasting. VFX asset, isolated on solid white background.`