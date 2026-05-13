# Combat UI Kit Gate11 Acceptance

## Accepted Scope

Gate11 locks the UI kit migration from Gate3 through Gate10:

- Reward / Shop card-pick and commerce surfaces.
- Event / Rest choice actions and scene shell language.
- Route Map node cards and previews.
- Title / Character Select / Challenge selection.
- Compendium / Logbook archive surfaces.
- Visual QA hooks for kit components.
- Result / Final Choice / Chapter Transition surfaces.
- Settings / Profile / Debug title shells.

## Guardrails

- This gate does not change gameplay, persistence, reward, ending, profile, or debug logic.
- This gate does not generate bitmap or PSD assets.
- Future visual work should use this acceptance test as the contract for existing UI kit hooks before adding new art passes.

## Verification Contract

`tests/ui-assets/combat-ui-kit-gates.test.ts` verifies:

- Gate specs and plans remain in the repo.
- This acceptance ledger exists.
- Core controller markup keeps UI kit hooks wired.
- Core theme selectors keep UI kit hooks styled.
