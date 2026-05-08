# Wave 45 Reward Fit Design

## Goal

Add a deterministic reward-fit explainer so each card reward tells players how it relates to their current build.

## Player Value

- Players can make faster, better draft choices without opening the deck viewer after every battle.
- The reward screen uses the same build language as the live deck compass and completed-run recap.
- External EA playtesters can immediately see why a card is offered: mainline reinforcement, branch pivot, utility coverage, or ink-risk power.

## Scope

In scope:

- A pure reward-fit helper under `src/game/systems/deck/`.
- Unit tests for mainline, branch, utility, ink, and empty-deck cases.
- Reward card UI chips and details using `data-testid="reward-build-fit"` and `data-testid="reward-build-fit-detail"`.
- Focused desktop Playwright coverage on the existing Zhao Yun reward flow.

Out of scope:

- Changing reward generation weights, card balance, combat rules, persistence, or save format.
- Steam/storefront/release packaging, analytics, accounts, or platform achievements.
- New art generation or mobile layout work.

## Acceptance Criteria

- The helper is deterministic and does not mutate the current deck or reward card.
- A reward card matching the current top archetype returns a mainline reinforcement label.
- A reward card with a different archetype returns a branch-pivot label.
- Ink rewards return an ink-risk label.
- Untagged utility cards return a coverage label based on card types.
- The reward screen displays fit chips and details for every reward card.
- Existing combo-biased reward marks, reward reasons, archetype role text, and card selection remain unchanged.
