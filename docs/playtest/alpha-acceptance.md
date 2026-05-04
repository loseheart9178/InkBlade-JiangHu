# Alpha Acceptance Playtest

Wave 9 release-prep refresh for the desktop browser alpha. Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, Steam packaging, and broad localization polish remain outside this acceptance pass.

Last full gate verified: 2026-05-04 Wave 8 content-release integration gate. Wave 9 final verification counts and release evidence are `集成后刷新`.

Wave 7 balance-report evidence verified: 2026-05-04 16:38 Asia/Shanghai. Wave 8 multi-seed balance and release-handoff audit are historical references only until the Wave 9 integration branch refreshes them.

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
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "debug skip|compendium|墨录图鉴"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
```

## Playable Scope

- Boot to the title screen and select any of the four MVP characters: Zhao Yun, Diao Chan, Cai Wenji, or Zhuge Liang.
- Start a desktop run, choose map nodes, enter card combat, play cards, end turns, win battles, claim rewards, and continue saved run states after reload.
- Use first-slice and cross-chapter route surfaces covered by e2e: event, rest upgrade, shop relic purchase, elite method reward, boss reward bridge, chapter reward, logbook, second-chapter combat entry, save/continue after reload, and final boss debug route.
- Complete the browser final boss route from `墨渊照心` map into `无名史官` combat, chapter reward, boss reward, final choice, reload/continue from final choice, ending/profile summary, and persisted profile stats.
- Use title/run `墨录图鉴` compendium coverage for cards, relics, enemies, combos, and story fragments without losing the current run screen.
- Use glossary metadata on shipped card keyword chips, enemy intents, and combo trail entries; desktop tooltip attributes are covered in visual smoke.
- Use the visible `调试跳章` control to advance to the next chapter map for prototype testing; it refreshes chapter backdrop context and remains a debug aid, not production progression.
- Use deterministic simulator coverage for all four MVP characters through the shipped route contract, including `luoshui`, `bamboo`, `changan`, and `moyuan`.

## Wave 9 Release Acceptance Prep

Wave 9 acceptance should be refreshed only after the integration branch merges the polish branches. The release target is:

- Zhuge Liang seed `9003` completes the deterministic multi-seed route without introducing timeout risks or unsafe damage spikes.
- Starter semantic card art replaces type-level fallbacks for the starter readability batch.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`, and none use the generic enemy slash as final combat identity.
- Desktop-first browser QA remains the release gate; `调试跳章` remains debug-only acceleration and is not normal progression evidence.

Final Wave 9 Vitest, Playwright, balance-report, asset audit, and card fallback debt numbers are `集成后刷新`.

## Verification Table

| Check | Command or Evidence | Wave 9 Integration Result |
|---|---|---|
| Generated asset references have no missing runtime files | bundled `node.exe scripts/audit-generated-assets.mjs` | `集成后刷新`, including final card fallback debt |
| Deterministic unit coverage | bundled `vitest.mjs run` | `集成后刷新` |
| TypeScript compile check | bundled `typescript/bin/tsc --noEmit` | `集成后刷新` |
| Production build | bundled `vite/bin/vite.js build` | `集成后刷新`, with any lazy Phaser chunk warning recorded |
| Desktop browser e2e | bundled `@playwright/test/cli.js test tests/e2e` | `集成后刷新`, including final Playwright Chromium result |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | `集成后刷新` |
| Final boss route and final choice | `tests/e2e/playable-flow.spec.ts --grep "final boss route"` | `集成后刷新` |
| Debug skip | `tests/e2e/playable-flow.spec.ts` | `集成后刷新`; must preserve `调试跳章` as debug-only |
| Compendium | `tests/compendium/compendium-system.test.ts`, `tests/e2e/playable-flow.spec.ts` | `集成后刷新` |
| Glossary metadata | `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts` | `集成后刷新` |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | `集成后刷新`, with starter semantic card art visible where covered |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | `集成后刷新` |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | `集成后刷新` |
| Four-character alpha route simulator | `tests/playtest/run-simulator.test.ts` | `集成后刷新`, including Zhuge Liang seed `9003` |
| Multi-seed balance report | `node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` | `集成后刷新` |

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

## Historical Wave 8 Multi-Seed Balance Aggregate

This section is retained as prior-wave context only. Do not copy these numbers into Wave 9 release notes; the Wave 9 aggregate is `集成后刷新`.

Latest aggregate artifact:

```bash
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
```

The multi-seed report keeps seed `9001` as the representative seed while aggregating seeded routes `9001`, `9002`, and `9003` across Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang.

Headline aggregate numbers:

| Character | Completed | Lowest HP min/median/max | Max single-turn damage | Timeout risks | Unsafe spikes | Runs |
|---|---:|---:|---:|---:|---:|---:|
| Zhao Yun | 3 | 29/38/43 | 24 | 0 | 0 | 3 |
| Diao Chan | 3 | 26/34/39 | 10 | 0 | 0 | 3 |
| Cai Wenji | 3 | 10/21/24 | 24 | 0 | 0 | 3 |
| Zhuge Liang | 2 | 0/1/3 | 24 | 0 | 0 | 3 |

Findings:

- Aggregate completion is `11/12` deterministic routes.
- Timeout risk remains clear across all three seeds.
- Unsafe damage spikes remain clear against the default `24` threshold; the observed maximum equals `24` but does not exceed it.
- Zhuge Liang is now the primary balance watchlist item: seed `9003` ends in defeat after two combat samples, and the aggregate lowest post-combat HP band is `0/1/3`.
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

- Wave 9 final desktop gameplay blocker state is `集成后刷新` after the integration branch runs the full gate.
- Stable combat hand layout and first-chapter standee-only attack feedback are included in the observed bugfixes 2 baseline.
- Zhuge Liang seed `9003` is a Wave 9 balance target; the final multi-seed outcome is `集成后刷新`.

### Non-Blocking Backlog

- Wave 9 final card fallback debt is `集成后刷新` after starter semantic card art integration and asset audit verification.
- First-chapter semantic attack strips are a Wave 9 target for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; final runtime binding evidence is `集成后刷新`, and the generic enemy slash strip is not acceptable for their final combat identity.
- The known Vite `>500 kB` warning remains isolated to the lazy Phaser chunk after the boot split. It is a performance backlog item and did not block the Wave 8 build gate.
- Production audio depth, release packaging notes, profile-gated compendium presentation, and broader external playtest instructions remain future polish.
