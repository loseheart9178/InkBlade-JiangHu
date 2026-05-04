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

## Milestone 20: Combat Presentation, Card HUD, Enemy Identity, And Chapter Event Polish

- [x] Add persistent ink-wash VFX adapters for damage slashes, guard/status sigils, ink spread, and trigger seals from combat visual events.
- [x] Refine hand/reward/deck card chrome with type badges, rarity marks, keyword chips, and cleaner brush-paper card hierarchy.
- [x] Create distinct transparent standees and attack sprite strips for 纸伞女鬼, 剑痴残影, 血旗都尉, and 墨影董卓.
- [x] Route boss/enemy attack animation playback to identity-specific sprite strips instead of shared placeholder art.
- [x] Rework the first-chapter event screen into a desktop scene presentation with ink battlefield vignette, event mark, story copy, and brush choices.
- [x] Add unit and browser regression checks for new assets, VFX DOM, card metadata chrome, event scene layout, and boss attack strip playback.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 21: Enemy Mechanics And Chapter One Combat Pacing

- [x] Extend enemy intents with data-driven special actions that can combine damage, block, status, ink pressure, and healing.
- [x] Make player weak and vulnerable statuses affect combat outcomes instead of only appearing in status text.
- [x] Give first-chapter enemies distinct mechanics:
  - 墨化山贼: first-safe attack/block teaching cadence,
  - 无面兵卒: low-pressure multi-hit cadence,
  - 纸伞女鬼: weak plus ink-pressure disruption,
  - 剑痴残影: charge/readiness into heavy strike,
  - 血旗都尉: armor and vulnerability pressure,
  - 墨影董卓: boss specials for 宫宴压迫, 吞噬权柄, and 墨宫倾塌.
- [x] Tune first-chapter enemy health upward by tier while preserving the MVP completion route.
- [x] Surface special enemy intents and richer player/enemy status lines in the combat HUD.
- [x] Add unit, data, and browser tests for special intent execution, status impact, enemy identity mechanics, and Boss pressure feedback.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 22: Combo Chain System MVP

- [x] Add system-level combo definitions for the initial recommended chains.
- [x] Track per-turn card type flow and once-per-turn combo triggers inside the combat system.
- [x] Implement 连斩、蓄势、追影、静守、心刃、固守、墨袭, plus a lightweight 消耗→攻击 断招 hook.
- [x] Reset combo tracking at player-turn start and normalize older saved combats that lack combo fields.
- [x] Surface combo feedback through combat log, visual trigger events, and a desktop center combo trail.
- [x] Cover combo damage, block, ink, draw, Zhao Yun break-formation coexistence, and desktop HUD visibility.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Milestone 23: Combo Chain Rewards And Card Pool Linkage

- [x] Track combat-wide combo triggers so battle rewards can read the whole fight, while the HUD combo trail still resets per turn.
- [x] Move card reward drafting into the run system instead of the controller.
- [x] Add combo-aware reward rules for 连斩、蓄势、追影、静守、心刃、固守、墨袭、断招.
- [x] Add first-slice combo support cards: 飞石 and 追影.
- [x] Keep ordinary battle rewards free of ink-rarity cards unless the player used 墨袭.
- [x] Surface reward bias in the reward screen with an 招式回响 hint and a highlighted primary card.
- [x] Cover combat memory, reward drafting, card pool data, and browser reward UI with tests.

Verification:

```bash
npm test -- tests/combat/combat-system.test.ts tests/run/run-system.test.ts tests/data/content.test.ts
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run test:e2e
```

## Milestone 24: Character Archetypes And Card Pool Deepening

- [x] Add explicit card archetype tags for Zhao Yun's 连斩枪势 / 护主防反 and Diao Chan's 舞势连击 / 魅惑控制 builds.
- [x] Expand the first-slice character card pool with archetype support cards:
  - 赵云：七进七出、白马突围、回马枪、枪围如墙.
  - 貂蝉：惊鸿一击、飞袖连环、离间、镜中花.
- [x] Teach combo-aware rewards to prefer the matching character archetype when a recent combo implies a build direction.
- [x] Add reward reason text so reward cards explain their archetype or support role.
- [x] Cover archetype tagging, reward reason selection, and browser reward UI with tests.

Verification:

