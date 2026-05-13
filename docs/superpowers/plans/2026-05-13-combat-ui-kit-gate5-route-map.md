# Combat UI Kit Gate 5 Route Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved combat UI kit language into the desktop Route Map without changing route logic.

**Architecture:** Keep `renderMap` as the DOM integration point and `src/styles/theme.css` as the presentation layer. Add explicit kit classes/data hooks to existing map containers, nodes, preview rows, reward rows, and connector layer, then style those hooks with Gate2-Gate4 paper, ink, cinnabar, and jade vocabulary.

**Tech Stack:** TypeScript, Vite, DOM renderer in `src/app/inkbladeController.ts`, CSS in `src/styles/theme.css`, Playwright, Vitest.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-13-combat-ui-kit-gate5-route-map-design.md`
- Existing map renderer: `src/app/inkbladeController.ts`
- Existing map styles: `src/styles/theme.css`
- Focused e2e file: `tests/e2e/playable-flow.spec.ts`
- Preserve desktop landscape priority and avoid mobile portrait work.
- Do not generate new UI kit assets.

## Task 1: Add Failing Route Map UI Kit Assertions

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Add kit assertions to the route map test**

In `"route map shows risk and reward previews before choosing nodes"`, assert:

```ts
await expect(page.getByTestId("route-cinematic-header")).toHaveClass(/route-cinematic-header--kit/);
await expect(page.getByTestId("route-journey-strip")).toHaveClass(/route-journey-strip--kit/);
await expect(page.getByTestId("route-connectors")).toHaveClass(/route-connectors--kit/);
await expect(page.locator(".route-map")).toHaveClass(/route-map--kit/);
await expect(page.getByTestId("map-node-battle-1")).toHaveClass(/map-node--kit/);
await expect(page.getByTestId("map-node-battle-1")).toHaveAttribute("data-map-node-type", "battle");
await expect(page.getByTestId("map-node-preview-battle-1")).toHaveClass(/map-node-preview--kit/);
await expect(page.getByTestId("map-node-reward-battle-1")).toHaveClass(/map-node-reward--kit/);
await expect(page.getByTestId("map-node-event-1")).toHaveAttribute("data-map-node-type", "event");
await expect(page.getByTestId("map-node-shop-1")).toHaveAttribute("data-map-node-type", "shop");
await expect(page.getByTestId("map-node-rest-1")).toHaveAttribute("data-map-node-type", "rest");
```

- [ ] **Step 2: Run focused e2e and confirm RED**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "route map shows risk"
```

Expected: fail because Route Map kit classes and node type data attributes are not present yet.

## Task 2: Add Route Map Markup Hooks

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Add kit classes to map containers**

Set:

```ts
header.className = "route-cinematic-header route-cinematic-header--kit";
strip.className = "route-journey-strip route-journey-strip--kit";
path.className = "route-map route-map--kit";
svg.classList.add("route-connectors", "route-connectors--kit");
```

- [ ] **Step 2: Add kit hooks to map nodes and copy rows**

Set:

```ts
button.className = `map-node map-node--kit map-node--${node.type}`;
button.dataset.mapNodeType = node.type;
```

Render preview and reward rows as:

```html
<span class="map-node-preview map-node-preview--kit" data-testid="map-node-preview-${escapeAttribute(node.id)}">${escapeHtml(preview.detail)}</span>
<span class="map-node-reward map-node-reward--kit" data-testid="map-node-reward-${escapeAttribute(node.id)}">${escapeHtml(preview.reward)}</span>
```

## Task 3: Style The Kit Route Map

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Strengthen map chart and connector layer**

Add styles for `route-cinematic-header--kit`, `route-journey-strip--kit`, `route-map--kit`, and `route-connectors--kit`.

- [ ] **Step 2: Strengthen nodes and intelligence slips**

Add styles for `map-node--kit`, `map-node-preview--kit`, `map-node-reward--kit`, and node-type/state combinations. Preserve disabled/available/current semantics.

## Task 4: Verify And Merge Back

**Files:**
- Modify: implementation files only unless verification reveals a docs convention gap.

- [ ] **Step 1: Run focused route-map e2e**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "route map shows risk"
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

From the main checkout, merge `codex/gate5-route-map-ui-kit` into `codex/wave47-relic-fit-system` after verification passes.
