# Wave 29 EA Event And Logbook Expansion

## Goal

Raise the EA playable showcase event/logbook variety so repeated browser runs reveal more world texture, more character-specific choices, and more unlockable story fragments. This wave continues the browser-playable EA showcase direction and excludes Steam, storefront, installer, depot, packaging, and release-prep work.

## Inputs Read

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `docs/superpowers/plans/2026-05-05-wave28-ea-relic-pool-expansion-i.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `src/game/content/events.ts`
- `src/game/content/logbook.ts`
- `tests/events/event-system.test.ts`
- `tests/data/content.test.ts`

## Current Facts

- Current event count is 29:
  - neutral 23
  - Zhao Yun 3
  - Diao Chan 3
  - Cai Wenji 0 event-level tagged events
  - Zhuge Liang 0 event-level tagged events
- Current logbook count is 14.
- Existing event effect types cover gold, card, ink card offer, heal, HP loss, starter removal, upgrade, and mind shifts.
- Current event choice filters already support `characterId` choices inside neutral events.

## Content Batch

Add 11 events, raising total events to 40:

- Cai Wenji event-level stories:
  - `event_qingyin_lost_score` / `清音遗谱`
  - `event_bamboo_grave_song` / `竹下归歌`
- Zhuge Liang event-level stories:
  - `event_star_board_argument` / `星盘争局`
  - `event_empty_city_wind` / `空城风声`
- Character-crossroads neutral events:
  - `event_old_roadside_inn` / `旧道客栈`
  - `event_ink_seller_contract` / `墨商契`
  - `event_river_bones_lantern` / `河骨灯`
  - `event_mountain_pass_riddle` / `山隘问答`
  - `event_silent_training_yard` / `无声校场`
  - `event_broken_name_register` / `残名簿`
  - `event_cloud_water_dream` / `云水一梦`

Add 8 logbook entries, raising total logbook entries to 22:

- 4 entries tied to the new Cai/Zhuge event-level stories.
- 4 entries tied to high-impact neutral crossroads.

Expected new baseline:

- Events: 40
- Logbook entries: 22
- Event-level character distribution: neutral 30, Zhao Yun 3, Diao Chan 3, Cai Wenji 2, Zhuge Liang 2

## Acceptance Criteria

1. All new events have at least two choices and use only supported event effect types.
2. Cai Wenji and Zhuge Liang each gain at least two event-level tagged events, not only nested role choices.
3. New events include mind and ink-risk decisions that reinforce the PRD pillars.
4. New logbook entries point to valid event ids and use concise story-fragment copy.
5. `tests/data/content.test.ts` updates event/logbook baselines to 40 and 22.
6. `tests/events/event-system.test.ts` verifies new character event-level distribution, choice filtering, and valid effect payloads.
7. Browser e2e for event/rest or logbook routes still passes.
8. `Documentation.md` records docs read, implementation decisions, verification, risks, and the next wave.

## Worktree/Subagent Split

- Main integration worktree: own this plan, `Documentation.md`, final integration, verification, and commit.
- Worker A `codex/wave29-cai-zhuge-events`: own Cai Wenji/Zhuge Liang event additions.
- Worker B `codex/wave29-neutral-events`: own neutral crossroads events.
- Worker C `codex/wave29-logbook-tests`: own logbook additions and test baseline updates.

If subagent capacity blocks again, main thread should implement directly while preserving these ownership boundaries.

## Verification Plan

- bundled `vitest.mjs run tests/events/event-system.test.ts tests/data/content.test.ts --reporter=dot`
- bundled `vitest.mjs run`
- bundled `typescript/bin/tsc --noEmit`
- bundled `vite/bin/vite.js build`
- bundled Playwright focused route:
  - `tests/e2e/playable-flow.spec.ts --grep "event route|logbook"`

## Risks

- Events are content-heavy; copy should stay concise enough for the current desktop UI panels.
- New event choices should not introduce unsupported conditional logic. More advanced conditions belong in a later event-system wave.
- Event pool expansion may change deterministic map event previews; browser and run-system tests may need intentional baseline updates.
