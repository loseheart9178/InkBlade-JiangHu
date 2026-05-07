# Wave 44 Live Build Compass Design

## Goal

Move the Wave 43 build recap into the in-run deck viewer so players can understand their current martial style before the run ends.

## Player Value

- EA playtesters can inspect their build direction during map, reward, shop, rest, event, and boss-reward flow.
- The current deck viewer becomes a planning tool, not only a card list.
- The feature helps players connect rewards, methods, relics, and challenges to the same “what am I becoming?” language used in the completed-run summary.

## Scope

In scope:

- Reuse `createDeckBuildRecap()` from `src/game/systems/deck/buildRecap.ts`.
- Render a compact live build compass inside the existing deck overlay.
- Preserve the existing `deck-archetype-summary` test surface.
- Add new `deck-build-compass`, `deck-build-primary`, and `deck-build-signature-card` test ids.
- Focused Playwright coverage for the deck viewer before combat and after reward growth.

Out of scope:

- New combat rules, card reward rules, persistence, analytics, or platform services.
- Steam/storefront/release packaging.
- New art generation or asset replacement.
- Mobile layout work.

## Acceptance Criteria

- Opening the deck viewer during a run shows the live build compass.
- The compass displays current style, signature cards, type/tactical details, and method/relic/challenge support cues when available.
- Starter decks still show useful signature cards even when no archetype has formed.
- Existing deck viewer card list, `deck-archetype-summary`, and close behavior remain unchanged.
- Existing run summary build recap remains unchanged.
- Browser coverage verifies the compass from a normal desktop run.
