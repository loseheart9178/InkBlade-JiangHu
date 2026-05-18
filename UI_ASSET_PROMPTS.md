# 《云水江湖》第二批前端 UI 美术资产生成需求 (Prompt 列表)

基于我们之前达成的“暗黑水墨/硬核武侠”风格（偏向厚重、实体化、沉浸式），除了你已经生成的“顶部血条框、能量球、卡牌边框”外，为了完成全局 UI 的彻底重构，我们还需要以下核心资产。

请使用 Midjourney (V6)、DALL-E 3 或 Stable Diffusion 等 AI 工具生成。为了方便后期抠图应用，提示词中均加入了 `transparent background`（透明背景）或明确的视口要求。

---

## 1. 核心面板与按钮 (Core Panels & Buttons)

### 1.1 全局模态框底板 (Panel/Modal Background)
用于商店、结算、设置面板的底板，替代现有的 CSS 半透明矩形。
> **Prompt:** A highly detailed 2D game UI panel background for a dark fantasy wuxia game. Aged, weathered dark parchment paper framed by intricate dark bronze filigree. Subtle ink wash stains on the paper. Flat front view, transparent background, UI kit asset, dark moody aesthetic, masterpiece. --ar 16:9

### 1.2 通用按钮边框 (Generic Button Frame)
用于“确认”、“购买”、“休整”等操作按钮，要有实体材质的按压感。
> **Prompt:** A 2D game UI generic button design for a dark fantasy oriental game. Rectangular shape with rounded corners. Dark jade texture in the center, wrapped by detailed weathered dark bronze borders. UI asset, transparent background, clean edges, masterpiece. --ar 3:1

---

## 2. 战斗内补充资产 (Combat Elements)

### 2.1 敌人意图图标集 (Enemy Intent Icons)
替代现有的纯文字意图（如“攻击”、“防御”、“蓄力”），需要极具视觉冲击力的大图标。
> **Prompt:** A set of 2D game UI icons for a wuxia combat game. Dark fantasy style. Icons including a bloody curved blade (attack), a heavy iron shield (defend), and a glowing mystical eye (buff/debuff). Thick lines, high contrast, painted with dark ink and cinnabar red. Transparent background, UI kit, masterpiece. --ar 16:9

### 2.2 状态/Buff 图标底座 (Status Icon Base)
用于垫在“破绽”、“流血”等极小状态图标下方的金属小底座。
> **Prompt:** A small 2D game UI circular icon base for status effects. Dark tarnished bronze ring with detailed oriental engravings. Empty dark center. UI asset, dark fantasy wuxia theme, transparent background. --ar 1:1

---

## 3. 地图与商店资产 (Map & Shop)

### 3.1 货币图标：古铜钱 (Currency Icon: Bronze Coin)
用于顶部状态栏和商店界面的核心货币标志，要有厚重的金属质感。
> **Prompt:** A highly detailed 2D game icon of a single ancient Chinese copper coin with a square hole in the middle. Tarnished dark bronze texture, glowing slightly with a subtle golden aura. Dark fantasy wuxia style, UI asset, transparent background, flat front view. --ar 1:1

### 3.2 路线地图卷轴底图 (Map Route Scroll Background)
替代目前扁平的地图网格背景，采用真实的卷轴质感。
> **Prompt:** A 2D game UI background showing a fully unrolled ancient bamboo and parchment scroll. Worn edges, subtle landscape ink wash painting faded into the paper texture. Dark moody lighting, wuxia theme, flat top-down view, masterpiece. --ar 16:9

### 3.3 地图节点徽章 (Map Node Icons)
路线图上的遭遇点（普通战斗、精英、商店、篝火）。
> **Prompt:** A 2D game UI icon set for a dark fantasy wuxia map. Icons for: crossed swords (battle), a menacing demon mask (boss), a traditional tea pavilion (shop), a campfire (rest). Designed as dark bronze and jade medallions. UI kit, transparent background. --ar 16:9

---

## 4. 前端动效所需序列帧/特效切图 (VFX for Juiciness)

如果我们在前端要引入特效动画（例如卡牌打出时的水墨炸裂、删牌时的焚烧），使用 CSS 配合序列帧图（Sprite Sheet）或单张特效图是最好的。

### 4.1 水墨飞溅特效 (Ink Splash VFX)
用于攻击命中或打出重型卡牌时的屏幕视觉冲击。
> **Prompt:** A dynamic VFX 2D game asset of a fierce black ink splash exploding outwards, with subtle crimson red edges. Dark fantasy wuxia action effect, high contrast, solid white background (for blend modes), cinematic masterpiece. --ar 1:1

### 4.2 焚毁/消散特效 (Burn/Dissolve VFX)
用于商店“删牌”或法宝消耗时的仪式感动效。
> **Prompt:** A dynamic VFX 2D game asset showing dark mystical smoke and embers dispersing into the air. Dark fantasy aesthetic, ink-wash and fire blend. Solid black background (for screen blend mode), UI effect. --ar 1:1

---

**下一步说明：**
你可以将上述你觉得需要的提示词发给 AI 进行生成。生成完成后，可以挑出满意的图片放到项目的 `public/assets/generated/ui/` 对应目录下。
等你通知我资产全部就绪后，我将直接开始大幅重构 DOM 结构、拆除原有的 CSS 渐变底板，并全面接入这些新的美术切图和动效体系！