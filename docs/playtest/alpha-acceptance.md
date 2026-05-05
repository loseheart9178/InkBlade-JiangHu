# Alpha Acceptance Playtest

Wave 14 compendium unlock-depth closure for the desktop browser alpha. Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, Steam packaging, and broad localization polish remain outside this acceptance pass.

Last full gate verified: 2026-05-05 Wave 14 compendium unlock-depth integration on branch `codex/wave14-compendium-depth`.

Wave 7 through Wave 10 balance-report sections remain historical references below. The current Wave 14 multi-seed artifact result is still 12/12 completed routes with no timeout risks or unsafe damage spikes.

External bug reports should use [external-bug-intake.md](external-bug-intake.md) for setup/build fields, severity labels, route tags, evidence requirements, and the copy-ready report template.

For release handoff, generate `reports/alpha-handoff.md` with `scripts/alpha-handoff-report.mjs` after the balance artifact exists.

## Runnable Commands

Use the bundled Node runtime for autonomous worktrees:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

Useful focused reruns:

```bash
npm run report:balance
npm run report:handoff
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "debug skip|compendium|墨录图鉴"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
```

## Playable Scope

- Boot to the title screen and select any of the four MVP characters: Zhao Yun, Diao Chan, Cai Wenji, or Zhuge Liang.
- Start a desktop run, choose map nodes, enter card combat, play cards, end turns, win battles, claim rewards, and continue saved run states after reload.
- Use first-slice and cross-chapter route surfaces covered by e2e: event, rest upgrade, shop relic purchase, elite method reward, boss reward bridge, chapter reward, logbook, second-chapter combat entry, save/continue after reload, and final boss debug route.
- Complete the browser final boss route from `墨渊照心` map into `无名史官` combat, chapter reward, boss reward, final choice, reload/continue from final choice, ending/profile summary, and persisted profile stats.
- Use title/run `墨录图鉴` compendium coverage for cards, relics, enemies, combos, and story fragments without losing the current run screen; story entries now show profile-aware `已录` / `未录` badges while full-reference entries show `参照`.
- Use glossary metadata on shipped card keyword chips, combat status badges, enemy intents, and combo trail entries; desktop tooltip attributes are covered in visual smoke.
- Use the visible `调试跳章` control to advance to the next chapter map for prototype testing; it refreshes chapter backdrop context and remains a debug aid, not production progression.
- Use deterministic simulator coverage for all four MVP characters through the shipped route contract, including `luoshui`, `bamboo`, `changan`, and `moyuan`.

## Wave 11 Alpha Backlog Closure Acceptance

Wave 11 scope: final-choice affordance metadata, status badge glossary metadata, and explicit lazy Phaser chunk budget.
Known art gap: Milestone 58 remains an optional GPT Image 2 bitmap card-art quality pass.

Wave 12 scope: save screen-boundary hardening and profile counter migration repair.
Wave 13 scope: balance report `--out` artifact export while preserving stdout.
Wave 14 scope: profile-aware compendium unlock metadata, badges, and unlock filter while keeping full reference visibility.
Final Wave 14 gate: Vitest 19 files / 192 tests, TypeScript compile passed, Vite build passed without the previous Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / card fallback debt 0, and the multi-seed balance report artifact matched stdout.
Final Wave 13 gate: Vitest 19 files / 190 tests, TypeScript compile passed, Vite build passed without the previous Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / card fallback debt 0, and the multi-seed balance report artifact matched stdout.
Final Wave 12 gate: Vitest 18 files / 189 tests, TypeScript compile passed, Vite build passed without the previous Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / card fallback debt 0, and the multi-seed balance report completed 12/12 routes.

Wave 11 closes the non-art alpha backlog by hardening surfaces that already existed in the vertical slice:

- The final-choice screen exposes testable `data-final-choice-count`, choice eligibility, and requirement metadata without changing ending rules.
- Combat status badges expose glossary ids, titles, and accessible labels, extending the existing keyword, intent, and combo glossary coverage.
- Vite keeps the Phaser runtime behind the lazy boot split and documents the current lazy chunk with an explicit `1300` kB warning budget so future chunk growth is actionable.

Focused Wave 11 integration checks passed for the final boss route, desktop combat smoke, and app-shell lazy chunk budget before the full release gate.

Final Wave 11 gate: Vitest 18 files / 187 tests, TypeScript compile passed, Vite build passed without the previous Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / card fallback debt 0, and the multi-seed balance report completed 12/12 routes.

## Wave 10 Card Fallback Zero Acceptance

Wave 10 acceptance was refreshed after the integration branch merged all three independent card-art batches. The verified release target is:

