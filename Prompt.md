# Prompt.md

## Complete PRD

Build a playable first vertical slice for 《云水江湖》, a water-ink Chinese wuxia deckbuilding roguelike.

## Product Goal

The slice should prove the core promise:

> Players are not only playing cards; they are performing martial arts, shaping a deck, and choosing a state of mind inside an ink-corrupted jianghu.

## In Scope For This Development Pass

- Browser-playable 2D prototype.
- Desktop browser is the active target for this development phase; mobile adaptation is temporarily out of scope unless explicitly requested later.
- Phaser canvas for battlefield presentation.
- DOM HUD for text-heavy combat controls and menus.
- Character select with at least Zhao Yun and Diao Chan playable.
- Turn-based card combat:
  - draw pile, hand, discard pile, exhaust pile
  - energy
  - card cost validation
  - enemy intent
  - health, block, damage
  - victory and defeat states
- Character resources:
  - Zhao Yun: spear momentum, third attack break-formation trigger, guard reduction.
  - Diao Chan: dance momentum, charm, dodge-flavored defensive play.
- First chapter route map:
  - normal battle
  - elite battle
  - event
  - shop
  - rest
  - boss
- Card reward after battle with skip option.
- Small but coherent data set:
  - starter decks
  - core common cards
  - several Zhao Yun and Diao Chan cards
  - chapter-one enemies
  - one boss: 墨影董卓
  - a few relics and events
- Ink-wash visual direction approximating the provided preview image:
  - xuan paper background
  - ink mountain battlefield
  - red/teal role accents
  - top combat bars
  - bottom brush-frame hand cards
  - readable center playfield

## Out Of Scope For This Pass

- Full four-character roster.
- Complete 150+ card pool.
- Full multi-chapter campaign.
- Complete ending system.
- Full procedural event library.
- Production character illustration set.
- Audio production.
- Steam packaging.
- Meta progression, achievements, daily challenges.
- Mobile layout and touch-specific adaptation during the current desktop-first phase.

## Acceptance Criteria

- A user can run the app locally and reach an actionable first screen.
- A user can select Zhao Yun or Diao Chan.
- A user can enter a run map, choose nodes, fight enemies, receive rewards, and continue.
- The first combat teaches the loop without a tutorial wall.
- The combat system enforces energy, draw/discard cycling, damage/block, enemy intent, and end-turn enemy action.
- Zhao Yun and Diao Chan feel mechanically different in the prototype.
- At least one特色系统, either mind state or ink mark, is visible and has gameplay impact.
- The build passes TypeScript/Vite build.
- Core simulation modules have automated tests.
- A desktop browser playtest confirms boot, card play, end turn, reward transition, and desktop visual sanity.

## Done When

- `Documentation.md` records the latest milestone, verification output, and remaining gaps.
- `npm test` passes.
- `npm run build` passes.
- Desktop browser playtest screenshots show a nonblank ink-wash combat screen and usable UI.
- The final response includes local URL, changed files summary, verification, and known next steps.
