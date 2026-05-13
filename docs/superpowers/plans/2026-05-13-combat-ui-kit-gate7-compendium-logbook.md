# Combat UI Kit Gate 7 Compendium And Logbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved combat UI kit language into Compendium and Logbook surfaces without changing reference or story-record behavior.

**Architecture:** Use existing DOM renderers in `src/app/inkbladeController.ts` and CSS in `src/styles/theme.css`. Add explicit kit classes to shells, list controls, item cards, badges, and entries, then style those hooks with the same paper, ink, cinnabar, jade, and chip language as Gates 3-6.

**Tech Stack:** TypeScript, Vite, DOM renderer in `src/app/inkbladeController.ts`, CSS in `src/styles/theme.css`, Playwright, Vitest.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-13-combat-ui-kit-gate7-compendium-logbook-design.md`
- Existing renderers: `src/app/inkbladeController.ts`
- Existing styles: `src/styles/theme.css`
- Focused e2e file: `tests/e2e/playable-flow.spec.ts`
- Preserve desktop landscape priority and avoid mobile portrait work.
- Do not change unlock or filter logic.

## Task 1: Add Failing Compendium/Logbook Assertions

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Add Compendium assertions**

In title and map compendium tests, assert `compendium-screen--kit`, `compendium-tabs--kit`, `compendium-filters--kit`, `compendium-list--kit`, `compendium-item--kit`, `compendium-unlock-badge--kit`, and `compendium-meta--kit`.

- [ ] **Step 2: Add Logbook assertions**

In the logbook test, assert `logbook-screen--kit`, `logbook-list--kit`, and `logbook-entry--kit`.

- [ ] **Step 3: Run focused e2e and confirm RED**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "compendium|logbook"
```

Expected: fail because kit classes are absent.

## Task 2: Add Markup Hooks

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Add Compendium kit hooks**

Add the kit classes named in the design to the panel, tabs, filters, list, item cards, meta, and unlock badge.

- [ ] **Step 2: Add Logbook kit hooks**

Add `logbook-screen--kit`, `logbook-list--kit`, and `logbook-entry--kit`.

## Task 3: Style The Kit Dossiers

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Style Compendium kit hooks**

Strengthen shell, tabs, filters, groups, item cards, badges, and meta chips.

- [ ] **Step 2: Style Logbook kit hooks**

Strengthen story fragment rows as paper records.

## Task 4: Verify And Merge Back

Run focused e2e, `npm test`, `npm run typecheck`, `npm run build`, Chromium e2e, and `git diff --check`, then merge back after pass.
