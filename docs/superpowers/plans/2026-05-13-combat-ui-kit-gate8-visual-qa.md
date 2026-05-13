# Combat UI Kit Gate 8 Visual QA Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a final cross-surface visual QA text guard for the desktop combat UI kit rollout.

**Architecture:** Add a root QA class and gate marker in `src/app/appShell.ts`, then use `src/styles/theme.css` to apply safe overflow wrapping to representative UI kit surfaces. Extend `tests/e2e/visual-smoke.spec.ts` to protect the hook and a representative computed CSS value.

**Tech Stack:** TypeScript, Vite, DOM app shell, CSS, Playwright, Vitest.

---

## Task 1: Add Failing Visual QA Assertions

**Files:**
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] Assert `#hud-host` has `ui-kit-visual-qa`.
- [ ] Assert `#hud-host` has `data-ui-kit-gates="3-8"`.
- [ ] Assert a representative `character-choice--kit` has `overflow-wrap: anywhere`.
- [ ] Run focused visual smoke and confirm RED.

## Task 2: Add Root Hook And CSS Guard

**Files:**
- Modify: `src/app/appShell.ts`
- Modify: `src/styles/theme.css`

- [ ] Add `ui-kit-visual-qa` class and `data-ui-kit-gates="3-8"` to `hudHost`.
- [ ] Add `overflow-wrap: anywhere` and safe word breaking for the shared kit surface selector list.

## Task 3: Verify And Merge Back

Run focused visual smoke, `npm test`, `npm run typecheck`, `npm run build`, Chromium e2e, and `git diff --check`, then merge back.
