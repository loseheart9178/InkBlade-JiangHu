# Wave 7 Demo Hardening Autonomous Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for implementation work and keep every task in an isolated worktree. Each worker must record docs read, decisions, verification, failures, risks, and next step in `Documentation.md`.

**Goal:** Turn the verified Wave 6 vertical slice into a clearer desktop demo by hardening save/profile recovery, showing route risk/reward before map choices, adding compact first-run combat hints, generating deterministic balance evidence, and refreshing alpha acceptance documentation.

**Architecture:** Pure TypeScript systems remain authoritative for run state, map previews, tutorial eligibility, balance simulation, save/profile migration, rewards, endings, and debug progression. `src/app/inkbladeController.ts` and `src/ui/` adapt those pure states into DOM screens. Phaser scenes remain visual adapters and must not gain gameplay rules.

**Platform:** Desktop browser only for this wave. Mobile layout, mobile input, and mobile screenshots remain out of scope unless explicitly reopened.

---

## Required Context

Every worker must re-read and record these files before implementation:

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
- `docs/playtest/alpha-acceptance.md`
- `docs/art/gpt2-priority-queue.md` if touching art debt, generated asset audit, or visual acceptance language.

## Verified Baseline

- Base branch/worktree: `.worktrees/wave6-integration`.
- Baseline commit: `18f47f9 fix: address observed bugs and add debug skip`.
- Planning branch: `codex/wave7-demo-hardening-plan`.
- Root worktree remains dirty and is not the integration target.
- Latest full gate already passed on the baseline:
  - Vitest: 15 files, 157 tests passed.
  - TypeScript: `tsc --noEmit` passed.
  - Vite build: passed with the known non-blocking Phaser lazy chunk warning.
  - Playwright: 23 Chromium tests passed.
  - Asset audit: runtime references 105, missing 0, ink-pass debt 0, card fallback debt 56, GPT2 runtime assets 52, source sheets 20, prompt queue targets 54.

Use bundled Node for all verification:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

## Worktree And Ownership Map

