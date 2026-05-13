# Combat UI Kit Gate 8 Visual QA Polish Design

## Goal

Add a final desktop visual QA guard for the combat UI kit rollout so core kit surfaces resist text overflow and future visual regressions.

## Scope

Gate 8 covers cross-surface visual QA hooks and text overflow guard styling. It does not redesign gameplay, add new assets, change layout flow, alter content, or replace the focused Gate3-Gate7 surface tests.

## Player Value

- Long localized strings, labels, and metadata chips should wrap safely inside kit surfaces.
- QA can identify the complete UI kit rollout from a stable root hook.
- Existing desktop visual smoke tests gain one cross-surface protection layer.

## Visual QA Hooks

The HUD root receives:

- `ui-kit-visual-qa`
- `data-ui-kit-gates="3-8"`

The class enables CSS text guards for:

- character/challenge choices
- route map nodes and preview slips
- reward/shop cards
- event/rest choices
- compendium/logbook dossier cards

## Testing

Extend visual smoke coverage to assert:

- The HUD root exposes `ui-kit-visual-qa` and `data-ui-kit-gates="3-8"`.
- Representative kit cards expose `overflow-wrap: anywhere`.
- Existing title layout overflow assertions still pass.

## Acceptance Criteria

- Cross-surface text guard is active from app boot.
- Existing UI kit gate hooks remain intact.
- Unit tests, typecheck, build, focused visual smoke, and Chromium e2e pass.
