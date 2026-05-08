# Wave 61 Combat HUD And Feedback Layer

Date: 2026-05-08 Asia/Shanghai
Worktree: `.worktrees/wave61-combat-hud-feedback`
Branch: `codex/wave61-combat-hud-feedback`

## Goal

Wave 61 upgrades the combat HUD and feedback layer without changing combat rules. It carries the Night-Patrol lesson of dense, readable combat chrome into InkBlade's wuxia ink-wash style: resource seals, pressure plaques, status chips, pile counters, and target feedback should be legible at screenshot speed.

## Implemented Scope

- Rebuilt player and enemy resource readouts as explicit HUD chips with accessible `player-resource` and `enemy-resource` test ids.
- Converted player/enemy status lines into stable chip groups for block, mind, ink marks, and glossary-backed statuses.
- Added an intent pressure label (`轻势`, `逼近`, `重压`) inside the enemy intent plaque while preserving existing glossary tooltip behavior.
- Rebuilt draw/discard/exhaust pile counters as icon-led controls with glossary ids and accessible labels.
- Strengthened target feedback chips with feedback-kind icon marks and clearer damage/block/status tone treatments.
- Tuned played-card feedback and topbar meter styling for stronger commercial combat readability.
- Extended Chromium visual-smoke assertions to lock resource, intent-pressure, pile glossary, and feedback-tone surfaces.

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

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "Diao Chan starting|can complete the first chapter|can enter a second chapter"
Result: passed, 3 Chromium tests.
```

## Notes

- The existing reduced-motion class already disables target feedback, played feedback, floating text, combat VFX, sprite attack, standee attack, and hit animations. Wave 61 adds no new animation class outside that coverage.
- A temporary local `node_modules` symlink was used in the worktree for local tool resolution; it is not part of the patch.
- Subagent quota was still unavailable, so this wave was completed locally in the dedicated worktree.
