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

Wave 9 release verification is prepared in this docs branch, but the final Vitest, Playwright, asset audit, balance-report, and card fallback debt results must be `集成后刷新` on the integration branch.

## Wave 9 Release Refresh Prep

Wave 9 is scoped as a polish, balance, and art-readability refresh for the desktop alpha:

- Stabilize the Zhuge Liang seed `9003` multi-seed route while preserving his low-HP, high-strategy identity.
- Replace starter readability card fallbacks with semantic card art for Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang starter cards.
- Add first-chapter semantic attack strips for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo` so they do not read as the generic enemy slash.

Desktop browser remains the active release target. The integration branch must refresh the final Wave 9 Vitest count, Playwright Chromium desktop count, asset audit totals, balance-report result, and card fallback debt before release handoff.

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

- Wave 9 final card fallback debt is `集成后刷新`; do not report a lower count until the integrated asset audit proves it.
- First-chapter semantic attack strips are a Wave 9 integration target for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo`; do not treat the generic `enemy-slash-strip` as an acceptable final binding.
- Zhuge Liang seed `9003` is the Wave 9 balance target; final multi-seed completion evidence is `集成后刷新`.
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
