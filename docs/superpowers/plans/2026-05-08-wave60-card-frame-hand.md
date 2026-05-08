# Wave 60 Card Frame And Hand Presentation

Date: 2026-05-08 Asia/Shanghai
Worktree: `.worktrees/wave60-card-frame-hand`
Branch: `codex/wave60-card-frame-hand`

## Goal

Wave 60 translates the Night-Patrol reference's commercial deckbuilder card language into InkBlade's wuxia ink-wash direction. The intent is not to copy its UI literally, but to bring over the useful production patterns: protected art windows, clear cost medallions, type/rarity plaques, stable hover feedback, and repeated card surfaces that read consistently across combat, reward, shop, and deck views.

## Implemented Scope

- Added accessible `card-cost` seals to combat hand cards, reward choices, shop card offers, and deck viewer cards.
- Rebuilt combat card proportions with a larger art window, stronger inner frame, paper-grain depth, jade/cinnabar type treatment, and a stable glow-only hover lift.
- Reworked the hand zone with a darker stage shelf, radial gold focus, and spacing that keeps the energy orb, piles, combat log, and control stack clear.
- Extended the premium frame language to reward cards, shop card offers, and deck viewer cards, including larger art windows and preserved readable hover colors.
- Updated e2e checks so combat cards verify visible cost seals and stable seal bounds, while reward/shop/deck flows assert cost seals on their card surfaces.

## Verification

```text
git diff --check
Result: passed.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run --reporter=dot
Result: passed, 35 files / 265 tests.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "boots, enters|shops can add"
Result: passed, 2 Chromium tests.
```

## Notes

- A first visual-smoke run correctly caught card/log overlap after the larger card frame; the final card height was reduced and the hand shelf was retuned.
- Hover feedback originally used scale/rotate, but that changed card bounding boxes under the mouse. The final hover uses vertical lift and light only, so cards remain stable for layout and screenshots.
- Subagent dispatch was attempted for this post-EA stream, but the current quota was unavailable; this wave was completed locally in the dedicated worktree.
