# Alpha Acceptance Playtest

Wave 4 release-QA surface for the desktop browser MVP. Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, and Steam packaging are outside this acceptance pass.

Last verified: 2026-05-03 18:20 Asia/Shanghai.

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
```

## Playable Scope

- Boot to the title screen and select any of the four MVP characters: Zhao Yun, Diao Chan, Cai Wenji, or Zhuge Liang.
- Start a desktop run, choose map nodes, enter card combat, play cards, end turns, win battles, and claim rewards.
- Use first-slice route surfaces covered by e2e: event, rest upgrade, shop relic purchase, elite method reward, boss reward bridge, chapter reward, logbook, second-chapter combat entry, save/continue after reload.
- Use title debug entries for settings, run-summary shell, and completed ending/profile summary.

## Verification Table

| Check | Command or Evidence | Result |
|---|---|---|
| Generated asset references have no missing runtime files | `node scripts/audit-generated-assets.mjs` | Passed: 86 runtime refs, 0 missing, 20 ink-pass debt, 31 GPT2 runtime assets, 8 source sheets |
| Deterministic unit coverage | `npm test` | Passed: 13 files, 132 tests |
| TypeScript compile check | `npm run typecheck` | Passed |
| Production build | `npm run build` | Passed with non-blocking Vite large-chunk warning |
| Desktop browser e2e | `npm run test:e2e` | Passed: 17 Chromium tests |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | Covered and passing |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | Covered and passing |

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

- Some generated art debt remains outside this release-QA branch. The asset audit tracks 20 remaining `*-ink-pass.png` runtime debt entries.
- Cai Wenji and Zhuge Liang are playable and covered by screenshots, but their combat standees still use fallback silhouette art instead of final generated character-specific standees.
- The current acceptance route is desktop-only Chromium automation. Mobile layout and touch-specific checks remain paused by project rule.
- The final chapter is represented by an ending/profile summary and debug completion path; a fully played final-chapter boss route is not yet part of browser e2e.
- Production audio, localization polish, Steam packaging, settings persistence depth, and full meta progression are not in this MVP gate.
