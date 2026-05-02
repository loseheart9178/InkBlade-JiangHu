# Documentation.md

## Status Log

### 2026-05-02 13:30 Asia/Shanghai

Current state:

- Existing workspace contains design documents only.
- No git repository was present at the start.
- `rg --files` was unavailable because the packaged `rg.exe` could not start due to Windows access denial; PowerShell file enumeration is used instead.
- Project direction chosen: Phaser + TypeScript + Vite browser vertical slice.

Decisions:

- First playable pass will focus on Zhao Yun and Diao Chan.
- Chapter focus is 第一章：洛水残照.
- Core systems are combat, card execution, map nodes, rewards, rest, shop, and events.
- First art pass will use procedural ink landscape, CSS/SVG brush frames, and silhouette-style character presentation to reach the preview image direction quickly.
- Full generated character art is deferred unless needed after playable layout proves stable.

Next step:

- Create workflow configs and scaffold the Vite/TypeScript/Phaser project.

Verification:

```text
Not run yet. Runbooks are being created.
```

### 2026-05-02 13:21 Asia/Shanghai

Current state:

- Git repository initialized.
- Runbooks and agent configs committed as baseline commit `19d87dc`.
- Vite, TypeScript, Phaser 3.90, Vitest, jsdom, and Playwright test dependencies installed.
- App shell, Phaser host, HUD host, and a procedural ink battlefield placeholder created.

Decisions:

- Phaser was pinned to 3.90.0 after `npm install phaser` initially selected Phaser 4. The prototype uses Phaser 3's stable API.
- First smoke test covers shell creation before deeper game state work.
- Phaser scene remains presentation-only; no gameplay rules are in the scene.

Verification:

```text
npm test -- --run tests/app-shell.test.ts
Result: 1 test file passed, 1 test passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite warned that the Phaser bundle chunk exceeds 500 kB. This is expected for the first prototype and does not block the milestone.
```

### 2026-05-02 13:26 Asia/Shanghai

Current state:

- Pure TypeScript combat module added under `src/game/systems/combat/`.
- Deterministic RNG utility added under `src/game/core/rng.ts`.
- Combat tests added for deck cycling, energy validation, card execution, enemy intent, Zhao Yun break-formation, Diao Chan charm, and retain.

Decisions:

- Combat functions mutate a serializable `CombatState` in place for the first prototype. This keeps UI integration simple; higher-level undo/history can wrap state cloning later.
- Character-specific hooks are centralized in combat execution for now and should be extracted once more characters or relics add trigger complexity.
- Enemy intents currently support the single-intent loop needed by first tests; richer behavior tables will be extended with data-slice tests.

Verification:

```text
npm test -- --run tests/combat/combat-system.test.ts
Result: 1 test file passed, 7 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.
```

### 2026-05-02 13:42 Asia/Shanghai

Current state:

- First playable browser loop implemented.
- Data slice added:
  - 30+ executable cards including Zhao Yun, Diao Chan, common, mind, and ink cards.
  - Zhao Yun and Diao Chan character definitions with starter decks.
  - First chapter enemies including normal enemies, elites, and 墨影董卓.
- Run system added with a fixed first-chapter route map, travel validation, card rewards, healing, and deck mutation.
- DOM UI now supports:
  - character selection
  - route map
  - combat HUD and hand cards
  - battle rewards
  - event choice
  - shop purchases
  - rest healing
  - victory/defeat restart
- Playwright smoke tests added for playable flow and desktop/mobile screenshot capture.

Decisions:

- First map is fixed rather than procedural so tests and playtesting are stable.
- Combat UI auto-targets the first enemy for the first slice. Manual target selection is deferred until multi-enemy combat.
- Rest currently implements healing only. Card upgrade data/UX is deferred.
- Shop implements card purchases only. Relics and remove-card service are deferred.
- Procedural Phaser silhouettes and CSS card frames stand in for production/generated art.

Verification:

```text
npm test
Result: 4 test files passed, 17 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 2 Playwright tests passed.
Covered: boot, character select, map, battle entry, card play loop, reward selection, desktop screenshot, mobile screenshot.

Screenshots:
test-results/visual-smoke-captures-desk-5ddde-le-combat-smoke-screenshots-chromium/combat-desktop.png
test-results/visual-smoke-captures-desk-5ddde-le-combat-smoke-screenshots-chromium/combat-mobile.png
```

### 2026-05-02 13:49 Asia/Shanghai

Reviewer follow-up:

- Independent Tester/Reporter found that mind/ink were visible but too light mechanically, and that relic/event data was missing.
- Added gameplay impact:
  - 怒 mind state increases player attack damage.
  - 宁 mind state increases block.
  - 墨痕 now causes post-battle life loss on victory.
- Added content data:
  - `src/game/content/relics.ts`
  - `src/game/content/events.ts`
  - Exports from `src/game/content/index.ts`
- Event UI now reads `event_black_rain_ferry` from content data.

Remaining limitations:

- Relics are data-only in this pass; their trigger engine is not yet implemented.
- Character-specific event routing is not yet connected to map nodes.
- Phaser is still a procedural battlefield layer, not a full state-driven presenter.
- Multi-enemy targeting and manual target selection are deferred.

Verification:

```text
npm test
Result: 4 test files passed, 20 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 2 Playwright tests passed.
```

### 2026-05-02 14:40 Asia/Shanghai

Current state:

- Roguelike progression depth pass implemented.
- Combat now accepts current run HP, run relics, and upgraded deck instances.
- Active relic support added:
  - 白龙枪缨 triggers once per combat on Zhao Yun's first 破阵.
  - 闭月香囊 applies charm and weak at combat start.
  - 旧木剑 increases starter/basic attack damage.
  - 黑纸伞 grants block when ink marks are gained.
