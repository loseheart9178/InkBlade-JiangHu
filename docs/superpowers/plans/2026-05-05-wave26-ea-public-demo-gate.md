# Wave 26 EA Public Demo Surface And Debug Gate

## Goal

Make the current desktop browser build safer to hand to outside players by hiding internal debug shortcuts unless an explicit QA gate enables them, while pinning the current EA content baseline for the coming expansion waves.

This wave intentionally excludes Steam, storefront, installer, depot, release packaging, and distribution-prep work. EA now means a playable showcase that lets others see and feel the distinctive deckbuilding, ink-wash jianghu presentation, and commercial-quality content direction in a browser.

## Inputs Read

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/chapters/chapter_01.md`
- `docs/chapters/chapter_02.md`
- `docs/chapters/chapter_03.md`
- `docs/chapters/final_chapter.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `README.md`
- `src/app/inkbladeController.ts`
- `src/app/gameApp.ts`
- `tests/e2e/playable-flow.spec.ts`
- `tests/data/content.test.ts`

## Current Facts

- Title-shell debug entries are currently always visible: `debug-run-summary`, `debug-ending-summary`, and `debug-final-route`.
- Run status currently always receives `skipChapterForDebug`, so `debug-skip-chapter` is visible across map/combat/reward-like surfaces.
- Playwright depends on those shortcuts for route coverage and should keep that coverage through an explicit `?debug=1` browser gate.
- Current content baseline from the EA roadmap scan: 81 cards, 20 relics, 29 events, 19 enemies, 4 chapters, 4 characters, 8 methods, 5 endings, 16 character epilogues, and 14 logbook entries.

## Acceptance Criteria

1. Default player-facing title screen hides all title debug entries.
2. Default player-facing run UI hides `调试跳章`.
3. `?debug=1` explicitly enables the same QA shortcuts so existing route coverage remains possible.
4. Playwright has a regression for default-hidden debug controls and keeps debug shortcut route tests passing through the explicit gate.
5. Data tests pin the current EA showcase content baseline so future expansion waves can raise it intentionally.
6. README and alpha acceptance docs describe EA as a desktop browser playable showcase and state that Steam/release packaging is out of scope for the current EA plan.
7. `Documentation.md` records docs read, implementation decisions, verification, risks, and the next wave.

## Worktree/Subagent Split

- Main integration worktree: own this plan, `Documentation.md`, final integration, verification, and commit.
- Worker A `codex/wave26-debug-gate`: own `src/app/inkbladeController.ts`, `src/app/gameApp.ts`, and `tests/e2e/playable-flow.spec.ts`.
- Worker B `codex/wave26-ea-doc-baseline`: own `tests/data/content.test.ts`, `README.md`, and `docs/playtest/alpha-acceptance.md`.

Workers are independent because the debug gate touches runtime/e2e flow while the EA baseline task touches data tests and docs only.

## Implementation Plan

1. Add a failing Playwright regression showing default public UI hides debug controls.
2. Update debug-dependent Playwright tests to load the app with `?debug=1`.
3. Add `debugToolsEnabled?: boolean` to the controller boundary and derive it in the default runtime from `window.location.search`.
4. Gate title debug buttons and run-status `调试跳章` behind that flag without persisting the flag into saves or settings.
5. Add a content baseline test for current EA showcase volume.
6. Refresh README and playtest acceptance wording toward EA playable showcase, browser-first external play, and no Steam/packaging scope.
7. Integrate worker diffs, run focused gates, then run broad deterministic/type/build verification.

## Verification Plan

- Worker A red check: focused Playwright default-hidden/debug tests fail before implementation, then pass after the gate.
- Worker A final: bundled Playwright focused run for debug gate and final-route tests.
- Worker B final: bundled Vitest focused run for `tests/data/content.test.ts` plus doc grep checks.
- Integration final:
  - bundled `vitest.mjs run`
  - bundled `typescript/bin/tsc --noEmit`
  - bundled `vite/bin/vite.js build`
  - bundled Playwright focused run for `tests/e2e/playable-flow.spec.ts` debug/final-route coverage

## Risks

- Some non-map screens pass the debug skip handler into run status. The cleanest fix is to gate the handler centrally from controller state so all surfaces stay consistent.
- `?debug=1` must not contaminate persisted settings or save data; it should be runtime-only.
- Documentation still contains historical alpha/release language. This wave updates high-visibility docs only; deeper naming cleanup can continue in later EA waves if needed.
