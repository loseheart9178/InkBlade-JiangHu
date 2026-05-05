# Wave 21 GPT Image 2 Starter And Common Card Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve Milestone 58 as a real bitmap art-quality pass by generating, preserving, cropping, binding, and verifying GPT Image 2 style card faces for the starter readability and common foundation card batches.

**Architecture:** Keep runtime art bindings data-driven through `src/game/content/visuals.ts` and existing card-art module imports. Preserve source sheets under `public/assets/generated/sources/`, crop deterministic runtime PNGs under `public/assets/generated/cards/`, and extend data tests so the new bitmap replacements cannot silently fall back to Wave 9/10 SVGs. The main thread owns built-in image generation because generated images enter the shared conversation context; workers can independently inspect queue targets and prepare code/test edits once source assets exist.

**Tech Stack:** Built-in `image_gen` image generation, local image cropping with bundled Python/Pillow or available workspace image tooling, TypeScript content manifests, Vitest data tests, Playwright desktop visual smoke, generated asset audit.

---

## Context And Constraints

Use the bundled Node runtime for verification commands:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/art/gpt2-priority-queue.md`
- `docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md`

Current Wave 20 baseline:

- Branch: `codex/wave20-release-gate-refresh`
- Latest integrated commit before planning: `56477fa docs: refresh wave20 release gate evidence`
- Runtime missing assets: 0
- Ink-pass debt: 0
- Card fallback debt: 0
- Milestone 58 remains optional because Wave 9/10 shipped semantic SVG readability art but not GPT Image 2 bitmap card faces for the starter/common batches.

Implementation rules:

- Do not replace or delete existing Wave 9/10 SVGs; add GPT Image 2 PNGs as non-destructive new runtime assets.
- Do not bind placeholder, copied fallback, or type-level art to pretend generation succeeded.
- Do not put Chinese or English text inside generated card art; card names remain DOM text.
- Keep images card-safe: clear central subject, readable silhouette at small card size, xuan paper texture, ink-wash style, no watermark.
- If built-in image generation fails or produces unusable files, stop the asset binding task and document the blocker instead of faking assets.

## Target Runtime Assets

Generate and bind these 20 card-art targets:

| Card art id | Runtime path |
|---|---|
| `zhao_strike` | `/assets/generated/cards/gpt2-wave21-zhao-strike.png` |
| `zhao_guard` | `/assets/generated/cards/gpt2-wave21-zhao-guard.png` |
| `zhao_longdan` | `/assets/generated/cards/gpt2-wave21-zhao-longdan.png` |
| `diao_strike` | `/assets/generated/cards/gpt2-wave21-diao-strike.png` |
| `diao_guard` | `/assets/generated/cards/gpt2-wave21-diao-guard.png` |
| `diao_lingbo` | `/assets/generated/cards/gpt2-wave21-diao-lingbo.png` |
| `cai_plain_strike` | `/assets/generated/cards/gpt2-wave21-cai-plain-strike.png` |
| `cai_pluck_string` | `/assets/generated/cards/gpt2-wave21-cai-pluck-string.png` |
| `cai_gong_tone` | `/assets/generated/cards/gpt2-wave21-cai-gong-tone.png` |
| `zhuge_fan_strike` | `/assets/generated/cards/gpt2-wave21-zhuge-fan-strike.png` |
| `zhuge_guard` | `/assets/generated/cards/gpt2-wave21-zhuge-guard.png` |
| `common_pifeng` | `/assets/generated/cards/gpt2-wave21-common-pifeng.png` |
| `common_duanzhu` | `/assets/generated/cards/gpt2-wave21-common-duanzhu.png` |
| `common_gedang` | `/assets/generated/cards/gpt2-wave21-common-gedang.png` |
| `common_xieli` | `/assets/generated/cards/gpt2-wave21-common-xieli.png` |
| `common_tuna` | `/assets/generated/cards/gpt2-wave21-common-tuna.png` |
| `common_qingshen` | `/assets/generated/cards/gpt2-wave21-common-qingshen.png` |
| `common_feishi` | `/assets/generated/cards/gpt2-wave21-common-feishi.png` |
| `common_zhuiying` | `/assets/generated/cards/gpt2-wave21-common-zhuiying.png` |
| `common_mirror_armor` | `/assets/generated/cards/gpt2-wave21-common-mirror-armor.png` |

Preserve the generated source sheet as:

```text
public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png
```

## Task 1: Planning Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave21-gpt2-starter-common-card-art.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Record planning entry**

Add a top `Documentation.md` entry:

```markdown
### 2026-05-05 15:55 Asia/Shanghai