- Run system now tracks relics and supports add-once relic acquisition, card removal, upgrade candidates, and card upgrades.
- Shop now sells cards, sells relics, disables owned relics, and offers a remove-card service.
- Rest site now offers healing or card upgrade.
- Browser coverage expanded for:
  - first battle reward loop,
  - shop relic purchase,
  - event route into rest upgrade,
  - Diao Chan starting relic status at combat start,
  - desktop/mobile visual smoke screenshots.

Decisions:

- Upgraded cards use the first-slice rule "damage or block +3" and are shown with a `+` marker in hand.
- Combat creates card instance ids from the current run deck order; upgraded run cards are mapped into those combat instance ids at battle start.
- Shop services are deterministic in the first slice: remove-card targets the first starter card while the deck is above five cards.
- Character-specific event mind effects are recorded in reward history for now; persistent overworld mind state is deferred.

Remaining limitations:

- Relic trigger display is still text/status driven rather than animated.
- Generated character art and card art are still deferred behind the procedural ink battlefield and CSS cards.
- Multi-enemy combat and manual targeting are not implemented yet.
- Persistent save/load is not implemented yet.

Verification:

```text
npm test
Result: 4 test files passed, 29 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: boot, character select, first battle, reward, shop relic purchase, event-rest upgrade, Diao Chan starting relic, desktop screenshot, mobile screenshot.
```

### 2026-05-02 14:48 Asia/Shanghai

Current state:

- Battle spoils are now run-system rules instead of UI button side effects.
- Normal battles award 12 gold.
- Elite battles award 25 gold plus the next unowned relic when available.
- Boss battles award 50 gold plus the next unowned relic when available, then route through a `screen-boss-reward` bridge before final victory.
- Reward screens show a spoils summary for gold/relic gains.
- Deck viewer overlay is available from map, reward, event, shop, rest, and boss reward screens.
- Deck viewer shows card cost, type, description, and upgraded `+` markers.
- Rest upgrade flow is now browser-verified by opening the deck afterward and checking the upgraded marker.

Decisions:

- Elite and boss spoils use deterministic "next unowned relic" selection for this slice to keep tests stable.
- The boss bridge is intentionally lightweight; richer boss card/relic choice is deferred until the chapter-end reward design is broader.
- Long elite combat is covered at the run-system level for now instead of adding a brittle browser fight-through test.

Verification:

```text
npm test
Result: 4 test files passed, 33 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: boot, character select, map deck viewer, first battle, reward, shop relic purchase, event-rest upgrade with deck `+` marker, Diao Chan starting relic, desktop screenshot, mobile screenshot.
```

### 2026-05-02 14:50 Asia/Shanghai

Current state:

- Combat HUD now renders recent `combatLog` entries.
- Existing trigger names such as 闭月香囊, 白龙枪缨, 黑纸伞, 破阵, and 墨痕结算 can be surfaced without adding new rule code.
- Playwright now asserts that Diao Chan's starting relic trigger is visible when combat starts.

Decision:

- Feedback is currently textual and compact so it does not compete with the playfield. Animation and sound can layer on this stable log later.

Verification:

```text
npm test
Result: 4 test files passed, 33 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: previous browser flows plus combat log visibility for 闭月香囊.
```

### 2026-05-02 14:59 Asia/Shanghai

Current state:

- Combat system now emits `visualEvents` for readable battle feedback:
  - damage,
  - block,
  - status,
  - resource,
  - ink,
  - draw,
  - trigger,
  - turn changes.
- Combat HUD renders recent visual events as floating text over player, enemy, or center field.
- Combatants now react with hit shudder, guard glow, and status mark glow.
- Active card press feedback has a sharper lift/ink-shadow response.

Decisions:

- Visual events are generated by the pure combat system so Phaser/DOM presentation can stay thin and deterministic.
- Events are capped to the latest 12 in combat state and latest 6 in HUD to avoid visual clutter.
- This is still CSS/DOM-driven; Phaser particle/effect work can layer onto the same event stream later.

Verification:

```text
npm test -- --run tests/combat/combat-system.test.ts
Result: 1 test file passed, 18 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: existing browser flows plus combat floating feedback for 闭月香囊.
```

### 2026-05-02 15:04 Asia/Shanghai

Current state:

- Added first-pass repo-local combat art assets under `public/assets/characters/`.
- Added `src/game/content/visuals.ts` as the stable combat portrait manifest.
- Combat now renders art assets for:
  - 赵云,
  - 貂蝉,
  - 墨化山贼,
  - 无面兵卒,
  - 纸伞女鬼,
  - 剑痴残影,
  - 墨影董卓.
- Browser tests now assert that Zhao Yun and 墨化山贼 portrait images are actually referenced in combat.

Decision:

- This pass uses deterministic SVG assets that match the preview's ink-wash direction and are easy to version. Higher-fidelity GPT-generated PNG/WebP portraits can replace these files later through the same manifest without changing combat rules.

Verification:

```text
npm test -- --run tests/data/content.test.ts
Result: 1 test file passed, 6 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
Result: 4 Playwright tests passed.
Covered: playable flow plus combat portrait asset references.
```

### 2026-05-02 15:11 Asia/Shanghai

Current state:

- Card upgrades now support card-specific upgraded effects, cost, and description data.
- Combat uses upgraded effects when present; generic upgrade bonus remains a fallback for cards without explicit upgrade data.
- Hand cards and deck viewer show upgraded descriptions and upgraded costs.
- Added new reward cards:
  - 七星枪影,
  - 截江守势,
  - 闭月回风,
  - 莲步藏锋,
  - 镜甲,
  - 洛水墨潮.
- Elite reward pools now lean toward stronger character cards and high-impact common/ink options.

Decision:

- Upgrades are now part of card content data rather than a UI-only display trick. This keeps card text, deck viewer, and combat resolution aligned.

Verification:

```text
npm test
Result: 4 test files passed, 37 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: existing browser flows plus upgraded card description in deck viewer.
```

### 2026-05-02 15:16 Asia/Shanghai

Current state:

- Map nodes now carry optional `eventId`.
- Zhao Yun's first event route now uses 长坂回声.
- Diao Chan's first event route now uses 宫灯旧宴.
- Event UI renders the event attached to the current map node instead of always using 黑雨渡口.
- `createRun` now accepts deterministic map options with `mapSeed`.
- Seeded route variants currently alter elite enemy selection and late normal battle selection.

Decision:

- The seeded map work is intentionally narrow: deterministic enemy/node variants first, then fuller procedural topology later. This preserves E2E stability while opening the door to roguelike route variety.

Verification:

```text
npm test -- --run tests/run/run-system.test.ts
Result: 1 test file passed, 13 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 5 Playwright tests passed.
Covered: Zhao Yun character event path, rest upgrade flow, and existing browser flows.
```

### 2026-05-02 15:22 Asia/Shanghai

Current state:

- Added full first-chapter browser acceptance:
  - start Zhao Yun,
  - take character event,
  - rest and upgrade,
  - defeat late normal encounter,
  - defeat Boss,
  - pass through Boss reward bridge,
  - reach chapter victory.
- Tuned late normal and Boss enemy values for MVP completion:
  - 纸伞女鬼 HP/damage/block reduced slightly.
  - 墨影董卓 HP and intent damage/block reduced for first-chapter prototype pacing.
- Playwright combat helper now prioritizes playable attack cards before defensive cards, making completion checks closer to actual player intent and less slow.

Decision:

- This establishes the MVP completion gate: the game is not just a set of systems; one complete first-chapter run can be finished in browser automation.

Verification:

```text
npm test
Result: 4 test files passed, 39 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 6 Playwright tests passed.
Covered: full first-chapter victory route plus previous playable, shop, rest, relic, deck, and visual smoke flows.
```

### 2026-05-02 16:17 Asia/Shanghai

Current state:

- Save and continue system implemented.
  - Added a versioned local save slot under `src/game/systems/save/`.
  - Controller snapshots now persist run, combat, reward cards, pending spoils, current screen, deck state, relics, HP, map progress, and message.
  - Title screen now supports `继续行旅` and `清除存档`.
  - Victory and defeat clear the continue slot.
- Chapter-one map topology expanded.
  - Map nodes now include floor/lane metadata.
  - The map is generated as a seeded branching topology with side battles, late events, optional elite branches, shop/rest cross-links, and boss convergence.
  - The previous MVP completion path remains valid for browser acceptance.
  - Route UI now lays nodes left-to-right by topology instead of a fixed simple grid.
- Water-ink art and battle atmosphere pass implemented.
  - Added `public/assets/environment/luoshui-battlefield.svg` and loaded it in Phaser.
  - Added card art SVGs and manifest entries for featured cards and type fallbacks.
  - Added attack sequence strips for Zhao Yun, Diao Chan, and enemy slashes.
  - Added missing 血旗都尉 portrait.
  - Hand, reward, and deck views now render card art.
  - Combat view now renders sprite-strip figures in addition to circular portraits.

Decisions:

- Save format is a small versioned JSON envelope around serializable system state. Invalid JSON and future schema versions are ignored rather than crashing the title screen.
- The procedural map keeps stable node ids for acceptance tests and player-readable continuity, while seed variation changes optional branches, enemy/event selections, and labels.
- Art assets are repo-local SVGs for this pass. The manifest boundary is ready for GPT Image generated PNG/WebP replacements later without changing combat or run rules.
- Sprite strips are 4-frame transparent SVG strips with CSS step animation. This gives immediate wuxia motion language while staying deterministic and cheap in the browser.

Verification:

```text
npm test
Result: 5 test files passed, 46 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: previous playable flows, full first-chapter victory, reload/continue from combat, card-art references, sprite-strip references, and desktop/mobile visual screenshots.

Additional visual check:
Viewed latest desktop and mobile screenshots under test-results and adjusted combat layout so status/resource pills no longer collide with the hand cards.
```

## Milestone Checklist

- [x] Read existing PRD and system design documents.
- [x] Translate image-based long-run guidance into repository runbooks.
- [x] Initialize repository baseline.
- [x] Scaffold app and test harness.
- [x] Implement combat simulation.
- [x] Implement data slice.
- [x] Implement UI and Phaser presentation.
- [x] Run automated and browser verification.
- [x] Add active relics, shop services, rest upgrades, and expanded E2E coverage.
- [x] Add deterministic battle spoils, boss reward bridge, and deck viewer.
- [x] Add combat log feedback to the battle HUD.
- [x] Add combat visual events and floating battle feedback.
- [x] Add first-pass ink-wash combat portrait assets.
- [x] Add card-specific upgrades, more cards, and stronger elite reward pools.
- [x] Add character-specific events and deterministic map variants.
- [x] Verify complete first-chapter MVP victory route.
- [x] Add save and continue game system.
- [x] Add procedural chapter map topology.
- [x] Add ink-wash battle art, card art, and attack sprite-strip presentation.
- [x] Replace placeholder art with GPT Image 2 generated reference-style assets.
- [x] Clean up generated-art visual regressions for Diao Chan, combat overlays, and hand-card art scale.
- [x] Fix playable character art identity and pause mobile adaptation in favor of desktop polish.
- [x] Add reusable generated-art workflow skill and desktop combat layout regressions.
- [x] Deepen Zhao Yun and Diao Chan archetype card pools and reward recommendations.
- [x] Add dedicated archetype card art assets and source-aware signature martial VFX.

### 2026-05-02 18:59 Asia/Shanghai

Current state:

- Replaced the previous SVG-like placeholder art direction with GPT Image 2 generated raster assets that follow the user's provided preview more closely.
- Generated and added project-local PNG assets:
  - `public/assets/generated/luoshui-battlefield-gpt.png`
  - `public/assets/generated/zhaoyun-standee-gpt.png`
  - `public/assets/generated/diaochan-standee-gpt.png`
  - `public/assets/generated/ink-bandit-standee-gpt.png`
  - `public/assets/generated/ink-dongzhuo-standee-gpt.png`
  - `public/assets/generated/card-sheet-gpt.png`
  - six cropped card illustrations under `public/assets/generated/cards/`
