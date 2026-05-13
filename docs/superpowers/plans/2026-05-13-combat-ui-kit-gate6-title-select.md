# Combat UI Kit Gate 6 Title And Character Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved combat UI kit language into the desktop Title and Character Select surface without changing menu behavior.

**Architecture:** Use `src/app/appShell.ts` for static title markup hooks and `src/styles/theme.css` for presentation. Add explicit kit classes and stable data attributes, then style the existing title panel, route ledger, character cards, challenge cards, and actions with the Gate2-Gate5 visual vocabulary.

**Tech Stack:** TypeScript, Vite, DOM app shell in `src/app/appShell.ts`, CSS in `src/styles/theme.css`, Playwright, Vitest.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-13-combat-ui-kit-gate6-title-select-design.md`
- Existing title shell: `src/app/appShell.ts`
- Existing title styles: `src/styles/theme.css`
- Focused e2e files: `tests/e2e/playable-flow.spec.ts`, `tests/e2e/visual-smoke.spec.ts`
- Preserve desktop landscape priority and avoid mobile portrait work.
- Do not generate new UI kit assets.

## Task 1: Add Failing Title UI Kit Assertions

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] **Step 1: Add title shell assertions**

In `"boots to title and exposes all four character choices before a run"`, assert:

```ts
await expect(page.getByTestId("screen-title")).toHaveClass(/title-screen--kit/);
await expect(page.getByTestId("title-route-ledger")).toHaveClass(/title-route-ledger--kit/);
await expect(page.locator(".character-select")).toHaveClass(/character-select--kit/);
await expect(page.getByTestId("character-zhaoyun")).toHaveClass(/character-choice--kit/);
await expect(page.getByTestId("character-zhaoyun")).toHaveAttribute("data-character-role", "zhaoyun");
await expect(page.locator(".challenge-select")).toHaveClass(/challenge-select--kit/);
await expect(page.getByTestId("challenge-standard")).toHaveClass(/challenge-choice--kit/);
await expect(page.locator(".title-actions")).toHaveClass(/title-actions--kit/);
```

- [ ] **Step 2: Add visual smoke character-card assertions**

In `"title character select presents four readable EA role cards"`, inside the character loop, assert each card has `character-choice--kit` and `data-character-role`.

- [ ] **Step 3: Run focused e2e and confirm RED**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts tests/e2e/visual-smoke.spec.ts --project=chromium --grep "boots to title|title character select"
```

Expected: fail because Title kit classes and character role data attributes are not present yet.

## Task 2: Add Title Markup Hooks

**Files:**
- Modify: `src/app/appShell.ts`

- [ ] **Step 1: Add kit classes**

Set:

```ts
menu.className = "title-screen title-screen--kit";
titleLedger.className = "title-route-ledger title-route-ledger--kit";
characterSelect.className = "character-select character-select--kit";
challengeSelect.className = "challenge-select challenge-select--kit";
titleActions.className = "title-actions title-actions--kit";
```

- [ ] **Step 2: Add character and challenge hooks**

Set character buttons:

```ts
characterButton.className = index === 0 ? "character-choice character-choice--kit is-selected" : "character-choice character-choice--kit";
characterButton.dataset.characterRole = character.id;
```

Set challenge buttons:

```ts
challengeButton.className = index === 0 ? "challenge-choice challenge-choice--kit is-selected" : "challenge-choice challenge-choice--kit";
```

## Task 3: Style The Kit Title Surface

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Strengthen title shell and ledger**

Add styles for `title-screen--kit`, `title-route-ledger--kit`, and `title-actions--kit`.

- [ ] **Step 2: Strengthen character and challenge cards**

Add styles for `character-select--kit`, `character-choice--kit`, `challenge-select--kit`, and `challenge-choice--kit`. Preserve selected, hover, focus, and disabled behavior.

## Task 4: Verify And Merge Back

**Files:**
- Modify: implementation files only unless verification reveals a docs convention gap.

- [ ] **Step 1: Run focused title e2e**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts tests/e2e/visual-smoke.spec.ts --project=chromium --grep "boots to title|title character select"
```

- [ ] **Step 2: Run full verification**

```bash
npm test
npm run typecheck
npm run build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test --project=chromium
git diff --check
```

- [ ] **Step 3: Merge worktree branch back to baseline**

From the main checkout, merge `codex/gate6-title-select-ui-kit` into `codex/wave47-relic-fit-system` after verification passes.
