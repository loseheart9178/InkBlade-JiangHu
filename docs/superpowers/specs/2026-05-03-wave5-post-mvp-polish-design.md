# Wave 5 Post-MVP Polish Design

## Context

Wave 4 closed the current desktop MVP gate: four playable characters, GPT Image 2 priority art, deterministic route balance, save/continue coverage, and desktop release QA are passing. The next polish wave should convert remaining honest MVP gaps into playable surfaces without reopening mobile work.

## Goals

- Show the correct ink-wash battlefield for each chapter, including `墨渊照心`, instead of always rendering 洛水 behind combat.
- Let QA and players enter a browser-playable final-chapter boss route, not only a debug ending summary.
- Turn the settings shell into a real persisted desktop settings surface and add a lightweight procedural audio feedback layer.
- Track and prioritize remaining low-priority card art fallback coverage without blocking runtime stability.

## Non-Goals

- Mobile layout, touch controls, Steam packaging, localization, production-quality composed music, or full final-chapter narrative branching.
- Replacing every low-priority filler card with GPT Image 2 art in this single wave.
- Moving gameplay rules into Phaser scenes or DOM render code.

## Design

### Dynamic Chapter Battlefields

`src/game/content/visuals.ts` already owns `battlefieldAssets` for `luoshui`, `bamboo`, `changan`, and `moyuan`. Phaser should preload all battlefield assets and react to a small DOM-to-Phaser event such as `inkblade:set-battlefield`. The DOM controller should dispatch the current `run.chapterId` whenever combat renders, and also expose `data-battlefield` on the combat panel so Playwright can assert the route context without inspecting Phaser internals.

### Browser Final Boss Route

Use the existing pure debug run helper as a bridge, not a hidden game rule. Add a title debug action that creates an advanced `moyuan` run, opens the final map, and allows selecting the real final boss node. E2E should click through title -> final debug route -> boss node -> combat, confirm `无名史官`, win the combat through existing test helpers, and assert the ending/profile summary path. Normal run systems remain the source of truth for chapter, boss, completion, and ending evaluation.

### Settings And Procedural Audio

Persist desktop settings in localStorage separately from run saves. The existing settings shell should load saved values, let sliders change master/music volumes, and expose a mute/reduced-motion contract. A small `src/app/audioFeedback.ts` module can use WebAudio when available and no-op in tests or unsupported browsers. UI actions, card play, victory, and defeat can trigger short procedural tones. Tests assert persistence and no throw, not subjective sound quality.

### Card Art Coverage Ledger

The generated asset audit now clears tracked `ink-pass` debt, but some low-priority cards share type-level fallback art. Add an audit section that reports card IDs using fallback art and groups them by character/type/rarity. This creates a safe GPT Image 2 queue for later batches without turning every fallback into a blocker.

## Testing

- Unit tests for battlefield selection helpers, final-route debug run setup, settings persistence/audio no-op behavior, and fallback art ledger counts.
- Playwright tests for route-specific battlefield attributes, final boss browser route, settings persistence after reload, and updated visual smoke screenshots.
- Final gate: `node scripts/audit-generated-assets.mjs`, `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.

## Approved Assumption

The user has explicitly granted autonomous planning and execution authority. This design is treated as approved for implementation; no user confirmation is required unless an external resource blocks progress.
