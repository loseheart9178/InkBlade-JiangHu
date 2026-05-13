# Combat UI Kit Gate 4 Event And Rest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved combat UI kit language into desktop Event and Rest production scenes without changing gameplay.

**Architecture:** Keep the DOM renderers in `src/app/inkbladeController.ts` as the integration point. Add explicit kit hooks and consequence/action data attributes, then style those hooks in `src/styles/theme.css` using the existing Gate2/3 paper, ink, cinnabar, jade, and card-frame vocabulary.

**Tech Stack:** TypeScript, Vite, DOM renderer in `src/app/inkbladeController.ts`, CSS in `src/styles/theme.css`, Playwright, Vitest.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-13-combat-ui-kit-gate4-event-rest-design.md`
- Existing Event/Rest renderer: `src/app/inkbladeController.ts`
- Existing Event/Rest styles: `src/styles/theme.css`
- Focused e2e file: `tests/e2e/playable-flow.spec.ts`
- Preserve desktop landscape priority and avoid mobile portrait work.
- Do not generate new UI kit assets.

## Task 1: Add Failing Event/Rest UI Kit Assertions

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Add Event assertions**

In `"Cai Wenji event route presents polished choice effects and logbook feedback"`, after the event screen is visible, assert:

```ts
await expect(page.getByTestId("event-layout")).toHaveClass(/event-layout--kit/);
await expect(page.getByTestId("event-choices")).toHaveClass(/event-choices--kit/);
await expect(page.getByTestId("event-choice-continue_clear_phrase")).toHaveClass(/choice-action--event-kit/);
await expect(page.getByTestId("event-choice-continue_clear_phrase")).toHaveAttribute("data-event-choice-tone", /gain|mind|ink|cost|upgrade/);
```

- [ ] **Step 2: Add Rest assertions**

In `"can complete the first chapter through the event and rest route"`, after clicking `map-node-rest-1`, assert:

```ts
await expect(page.getByTestId("rest-scene")).toHaveClass(/rest-scene--kit/);
await expect(page.getByTestId("rest-actions")).toHaveClass(/rest-actions--kit/);
await expect(page.getByTestId("rest-heal")).toHaveClass(/choice-action--rest-kit/);
await expect(page.getByTestId("rest-heal")).toHaveAttribute("data-rest-action", "heal");
await expect(page.getByTestId("rest-upgrade-card")).toHaveClass(/choice-action--rest-kit/);
await expect(page.getByTestId("rest-upgrade-card")).toHaveAttribute("data-rest-action", "upgrade");
```

- [ ] **Step 3: Run focused e2e and confirm RED**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "event route presents|first chapter through the event and rest route"
```

Expected: fail because Event/Rest kit classes and data attributes are not present yet.

## Task 2: Add Event/Rest Markup Hooks

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Add kit classes to Event containers**

Set:

```ts
layout.className = "scene-surface event-layout event-layout--kit";
choices.className = "event-choices event-choice-rail event-choices--kit";
```

- [ ] **Step 2: Add kit class and tone data to Event choices**

Update `createEventChoiceAction` so choice buttons use:

```ts
button.className = "choice-action choice-action--event choice-action--event-kit";
button.dataset.eventChoiceTone = getEventChoiceTone(choice);
```

Add a small helper:

```ts
function getEventChoiceTone(choice: GameEventChoice): "gain" | "cost" | "ink" | "mind" | "upgrade" {
  const tones = choice.effects.map((effect) => describeEventEffect(effect).tone);
  return tones.find((tone) => tone === "cost" || tone === "ink" || tone === "mind") ?? tones.find((tone) => tone === "upgrade") ?? "gain";
}
```

- [ ] **Step 3: Add kit classes/data to Rest**

Set:

```ts
heal.classList.add("choice-action--rest", "choice-action--rest-heal", "choice-action--rest-kit");
heal.dataset.restAction = "heal";
upgrade.classList.add("choice-action--rest", "choice-action--rest-upgrade", "choice-action--rest-kit");
upgrade.dataset.restAction = "upgrade";
scene.className = "scene-surface rest-scene rest-scene--kit";
actions.className = "rest-actions rest-actions--kit";
```

## Task 3: Style Event/Rest Kit Language

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Strengthen Event paper scene and choice cards**

Add styles for `event-layout--kit`, `event-choices--kit`, `choice-action--event-kit`, and tone-specific `data-event-choice-tone` values. Keep effect chips visible and avoid changing click behavior.

- [ ] **Step 2: Strengthen Rest scene and action cards**

Add styles for `rest-scene--kit`, `rest-actions--kit`, `choice-action--rest-kit`, and `data-rest-action` variants. Keep disabled upgrade treatment readable.

## Task 4: Verify And Merge Back

**Files:**
- Modify: `Documentation.md` if the project convention requires a changelog note after implementation.

- [ ] **Step 1: Run focused Event/Rest e2e**

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "event route presents|first chapter through the event and rest route"
```

- [ ] **Step 2: Run full verification**

```bash
npm test
npm run typecheck
npm run build
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test --project=chromium
```

- [ ] **Step 3: Merge worktree branch back to baseline**

From the main checkout, merge `codex/gate4-event-rest-ui-kit` into `codex/wave47-relic-fit-system` after verification passes.
