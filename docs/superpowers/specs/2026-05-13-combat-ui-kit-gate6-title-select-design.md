# Combat UI Kit Gate 6 Title And Character Select Design

## Goal

Extend the approved combat UI kit language into the desktop Title and Character Select surface so the first screen matches the production quality of Map, Reward, Shop, Event, and Rest.

## Scope

Gate 6 covers the production Title, route ledger, character choice cards, challenge profile choices, and title action row. It does not change start/continue/clear-save behavior, character stats, challenge rules, settings, Compendium, Logbook, or mobile portrait layout.

## Player Value

- The first screen should immediately read as the same ink-wash jianghu world as the later decision surfaces.
- Character choices should feel like role dossiers with stable resource/mechanic/stat hierarchy.
- Challenge choices and primary actions should use the same paper, seal, and route-state visual vocabulary as the rest of the UI kit.

## Approved Visual Direction

Reuse Gate2-Gate5 motifs: xuan-paper panels, cinnabar seals, jade accents, ink borders, route/intelligence slips, and restrained layered card borders. Do not add new generated images, PSDs, or manifest entries.

## Title Surface

Title receives:

- `title-screen--kit`.
- `title-route-ledger--kit`.
- `title-actions--kit`.

## Character And Challenge Select

Character select receives:

- `character-select--kit`.
- `character-choice--kit` on each character card.
- `data-character-role` from the selected character id.

Challenge select receives:

- `challenge-select--kit`.
- `challenge-choice--kit` on each challenge card.

Existing test ids, `aria-pressed`, selected state, and button behavior remain unchanged.

## Testing

Extend desktop Playwright coverage:

- Title shell, route ledger, character select, challenge select, and title actions expose kit classes.
- Every character card exposes `character-choice--kit` and `data-character-role`.
- Every challenge card exposes `challenge-choice--kit`.
- Existing selection, start, and continue state assertions remain intact.

## Acceptance Criteria

- Title/Character Select visually aligns with Gate3-Gate5 surfaces.
- Existing selection and start-run behavior remains unchanged.
- Focused title Playwright coverage, unit tests, typecheck, build, and Chromium e2e pass.
