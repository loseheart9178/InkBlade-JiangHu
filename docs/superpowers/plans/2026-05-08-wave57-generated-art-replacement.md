# Wave 57 Generated Art Replacement

Date: 2026-05-08
Branch: `codex/wave57-generated-art-replacement`
Worktree: `.worktrees/wave57-generated-art-replacement`

## Goal

Replace the highest-impact duplicate, low-resolution common card art identified by Wave 53 while keeping the EA asset ledger clean and reproducible.

## Completed Scope

- Generated and normalized six portrait card artworks at 512x768.
- Replaced the two worst duplicate runtime asset groups from the Wave 53 report:
  - `gpt2-wave21-common-gedang.png`: `common_gedang`, `common_bamboo_guard`, `common_brush_parry`.
  - `gpt2-wave21-common-qingshen.png`: `common_qingshen`, `common_scout_feather`, `common_sudden_step`.
- Updated direct card-art bindings in:
  - `src/game/content/cardArt/wave10CommonCardArt.ts`
  - `src/game/content/cardArt/wave49EaCardArt.ts`
  - `src/game/content/cardArt/wave50EaCardArt.ts`
- Refreshed:
  - `public/assets/generated/asset-audit.json`
  - `reports/card-art-quality-report.json`
  - `reports/card-art-quality-report.md`

## New Assets

| Card | Asset |
| --- | --- |
| 竹护 (`common_bamboo_guard`) | `/assets/generated/cards/wave57-common-bamboo-guard-gpt2.png` |
| 笔格 (`common_brush_parry`) | `/assets/generated/cards/wave57-common-brush-parry-gpt2.png` |
| 格挡 (`common_gedang`) | `/assets/generated/cards/wave57-common-gedang-gpt2.png` |
| 轻身 (`common_qingshen`) | `/assets/generated/cards/wave57-common-qingshen-gpt2.png` |
| 探羽 (`common_scout_feather`) | `/assets/generated/cards/wave57-common-scout-feather-gpt2.png` |
| 骤步 (`common_sudden_step`) | `/assets/generated/cards/wave57-common-sudden-step-gpt2.png` |

## Report Delta

- Runtime references remain 228.
- Unique runtime files increased from 143 to 147.
- Missing assets remain 0.
- Card fallback debt remains 0.
- GPT2 runtime assets decreased from 110 to 104.
- Duplicate asset groups decreased from 37 to 35.
- Dimension/crop signals decreased from 28 to 22.
- Queue top score decreased from 142 to 138.

## Acceptance

- New assets were visually inspected for clear subject, portrait composition, and no obvious bad crop.
- Runtime asset audit remains clean.
- Card art quality report no longer ranks the six replaced cards at the top of the queue.
- Remaining severe queue items are now concentrated in the next low-resolution common/starter group and can be treated as post-EA backlog unless Wave 58 finds a visible release blocker.

## Verification

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/audit-generated-assets.mjs
Result: passed. runtime references 228, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 104.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/card-art-quality-report.mjs
Result: passed. cards 150, missing files 0, duplicate asset groups 35, dimension/crop signals 22.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/vitest/vitest.mjs run tests/data/card-art-quality-report.test.ts tests/data/content.test.ts --reporter=dot
Result: passed, 2 files / 34 tests.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.

git diff --check
Result: passed.
```
