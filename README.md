# Inkblade: Tales of Jianghu

《云水江湖》 is a desktop-browser EA playable showcase for a 2D ink-wash wuxia deckbuilding roguelike. The current goal is to let outside players see and play the game's distinctive jianghu deckbuilding loop, ink-wash battlefield, character-driven card pools, and commercial-quality content direction in a browser. The prototype uses Phaser for the battlefield, DOM overlays for menus and card UI, and pure TypeScript systems for combat, map, rewards, saves, events, relics, and deterministic playtest tools.

## Quick Start

Install dependencies with Node 24 or newer:

```bash
npm install
npm run dev
```

The verified autonomous runtime is Node v24.14.0. Older Node 18 shells cannot run the current Vite/Rolldown toolchain.

Open the Vite URL, usually `http://127.0.0.1:5173/`, in a desktop Chromium browser. Desktop Chromium remains the active external QA target; Wave65 protects narrow mobile layout smoke coverage, while touch QA and mobile release support remain out of current EA scope.

Autonomous worktrees can run Vite directly with the repo-local toolchain:

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1
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

Direct Node equivalents:

```bash
node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
node scripts/audit-generated-assets.mjs
node scripts/card-art-quality-report.mjs
node scripts/perf-budget.mjs --build
```

Wave 66 is the current EA candidate gate: TypeScript, Vitest 37 files / 270 tests, Vite build, 40 Chromium e2e tests, asset audit 228 runtime refs / missing 0 / ink-pass debt 0 / card fallback debt 0 / GPT2 runtime assets 122 / source sheets 21, card-art quality report with 150 cards and missing files 0, performance budget PASS, 12/12 multi-seed balance routes, handoff preflight, and alpha handoff artifact generation. Wave 50 remains the content-count baseline at 150 cards, 40 relics, 45 events, 22 logbook fragments, 19 enemies, 4 chapters, 4 characters, and 8 methods.

## Carry-Forward: Compendium Unlock Depth

The `墨录图鉴` now distinguishes profile-discovered story from alpha reference material:

- Story fragments render as `已录` or `未录` based on `PlayerProfile.unlockedFragments`.
- Cards, relics, enemies, and combo rules remain `参照` entries so testers can still inspect the full vertical-slice reference.
- The desktop compendium exposes unlock counts and a compact `收录` filter for `全部 / 参照 / 已录 / 未录`.
- Unlock classification lives in `src/game/systems/compendium/compendium.ts`; the DOM controller only renders the metadata it receives.

## Alpha Handoff Report

Generate a single Markdown handoff summary for external testers when a current QA artifact is needed:

```bash
npm run handoff:preflight
npm run report:balance
npm run report:handoff
```

The preflight command is read-only; it prints runtime, git, command, and handoff-document status.

Both commands write under `reports/`, which is ignored because it is a local handoff artifact directory.

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

Milestone 58 is now resolved for the starter/common card-art batch by Wave 21 GPT Image 2 bitmap crops. The remaining optional art-quality backlog is character identity, ink/mind, and bespoke elite strip replacement beyond the alpha gate.

## Wave 10 Card Art Refresh

Wave 10 removes the remaining runtime card-art fallback debt while preserving the desktop alpha behavior verified in Wave 9:

- Adds 45 repo-local semantic SVG card faces for common, ink, mind, status, Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang fallback targets.
- Binds those assets through card-art modules imported by `src/game/content/visuals.ts`.
- Updates the generated asset audit so card-art modules are counted in runtime references and `cardFallbackDebt` reports 0.

Desktop browser remains the active release target. Wave 10 changed art bindings and audit coverage only; the current Wave66 gate covers gameplay pacing with the 12/12 multi-seed balance report and 40 Chromium tests.

## Desktop Playtest Route

Use [desktop-playtest-checklist.md](docs/playtest/desktop-playtest-checklist.md) for the full smoke script. The short route is:

1. Boot to title, start a new run, and select Zhao Yun or Diao Chan.
2. Enter the first combat, play at least one card, confirm energy/cost validation, then end turn.
3. Win the first battle, take or skip card reward, and continue to map.
4. Visit event, rest, shop, elite, boss, and boss reward bridge surfaces.
5. Use `?debug=1` only when a QA tester needs to expose `调试跳章` and skip forward through chapters.

External testers should file issues with [external-bug-intake.md](docs/playtest/external-bug-intake.md), which includes severity labels, route tags, evidence requirements, and a copy-ready report template.

## Debug Controls

- Add `?debug=1` or `?debugTools=1` to the browser URL to expose internal QA shortcuts.
- `调试跳章`: advances the current run to the next chapter map for prototype QA. It is hidden by default and should not be treated as player progression.
- Title continue / clear save: verifies local save recovery and reset behavior.
- Browser devtools console: capture uncaught errors, asset 404s, and failed requests when filing bugs.
- Playwright report: after e2e runs, inspect screenshots and traces under the generated test output.

## Known Gaps

- Runtime card fallback debt is 0. Waves 21, 57, 59, and 64 upgraded the worst starter/common card faces to generated bitmap PNGs; remaining duplicate/generic art queue entries are non-blocking backlog for later review.
- First-chapter semantic attack strips are now bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; do not treat the generic `enemy-slash-strip` as an acceptable binding.
- The Wave66 multi-seed balance gate keeps all 12/12 routes complete with 84 samples, timeout risks 0, unsafe spikes 0, and leaves Zhuge Liang's lowest post-combat HP band at `8/10/15` while keeping him a high-strategy pressure character.
- Vite keeps the lazy Phaser runtime chunk behind an explicit `1300` kB warning budget; future growth beyond that budget should be treated as actionable.
- Steam/storefront work, installers, depot setup, and release packaging are outside the current EA plan.
- No planned post-EA autonomous waves remain after Wave66. Future presentation polish, art-quality replacement, audio atmosphere, reliability work, mobile touch QA, and broad localization should be filed as external review feedback or deferred backlog.

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
