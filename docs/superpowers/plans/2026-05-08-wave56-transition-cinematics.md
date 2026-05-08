# Wave 56 Route, Victory, Defeat, And Chapter Transition Cinematics

**Goal:** Give chapter progression, boss continuation, final choice, run summary, and defeat/victory result screens a more authored wuxia ink-wash cinematic presentation without changing combat math, reward generation, or save semantics.

## Implemented Scope

- Add chapter transition hero panels for chapter rewards and boss continuation.
- Add chapter progress strips showing completed/current/next/final chapter state.
- Reframe boss spoils as an authored dossier before the continue action.
- Add a final-choice ritual header that summarizes the actor, eligible endings, logbook fragments, and mind state while preserving existing choice eligibility and ending logic.
- Reframe final run summary as a dossier with a scrollable report body for ending, character epilogue, build recap, goals, and ledger.
- Reframe victory/defeat result screens as compact dossiers with run context and a stable restart action.
- Add lightweight transition motion and disable it under `.prefers-reduced-motion`.
- Extend Playwright coverage for chapter transition, final boss route, run summary, and defeat result surfaces.

## Non-goals

- No combat balance, card, relic, reward, shop, event, rest, or generated card-art changes.
- No save/continue semantic changes and no timed auto-advance.
- No Wave55 scene surface edits.
- No Night Patrol assets or code are copied.

## Files

- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/e2e/playable-flow.spec.ts`
- `docs/superpowers/plans/2026-05-08-wave56-transition-cinematics.md`
- `Documentation.md`

## Verification

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/typescript/bin/tsc --noEmit
Result: passed.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/lushihao/Desktop/InkBlade-JiangHu/InkBlade-JiangHu/node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "chapter|ending|final boss|run summary|defeat|victory"
Result: passed, 9 Chromium tests.

git diff --check
Result: passed.
```

## Risks

- The defeat smoke intentionally waits by ending turns, so it depends on the first battle remaining lethal when the player does nothing.
- Playwright must start Vite from this worktree; an older 5173 dev server from the main checkout will exercise stale UI. During verification, the stale server was stopped and a temporary `node_modules` symlink was used, then removed.
- This wave is CSS/DOM polish only; deeper route-map transition animation can still be expanded after Wave55 scene work lands.
