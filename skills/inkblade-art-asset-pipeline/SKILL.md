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
3. Save the untouched source under `public/assets/generated/sources/` or `public/assets/generated/*-source.png` when practical.
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
10. For long-running feature work that needs playable continuity before final bespoke art, create project-local `*-ink-pass.png` placeholders from approved in-repo ink assets, register them under the final semantic IDs, and document that they are replaceable by later GPT Image source/cutout files without code changes.
11. Dedicated enemy attack strips must be registered per enemy family. Do not map new enemies back to generic black silhouettes or unrelated first-chapter strips once a chapter-specific asset slot exists.
12. For GPT Image 2 sheet output, preserve the source sheet, crop each panel into semantic runtime filenames, and bind the manifest to the runtime crop rather than the sheet.
13. Do not use generic circular slash/sigil overlays for ordinary damage, block, status, or trigger feedback. They can read as broken sequence-frame residue over standees; use floating text/log feedback unless a card has an explicit signature VFX cue.

## Asset Debt Ledger

After every GPT Image 2 replacement pass, refresh the generated asset ledger before claiming art coverage:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
```

The script scans `src/game/content/visuals.ts` for `/assets/generated` and `/assets/sprites` runtime references, verifies the files under `public/`, and writes `public/assets/generated/asset-audit.json`.

Use the ledger as the handoff for later art passes:

- `missing` is blocking runtime breakage and must be empty before commit.
- `inkPassDebt` is the semantic list of remaining non-final runtime assets; it may shrink over time, but new debt IDs should be intentional and documented.
- `gpt2Runtime` shows currently registered GPT Image 2 runtime assets.
- `sourceSheets` records preserved source sheets and source PNGs that support future crops and repairs.
- `promptQueue` records the executable GPT Image 2 queue summary when `public/assets/generated/gpt2-prompt-queue.json` exists.

Do not hand-edit the ledger to hide debt. Update `visuals.ts` or assets, rerun the audit command, and record the result in `Documentation.md`.

## GPT Image 2 Prompt Queue

When preparing an art replacement wave without generating images, write an executable queue to:

```text
public/assets/generated/gpt2-prompt-queue.json
```

Each target must include:

- `type`: `standee`, `combat-sprite-strip`, `card-face`, or `battlefield`.
- `semanticId`: the manifest/content id the future asset should bind to.
- `destinationPath`: the intended runtime path under `/assets/generated/`, `/assets/generated/cards/`, or `/assets/sprites/`.
- `sourcePrompt`: the positive GPT Image 2 prompt grounded in the PRD, world/chapter docs, and character/enemy docs.
- `negativePrompt`: identity, style, artifact, and anatomy exclusions.
- `cropAlphaSequenceInstructions`: crop, transparent alpha, or sprite-frame normalization instructions.
- `verificationCommand`: at minimum `node scripts/audit-generated-assets.mjs && npm test -- tests/data/content.test.ts`.

For sprite strips, specify frame count, per-frame canvas size, total sheet size, transparent background, and bottom-center anchor. For standees, specify transparent alpha cleanup and protected identity details such as face, hands, weapon, sleeves, instrument, feet, and costume edges. For card faces and battlefields, specify card-safe or UI-safe crop margins.

## Verification

Run the narrowest checks first, then full verification before claiming completion:

```bash
node scripts/audit-generated-assets.mjs
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
