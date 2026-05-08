# Wave 54 Combat Feedback Plan

**Goal:** Make combat state changes read more clearly in the commercial EA UI without touching combat math or content pools.

## Implemented Scope

- Add enemy intent presentation metadata for intent type and pressure.
- Render intent plaques with attack, block, and special visual treatments.
- Add target feedback chips for recent player/enemy damage, block, resource, ink, draw, status, and trigger events.
- Add a played-card feedback chip in the duel column so the player sees immediate card-play response.
- Make disabled combat cards clearer with energy-shortage titles and visual treatment.
- Respect reduced-motion by disabling nonessential feedback animations under `.prefers-reduced-motion`.
- Extend visual-smoke coverage for intent metadata, played feedback, target feedback, and no-overlap layout assertions.

## Non-goals

- No combat balance, card pool, relic, reward, save, or asset replacement changes.
- No drag-to-target implementation yet; this wave improves the existing click-to-play interaction.
- No Night Patrol assets or code are copied.

## Verification

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed, 4 Chromium tests.

git diff --check
Result: passed.
```

## Follow-up

- Later waves can add drag-to-target and release hot zones once core scene surfaces are stable.
