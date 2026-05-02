---
name: inkblade-art-asset-pipeline
description: Reusable workflow for generating, post-processing, applying, and verifying InkBlade visual assets.
---

# InkBlade Art Asset Pipeline

Use this skill whenever creating or replacing combat standees, portraits, card art, battlefield art, attack sprite strips, UI textures, or generated visual assets for 《云水江湖》.

## Required Context Read

Before any prompt writing, implementation, or UI placement:

1. Read `AGENTS.md`, `Prompt.md`, `Plan.md`, `Implement.md`, and `Documentation.md`.
2. Re-read the relevant files under `docs/`:
   - PRD and core gameplay docs for product/UI rules.
   - World/chapter docs for environment, enemy, and mood.
   - Character setting docs for playable role identity, costume, weapon, color, pose, and negative prompts.
3. Record the docs read, prompt decisions, generated file names, post-processing decisions, verification, and remaining risks in `Documentation.md`.

## Style Contract

- Match the user reference: ink mountains, xuan paper texture, red/teal role accents, brush-frame cards, top health bars, bottom hand, readable duel center.
- Preserve role identity before style polish:
  - Zhao Yun: male, white/silver-blue spear general, upright, light armor, white dragon/spear cues.
  - Diao Chan: red/white dancer, fan/ribbons/sleeves, no guqin/pipa/Cai Wenji cues.
  - Chapter-one enemies: ink-corrupted jianghu threats; Dong Zhuo reads as weighty authority, greed, and shadowed power.
- Do not apply raw generated images directly if they need cutout, crop, alpha cleanup, identity correction, scale normalization, or frame extraction.

## Asset Workflow

1. Define the asset brief from docs and current code usage.
2. Generate or source the raster asset.
3. Save the untouched source under `public/assets/generated/*-source.png` when practical.
4. Produce runtime assets:
   - Cutouts: `public/assets/generated/*-cutout.png`.
   - Sprite strips: `public/assets/sprites/*-attack-strip-*.png`.
   - Card art crops: `public/assets/generated/cards/*.png`.
5. Remove backgrounds with transparent alpha processing, not CSS masking alone, when the asset must layer over battlefield art.
6. Inspect alpha/crop quality:
   - No missing face, hands, weapon, feet, sleeves, hair, ribbons, or costume regions.
   - Transparent corners and clean silhouette.
   - No chroma-key color or paper rectangle visible in runtime.
7. Build sprite strips only from approved cutouts or approved source frames. Normalize frame canvas, anchor, and scale so idle and attack identity match.
8. Update manifests, primarily `src/game/content/visuals.ts`, before touching renderer code.
9. Update UI/CSS only as an adapter for placement, scale, z-index, animation, and readability.

## Verification

Run the narrowest checks first, then full verification before claiming completion:

```bash
npm test -- --run tests/data/content.test.ts
npm run build
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run test:e2e
```

Browser screenshots must be reviewed on desktop. Compare against the user reference for:

- Top health bars and portraits.
- Character standees not hidden by the card row while idle.
- Attack sprite strips replacing placeholders for both player and enemy actions.
- Bottom card hand spacing and brush-frame readability.
- Energy orb separated from the hand, matching the left-bottom reference layout.

## Failure Handling

- If a generated asset has identity drift, missing body parts, wrong weapon, wrong role, or raw background artifacts, do not hide it with CSS. Regenerate or locally repair the runtime asset.
- If a visual bug is reported, add or update a regression test before fixing when practical.
- If Playwright screenshots differ from the reference in layout, adjust desktop layout first; mobile adaptation is paused unless explicitly reopened by the user.
