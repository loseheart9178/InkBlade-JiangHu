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

The current release baseline is Wave 7 plus observed bugfixes 2: Vitest 170 tests, Playwright 26 Chromium desktop tests, asset runtime refs 102, missing 0, and card fallback debt 56.

## Desktop Playtest Route

Use [desktop-playtest-checklist.md](/mnt/d/InkBlade-JiangHu/.worktrees/wave8-release-docs/docs/playtest/desktop-playtest-checklist.md) for the full smoke script. The short route is:

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

- Card fallback debt remains 56; those cards still need dedicated GPT Image 2 card faces.
- First-chapter stand-ins use standee-only attack feedback. Do not bind `enemy-slash-strip` for `elite_sword_echo`, `elite_blood_banner`, or `boss_ink_dongzhuo` until bespoke clean attack strips exist.
- Vite build can print a non-blocking Phaser lazy chunk-size warning.
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
