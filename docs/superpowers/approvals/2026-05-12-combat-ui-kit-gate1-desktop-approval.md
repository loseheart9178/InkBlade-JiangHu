# Combat UI Kit Gate 1 Desktop Approval Package

Date: 2026-05-12 Asia/Shanghai

## Recommendation

Gate 1 is ready for user approval from the current desktop-landscape target.

Do not treat mobile portrait screenshots or touch layout as blockers for this gate. Mobile portrait work remains paused by the project scope override in `AGENTS.md`, `Prompt.md`, `Plan.md`, and `docs/superpowers/plans/2026-05-09-combat-ui-kit.md`.

## Approval Scope

- Target viewport: desktop landscape browser, primarily `1280x720` and `1440x900`.
- Included surfaces: combat UI kit prototype, combat hand cards, deck viewer cards, reward cards, and shop cards.
- Excluded surfaces: mobile portrait layout, touch interaction, and `390x844` screenshot adaptation unless explicitly reopened.

## Review Artifacts

Tracked prototype artifact:

- `docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png`
- `docs/superpowers/prototypes/combat-ui-kit/index.html`
- `docs/superpowers/prototypes/combat-ui-kit/styles.css`
- `docs/superpowers/prototypes/combat-ui-kit/prototype.js`

Local QA screenshots for this approval pass:

- `output/card-art-qa/01-deck-viewer.png`
- `output/card-art-qa/02-combat.png`
- `output/card-art-qa/03-reward.png`
- `output/card-art-qa/04-shop.png`
- Focus crops:
  - `output/card-art-qa/01-deck-card-first.png`
  - `output/card-art-qa/02-combat-card-first.png`
  - `output/card-art-qa/03-reward-card-first.png`
  - `output/card-art-qa/04-shop-card-first.png`

## QA Result

Card-art window QA checked 21 visible card instances:

| Surface | Count |
| --- | ---: |
| Deck viewer | 10 |
| Combat hand | 5 |
| Reward | 3 |
| Shop | 3 |

Current gate failures: 0.

The QA checked that:

- Card images keep `object-fit: contain`.
- Portrait card images use a portrait-oriented art window.
- Cost, title, type badges, keyword chips, and descriptions do not overlap the art rectangle.
- The smallest art-window height share in the checked set is `0.26`, above the current gate threshold of `0.25`.

## Verification Commands

```text
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/combat-ui-prototype.spec.ts --project=chromium
Result: passed. Desktop prototype test passed; mobile portrait test skipped by scope.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium --grep "captures desktop combat smoke"
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "boots, enters a Zhao Yun battle"
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "shops can add relics"
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.

git diff --check
Result: passed.
```

## Known Non-Blockers

- `docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png` exists as a historical/reference artifact only.
- `output/card-art-qa/` is a local QA artifact folder and is not committed.
- Reward cards in `1280x720` can require vertical scrolling on the reward screen because the reward surface contains explanation text and build-fit metadata; the card art itself is not overlapped.

## Approval Decision

Recommended decision: approve Gate 1 for desktop-landscape, then begin Gate 2 production integration.

Gate 2 should wire the approved bitmap UI kit into production combat only after this approval, preserving Phaser for battlefield rendering and DOM for text-heavy controls.
