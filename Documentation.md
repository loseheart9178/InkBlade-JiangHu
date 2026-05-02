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
