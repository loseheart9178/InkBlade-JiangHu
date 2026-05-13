# Combat UI Kit Gate9 Plan

## Plan

1. Add RED Playwright assertions for Gate9 UI kit classes on chapter reward, boss reward, final choice, result, and run summary surfaces.
2. Add stable markup hooks in `src/app/inkbladeController.ts` without changing game state or choice behavior.
3. Extend `src/styles/theme.css` with compact UI kit treatments for transition dossiers, rails, final choice cards, and result summary panels.
4. Run focused e2e, then full verification.
5. Commit the isolated branch and merge it back to the current baseline.

## Verification

- `NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "final boss route|defeat result|first chapter through"`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test --project=chromium`
- `git diff --check`