- Created cutout variants for the full-body standees by removing connected parchment background locally:
  - `zhaoyun-standee-gpt-cutout.png`
  - `diaochan-standee-gpt-cutout.png`
  - `ink-bandit-standee-gpt-cutout.png`
  - `ink-dongzhuo-standee-gpt-cutout.png`
- Updated the art manifest so combat portraits, battlefield, standees, and card art now use the generated PNG assets.
- Reworked combat UI toward the reference:
  - large full-body duelants in the center field,
  - generated portrait crops in top health bars,
  - card hand layered over the lower field,
  - existing sequence-frame strips retained as attack-motion overlays,
  - generated card illustrations in hand/reward/deck surfaces.

Decisions:

- The built-in image generation path was used for GPT Image 2 style asset generation. Assets were copied into the repo so runtime does not depend on the Codex generated-image cache.
- True transparent generation was not used; instead, the pass used local cutout processing against the parchment background. This preserves the painterly style while avoiding hard rectangular paper blocks in battle.
- Normal enemies currently share the generated 墨化山贼 standee; boss/elite-heavy enemies use the generated 墨影董卓 standee. Dedicated paper ghost and sword echo generated standees remain future polish.

Verification:

```text
npm test
Result: 5 test files passed, 46 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: previous gameplay flows, reload/continue, full first-chapter victory, generated standee references, generated card-art references, and desktop/mobile visual screenshots.

Additional visual check:
Reviewed desktop and mobile screenshots after the art replacement. The battle now reads as a high-fidelity ink-wash wuxia screen rather than an SVG placeholder screen.
```

### 2026-05-02 20:11 Asia/Shanghai

Current state:

- Fixed the Diao Chan standee regression by using the original generated GPT Image asset for her in-battle standee instead of the locally cut out variant that removed pale body and costume regions.
- Removed the legacy combat sprite-strip placeholder overlays from the combat DOM so the old red attacker figure no longer stacks on top of generated standee art.
- Improved hand-card presentation:
  - card artwork now uses contained scaling instead of hard cropping,
  - card frames have a stronger paper/brush border treatment,
  - card text is centered and tightened for the bottom hand area,
  - combat controls were moved away from the hand-card row to reduce overlap.
- Added browser assertions covering the regression points:
  - no `combat-sprite-player` or `combat-sprite-enemy` nodes render,
  - Diao Chan's mobile combat standee uses the intact generated asset,
  - hand-card art uses `object-fit: contain`.

Decisions:

- Zhao Yun and enemy standees can keep the local cutout variants because screenshot review did not show missing-body regressions there.
- Diao Chan keeps the original rectangular generated asset with a soft CSS edge mask rather than an alpha cutout, prioritizing body integrity over perfect background removal.
- Full sequence-frame attacks should be rebuilt from generated art later as a dedicated animation asset pass; the old SVG strips are no longer suitable as overlays on high-fidelity GPT standees.

Verification:

```text
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
Result: 1 Playwright test passed.

npm test
Result: 5 test files passed, 46 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: playable flows, reload/continue, full first-chapter victory, generated standee references, no legacy sprite overlays, card-art containment, and desktop/mobile visual screenshots.

Additional visual check:
Reviewed latest desktop and mobile screenshots. The old red placeholder overlay is gone, Diao Chan's body is intact on mobile, and hand-card artwork is no longer tightly cropped.
```

### 2026-05-02 21:20 Asia/Shanghai

Current state:

- Project rules now state the current platform priority is desktop browser first; mobile layout, touch controls, and mobile screenshot adaptation are paused unless the user explicitly asks to resume them.
- Fixed the playable-character art identity bug:
  - previous `zhaoyun` generated standee was a red female spear character and did not read as Zhao Yun,
  - previous `diaochan` generated standee drifted toward the user's Cai Wenji/teal-side reference direction,
  - new Zhao Yun source is a male silver-blue spear general,
  - new Diao Chan source is a red-white dancer with fan and ribbons, with no guqin/pipa/instrument cues.
- Added project-local source and transparent cutout assets:
  - `public/assets/generated/zhaoyun-standee-gpt-v2-source.png`
  - `public/assets/generated/zhaoyun-standee-gpt-v2-cutout.png`
  - `public/assets/generated/diaochan-standee-gpt-v2-source.png`
  - `public/assets/generated/diaochan-standee-gpt-v2-cutout.png`
- Generated desktop attack sprite strips from the corrected cutouts:
  - `public/assets/sprites/zhaoyun-attack-strip-gpt-v2.png`
  - `public/assets/sprites/diaochan-attack-strip-gpt-v2.png`
- Combat now renders the sprite strip layer only while an attack visual event is active. Idle standees no longer carry a permanent placeholder overlay.
- Browser smoke coverage was changed to desktop-only and now captures separate Zhao Yun and Diao Chan desktop combat screenshots.

Decisions:

- The manifest binds both portrait and standee paths to transparent cutout assets, not raw chroma-key source images, so top portraits cannot show green backgrounds.
- Correct role identity is now treated as data-contract coverage through `tests/data/content.test.ts`, while Playwright checks that the browser uses the corrected asset paths.
- The new sprite strips are derived from the approved corrected cutouts, which keeps character identity stable across idle and attack frames.

Verification:

```text
npm test -- --run tests/data/content.test.ts
Result: 1 test file passed, 8 tests passed.

npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
Result: 1 Playwright test passed.

npm test
Result: 5 test files passed, 47 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: desktop Zhao Yun/Diao Chan visual smoke, playable battle/reward flow, shop relic, event-rest upgrade, Diao Chan starting relic, reload/continue, and full first-chapter victory.

Additional visual check:
Reviewed the latest desktop Zhao Yun and Diao Chan screenshots. Zhao Yun now reads as a male spear general, Diao Chan reads as a red-white dancer, and no raw GPT/chroma-key background is visible.
```

