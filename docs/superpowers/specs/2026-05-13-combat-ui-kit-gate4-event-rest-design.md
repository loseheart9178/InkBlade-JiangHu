# Combat UI Kit Gate 4 Event And Rest Design

## Goal

Extend the approved combat UI kit language into the desktop Event and Rest decision scenes without changing event effects, rest recovery, upgrade rules, routing, saves, or map flow.

## Scope

Gate 4 covers production Event and Rest surfaces only. It does not redesign Map, Title, Compendium, mobile portrait, gameplay systems, event content, rest balance, or generated UI assets.

## Player Value

- Event choices should read as jianghu encounter cards with visible consequence chips, not plain form buttons.
- Rest choices should read as a camp/base decision surface for healing or refining a card, not a utility menu.
- Existing scene headers, event illustrations, event effect summaries, disabled upgrade state, and route continuation behavior must remain intact.

## Approved Visual Direction

Reuse the visual vocabulary established by Gate 2 and Gate 3: xuan-paper surfaces, restrained cinnabar seals, jade accents, dark ink borders, layered paper cards, and subtle kit ornamentation. No new AI images, PSDs, or manifest entries are introduced.

Event keeps its current scene image shell, but the layout receives a `event-layout--kit` hook and the choices receive `choice-action--event-kit`. Rest keeps its current hero image shell, but the scene receives `rest-scene--kit` and the actions receive `choice-action--rest-kit`.

## Event Surface

Event receives:

- `event-layout--kit` on the scene surface.
- `event-choices--kit` on the choice rail.
- `choice-action--event-kit` on every event choice button.
- `data-event-choice-tone` derived from the strongest visible consequence tone: `cost`, `ink`, `mind`, `upgrade`, or `gain`.
- Existing `event-effect-chip`, `event-scene`, `event-kicker`, and `event-choice-*` test ids remain unchanged.

## Rest Surface

Rest receives:

- `rest-scene--kit` on the scene surface.
- `rest-actions--kit` on the action group.
- `choice-action--rest-kit` on both rest action buttons.
- `data-rest-action="heal"` and `data-rest-action="upgrade"` for the two decisions.
- Existing disabled upgrade behavior and `rest-heal` / `rest-upgrade-card` test ids remain unchanged.

## Testing

Add desktop Playwright assertions in `tests/e2e/playable-flow.spec.ts`:

- Event layout and choice rail expose kit classes.
- Event choice buttons expose the kit class, keep visible effect chips, and expose a consequence tone.
- Rest scene and action group expose kit classes.
- Heal and upgrade actions expose kit classes and stable action data attributes.
- Existing event choice and rest upgrade flows still advance to map.

## Acceptance Criteria

- Event and Rest use the same UI kit visual language as Reward and Shop while preserving their scene-specific identities.
- Consequence summaries and rest decisions remain readable at desktop landscape sizes.
- No gameplay logic, content, save schema, or map route behavior changes.
- Focused Event/Rest Playwright coverage, full e2e verification, typecheck, unit tests, and production build pass.
