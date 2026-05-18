# Card Foundation Redesign Handoff

Date: 2026-05-10
Branch/worktree: `/Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/.worktrees/combat-ui-kit`

## User Intent

The user wants the card UI rebuilt around a premium ink-wash wuxia card foundation, not just CSS recoloring. The user approved the current design direction and now wants the remaining work handed off to another model. Image generation will be handled manually by the user; the next model should not spend quota generating images unless explicitly asked later.

Important user preferences:

- Desktop-only is acceptable for this pass; do not spend effort on mobile adaptation.
- The card face must feel like a complete designed object: frame, title area, seals, text panel, ornaments, cost medallion, and bottom brush rule.
- Do not treat the art as arbitrary mixed-ratio images anymore. New generated card art must follow the 1024x1536 portrait contract.
- Continue autonomously from the plan, but use subagent-style review discipline when available: implement, spec review, quality review, fix, re-review.

## Current Status

Completed and reviewed:

- Design spec: `docs/superpowers/specs/2026-05-10-card-foundation-redesign-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-10-card-foundation-redesign.md`
- Task 1+2: Photoshop-openable PSD, manifest, deterministic builder, runtime card foundation PNG exports.
- Task 3: Prototype page and Playwright tests.
- Task 4: Card-art quality report now records and flags the 1024x1536 foundation art contract.
- Task 5: Production combat/reward/shop/deck cards now use the card foundation anatomy.
- Task 6 scaffold: queue doc and failing binding test created.

Latest relevant commits:

```text
24c8694 test: scaffold card foundation art batch
06b964c test: type prototype asset image checks
0b08467 fix: preserve reward shop card art during foundation rollout
45cf859 fix: verify card foundation prototype assets
4cc1532 test: type card art quality report fixture
6a07bc9 feat: apply card foundation runtime anatomy
ed4544d feat: prototype portrait card foundation
e533b48 fix: harden card foundation asset contract
2e3bf95 test: cover missing card foundation art assets
036c74f fix: strengthen card foundation report checks
7401152 feat: add card foundation kit assets
23afa46 test: track card foundation art contract
3f7ee23 test: define card foundation manifest contract
6f85bf9 docs: plan card foundation implementation
760360f docs: define card foundation redesign
```

At handoff time, `git status --short` was clean before this handoff document was added.

## Approved Card Design

Use a portrait-first card foundation:

- Source card art size: `1024x1536` PNG.
- Runtime card foundation PSD size: `420x620`.
- Style: premium Chinese ink-wash wuxia on xuan paper.
- Palette: restrained black ink, paper beige, jade/teal, cinnabar/red, limited gold.
- Shape: vertical main visual card, balanced elegant ornament style.

Card anatomy:

- Outer frame with layered paper, ink line, and rarity accent.
- Four corner ornaments.
- Upper-left cost medallion.
- Upper-right rarity seal.
- Upper-middle portrait art window.
- Title band as a written plaque/title slip.
- Type and keyword seals.
- Description paper panel.
- Bottom brush rule.
- Hover/disabled/selected state layers.

Generated foundation source files already exist:

- `assets/source/ui/cards/card-foundation-kit.psd`
- `assets/source/ui/cards/card-foundation-manifest.json`
- `assets/source/ui/cards/layers/*.png`
- `public/assets/generated/ui/cards/foundation-*.png`

The PSD/manifest contract is covered by:

```bash
npm_config_strict_ssl=false npx vitest run tests/ui-assets/card-foundation-manifest.test.ts --reporter=dot
```

## Art Generation Contract

All new card art must follow this exact source contract:

- PNG, `1024x1536`.
- Vertical portrait scroll format.
- One clear main subject in the upper-middle of the canvas.
- Full readable silhouette.
- At least 10 percent breathing room on every edge.
- Bottom 24-30 percent is safe UI/text zone: only ink mist, paper texture, non-critical environment.
- Forbidden: text, UI, borders, card frames, watermarks, logos, modern effects, English letters, unrelated props.
- Style: ink-wash wuxia, xuan-paper texture, restrained cinnabar and jade accents, premium physical card illustration quality.

Shared prompt suffix:

```text
Vertical ink-wash wuxia card illustration, 1024x1536, xuan-paper texture, single clear main subject in the upper-middle composition, full readable silhouette, generous breathing room on all edges, bottom area filled only with crop-safe ink mist and paper texture, no text, no UI, no frame, no watermark, restrained cinnabar and jade accents, premium physical card illustration quality.
```

## Task 6 Current State

Task 6 scaffold is committed in `24c8694`.

Created:

- `docs/art/card-foundation-generation-queue.md`
- `tests/data/card-foundation-batch.test.ts`

The batch test intentionally fails until the 8 new image files are present and the card art bindings are updated:

```bash
npm_config_strict_ssl=false npx vitest run tests/data/card-foundation-batch.test.ts --reporter=dot
```