- All 45 remaining card fallback targets use dedicated semantic SVG card faces instead of shared type-level art.
- The asset audit counts imported card-art modules and reports `cardFallbackDebt` as 0.
- Zhuge Liang seed `9003` remains complete in the deterministic multi-seed route without introducing timeout risks or unsafe damage spikes.
- Starter semantic card art and first-chapter semantic attack strips remain bound from Wave 9.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`, and none use the generic enemy slash as final combat identity.
- Desktop-first browser QA remains the release gate; `调试跳章` remains debug-only acceleration and is not normal progression evidence.

Final Wave 10 gate: Vitest 18 files / 186 tests, TypeScript compile passed, Vite build passed with the known Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / card fallback debt 0, and the multi-seed balance report completed 12/12 routes.

## Verification Table

| Check | Command or Evidence | Current Result |
|---|---|---|
| Generated asset references have no missing runtime files | bundled `node.exe scripts/audit-generated-assets.mjs` | Passed: runtime refs 159, missing 0, ink-pass debt 0, card fallback debt 0 |
| Deterministic unit coverage | bundled `vitest.mjs run` | Passed: 19 files / 192 tests |
| TypeScript compile check | bundled `typescript/bin/tsc --noEmit` | Passed |
| Production build | bundled `vite/bin/vite.js build` | Passed without the previous lazy Phaser chunk-size warning |
| Desktop browser e2e | bundled `@playwright/test/cli.js test tests/e2e` | Passed: 27 Chromium tests |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | Passed |
| Final boss route and final choice | `tests/e2e/playable-flow.spec.ts --grep "final boss route"` | Passed within full Playwright suite |
| Debug skip | `tests/e2e/playable-flow.spec.ts` | Passed; `调试跳章` remains debug-only |
| Compendium | `tests/compendium/compendium-system.test.ts`, `tests/e2e/playable-flow.spec.ts` | Passed, including Wave 14 unlock metadata, counts, badges, and `all/reference/unlocked/locked` filtering |
| Glossary metadata | `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts` | Passed, including Wave 11 combat status badge metadata |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | Passed; starter and Wave 10 semantic SVG card art are accepted by the visual smoke |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | Passed |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | Passed |
| Four-character alpha route simulator | `tests/playtest/run-simulator.test.ts` | Passed, including Zhuge Liang seed `9003` assertions |
| Multi-seed balance report | `node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` | Passed: 12/12 routes, 84 samples, timeout risks 0, unsafe spikes 0 |

## Wave 7 Balance Report Findings

Latest report artifact:

```bash
node scripts/balance-report.mjs --markdown
```

Seed `9001` completed all shipped hero routes through `luoshui>bamboo>changan>moyuan` and produced `endingReady` summaries for Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang. The report is generated from pure seeded run/combat systems under `src/game/systems/debug/` and does not use DOM or Phaser state.

Headline numbers:

| Character | Result | Total turns | Max fight turns | Damage taken | Max single-turn damage | Lowest post-combat HP | Pressure |
|---|---|---:|---:|---:|---:|---:|---|
| Zhao Yun | Completed | 51 | 15 | 168 | 17 | 43 | High |
| Diao Chan | Completed | 66 | 20 | 103 | 10 | 34 | High |
| Cai Wenji | Completed | 58 | 19 | 185 | 24 | 24 | High |
| Zhuge Liang | Completed | 74 | 24 | 241 | 24 | 1 | High |

Findings:

- Completion evidence is green for all four representative routes.
- Timeout risk is currently clear on the representative seed.
- Unsafe damage spikes are currently clear against the default `24` threshold; the observed maximum equals `24` but does not exceed it.
- Healing pressure remains high across all four routes. Zhuge Liang is the main balance watchlist item because the representative route reaches `1` post-combat HP before later recovery.

## Wave 9 Multi-Seed Balance Aggregate

Latest Wave 9 aggregate verified on branch `codex/wave9-polish-balance-art`.

Latest aggregate artifact:

```bash
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
```

The multi-seed report keeps seed `9001` as the representative seed while aggregating seeded routes `9001`, `9002`, and `9003` across Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang.

Headline aggregate numbers:

| Character | Completed | Lowest HP min/median/max | Max single-turn damage | Timeout risks | Unsafe spikes | Runs |
|---|---:|---:|---:|---:|---:|---:|
| Zhao Yun | 3 | 29/38/43 | 24 | 0 | 0 | 3 |
| Diao Chan | 3 | 26/37/37 | 12 | 0 | 0 | 3 |
| Cai Wenji | 3 | 10/21/23 | 24 | 0 | 0 | 3 |
| Zhuge Liang | 3 | 3/3/7 | 24 | 0 | 0 | 3 |

Findings:

- Aggregate completion is `12/12` deterministic routes.
- Timeout risk remains clear across all three seeds.
- Unsafe damage spikes remain clear against the default `24` threshold; the observed maximum equals `24` but does not exceed it.
- Zhuge Liang seed `9003` now completes; the aggregate lowest post-combat HP band is `3/3/7`, so he remains a high-pressure watchlist character rather than a completion blocker.
- Healing pressure remains high across all four characters and should be treated as release-watch evidence rather than a blocker by itself.

## Screenshot Artifacts

The Playwright HTML report and `test-results/` output include these attached desktop screenshots when the full e2e gate runs:

- `combat-zhaoyun-desktop.png`
- `combat-diaochan-desktop.png`
- `combat-caiwenji-desktop.png`
- `combat-zhugeliang-desktop.png`
- `ending-profile-summary-desktop.png`

## Current Acceptance State

### Gameplay Blockers

- No Wave 10 desktop gameplay blockers were found in the full integration gate.
- Stable combat hand layout remains covered by Playwright visual smoke.
- Zhuge Liang seed `9003` completes in the Wave 10 multi-seed outcome.

### Non-Blocking Backlog

- Runtime card fallback debt is 0 after Wave 10 semantic SVG card integration and asset audit verification.
- Wave 10 card faces are repo-local SVG readability assets, not final GPT Image 2 bitmap illustrations.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; the generic enemy slash strip is not acceptable for their combat identity.
- The lazy Phaser runtime chunk now has an explicit `1300` kB Vite warning budget so future chunk growth is actionable.
- Production audio depth, release packaging notes, and broader external playtest instructions remain future polish.