### 2026-05-02 22:50 Asia/Shanghai

Current state:

- Added reusable project skill `skills/inkblade-art-asset-pipeline/SKILL.md` for generated art workflows: docs re-read, prompt/style lock, source preservation, cutout, sprite-strip creation, manifest wiring, screenshot QA, and failure handling.
- Updated project rules so future new feature work, story/copy changes, UI art generation, character/enemy art, and asset replacement must re-read relevant `docs/` settings before implementation and log the docs read.
- Re-read for this pass:
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Fixed the enemy attack visual bug:
  - generated enemy-specific transparent attack strips derived from existing GPT cutout standees,
  - added `ink_bandit_attack` and `ink_dongzhuo_attack`,
  - routed normal enemies to the bandit strip and Dong Zhuo-class enemies to the Dong Zhuo strip,
  - removed the runtime dependency on the old black `enemy_slash` placeholder for enemy attacks.
- Reworked the desktop combat layout toward the user reference:
  - full-screen battlefield now has a DOM background fallback matching the generated Luoshui art,
  - top meters stay in the reference-like top health bar zone,
  - idle standees are constrained above the bottom hand,
  - the energy orb is separated at the left bottom instead of sitting in the card row,
  - hand cards occupy the bottom band with right-side combat controls.
- Added browser regression checks for:
  - enemy attack sprite path,
  - player/enemy standee separation from the hand zone,
  - energy-orb distance from the first card.

Decisions:

- Enemy strips were derived from the approved GPT-generated enemy cutouts rather than generated from scratch, preserving current enemy identity while removing the old black placeholder.
- Layout work remains desktop-first; mobile adaptation is still paused by project rule and user direction.

Verification:

```text
npm test -- --run tests/data/content.test.ts
Result: 1 test file passed, 8 tests passed.

npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
Result: 1 Playwright test passed.
Screenshots reviewed:
test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-zhaoyun-desktop.png
test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-diaochan-desktop.png

npm test
Result: 5 test files passed, 47 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, playable battle/reward flow, shop relic, event-rest upgrade, Diao Chan relic start, reload/continue save, and full first-chapter victory.
```

### 2026-05-02 23:45 Asia/Shanghai

Current state:

- Completed the next four polish modules in order:
  - combat presentation,
  - card/HUD readability,
  - enemy and Boss visual identity,
  - first-chapter event presentation.
- Re-read for this pass before feature/UI/art changes:
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added a combat VFX layer driven by the existing pure combat visual-event stream:
  - red/teal/ink damage slashes,
  - guard/status/resource sigils,
  - ink spread cues,
  - trigger seal cues.
- Refined card presentation across hand, reward, and deck overlays:
  - card type badges,
  - rarity marks,
  - keyword chips derived from card type/effects,
  - clearer description hierarchy and brush-paper spacing.
- Created and wired distinct enemy visual assets:
  - `paper-umbrella-standee-gpt-v2-cutout.png`
  - `sword-echo-standee-gpt-v2-cutout.png`
  - `blood-banner-standee-gpt-v2-cutout.png`
  - `ink-dongzhuo-boss-standee-gpt-v2-cutout.png`
  - matching four-frame attack strips under `public/assets/sprites/`.
- Boss and enemy attacks now route to identity-specific sprite strips. Browser coverage directly checks the Dong Zhuo boss standee and boss attack strip during the chapter completion route.
- Rebuilt the event screen into a first-chapter scene presentation with an ink battlefield vignette, event seal mark, story copy, and brush-choice column.
- Rechecked desktop screenshots:
  - combat cards no longer collide with idle standees,
  - the energy orb stays separated from the first card,
  - Zhao Yun/Diao Chan desktop combat screenshots retain the reference-like top HUD, central duel, and bottom hand structure,
  - the 长坂回声 event screen reads as a dedicated chapter scene rather than a plain button list.

Decisions:

- Enemy identity assets were derived from approved in-project generated cutouts and overpainted with strong readable motifs. This keeps style continuity while giving each first-chapter enemy a separate silhouette language.
- The combat VFX layer remains a renderer adapter only. It reads `combat.visualEvents` and does not add gameplay rules to the UI.
- Card keyword chips are generated from existing card data rather than new card metadata, so the current data model stays stable for this polish pass.
- Mobile adaptation remains paused by user direction and project rule; visual QA here is desktop-first.

Verification:

```text
npm test -- tests/data/content.test.ts
Result: 1 test file passed, 9 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
Result: 1 Playwright test passed after adjusting standee height to keep idle art above the hand zone.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
Result: 6 Playwright tests passed, including boss standee and boss attack-strip regression checks.

npm test
Result: 5 test files passed, 48 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, combat VFX/card chrome assertions, playable battle/reward flow, shop relic, event-rest upgrade, Diao Chan relic start, reload/continue save, boss sprite playback, and full first-chapter victory.
```

### 2026-05-03 00:20 Asia/Shanghai

Current state:

- Completed the "enemy mechanics and chapter-one combat pacing" module.
- Re-read for this pass before gameplay changes:
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
  - `docs/chapters/chapter_01.md`
- Added a data-driven enemy special intent model. Special intents can now combine:
  - enemy damage,
  - enemy block,
  - status application to player or self,
  - player ink-mark pressure,
  - enemy healing.
- Player-side negative statuses now matter mechanically:
  - `weak` reduces the player's next attack and consumes one stack,
  - `vulnerable` increases the next incoming hit and consumes one stack.
- First-chapter enemies now have clearer roles:
  - 墨化山贼 remains the gentle first fight with attack/block cadence,
  - 无面兵卒 teaches multi-hit pressure,
  - 纸伞女鬼 applies 虚弱 and 墨痕 through `纸伞迷魂`,
  - 剑痴残影 uses `剑心蓄势` before a heavier strike,
  - 血旗都尉 uses `血旗号令` for armor plus 易伤 pressure,
  - 墨影董卓 has `宫宴压迫`, `吞噬权柄`, and `墨宫倾塌` as readable Boss specials.
