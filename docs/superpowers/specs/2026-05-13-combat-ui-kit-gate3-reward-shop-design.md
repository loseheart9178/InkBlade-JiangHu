# Combat UI Kit Gate 3 Reward And Shop Design

## Goal

Extend the approved combat UI kit language from desktop combat into the two most repeated post-combat decision surfaces: card rewards and the shop.

## Scope

Gate 3 covers production Reward and Shop surfaces only. It does not redesign Map, Event, Rest, Compendium, Title, mobile portrait, gameplay rules, reward drafting, shop pricing, relic logic, or card art assets.

## Player Value

- Reward choices should feel like premium card objects from the same world as the combat hand.
- Shop card offers should use the same frame, cost seal, art window, type plaque, and readable text hierarchy as combat/reward cards.
- Relic and service offers should gain stronger in-world section treatment without pretending to be cards.
- Existing build-fit guidance, reward reasons, shop slot notes, prices, and affordances must stay readable.

## Approved Visual Direction

Reuse Gate 2 assets from `public/assets/generated/ui/combat-hud/` through the typed contract in `src/app/combatUiKit.ts`.

Use these assets:

- `card-frame-common`, `card-frame-uncommon`, `card-frame-rare`, `card-frame-event` for reward cards and shop card offers.
- `pile-seal` as a small ornamental seal for reward/shop section markers and price/resource chips.
- `hand-shelf` only as a subtle shelf/backplate texture behind card groups, never as a dominant bottom combat shelf outside combat.

Do not introduce new AI images, PSDs, or manifest entries in this gate.

## Architecture

Keep the current Phaser + DOM split unchanged. Reward and Shop are DOM surfaces in `src/app/inkbladeController.ts` styled by `src/styles/theme.css`.

Move card-frame rarity selection into `src/app/combatUiKit.ts` so combat, reward, and shop share one helper. Production renderers set CSS variables on each card-like button instead of hard-coding asset URLs in CSS.

## Reward Surface

Reward cards receive:

- A `reward-card--kit` class.
- `--ui-kit-card-frame` set from the card rarity.
- Existing card art remains `object-fit: contain` through `card-art--kit`; do not crop current card art.
- Existing `reward-archetype-role`, `reward-build-fit`, `reward-build-fit-detail`, and `reward-reason` remain visible.
- The reward card case gets a subtle kit shelf/backplate class but keeps the existing no-overlap vertical rhythm.

## Shop Surface

Shop card offers receive:

- A `shop-item--kit` class on card offer buttons only.
- `--ui-kit-card-frame` set from the offered card rarity.
- Existing `shop-build-fit`, `shop-build-fit-detail`, slot notes, price chips, and affordability states remain unchanged.

Relic and service offers do not use card frames. They may use stronger section borders, seal-backed price chips, and kit-colored surfaces, but must remain visually distinct from cards.

## Testing

Add or extend desktop Playwright assertions in `tests/e2e/playable-flow.spec.ts`:

- Reward cards expose `reward-card--kit`, inline `--ui-kit-card-frame`, visible `card-art--kit`, and still pass existing art-window/no-overlap checks.
- Shop card offers expose `shop-item--kit`, inline `--ui-kit-card-frame`, visible `card-art--kit`, and still pass existing shop build-fit/price checks.
- Relic/service shop items remain `shop-item--relic` / `shop-item--service` and do not receive `shop-item--kit`.

Run focused browser tests for reward/shop, TypeScript, UI kit manifest tests, full visual smoke, and production build.

## Acceptance Criteria

- Reward and shop card surfaces visually reuse the approved Gate 2 UI kit card frames.
- Card art remains uncut for review.
- Reward/shop existing behavior remains unchanged.
- Desktop reward/shop screenshots remain readable and non-overlapping.
- No new mobile portrait work is introduced.
- No new asset generation is required.
