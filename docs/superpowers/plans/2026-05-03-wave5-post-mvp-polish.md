# Wave 5 Post-MVP Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the desktop MVP by adding route-specific battlefields, a browser-playable final boss route, persisted settings with lightweight audio feedback, and a ledger for remaining shared card-art fallbacks.

**Architecture:** Keep route, ending, settings, and audit rules in TypeScript helpers and data. Phaser only adapts battlefield assets to canvas; the DOM controller dispatches visual context and renders controls. Tests prove behavior without relying on mobile layout.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, Playwright, project-local generated assets and audit scripts.

---

## Required Context

Before implementation, each worker must re-read and record in `Documentation.md`:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/specs/2026-05-03-wave5-post-mvp-polish-design.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/chapters/final_chapter.md`
- Character docs if touching character-specific copy or art.

## Worktree And Ownership Map

| Worktree | Branch | Owner | Primary Files |
|---|---|---|---|
| `.worktrees/wave5-battlefields` | `codex/wave5-battlefields` | Builder | `src/phaser/scenes/CombatScene.ts`, `src/app/inkbladeController.ts`, `src/game/content/visuals.ts`, `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts`, `Documentation.md` |
| `.worktrees/wave5-final-route` | `codex/wave5-final-route` | Builder | `src/app/inkbladeController.ts`, `src/game/systems/debug/debugRun.ts`, `tests/e2e/playable-flow.spec.ts`, `tests/run/run-system.test.ts`, `Documentation.md` |
| `.worktrees/wave5-settings-audio` | `codex/wave5-settings-audio` | Builder | `src/app/inkbladeController.ts`, `src/app/audioFeedback.ts`, `src/game/systems/save/save.ts`, `tests/app-shell.test.ts`, `tests/save/save-system.test.ts`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` |
| `.worktrees/wave5-card-art-ledger` | `codex/wave5-card-art-ledger` | Builder | `scripts/audit-generated-assets.mjs`, `public/assets/generated/asset-audit.json`, `docs/art/gpt2-priority-queue.md`, `tests/data/content.test.ts`, `Documentation.md` |

## Task 1: Dynamic Chapter Battlefields

**Files:**
- Modify: `src/phaser/scenes/CombatScene.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `Documentation.md`

- [ ] Add a failing data test that requires `battlefieldAssets` to include every chapter ID.
- [ ] Update `CombatScene` to preload all `battlefieldAssets`, keep the active background image, and listen for `inkblade:set-battlefield` events with `{ chapterId }`.
- [ ] Update `renderCombat` to set `data-battlefield="${run.chapterId}"` and dispatch the battlefield event after render.
- [ ] Extend visual smoke so at least one non-Luoshui route asserts the battlefield data attribute and captures a screenshot.
- [ ] Run:

```bash
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Task 2: Browser Final Boss Route

**Files:**
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/game/systems/debug/debugRun.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `Documentation.md`

- [ ] Add a failing run-system/debug test for a `moyuan` debug run with `boss_nameless_historian` reachable from the map.
- [ ] Add a title debug action `debug-final-route` that starts a final-chapter route on the map instead of directly showing the ending summary.
- [ ] Add e2e coverage for title -> final route -> final boss node -> `无名史官` combat -> victory -> ending/profile summary.
- [ ] Keep the existing `debug-ending-summary` action intact for direct profile QA.
- [ ] Run:

```bash
npm test -- tests/run/run-system.test.ts tests/endings/ending-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "final boss route"
npm test
npm run build
```

## Task 3: Persisted Settings And Procedural Audio Feedback

**Files:**
- Create: `src/app/audioFeedback.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify as needed: `src/game/systems/save/save.ts`
- Modify: `tests/app-shell.test.ts`
- Modify: `tests/save/save-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] Add failing tests for settings persistence: reduced motion, fast combat text, master volume, music volume, and mute survive reload.
- [ ] Add `audioFeedback.ts` with a no-op safe WebAudio adapter exposing `playUi`, `playCard`, `playVictory`, `setSettings`, and `dispose`.
- [ ] Enable the settings sliders and add a mute toggle in the settings shell.
- [ ] Persist settings separately from run saves and apply reduced-motion class on load.
- [ ] Trigger lightweight feedback on title actions, card play, victory, defeat, and settings changes.
- [ ] Run:

```bash
npm test -- tests/app-shell.test.ts tests/save/save-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "settings"
npm test
npm run build
```

## Task 4: Card Art Fallback Ledger

**Files:**
- Modify: `scripts/audit-generated-assets.mjs`
- Modify: `public/assets/generated/asset-audit.json`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `tests/data/content.test.ts`
- Modify: `Documentation.md`

- [ ] Add a failing data test that expects `asset-audit.json` to report `cardFallbackDebt` without treating it as missing runtime art.
- [ ] Update `scripts/audit-generated-assets.mjs` to compare every card ID to `cardArtById` and record cards using type-level fallback art.
- [ ] Update `docs/art/gpt2-priority-queue.md` with the next GPT Image 2 queue grouped by character, type, and rarity.
- [ ] Run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm test
npm run build
```

## Integration Order

1. Integrate `wave5-battlefields` first because final route screenshots should validate dynamic backgrounds.
2. Integrate `wave5-final-route` second because QA e2e touches playable flow.
3. Integrate `wave5-settings-audio` third and resolve any `inkbladeController.ts` conflicts carefully.
4. Integrate `wave5-card-art-ledger` last because it is audit/docs focused and should see final content.
5. After each integration, rerun the worker's narrow verification, then `npm test` and `npm run build`; run full `npm run test:e2e` at the end.
