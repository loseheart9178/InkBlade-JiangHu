# Wave 36 EA Gameplay Teaching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the game’s distinctive mechanics in the playable EA build without adding a heavy tutorial flow, so first-time players can notice role identity, mind state, ink risk, and method progression faster.

**Architecture:** Extend the existing onboarding system from combat-only hints into a small reusable hint framework. Keep hint state and eligibility in pure TypeScript under `src/game/systems/tutorial/`, and let `inkbladeController.ts` only render combat and surface hint strips.

**Tech Stack:** TypeScript, DOM HUD rendering, CSS custom properties, Vitest, Playwright.

---

## File Structure

- Modify `src/game/systems/tutorial/onboarding.ts`: generalize hint ids and add cross-surface hint factories.
- Modify `src/app/inkbladeController.ts`: render new map/reward/method hint strips and all four role-specific combat hints.
- Modify `src/styles/theme.css`: style the new surface hint strip and small role/combat hint variants.
- Modify `tests/app-settings.test.ts`: cover new hint-id persistence and role-specific hint generation.
- Modify `tests/e2e/playable-flow.spec.ts`: add desktop browser coverage for map/reward/method and role-specific hint visibility/persistence.
- Modify `Documentation.md`: record docs read, design decision, verification, gaps, and next milestone.

## Acceptance Criteria

- [ ] Add role-specific feature callouts for Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang.
- [ ] Add short, dismissible, replay-safe explanations for route, reward, mind, ink, and method systems.
- [ ] Hints reuse persisted dismissal state and survive reload/continue.
- [ ] Debug skip does not auto-dismiss onboarding coverage.
- [ ] Reduced-motion users still see deterministic, non-animated hints.
- [ ] Focused Vitest and Playwright gates pass before full verification.

## Task 1: Write RED Tests

- [ ] **Step 1: Extend app-settings tests**

In `tests/app-settings.test.ts`, add:

- normalization coverage for new non-combat hint ids;
- role-specific combat hint coverage for all four characters;
- one surface-hint dismissal persistence check if the helper surface is unit-testable.

- [ ] **Step 2: Extend Playwright onboarding flow**

In `tests/e2e/playable-flow.spec.ts`, add expectations that:

- first map shows `surface-hint-map-route`, `surface-hint-map-mind`, `surface-hint-map-ink`;
- Zhao Yun first combat shows `onboarding-hint-character-zhaoyun`;
- first reward shows `surface-hint-reward-choice`;
- elite method reward shows `surface-hint-method-overview`;
- dismissing one surface hint keeps it hidden after reload/continue.

- [ ] **Step 3: Verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "onboarding|tutorial|hint"
```

Expected: FAIL because the new generic hint ids and DOM do not exist yet.

## Task 2: Generalize Tutorial State And Hint Selection

- [ ] **Step 1: Expand hint ids**

In `src/game/systems/tutorial/onboarding.ts`, keep the current combat hints but add ids for:

- `character-zhaoyun`
- `character-diaochan`
- `character-caiwenji`
- `character-zhugeliang`
- `map-route`
- `map-mind`
- `map-ink`
- `reward-choice`
- `method-overview`

- [ ] **Step 2: Add reusable surface hint factories**

Add pure helpers such as:

- `createCombatOnboardingHints(combat, dismissedHintIds)`
- `createMapOnboardingHints(run, dismissedHintIds)`
- `createRewardOnboardingHints(run, dismissedHintIds)`
- `createMethodOnboardingHints(run, dismissedHintIds)`

Each helper should return short title/body text only when the hint is contextually useful and not already dismissed.

## Task 3: Render Surface Hint Strips

- [ ] **Step 1: Add shared surface hint renderer**

In `src/app/inkbladeController.ts`, add a small renderer that outputs:

- `surface-hint-strip`
- `surface-hint-${id}`
- dismiss button `surface-hint-dismiss-${id}`

- [ ] **Step 2: Wire hints into surfaces**

Render hints on:

- map
- reward
- method reward

Also extend combat onboarding so each character gets one role-specific hint in their first relevant combat.

## Task 4: Style And Verify

- [ ] **Step 1: Add CSS**

In `src/styles/theme.css`, add a restrained paper/ink strip style that:

- fits desktop widths without colliding with existing panels;
- supports 1 to 3 hints in a row;
- keeps reduced-motion behavior deterministic.

- [ ] **Step 2: Run focused verification**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "onboarding|tutorial|hint"
```

- [ ] **Step 3: Run full verification**

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

- [ ] **Step 4: Update docs and commit**

Record:

- docs/files reread for this wave;
- the chosen “light hint strip” design;
- focused RED and GREEN results;
- any remaining risk around hint density or late-game hint suppression.
