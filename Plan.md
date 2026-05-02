# Inkblade Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or an equivalent PM -> Explorer -> Builder -> Tester -> Reporter flow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser vertical slice for 《云水江湖》 with deterministic card combat, two characters, route map progression, and ink-wash combat UI.

**Architecture:** Pure TypeScript systems own combat, cards, rewards, map, and run state. Phaser renders the battlefield and effects. DOM overlays render dense HUD, cards, rewards, character select, map, shop, rest, and event surfaces.

**Current Platform Priority:** Desktop browser first. Mobile layout and touch adaptation are paused until the user explicitly requests mobile work again.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, Playwright, CSS custom properties.

---

## Milestone 0: Project Runbooks And Repo Setup

- [x] Create `AGENTS.md`, `Prompt.md`, `Plan.md`, `Implement.md`, and `Documentation.md`.
- [x] Create `.codex/agents/*.toml` role configs.
- [x] Create reusable workflow notes under `skills/inkblade-long-run/SKILL.md`.
- [x] Initialize git if no repository exists.
- [x] Commit the runbooks as the first baseline if git is available.

Verification:

```bash
git status --short
```

## Milestone 1: App Scaffold And Test Harness

- [x] Create package metadata and scripts.
- [x] Install Vite, TypeScript, Phaser, Vitest, Playwright, jsdom.
- [x] Create `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`.
- [x] Create `src/main.ts`, app shell, Phaser config, and `src/styles/theme.css`.
- [x] Add smoke test proving the app root can be created.

Verification:

```bash
npm test
npm run build
```

## Milestone 2: Core Combat Simulation

- [x] Add typed data models for cards, characters, enemies, statuses, combat state, actions, and effects.
- [x] Add deterministic RNG utility.
- [x] Implement battle setup: starter deck clone, shuffle, opening draw, enemy intent.
- [x] Implement card play: energy validation, target validation, effect execution, discard/exhaust.
- [x] Implement turn flow: player end turn, enemy actions, block timing, draw next hand.
- [x] Implement damage, block, vulnerable, weak, charm, dodge, ink marks, mind state basics.
- [x] Implement Zhao Yun spear momentum, break-formation, guard.
- [x] Implement Diao Chan dance momentum and charm.

Verification:

```bash
npm test -- --run tests/combat
npm run build
```

## Milestone 3: Data Slice

- [x] Add characters: Zhao Yun and Diao Chan.
- [x] Add starter decks and at least 24 cards total across common and character pools.
- [x] Add enemies: 墨化山贼, 无面兵卒, 纸伞女鬼, 剑痴残影, 墨影董卓.
- [x] Add relics: 白龙枪缨, 闭月香囊, 旧木剑, 黑纸伞 as data definitions.
- [x] Add events: 黑雨渡口, 长坂回声, 宫灯旧宴 as first UI/event flow placeholders.
- [x] Add map node pools and reward rules.

Verification:

```bash
npm test -- --run tests/data
npm run build
```

## Milestone 4: Run Flow And UI

- [x] Build application shell state machine: title, character select, map, combat, reward, event, shop, rest, victory/defeat.
- [x] Build Phaser battlefield scene with procedural ink landscape and silhouettes.
- [x] Build DOM HUD: top bars, resource meters, enemy intents, deck counts, hand cards, end-turn button.
- [x] Build route map UI with clickable connected nodes.
- [x] Build reward, event, shop, and rest surfaces.
- [x] Add responsive layout for desktop and mobile widths.

Verification:

```bash
npm test
npm run build
```

## Milestone 5: Browser Playtest And Polish

- [x] Add Playwright smoke test for boot, character select, first battle, play card, end turn, reward transition.
- [x] Capture desktop and mobile screenshots.
- [x] Fix layout overlap, blank canvas, unreadable text, and broken inputs found in screenshot review.
- [x] Update `Documentation.md` with final status and known gaps.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 6: Roguelike Progression Depth

- [x] Add active relic trigger support for starting relics and shop relics.
- [x] Persist run relics into combat and show them in run status.
- [x] Persist current run HP into combat setup.
- [x] Add deck card upgrades and pass upgraded instances into combat.
- [x] Add shop relic purchase and card removal service.
- [x] Add rest-site card upgrade choice.
- [x] Cover shop, event-rest, and starting relic flows with Playwright.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 7: Spoils And Deck Visibility

- [x] Move battle spoils into the run system.
- [x] Add normal, elite, and boss spoils rules.
- [x] Award elite/boss relics from the next unowned relic pool.
- [x] Add boss reward bridge screen before chapter victory.
- [x] Add deck viewer overlay from map, reward, event, shop, rest, and boss reward screens.
- [x] Show upgraded cards with `+` in combat and deck viewer.
- [x] Cover spoils rules with unit tests and deck viewer with Playwright.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 8: Combat Feedback Layer

- [x] Render recent combat log entries in the battle HUD.
- [x] Surface relic and character trigger names such as 闭月香囊 and 破阵.
- [x] Add browser assertion that a starting relic trigger appears in combat feedback.
- [x] Add combat visual event stream for damage, block, status, resource, ink, draw, trigger, and turn cues.
- [x] Render battle floating text, hit shudder, guard glow, and active-card press feedback.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 9: First Art Asset Pass

- [x] Add a combat portrait manifest for playable characters and first-chapter enemies.
- [x] Add repo-local ink-wash SVG portraits for Zhao Yun, Diao Chan, normal enemies, elite, and boss.
- [x] Replace initial-letter combat portraits with actual art assets.
- [x] Verify content registry and browser combat image references.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 10: Deeper Card System

