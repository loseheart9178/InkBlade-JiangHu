# Wave 34 EA Route Connectors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible route connector strokes to the chapter map so available and future paths read as an actual jianghu route network.

**Architecture:** Keep map generation and travel legality unchanged in `src/game/systems/run/`. Render a lightweight SVG connector layer inside the existing DOM route map, behind node buttons.

**Tech Stack:** TypeScript DOM rendering, inline SVG, CSS custom properties, Playwright.

---

## File Structure

- Modify `tests/e2e/playable-flow.spec.ts`: extend route-map screenshot coverage to assert connector SVG lines.
- Modify `src/app/inkbladeController.ts`: render route connector SVG lines from existing `MapNode.connections`.
- Modify `src/styles/theme.css`: style connector strokes behind nodes with current/available emphasis.
- Modify `Documentation.md`: record docs read, implementation notes, verification, gaps, and next step.

## Acceptance Criteria

- [ ] Route map contains one `route-connectors` SVG layer behind node buttons.
- [ ] Each map edge renders a visible `route-connector` line with stable test id `route-connector-${from}-${to}`.
- [ ] Connectors from the current node carry `data-route-connector-state="available"` and read more clearly than locked future connectors.
- [ ] Connector rendering does not change node click behavior, map generation, rewards, or travel legality.
- [ ] Focused Playwright verifies connectors and captures a desktop screenshot.

## Task 1: Add Browser Expectations

- [ ] **Step 1: Extend the existing route-map test**

In `tests/e2e/playable-flow.spec.ts`, inside `route map shows risk and reward previews before choosing nodes`, add:

```ts
await expect(page.getByTestId("route-connectors")).toBeVisible();
await expect(page.getByTestId("route-connector-start-battle-1")).toHaveAttribute("data-route-connector-state", "available");
await expect(page.getByTestId("route-connector-start-event-1")).toHaveAttribute("data-route-connector-state", "available");
await expect(page.getByTestId("route-connector-battle-1-shop-1")).toHaveAttribute("data-route-connector-state", "locked");
```

Keep the existing `wave32-route-map-surface.png` capture or rename it to `wave34-route-connectors.png`.

- [ ] **Step 2: Verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "route map shows risk"
```

Expected: FAIL because the SVG connector layer does not exist yet.

## Task 2: Render Connector SVG

- [ ] **Step 1: Add connector layer before node buttons**

In `renderMap`, after `availableIds`:

```ts
const mapColumns = Math.max(...run.mapNodes.map((node) => node.floor)) + 1;
path.style.setProperty("--map-columns", `${mapColumns}`);
path.append(createRouteConnectorLayer(run, current, availableIds, mapColumns));
```

- [ ] **Step 2: Add helper functions near map helpers**

```ts
function createRouteConnectorLayer(run: RunState, current: MapNode, availableIds: Set<string>, mapColumns: number): SVGSVGElement {
  const lanes = Math.max(...run.mapNodes.map((node) => node.lane)) + 1;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("route-connectors");
  svg.dataset.testid = "route-connectors";
  svg.setAttribute("viewBox", `0 0 ${mapColumns} ${lanes}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  for (const node of run.mapNodes) {
    for (const targetId of node.connections) {
      const target = run.mapNodes.find((item) => item.id === targetId);
      if (!target) {
        continue;
      }
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const state = node.id === current.id && availableIds.has(target.id) ? "available" : run.visitedNodeIds.includes(node.id) ? "visited" : "locked";
      line.classList.add("route-connector", `route-connector--${state}`);
      line.dataset.testid = `route-connector-${node.id}-${target.id}`;
      line.dataset.routeConnectorState = state;
      line.setAttribute("x1", `${node.floor + 0.5}`);
      line.setAttribute("y1", `${node.lane + 0.5}`);
      line.setAttribute("x2", `${target.floor + 0.5}`);
      line.setAttribute("y2", `${target.lane + 0.5}`);
      svg.append(line);
    }
  }

  return svg;
}
```

## Task 3: Style Connectors

- [ ] **Step 1: Make route map host the SVG layer**

In `src/styles/theme.css`:

```css
.route-map {
  position: relative;
}

.route-connectors {
  position: absolute;
  inset: 18px;
  z-index: 0;
  pointer-events: none;
}

.map-node {
  z-index: 1;
}
```

- [ ] **Step 2: Add stroke styling**

```css
.route-connector {
  stroke: rgba(44, 41, 36, 0.2);
  stroke-width: 0.035;
  stroke-linecap: round;
}

.route-connector--available {
  stroke: rgba(183, 53, 42, 0.72);
  stroke-width: 0.05;
}

.route-connector--visited {
  stroke: rgba(47, 124, 110, 0.5);
  stroke-width: 0.045;
}
```

## Task 4: Verify And Record

- [ ] **Step 1: Focused Playwright**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "route map shows risk"
```

- [ ] **Step 2: Full verification**

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

- [ ] **Step 3: Update docs and commit**

Record the screenshot path, verification outputs, UI-only decision, and remaining risk that SVG alignment is approximate because CSS grid gaps are not encoded into the SVG coordinate system.
