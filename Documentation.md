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
