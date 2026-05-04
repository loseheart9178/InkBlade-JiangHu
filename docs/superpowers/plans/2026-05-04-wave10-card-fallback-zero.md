# Wave 10 Card Fallback Zero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all remaining 45 runtime card-art fallback bindings with semantic repo-local SVG card faces and verify `cardFallbackDebt` reaches 0.

**Architecture:** Worker branches create isolated Wave 10 card-art modules and SVG assets without editing the shared visual manifest. The integration branch imports those modules into `src/game/content/visuals.ts`, adds one debt-zero content test, refreshes the asset audit ledger, and updates release docs. Renderer behavior stays unchanged: DOM card surfaces continue reading `cardArtById`.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, repo-local SVG assets, existing `scripts/audit-generated-assets.mjs`.

---

## Context And Constraints

Use the bundled Node runtime in every worktree:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/art/gpt2-priority-queue.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`

Current Wave 9 baseline:

- Branch: `codex/wave9-polish-balance-art`
- Runtime references: 115
- Missing files: 0
- `ink-pass` debt: 0
- `cardFallbackDebt`: 45
- Playwright desktop target: Chromium desktop only

Asset rules:

- Use SVG under `public/assets/generated/cards/`.
- Use `viewBox="0 0 640 900"` and no visible `<text>` labels.
- Prefer ink-wash forms, paper texture, brush strokes, symbolic props, and existing red/teal/gold/ink accent language.
- Do not touch renderer code.
- Do not bind a new card to `type_attack`, `type_skill`, `type_body`, `type_ink`, or `type_mind`.
- Keep new worker write sets disjoint until integration.

## Target Groups

### Group A: Common, Ink, Mind, Status Cards

Create `src/game/content/cardArt/wave10CommonCardArt.ts`, `tests/data/wave10-common-card-art.test.ts`, and these 16 SVGs:

| id | filename | accent | visual motif |
|---|---|---|---|
| `common_duanzhu` | `wave10-common-duanzhu.svg` | red | snapped bamboo blade and falling splinters |
| `common_feishi` | `wave10-common-feishi.svg` | red | thrown stone cutting through rain rings |
| `common_gedang` | `wave10-common-gedang.svg` | teal | crossed guard strokes and shield wash |
| `common_mirror_armor` | `wave10-common-mirror-armor.svg` | teal | cracked bronze mirror armor reflecting ink |
| `common_pifeng` | `wave10-common-pifeng.svg` | red | wind-cleaving sword arc |
| `common_qingshen` | `wave10-common-qingshen.svg` | teal | light-foot step over rippled paper |
| `common_tuna` | `wave10-common-tuna.svg` | teal | breath circle, dantian glow, calm ink |
| `common_xieli` | `wave10-common-xieli.svg` | teal | redirected force curve and broken arrow |
| `common_zhuiying` | `wave10-common-zhuiying.svg` | teal | afterimage footwork shadow |
| `ink_heiyu` | `wave10-ink-heiyu.svg` | ink | black rain entering dream mist |
| `ink_modian` | `wave10-ink-modian.svg` | ink | spreading ink dot and corrupted paper |
| `ink_moren` | `wave10-ink-moren.svg` | ink | black blade from pooled ink |
| `mind_jingxin` | `wave10-mind-jingxin.svg` | teal | still heart, clear water ring |
| `mind_luanxin` | `wave10-mind-luanxin.svg` | ink | tangled heart line and unstable brushwork |
| `mind_nuzhan` | `wave10-mind-nuzhan.svg` | red | anger slash with rising cinnabar |
| `status_rain_chill` | `wave10-status-rain-chill.svg` | ink | cold rain needles and frost ink |

### Group B: Zhao Yun And Diao Chan Character Cards

Create `src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts`, `tests/data/wave10-zhao-diao-card-art.test.ts`, and these 13 SVGs:

| id | filename | accent | visual motif |
|---|---|---|---|
| `zhao_guardian` | `wave10-zhao-guardian.svg` | teal | spear guard sheltering white cloak |
| `zhao_qixing_spear` | `wave10-zhao-qixing-spear.svg` | gold | seven star spear afterimages |
| `zhao_single_rider` | `wave10-zhao-single-rider.svg` | gold | lone rider breaking through ink banners |
| `zhao_stable_formation` | `wave10-zhao-stable-formation.svg` | teal | steady spear square and shielded stance |
| `zhao_sweep` | `wave10-zhao-sweep.svg` | red | horizontal spear sweep and dust arc |
| `zhao_thrust` | `wave10-zhao-thrust.svg` | red | straight spear thrust through rain |
| `zhao_white_dragon` | `wave10-zhao-white-dragon.svg` | gold | white dragon claw around spear point |
| `diao_falling_fan` | `wave10-diao-falling-fan.svg` | red | falling fan with petal blade trail |
| `diao_glance` | `wave10-diao-glance.svg` | teal | moonlit eye reflection and charm ripple |
| `diao_hongyan` | `wave10-diao-hongyan.svg` | red | red ribbon blade and flower shadow |
| `diao_red_ribbon` | `wave10-diao-red-ribbon.svg` | red | crimson ribbon knot pulling enemy intent |
| `diao_sleeve_blade` | `wave10-diao-sleeve-blade.svg` | red | hidden sleeve blade emerging from silk |
| `diao_step_lotus` | `wave10-diao-step-lotus.svg` | teal | lotus footwork and dodge crescent |

### Group C: Cai Wenji And Zhuge Liang Character Cards

Create `src/game/content/cardArt/wave10CaiZhugeCardArt.ts`, `tests/data/wave10-cai-zhuge-card-art.test.ts`, and these 16 SVGs:

| id | filename | accent | visual motif |
|---|---|---|---|
| `cai_broken_string` | `wave10-cai-broken-string.svg` | teal | broken qin string slicing outward |
| `cai_clean_string` | `wave10-cai-clean-string.svg` | teal | cleansed string and clear rain bead |
| `cai_clear_tone` | `wave10-cai-clear-tone.svg` | teal | clear note wave over bamboo |
| `cai_echoing_melody` | `wave10-cai-echoing-melody.svg` | teal | repeating guqin wave rings |
| `cai_five_tones_start` | `wave10-cai-five-tones-start.svg` | gold | five tone seals awakening over guqin |
| `cai_listen_still` | `wave10-cai-listen-still.svg` | teal | listening silhouette and still sound ripple |
| `cai_shang_tone` | `wave10-cai-shang-tone.svg` | gold | sharp Shang-tone chord line |
| `cai_soul_ferry` | `wave10-cai-soul-ferry.svg` | gold | soul boat carried by qin waves |
| `zhuge_deduction` | `wave10-zhuge-deduction.svg` | teal | bamboo slips, star calculation, grid lines |
| `zhuge_empty_city` | `wave10-zhuge-empty-city.svg` | teal | empty gate, calm fan, distant enemy shadows |
| `zhuge_fire_array` | `wave10-zhuge-fire-array.svg` | red | fire formation sigil on paper map |
| `zhuge_plan_set` | `wave10-zhuge-plan-set.svg` | gold | placed chess piece, sealed plan scroll |
| `zhuge_starfall` | `wave10-zhuge-starfall.svg` | gold | falling stars and fan-guided strike |
| `zhuge_stone_array` | `wave10-zhuge-stone-array.svg` | teal | stone formation wall and bagua ring |
| `zhuge_straw_boats` | `wave10-zhuge-straw-boats.svg` | teal | straw boats borrowing arrows in mist |
| `zhuge_wind_array` | `wave10-zhuge-wind-array.svg` | teal | wind formation spiral and feather fan |

## Task 1: Common, Ink, Mind, Status Card-Art Module

**Files:**

- Create: `src/game/content/cardArt/wave10CommonCardArt.ts`
- Create: `tests/data/wave10-common-card-art.test.ts`
- Create: 16 SVG files listed in Group A
- Do not modify: `src/game/content/visuals.ts`
- Do not modify: `public/assets/generated/asset-audit.json`

- [ ] **Step 1: Write the failing module test**

Create `tests/data/wave10-common-card-art.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wave10CommonCardArt } from "../../src/game/content/cardArt/wave10CommonCardArt";

