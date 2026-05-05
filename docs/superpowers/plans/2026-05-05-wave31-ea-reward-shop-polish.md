# Wave 31 EA Reward And Shop Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development for independent test/style/review slices when available. Keep gameplay rules in TypeScript systems; this wave is DOM/CSS presentation only.

**Goal:** Bring the post-combat reward and shop surfaces closer to EA showcase quality so players can read card, relic, price, and service choices at a glance.

**Scope decision:** This wave excludes Steam/storefront/release preparation and excludes new economy mechanics. Prices, rewards, relic pools, card pools, and removal rules remain unchanged.

**Primary files:**

- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/e2e/playable-flow.spec.ts`
- `Documentation.md`

## Acceptance Criteria

- [ ] Reward screen keeps the existing card art/chrome/archetype explanation and adds a stable `reward-skip` test hook for the skip choice.
- [ ] Shop card choices use the same card visual language as reward/combat cards: art, type/rarity chrome, keywords, description, and a visible price chip.
- [ ] Shop relic choices expose rarity/source, trigger text, description, price, owned state, and affordability state without English source labels.
- [ ] Shop removal service shows the target card name, price, and unavailable reason when the deck is too thin.
- [ ] Browser tests verify the polished reward/shop DOM and capture a desktop screenshot.
- [ ] Full verification passes: unit tests, TypeScript, Vite build, and Playwright e2e.

## Implementation Tasks

- [ ] Add a RED Playwright check to `tests/e2e/playable-flow.spec.ts` around the existing shop route:
  - assert `reward-skip` is visible on the reward screen;
  - assert `shop-card-common_pifeng` has card art/chrome/keyword rows and a `shop-price-chip` with `35`;
  - assert `shop-relic-relic_old_wooden_sword` has rarity/source metadata, trigger text, and a `shop-price-chip` with `65`;
  - assert `shop-remove-card` exposes the target card and price;
  - capture a `wave31-shop-surface.png` screenshot.
- [ ] Replace generic `createAction` shop card buttons with a dedicated shop card renderer in `inkbladeController.ts`.
- [ ] Replace generic relic/service shop buttons with dedicated markup that exposes tags, prices, owned/affordable states, and stable test ids.
- [ ] Add compact CSS for `.shop-item`, `.shop-price-chip`, `.shop-meta-row`, `.shop-service-target`, and `.reward-skip` using the existing paper/ink/red/teal visual system.
- [ ] Update `Documentation.md` with docs read, implementation notes, verification, gaps, and next step.

## Verification Commands

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics"
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

## Known Risks

- This polish still relies on existing local card/relic assets and CSS composition; it is not a final bespoke illustration pass.
- The shop currently uses a fixed first-three shop relic pool and fixed card list; content breadth can be expanded in a later EA wave.