Expected first failure right now:

- `zhao_strike` still points to `/assets/generated/cards/wave64-zhao-strike-gpt2.png`
- It should point to `/assets/generated/cards/foundation-v1-zhao-strike.png`

## Human-Generated Images Needed

The user will manually generate these 8 files. Place them exactly here:

```text
public/assets/generated/cards/foundation-v1-zhao-strike.png
public/assets/generated/cards/foundation-v1-zhao-guard.png
public/assets/generated/cards/foundation-v1-zhao-longdan.png
public/assets/generated/cards/foundation-v1-diao-strike.png
public/assets/generated/cards/foundation-v1-common-gedang.png
public/assets/generated/cards/foundation-v1-common-tuna.png
public/assets/generated/cards/foundation-v1-zhuge-observe-stars.png
public/assets/generated/cards/foundation-v1-ink-heiyu.png
```

Use these subject phrases before the shared prompt suffix:

1. `zhao_strike`
   `Zhao Yun thrusting a silver spear through black rain, teal spear momentum, heroic but restrained.`

2. `zhao_guard`
   `Zhao Yun plants his spear defensively before a river crossing, jade shield aura and ink spray.`

3. `zhao_longdan`
   `Zhao Yun's dragon courage stance, coiling pale dragon-shaped spear energy, cinnabar seal sparks.`

4. `diao_strike`
   `Diao Chan cuts with a hidden sleeve blade, red silk ribbon arc, elegant dance motion.`

5. `common_gedang`
   `Crossed bamboo guards deflect an incoming ink blade, simple defensive martial study.`

6. `common_tuna`
   `Quiet breathing meditation with circular ink current around folded hands, no modern symbols.`

7. `zhuge_observe_stars`
   `Zhuge Liang studies stars above bamboo slips and feather fan, teal constellation ink lines.`

8. `ink_heiyu`
   `Black rain falling into a scholar's dream, ominous ink droplets and faint cinnabar warning seal.`

If checking generated files locally, verify dimensions:

```bash
sips -g pixelWidth -g pixelHeight public/assets/generated/cards/foundation-v1-*.png
```

Every file must be `pixelWidth: 1024` and `pixelHeight: 1536`.

Do not bind images that contain text, UI, frame/border, watermark, modern graphic effects, cropped subject, or important action in the bottom safe zone.

Note from interrupted generation:

- Two generated candidates existed under `/Users/lushihao/.codex/generated_images/019e0ce3-cb0b-7ca3-ac02-678e4fa6cdd8/`.
- `ig_09a03f9164c54ff2016a00437095b08191bfdac1270a0a14ec.png` looked like a suitable `zhao_strike` candidate and was `1024x1536`.
- `ig_09a03f9164c54ff2016a00464c896481919331e717c7175e78.png` looked like a suitable `zhao_guard` candidate and was `1024x1536`.
- `ig_0b5732d62afa93ba0169ff3ba470688191aabe4c95a5c74274.png` was `1672x941` landscape and should not be used.

The user may ignore those candidates and provide all 8 images manually.

## Binding Instructions After Images Exist

Update card-art bindings so the 8 ids point to the new files.

Primary binding locations:

- `src/game/content/visuals.ts`
  - `zhao_strike`
  - `zhao_guard`
  - `zhao_longdan`
  - `diao_strike`
  - `zhuge_observe_stars`

- `src/game/content/cardArt/wave10CommonCardArt.ts`
  - `common_gedang`
  - `common_tuna`
  - `ink_heiyu`

Keep existing `accent` unless visual review clearly suggests otherwise. Update `alt` text if useful, but do not overdo it.

Expected path mapping:

```ts
const foundationBatch = {
  zhao_strike: "/assets/generated/cards/foundation-v1-zhao-strike.png",
  zhao_guard: "/assets/generated/cards/foundation-v1-zhao-guard.png",
  zhao_longdan: "/assets/generated/cards/foundation-v1-zhao-longdan.png",
  diao_strike: "/assets/generated/cards/foundation-v1-diao-strike.png",
  common_gedang: "/assets/generated/cards/foundation-v1-common-gedang.png",
  common_tuna: "/assets/generated/cards/foundation-v1-common-tuna.png",
  zhuge_observe_stars: "/assets/generated/cards/foundation-v1-zhuge-observe-stars.png",
  ink_heiyu: "/assets/generated/cards/foundation-v1-ink-heiyu.png"
};
```

## Existing Tests To Update After Binding

The scaffold agent identified these tests with hardcoded old expected paths or regexes:

- `tests/data/wave64-card-art.test.ts`
  - update `zhao_strike`, `zhao_guard`, `zhao_longdan`, `diao_strike`
  - note: this test currently expects `512x768` wave64 images, so either exclude foundation-v1 ids from the wave64 dimension assertion or adjust expectations for those ids to `1024x1536`.

