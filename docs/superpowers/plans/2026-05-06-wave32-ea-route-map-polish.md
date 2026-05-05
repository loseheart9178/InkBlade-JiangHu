# Wave 32 EA Route Map Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the route map read as a clear jianghu decision board where players can instantly see current position, available paths, risk, and rewards.

**Architecture:** Keep map generation and preview rules in `src/game/systems/run/run.ts`. This wave only changes DOM rendering, CSS presentation, and browser assertions in the app/controller layer.

**Tech Stack:** TypeScript DOM rendering, CSS custom properties, Playwright.

---

## File Structure

- Modify `src/app/inkbladeController.ts`: add visible node state and reward markup in `renderMap`.
- Modify `src/styles/theme.css`: style node state badges, reward rows, available path emphasis, and locked/visited readability.
- Modify `tests/e2e/playable-flow.spec.ts`: expand the existing route-map test and capture a desktop screenshot.
- Modify `Documentation.md`: record docs read, implementation decisions, verification, gaps, and next step.

## Acceptance Criteria

- [ ] Each map node exposes `data-route-state` with one of `current`, `available`, `visited`, or `locked`.
- [ ] Each node displays a compact visible route-state badge: `当前`, `可走`, `已行`, or `未通`.
- [ ] Each node displays `preview.reward` as a visible reward line, not only in `title`/`aria-label`.
- [ ] Available nodes have a clear but restrained visual emphasis over locked nodes.
- [ ] The route-map Playwright test verifies state badges, visible reward rows, and a desktop screenshot.
- [ ] No map generation, travel rules, node pools, or gameplay rewards change.

## Task 1: Add Browser Expectations

- [ ] **Step 1: Update the existing route-map Playwright test**

Modify `tests/e2e/playable-flow.spec.ts` in `route map shows risk and reward previews before choosing nodes`:

```ts
const currentNode = page.getByTestId("map-node-start");
await expect(currentNode).toHaveAttribute("data-route-state", "current");
await expect(currentNode.getByTestId("map-node-state-start")).toContainText("当前");

const battleNode = page.getByTestId("map-node-battle-1");
await expect(battleNode).toHaveAttribute("data-route-state", "available");
await expect(battleNode.getByTestId("map-node-state-battle-1")).toContainText("可走");
await expect(page.getByTestId("map-node-reward-battle-1")).toContainText("金币+12 / 三选一武学");

await expect(page.getByTestId("map-node-reward-event-1")).toContainText("事件收益 / 代价");
await expect(page.getByTestId("map-node-reward-shop-1")).toContainText("消费铜钱 / 调整牌组");
await capturePlaytestScreenshot(page, testInfo, "wave32-route-map-surface.png");
```

Change the test signature to `async ({ page }, testInfo)` so the screenshot helper is available.

- [ ] **Step 2: Run the focused test to confirm it fails before implementation**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "route map shows risk"
```

Expected: FAIL because `data-route-state`, `map-node-state-*`, and `map-node-reward-*` do not exist yet.

## Task 2: Render Route State And Rewards

- [ ] **Step 1: Add route state calculation in `renderMap`**

Use the existing `available` list and `run.visitedNodeIds`:

```ts
const availableIds = new Set(available.map((item) => item.id));
```

For each node, derive:

```ts
const routeState = node.id === current.id
  ? "current"
  : run.visitedNodeIds.includes(node.id)
    ? "visited"
    : availableIds.has(node.id)
      ? "available"
      : "locked";
```

- [ ] **Step 2: Add DOM attributes/classes and visible labels**

Inside the node loop:

```ts
button.dataset.routeState = routeState;
button.classList.add(`is-${routeState}`);
```

Add these lines to the button markup:

```ts
<span class="map-node-state" data-testid="map-node-state-${escapeAttribute(node.id)}">${formatMapRouteState(routeState)}</span>
<span class="map-node-reward" data-testid="map-node-reward-${escapeAttribute(node.id)}">${escapeHtml(preview.reward)}</span>
```

- [ ] **Step 3: Add the formatter near map helpers**

```ts
type MapRouteState = "current" | "available" | "visited" | "locked";

function formatMapRouteState(routeState: MapRouteState): string {
  const labels: Record<MapRouteState, string> = {
    current: "当前",
    available: "可走",
    visited: "已行",
    locked: "未通"
  };
  return labels[routeState];
}
```

## Task 3: Style Map Decision Readability

- [ ] **Step 1: Update `src/styles/theme.css` map-node grid rows**

Make room for the new badge and reward row:

```css
.map-node {
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto auto 1fr auto;
}
```

- [ ] **Step 2: Add state badge styles**

```css
.map-node-state {
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  padding: 2px 6px;
  border: 1px solid rgba(44, 41, 36, 0.2);
  border-radius: 999px;
  color: rgba(44, 41, 36, 0.72);
  background: rgba(255, 252, 239, 0.58);
  font-size: 10px;
  line-height: 1.2;
}
```

- [ ] **Step 3: Add reward row and available-node emphasis**

```css
.map-node-reward {
  grid-column: 2 / 4;
  padding: 4px 6px;
  border: 1px solid rgba(238, 190, 91, 0.28);
  border-radius: 5px;
  color: #5f1d18;
  background: rgba(255, 252, 239, 0.5);
  font-size: 10px;
  line-height: 1.25;
}

.map-node.is-available {
  border-color: rgba(183, 53, 42, 0.58);
  box-shadow: inset 0 0 0 2px rgba(183, 53, 42, 0.08);
}
```

## Task 4: Verify And Record

- [ ] **Step 1: Run focused Playwright**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "route map shows risk"
```

Expected: PASS with `wave32-route-map-surface.png`.

- [ ] **Step 2: Run full verification**

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

- [ ] **Step 3: Update `Documentation.md` and commit**

Record:

- docs/files read;
- visible state/reward DOM changes;
- screenshot result;
- verification commands and results;
- remaining gap that route lines are still implied by grid position rather than drawn connector strokes.
