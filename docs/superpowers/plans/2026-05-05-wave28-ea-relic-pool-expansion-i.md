# Wave 28 EA Relic Pool Expansion I

## Goal

Raise the EA playable showcase relic pool from 20 to 32 relics so elite, boss, and shop rewards feel less repetitive after the Wave 27 card expansion. This wave continues the browser-playable EA showcase direction and does not include Steam, storefront, installer, depot, packaging, or release-prep work.

## Inputs Read

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `docs/superpowers/plans/2026-05-05-wave27-ea-card-pool-expansion-i.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `src/game/content/relics.ts`
- `src/game/systems/relics/relicEffects.ts`
- `src/game/systems/combat/combat.ts`
- `tests/relics/relic-system.test.ts`
- `tests/data/content.test.ts`

## Current Facts

- Current relic count is 20:
  - 4 starter boss relics
  - 4 common
  - 10 uncommon
  - 2 rare
- Reward pools filter by source and character in `src/game/systems/relics/relicEffects.ts`.
- Several relics already have real combat hooks in `src/game/systems/combat/combat.ts`; a few content-facing relics are currently reward/meta descriptors only.
- The EA roadmap calls for much higher relic volume over time, but the first expansion should stay scoped and verified.

## Content Batch

Add 12 relics:

- Zhao Yun:
  - `relic_cloud_dragon_scale` / `云龙鳞` / common / spear-chain attack sustain.
  - `relic_white_cloak_knot` / `白袍结` / uncommon / guardian-counter block sustain.
- Diao Chan:
  - `relic_moon_shadow_bell` / `月影铃` / common / dance-chain body sustain.
  - `relic_silk_scheme_token` / `绫计牌` / uncommon / charm-control setup.
- Cai Wenji:
  - `relic_orchid_jade_pick` / `兰玉拨` / common / qin echo sustain.
  - `relic_clear_rain_score` / `清雨谱` / uncommon / cleanse-melody sustain.
- Zhuge Liang:
  - `relic_astrolabe_shard` / `星盘残片` / common / scry/star sustain.
  - `relic_bagua_copper_coin` / `八卦铜钱` / uncommon / formation setup.
- Neutral/mind/ink/shop:
  - `relic_jianghu_whetstone` / `江湖砥石` / common / generic attack polish.
  - `relic_traveling_cloak` / `行脚斗篷` / common / early block consistency.
  - `relic_still_heart_lantern` / `止水灯` / rare / mind transition payoff.
  - `relic_unwritten_inkstone` / `未写砚` / rare / ink risk-reward.

Expected new baseline:

- Total relics: 32
- Rarity distribution: boss 4, common 10, uncommon 14, rare 4
- Character distribution: Zhao Yun 5, Diao Chan 5, Cai Wenji 4, Zhuge Liang 4, neutral 14

## Acceptance Criteria

1. All 12 new relics are valid `RelicDefinition` entries with rarity, source, price, trigger text, and Chinese-facing description.
2. Reward pools include the new relics by source and character without breaking deterministic first-pick expectations for existing tests.
3. At least four of the new relics receive real combat hook coverage, prioritizing generic attack/block, mind, and ink hooks that benefit multiple runs.
4. `tests/data/content.test.ts` updates the EA baseline to 32 relics and checks the new ids.
5. `tests/relics/relic-system.test.ts` covers source labels, pool membership, and the new combat hooks.
6. Full deterministic verification still passes: focused relic tests, content tests, full Vitest, TypeScript, Vite build, and a focused Playwright reward/shop path.
7. `Documentation.md` records docs read, implementation decisions, verification, worktree/subagent outcomes, risks, and the next wave.

## Worktree/Subagent Split

- Main integration worktree: own this plan, `Documentation.md`, final integration, verification, and commit.
- Worker A `codex/wave28-relic-data`: own `src/game/content/relics.ts` and reward-pool priority updates.
- Worker B `codex/wave28-relic-hooks`: own `src/game/systems/combat/combat.ts` and focused hook tests.
- Worker C `codex/wave28-relic-tests-docs`: own `tests/relics/relic-system.test.ts`, `tests/data/content.test.ts`, and high-level doc baseline updates.

If subagent capacity blocks again, the main thread should take over while preserving these ownership boundaries.

## Verification Plan

- bundled `vitest.mjs run tests/relics/relic-system.test.ts tests/data/content.test.ts --reporter=dot`
- bundled `vitest.mjs run`
- bundled `typescript/bin/tsc --noEmit`
- bundled `vite/bin/vite.js build`
- bundled Playwright focused shop/reward route:
  - `tests/e2e/playable-flow.spec.ts --grep "shops can add relics|elite victories can award"`

## Risks

- Reward-pool priority changes can break deterministic relic expectations. Keep existing first-pick order stable unless tests are intentionally updated.
- Combat-hook relics should stay simple and reusable; broad new relic trigger infrastructure belongs in a later system wave.
- More relics can shift simulator balance. The next balance gate should watch survivability and reward variance after this wave.
