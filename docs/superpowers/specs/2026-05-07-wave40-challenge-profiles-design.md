# Wave 40 Challenge Profiles Design

## Goal

Add opt-in challenge profiles that are visible from the desktop title flow, travel with the run state, influence deterministic route/combat pressure, and can be reported by the balance tools.

## Player Value

- External EA players can immediately see that runs have replayable variants beyond character selection.
- The profiles frame difficulty as authored jianghu scenarios instead of hidden debug toggles.
- The default run remains unchanged for alpha/baseline QA.

## Scope

In scope:

- A small challenge profile data set: default plus three opt-in profiles.
- Run-state persistence of the selected profile id.
- Deterministic start modifiers: gold, max HP, and effective map seed.
- Deterministic combat pressure modifiers: enemy max HP multiplier and enemy attack bonus.
- Balance report support for one selected challenge profile at a time.
- Title-screen challenge selection with desktop CSS and browser coverage.

Out of scope:

- Steam achievements, storefront challenge modes, leaderboards, cloud saves, or release packaging.
- Endless mode or daily challenge backend.
- Mobile layout work.
- New art generation.

## Proposed Profiles

| Id | Name | Gameplay Meaning |
|---|---|---|
| `standard` | 行云常路 | Existing baseline behavior. |
| `scarcity` | 雨夜穷途 | Less starting gold and slightly lower max HP; route seed shifts. |
| `inkRising` | 墨潮压境 | Mild enemy max-HP pressure and route seed shift. |
| `ironRain` | 铁雨试锋 | Mild enemy attack pressure and route seed shift. |

## Acceptance Criteria

- `createRun("zhaoyun")` remains baseline compatible and records `challengeId: "standard"`.
- `createRun("zhaoyun", { challengeId: "scarcity" })` records the selected profile and applies start modifiers deterministically.
- Combat can receive challenge modifiers without renderer involvement.
- Balance report markdown includes the active challenge profile.
- Title screen exposes challenge buttons that can be selected before starting a run.
- Playwright verifies selecting `墨潮压境` starts a run whose route status shows that challenge.

## Verification Target

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/run/run-system.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "challenge"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```