```bash
npm test -- tests/data/content.test.ts tests/run/run-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

## Milestone 25: Signature Card Art And Martial VFX Pass

- [x] Re-read PRD, core gameplay, chapter-one, and Zhao Yun / Diao Chan character docs before visual implementation.
- [x] Add dedicated card-art manifest entries for the new Zhao Yun and Diao Chan archetype cards instead of falling back to generic type art.
- [x] Generate project-local ink-pass PNG runtime assets for the new card illustrations.
- [x] Add signature VFX manifest entries and transparent runtime PNG effects for 七进七出、枪围如墙、惊鸿一击、离间.
- [x] Emit source-aware combat visual events for signature martial cards so DOM/Phaser adapters can render card-specific effects without adding gameplay rules to renderer code.
- [x] Add regression tests for card art assets, VFX manifest entries, and signature-card visual events.
- [x] Verify desktop combat screenshots for top bars, center duel, bottom hand, energy separation, and attack-strip layout.

Verification:

```bash
npm test -- tests/data/content.test.ts tests/combat/combat-system.test.ts
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run test:e2e
```

## Milestone 26: Chapter Two Shell And Cross-Chapter Progression

- [x] Add chapter metadata for 洛水残照 and 竹林听雨.
- [x] Persist current chapter and completed chapter history in run state.
- [x] Generate a second-chapter route map with bamboo battle, event, rest, shop, elite, and Boss nodes.
- [x] Advance from first-chapter Boss rewards into the second chapter instead of ending the run immediately.
- [x] Surface the current chapter in run status and map title.
- [x] Cover second-chapter map topology and browser chapter transition with tests.

Verification:

```bash
npm test -- tests/run/run-system.test.ts tests/data/content.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
```

## Milestone 27: Chapter Two Enemy Mechanics And Status-Card Pressure

- [x] Add status cards 杂音、雨寒、残音 as temporary deck pollution.
- [x] Extend enemy intents with a data-driven `addCardToDiscard` effect.
- [x] Add second-chapter normal enemies, elites, and 琴魔·残音 Boss.
- [x] Implement 琴魔·残音's 悲声回环 hook: drawing status/curse cards grants Boss block.
- [x] Bind second-chapter enemies to existing ink-wash standee and attack-strip placeholders until dedicated art is generated.
- [x] Cover status-card pollution, Qin Demon status draw response, enemy data, and browser feedback with tests.

Verification:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
```

## Milestone 28: Cross-Chapter Growth And Advanced Rewards

- [x] Add chapter-end reward choices: maximum HP growth, deck upgrade, or rare character card.
- [x] Route Boss victories through chapter reward, Boss reward summary, then next-chapter transition or victory.
- [x] Make second-chapter card rewards weight more strongly toward character-specific build pieces.
- [x] Preserve chapter reward state through the save whitelist.
- [x] Style chapter reward choices with existing brush-paper action controls.
- [x] Cover chapter rewards with unit and browser tests.

Verification:

```bash
npm test -- tests/run/run-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
```

## Milestone 29: Chapter Two Art And Qin Demon Battlefield Pass

- [x] Register dedicated bamboo battlefield, Qin Demon, bamboo enemy standees, card art, and attack-strip asset paths.
- [x] Replace second-chapter enemy sprite lookup fallbacks with dedicated sequence-frame entries.
- [x] Add desktop combat background switching by chapter.
- [x] Verify all new asset paths exist and browser visual smoke still passes.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts
npm run build
npm run test:e2e
```

## Milestone 30: Status Cards, Cleanse, And Pollution Counterplay

- [x] Add 解穴 and 洗心 cleanse cards.
- [x] Add `cleanseCards` combat effect outside renderer code.
- [x] Let cleanse remove status/curse cards from combat piles and reduce Qin Demon status-draw snowball block.
- [x] Add 清音玉 and 断弦 relic hooks for cleanse/status counterplay.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts
npm test
```

## Milestone 31: Chapter Two Event Branch Deepening

- [x] Add 断弦老人、无字竹简、白马失路、红尘旧客 events.
- [x] Add late bamboo event variation to the second-chapter topology.
- [x] Keep character-specific branch filtering through existing event choice rules.

Verification:

```bash
npm test
npm run build
```

## Milestone 32: Qin Demon Boss Phase Deepening

