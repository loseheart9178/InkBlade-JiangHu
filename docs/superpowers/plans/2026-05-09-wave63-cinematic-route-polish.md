# Wave 63 Cinematic Route Polish

Date: 2026-05-09 Asia/Shanghai
Worktree: `.worktrees/wave63-cinematic-route-polish`
Branch: `codex/wave63-cinematic-route-polish`

## Goal

Wave 63 makes the title, route map, and chapter transition path read as one authored jianghu journey instead of separate utility screens. It adapts Night-Patrol-style commercial deckbuilder staging into InkBlade's ancient wuxia ink-wash language: paper layers, cinnabar seals, jade route lights, and restrained cinematic rails.

## Implementation Scope

- Rebuilt the title screen as a richer first-viewport scroll with a visible seal, loading brush thread, and route-sign ledger (`title-route-ledger`).
- Added a map line-report header (`route-cinematic-header`) with current stop, available route stack, next chapter, and route journey strip (`route-journey-strip`).
- Polished map framing, connector glow, available-node emphasis, mobile stacking, and reduced-motion behavior while preserving route generation and risk/reward previews.
- Added a reusable transition rail (`transition-cinematic-rail`) to chapter reward, boss reward, final choice, result, and run-summary dossiers.
- Added Playwright coverage for title route signs, map line report, journey strip chapter changes, and chapter/boss transition rails.

## Acceptance

- The title first viewport exposes a readable route ledger with the four route-sign beats: actor, four-chapter journey, deckbuilding combat core, and mind-state ending.
- The map surface exposes a cinematic route header, line-report stack, and progress strip that update when the active chapter changes.
- Chapter reward and boss reward screens expose a cinematic rail that links the cleared chapter, next route beat, spoils, and boss/chapter settlement context.
- Existing route connectors, node risk/reward previews, final choice eligibility, and save/continue logic remain covered by the surrounding Playwright flow.

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

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "route map shows|final boss route|complete the first chapter"
Result: passed, 3 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium
Result: passed, 33 Chromium tests.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.
```

## Notes

- Test/documentation updates were prepared by a parallel worker and integrated with the main implementation changes.
- The acceptance scope is presentation and verification only: no combat rules, map generation, save schema, or reward logic changed.
- A full playable-flow run caught and fixed one title-shell layering regression; settings, challenge selection, full playable flow, and final visual smoke were rerun after the fix.
