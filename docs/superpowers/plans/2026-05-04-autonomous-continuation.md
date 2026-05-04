# 2026-05-04 Autonomous Continuation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development for implementation work. Each task must run in an isolated worktree, preserve gameplay rules outside renderer code, and update `Documentation.md` with docs read, decisions, verification, failures, and next step.

**Goal:** Recover the lost-session Wave 6 work safely, finish EA-readiness features, then continue toward a sturdier desktop demo with route clarity, onboarding, balance evidence, and release QA.

**Architecture:** Pure TypeScript systems remain the source of truth for combat, run state, profile, endings, compendium, glossary, rewards, and persistence. DOM/controller code renders menus, overlays, cards, compendium, glossary, final choices, and run summaries. Phaser only adapts battle state and visual assets to the battlefield.

**Tech Stack:** TypeScript, Vite, Phaser, Vitest, Playwright, project-local generated asset audit, Codex bundled Node v24 for verification.

---

## Required Context

The controller and every worker must re-read these files before implementation:

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
- Character docs when touching character copy, epilogues, card identity, or art.
- `skills/inkblade-art-asset-pipeline/SKILL.md` and `docs/art/gpt2-priority-queue.md` when touching generated assets.

## Current Baseline

- Active branch: `codex/next-major-modules` at `8adc8d0`.
- Existing Wave 6 planning and dispatch docs are present.
- Main worktree has CRLF/LF-only dirty noise in many tracked files; `git diff --ignore-space-at-eol --stat` is empty.
- `node scripts/audit-generated-assets.mjs` passes with runtime missing `0`, ink-pass debt `0`, and card fallback debt `56`.
- System Node 18 cannot run this repo's Vite/Vitest toolchain. Use bundled Node v24:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js
```

## Wave 6 Rescue And Completion

### Worktree Recovery Rule

The old Wave 6 worktrees were repaired from Windows gitdir paths to WSL paths. They contain real changes mixed with line-ending noise. Recover only semantic changes by generating patches with `--ignore-space-at-eol`, applying them to clean rescue worktrees, and committing from those clean worktrees.

### Task 6.1: Boot Performance Split Integration

**Source branch:** `codex/wave6-boot-split` at `975a5d4`.

**Primary files:**

- `src/app/gameApp.ts`
- `src/app/phaserConfig.ts`
- `tests/app-shell.test.ts`
- `Documentation.md`

**Steps:**

- [ ] Merge or cherry-pick `975a5d4` into `codex/next-major-modules`.
- [ ] Resolve only `Documentation.md` / `docs/superpowers/agent-runs/2026-05-03-wave6.md` conflicts from dispatch logging.
- [ ] Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-shell.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

**Acceptance:** App shell still mounts in jsdom, runtime split builds, and build output is recorded.

### Task 6.2: Final Choice And Character Epilogue Rescue

**Dirty source:** `.worktrees/wave6-final-choice`.

**Clean target:** `.worktrees/wave6-final-choice-rescue` on `codex/wave6-final-choice-rescue`.

**Primary files:**

- `src/game/systems/endings/endings.ts`
- `src/game/systems/profile/profile.ts`
- `src/game/systems/run/run.ts`
- `src/game/systems/run/types.ts`
- `src/app/inkbladeController.ts`
- `tests/endings/ending-system.test.ts`
- `tests/profile/profile-system.test.ts`
- `tests/run/run-system.test.ts`
- `tests/e2e/playable-flow.spec.ts`
- `Documentation.md`

**Steps:**

- [ ] Extract a semantic patch from the old worktree:

```bash
git --git-dir=/mnt/d/InkBlade-JiangHu/.git --work-tree=/mnt/d/InkBlade-JiangHu/.worktrees/wave6-final-choice diff --ignore-space-at-eol --binary codex/wave6-final-choice > /tmp/wave6-final-choice.patch
```

- [ ] Create a clean rescue worktree from `codex/next-major-modules` after Task 6.1 lands.
- [ ] Apply `/tmp/wave6-final-choice.patch`.
- [ ] Run the narrow gate:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/endings/ending-system.test.ts tests/profile/profile-system.test.ts tests/run/run-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js tests/e2e/playable-flow.spec.ts --grep "final boss route"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

**Acceptance:** Defeating `无名史官` routes to a terminal choice; selected world ending and character epilogue persist into profile/run summary.

### Task 6.3: Desktop Compendium Rescue

**Dirty source:** `.worktrees/wave6-compendium`.

**Clean target:** `.worktrees/wave6-compendium-rescue` on `codex/wave6-compendium-rescue`.

**Primary files:**

- `src/game/systems/compendium/compendium.ts`
- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/compendium/compendium-system.test.ts`
- `tests/e2e/playable-flow.spec.ts`
- `Documentation.md`