const expectedIds = [
  "common_duanzhu",
  "common_feishi",
  "common_gedang",
  "common_mirror_armor",
  "common_pifeng",
  "common_qingshen",
  "common_tuna",
  "common_xieli",
  "common_zhuiying",
  "ink_heiyu",
  "ink_modian",
  "ink_moren",
  "mind_jingxin",
  "mind_luanxin",
  "mind_nuzhan",
  "status_rain_chill"
];

describe("Wave 10 common card art batch", () => {
  it("defines semantic art and concrete SVG files for every common fallback target", () => {
    expect(wave10CommonCardArt.map((art) => art.id)).toEqual(expectedIds);
    for (const art of wave10CommonCardArt) {
      expect(art.assetPath).toMatch(/^\/assets\/generated\/cards\/wave10-.+\.svg$/);
      expect(art.alt.length).toBeGreaterThan(12);
      expect(["red", "teal", "ink", "gold"]).toContain(art.accent);
      const filePath = path.join(process.cwd(), "public", art.assetPath.replace(/^\//, ""));
      const svg = fs.readFileSync(filePath, "utf8");
      expect(svg).toContain("<svg");
      expect(svg).toContain('viewBox="0 0 640 900"');
      expect(svg).not.toMatch(/<text\b/i);
    }
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-common-card-art.test.ts
```

Expected: fails because `src/game/content/cardArt/wave10CommonCardArt.ts` does not exist.

- [ ] **Step 3: Create the module and SVGs**

Create `src/game/content/cardArt/wave10CommonCardArt.ts` exporting `wave10CommonCardArt`. Each entry must use the exact ids and filenames from Group A and `import type { CardArtDefinition } from "../visuals";`.

SVG implementation requirements:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 900" role="img" aria-labelledby="title desc">
  <title>Semantic card art title matching the card</title>
  <desc>Short motif description with no visible text rendered.</desc>
  <rect width="640" height="900" rx="34" fill="#f7f0df"/>
  <!-- Use gradients, paths, circles, and brush-like strokes only. No <text>. -->
</svg>
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-common-card-art.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: module test passes, TypeScript passes, diff check passes.

- [ ] **Step 5: Update `Documentation.md` and commit**

Add a Wave 10 Task 1 entry with docs read, RED result, GREEN verification, files created, and next step.

Commit:

```bash
git add Documentation.md src/game/content/cardArt/wave10CommonCardArt.ts tests/data/wave10-common-card-art.test.ts public/assets/generated/cards/wave10-common-*.svg public/assets/generated/cards/wave10-ink-*.svg public/assets/generated/cards/wave10-mind-*.svg public/assets/generated/cards/wave10-status-rain-chill.svg
git commit -m "feat: add wave10 common card art module"
```

## Task 2: Zhao Yun And Diao Chan Card-Art Module

**Files:**

- Create: `src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts`
- Create: `tests/data/wave10-zhao-diao-card-art.test.ts`
- Create: 13 SVG files listed in Group B
- Do not modify: `src/game/content/visuals.ts`
- Do not modify: `public/assets/generated/asset-audit.json`

- [ ] **Step 1: Write the failing module test**

Create `tests/data/wave10-zhao-diao-card-art.test.ts` using the same file-existence structure as Task 1 with this `expectedIds` list:

```ts
const expectedIds = [
  "zhao_guardian",
  "zhao_qixing_spear",
  "zhao_single_rider",
  "zhao_stable_formation",
  "zhao_sweep",
  "zhao_thrust",
  "zhao_white_dragon",
  "diao_falling_fan",
  "diao_glance",
  "diao_hongyan",
  "diao_red_ribbon",
  "diao_sleeve_blade",
  "diao_step_lotus"
];
```

The test imports `wave10ZhaoDiaoCardArt` from `../../src/game/content/cardArt/wave10ZhaoDiaoCardArt` and asserts ids, SVG paths, non-empty alt text, valid accents, file existence, `viewBox="0 0 640 900"`, and no visible `<text>`.

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-zhao-diao-card-art.test.ts
```

Expected: fails because `src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts` does not exist.

- [ ] **Step 3: Create the module and SVGs**

Create `src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts` exporting `wave10ZhaoDiaoCardArt`. Use exact ids and filenames from Group B. Zhao Yun cards should emphasize spear, white dragon, stable guard, and battlefield movement. Diao Chan cards should emphasize red silk, fan, hidden blade, moon, charm ripple, and lotus footwork.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-zhao-diao-card-art.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: module test passes, TypeScript passes, diff check passes.

- [ ] **Step 5: Update `Documentation.md` and commit**

Add a Wave 10 Task 2 entry with docs read, RED result, GREEN verification, files created, and next step.

Commit:

```bash
git add Documentation.md src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts tests/data/wave10-zhao-diao-card-art.test.ts public/assets/generated/cards/wave10-zhao-*.svg public/assets/generated/cards/wave10-diao-*.svg
git commit -m "feat: add wave10 zhao diao card art module"
```

## Task 3: Cai Wenji And Zhuge Liang Card-Art Module

**Files:**

- Create: `src/game/content/cardArt/wave10CaiZhugeCardArt.ts`
- Create: `tests/data/wave10-cai-zhuge-card-art.test.ts`
- Create: 16 SVG files listed in Group C
- Do not modify: `src/game/content/visuals.ts`
- Do not modify: `public/assets/generated/asset-audit.json`

- [ ] **Step 1: Write the failing module test**

Create `tests/data/wave10-cai-zhuge-card-art.test.ts` using the same file-existence structure as Task 1 with this `expectedIds` list:

```ts
const expectedIds = [
  "cai_broken_string",
  "cai_clean_string",
  "cai_clear_tone",
  "cai_echoing_melody",
  "cai_five_tones_start",
  "cai_listen_still",
  "cai_shang_tone",
  "cai_soul_ferry",
  "zhuge_deduction",
  "zhuge_empty_city",
  "zhuge_fire_array",
  "zhuge_plan_set",
  "zhuge_starfall",
  "zhuge_stone_array",
  "zhuge_straw_boats",
  "zhuge_wind_array"
];
```

The test imports `wave10CaiZhugeCardArt` from `../../src/game/content/cardArt/wave10CaiZhugeCardArt` and asserts ids, SVG paths, non-empty alt text, valid accents, file existence, `viewBox="0 0 640 900"`, and no visible `<text>`.

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-cai-zhuge-card-art.test.ts
```

Expected: fails because `src/game/content/cardArt/wave10CaiZhugeCardArt.ts` does not exist.

- [ ] **Step 3: Create the module and SVGs**

Create `src/game/content/cardArt/wave10CaiZhugeCardArt.ts` exporting `wave10CaiZhugeCardArt`. Use exact ids and filenames from Group C. Cai Wenji cards should emphasize guqin, sound waves, clear rain, broken strings, five tones, and soul ferry imagery. Zhuge Liang cards should emphasize fan, stars, bamboo slips, chess pieces, gates, and formation sigils.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/wave10-cai-zhuge-card-art.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: module test passes, TypeScript passes, diff check passes.

- [ ] **Step 5: Update `Documentation.md` and commit**

Add a Wave 10 Task 3 entry with docs read, RED result, GREEN verification, files created, and next step.

Commit:

```bash
git add Documentation.md src/game/content/cardArt/wave10CaiZhugeCardArt.ts tests/data/wave10-cai-zhuge-card-art.test.ts public/assets/generated/cards/wave10-cai-*.svg public/assets/generated/cards/wave10-zhuge-*.svg
git commit -m "feat: add wave10 cai zhuge card art module"
```

## Task 4: Integration, Audit, And Release Docs

**Files:**

- Modify: `src/game/content/visuals.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `public/assets/generated/asset-audit.json`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `docs/playtest/desktop-playtest-checklist.md`
- Modify: `README.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Write the failing integration test**

Add this test to `tests/data/content.test.ts` near the card-art tests:

```ts
it("binds every Wave 10 card fallback target to semantic art", () => {
  const wave10DebtTargets = [
    "cai_broken_string",
    "cai_clean_string",
    "cai_clear_tone",
    "cai_echoing_melody",
    "cai_five_tones_start",
    "cai_listen_still",
    "cai_shang_tone",
    "cai_soul_ferry",
    "common_duanzhu",
    "common_feishi",
    "common_gedang",
    "common_mirror_armor",
    "common_pifeng",
    "common_qingshen",
    "common_tuna",
    "common_xieli",
    "common_zhuiying",
    "diao_falling_fan",
    "diao_glance",
    "diao_hongyan",
    "diao_red_ribbon",
    "diao_sleeve_blade",
    "diao_step_lotus",
    "ink_heiyu",
    "ink_modian",
    "ink_moren",
    "mind_jingxin",
    "mind_luanxin",
    "mind_nuzhan",
    "status_rain_chill",
    "zhao_guardian",
    "zhao_qixing_spear",
    "zhao_single_rider",
    "zhao_stable_formation",
    "zhao_sweep",
    "zhao_thrust",
    "zhao_white_dragon",
    "zhuge_deduction",
    "zhuge_empty_city",
    "zhuge_fire_array",
    "zhuge_plan_set",
    "zhuge_starfall",
    "zhuge_stone_array",
    "zhuge_straw_boats",
    "zhuge_wind_array"
  ];

  for (const id of wave10DebtTargets) {
    const art = visuals.cardArtById[id];
    expect(art?.assetPath).toMatch(/^\/assets\/generated\/cards\/wave10-.+\.svg$/);
    expect(art?.assetPath).not.toBe(visuals.cardArtById.type_attack.assetPath);
    expect(art?.assetPath).not.toBe(visuals.cardArtById.type_skill.assetPath);
    expect(art?.assetPath).not.toBe(visuals.cardArtById.type_body.assetPath);
    expect(art?.assetPath).not.toBe(visuals.cardArtById.type_ink.assetPath);
    expect(art?.assetPath).not.toBe(visuals.cardArtById.type_mind.assetPath);
  }
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts -t "Wave 10 card fallback"
```

Expected: fails because the new modules are not imported into `cardArtList`.

- [ ] **Step 3: Import and merge Wave 10 modules**

Modify `src/game/content/visuals.ts`:

```ts
import { wave10CaiZhugeCardArt } from "./cardArt/wave10CaiZhugeCardArt";
import { wave10CommonCardArt } from "./cardArt/wave10CommonCardArt";
import { wave10ZhaoDiaoCardArt } from "./cardArt/wave10ZhaoDiaoCardArt";
```

Then append these spreads immediately before the `type_attack` fallback entry inside `cardArtList`:

```ts
  ...wave10CommonCardArt,
  ...wave10ZhaoDiaoCardArt,
  ...wave10CaiZhugeCardArt,
```

- [ ] **Step 4: Verify integration and refresh audit**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

Expected: content tests pass and audit reports `missing: 0`, `ink-pass debt: 0`, and `card fallback debt: 0`.

- [ ] **Step 5: Run full release gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

Expected: Vitest passes, TypeScript passes, Vite builds with only the known Phaser chunk warning, Playwright desktop passes, balance remains 12/12 with no timeout risks or unsafe spikes, and diff check passes.

- [ ] **Step 6: Update docs and commit**

Update:

- `docs/art/gpt2-priority-queue.md` with final runtime references and `cardFallbackDebt: 0`.
- `docs/playtest/alpha-acceptance.md` with final Wave 10 gate results.
- `docs/playtest/desktop-playtest-checklist.md` with final card-art debt state.
- `README.md` known gaps so card fallback debt no longer appears as active debt.
- `Documentation.md` with docs read, branch integration, verification, known gaps, and next milestone.

Commit:

```bash
git add Documentation.md README.md docs/art/gpt2-priority-queue.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md public/assets/generated/asset-audit.json src/game/content/visuals.ts tests/data/content.test.ts
git commit -m "feat: integrate wave10 card fallback zero"
```

## Parallel Worktree Strategy

Create these branches from the Wave 10 integration base:

- `codex/wave10-common-card-art` at `.worktrees/wave10-common-card-art`
- `codex/wave10-zhao-diao-card-art` at `.worktrees/wave10-zhao-diao-card-art`
- `codex/wave10-cai-zhuge-card-art` at `.worktrees/wave10-cai-zhuge-card-art`
- `codex/wave10-card-fallback-zero` at `.worktrees/wave6-integration` as the integration branch

Workers for Tasks 1-3 may run in parallel because their production modules, test files, and SVG files are disjoint. The controller owns Task 4 integration because it touches shared manifest, shared content test, audit JSON, and release docs.

## Acceptance Criteria

- Every card listed in the Wave 9 `cardFallbackDebt.cards` audit has a direct semantic `cardArtById` entry.
- `scripts/audit-generated-assets.mjs` reports `card fallback debt: 0`.
- No new missing runtime assets.
- `ink-pass debt` remains 0.
- Browser card-art tests accept SVG assets.
- Playwright desktop suite remains green.
- Multi-seed balance remains 12/12 with no timeout risks or unsafe spikes.