- `tests/data/wave59-card-art.test.ts`
  - update `common_tuna`

- `tests/data/wave21-gpt2-card-art.test.ts`
  - update `zhao_strike`, `zhao_guard`, `zhao_longdan`, `diao_strike`, `common_gedang`, `common_tuna`

- `tests/data/content.test.ts`
  - update starter path expectations.
  - update historic fallback batch regexes for `common_gedang`, `common_tuna`, `ink_heiyu`.
  - update priority card path expectations for affected ids.

- `tests/data/wave10-common-card-art.test.ts`
  - update batch regex expectations for `common_gedang`, `common_tuna`, `ink_heiyu`.
  - `ink_heiyu` moves from SVG to PNG, so remove SVG-specific expectation for that id.

## Required Verification For Task 6

After images are in place and bindings/tests are updated, run:

```bash
npm_config_strict_ssl=false npx vitest run tests/data/card-foundation-batch.test.ts tests/data/card-art-quality-report.test.ts --reporter=dot
```

Then run the affected data tests:

```bash
npm_config_strict_ssl=false npx vitest run \
  tests/data/card-foundation-batch.test.ts \
  tests/data/card-art-quality-report.test.ts \
  tests/data/wave64-card-art.test.ts \
  tests/data/wave59-card-art.test.ts \
  tests/data/wave21-gpt2-card-art.test.ts \
  tests/data/wave10-common-card-art.test.ts \
  tests/data/content.test.ts \
  --reporter=dot
```

Run the quality report:

```bash
node scripts/card-art-quality-report.mjs
```

The new 8 `foundation-v1` PNGs should not receive `non-foundation-portrait-source` flags because they should be `1024x1536`.

If everything passes, commit:

```bash
git add docs/art/card-foundation-generation-queue.md \
  public/assets/generated/cards/foundation-v1-*.png \
  src/game/content/visuals.ts \
  src/game/content/cardArt/wave10CommonCardArt.ts \
  tests/data/card-foundation-batch.test.ts \
  tests/data/wave64-card-art.test.ts \
  tests/data/wave59-card-art.test.ts \
  tests/data/wave21-gpt2-card-art.test.ts \
  tests/data/wave10-common-card-art.test.ts \
  tests/data/content.test.ts
git commit -m "feat: add first card foundation art batch"
```

## Task 6 Review Gate

After committing Task 6, run two reviews:

1. Spec compliance review:
   - Confirms all 8 files exist at exact paths.
   - Confirms all 8 are `1024x1536`.
   - Confirms all 8 bindings point to `foundation-v1-*`.
   - Confirms queue doc and batch test match the plan.

2. Code quality review:
   - Checks hardcoded tests were updated cleanly, not weakened broadly.
   - Checks no old generated files were deleted.
   - Checks quality report behavior still flags non-foundation old art while exempting the 8 new compliant PNGs.
   - Checks reward/shop temporary `contain` behavior remains sensible until more regenerated art is available.

## Task 7 Remaining Final Verification

After Task 6 passes review, run final verification:

```bash
npm test
npm run typecheck
npm run build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/card-foundation-prototype.spec.ts tests/e2e/visual-smoke.spec.ts tests/e2e/playable-flow.spec.ts --project=chromium --grep "card foundation|reward cards keep|shops can add relics|captures desktop combat smoke"
node scripts/build-card-foundation-kit.mjs
node scripts/audit-generated-assets.mjs
node scripts/card-art-quality-report.mjs
git diff --check
```

Expected:

- Unit/data tests pass.
- Typecheck and build pass.
- Focused Playwright passes.
- Builder remains deterministic and does not dirty generated outputs.
- Asset audit passes.
- Card art quality report runs.
- `git diff --check` passes.

Then request final review with this scope:

```text
Review the card foundation redesign branch. Focus on card PSD/manifest contract correctness, production card DOM/CSS integration, image-generation contract enforcement, visual overlap risk in combat/reward/shop/deck cards, and whether the first foundation art batch is safely scoped.
```

## Runtime UI Notes

Production integration currently preserves existing art during transition:

- Combat/deck foundation cards keep portrait `object-fit: cover`.
- Reward/shop foundation cards use centered `object-fit: contain` temporarily because existing mixed-ratio art would be severely cropped in short/wide slots.
- Once enough cards are regenerated to `1024x1536`, reward/shop can be revisited for consistent portrait crop behavior.

Relevant files:

- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/e2e/visual-smoke.spec.ts`
- `tests/e2e/playable-flow.spec.ts`

## Do Not Do

- Do not regenerate all 150 cards in this pass.
- Do not change card mechanics or balance.
- Do not spend time on mobile layout.
- Do not delete old art assets unless explicitly asked.
- Do not weaken old data tests broadly; update only the affected expected paths/dimensions.
- Do not use images that violate the art contract just to make tests pass.

