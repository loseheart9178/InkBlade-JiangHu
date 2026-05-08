# Desktop Playtest Checklist

Use this checklist for a human desktop alpha pass. Target Chromium on a desktop viewport; mobile layout and touch checks are intentionally out of scope for this wave.

## Setup

Start the app with Node 24 or newer:

```bash
npm install
npm run dev
```

If the shell default is Node 18, use the bundled Node command below instead; Node 18 is not a verified toolchain for this Vite/Rolldown build.

Or start from an autonomous worktree with bundled Node:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js --host 127.0.0.1
```

Open the local Vite URL, usually `http://127.0.0.1:5173/`, in desktop Chromium. Keep devtools open while testing so console errors, missing assets, and failed requests can be captured.

## Wave 20 Release Focus

Wave 20 desktop QA verifies the current alpha handoff while carrying forward the Wave 11-19 hardening work:

- `墨录图鉴` / compendium entries now expose `参照`, `已录`, and `未录` states. Story fragments are profile-aware; cards, relics, enemies, and combo rules remain full-reference entries.
- The title and run compendium should keep the full alpha reference visible, including locked story entries, while the `收录` filter narrows to `参照`, `已录`, or `未录`.
- Wave 13 balance reports can be exported with `--out <path>` while preserving stdout, so QA artifacts can be attached to handoff notes.
- Wave 15-19 handoff surfaces include the external bug intake guide, alpha handoff report, `report:balance` / `report:handoff` npm scripts, Node 24 runtime guidance, and `handoff:preflight`.
- Wave 12 save/profile hardening keeps stale combat payloads out of non-combat screens and repairs legacy profile counters.
- Wave 11 final-choice metadata, combat glossary metadata, and the explicit lazy Phaser chunk budget remain part of the acceptance surface.
- Runtime card fallback debt is 0. Wave 21 upgrades the starter/common card faces to GPT Image 2 bitmap PNGs; remaining Wave 10 semantic SVG card faces are readable alpha coverage.
- Remaining optional art polish is character identity, ink/mind, and bespoke elite strip bitmap replacement beyond this desktop alpha pass.
- Final release gate: Vitest 23 files / 198 tests, Vite build without the previous Phaser chunk-size warning, Playwright 27 Chromium desktop tests, asset audit 159 runtime refs / missing 0 / ink-pass debt 0 / card fallback debt 0, multi-seed balance artifact output matching stdout, handoff preflight PASS, and alpha handoff artifact output matching stdout.
- Latest Wave 21 art gate: Vitest 24 files / 200 tests, TypeScript, Vite build, Playwright visual smoke 3 Chromium tests, asset audit 159 runtime refs / missing 0 / ink-pass debt 0 / card fallback debt 0 / GPT2 runtime assets 72 / source sheets 21.

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

## Compendium Route: Title Screen

Use this route to verify the current compendium / `墨录图鉴` presentation without starting a run. The Wave 14 compendium metadata remains part of the Wave 20 gate:

1. Clear local storage or use a fresh browser profile.
2. From the title screen, open `墨录图鉴`.
3. Confirm the summary shows nonzero `未录` and `参照` counts, and `已录` is 0 on a fresh profile.
4. Open the `残页` tab and confirm story cards show `未录`.
5. Change the `收录` filter to `未录`; story entries should remain visible.
6. Change the `收录` filter to `参照` while still on `残页`; the empty state should appear because story entries are gated content, not reference content.
7. Open the `卡牌` tab; entries should show `参照`, and normal card filters such as Zhao Yun + starter should still work.
8. Return to the title screen and confirm no run was started.

## Compendium Route: During A Run

Use this route to confirm run-state preservation around the compendium:

1. Start a Zhao Yun run.
2. Visit the first event node and choose an event option to add a current-run logbook fragment.
3. Open `墨录` from the run status and confirm the current-run fragment count increased.
4. Return to the map, then open `墨录图鉴`.
5. Filter cards or enemies in the compendium and confirm the current map/run screen is not lost.
6. Return from `墨录图鉴` and confirm the same chapter, node availability, HP, deck, relics, and message are still present.
7. Remember that `已录` badges are profile unlocks; ordinary in-run fragments become profile fragments after a completed run is recorded.

## Save And Reload Route

1. Start a run and reach the map, reward, event, shop, rest, or combat screen.
2. Reload the browser page.
3. Confirm the title screen enables `继续行旅`.
4. Continue and confirm the same screen state is restored.
5. Repeat once from an active combat screen and play/end a turn after continuing.

## Debug Skip Route

Use `调试跳章` only to accelerate prototype QA:

1. Start or continue a run.
2. Click `调试跳章`.
3. Confirm the next chapter map loads and the battlefield context changes when combat starts.
4. Repeat until late-chapter or final route surfaces are reachable.
5. Record in the bug report that debug skip was used; skipped routes are not normal progression evidence.

## Final Boss And Profile Route

Use this route when a full ending/profile smoke is needed:

1. Use the title debug route or `调试跳章` to reach the final chapter only if the bug report clearly marks debug acceleration.
2. Enter `墨渊照心`, fight `无名史官`, and reach the final choice screen.
3. Confirm final-choice options show eligibility and requirement metadata.
4. Reload from the final choice screen and continue the run.
5. Select or accept a final choice, then confirm the ending/profile summary appears.
6. Return to the title screen, open `墨录图鉴`, and confirm any profile-recorded fragments now appear as `已录`.

## Automated Desktop Checks

Run the Playwright desktop suite when a full browser gate is needed:

```bash
npm run test:e2e
```

Bundled Node equivalent:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
```

The Wave 20 final Playwright Chromium desktop result is 27/27 passing tests. Useful focused runs include:

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

- Runtime card fallback debt is 0. Wave 21 starter/common card faces are GPT Image 2 bitmap PNGs; remaining Wave 10 semantic SVG faces are readable alpha coverage until optional bitmap passes replace them.
- First-chapter semantic attack strips are bound for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`. The generic enemy slash strip is not acceptable for those combatants.
- The Wave 50 multi-seed report completes 12/12 routes across 84 combat samples with timeout risks 0 and unsafe spikes 0; Zhuge Liang's lowest HP band is now 8/10/15 after the card-pool expansion, so he remains a long-route pressure watch item rather than a near-death stability risk.
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