- [x] Add card-specific upgrade data with upgraded effects and upgraded descriptions.
- [x] Use upgraded effects in combat instead of relying only on a generic `+3` rule.
- [x] Show upgraded cost and description in hand cards and deck viewer.
- [x] Add new uncommon/rare Zhao Yun, Diao Chan, common, and ink cards.
- [x] Split normal and elite reward pools so elite rewards offer stronger cards.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 11: Map And Event Expansion

- [x] Add `eventId` to map nodes.
- [x] Route Zhao Yun to 长坂回声 and Diao Chan to 宫灯旧宴.
- [x] Render events from the current map node instead of a fixed event.
- [x] Add deterministic `mapSeed` support for route/enemy variants.
- [x] Verify character events and seeded route variants.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 12: MVP Completion Gate

- [x] Add browser acceptance for a full first-chapter route ending in victory.
- [x] Tune late normal and boss combat for MVP-completable pacing.
- [x] Make browser combat helper prefer playable attack cards for stable chapter completion verification.
- [x] Verify first chapter victory screen after Boss reward bridge.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 13: Save And Continue Run System

- [x] Add a versioned local save slot for controller snapshots.
- [x] Persist map, reward, event, shop, rest, boss-reward, and in-combat states.
- [x] Add title actions for continue run and clear save.
- [x] Clear the continue slot after victory or defeat.
- [x] Cover serialization, invalid save rejection, clearing, and browser reload/continue.

Verification:

```bash
npm test -- --run tests/save/save-system.test.ts
npm run test:e2e
```

## Milestone 14: Procedural Chapter Map Topology

- [x] Add floor/lane metadata to map nodes.
- [x] Generate a wider seeded chapter-one topology with optional side battles, late events, elite branches, rest/shop cross-links, and boss convergence.
- [x] Preserve the MVP completion route: `event-1 -> rest-1 -> battle-3 -> boss`.
- [x] Render the route as a left-to-right topology instead of a fixed three-column list.
- [x] Cover seeded branch variation and forward-only connections with unit tests.

Verification:

```bash
npm test -- --run tests/run/run-system.test.ts
npm run build
```

## Milestone 15: Ink Art Asset And Battle Atmosphere Pass

- [x] Add a Luoshui ink-wash battlefield asset and use it in Phaser.
- [x] Add card art assets and a card-art manifest for featured cards and type fallbacks.
- [x] Add attack sprite strips for Zhao Yun, Diao Chan, and enemy slashes.
- [x] Add the missing 血旗都尉 portrait asset.
- [x] Render card art in hand, reward, and deck views.
- [x] Render combat sprite strips and verify sprite/card-art references in browser smoke tests.

Verification:

```bash
npm test -- --run tests/data/content.test.ts
npm run build
npm run test:e2e
```

## Milestone 16: GPT Image 2 Reference-Style Art Replacement

- [x] Generate a reference-style Luoshui battlefield with GPT Image 2.
- [x] Generate full-body combat standees for Zhao Yun, Diao Chan, 墨化山贼, and 墨影董卓.
- [x] Generate a six-panel wuxia card art sheet and crop it into individual game card art assets.
- [x] Post-process standees to remove the light paper background for cleaner in-battle compositing.
- [x] Replace SVG placeholder art references in combat, card art, and battlefield manifests with generated PNG assets.
- [x] Rework combat layout toward the provided preview: large full-body duelants, portrait health bars, ink battlefield center, and card hand layered over the lower field.
- [x] Verify desktop/mobile screenshots after the replacement pass.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 17: Generated Art Regression Cleanup

- [x] Fix the Diao Chan standee cutout regression so pale body and costume regions are not deleted.
- [x] Remove legacy sprite-strip combat placeholders that overlapped the generated standee art.
- [x] Rebalance hand-card art scale and card-frame details for clearer ink-wash cards.
- [x] Add browser assertions for no legacy sprite overlays, intact Diao Chan standee reference, and contained card artwork.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 18: Playable Character Art Identity Fix

- [x] Record desktop-first scope in project rules and PRD.
- [x] Replace the incorrect generated Zhao Yun standee with a male silver-blue spear general.
- [x] Replace the incorrect Diao Chan/Cai Wenji-like standee with a red-white Diao Chan dancer asset.
- [x] Cut out generated standees locally and bind combat portraits/standees to transparent assets.
- [x] Generate matching desktop attack sprite strips from the corrected cutouts.
- [x] Render sprite strips only during attack feedback so idle standees do not overlap placeholders.
- [x] Add data and browser regression checks for identity-correct art assets.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 19: Desktop Combat Art Workflow And Layout Regression Fix

- [x] Create a reusable project skill for the generated art asset workflow.
- [x] Record the docs re-read requirement for future feature, story, UI, and art generation work.
- [x] Add enemy-specific generated attack sprite strips for normal enemies and Dong Zhuo-class enemies.
- [x] Route enemy attack visuals away from the legacy black placeholder strip.
- [x] Rework desktop combat layout toward the user reference: top health bars, central standees, bottom hand, separated left energy orb, right-side controls.
- [x] Add browser regression checks for enemy attack strips, standee/hand separation, and energy/card spacing.
- [x] Review desktop screenshots against the provided combat reference.

Verification:

```bash
npm test -- --run tests/data/content.test.ts
npm run build
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run test:e2e
```