- Combat HUD now shows special intent names and richer status lines for both sides.
- Fixed a feedback regression found by Playwright: special Boss actions could push damage events out of the recent visual-event window before the DOM rendered the enemy attack strip. The recent visual scan now checks the last six events, so multi-effect specials still trigger attack animation.

Decisions:

- I kept this as a single-enemy MVP deepening pass. The content docs mention summoning and multi-enemy pressure, but the current DOM combat view and targeting flow are still optimized around one active enemy. Blood-flag "summon" is represented as armor/status pressure for now.
- Boss HP was raised to 132 rather than the PRD's full 220-280 first-chapter target. The current MVP card pool and automated route remain short-form, so 132 gives a longer Boss without turning the test route into a grind.
- Status stacks are lightweight charges rather than full duration counters. That fits the current minimal state model and avoids a larger status-duration migration.

Verification:

```text
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
First run: failed as expected before implementation.
Red failures covered missing special intent execution, missing player weak damage reduction, missing Boss heal/ink pressure, and missing first-chapter enemy mechanic data.

npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
Result after implementation: 2 test files passed, 32 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
First run: failed because Boss special feedback did not keep the enemy attack strip visible after multi-effect events.
Result after feedback fix: 6 Playwright tests passed.

npm test
Result: 5 test files passed, 52 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, combat VFX/card chrome assertions, playable flows, save/continue, Boss special intent text, Boss attack strip playback, player ink pressure, and full first-chapter victory.

Additional visual check:
Reviewed desktop combat screenshots and a Boss mechanics screenshot at `test-results/boss-dongzhuo-mechanics.png`. New status text remains readable and does not obstruct the bottom hand.
```

### 2026-05-03 01:07 Asia/Shanghai

Current state:

- Completed the "combo chain system MVP" module.
- Re-read for this pass before gameplay and HUD changes:
  - `AGENTS.md`
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added combat-system combo definitions and per-turn combo tracking for:
  - 连斩: 攻击 -> 攻击 -> 攻击, extra damage.
  - 蓄势: 技能 -> 攻击, extra damage.
  - 追影: 身法 -> 攻击, block plus extra damage.
  - 静守: 心境 -> 技能, block.
  - 心刃: 心境 -> 攻击, extra damage.
  - 固守: 技能 -> 技能 -> 技能, block.
  - 墨袭: 墨灾 -> 攻击, extra damage plus 墨痕.
  - 断招: exhausted card into attack, draw one card.
- Combo rules now execute in `src/game/systems/combat/` and stay outside Phaser/DOM rendering.
- Type history is checked as each card type is appended, so multi-type cards can trigger combos at the relevant step rather than only after all tags are recorded.
- Each combo can trigger once per turn and resets at player-turn start.
- Older saved combats without the new combo fields are normalized before card play or turn reset.
- Combat UI now includes a desktop center combo trail that shows `待发`, the current turn's recent type flow, or the latest triggered combo names.

Decisions:

- Combo damage is treated as direct bonus damage and does not consume player weak stacks or inherit generic attack relic bonuses. This keeps "extra damage" readable and avoids accidental double-scaling.
- Zhao Yun's third attack now naturally produces both 连斩 and 破阵; this matches the role fantasy of continuous spear pressure without moving Zhao's character hook into generic combo rules.
- 断招 is implemented as a previous-card-exhausted hook rather than a new card type, preserving the current card data model.

Verification:

```text
npm test -- tests/combat/combat-system.test.ts
First run: failed as expected before implementation.
Red failures covered missing 连斩, 蓄势, 追影, 静守, 心刃, 固守, and 墨袭 behavior.

npm test -- tests/combat/combat-system.test.ts
Result after implementation: 1 test file passed, 29 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm test
Result: 5 test files passed, 59 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, combo-trail HUD visibility, playable flows, save/continue, boss mechanics feedback, and full first-chapter victory.

Additional visual check:
Reviewed `test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-zhaoyun-desktop.png`.
The center combo trail is visible, stays between the duelants, and does not overlap the bottom hand.
```

### 2026-05-03 01:41 Asia/Shanghai

Current state:

- Completed the "combo chain rewards and card pool linkage" module.
- Re-read for this pass before gameplay, reward, and card-pool changes:
  - `AGENTS.md`
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added combat-wide combo memory via `comboTriggersThisCombat`, while keeping `comboTriggersThisTurn` as the per-turn HUD trail.
- Moved reward drafting from the DOM controller into the run system.
- Added combo-aware card reward rules for 连斩、蓄势、追影、静守、心刃、固守、墨袭、断招.
- Added two common/uncommon card-pool support cards:
  - 飞石: 0-cost exhausted attack for 连斩 / 断招 setups.
  - 追影: 身法 / 攻击 hybrid card for the body-attack chain.
- Adjusted ordinary reward drafting so ink-rarity cards do not appear from normal battle rewards unless the player used 墨袭.
- Added reward-screen feedback: `招式回响` hint text plus a highlighted primary reward card.

Decisions:

- The reward system uses the latest triggered combo from the completed combat as the strongest signal. This keeps the MVP deterministic and easy to explain.
- Combo-biased rewards reserve the first reward slot for the primary synergy card, then fill the remaining slots with a support combo card and normal role/common pools.
- 墨袭 is treated as a special source that can open ink-rarity rewards, matching the PRD constraint that ink cards should not normally appear in ordinary rewards.

Verification:

```text
npm test -- tests/combat/combat-system.test.ts tests/run/run-system.test.ts tests/data/content.test.ts
First run: failed as expected before implementation.
Red failures covered missing combat-wide combo memory, missing run reward APIs, and missing combo support cards.

npm test -- tests/combat/combat-system.test.ts tests/run/run-system.test.ts tests/data/content.test.ts
Result after implementation: 3 test files passed, 60 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
Result: 6 Playwright tests passed.
Covered: first combat reward `招式回响` hint, combo-biased primary reward card, shop, event/rest, save/continue, and first-chapter victory route.

npm test
Result: 5 test files passed, 65 tests passed.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, playable flow, reward combo hint, save/continue, boss mechanics, and full first-chapter victory.

Additional visual check:
Reviewed `test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-zhaoyun-desktop.png`.
The combat layout remains readable after reward-system changes; standees, energy orb, and bottom hand still preserve the desktop reference spacing.
```

### 2026-05-03 02:16 Asia/Shanghai

Current state:

- Completed the "character archetypes and card pool deepening" module.
- Re-read for this pass before gameplay, reward, and card-pool changes:
  - `AGENTS.md`
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added explicit archetype metadata for the first four role builds:
  - 赵云：连斩枪势流、护主防反流.
  - 貂蝉：舞势连击流、魅惑控制流.
- Expanded the character card pool with eight archetype support cards:
  - 赵云：七进七出、白马突围、回马枪、枪围如墙.
  - 貂蝉：惊鸿一击、飞袖连环、离间、镜中花.
- Reward drafting now maps recent combo signals into character archetype preferences, so 蓄势/固守 can bias toward defensive/control builds while 连斩/追影 can bias toward attack/dance builds.
- Reward cards now show a short recommendation reason that names the matching flow or explains the support role.

Decisions:

- I treated archetypes as card metadata and reward explanation first, not a full heart-method UI. This gives immediate deckbuilding clarity while leaving the heavier 心法 acquisition system for a later milestone.
- Combo rewards still use the latest combat combo as the strongest deterministic signal. This keeps reward behavior readable in the current MVP and avoids hidden probability tables.
- New cards reuse existing card-art fallbacks for now. A later art pass can create dedicated card illustrations without touching the gameplay and reward contracts.

Verification:

```text
npm test -- tests/data/content.test.ts tests/run/run-system.test.ts
First run: failed as expected before implementation.
Red failures covered missing archetype tags, missing reward reason helpers, and missing archetype reward reasons.

npm test -- tests/data/content.test.ts tests/run/run-system.test.ts
Result after implementation: 2 test files passed, 32 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
First run after UI wiring: failed because reward reason text did not explicitly contain `流派`.
Result after copy fix: 6 Playwright tests passed.

npm test
Result: 5 test files passed, 67 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e
Result: 7 Playwright tests passed.
Covered: visual smoke, playable reward flow with `流派` reason text, shop, event/rest, save/continue, Boss mechanics, and full first-chapter victory.

Additional visual check:
Reviewed `test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-zhaoyun-desktop.png` and `test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-diaochan-desktop.png`.
Desktop combat layout remains stable: top bars, center duel, bottom hand, and left energy orb still follow the current reference direction.
```

### 2026-05-03 02:42 Asia/Shanghai

Current state:

- Started the five-module long-running development pass on branch `codex/next-major-modules`.
- Re-read before implementation:
  - `AGENTS.md`
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Completed module 1: 流派成型反馈与牌组诊断 MVP.
- Added the reusable pure deck analysis system `src/game/systems/deck/archetype.ts`.
- Run status now shows current deck direction, the deck viewer shows an archetype summary, and reward cards show `主线强化` / `副线补强` / `通用补短`.

Decisions:

- The archetype analyzer stays purely data-driven from `CardDefinition.archetypes`, so future 心法 and reward systems can reuse it without depending on UI code.
- Starter-only decks show `尚未成型`; this is intentional because starter cards do not yet define a committed build.

Verification:

```text
npm test -- tests/deck/archetype-system.test.ts
First run: failed as expected because the new deck archetype module did not exist.

npm test -- tests/deck/archetype-system.test.ts
Result after implementation: 1 test file passed, 3 tests passed.

npm test -- tests/deck/archetype-system.test.ts tests/run/run-system.test.ts
Result: 2 test files passed, 23 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
Result: 6 Playwright tests passed.
Covered: run archetype status, deck archetype summary, reward archetype role labels, shop, event/rest, save/continue, Boss mechanics, and first-chapter victory.
```

### 2026-05-03 03:02 Asia/Shanghai

Current state:

- Completed module 2: 心法系统 MVP 与流派定向成长.
- Re-read before this module:
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added four MVP heart methods:
  - 赵云：龙胆连势、长坂守心.
  - 貂蝉：惊鸿舞谱、倾城心诀.
- Added method reward drafting, claiming, save persistence, run status display, deck viewer display, and the `methodReward` screen.
- Elite victories now offer a first method before normal card rewards; Boss victory offers the method bridge if the run has not chosen one yet.
- Combat now receives `methodIds` from the run and applies each method once per combat on its intended trigger.

Decisions:

- 心法 selection is character-limited for the MVP, then ordered by the current deck archetype. This keeps the first version readable and avoids cross-character edge cases.
- I preserved the existing card reward and Boss reward flow by inserting 心法 as a bridge screen, not replacing rewards.

Verification:

```text
npm test -- tests/methods/method-system.test.ts
First run: failed as expected because the new methods system module did not exist.

npm test -- tests/methods/method-system.test.ts
Result after implementation: 1 test file passed, 6 tests passed.

npm test -- tests/methods/method-system.test.ts tests/combat/combat-system.test.ts tests/save/save-system.test.ts
Result: 3 test files passed, 40 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
First run: exposed that the existing full-chapter Boss test needed to choose the new Boss-bridge 心法 before expecting Boss reward.
Result after test flow update: 7 Playwright tests passed.

npm test
Result: 7 test files passed, 76 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.
```

### 2026-05-03 07:31 Asia/Shanghai

Current state:

- Completed module 5: 专属卡图与招式演出美术 Pass.
- Re-read before this visual/content implementation:
  - `AGENTS.md`
  - `Prompt.md`
  - `Plan.md`
  - `Implement.md`
  - `Documentation.md`
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Added dedicated card-art manifest entries and project-local ink-pass PNG assets for:
  - 赵云：破军枪、截江守势、七进七出、白马突围、回马枪、枪围如墙.
  - 貂蝉：莲步藏锋、惊鸿一击、飞袖连环、离间、镜中花.
- Added transparent signature VFX assets and manifest entries for:
  - `zhao-seven-entries-trail.png`
  - `zhao-spear-wall-ward.png`
  - `diao-jinghong-ribbon.png`
  - `diao-lijian-moon.png`
- Added `visualCue` metadata to 七进七出、枪围如墙、惊鸿一击、离间.
- Combat now emits source-aware trigger visual events with `sourceCardId` and `visualCue`, while UI adapters map those cues to CSS/VFX presentation.
- Added regression coverage for dedicated card art, asset existence, signature VFX manifest entries, and signature card combat events.

Decisions:

- The pass binds visual identity through `src/game/content/visuals.ts` first, keeping renderer code as an adapter for class names, placement, and animation.
- Card/VFX runtime files are versioned PNG assets that can be replaced by later higher-fidelity GPT Image 2 outputs without changing combat or reward logic.
- Desktop remains the only layout target for this pass; mobile visual adaptation is still paused.

Verification:

```text
npm test -- tests/data/content.test.ts tests/combat/combat-system.test.ts
First run failed as expected before implementation.
Red failures covered missing dedicated archetype card art, missing signature VFX manifest, and missing source-aware visual events.

npm test -- tests/data/content.test.ts tests/combat/combat-system.test.ts
Result after implementation: 2 test files passed, 45 tests passed.

npm run typecheck
First run failed because tests/data/content.test.ts introduced Node file existence checks without Node type declarations.
Added dev dependency `@types/node`.
Second run passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.

npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
Result: 1 Playwright test passed.
Reviewed desktop screenshots:
`test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-zhaoyun-desktop.png`
`test-results/visual-smoke-captures-desk-cfbc0--for-Zhao-Yun-and-Diao-Chan-chromium/combat-diaochan-desktop.png`

npm test
Result: 9 test files passed, 90 tests passed.

npm run test:e2e
Result: 9 Playwright tests passed.
Covered: visual smoke, playable flow, shop, elite heart method, event/rest, Diao role event, save/continue, and full first-chapter victory.
```

### 2026-05-03 06:59 Asia/Shanghai

Current state:

- Completed module 4: 法宝池与精英/Boss 奖励深化.
- Re-read before this module:
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
- Expanded first-chapter relic content to 12 relics.
- Added source-aware relic pools for elite, boss, and shop rewards in `src/game/systems/relics/relicEffects.ts`.
- Elite/Boss spoils now draw from character-aware expanded pools instead of the old two-relic default.
- Shop relics now come from the shared shop pool and show rarity/source text.
- Added combat hooks for:
  - 鳞锋枪尖：第三张攻击额外伤害.
  - 长坂铁印：护主抵消后抽牌.
  - 莲步铃：首次身法抽牌.
  - 半月钗：魅惑阈值后施加易伤.
  - 洗墨石、清雨符、朱漆令、无声琴弦：墨痕/开局/心境辅助.

Decisions:

- Relic source filtering lives outside the renderer so shop, elite, boss, and later treasure nodes can share the same pool logic.
- I kept deterministic pool ordering for the MVP; this makes route rewards predictable in tests while still expanding the decision space.

Verification:

```text
npm test -- tests/relics/relic-system.test.ts
First run: failed as expected because the new relic effects system module did not exist.

npm test -- tests/relics/relic-system.test.ts tests/combat/combat-system.test.ts tests/run/run-system.test.ts
Result after implementation: 3 test files passed, 56 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
First full run hit a transient local `ERR_NO_BUFFER_SPACE` navigation failure.
Targeted rerun of the affected elite test passed.
Second full run passed: 8 Playwright tests passed.

npm test
Result: 9 test files passed, 87 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.
```

### 2026-05-03 06:36 Asia/Shanghai

Current state:

- Completed module 3: 第一章事件池、心境倾向与角色剧情深化.
- Re-read before this module:
  - `docs/yunshui_game_prd_v1.md`
  - `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
  - `docs/云水江湖_通用牌组设计文档_v1.0.md`
  - `docs/chapters/chapter_01.md`
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
- Expanded 第一章事件池 to 10+ events, including 洛水照影、断枪古祠、绛灯夜市、雨洗墨碑、渔叟旧歌、荒营兵库、无声石桥、红袖残书、黑莲池.
- Replaced the old single event effect with typed multi-effect choices: gold, heal, hp loss, card add, starter removal, upgrade, mind tendency, and ink-card offers.
- Added run-level 心境倾向 `宁/怒/悲/魅/乱/悟` and surfaced it in the run status.
- Added role-specific event choices for 赵云 and 貂蝉, with browser coverage for both.
- Late event nodes now vary across seeds from a larger event pool.

Decisions:

- Event copy stays concise and consequence-forward, so choices read like roguelike decisions instead of long story panels.
- Ink event rewards use the same permanent deck path as card rewards, but are represented by `inkCardOffer` so later UI can separate danger rewards visually.

Verification:

```text
npm test -- tests/events/event-system.test.ts
First run: failed as expected because the new event effects system module did not exist.

npm test -- tests/events/event-system.test.ts tests/run/run-system.test.ts
Result after implementation: 2 test files passed, 25 tests passed.

npm run typecheck
Result: TypeScript typecheck passed.

npm run test:e2e -- tests/e2e/playable-flow.spec.ts
Result: 8 Playwright tests passed.
Covered: Zhao event choice, Diao role-specific event choice, mind tendency display, shops, heart methods, save/continue, Boss route, and first-chapter victory.

npm test
Result: 8 test files passed, 81 tests passed.

npm run build
Result: TypeScript and Vite build passed.
Note: Vite repeated the expected Phaser bundle size warning.
```
