# Desktop Playtest Checklist

Use this checklist for a human desktop alpha pass. Target Chromium on a desktop viewport; mobile layout and touch checks are intentionally out of scope for this wave.

## Setup

Start the app with normal Node:

```bash
npm install
npm run dev
```

Or start from an autonomous worktree with bundled Node:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js --host 127.0.0.1
```

Open the local Vite URL, usually `http://127.0.0.1:5173/`, in desktop Chromium. Keep devtools open while testing so console errors, missing assets, and failed requests can be captured.

## Wave 11 Release Focus

Wave 11 desktop QA focuses on alpha backlog closure while carrying forward the Wave 10 card-art baseline:

- Final-choice options expose browser-testable count, eligibility, and requirement metadata.
- Combat status badges expose glossary ids, titles, and accessible labels alongside card keyword, enemy intent, and combo trail glossary metadata.
- Vite documents the lazy Phaser runtime chunk with an explicit `1300` kB warning budget.
- Zhuge Liang seed `9003` balance is no longer a deterministic completion risk in the multi-seed report.
- Starter and Wave 10 semantic card art are visible where the desktop hand, reward, and deck surfaces expose shipped cards.
- Runtime card fallback debt is 0 after binding all remaining common, ink, mind, status, and character fallback targets.
- First-chapter semantic attack strips are used for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; the generic enemy slash should not be accepted as their final combat identity.
- Known art gap: Milestone 58 remains an optional GPT Image 2 bitmap card-art quality pass.
- Final gate: Vitest 18 files / 187 tests, Vite build without the previous Phaser chunk-size warning, Playwright 27 Chromium tests, asset audit 159 runtime refs / missing 0 / card fallback debt 0, and multi-seed balance 12/12 routes.

## Smoke Route A: First Battle Loop

1. Boot to title and confirm the first screen is actionable.
2. Start a new run as Zhao Yun.
3. Enter the first combat.
4. Confirm the ink mountain battlefield, paper UI, top health bars, bottom hand, card art, and readable center combat area render without overlap.
5. Play one legal card and confirm energy decreases, enemy or player numbers update, and combat feedback appears.
6. Try one unaffordable or invalid card if available and confirm it does not resolve for free.
7. End turn and confirm enemy intent resolves.
8. Win the fight, take one card reward or use skip, then confirm the route map returns.

## Smoke Route B: Run Surfaces

1. From a fresh Diao Chan run, visit an event node and read each visible consequence summary before choosing.
2. Visit a rest node and upgrade a card if offered.
3. Visit a shop node and buy a card, relic, or removal when affordable.
4. Visit an elite node and confirm method/reward flow appears after victory.
5. Visit boss, boss reward bridge, and chapter reward surfaces.
6. Reload during map or reward flow and confirm Continue returns to the same run state.

## Smoke Route C: Four-Character Sanity

For Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang:

1. Start a run.
2. Enter first combat.
3. Capture one desktop screenshot.
4. Play one character-flavored card when possible.
5. Confirm role resource text and combat log feedback remain readable.

## Debug Skip Route

Use `调试跳章` only to accelerate prototype QA:

1. Start or continue a run.
2. Click `调试跳章`.
3. Confirm the next chapter map loads and the battlefield context changes when combat starts.
4. Repeat until late-chapter or final route surfaces are reachable.
5. Record in the bug report that debug skip was used; skipped routes are not normal progression evidence.

## Automated Desktop Checks

Run the Playwright desktop suite when a full browser gate is needed:

```bash
npm run test:e2e
```

Bundled Node equivalent:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
```

The Wave 11 final Playwright Chromium desktop result is 27/27 passing tests. Useful focused runs include:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "debug skip|compendium|final boss route"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
```

## Screenshot And Log Capture

- Save screenshots with the route, character, and screen in the filename, such as `zhaoyun-first-combat-desktop.png`.
- Capture the full browser viewport when reporting layout issues.
- Copy console errors exactly and include stack traces when available.
- Include failed network URLs for missing image, sprite, JSON, or module requests.
- For Playwright failures, attach the HTML report entry, screenshot, video, and trace path from `test-results/` when present.

## Known Non-Blocking Issues

- Runtime card fallback debt is 0. The new Wave 10 card faces are semantic SVG readability assets rather than final GPT Image 2 bitmap illustrations.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`. The generic enemy slash strip is not acceptable for those combatants.
- Zhuge Liang seed `9003` now completes in the multi-seed report; Zhuge Liang remains high-pressure and should stay on the balance watchlist.
- Vite keeps the lazy Phaser runtime chunk behind an explicit `1300` kB warning budget; future growth beyond that budget should be treated as actionable.
- Production audio, Steam packaging, mobile layout, and touch controls are not in this pass.

## Bug Report Template

```text
Title:
Build / branch / commit:
Browser and OS:
Route taken:
Character:
Did you use 调试跳章:
Expected:
Actual:
Steps to reproduce:
Screenshot or Playwright artifact path:
Console errors:
Network or missing asset errors:
Save or reload details:
Severity:
```
