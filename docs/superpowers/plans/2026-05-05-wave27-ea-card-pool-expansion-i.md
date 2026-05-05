# Wave 27 EA Card Pool Expansion I

## Goal

Raise the EA playable showcase card pool from 81 cards to 93 cards with a first content-expansion batch that strengthens all four playable character identities and adds a small neutral/mind/ink support set. This wave is about playable content depth, not Steam, storefront, installer, depot, packaging, or release-prep work.

## Inputs Read

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `docs/superpowers/plans/2026-05-05-wave26-ea-public-demo-gate.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `src/game/content/cards.ts`
- `src/game/content/visuals.ts`
- `src/game/content/cardArt/wave10ZhaoDiaoCardArt.ts`
- `tests/data/content.test.ts`
- `src/game/systems/combat/types.ts`

## Current Facts

- Wave 26 pins the current baseline at 81 cards: 15 starter, 32 common, 18 uncommon, 9 rare, 3 ink, and 4 status.
- Character-card distribution is currently Zhao Yun 16, Diao Chan 16, Cai Wenji 14, Zhuge Liang 13, and neutral 22.
- Card fallback debt must remain zero. Adding cards without dedicated `cardArtById` entries would fail the existing content tests and asset audit.
- Existing card effects support only the current typed actions: damage, block, draw, gainResource, applyStatus, gainInk, cleanseCards, queueEcho, scry, setFormation, and setMind.

## Content Batch

Add 12 cards:

- Zhao Yun:
  - `zhao_cloud_pierce` / `云龙穿阵` / common / spear-chain tempo attack.
  - `zhao_oath_guard` / `白袍护誓` / uncommon / guardian-counter block and guard.
- Diao Chan:
  - `diao_moonstep` / `月下回旋` / common / dance-chain body tempo.
  - `diao_silk_snare` / `绫罗缚心` / uncommon / charm-control weak/charm setup.
- Cai Wenji:
  - `cai_yulan_echo` / `幽兰余响` / common / qin echo defense.
  - `cai_cleansing_rain` / `洗雨调` / uncommon / cleanse-melody conversion.
- Zhuge Liang:
  - `zhuge_star_gate` / `星门` / common / star-control scry/draw.
  - `zhuge_bamboo_slips` / `简策` / uncommon / retained strategy setup.
- Neutral:
  - `common_cangfeng` / `藏锋` / common / defensive draw.
  - `common_tashui` / `踏水` / common / body defense.
  - `mind_zhaoxin` / `照心` / rare / Wu mind cleanse.
  - `ink_unwritten_page` / `未写之页` / ink / high-risk draw.

Expected new baseline:

- Total cards: 93
- Rarity distribution: starter 15, common 38, uncommon 22, rare 10, ink 4, status 4
- Character distribution: Zhao Yun 18, Diao Chan 18, Cai Wenji 16, Zhuge Liang 15, neutral 26

## Acceptance Criteria

1. All 12 new cards are valid `CardDefinition` entries using only supported card effects.
2. The cards preserve role identities: Zhao spear/guard, Diao dance/charm, Cai qin/cleanse, Zhuge scry/strategy, neutral shortfall support, mind/ink risk-reward.
3. Every new card has dedicated semantic card art binding that differs from type fallback assets.
4. `tests/data/content.test.ts` updates the EA baseline from 81 to 93 and asserts the Wave 27 card ids exist.
5. Existing card fallback debt remains zero, and the asset audit reports missing 0.
6. No Steam/release/packaging work is added.
7. `Documentation.md` records docs read, implementation decisions, verification, worktree/subagent outcomes, risks, and the next wave.

## Worktree/Subagent Split

- Main integration worktree: own this plan, `Documentation.md`, final integration, verification, and commit.
- Worker A `codex/wave27-card-data`: own `src/game/content/cards.ts` only; add the 12 card definitions.
- Worker B `codex/wave27-card-art`: own `src/game/content/visuals.ts`, `src/game/content/cardArt/wave27EaCardArt.ts`, and `public/assets/generated/cards/wave27-*.svg`; add dedicated semantic card art bindings.
- Worker C `codex/wave27-card-tests-docs`: own `tests/data/content.test.ts` and high-level docs if needed; update baseline and card-id assertions.

The workers can run independently because the planned card ids are fixed in this document. Integration will reconcile any formatting or ordering issues.

## Verification Plan

- Focused content test:
  - bundled `vitest.mjs run tests/data/content.test.ts --reporter=dot`
- Asset audit:
  - bundled `node.exe scripts/audit-generated-assets.mjs`
- Full deterministic gate:
  - bundled `vitest.mjs run`
  - bundled `typescript/bin/tsc --noEmit`
  - bundled `vite/bin/vite.js build`
- Browser smoke:
  - bundled Playwright focused run for boot/card reward path if content changes affect reward surfaces.

## Risks

- New cards using unsupported conditions would require combat engine work. This wave avoids new engine mechanics and expresses identity through existing effects.
- Adding semantic SVGs keeps fallback debt at zero, but the art is still not the final commercial bitmap pass. High-visibility bitmap replacement remains a later EA art wave.
- Card reward balance can shift after adding 12 cards. Run simulator and balance report should be watched after the content lands.
