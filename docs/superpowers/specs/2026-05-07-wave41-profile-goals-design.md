# Wave 41 Profile Goals Design

## Goal

Add a lightweight, platform-free profile goals layer that turns endings, character mastery, challenges, and lore collection into visible replay targets for the EA browser showcase.

## Player Value

- Players see concrete reasons to start another run after finishing or failing.
- Challenge profiles from Wave 40 become meaningful long-term objectives rather than one-off toggles.
- The run summary and title profile shell feel more commercial without requiring Steam achievements or online services.

## Scope

In scope:

- Local profile goals defined in data.
- Goal progress calculated from existing profile and run completion data.
- Goal unlock ids persisted in the local profile.
- Run summary callout for newly completed goals.
- Title/debug profile shell showing goal progress for browser QA.

Out of scope:

- Steam achievements, platform achievement APIs, online account systems, leaderboards, cloud sync, or release packaging.
- New art generation.
- Mobile layout work.

## Acceptance Criteria

- Add at least 12 local goals across first run, character mastery, endings, challenge runs, and lore fragments.
- Profile normalization keeps legacy profiles safe and initializes `completedGoalIds`.
- Completing a run can record newly completed goals without double-counting.
- Run summary displays newly completed goals when present.
- Existing profile stats and compendium behavior remain unchanged.
- Focused Vitest and Playwright coverage verifies goal progress and UI visibility.
