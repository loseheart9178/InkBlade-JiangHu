# Inkblade Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or an equivalent PM -> Explorer -> Builder -> Tester -> Reporter flow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser vertical slice for 《云水江湖》 with deterministic card combat, two characters, route map progression, and ink-wash combat UI.

**Architecture:** Pure TypeScript systems own combat, cards, rewards, map, and run state. Phaser renders the battlefield and effects. DOM overlays render dense HUD, cards, rewards, character select, map, shop, rest, and event surfaces.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, Playwright, CSS custom properties.

---

## Milestone 0: Project Runbooks And Repo Setup

- [x] Create `AGENTS.md`, `Prompt.md`, `Plan.md`, `Implement.md`, and `Documentation.md`.
- [x] Create `.codex/agents/*.toml` role configs.
- [x] Create reusable workflow notes under `skills/inkblade-long-run/SKILL.md`.
- [x] Initialize git if no repository exists.
- [x] Commit the runbooks as the first baseline if git is available.

Verification:

```bash
git status --short
```

## Milestone 1: App Scaffold And Test Harness

- [x] Create package metadata and scripts.
- [x] Install Vite, TypeScript, Phaser, Vitest, Playwright, jsdom.
- [x] Create `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`.
- [x] Create `src/main.ts`, app shell, Phaser config, and `src/styles/theme.css`.
- [x] Add smoke test proving the app root can be created.

Verification:

```bash
npm test
npm run build
```

## Milestone 2: Core Combat Simulation

- [x] Add typed data models for cards, characters, enemies, statuses, combat state, actions, and effects.
- [x] Add deterministic RNG utility.
- [x] Implement battle setup: starter deck clone, shuffle, opening draw, enemy intent.
- [x] Implement card play: energy validation, target validation, effect execution, discard/exhaust.
- [x] Implement turn flow: player end turn, enemy actions, block timing, draw next hand.
- [x] Implement damage, block, vulnerable, weak, charm, dodge, ink marks, mind state basics.
- [x] Implement Zhao Yun spear momentum, break-formation, guard.
- [x] Implement Diao Chan dance momentum and charm.

Verification:

```bash
npm test -- --run tests/combat
npm run build
```

## Milestone 3: Data Slice

- [x] Add characters: Zhao Yun and Diao Chan.
- [x] Add starter decks and at least 24 cards total across common and character pools.
- [x] Add enemies: 墨化山贼, 无面兵卒, 纸伞女鬼, 剑痴残影, 墨影董卓.
- [x] Add relics: 白龙枪缨, 闭月香囊, 旧木剑, 黑纸伞 as data definitions.
- [x] Add events: 黑雨渡口, 长坂回声, 宫灯旧宴 as first UI/event flow placeholders.
- [x] Add map node pools and reward rules.

Verification:

```bash
npm test -- --run tests/data
npm run build
```

## Milestone 4: Run Flow And UI

- [x] Build application shell state machine: title, character select, map, combat, reward, event, shop, rest, victory/defeat.
- [x] Build Phaser battlefield scene with procedural ink landscape and silhouettes.
- [x] Build DOM HUD: top bars, resource meters, enemy intents, deck counts, hand cards, end-turn button.
- [x] Build route map UI with clickable connected nodes.
- [x] Build reward, event, shop, and rest surfaces.
- [x] Add responsive layout for desktop and mobile widths.

Verification:

```bash
npm test
npm run build
```

## Milestone 5: Browser Playtest And Polish

- [x] Add Playwright smoke test for boot, character select, first battle, play card, end turn, reward transition.
- [x] Capture desktop and mobile screenshots.
- [x] Fix layout overlap, blank canvas, unreadable text, and broken inputs found in screenshot review.
- [x] Update `Documentation.md` with final status and known gaps.

Verification:

```bash
npm test
npm run build
npm run test:e2e
```
