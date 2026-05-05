# Alpha Acceptance Playtest

Wave 20 release-gate refresh for the desktop browser alpha. Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, Steam packaging, and broad localization polish remain outside this acceptance pass.

Last full gate verified: 2026-05-05 Wave 20 release-gate refresh on branch `codex/wave20-release-gate-refresh`.

Latest art gate verified: 2026-05-05 Wave 21 GPT Image 2 starter/common card art on branch `codex/wave21-gpt2-card-art`: Vitest 24 files / 200 tests, TypeScript compile, Vite build, Playwright visual smoke 3 Chromium tests, and asset audit 159 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0 / GPT2 runtime assets 72 / source sheets 21.

Latest balance stability gate verified: 2026-05-05 Wave 22 Zhuge Liang balance stability on branch `codex/wave22-zhuge-balance-stability`: multi-seed balance artifact remains 12/12 routes, 84 combat samples, timeout risks 0, unsafe spikes 0, and Zhuge Liang's lowest post-combat HP band improved from `3/3/7` to `8/10/14`.

Latest balance report label gate verified: 2026-05-05 Wave 24 balance report label refresh on branch `codex/wave24-balance-report-label-refresh`; `scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` now emits `# Wave 24 Alpha Balance Report` with report id `wave24-alpha-balance-v1` while preserving the Wave 22 aggregate outcomes.

Wave 7 through Wave 14 balance-report and acceptance sections remain historical references below. The current Wave 24 multi-seed artifact result is 12/12 completed routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, and the Wave 24 report label/report id above.

External bug reports should use [external-bug-intake.md](external-bug-intake.md) for setup/build fields, severity labels, route tags, evidence requirements, and the copy-ready report template.

For release handoff, generate `reports/alpha-handoff.md` with `scripts/alpha-handoff-report.mjs` after the balance artifact exists.

## Runnable Commands

Normal `npm` commands require Node 24 or newer. Autonomous worktrees should use the bundled Node v24.14.0 path below.

Run `npm run handoff:preflight` before a handoff session to catch stale Node/runtime or missing report-doc setup quickly.

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
npm run handoff:preflight
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

## Wave 20 Release Gate Refresh Acceptance

Wave 20 scope: refresh the current release gate after Waves 15-19 external playtest docs, alpha handoff report, npm report scripts, Node 24 runtime requirement docs, and handoff preflight tooling. It also fixes two handoff QA issues found during the gate: the four-character visual smoke test now has an explicit long timeout budget, and bundled Node handoff scripts can resolve branch/commit from git metadata even when `git` is not launchable from the Windows Node process.

Final Wave 20 gate: Vitest 23 files / 198 tests, TypeScript compile passed, Vite build passed without the previous Phaser chunk warning, Playwright 27 Chromium desktop tests passed, asset audit reported 159 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0, the multi-seed balance report artifact matched stdout, handoff preflight reported Node v24.14.0 PASS with branch/commit metadata, and the alpha handoff report artifact matched stdout with the current Wave 20 baseline.

## Wave 11 Alpha Backlog Closure Acceptance

Wave 11 scope: final-choice affordance metadata, status badge glossary metadata, and explicit lazy Phaser chunk budget.
Wave 21 resolves Milestone 58 for the starter/common card-art batch with GPT Image 2 bitmap runtime crops; remaining art polish is optional character identity, ink/mind, and elite strip bitmap replacement.

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
| Generated asset references have no missing runtime files | bundled `node.exe scripts/audit-generated-assets.mjs` | Passed: runtime refs 159, missing 0, ink-pass debt 0, card fallback debt 0, GPT2 runtime assets 72, source sheets 21 |
| Deterministic unit coverage | bundled `vitest.mjs run` | Passed: 24 files / 200 tests |
| TypeScript compile check | bundled `typescript/bin/tsc --noEmit` | Passed |
| Production build | bundled `vite/bin/vite.js build` | Passed without the previous lazy Phaser chunk-size warning |
| Desktop browser e2e | bundled `@playwright/test/cli.js test tests/e2e` | Passed: 27 Chromium tests |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | Passed |
| Final boss route and final choice | `tests/e2e/playable-flow.spec.ts --grep "final boss route"` | Passed within full Playwright suite |
| Debug skip | `tests/e2e/playable-flow.spec.ts` | Passed; `调试跳章` remains debug-only |
| Compendium | `tests/compendium/compendium-system.test.ts`, `tests/e2e/playable-flow.spec.ts` | Passed; Wave 14 unlock metadata, counts, badges, and `all/reference/unlocked/locked` filtering remain covered under the Wave 20 gate |
| Glossary metadata | `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts` | Passed, including Wave 11 combat status badge metadata |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | Passed: 3 Chromium visual-smoke tests; Wave 21 starter/common PNG card art is accepted |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | Passed |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | Passed |
| Four-character alpha route simulator | `tests/playtest/run-simulator.test.ts` | Passed, including Zhuge Liang seed `9003` assertions |
| Multi-seed balance report | `node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` | Passed: 12/12 routes, 84 samples, timeout risks 0, unsafe spikes 0, Zhuge Liang lowest HP band 8/10/14 |
| Handoff preflight | `node scripts/handoff-preflight.mjs` | Passed: Node v24.14.0 PASS, report scripts PASS, handoff docs PASS, branch/commit resolved |
| Alpha handoff report artifact | `node scripts/alpha-handoff-report.mjs --out ... --balance-report ...` | Passed: artifact matched stdout and includes the Wave 24 report label/id plus Wave 23 watchlist readability baseline |

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
- This historical Wave 7 seed showed Zhuge Liang reaching `1` post-combat HP before later recovery. The current Wave 22 aggregate below stabilizes the same character without changing his low-HP strategist identity.

## Wave 22 Multi-Seed Balance Aggregate

Latest Wave 22 aggregate verified on branch `codex/wave22-zhuge-balance-stability`.

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
| Zhuge Liang | 3 | 8/10/14 | 24 | 0 | 0 | 3 |

Findings:

- Aggregate completion is `12/12` deterministic routes.
- Timeout risk remains clear across all three seeds.
- Unsafe damage spikes remain clear against the default `24` threshold; the observed maximum equals `24` but does not exceed it.
- Zhuge Liang's aggregate lowest post-combat HP band is now `8/10/14`; he remains a long-route pressure character, but no longer sits on the near-death `3/3/7` band.
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

- No Wave 20 desktop gameplay blockers were found in the full integration gate.
- Stable combat hand layout remains covered by Playwright visual smoke.
- Zhuge Liang seed `9003` completes in the Wave 20 multi-seed outcome.

### Non-Blocking Backlog

- Runtime card fallback debt is 0 after Wave 10 semantic SVG card integration and asset audit verification.
- Wave 21 upgrades the starter/common card faces to GPT Image 2 bitmap PNGs; remaining Wave 10 semantic SVG card faces are readable alpha coverage until optional bitmap passes replace them.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; the generic enemy slash strip is not acceptable for their combat identity.
- The lazy Phaser runtime chunk now has an explicit `1300` kB Vite warning budget so future chunk growth is actionable.
- Production audio depth, release packaging notes, and broader external playtest instructions remain future polish.
