# Inkblade: Tales of Jianghu

《云水江湖》 is a desktop-browser vertical slice for a 2D ink-wash wuxia deckbuilding roguelike. The prototype uses Phaser for the battlefield, DOM overlays for menus and card UI, and pure TypeScript systems for combat, map, rewards, saves, events, relics, and deterministic playtest tools.

## Quick Start

Install dependencies with normal Node:

```bash
npm install
npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173/`, in a desktop Chromium browser. Desktop is the active target for this release handoff; mobile layout and touch QA are paused.

Autonomous worktrees should use the bundled Node runtime:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js --host 127.0.0.1
```

## Test Commands

Normal Node commands:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
node scripts/audit-generated-assets.mjs
```

Bundled Node equivalents:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

Wave 14 release verification completed on branch `codex/wave14-compendium-depth`: Vitest 19 files / 192 tests, TypeScript, Vite build without the previous Phaser chunk-size warning, Playwright 27 Chromium tests, asset audit 159 runtime refs / missing 0 / card fallback debt 0, and multi-seed balance artifact output matching stdout. Wave 14 scope: profile-aware compendium unlock metadata, compact badges, and an unlock filter while preserving full reference visibility. Known art gap: Milestone 58 remains an optional GPT Image 2 bitmap card-art quality pass.

## Wave 14 Compendium Unlock Depth

The `墨录图鉴` now distinguishes profile-discovered story from alpha reference material:

- Story fragments render as `已录` or `未录` based on `PlayerProfile.unlockedFragments`.
- Cards, relics, enemies, and combo rules remain `参照` entries so testers can still inspect the full vertical-slice reference.
- The desktop compendium exposes unlock counts and a compact `收录` filter for `全部 / 参照 / 已录 / 未录`.
- Unlock classification lives in `src/game/systems/compendium/compendium.ts`; the DOM controller only renders the metadata it receives.

## Wave 13 Simulator Report Artifacts

Balance reports can now be written to QA/CI artifacts while preserving existing stdout behavior:

```bash
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
```

The file receives the same rendered payload that stdout receives, and parent directories are created automatically.

## Wave 12 Save/Profile Hardening

Wave 12 keeps the desktop alpha stable around local persistence:

- Legacy saves that accidentally carry stale combat payloads into map/reward/shop/rest/final-choice screens now drop that combat state during pure save normalization.
- Legacy profiles repair `totalRuns` so it cannot undercount victories plus defeats globally or per character.
- The changes stay in pure save/profile systems and are covered by focused Vitest migration regressions.

## Wave 11 Alpha Backlog Closure

Wave 11 closes the remaining non-art alpha backlog while preserving the desktop-first release gate:

- Final-choice options expose count, eligibility, and requirement metadata for browser QA and save/reload coverage.
- Combat status badges now surface glossary ids, titles, and accessible labels alongside card keyword, enemy intent, and combo trail glossary metadata.
- Vite documents the lazy Phaser runtime chunk with an explicit `1300` kB warning budget so build warnings remain actionable.

Milestone 58 remains a later art-quality pass: the current Wave 10 card faces are semantic repo-local SVGs, not final GPT Image 2 bitmap illustrations.

## Wave 10 Card Art Refresh

Wave 10 removes the remaining runtime card-art fallback debt while preserving the desktop alpha behavior verified in Wave 9:

- Adds 45 repo-local semantic SVG card faces for common, ink, mind, status, Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang fallback targets.
- Binds those assets through card-art modules imported by `src/game/content/visuals.ts`.
- Updates the generated asset audit so card-art modules are counted in runtime references and `cardFallbackDebt` reports 0.

Desktop browser remains the active release target. Wave 10 changes art bindings and audit coverage only; gameplay pacing remains covered by the 12/12 multi-seed balance report and the 27-test Chromium suite.

## Desktop Playtest Route

Use [desktop-playtest-checklist.md](docs/playtest/desktop-playtest-checklist.md) for the full smoke script. The short route is:

1. Boot to title, start a new run, and select Zhao Yun or Diao Chan.
2. Enter the first combat, play at least one card, confirm energy/cost validation, then end turn.
3. Win the first battle, take or skip card reward, and continue to map.
4. Visit event, rest, shop, elite, boss, and boss reward bridge surfaces.
5. Use `调试跳章` only when the tester needs to skip forward through chapters for release QA.

## Debug Controls

- `调试跳章`: advances the current run to the next chapter map for prototype QA. It should not be treated as production progression.
- Title continue / clear save: verifies local save recovery and reset behavior.
- Browser devtools console: capture uncaught errors, asset 404s, and failed requests when filing bugs.
- Playwright report: after e2e runs, inspect screenshots and traces under the generated test output.

## Known Gaps

- Runtime card fallback debt is now 0. The Wave 10 card faces are semantic repo-local SVGs, not final GPT Image 2 bitmap illustrations.
- First-chapter semantic attack strips are now bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; do not treat the generic `enemy-slash-strip` as an acceptable binding.
- Zhuge Liang seed `9003` completed in the Wave 9 multi-seed report; Zhuge Liang remains a high-pressure balance watchlist character because his lowest post-combat HP band is 3/3/7.
- Vite keeps the lazy Phaser runtime chunk behind an explicit `1300` kB warning budget; future growth beyond that budget should be treated as actionable.
- Production audio, Steam packaging, mobile layout, and broad localization polish are outside this desktop alpha handoff.

## Bug Report Template

```text
Title:
Build / branch / commit:
Browser and OS:
Route taken:
Character:
Expected:
Actual:
Steps to reproduce:
Screenshots or Playwright artifact path:
Console errors:
Network or missing asset errors:
Save state note, if relevant:
```
