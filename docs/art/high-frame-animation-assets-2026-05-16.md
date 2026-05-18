# High-Frame Combat Animation Source Sheets - 2026-05-16

## Scope

Generated four high-frame ink-wash combat animation source sheets for the playable roster, using the current project-bound battle/selection standees as identity references.

These are source sheets for review and later slicing, not yet registered as runtime Phaser spritesheets. The current Imagegen output resolution is `1254x1254`, so the next runtime step should crop and normalize frames into fixed `512x512` cells or regenerate at a higher controlled resolution before binding.

Update: `scripts/build-high-frame-animation-sheets.mjs` now performs the first normalization pass. It slices the accepted source grids into `512x512` frame files and assembles true `4096x4096` 8x8 source sheets. These are enlarged working masters rather than native 4096 Imagegen outputs.

## Inputs Read

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `src/game/content/visuals.ts`
- `src/app/appShell.ts`

## Reference Bindings

| Character | Runtime reference standee | New source sheet |
|---|---|---|
| Zhao Yun | `/assets/generated/zhaoyun-standee-gpt-v2-cutout.png` | `/assets/generated/sources/high-frame-animation/zhaoyun-24f-dash-spear-combo-sheet-source.png` |
| Diao Chan | `/assets/generated/diaochan-standee-gpt-v2-cutout.png` | `/assets/generated/sources/high-frame-animation/diaochan-32f-crimson-dance-sheet-source.png` |
| Cai Wenji | `/assets/generated/gpt2-caiwenji-standee-cutout.png` | `/assets/generated/sources/high-frame-animation/caiwenji-24f-qin-resonance-sheet-source.png` |
| Zhuge Liang | `/assets/generated/gpt2-zhugeliang-standee-cutout.png` | `/assets/generated/sources/high-frame-animation/zhugeliang-32f-qimen-bagua-sheet-source.png` |

Preview contact sheet:

- `output/high-frame-sheets/selected-contact.png`
- `output/high-frame-sheets/4096-populated-preview.png`

## 4096 Working Masters

Command:

```bash
npm run assets:high-frame-sheets
```

Outputs:

| Character | 4096 source sheet | 512 frame folder |
|---|---|---|
| Zhao Yun | `/assets/generated/sources/high-frame-animation/4096/zhaoyun-24f-dash-spear-combo-4096-source.png` | `public/assets/generated/sources/high-frame-animation/frames-512/zhaoyun/` |
| Diao Chan | `/assets/generated/sources/high-frame-animation/4096/diaochan-32f-crimson-dance-4096-source.png` | `public/assets/generated/sources/high-frame-animation/frames-512/diaochan/` |
| Cai Wenji | `/assets/generated/sources/high-frame-animation/4096/caiwenji-24f-qin-resonance-4096-source.png` | `public/assets/generated/sources/high-frame-animation/frames-512/caiwenji/` |
| Zhuge Liang | `/assets/generated/sources/high-frame-animation/4096/zhugeliang-32f-qimen-bagua-4096-source.png` | `public/assets/generated/sources/high-frame-animation/frames-512/zhugeliang/` |

Manifest:

- `public/assets/generated/sources/high-frame-animation/4096/high-frame-animation-4096-manifest.json`

Layout:

- All 4096 masters use an `8x8` grid.
- Each populated cell is `512x512`.
- Zhao Yun and Cai Wenji populate 24 cells, leaving the remaining cells blank.
- Diao Chan and Zhuge Liang populate 32 cells, leaving the remaining cells blank.
- The blank cells are intentional repair/extension space for later grouped redraws or interpolation tests.

## Prompt Decisions

- Used plain white backgrounds instead of transparent alpha so the sheets can be inspected and later keyed/cut manually.
- Asked for clean frame boundaries, no text, no labels, no frame numbers, no UI, no watermark.
- Preserved character-specific identity constraints from the current standees and character-setting docs.
- Requested Multiply-friendly ink values for beige xuan paper combat backgrounds.
- Kept the outputs as source assets because the generated dimensions are not the requested `4096x4096` production size.

## Asset Notes

- Zhao Yun: 5x5 source sheet, intended 24-frame dash plus spear combo. Good silhouette and spear continuity; one spare cell is available.
- Diao Chan: 6x6 source sheet, intended 32-frame full-circle crimson dance. Selected the stronger 6x6 variant from two generated candidates because it preserves the circular ribbon motion more clearly.
- Cai Wenji: 5x5 source sheet, intended 24-frame guqin resonance. Good identity and guqin continuity; one spare cell is available.
- Zhuge Liang: 6x6 source sheet, intended 32-frame Qimen/Bagua formation casting. Good fan, Bagua, and star motif retention; extra cells can be ignored during slicing.

## Next Runtime Step

1. Choose accepted source sheets after visual review.
2. Mark weak frames or frame groups in the 4096 manifest.
3. Regenerate or repair only those frame groups against the character reference.
4. Produce transparent alpha runtime frames after the selected frames are approved.
5. Export runtime strips or atlases under `public/assets/sprites/`.
6. Register runtime sheets in `src/game/content/visuals.ts`.
7. Run `node scripts/audit-generated-assets.mjs`, focused content tests, build, and desktop visual smoke.
