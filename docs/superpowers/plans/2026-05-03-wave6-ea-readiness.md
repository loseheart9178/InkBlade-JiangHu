# Wave 6 EA Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the desktop alpha toward EA-demo readiness with better card art coverage, final choice agency, learnability surfaces, and boot/build polish.

**Architecture:** Keep pure rules in `src/game/systems/` and data in `src/game/content/`. DOM/controller code adapts state into UI. Phaser remains a battlefield renderer. Generated assets bind through `src/game/content/visuals.ts` and the generated asset audit ledger.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, Playwright, project-local GPT Image 2 asset workflow.

---

## Required Context

Before implementation, each worker must re-read and record in `Documentation.md`:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/specs/2026-05-03-wave6-ea-readiness-design.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/chapters/chapter_01.md`
- `docs/chapters/chapter_02.md`
- `docs/chapters/chapter_03.md`
- `docs/chapters/final_chapter.md`
- Character docs if touching character-specific cards, epilogues, or art.
- `skills/inkblade-art-asset-pipeline/SKILL.md` and `docs/art/gpt2-priority-queue.md` if touching generated assets.

## Worktree And Ownership Map

| Worktree | Branch | Primary Files | Scope |
|---|---|---|---|
| `.worktrees/wave6-card-art-batch` | `codex/wave6-card-art-batch` | `public/assets/generated/cards/**`, `public/assets/generated/sources/**`, `src/game/content/visuals.ts`, `docs/art/gpt2-priority-queue.md`, `public/assets/generated/asset-audit.json`, `tests/data/content.test.ts`, `Documentation.md` | Dedicated GPT Image 2 card-art runtime batch |
| `.worktrees/wave6-final-choice` | `codex/wave6-final-choice` | `src/game/systems/endings/**`, `src/game/systems/profile/**`, `src/game/systems/run/**`, `src/app/inkbladeController.ts`, `tests/endings/**`, `tests/profile/**`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` | Final choice and character epilogue |
| `.worktrees/wave6-compendium` | `codex/wave6-compendium` | `src/game/systems/compendium/**`, `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/compendium/**`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` | Desktop read-only compendium |
| `.worktrees/wave6-glossary` | `codex/wave6-glossary` | `src/game/content/glossary.ts`, `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts`, `Documentation.md` | Keyword and intent explanations |
| `.worktrees/wave6-boot-split` | `codex/wave6-boot-split` | `src/main.ts`, `src/app/gameApp.ts`, `src/app/phaserConfig.ts`, `vite.config.ts`, `tests/app-shell.test.ts`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` | Boot/build chunk polish |

## Task 1: GPT Image 2 Starter And Common Card Art Batch

**Files:**
- Modify: `src/game/content/visuals.ts`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `public/assets/generated/asset-audit.json`
- Modify: `tests/data/content.test.ts`
- Add: `public/assets/generated/cards/gpt2-*.png`
- Add: `public/assets/generated/sources/gpt2-wave6-card-art-*.png`
- Modify: `Documentation.md`

- [ ] Generate dedicated ink-wash card art for the starter readability batch and common foundation batch from the Wave 5 ledger.
- [ ] Preserve untouched source sheets under `public/assets/generated/sources/`.
- [ ] Crop runtime card faces to `public/assets/generated/cards/` using semantic filenames.
- [ ] Bind each new card id in `cardArtList`.
- [ ] Refresh `asset-audit.json` and update the GPT2 queue notes with the reduced fallback count.
- [ ] Run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Task 2: Final Choice And Character Epilogue

**Files:**
- Modify: `src/game/systems/endings/endings.ts`
- Modify: `src/game/systems/profile/profile.ts`
- Modify as needed: `src/game/systems/run/run.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/endings/ending-system.test.ts`
- Modify: `tests/profile/profile-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] Add final-choice definitions for 封印墨渊, 焚毁墨书, 接管墨书, 与心魔合一, and 放下笔.
- [ ] Add character epilogue definitions for Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang using the character docs.
- [ ] Route final Boss victory into a `finalChoice` screen before ending/profile summary.
- [ ] Validate choice eligibility with the existing ending evaluator and run tendencies.
- [ ] Persist the chosen world ending and character epilogue in profile stats.
- [ ] Run:

```bash
npm test -- tests/endings/ending-system.test.ts tests/profile/profile-system.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "final boss route"
npm test
npm run build
```

## Task 3: Desktop Compendium

**Files:**
- Add: `src/game/systems/compendium/compendium.ts`
- Add: `tests/compendium/compendium-system.test.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] Add a pure compendium builder that groups cards, relics, enemies, combos, and story fragments.
- [ ] Add title and run-status entry points for `墨录图鉴`.
- [ ] Render compact tabs and filters for category, character, rarity, and chapter.
- [ ] Preserve and restore the previous screen when opening the compendium during a run.
- [ ] Add Playwright coverage for opening from title, filtering cards, opening from map, and returning.
- [ ] Run:

```bash
npm test -- tests/compendium/compendium-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "compendium|墨录图鉴"
npm test
npm run build
```

## Task 4: Keyword And Intent Glossary

**Files:**
- Add: `src/game/content/glossary.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `Documentation.md`

- [ ] Add glossary definitions for all currently shipped statuses, card types, resources, combo names, and enemy intent types.
- [ ] Render keyword chips with `title` and `aria-label` on hand/reward/deck cards.
- [ ] Render enemy intent and combo trail explanations without obscuring the battlefield.
- [ ] Add data tests proving no shipped keyword/status/intent lacks a glossary entry.
- [ ] Add visual smoke assertions for tooltip metadata on combat cards and enemy intent.
- [ ] Run:

```bash
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

## Task 5: Boot Performance Split

**Files:**
- Modify: `src/main.ts`
- Modify: `src/app/gameApp.ts`
- Modify: `src/app/phaserConfig.ts`
- Modify as needed: `vite.config.ts`
- Modify: `tests/app-shell.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] Add a boot shell that mounts immediately and then dynamically imports the game runtime.
- [ ] Keep controller and Phaser initialization behavior unchanged after the dynamic import resolves.
- [ ] Preserve app-shell tests in jsdom and browser boot tests in Playwright.
- [ ] Review `npm run build` output and document whether the large chunk warning is removed, isolated, or intentionally raised.
- [ ] Run:

```bash
npm test -- tests/app-shell.test.ts
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "boots"
npm test
```

## Integration Order

1. Integrate `wave6-boot-split` first because it changes boot boundaries that all browser tests rely on.
2. Integrate `wave6-card-art-batch` second because it is mostly manifest/assets and should shrink the art debt ledger early.
3. Integrate `wave6-final-choice` third because it changes late-run flow and profile persistence.
4. Integrate `wave6-compendium` fourth and resolve controller/style conflicts after final-choice.
5. Integrate `wave6-glossary` last because it touches card/intent rendering and should adapt to compendium/final-choice UI state.
6. After each integration, rerun the worker's narrow gate, `npm test`, and `npm run build`; run the full Wave 6 final gate at the end.
