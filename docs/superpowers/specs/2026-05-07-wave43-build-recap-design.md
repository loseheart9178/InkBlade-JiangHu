# Wave 43 Build Recap Design

## Goal

Add a deterministic build recap that turns the player's final deck, methods, relics, and challenge context into a readable martial-art summary on the completed-run screen.

## Player Value

- External EA playtesters can immediately tell what style they built after a run: spear-chain pressure, guardian counterplay, dance control, qin cleanse, formation control, or an unformed starter shell.
- The run summary becomes more than profile counters; it explains the run as a wuxia build story.
- The feature supports replay readability without adding platform services, analytics, storefront work, or new combat rules.

## Scope

In scope:

- A pure `deck/buildRecap` helper that derives:
  - strongest archetype label and count,
  - signature cards,
  - card-type breakdown,
  - tactical notes,
  - method/relic/challenge support cues.
- Completed-run summary UI with a compact `data-testid="run-build-recap"` panel.
- Focused Vitest and Playwright coverage.
- Desktop browser layout only.

Out of scope:

- New combat mechanics, rewards, balance tuning, or run progression rules.
- Steam achievements, platform APIs, accounts, analytics, release packaging, or storefront prep.
- New art generation or asset replacement.
- Mobile layout work.
- Persistent build analytics beyond the existing local run ledger.

## Acceptance Criteria

- `createDeckBuildRecap()` is deterministic and does not mutate card inputs.
- Empty decks return a stable "尚未成型" recap instead of throwing.
- Archetype-heavy decks identify the matching archetype and signature cards.
- Starter or mixed decks still show readable card-type and tactical cues.
- Method, relic, and non-standard challenge context appear as support cues when provided.
- Completed-run summaries render the build recap next to ending, epilogue, stats, goals, and run ledger.
- Existing deck viewer, profile goals, run ledger, save, and ending summary behavior remain unchanged.
