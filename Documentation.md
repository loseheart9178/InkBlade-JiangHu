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

## Milestone Checklist

- [x] Read existing PRD and system design documents.
- [x] Translate image-based long-run guidance into repository runbooks.
- [x] Initialize repository baseline.
- [x] Scaffold app and test harness.
- [x] Implement combat simulation.
- [x] Implement data slice.
- [x] Implement UI and Phaser presentation.
- [x] Run automated and browser verification.