- [x] Add data-driven enemy phase intent tables.
- [x] Switch 琴魔·残音 into 悲声回环 and 绝响不散 phases by HP threshold.
- [x] Emit combat log and visual trigger events on phase changes.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts
npm test
```

## Milestone 33: Chapter Two Combat Pacing And Reward Balance

- [x] Add cleanse cards to second/third chapter reward weighting.
- [x] Preserve at least two character-build reward slots for chapter-two drafts.
- [x] Add advanced reward draft choices for rare card, relic, method upgrade, and cleanse fallback.

Verification:

```bash
npm test -- tests/run/run-system.test.ts tests/roadmap/next-ten-modules.test.ts
```

## Milestone 34: Heart Method Upgrade System

- [x] Add run-level method level persistence.
- [x] Add `claimMethodUpgrade`.
- [x] Upgrade combat hooks for 龙胆连势、长坂守心、惊鸿舞谱、倾城心诀.
- [x] Surface method进境 in run status.

Verification:

```bash
npm test -- tests/methods/method-system.test.ts tests/roadmap/next-ten-modules.test.ts
npm run build
```

## Milestone 35: Advanced Relics And Rare Reward Linkage

- [x] Add 清音玉、断弦、朱批印、记忆竹简 relic definitions.
- [x] Include new relics in elite, boss, and shop reward ordering.
- [x] Add advanced reward draft module for rare cards, relics, method upgrades, and cleanse support.

Verification:

```bash
npm test -- tests/relics/relic-system.test.ts tests/roadmap/next-ten-modules.test.ts
npm test
```

## Milestone 36: Chapter Three Chang'an Ink City Shell

- [x] Add 长安墨城 chapter metadata and second-to-third chapter transition.
- [x] Add third-chapter enemies, elites, and 墨书执笔官 Boss.
- [x] Add third-chapter route map with 无面市集、逆写史街、白袍碑林、无面戏台、未央棋局.
- [x] Add third-chapter status card 涂史 and boss pressure loop.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts tests/run/run-system.test.ts
npm run build
```

## Milestone 37: Logbook And Story Fragment System

- [x] Add logbook content definitions.
- [x] Add run-level event, boss, and fragment unlock tracking.
- [x] Record event and boss fragments from controller flows.
- [x] Surface unlocked fragment count in run status.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts
npm run build
```

## Milestone 38: Developer Debug And Content Validation Tools

- [x] Add deterministic debug run factory for chapter, deck, relic, method, method level, and logbook setup.
- [x] Add roadmap regression tests covering the ten-module content contract.
- [x] Preserve desktop-only layout focus and skip mobile-specific implementation.

Verification:

```bash
npm test -- tests/roadmap/next-ten-modules.test.ts
npm test
npm run build
npm run test:e2e
```

## Milestone 39: GPT Image 2 Art Regression And Priority Asset Replacement

- [x] Remove generic circular combat VFX overlays that looked like leftover red/white sequence-frame arcs on characters and enemies.
- [x] Keep attack sprite strips mutually exclusive so an enemy attack strip does not remain after the player attacks.
- [x] Generate and crop GPT Image 2 card art for priority visible cards: 截江守势、惊鸿一击、解穴、洗心、七进七出、涂史.
- [x] Generate and crop GPT Image 2 standees for first-chapter normals, Dong Zhuo, second/third chapter priority enemies, and Chang'an enemies.
- [x] Generate and crop GPT Image 2 battlefield art for 竹林听雨 and 长安墨城.
- [x] Register all new art through `src/game/content/visuals.ts` and cover the paths with data and browser regression tests.

Verification:

```bash
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
```

## Milestone 40: Advanced Rewards UI And Logbook Screen

- [x] Expose advanced chapter reward choices for rare card, relic, method upgrade, and cleanse support.
- [x] Claim advanced rewards once per chapter and persist the claim in run reward history.
- [x] Add a readable 墨录 screen from run status.
- [x] Add first-chapter story fragment content for event and boss unlocks.
- [x] Cover advanced reward claiming and logbook opening with Playwright.

Verification:

```bash
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "logbook opens|complete the first chapter"
npm run typecheck
```

## Milestone 41: Chapter Two And Three Pacing Playtest Pass

- [x] Add chapter-two and chapter-three enemy pacing bands for HP, burst damage, and status-card pressure.
- [x] Retune 竹林听雨 normals, elites, and 琴魔·残音 as build checks without sudden burst spikes.
- [x] Retune 长安墨城 normals, elites, and 墨书执笔官 for higher endurance plus controlled 涂史 pressure.
- [x] Preserve Boss peak damage ceilings while increasing cross-chapter HP pacing.

Verification:

```bash
npm test -- tests/data/content.test.ts
npm test -- tests/roadmap/next-ten-modules.test.ts
npm test
npm run build
npm run test:e2e
```

## Milestone 42: Autonomous Alpha Planning And Parallel Worktree Dispatch

- [x] Record `.worktrees` ignore rules before creating local worktrees.
- [x] Create the autonomous alpha plan at `docs/superpowers/plans/2026-05-03-autonomous-alpha-roadmap.md`.
- [x] Create Wave 1 worktrees for playtest tooling, profile/endings core, art audit tooling, and desktop UI shells.
- [x] Dispatch independent subagents into each Wave 1 worktree.
- [x] Baseline and verify each Wave 1 worktree before integration.

Verification:

```bash
git check-ignore -q .worktrees
npm test
npm run build
```

## Milestone 43: Playtest Lab And Balance Instrumentation

- [x] Add a pure run simulator for deterministic enemy/route pacing checks.
- [x] Add chapter-level pacing summaries without Phaser or DOM dependencies.
- [x] Add tests that flag missing enemies, timeout-prone encounters, and unsafe damage spikes.

Verification:

```bash
npm test -- tests/playtest/run-simulator.test.ts
npm test
npm run build
```

## Milestone 44: Persistent Profile And Ending Evaluator Core

- [x] Add a versioned persistent profile model for run stats, fragments, endings, and character stats.
- [x] Add deterministic ending evaluation for 清明封印、焚书、改命、心魔、隐藏清悟.
- [x] Keep profile and ending logic pure until UI integration.

Verification:

```bash
npm test -- tests/profile/profile-system.test.ts tests/endings/ending-system.test.ts
npm test
npm run build
```

## Milestone 45: Art Coverage Audit And Asset Debt Ledger

- [x] Add an asset audit script that reports missing runtime files, source sheets, GPT2 assets, and remaining `*-ink-pass.png` debt.
- [x] Add data tests for remaining semantic art debt.
- [x] Update the reusable art pipeline skill with audit commands.

Verification:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm test
npm run build
```