Wave 21 GPT Image 2 Starter/Common Card Art planning started in `.worktrees/wave6-integration` on branch `codex/wave21-gpt2-card-art-plan`.

Docs read before planning:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/art/gpt2-priority-queue.md`
- `docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md`

Plan added:

- `docs/superpowers/plans/2026-05-05-wave21-gpt2-starter-common-card-art.md`

Scope:

- Generate one GPT Image 2 style source sheet for starter/common card art.
- Crop 20 runtime PNG card faces and bind them to existing card art ids.
- Preserve all source/runtime files and verify missing assets, fallback debt, visual smoke, tests, and build.

Next step:

- Commit the Wave 21 plan, then create independent queue-mapping and manifest/test worktrees.
```

- [ ] **Step 2: Verify**

```bash
grep -n "Wave 21 GPT Image 2" Documentation.md docs/superpowers/plans/2026-05-05-wave21-gpt2-starter-common-card-art.md
git diff --check
```

- [ ] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave21-gpt2-starter-common-card-art.md
git commit -m "docs: plan wave21 gpt2 card art"
```

## Task 2: Queue And Binding Map

**Files:**

- Modify: `docs/art/gpt2-priority-queue.md`
- Test/read: `public/assets/generated/gpt2-prompt-queue.json`
- Test/read: `src/game/content/visuals.ts`
- Test/read: `src/game/content/cardArt/*.ts`

- [ ] **Step 1: Confirm the target ids exist**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe -e "import('./src/game/content/visuals.ts').catch(()=>process.exit(0))"
```

If direct TS import is not available outside Vite/Vitest, inspect `src/game/content/visuals.ts` and `src/game/content/cardArt/*.ts` manually and confirm every target id appears exactly once in `cardArtList`.

- [ ] **Step 2: Update the art queue note**

In `docs/art/gpt2-priority-queue.md`, add a Wave 21 section before `Optional next GPT Image 2 art-quality batches`:

```markdown
Wave 21 execution scope:

- Starter/common bitmap sheet target count: 20.
- Source sheet: `public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png`.
- Runtime files: `public/assets/generated/cards/gpt2-wave21-*.png`.
- Existing Wave 9/10 SVG files remain preserved as fallback historical assets.
```

- [ ] **Step 3: Verify**

```bash
grep -n "Wave 21 execution scope\|gpt2-wave21" docs/art/gpt2-priority-queue.md
git diff --check
```

## Task 3: Generate Source Sheet And Crop Runtime PNGs

**Files:**

- Create: `public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png`
- Create: 20 files under `public/assets/generated/cards/gpt2-wave21-*.png`

- [ ] **Step 1: Generate source sheet with built-in image generation**

Use the built-in image generation tool with this prompt:

```text
Use case: stylized-concept
Asset type: 20-panel source sheet for browser game card art crops
Primary request: Create a clean 4 columns by 5 rows sheet of Chinese ink-wash wuxia roguelike card illustrations on xuan paper. Each panel is a separate card-face illustration with no text, no border labels, no numbers, no watermark, and generous spacing between panels for cropping. Premium hand-painted 2D ink-wash style, cinnabar red, teal, smoky black ink, pale gold accents, readable silhouettes at small card size.

Panel order, left to right, top to bottom:
1 Zhao Yun spear strike, young white-robed silver-armored spear warrior thrust, blue-white dragon tassel.
2 Zhao Yun guard, spear wall and white cloak shielding civilians in black rain.
3 Zhao Yun Longdan, white dragon spear aura breaking through ink soldiers.
4 Diao Chan fan strike, red-white dancer with folding fan and hidden sleeve blade.
5 Diao Chan guard, crimson ribbon screen and moonlit defensive dance.
6 Diao Chan Lingbo step, graceful dodge over rippling water and petals.
7 Cai Wenji plain strike, guqin string slash with teal sound wave.
8 Cai Wenji pluck string, calm musician plucking guqin, ink sound ripples.
9 Cai Wenji gong tone, resonant jade note and circular teal wave.
10 Zhuge Liang fan strike, feather fan sends ink wind and star chart cuts.
11 Zhuge Liang guard, bagua formation shield and moon-white robes.
12 Common Pifeng, generic Jianghu wind-cutting blade arc through bamboo.
13 Common Duanzhu, snapped bamboo strike with red splinters.
14 Common Gedang, crossed weapon block and paper shield.
15 Common Xieli, yielding force, redirected spear and flowing sleeve.
16 Common Tuna, breath regulation, quiet martial artist meditating with teal qi.
17 Common Qingshen, light-body footwork over water and leaves.
18 Common Feishi, thrown stone projectile through ink mist.
19 Common Zhuiying, chasing shadow step, afterimage lunge.
20 Common Mirror Armor, reflective bronze mirror armor deflecting ink slash.

Style constraints: Chinese ink-wash wuxia, xuan paper texture, roguelike card illustration, not photorealistic, not 3D, no anime screentone, no modern objects, no written characters, no UI frame, no text, no logo.
```

After generation, locate the newest generated image under `$CODEX_HOME/generated_images/` and copy it to:

```text
public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png
```

- [ ] **Step 2: Crop 20 equal panels**

Use local image tooling to crop the source sheet into a 4x5 grid. Runtime crop filenames must match the target table exactly.

If Pillow is available, use this one-off crop command from the repo root:

```bash
python3 - <<'PY'
from pathlib import Path
from PIL import Image

source = Path("public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png")
targets = [
  "gpt2-wave21-zhao-strike.png",
  "gpt2-wave21-zhao-guard.png",
  "gpt2-wave21-zhao-longdan.png",
  "gpt2-wave21-diao-strike.png",
  "gpt2-wave21-diao-guard.png",
  "gpt2-wave21-diao-lingbo.png",
  "gpt2-wave21-cai-plain-strike.png",
  "gpt2-wave21-cai-pluck-string.png",
  "gpt2-wave21-cai-gong-tone.png",
  "gpt2-wave21-zhuge-fan-strike.png",
  "gpt2-wave21-zhuge-guard.png",
  "gpt2-wave21-common-pifeng.png",
  "gpt2-wave21-common-duanzhu.png",
  "gpt2-wave21-common-gedang.png",
  "gpt2-wave21-common-xieli.png",
  "gpt2-wave21-common-tuna.png",
  "gpt2-wave21-common-qingshen.png",
  "gpt2-wave21-common-feishi.png",
  "gpt2-wave21-common-zhuiying.png",
  "gpt2-wave21-common-mirror-armor.png",
]
out_dir = Path("public/assets/generated/cards")
image = Image.open(source).convert("RGB")
width, height = image.size
cell_w, cell_h = width // 4, height // 5
for index, name in enumerate(targets):
  col = index % 4
  row = index // 4
  crop = image.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
  crop.save(out_dir / name)
PY
```

- [ ] **Step 3: Verify files**

```bash
test -s public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png
for file in public/assets/generated/cards/gpt2-wave21-*.png; do test -s "$file"; done
find public/assets/generated/cards -maxdepth 1 -name 'gpt2-wave21-*.png' | wc -l
```

Expected: 20 runtime PNG files.

## Task 4: Bind Runtime Art And Tests

**Files:**

- Modify: `src/game/content/visuals.ts`
- Create or modify: `tests/data/wave21-gpt2-card-art.test.ts`
- Modify: `tests/data/content.test.ts` only if shared helpers need a Wave 21 assertion

- [ ] **Step 1: Bind Wave 21 PNGs before imported Wave 10 card art**

In `src/game/content/visuals.ts`, replace the target ids' existing `assetPath` values with the new `gpt2-wave21-*.png` runtime paths. For ids imported from `wave10CommonCardArt`, update that module instead of duplicating ids in `cardArtList`.

- [ ] **Step 2: Add regression test**

Create `tests/data/wave21-gpt2-card-art.test.ts`:

```ts
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cardArtById } from "../../src/game/content/visuals";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const wave21Targets: Record<string, string> = {
  zhao_strike: "/assets/generated/cards/gpt2-wave21-zhao-strike.png",
  zhao_guard: "/assets/generated/cards/gpt2-wave21-zhao-guard.png",
  zhao_longdan: "/assets/generated/cards/gpt2-wave21-zhao-longdan.png",
  diao_strike: "/assets/generated/cards/gpt2-wave21-diao-strike.png",
  diao_guard: "/assets/generated/cards/gpt2-wave21-diao-guard.png",
  diao_lingbo: "/assets/generated/cards/gpt2-wave21-diao-lingbo.png",
  cai_plain_strike: "/assets/generated/cards/gpt2-wave21-cai-plain-strike.png",
  cai_pluck_string: "/assets/generated/cards/gpt2-wave21-cai-pluck-string.png",
  cai_gong_tone: "/assets/generated/cards/gpt2-wave21-cai-gong-tone.png",
  zhuge_fan_strike: "/assets/generated/cards/gpt2-wave21-zhuge-fan-strike.png",
  zhuge_guard: "/assets/generated/cards/gpt2-wave21-zhuge-guard.png",
  common_pifeng: "/assets/generated/cards/gpt2-wave21-common-pifeng.png",
  common_duanzhu: "/assets/generated/cards/gpt2-wave21-common-duanzhu.png",
  common_gedang: "/assets/generated/cards/gpt2-wave21-common-gedang.png",
  common_xieli: "/assets/generated/cards/gpt2-wave21-common-xieli.png",
  common_tuna: "/assets/generated/cards/gpt2-wave21-common-tuna.png",
  common_qingshen: "/assets/generated/cards/gpt2-wave21-common-qingshen.png",
  common_feishi: "/assets/generated/cards/gpt2-wave21-common-feishi.png",
  common_zhuiying: "/assets/generated/cards/gpt2-wave21-common-zhuiying.png",
  common_mirror_armor: "/assets/generated/cards/gpt2-wave21-common-mirror-armor.png"
};

describe("Wave 21 GPT Image 2 starter/common card art batch", () => {
  it("binds starter and common foundation cards to generated bitmap runtime assets", () => {
    for (const [id, assetPath] of Object.entries(wave21Targets)) {
      expect(cardArtById[id]?.assetPath, id).toBe(assetPath);
      expect(assetPath.endsWith(".png"), id).toBe(true);
      expect(existsSync(join(repoRoot, "public", assetPath))).toBe(true);
    }
  });

  it("preserves the generated source sheet", () => {
    expect(existsSync(join(repoRoot, "public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png"))).toBe(true);
  });
});
```

- [ ] **Step 3: Verify focused data tests**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave21-gpt2-card-art.test.ts tests/data/content.test.ts --reporter=dot
```

## Task 5: Audit, Visual Smoke, Docs, Commit

**Files:**

- Modify: `public/assets/generated/asset-audit.json`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Run asset audit**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

Expected:

- `missing: 0`
- `ink-pass debt: 0`
- `card fallback debt: 0`
- Runtime reference count increases by the new source/runtime references that are actually bound.

- [ ] **Step 2: Run browser visual smoke**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
```

Expected: pass. Manually inspect any attached screenshots if the art appears cropped incorrectly.

- [ ] **Step 3: Run broad verification**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

- [ ] **Step 4: Update Documentation**

Record:

- Docs read.
- Image generation mode used.
- Source sheet path.
- Runtime PNG paths.
- Tests and audit results.
- Any visual quality risks.
- Next milestone.

- [ ] **Step 5: Commit**

```bash
git add public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png public/assets/generated/cards/gpt2-wave21-*.png public/assets/generated/asset-audit.json src/game/content/visuals.ts src/game/content/cardArt/*.ts tests/data/wave21-gpt2-card-art.test.ts docs/art/gpt2-priority-queue.md Documentation.md
git commit -m "feat: add wave21 gpt2 card art batch"
```