**Steps:**

- [ ] Preserve untracked compendium files in the patch:

```bash
git -C /mnt/d/InkBlade-JiangHu/.worktrees/wave6-compendium add -N src/game/systems/compendium tests/compendium
git --git-dir=/mnt/d/InkBlade-JiangHu/.git --work-tree=/mnt/d/InkBlade-JiangHu/.worktrees/wave6-compendium diff --ignore-space-at-eol --binary codex/wave6-compendium > /tmp/wave6-compendium.patch
```

- [ ] Apply the patch in a clean rescue worktree after final-choice integration.
- [ ] Reconcile controller/screen stack behavior with the new `finalChoice` screen.
- [ ] Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/compendium/compendium-system.test.ts tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js tests/e2e/playable-flow.spec.ts --grep "compendium|墨录图鉴"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

**Acceptance:** `墨录图鉴` opens from title and run status, filters content, and returns to the previous run screen without mutating run state.

### Task 6.4: Keyword And Intent Glossary Rescue

**Dirty source:** `.worktrees/wave6-glossary`.

**Clean target:** `.worktrees/wave6-glossary-rescue` on `codex/wave6-glossary-rescue`.

**Primary files:**

- `src/game/content/glossary.ts`
- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/data/content.test.ts`
- `tests/e2e/visual-smoke.spec.ts`
- `Documentation.md`

**Steps:**

- [ ] Preserve untracked glossary data in the patch:

```bash
git -C /mnt/d/InkBlade-JiangHu/.worktrees/wave6-glossary add -N src/game/content/glossary.ts
git --git-dir=/mnt/d/InkBlade-JiangHu/.git --work-tree=/mnt/d/InkBlade-JiangHu/.worktrees/wave6-glossary diff --ignore-space-at-eol --binary codex/wave6-glossary > /tmp/wave6-glossary.patch
```

- [ ] Apply the patch in a clean rescue worktree after compendium integration.
- [ ] Reconcile tooltip/chip selectors with final card chrome and compendium UI.
- [ ] Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

**Acceptance:** Shipped statuses, card types, resources, combos, and enemy intents have data-driven explanations; combat card/intents expose desktop tooltip metadata.

### Task 6.5: Card Art Batch Replan

**Dirty source:** `.worktrees/wave6-card-art-batch`.

**Decision:** The old worktree only contains documentation progress, not generated card runtime assets. Do not block Wave 6 completion on unavailable image generation. Convert this task into an executable queue refresh unless image generation becomes available during the run.

**Primary files:**

- `docs/art/gpt2-priority-queue.md`
- `public/assets/generated/gpt2-prompt-queue.json`
- `public/assets/generated/asset-audit.json`
- `src/game/content/visuals.ts`
- `tests/data/content.test.ts`
- `Documentation.md`

**Steps:**

- [ ] Verify the current queue still includes starter readability and common foundation card targets.
- [ ] If no generated source sheets exist, record the deferred asset generation decision and keep `cardFallbackDebt` non-blocking.
- [ ] Run:

```bash
node scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
```

**Acceptance:** Runtime missing remains `0`; any remaining card fallback debt is documented as art backlog, not a gameplay blocker.

## Wave 7: Demo Learnability And Route Clarity

These tasks are independent after Wave 6 is integrated.

| Worktree | Branch | Scope | Primary Files |
|---|---|---|---|
| `.worktrees/wave7-onboarding` | `codex/wave7-onboarding` | First-run combat hints and non-wall tutorial prompts | `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/e2e/playable-flow.spec.ts` |
| `.worktrees/wave7-route-preview` | `codex/wave7-route-preview` | Map node preview for enemy/reward/event risk | `src/game/systems/run/run.ts`, `src/app/inkbladeController.ts`, `tests/run/run-system.test.ts`, `tests/e2e/playable-flow.spec.ts` |
| `.worktrees/wave7-balance-report` | `codex/wave7-balance-report` | Simulator report command/data for route completion and damage spikes | `src/game/systems/debug/runSimulator.ts`, `tests/playtest/run-simulator.test.ts`, `docs/playtest/alpha-acceptance.md` |
| `.worktrees/wave7-save-hardening` | `codex/wave7-save-hardening` | Save/profile migration and corrupted-storage resilience | `src/game/systems/save/save.ts`, `src/game/systems/profile/profile.ts`, `tests/save/save-system.test.ts`, `tests/profile/profile-system.test.ts` |

### Task 7.1: First-Run Onboarding

**Acceptance:** First combat communicates energy, intent, block, and end turn through compact contextual hints; no tutorial wall; hints are dismissible and respect save/settings state.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js tests/e2e/playable-flow.spec.ts --grep "first combat|boots"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts tests/save/save-system.test.ts
```