| Worktree | Branch | Owner Role | Scope | Primary Files |
|---|---|---|---|---|
| `.worktrees/wave7-save-hardening` | `codex/wave7-save-hardening` | Builder | Corrupt storage, migration, profile defaults, incompatible run snapshots | `src/game/systems/save/**`, `src/game/systems/profile/**`, `src/app/gameApp.ts`, `tests/save/**`, `tests/profile/**`, `tests/app-shell.test.ts`, `Documentation.md` |
| `.worktrees/wave7-balance-report` | `codex/wave7-balance-report` | Builder | Deterministic simulator/report evidence for route completion and damage spikes | `src/game/systems/debug/**`, `scripts/**balance**`, `tests/playtest/**`, `tests/roadmap/**`, `docs/playtest/alpha-acceptance.md`, `Documentation.md` |
| `.worktrees/wave7-alpha-doc-refresh` | `codex/wave7-alpha-doc-refresh` | Reporter | Refresh acceptance, known gaps, art debt, and verification notes from Wave 6 baseline | `docs/playtest/alpha-acceptance.md`, `docs/art/gpt2-priority-queue.md`, `Documentation.md` |
| `.worktrees/wave7-route-preview` | `codex/wave7-route-preview` | Builder | Data-driven map node risk/reward preview | `src/game/systems/run/**`, `src/game/content/**`, `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/run/**`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` |
| `.worktrees/wave7-onboarding` | `codex/wave7-onboarding` | Builder | Compact first-combat hints after route preview integration | `src/game/systems/tutorial/**`, `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/e2e/playable-flow.spec.ts`, `tests/app-settings.test.ts`, `Documentation.md` |

Route preview and onboarding both touch controller/style/e2e surfaces. Run them in separate worktrees, but integrate route preview before onboarding to keep conflict resolution small. Save hardening, balance report, and docs refresh can run in parallel immediately.

## Task 7.1: Save And Profile Hardening

**Acceptance:**

- Corrupted localStorage values do not block boot, title screen, settings, profile summary, or new-run creation.
- Older save/profile shapes migrate to current defaults without losing compatible progress fields.
- Missing, malformed, or incompatible run snapshots fail closed into a safe title/new-run state.
- Settings/profile persistence remains separate from debug skip and current run progression.
- Unit tests cover corruption, migration, missing fields, and app-shell boot resilience.

**TDD gate:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/save/save-system.test.ts tests/profile/profile-system.test.ts tests/app-shell.test.ts
```

## Task 7.2: Route Preview

**Acceptance:**

- Map nodes show concise previews for `battle`, `elite`, `event`, `shop`, `rest`, `boss`, and final-route nodes.
- Preview data is generated by a pure run/content helper, not by DOM text scraping or Phaser state.
- Battle/elite/boss previews include likely enemy pressure and reward tier; event/shop/rest previews communicate opportunity/cost.
- Preview text is chapter-aware and uses existing data/content naming.
- Desktop map remains readable with no overlap against the paper-texture panel or debug skip controls.

**TDD gate:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/run/run-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "map|route|debug skip"
```

## Task 7.3: First-Run Onboarding

**Acceptance:**

- The first combat surfaces compact hints for energy, hand cards, enemy intent, block/armor, and ending the turn.
- Hints are contextual, dismissible, and do not form a blocking tutorial wall.
- Dismissed hints persist in settings/profile storage and do not reappear after reload.
- Debug skip remains available for test acceleration and does not mark onboarding as completed by itself.
- Combat HUD, hand cards, and enemy intent remain readable at desktop viewport sizes.

**TDD/browser gate:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts tests/save/save-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "first combat|boots|debug skip"
```

## Task 7.4: Balance Report

**Acceptance:**

- A deterministic system-level report can simulate representative routes for all shipped heroes.
- The report summarizes chapter reach, win/loss, turn counts, timeout risk, healing pressure, and unsafe damage spikes.
- The report avoids DOM/Phaser dependencies and uses seeded run/combat systems.
- Tests assert deterministic output shape and at least one representative completion route.
- `docs/playtest/alpha-acceptance.md` links or summarizes the latest report findings.

**Verification gate:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/roadmap/next-ten-modules.test.ts
```

## Task 7.5: Alpha Acceptance And Art Debt Refresh

**Acceptance:**

- `docs/playtest/alpha-acceptance.md` reflects the latest Wave 6 verified state, including final boss route coverage, compendium/glossary/final choice, debug skip, and current test counts.
- `docs/art/gpt2-priority-queue.md` keeps card fallback debt at 56 unless new generated card art exists, and explicitly tracks first-chapter elite stand-ins as bespoke regeneration debt.
- Documentation distinguishes gameplay blockers from non-blocking art backlog and the known large Phaser chunk warning.
- No generated asset manifest changes are made unless `scripts/audit-generated-assets.mjs` is rerun and passes.

**Verification gate:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

## Integration Order

1. Commit this plan on `codex/wave7-demo-hardening-plan`.
2. Create worktrees from the plan branch for save hardening, balance report, docs refresh, and route preview.
3. Dispatch independent workers for save hardening, balance report, and docs refresh. Work route preview locally or with one builder after the pure preview API is scoped.
4. Integrate save hardening first because it protects boot and persistence for later browser tests.
5. Integrate balance report second because it mostly touches pure debug/playtest surfaces.
6. Integrate docs refresh third, rebasing its acceptance text onto any new balance evidence.
7. Integrate route preview fourth and rerun browser map/debug-skip checks.
8. Create or refresh the onboarding worktree from the integrated route-preview branch, then implement and integrate onboarding.
9. Run the final Wave 7 gate:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

## Completion Criteria

- Each worktree has a narrow red/green record or a documented reason a docs-only task has no red test.
- Every semantic change is covered by Vitest or Playwright where practical.
- `Documentation.md` is updated in every branch before commit.
- The final integrated branch passes full Vitest, typecheck, build, Playwright desktop e2e, and asset audit.
- Completed subagents are closed after their branch is reviewed and either integrated or explicitly deferred.
- Remaining known gaps are documented as Wave 8 backlog, not left implicit.

## Wave 8 Backlog Seeds

- Regenerate bespoke clean standees and attack strips for first-chapter elite enemies currently using vetted stand-ins.
- Reduce card fallback art debt below 56 through generated card batches.
- Expand chapter-two/chapter-three/final event outcome variety tied to ink/mind tendencies.
- Add release packaging notes and a desktop-focused external playtest checklist.
