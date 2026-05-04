# Observed Bugfixes 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for independent implementation slices. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the second user playtest bug report: inconsistent hand-card sizes, hand cards overlapping combat HUD, and first-chapter elite/boss enemies switching to mismatched attack art.

**Architecture:** Keep combat rules unchanged. Treat card sizing and HUD separation as DOM/CSS layout concerns in `src/styles/theme.css`. Treat attack-art fallback selection as content/controller visual selection, with data assertions in `tests/data/content.test.ts` and desktop browser assertions in Playwright.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, DOM combat HUD.

---

## Required Context

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/chapters/chapter_01.md`
- User report: `/mnt/c/Users/loseheart/Documents/Obsidian Vault/云水江湖开发待修bug2.md`

## Task 1: Stabilize Combat Hand Layout

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] Add a Playwright regression assertion that all visible `.combat-card` elements have the same height in desktop combat.
- [ ] Add a Playwright regression assertion that visible `.combat-card` elements do not overlap combat topbar, message/log, controls, or energy HUD.
- [ ] Fix CSS with fixed card dimensions, constrained keyword/description rows, and a lower hover lift so short `攻` cards no longer render smaller than longer `技/记` cards.
- [ ] Run `npx playwright test tests/e2e/visual-smoke.spec.ts -g "combat smoke"` and inspect the desktop screenshot.

## Task 2: Remove Mismatched First-Chapter Attack Fallbacks

**Files:**
- Modify: `src/game/content/visuals.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] Add a Vitest regression proving first-chapter enemies without bespoke clean attack strips do not resolve to `/assets/sprites/enemy-slash-strip.svg`.
- [ ] Add or update a Playwright assertion for a first-chapter elite attack state so no mismatched `combat-sprite-enemy` appears while the standee performs the attack lunge.
- [ ] Move attack sprite selection into a testable content helper and return `undefined` for `elite_sword_echo`, `elite_blood_banner`, and `boss_ink_dongzhuo` until clean bespoke strips exist.
- [ ] Run targeted Vitest and Playwright checks.

## Task 3: Documentation And Gate

**Files:**
- Modify: `Documentation.md`

- [ ] Record docs read, user report read, implementation decisions, verification, known art debt, and next step.
- [ ] Run full verification: Vitest, typecheck, build, Playwright desktop e2e, and asset audit.
- [ ] Commit the completed branch after all required gates pass or clearly document any blocker.
