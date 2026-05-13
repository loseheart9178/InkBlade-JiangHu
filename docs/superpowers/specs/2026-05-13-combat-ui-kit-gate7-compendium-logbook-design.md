# Combat UI Kit Gate 7 Compendium And Logbook Design

## Goal

Extend the approved combat UI kit language into Compendium and Logbook surfaces so reference browsing and story records feel like in-world dossiers.

## Scope

Gate 7 covers production Compendium and Logbook presentation only. It does not change unlock rules, filters, compendium content, logbook entries, save data, Title, Map, or gameplay systems.

## Player Value

- Compendium entries should read as organized paper dossiers with clear unlock badges and metadata chips.
- Logbook entries should read as recorded jianghu fragments rather than utility list rows.
- Existing filters, tabs, unlock states, and back navigation must remain unchanged.

## Visual Direction

Reuse Gate2-Gate6 motifs: xuan-paper panels, cinnabar seals, jade accents, ink borders, compact chip rows, and layered paper cards. No new generated assets or manifest changes.

## Hooks

Compendium receives `compendium-screen--kit`, `compendium-tabs--kit`, `compendium-filters--kit`, `compendium-list--kit`, `compendium-item--kit`, `compendium-meta--kit`, and `compendium-unlock-badge--kit`.

Logbook receives `logbook-screen--kit`, `logbook-list--kit`, and `logbook-entry--kit`.

Existing test ids and data attributes remain unchanged.

## Testing

Extend existing Playwright coverage for title and map compendium entry points plus logbook:

- Compendium shell, tabs, filters, list, item cards, unlock badge, and meta chips expose kit classes.
- Logbook shell, list, and entries expose kit classes.
- Existing filter/back behavior remains intact.

## Acceptance Criteria

- Compendium and Logbook visually align with prior UI kit gates.
- Existing unlock/filter/navigation behavior remains unchanged.
- Focused e2e, unit tests, typecheck, build, and Chromium e2e pass.
