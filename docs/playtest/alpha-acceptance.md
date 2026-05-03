# Alpha Acceptance Playtest

Wave 4 release-QA surface for the desktop browser MVP after integrating GPT Image 2 assets, four-character alpha balance contracts, and desktop e2e evidence. Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, and Steam packaging are outside this acceptance pass.

Last verified: 2026-05-03 21:35 Asia/Shanghai.

## Runnable Commands

```bash
node scripts/audit-generated-assets.mjs
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Useful focused reruns:

```bash
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test -- tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
```

## Playable Scope

- Boot to the title screen and select any of the four MVP characters: Zhao Yun, Diao Chan, Cai Wenji, or Zhuge Liang.
- Start a desktop run, choose map nodes, enter card combat, play cards, end turns, win battles, claim rewards, and continue a saved combat after reload.
- Use first-slice route surfaces covered by e2e: event, rest upgrade, shop relic purchase, elite method reward, boss reward bridge, chapter reward, logbook, second-chapter combat entry, save/continue after reload.
- Use deterministic simulator coverage for all four characters through `luoshui`, `bamboo`, `changan`, and `moyuan`.
- Use title debug entries for settings, run-summary shell, and completed ending/profile summary.

## Verification Table

| Check | Command or Evidence | Result |
|---|---|---|
| Generated asset references have no missing runtime files | `node scripts/audit-generated-assets.mjs` | Passed: 105 runtime refs, 0 missing, 0 ink-pass debt, 55 GPT2 runtime assets, 20 source sheets |
| Deterministic unit coverage | `npm test` | Passed: 13 files, 134 tests |
| TypeScript compile check | `npm run typecheck` | Passed |
| Production build | `npm run build` | Passed with non-blocking Vite large-chunk warning |
| Desktop browser e2e | `npm run test:e2e` | Passed: 17 Chromium tests |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | Covered and passing with GPT2 standees/card art and attack strips |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Four-character alpha route simulator | `tests/playtest/run-simulator.test.ts` | Covered and passing through the normal route contract |

## Screenshot Artifacts

The Playwright HTML report and `test-results/` output include these attached desktop screenshots when `npm run test:e2e` runs:

- `combat-zhaoyun-desktop.png`
- `combat-diaochan-desktop.png`
- `combat-caiwenji-desktop.png`
- `combat-zhugeliang-desktop.png`
- `ending-profile-summary-desktop.png`

Latest local paths:

```text
test-results/visual-smoke-captures-desk-56fce-ots-for-all-four-characters-chromium/combat-zhaoyun-desktop.png
test-results/visual-smoke-captures-desk-56fce-ots-for-all-four-characters-chromium/combat-diaochan-desktop.png
test-results/visual-smoke-captures-desk-56fce-ots-for-all-four-characters-chromium/combat-caiwenji-desktop.png
test-results/visual-smoke-captures-desk-56fce-ots-for-all-four-characters-chromium/combat-zhugeliang-desktop.png
test-results/playable-flow-ending-summa-5f3d5-nd-persists-profile-summary-chromium/ending-profile-summary-desktop.png
```

## Honest MVP Gaps

- The current acceptance route is desktop-only Chromium automation. Mobile layout and touch-specific checks remain paused by project rule.
- The final chapter has deterministic simulator coverage and an ending/profile summary debug path, but a fully played final-chapter boss route is not yet part of browser e2e.
- The `墨渊照心` battlefield asset is generated and registered in the visual manifest; route-specific battlefield switching remains a later polish task.
- Some low-priority starter/filler cards still share type-level fallback card art, though the generated asset audit now reports 0 tracked `ink-pass` runtime debt.
- Production audio, localization polish, Steam packaging, settings persistence depth, and full meta progression are not in this MVP gate.
