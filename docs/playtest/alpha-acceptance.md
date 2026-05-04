# Alpha Acceptance Playtest

Wave 7 documentation refresh for the desktop browser alpha after the verified Wave 6 baseline (`18f47f9 fix: address observed bugs and add debug skip`). Current target is Chromium desktop through Playwright; mobile layout, touch input, production audio, Steam packaging, and broad localization polish remain outside this acceptance pass.

Last full gate verified: 2026-05-04 Wave 6 baseline. Asset audit refreshed in this worktree on 2026-05-04 16:32 Asia/Shanghai.

Wave 7 balance-report evidence verified: 2026-05-04 16:38 Asia/Shanghai.

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

## Verification Table

| Check | Command or Evidence | Wave 6 Baseline Result |
|---|---|---|
| Generated asset references have no missing runtime files | bundled `node.exe scripts/audit-generated-assets.mjs` | Passed: 105 runtime refs, 0 missing, 0 ink-pass debt, 56 card fallback debt, 52 GPT2 runtime assets, 20 source sheets, 54 prompt queue targets |
| Deterministic unit coverage | bundled `vitest.mjs run` | Passed: 15 files, 157 tests |
| TypeScript compile check | bundled `typescript/bin/tsc --noEmit` | Passed |
| Production build | bundled `vite/bin/vite.js build` | Passed with known non-blocking lazy Phaser chunk warning |
| Desktop browser e2e | bundled `@playwright/test/cli.js test tests/e2e` | Passed: 23 Chromium tests |
| Boot and four-character selector | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Final boss route and final choice | `tests/e2e/playable-flow.spec.ts --grep "final boss route"` | Covered and passing through reload/continue, final choice, ending, profile summary |
| Debug skip | `tests/e2e/playable-flow.spec.ts` | Covered and passing; advances to next chapter and refreshes `data-battlefield` |
| Compendium | `tests/compendium/compendium-system.test.ts`, `tests/e2e/playable-flow.spec.ts` | Covered and passing from title and map/run status |
| Glossary metadata | `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts` | Covered and passing for card chips, intent boxes, and combo trail tooltip metadata |
| Four character combat smoke screenshots | `tests/e2e/visual-smoke.spec.ts` | Covered and passing with GPT2 standees/card art and attack strips |
| Save/continue after reload | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Debug ending/profile summary | `tests/e2e/playable-flow.spec.ts` | Covered and passing |
| Four-character alpha route simulator | `tests/playtest/run-simulator.test.ts` | Covered and passing through the normal route contract |
| Wave 7 deterministic balance report | `node scripts/balance-report.mjs --markdown` | Passed: 4/4 representative shipped hero routes completed, 28 combat samples, 0 timeout risks, 0 unsafe damage spikes over threshold |

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

## Wave 8 Multi-Seed Balance Aggregate

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

- No Wave 6 baseline gameplay blocker is currently documented after the `18f47f9` full gate.
- Wave 7 work is still expected to add save/profile hardening, route previews, first-combat onboarding hints, and balance-report evidence before the next integrated demo gate.
- Wave 8 multi-seed balance evidence records one deterministic Zhuge Liang route defeat on seed `9003`; this is a balance watchlist risk, not a report-generation blocker.

### Non-Blocking Backlog

- Card fallback art debt remains 56. These cards still share type-level fallback art and require real GPT Image 2 source/crop generation before the ledger should shrink.
- First-chapter elite art uses vetted clean stand-ins: `elite_sword_echo` uses `gpt2-bamboo-soldier-standee-cutout.png`, and `elite_blood_banner` uses `gpt2-scribe-officer-standee-cutout.png`. Their bespoke standees and attack strips are Wave 8 regeneration debt, not a runtime blocker.
- The known Vite `>500 kB` warning remains isolated to the lazy Phaser chunk after the boot split. It is a performance backlog item and did not block the Wave 6 build gate.
- Production audio depth, release packaging notes, profile-gated compendium presentation, and external playtest instructions remain future polish.
