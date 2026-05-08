# Wave 55 Scene Surfaces Plan

**Worker:** C

**Goal:** Turn reward, shop, event, and rest screens into ink-wash jianghu scene surfaces without changing gameplay logic.

## Scope

- Reward: present card picks as a scroll/case surface, keep reward-fit, combo mark, reason text, spoils, and skip behavior.
- Shop: present card, relic, and service offers as tea-house merchant sections with clear price, affordability, and owned state.
- Event: keep existing illustrated event scenes while making choices feel like compact jianghu decision slips with readable effect chips.
- Rest: present heal and upgrade as a quiet ruined-temple repair scene with clearer action hierarchy.
- Add only lightweight classes, wrappers, and test ids in reward/shop/event/rest render paths.

## Non-goals

- No combat, route, victory, defeat, chapter transition, balance, economy, save, package, or asset-generation work.
- No new images; use existing backgrounds and generated art only.
- No changes to card-art audit scripts, generated cards, reports, or package files.

## Implementation Tasks

- [x] Add screen-level wrappers/test ids for reward, shop, event, and rest surfaces.
- [x] Add scene-specific CSS for scroll/case, merchant table, event slips, and rest altar surfaces.
- [x] Preserve existing clickable elements and test ids.
- [x] Extend existing Playwright flow assertions for the new scene wrappers and no-overlap-adjacent surfaces.
- [x] Record verification results in `Documentation.md`.

## Acceptance Gate

- Reward/shop/event/rest desktop surfaces have distinct scene composition, readable button text, and no obvious overlap.
- Existing reward pick, reward skip, shop purchase, shop leave, event choice, rest heal, and rest upgrade flows remain unchanged.
- TypeScript check, focused Playwright flow grep, and `git diff --check` pass.

## Verification Commands

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "reward|shop|event|rest"
git diff --check
```

## Implemented Scope

- Added `reward-stage`, `reward-card-case`, and `reward-footer` wrappers so the reward screen reads as a scroll/case surface while preserving card pick and skip behavior.
- Added `shop-scene`, `shop-marquee`, and card/relic/service sections so the shop reads as a tea-house merchant table with clearer price and purchase state treatment.
- Added `event-layout` and `event-choices` testable scene wrappers and tightened event choice slip styling.
- Added `rest-scene`, `rest-hero`, and `rest-actions` wrappers so rest choices sit beside a quiet ruined-temple repair scene.
- Extended focused Playwright assertions for scene wrappers, adjacent-section gaps, and hero/action no-overlap checks.

## Verification Results

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "reward|shop|event|rest"
Result: passed, 9 Chromium tests.

git diff --check
Result: passed.
```

## Risks

- This wave uses existing background imagery and CSS material treatment only; it does not replace or generate new art.
- Mobile layout receives responsive stacking rules but the explicit gate remains desktop Chromium.
