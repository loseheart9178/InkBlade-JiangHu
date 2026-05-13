# Combat UI Kit Gate 5 Route Map Design

## Goal

Extend the approved combat UI kit language into the desktop route map so the journey surface reads as a jianghu travel chart rather than a plain node grid.

## Scope

Gate 5 covers the production Route Map surface only. It does not change route generation, available-node logic, map preview content, rewards, saves, Title, Compendium, Logbook, mobile portrait layout, or gameplay systems.

## Player Value

- Map nodes should feel like paper travel tokens with clear route state and encounter identity.
- Connectors should read as ink routes with obvious available, visited, and locked states.
- Preview and reward copy should feel like compact intelligence slips while preserving existing text.
- Existing route cinematic header and journey strip should visually align with Gate3/4 scene surfaces.

## Approved Visual Direction

Reuse the Gate2-Gate4 visual vocabulary: xuan-paper layering, cinnabar route emphasis, jade current-position emphasis, ink borders, restrained seal ornamentation, and subtle paper texture. Do not add new generated images, PSDs, or UI manifest entries.

## Route Map Surface

Route Map receives:

- `route-cinematic-header--kit` on the existing cinematic header.
- `route-journey-strip--kit` on the journey strip.
- `route-map--kit` on the node grid.
- `route-connectors--kit` on the connector SVG layer.

## Node And Preview Surface

Each map node receives:

- `map-node--kit`.
- `data-map-node-type` equal to the node type.
- Existing `data-route-state`, `data-preview-tone`, and `map-node-*` test ids remain unchanged.

Each preview/reward row receives:

- `map-node-preview--kit`.
- `map-node-reward--kit`.

## Testing

Extend the existing route-map Playwright test:

- Header, journey strip, route map, and connector layer expose kit classes.
- Battle, event, shop, and rest nodes expose `map-node--kit` and stable `data-map-node-type`.
- Preview and reward rows expose kit classes while preserving existing text.
- Connector state attributes remain unchanged.

## Acceptance Criteria

- Route Map visually aligns with Reward/Shop/Event/Rest UI kit language.
- Existing map behavior, route availability, previews, rewards, and debug skip behavior remain unchanged.
- Focused route-map Playwright coverage, unit tests, typecheck, build, and Chromium e2e pass.
