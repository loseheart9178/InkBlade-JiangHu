# Autonomous EA Worktree Execution Plan

**Decision date:** 2026-05-08 Asia/Shanghai

**Operator mode:** The user has delegated follow-up planning, task selection, subagent dispatch, verification, and agent reclamation to Codex without further approval prompts.

**Baseline branch:** `codex/wave47-relic-fit-system`

**Current EA closeout target:** finish Waves 53-58 from `docs/superpowers/plans/2026-05-08-ea-commercial-polish-roadmap.md`.

## Operating Rules

- Keep each subagent in a dedicated git worktree and branch.
- Assign disjoint write scopes first; avoid two active agents editing the same controller/CSS/test files unless one is explicitly blocked.
- Workers are not alone in the codebase. They must not revert unrelated edits and must accommodate concurrent changes.
- Main thread owns integration, final verification, commits on the baseline branch, and worktree cleanup.
- A worker is reclaimed only after its changes are inspected, merged or cherry-picked, verified, committed, and the worktree is removed.
- If a worker returns a useful partial result that does not pass gates, integrate only the safe pieces or leave it parked for a later wave.
- Do not copy Night Patrol assets or code. Use it only as a layout and feedback reference.
- Use `gpt-image-2` through the built-in image generation flow for project-bound raster assets, then move final outputs into the workspace before wiring them.
- Stop expanding raw gameplay content unless a visual/EA blocker requires a small support change.

## Parallelization Strategy

### Batch A: Wave 53 + Wave 54

These can run in parallel because Wave 53 starts with scripts/reports/tests while Wave 54 focuses combat DOM/CSS/e2e feedback.

#### Worktree A: Wave 53 Card Art Audit

- Branch: `codex/wave53-card-art-audit`
- Worktree: `.worktrees/wave53-card-art-audit`
- Owner: Worker A
- Primary files:
  - `scripts/card-art-quality-report.mjs`
  - `tests/data/card-art-quality-report.test.ts`
  - `reports/card-art-quality-report.md`
  - `reports/card-art-quality-report.json`
  - `docs/superpowers/plans/2026-05-08-wave53-card-art-quality.md`
  - `Documentation.md`
- Avoid:
  - `src/styles/theme.css`
  - `src/app/inkbladeController.ts`
  - generated replacement PNGs unless explicitly tasked after the audit lands
- Acceptance:
  - Reports duplicate art reuse, non-PNG/SVG distribution, suspicious source-sheet naming, odd dimensions when determinable, and a ranked replacement queue.
  - Unit or script-level tests pass.
  - Existing `scripts/audit-generated-assets.mjs` remains clean.

#### Worktree B: Wave 54 Combat Feedback

- Branch: `codex/wave54-combat-feedback`
- Worktree: `.worktrees/wave54-combat-feedback`
- Owner: Worker B
- Primary files:
  - `src/app/inkbladeController.ts`
  - `src/styles/theme.css`
  - `tests/e2e/visual-smoke.spec.ts`
  - `tests/e2e/playable-flow.spec.ts` only when needed for behavior coverage
  - `docs/superpowers/plans/2026-05-08-wave54-combat-feedback.md`
  - `Documentation.md`
- Avoid:
  - card-art audit scripts/reports
  - generated card art assets
- Acceptance:
  - Card play, enemy attack, disabled card, and intent states become visibly clearer.
  - Combat layout still protects the playfield and hand zone.
  - Visual smoke and relevant playable-flow tests pass.
  - Reduced-motion settings are not broken.

### Batch B: Wave 55 + Wave 56

Start after Batch A integration because both waves touch scene layout and motion.

#### Worktree C: Wave 55 Scene Surfaces

- Branch: `codex/wave55-scene-surfaces`
- Worktree: `.worktrees/wave55-scene-surfaces`
- Owner: Worker C
- Primary files:
  - `src/styles/theme.css`
  - `src/app/inkbladeController.ts`
  - `tests/e2e/playable-flow.spec.ts`
  - `tests/e2e/visual-smoke.spec.ts`
  - `docs/superpowers/plans/2026-05-08-wave55-scene-surfaces.md`
- Acceptance:
  - Reward, shop, event, and rest screens read as in-world surfaces.
  - Existing pick/purchase/event/rest behaviors remain unchanged.
  - Desktop no-overlap screenshot checks pass.

#### Worktree D: Wave 56 Transition Cinematics

- Branch: `codex/wave56-transition-cinematics`
- Worktree: `.worktrees/wave56-transition-cinematics`
- Owner: Worker D
- Primary files:
  - `src/app/inkbladeController.ts`
  - `src/styles/theme.css`
  - `tests/e2e/playable-flow.spec.ts`
  - `docs/superpowers/plans/2026-05-08-wave56-transition-cinematics.md`
- Acceptance:
  - Enter combat, claim spoils, chapter change, victory, and defeat have clearer authored beats.
  - Save/continue remains stable.
  - Reduced-motion still gets readable state changes.

### Batch C: Wave 57 + Wave 58

Start after Waves 53-56 have stabilized.

#### Worktree E: Wave 57 Generated Art Replacement

- Branch: `codex/wave57-generated-art-replacement`
- Worktree: `.worktrees/wave57-generated-art-replacement`
- Owner: Main thread plus targeted image-generation steps
- Primary files:
  - `public/assets/generated/cards/*`
  - `src/game/content/cardArt/*`
  - `src/game/content/visuals.ts`
  - `reports/card-art-quality-report.*`
  - `Documentation.md`
- Acceptance:
  - Worst queue items from Wave 53 are replaced.
  - Runtime asset audit remains missing/fallback clean.
  - Screenshots show replacement assets in real card frames.

#### Worktree F: Wave 58 EA Visual QA Gate

- Branch: `codex/wave58-ea-visual-qa`
- Worktree: `.worktrees/wave58-ea-visual-qa`
- Owner: Worker F or main thread depending on remaining conflicts
- Primary files:
  - `tests/e2e/visual-smoke.spec.ts`
  - `tests/e2e/playable-flow.spec.ts`
  - `scripts/handoff-preflight.mjs` only if gate output needs updating
  - `reports/*`
  - `docs/superpowers/plans/2026-05-08-wave58-ea-visual-qa.md`
  - `Documentation.md`
- Acceptance:
  - Full verification passes: TypeScript, Vitest, build, runtime asset audit, balance report, handoff report, visual smoke, playable flow.
  - EA closeout report states residual risks and post-EA backlog.

## Integration Procedure

1. Fetch worker result and inspect `git status`, `git diff --stat`, and high-risk file diffs inside the worktree.
2. Run the worker's focused tests in the worktree.
3. Merge or cherry-pick into baseline only if focused tests pass and write scope is respected.
4. Resolve conflicts in baseline, favoring already-verified mainline changes.
5. Run baseline verification for the affected surface.
6. Commit with a wave-specific message.
7. Remove the worktree and close the agent.
8. Update `Documentation.md` with verification results.

## Verification Ladder

- Documentation-only: `git diff --check`.
- Script/data wave: focused Vitest or Node script test, `scripts/audit-generated-assets.mjs`, TypeScript if source imports changed.
- UI wave: TypeScript, focused Vitest, visual smoke, affected playable-flow tests.
- Pre-closeout: full Vitest, build, asset audit, balance report, handoff report, full Chromium e2e.

## Current Dispatch

- Start Worker A on Wave 53 card-art quality audit.
- Start Worker B on Wave 54 combat feedback.
- Main thread remains on baseline branch to review plans, run verification, and prepare the next integration step.