### Task 7.2: Route Preview

**Acceptance:** Map nodes show concise risk/reward previews for battle, elite, event, shop, rest, and boss nodes using data-driven chapter/run state.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/run/run-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js tests/e2e/playable-flow.spec.ts --grep "map|route"
```

### Task 7.3: Balance Report

**Acceptance:** A deterministic playtest report summarizes chapter completion, timeout risk, unsafe damage spikes, and character coverage without depending on DOM or Phaser.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/roadmap/next-ten-modules.test.ts
```

### Task 7.4: Save/Profile Hardening

**Acceptance:** Corrupted localStorage, older save versions, missing profile fields, and incompatible run snapshots fail gracefully and never block boot.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/save/save-system.test.ts tests/profile/profile-system.test.ts tests/app-shell.test.ts
```

## Wave 8: Content Depth And Release QA

Dispatch after Wave 7 acceptance.

| Worktree | Branch | Scope | Primary Files |
|---|---|---|---|
| `.worktrees/wave8-event-depth` | `codex/wave8-event-depth` | More chapter-two/three/final event outcomes tied to mind/ink tendencies | `src/game/content/events.ts`, `src/game/systems/events/eventEffects.ts`, `tests/events/event-system.test.ts` |
| `.worktrees/wave8-relic-method-polish` | `codex/wave8-relic-method-polish` | More relic/method synergies for all four characters | `src/game/content/relics.ts`, `src/game/content/methods.ts`, `tests/relics/relic-system.test.ts`, `tests/methods/method-system.test.ts` |
| `.worktrees/wave8-visual-qa` | `codex/wave8-visual-qa` | Desktop screenshot QA and visual smoke expansion | `tests/e2e/visual-smoke.spec.ts`, `docs/playtest/alpha-acceptance.md` |
| `.worktrees/wave8-release-docs` | `codex/wave8-release-docs` | Play instructions, known gaps, acceptance notes | `README.md`, `docs/playtest/alpha-acceptance.md`, `Documentation.md` |

## Integration Order

1. Integrate boot split.
2. Integrate final choice.
3. Integrate compendium.
4. Integrate glossary.
5. Close or defer card art batch based on generated source availability.
6. Run the Wave 6 final gate:

```bash
node scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js
```

7. Dispatch Wave 7 workers in parallel.
8. Integrate Wave 7 in this order: save hardening, balance report, route preview, onboarding.
9. Dispatch Wave 8 after Wave 7 final gate passes.

## Completion Criteria For Each Worktree

- Narrow tests pass with bundled Node v24.
- `npm run build` equivalent passes through direct Vite/tsc commands.
- Browser tests pass when the task changes DOM flow, UI, or boot behavior.
- `Documentation.md` records docs read, progress, decisions, verification, failures, risks, and next step.
- The worker commits semantic changes only; line-ending-only churn is not accepted.
- After integration, the controller reruns the narrow gate on `codex/next-major-modules`, then removes the completed worktree and closes the agent.