## Milestone 46: Desktop UI Shells For Settings, Run Summary, And Ending Surface

- [x] Add desktop settings shell from title.
- [x] Add run summary shell for future profile/endings integration.
- [x] Add Playwright coverage for the new UI shells.

Verification:

```bash
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "settings panel|run summary"
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Milestone 47: Final Chapter Content Spine

- [x] Add 墨渊照心 chapter metadata, events, final Boss shell, and logbook fragments.
- [x] Route third-chapter completion into final/ending evaluation instead of ordinary victory only.
- [x] Cover the final chapter content contract with unit tests.

Verification:

```bash
npm test -- tests/data/content.test.ts tests/run/run-system.test.ts
npm test
npm run build
```

## Milestone 48: Cai Wenji MVP Character

- [x] Add 蔡文姬 character data, starter deck, 音律 resource, 余韵 MVP, relic, and card pool.
- [x] Add character-select and combat smoke coverage.
- [x] Preserve Zhao Yun / Diao Chan behavior.

Verification:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "Cai Wenji"
npm test
npm run build
```

## Milestone 49: Zhuge Liang MVP Character

- [x] Add 诸葛亮 character data, starter deck, 筹策 resource, 观星 MVP, 阵法 MVP, relic, and card pool.
- [x] Add character-select and combat smoke coverage.
- [x] Integrate after 蔡文姬 to avoid shared character/card/controller conflicts.

Verification:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "Zhuge Liang"
npm test
npm run build
```

## Milestone 50: GPT Image 2 Final Asset Pass

- [x] Replace remaining priority `*-ink-pass.png` standees, card faces, battlefields, and sprite strips with GPT Image 2 generated assets.
- [x] Preserve source sheets and crop runtime PNGs into semantic filenames.
- [x] Verify desktop screenshots after replacement.

Verification:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Milestone 51: Alpha Balance And Full Route Playtest Pass

- [x] Add deterministic route completion contracts through third chapter and final/ending shell.
- [x] Tune enemy, reward, method, and status pressure using simulator and browser runs.
- [x] Verify all four MVP characters can reach the alpha route target.

Verification:

```bash
npm test -- tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

