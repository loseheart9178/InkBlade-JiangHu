# Wave 44 Live Build Compass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live build compass to the in-run deck viewer so players can understand their current martial style before completing a run.

**Architecture:** Reuse the pure Wave 43 `createDeckBuildRecap()` helper. The controller adapts the current `RunState` into recap input and renders DOM-only deck overlay chips. CSS extends existing deck overlay styling; no gameplay, persistence, Phaser, or platform code changes.

**Tech Stack:** TypeScript, DOM/CSS, Playwright.

---

## Files

- Modify `src/app/inkbladeController.ts`: render live build compass in the deck overlay.
- Modify `src/styles/theme.css`: add compact deck compass styling.
- Modify `tests/e2e/playable-flow.spec.ts`: assert deck compass visibility and signature cards.
- Modify `Documentation.md`: record planning and implementation status.

## Acceptance Criteria

- [ ] `renderDeckOverlayIfOpen()` uses `createDeckBuildRecap()` with current run cards, methods, relics, and challenge name.
- [ ] Deck overlay keeps `data-testid="deck-archetype-summary"` for existing tests.
- [ ] Deck overlay renders `data-testid="deck-build-compass"`.
- [ ] Deck overlay renders `data-testid="deck-build-primary"` and signature chips with `data-testid="deck-build-signature-card"`.
- [ ] Starter Zhao Yun deck shows starter signature cards such as `枪击`, `架枪`, or `龙胆`.
- [ ] After reward growth, the deck viewer still shows the compass and the grown deck cards.
- [ ] No new gameplay rules, persistence, analytics, Steam/platform, release packaging, art generation, or mobile work is introduced.

## Task 1: Deck Viewer Live Build Compass

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser assertions**

In `tests/e2e/playable-flow.spec.ts`, extend the `"boots, enters a Zhao Yun battle, wins, and returns to the route map"` test after the first `deck-archetype-summary` assertion:

```ts
await expect(page.getByTestId("deck-build-compass")).toBeVisible();
await expect(page.getByTestId("deck-build-primary")).toContainText(/当前流派|尚未成型|流/);
await expect(page.getByTestId("deck-build-signature-card").first()).toContainText(/枪击|架枪|龙胆/);
```

After the later reward-growth deck viewer assertion:

```ts
await expect(page.getByTestId("deck-build-compass")).toBeVisible();
await expect(page.getByTestId("deck-build-signature-card").first()).toBeVisible();
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle" --project=chromium
```

Expected: FAIL because `deck-build-compass` is not rendered.

- [ ] **Step 3: Render live recap in the deck overlay**

In `src/app/inkbladeController.ts`, update `renderDeckOverlayIfOpen()`:

```ts
const runCards = getRunCardDefinitions(run);
const archetypeAnalysis = analyzeDeckArchetypes(runCards);
const methodNames = getRunMethods(run).map((method) => method.name);
const buildRecap = createDeckBuildRecap({
  cards: runCards,
  methodNames,
  relicNames: run.relicIds.map((id) => relicsById[id]?.name ?? id),
  challengeName: resolveChallengeProfile(run.challengeId).name
});
```

Keep the existing `deck-archetype-summary` wrapper, but replace its `innerHTML` block with DOM nodes:

```ts
const summary = document.createElement("div");
summary.className = "deck-archetype-summary";
summary.dataset.testid = "deck-archetype-summary";
summary.append(createDeckBuildCompassPanel(buildRecap, methodNames.join("、") || "未定"));
```

Add this helper near `createRunBuildRecapPanel()`:

```ts
function createDeckBuildCompassPanel(recap: DeckBuildRecap, methodSummary: string): HTMLElement {
  const section = document.createElement("section");
  section.className = "deck-build-compass";
  section.dataset.testid = "deck-build-compass";

  const primary = document.createElement("div");
  primary.className = "deck-build-primary";
  primary.dataset.testid = "deck-build-primary";
  const label = document.createElement("span");
  label.textContent = "当前流派";
  const title = document.createElement("strong");
  title.textContent = recap.primaryLabel;
  const summary = document.createElement("small");
  summary.textContent = recap.summary;
  primary.append(label, title, summary);

  const signatures = document.createElement("div");
  signatures.className = "deck-build-signatures";
  const signatureNames = recap.signatureCards.length > 0 ? recap.signatureCards : ["尚无代表招式"];
  for (const name of signatureNames) {
    const chip = document.createElement("span");
    chip.dataset.testid = "deck-build-signature-card";
    chip.textContent = name;
    signatures.append(chip);
  }

  const details = document.createElement("div");
  details.className = "deck-build-details";
  for (const line of [...recap.typeBreakdown, ...recap.tacticalNotes, `心法 ${methodSummary}`, ...recap.supportSignals]) {
    const item = document.createElement("span");
    item.textContent = line;
    details.append(item);
  }

  section.append(primary, signatures, details);
  return section;
}
```

- [ ] **Step 4: Add compact deck compass styles**

In `src/styles/theme.css`, near the deck overlay styles, add:

```css
.deck-build-compass {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.deck-build-primary {
  display: grid;
  gap: 2px;
}

.deck-build-primary span,
.deck-build-primary small {
  min-width: 0;
  color: rgba(44, 41, 36, 0.68);
  font-size: 12px;
}

.deck-build-primary strong {
  min-width: 0;
  color: #5f1d18;
  font-size: 18px;
}

.deck-build-signatures,
.deck-build-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.deck-build-signatures span,
.deck-build-details span {
  max-width: 100%;
  padding: 3px 8px;
  border: 1px solid rgba(44, 41, 36, 0.16);
  border-radius: 999px;
  color: rgba(44, 41, 36, 0.78);
  background: rgba(255, 252, 239, 0.7);
  font-size: 12px;
}

.deck-build-signatures span {
  border-color: rgba(183, 53, 42, 0.22);
  color: #5f1d18;
  background: rgba(183, 53, 42, 0.08);
}
```

- [ ] **Step 5: Run focused verification**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle" --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show live deck build compass"
```

## Task 2: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run final verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/build-recap.test.ts tests/deck/archetype-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle|ending summary records" --project=chromium
```

Expected: PASS.

- [ ] **Step 2: Update documentation**

Append a Wave 44 implementation entry to `Documentation.md` with docs read, changed files, verification, risks, and next step.

- [ ] **Step 3: Commit docs**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave44 live build compass"
```
