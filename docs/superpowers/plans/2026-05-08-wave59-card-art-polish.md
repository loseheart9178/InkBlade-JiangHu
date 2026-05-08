# Wave 59 Card Art Polish

Date: 2026-05-08
Branch: `codex/wave59-card-art-polish`
Worktree: `.worktrees/wave59-card-art-polish`

## Goal

Continue the post-EA art pass by replacing the next severe duplicate and low-resolution common card faces from the Wave 53 quality queue.

## Reference Translation

The Night-Patrol reference reinforces card readability through dedicated card art windows, thick frame hierarchy, strong cost/type anchors, and thumbnail-readable subjects. Wave 59 applies the same production principle to InkBlade's ancient wuxia ink-wash setting: each card face needs a clear single motif, clean silhouette, xuan paper texture, jade/teal guard light, cinnabar attack marks, and no UI/text baked into the artwork.

## Completed Scope

- Generated and normalized eight portrait card artworks at 512x768.
- Replaced the next high-priority common duplicate/low-resolution groups:
  - `common_lockstep`
  - `common_old_wine`
  - `common_paper_ward`
  - `common_rain_cut`
  - `common_pifeng`
  - `common_tuna`
  - `common_mirror_armor`
  - `common_zhuiying`
- Updated direct card-art bindings in:
  - `src/game/content/cardArt/wave10CommonCardArt.ts`
  - `src/game/content/cardArt/wave49EaCardArt.ts`
  - `src/game/content/cardArt/wave50EaCardArt.ts`
- Added a dedicated Wave 59 asset binding test.

## New Assets

| Card | Asset |
| --- | --- |
| 并步 (`common_lockstep`) | `/assets/generated/cards/wave59-common-lockstep-gpt2.png` |
| 镜甲 (`common_mirror_armor`) | `/assets/generated/cards/wave59-common-mirror-armor-gpt2.png` |
| 旧酒 (`common_old_wine`) | `/assets/generated/cards/wave59-common-old-wine-gpt2.png` |
| 纸符护 (`common_paper_ward`) | `/assets/generated/cards/wave59-common-paper-ward-gpt2.png` |
| 劈风 (`common_pifeng`) | `/assets/generated/cards/wave59-common-pifeng-gpt2.png` |
| 雨斩 (`common_rain_cut`) | `/assets/generated/cards/wave59-common-rain-cut-gpt2.png` |
| 吐纳 (`common_tuna`) | `/assets/generated/cards/wave59-common-tuna-gpt2.png` |
| 追影 (`common_zhuiying`) | `/assets/generated/cards/wave59-common-zhuiying-gpt2.png` |

## Acceptance Gate

- `scripts/audit-generated-assets.mjs` reports missing 0 and card fallback debt 0.
- `scripts/card-art-quality-report.mjs` no longer ranks the replaced cards at the top of the queue.
- Targeted data tests pass.
- TypeScript passes.
- Visual smoke passes.
- `git diff --check` passes.

## Report Delta

- Runtime references remain 228.
- Unique runtime files increased from 147 to 151.
- Missing assets remain 0.
- Card fallback debt remains 0.
- Duplicate asset groups decreased from 35 to 31.
- Dimension/crop signals decreased from 22 to 14.
- Replacement queue top score decreased from 138 to 105.
- The top queue is now the remaining starter low-resolution batch rather than the replaced common duplicate groups.

## Verification

```text
node scripts/audit-generated-assets.mjs
Result: passed. runtime references 228, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 96, source sheets 21.

node scripts/card-art-quality-report.mjs
Result: passed. cards 150, missing files 0, duplicate asset groups 31, dimension/crop signals 14.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/data/wave59-card-art.test.ts tests/data/wave10-common-card-art.test.ts tests/data/wave21-gpt2-card-art.test.ts tests/data/content.test.ts tests/data/card-art-quality-report.test.ts --reporter=dot
Result: passed, 5 files / 38 tests.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 35 files / 265 tests.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.
```
