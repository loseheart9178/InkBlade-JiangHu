# Combat UI Kit Gate10 Plan

## Plan

1. Add RED Playwright assertions for settings, title debug actions, profile goals, run ledger, and title shell panels.
2. Add stable `--kit` markup hooks in `src/app/inkbladeController.ts`.
3. Extend `src/styles/theme.css` with compact UI kit treatments for utility shells, setting rows, profile cards, and debug buttons.
4. Run focused e2e, then full verification.
5. Commit the isolated branch and merge it back to the current baseline.

## Verification

- `NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "settings panel|settings persist|public playable|run summary shell|profile goals|run ledger|challenge goal"`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test --project=chromium`
- `git diff --check`