## Milestone 52: Profile, Ending, Save, And Run Summary Integration

- [x] Wire final `endingReady` run state into deterministic ending evaluation.
- [x] Persist profile stats, character stats, unlocked endings, and unlocked fragments.
- [x] Replace debug run-summary sample data with real completed-run summary data.
- [x] Add browser coverage for ending/profile summary.

Verification:

```bash
npm test -- tests/profile/profile-system.test.ts tests/endings/ending-system.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "ending summary|profile summary"
npm test
npm run build
```

## Milestone 53: Release Polish And Alpha Acceptance

- [x] Run the final acceptance gate across audit, unit, typecheck, build, and e2e.
- [x] Capture desktop screenshots for four character combat views and ending/summary surfaces.
- [x] Update project-facing documentation with playable scope, known MVP gaps, and run commands.

Verification:

```bash
node scripts/audit-generated-assets.mjs
npm test
npm run typecheck
npm run build
npm run test:e2e
```

## Milestone 54: Dynamic Chapter Battlefields

- [x] Render chapter-specific battlefield assets in Phaser instead of always using 洛水.
- [x] Expose the current combat battlefield as a desktop QA attribute.
- [x] Add visual smoke coverage for non-Luoshui battlefield context.

Verification:

```bash
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Milestone 55: Browser Final Boss Route

- [x] Add a debug-accessible final-chapter map route that enters `无名史官` combat.
- [x] Verify final boss victory flows into ending/profile summary.
- [x] Preserve existing direct ending-summary debug action.

Verification:

```bash
npm test -- tests/run/run-system.test.ts tests/endings/ending-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "final boss route"
npm test
npm run build
```

## Milestone 56: Persisted Settings And Procedural Feedback

- [x] Persist desktop settings separately from run saves.
- [x] Enable volume controls and mute/reduced-motion settings.
- [x] Add lightweight procedural WebAudio feedback with no-op fallback.

Verification:

```bash
npm test -- tests/app-shell.test.ts tests/save/save-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "settings"
npm test
npm run build
```

## Milestone 57: Card Art Fallback Ledger

- [x] Extend generated asset audit with non-blocking card fallback debt.
- [x] Update GPT Image 2 queue for the next low-priority card-art batch.
- [x] Keep missing runtime assets blocking and fallback art informational.

Verification:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm test
npm run build
```

## Milestone 58: GPT Image 2 Starter And Common Card Art Batch

- [ ] Generate dedicated GPT Image 2 style card faces for the starter readability and common foundation fallback batches.
- [ ] Preserve source sheets and crop semantic runtime PNGs under `public/assets/generated/cards/`.
- [ ] Bind new `cardArtList` entries and shrink non-blocking card fallback debt while keeping runtime missing files at 0.

Verification:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Milestone 59: Final Choice And Character Epilogue

- [ ] Add a final-choice screen after defeating `无名史官`.
- [ ] Add eligible world-ending choices and character epilogue definitions for all four MVP characters.
- [ ] Persist selected world ending and character epilogue into profile/run summary.

Verification:

```bash
npm test -- tests/endings/ending-system.test.ts tests/profile/profile-system.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "final boss route"
npm test
npm run build
```

## Milestone 60: Desktop Compendium

- [x] Add a read-only `墨录图鉴` for cards, relics, enemies, combos, and story fragments.
- [x] Open the compendium from title and run status without losing the current run screen.
- [x] Add compact desktop tabs and filters for category, character, rarity, and chapter.

Verification:

```bash
npm test -- tests/compendium/compendium-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "compendium|墨录图鉴"
npm test
npm run build
```

## Milestone 61: Keyword And Intent Glossary

- [ ] Add data-driven glossary definitions for shipped statuses, card types, resources, combos, and enemy intents.
- [ ] Surface desktop tooltip metadata on cards, enemy intents, and combo trail entries.
- [ ] Cover glossary completeness and visual tooltip attributes with tests.

Verification:

```bash
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Milestone 62: Boot Performance Split

- [ ] Dynamically split the game runtime boot after the root shell mounts.
- [ ] Preserve jsdom app-shell and browser boot behavior.
- [ ] Review and document Vite chunk output, removing or isolating the existing large chunk warning where practical.

Verification:

```bash
npm test -- tests/app-shell.test.ts
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "boots"
npm test
```
