# Inkblade: Tales of Jianghu

《云水江湖》 is a browser-playable vertical slice for an ink-wash wuxia deckbuilding roguelike. Players choose a legendary figure, enter a jianghu corrupted by the Ink Calamity, and build a martial arts deck through card battles, route choices, relics, methods, mind states, and risk-heavy ink cards.

The project is currently a desktop-landscape web prototype built with Phaser, TypeScript, Vite, and DOM-based game UI.

## Current Build

The current slice is intended to prove the core promise:

> Playing cards should feel like performing martial arts, shaping a deck, and choosing a state of mind inside an ink-corrupted jianghu.

Implemented content includes:

- 4 playable characters: Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang.
- 4 chapters: Luoshui, Bamboo Forest, Chang'an, and Ink Abyss.
- 150 cards across starter, common, character, mind, ink, status, and curse pools.
- 40 relics, 8 methods, character resources, mind states, ink marks, combo chains, events, shop, rest, rewards, endings, saves, profile unlocks, and compendium views.
- 19 enemies with chapter-specific encounters and boss fights.
- Desktop combat UI with ink-wash battlefield presentation, card art, standees, attack strips, HUD chips, intent display, visual events, and floating feedback.

Desktop Chromium is the active QA target. Mobile portrait and touch-specific release support are intentionally paused unless that scope is reopened.

## Gameplay Loop

```text
Choose a character
  -> enter a chapter map
  -> choose a route node
  -> fight, rest, shop, or resolve an event
  -> gain cards, relics, methods, gold, mind shifts, or ink risk
  -> refine the deck
  -> defeat the chapter boss
  -> continue toward the Ink Abyss
```

Combat follows a deterministic card-battler structure:

- Draw cards, spend energy, play attacks/skills/body/mind/ink cards.
- Read enemy intents before ending the turn.
- Use block, statuses, character resources, relic triggers, methods, and card order combos.
- Manage long-term tradeoffs from mind states and ink corruption.

## Tech Stack

- Runtime: TypeScript, Phaser 3, Vite
- UI: DOM overlays for cards, HUD, map, rewards, event, shop, rest, compendium, and settings
- Tests: Vitest, Playwright
- Tooling: deterministic simulators, balance reports, asset audits, handoff report scripts

Gameplay rules live in pure TypeScript systems under `src/game/systems/`. Phaser and DOM code adapt state to presentation.

## Quick Start

Use Node 24 or newer.

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173/
```

## Packaging

Build a distributable folder that others can open without installing project dependencies:

```bash
npm run package
```

The packaged game is written to `release/InkBlade-JiangHu/`. On macOS, double click `Play InkBlade.command` to launch the bundled local server. On Windows, use `Play InkBlade.bat`.

The repo can also run Vite directly through the local toolchain:

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1
```

## Scripts

```bash
npm test              # Run Vitest unit/system tests
npm run typecheck     # TypeScript check without emit
npm run build         # Typecheck and production Vite build
npm run test:e2e      # Playwright browser tests
npm run perf:budget   # Build and inspect performance budget
npm run report:balance
npm run handoff:preflight
npm run report:handoff
```

Some autonomous or CI-like environments may need the WASI fallback for Rolldown/Vite:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e --project=chromium
```

## Project Layout

```text
src/app/              DOM app shell, controller, settings, audio feedback, UI asset contract
src/phaser/           Phaser scene adapter for battlefield presentation
src/game/content/     Data-driven cards, characters, enemies, relics, events, chapters, visuals
src/game/systems/     Pure combat, run, rewards, relics, events, save, profile, methods, endings
src/styles/           Theme and layout CSS
tests/                Vitest and Playwright coverage
docs/                 PRD, worldbuilding, gameplay design, QA notes, and playtest scripts
scripts/              Reports, audits, asset tooling, and handoff helpers
public/assets/        Runtime art, sprites, generated UI, cards, and battlefield assets
```

## Playtesting

Recommended desktop smoke route:

1. Start a new run and choose a character.
2. Enter the first battle.
3. Play at least one card and verify energy/cost validation.
4. End the turn and verify the enemy intent resolves.
5. Win the battle, take or skip a card reward, and continue to the map.
6. Visit event, rest, shop, elite, boss, and boss-reward surfaces.

The full QA route is in [docs/playtest/desktop-playtest-checklist.md](docs/playtest/desktop-playtest-checklist.md).

External bug reports can use [docs/playtest/external-bug-intake.md](docs/playtest/external-bug-intake.md).

## Debug Tools

Append either query flag to expose internal QA shortcuts:

```text
?debug=1
?debugTools=1
```

Useful debug surfaces:

- `调试跳章`: advance to the next chapter map for QA.
- Continue / clear save on title: verify local persistence and recovery.
- Browser devtools: capture console errors, asset 404s, failed requests, and save-state symptoms.
- Playwright output: inspect generated screenshots and traces after browser tests.

## Current Known Scope

- Desktop landscape is the supported prototype target.
- Mobile portrait, touch input, installers, Steam depot work, and storefront packaging are out of current scope.
- Art assets are a mix of generated bitmap assets, semantic SVGs, transparent PNG standees, sprite strips, and UI kit slices. Remaining art-quality work should be tracked as backlog rather than blocking the current slice.
- The Phaser runtime chunk is intentionally lazy-loaded and large; future growth beyond the configured budget should be treated as actionable.

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
