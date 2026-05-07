# Wave 42 Run Ledger Design

## Goal

Add a local run ledger that records recent completed and failed runs, so EA players can understand their journey history from the title profile shell and the ending summary.

## Player Value

- The profile surface becomes a readable record of what the player has tried, not just aggregate counters.
- Recent runs connect character, challenge, chapters reached, endings, fragments, and newly completed goals in one place.
- External playtesters can quickly report what path they took without needing platform services or debug logs.

## Scope

In scope:

- Local profile run records capped to a small recent-history limit.
- A derived best-run highlight based on chapters reached and victory status.
- Recording victory runs at final summary and defeat runs at loss.
- Title/debug profile shell and completed-run summary display of recent runs.
- Vitest and Playwright coverage.

Out of scope:

- Steam achievements, platform APIs, online accounts, leaderboards, cloud sync, analytics, or release packaging.
- Mobile layout work.
- New art generation.
- Full replay playback.

## Acceptance Criteria

- `PlayerProfile` stores a normalized `runRecords` array with a stable cap.
- Recording a run keeps newest records first and preserves legacy profiles safely.
- Victory records include character, challenge, ending, character epilogue, chapters completed, fragments, and newly completed goals.
- Defeat records include character, challenge, and chapters reached.
- A pure helper derives the best run and recent records without mutating profile data.
- Title/debug run summary and completed-run summary show a compact run ledger.
- Existing profile goals, compendium, save, and run summary behavior remain unchanged.
