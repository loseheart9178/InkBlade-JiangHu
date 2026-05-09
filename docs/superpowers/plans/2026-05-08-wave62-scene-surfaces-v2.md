# Wave 62 Scene Surfaces V2

Date: 2026-05-09 Asia/Shanghai
Worktree: `.worktrees/wave62-scene-surfaces-v2`
Branch: `codex/wave62-scene-surfaces-v2`

## Goal

Wave 62 deepens the non-combat route screens so reward, shop, event, and rest read as authored jianghu scenes instead of loose utility panels. The work follows the Night-Patrol reference lesson of strong scene wrappers and dense repeated choices, translated into InkBlade's xuan-paper, cinnabar, jade, and ink-wash style.

## Implemented Scope

- Added a reusable `scene-header` component for reward, shop, event, and rest surfaces.
- Anchored reward with a `战利落定` header and richer stage background while preserving reward-card and skip flow.
- Anchored shop with a `茶亭游商` header and stronger section surfaces for cards, relics, services, and leave action.
- Anchored events with event-specific scene headers while preserving existing event art panels and choice rail.
- Anchored rest with a `废寺静修` header and a clearer two-column rest scene.
- Added Playwright assertions that each non-combat scene wrapper contains its matching visible scene header.

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

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "boots, enters|shops can add"
Result: passed, 2 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "event route can upgrade|Cai Wenji event route|Zhuge Liang event route"
Result: passed, 3 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "reward|shop|event|rest"
Result: passed, 9 Chromium tests.
```

## Notes

- A worker contributed the scene-header Playwright assertions and initial acceptance notes; source implementation was completed separately in the same Wave62 worktree.
- A temporary local `node_modules` symlink was used for worktree verification and is not part of the patch.
- This wave intentionally leaves compendium and run-summary deepening for a later pass because the highest-return scene polish was reward/shop/event/rest, where players repeatedly make route decisions.
