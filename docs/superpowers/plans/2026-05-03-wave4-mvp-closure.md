# Wave 4 MVP Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the current MVP by replacing priority art debt with GPT Image 2 assets, proving four-character route pacing, and producing desktop release QA evidence.

**Architecture:** Keep gameplay decisions in pure TypeScript systems and content data. Phaser and DOM surfaces only adapt manifests, screenshots, and state into visuals. Asset work flows through `public/assets/generated/gpt2-prompt-queue.json`, preserved sources, runtime crops, `src/game/content/visuals.ts`, and the generated asset audit.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, Playwright, GPT Image 2 built-in image generation, project-local image post-processing.

---

## Required Context

Before starting any Wave 4 task, re-read and record in `Documentation.md`:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- Relevant character docs for asset or gameplay work:
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
  - `docs/character_settings/蔡文姬_角色设定文档.md`
  - `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/chapters/final_chapter.md`
- `skills/inkblade-art-asset-pipeline/SKILL.md`
- `docs/art/gpt2-priority-queue.md`
- `public/assets/generated/gpt2-prompt-queue.json`

## Worktree And Ownership Map

| Worktree | Branch | Owner | Primary Files |
|---|---|---|---|
| `.worktrees/wave4-gpt2-assets` | `codex/wave4-gpt2-assets` | Parent PM + asset worker | `public/assets/generated/**`, `public/assets/sprites/**`, `src/game/content/visuals.ts`, `tests/e2e/visual-smoke.spec.ts`, `public/assets/generated/asset-audit.json`, `Documentation.md` |
| `.worktrees/wave4-alpha-balance` | `codex/wave4-alpha-balance` | Balance worker | `src/game/systems/debug/**`, `tests/playtest/**`, `src/game/content/{cards,enemies,rewards,chapters}.ts`, `tests/{combat,data,run}/**`, `Documentation.md` |
| `.worktrees/wave4-release-qa` | `codex/wave4-release-qa` | QA worker | `tests/e2e/**`, `docs/playtest/**`, `README.md` if present, `Documentation.md`, final acceptance notes |

Workers must not edit another worker's primary files unless the PM explicitly reassigns that surface.

## Task 1: GPT Image 2 Final Asset Pass

**Files:**
- Modify: `src/game/content/visuals.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `public/assets/generated/asset-audit.json`
- Add/replace runtime assets under:
  - `public/assets/generated/*.png`
  - `public/assets/generated/cards/*.png`
  - `public/assets/sprites/*.png`
  - `public/assets/generated/sources/*.png`
- Modify: `Documentation.md`

- [x] Generate priority source images with GPT Image 2 from the prompt queue.
  - Start with playable character identity and visible hand debt:
    - Zhao Yun ink-pass card faces.
    - Diao Chan ink-pass card faces.
    - Cai Wenji standee/card/sprite targets if absent from `visuals.ts`.
    - Zhuge Liang standee/card/sprite targets if absent from `visuals.ts`.
  - Then generate enemy/final chapter priority:
    - `enemy_bamboo_soldier`, `elite_qin_score`, `elite_bamboo_phalanx`, `elite_lubu_shadow`.
    - final battlefield `墨渊照心`.
    - final boss `无名史官`.
- [x] Preserve each untouched generated source under `public/assets/generated/sources/`.
- [x] Produce runtime crops:
  - Standees: transparent cutouts with complete head, hands, feet, weapon, ribbons, robe edges, instrument, and alpha-clean corners.
  - Card faces: 4:3 crop, no text, no watermark, readable within current card chrome.
  - Sprite strips: four 512x512 frames, bottom-center anchor, transparent background, no leftover red/white circular residue.
- [x] Update `src/game/content/visuals.ts` so generated assets replace semantic `*-ink-pass.png` paths instead of hiding debt.
- [x] Update `tests/e2e/visual-smoke.spec.ts` so desktop visual smoke covers Zhao Yun, Diao Chan, Cai Wenji, Zhuge Liang, and one enemy attack strip.
- [x] Run and record:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

**Acceptance:** `asset-audit.json` has no `missing`, priority ink-pass debt is reduced, desktop combat screenshots show standees above the hand zone and card art no longer using abstract placeholder slashes for priority cards.

## Task 2: Alpha Balance And Full Route Playtest

**Files:**
- Modify: `src/game/systems/debug/runSimulator.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify as needed: `src/game/content/cards.ts`, `src/game/content/enemies.ts`, `src/game/content/rewards.ts`, `src/game/content/chapters.ts`
- Modify as needed: `tests/combat/combat-system.test.ts`, `tests/data/content.test.ts`, `tests/run/run-system.test.ts`
- Modify: `Documentation.md`

- [x] Add simulator coverage for `zhaoyun`, `diaochan`, `caiwenji`, and `zhugeliang` across `luoshui`, `bamboo`, `changan`, and `moyuan`.
- [x] Add a deterministic full-route completion contract that reaches an ending-ready or completed summary state without renderer code.
- [x] Tune only data-driven values first:
  - Enemy damage, HP, shield, status pressure.
  - Reward pool weights and advanced card availability.
  - Character starter/relic values only if a route repeatedly fails.
- [x] Preserve character identity:
  - Zhao Yun remains stable攻防/破阵.
  - Diao Chan remains魅惑/舞势/闪避.
  - Cai Wenji remains琴音/余韵/净化.
  - Zhuge Liang remains观星/阵法/筹策.
- [x] Run and record:

```bash
npm test -- tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
npm test -- tests/combat/combat-system.test.ts
npm test
npm run build
```

**Acceptance:** Simulator summaries have no missing enemies, no persistent timeout-prone route warnings under the normal helper, and all four characters can reach the alpha route target.

## Task 3: Desktop Release QA And Acceptance Evidence

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Add/modify: `docs/playtest/alpha-acceptance.md`
- Modify: `Documentation.md`

- [x] Add desktop e2e coverage for:
  - Boot -> title -> character select.
  - One combat smoke path for all four characters.
  - Save/continue after reload.
  - Debug completed ending/profile summary.
- [x] Capture desktop screenshots from Playwright output for:
  - Zhao Yun combat.
  - Diao Chan combat.
  - Cai Wenji combat.
  - Zhuge Liang combat.
  - Ending/run summary.
- [x] Write `docs/playtest/alpha-acceptance.md` with:
  - Run commands.
  - Playable scope.
  - Verification result table.
  - Known MVP gaps that remain honest, especially art still pending outside generated priority assets.
- [x] Run and record:

```bash
node scripts/audit-generated-assets.mjs
npm test
npm run typecheck
npm run build
npm run test:e2e
```

**Acceptance:** Final QA document exists, e2e desktop screenshots are nonblank and show the preview-inspired layout, and all final acceptance commands pass except for documented non-blocking Vite chunk-size warning.

## Integration Order

1. Integrate `wave4-gpt2-assets` first if it touches `visual-smoke.spec.ts`.
2. Integrate `wave4-alpha-balance` second so QA tests validate the final tuned data.
3. Integrate `wave4-release-qa` last as the final acceptance ledger.
4. After each integration, remove the worktree, update `Plan.md` / `Documentation.md`, and commit.
