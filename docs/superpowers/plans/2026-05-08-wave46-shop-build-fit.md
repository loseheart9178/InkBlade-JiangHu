# Wave 46 Shop Build Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show build-fit guidance on shop card offers so paid card choices use the same martial-build language as rewards, deck compass, and run recap.

**Architecture:** Reuse the pure Wave45 `createRewardBuildFit()` helper. The app controller adapts the current `RunState` deck and each shop card offer into that helper, then renders DOM chips/details. CSS shares the reward-fit tone palette with shop-specific class names. No shop generation, economy, combat, save, Phaser, platform, art, or mobile work is touched.

**Tech Stack:** TypeScript, DOM/CSS, Playwright, Vitest.

---

## Files

- Modify `src/app/inkbladeController.ts`: render shop card build-fit label/detail.
- Modify `src/styles/theme.css`: share reward-fit tone styles with shop-fit chips.
- Modify `tests/e2e/playable-flow.spec.ts`: assert shop build-fit UI in the existing shop flow.
- Modify `Documentation.md`: record planning and implementation status.

## Acceptance Criteria

- [ ] Every shop card offer renders `data-testid="shop-build-fit"`.
- [ ] Every shop card offer renders `data-testid="shop-build-fit-detail"`.
- [ ] Shop card buttons expose `data-build-fit-tone` as `main`, `branch`, `utility`, or `risk`.
- [ ] Ink shop card displays `墨灾取势`.
- [ ] Ink shop card detail contains `墨痕`.
- [ ] Existing shop card art, chrome, keyword row, price chip, affordability data, and purchase click behavior remain unchanged.
- [ ] Relic offers and delete-card service behavior remain unchanged.
- [ ] No shop draft generation, economy, combat, persistence, Steam/platform, release packaging, new art, or mobile work is introduced.

## Task 1: Shop Card Build Fit UI

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser assertions**

In `tests/e2e/playable-flow.spec.ts`, inside `"shops can add relics after the first battle"`, add these assertions after the existing travel card price assertion:

```ts
await expect(travelCard.getByTestId("shop-build-fit")).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
await expect(travelCard.getByTestId("shop-build-fit-detail")).toContainText(/流|技法|攻击|墨痕|成型|短板/);
await expect(travelCard).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);
```

Add these assertions after the existing role card note assertion:

```ts
await expect(roleCard.getByTestId("shop-build-fit")).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
await expect(roleCard.getByTestId("shop-build-fit-detail")).toContainText(/流|技法|攻击|墨痕|成型|短板/);
await expect(roleCard).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);
```

Add these assertions after the existing ink card note assertion:

```ts
await expect(inkCard.getByTestId("shop-build-fit")).toContainText("墨灾取势");
await expect(inkCard.getByTestId("shop-build-fit-detail")).toContainText("墨痕");
await expect(inkCard).toHaveAttribute("data-build-fit-tone", "risk");
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics" --project=chromium
```

Expected: FAIL because `shop-build-fit` and `shop-build-fit-detail` are not rendered.

- [ ] **Step 3: Render shop build fit**

In `src/app/inkbladeController.ts`, add `createRewardBuildFit` to the existing import if it is not already present:

```ts
import { createRewardBuildFit } from "../game/systems/deck/rewardFit";
```

Update `createShopCardAction()` so it computes and renders the fit:

```ts
function createShopCardAction(run: RunState, offer: ReturnType<typeof createShopDraft>["cards"][number], onClick: () => void): HTMLButtonElement {
  const { card, label, note, price, slotId } = offer;
  const button = document.createElement("button");
  const affordable = run.gold >= price;
  const type = card.types[0] ?? "skill";
  const fit = createRewardBuildFit(getRunCardDefinitions(run), card);
  button.type = "button";
  button.className = `choice-action shop-item shop-item--card card-type-${type}`;
  button.dataset.testid = `shop-card-${slotId}`;
  button.dataset.shopCardId = card.id;
  button.dataset.shopSlot = slotId;
  button.dataset.affordable = `${affordable}`;
  button.dataset.shopAffordable = `${affordable}`;
  button.dataset.buildFitTone = fit.tone;
  button.innerHTML = `
    <span class="shop-meta-row">
      <span>${escapeHtml(label)}</span>
      <i class="shop-slot-note">${escapeHtml(note)}</i>
    </span>
    ${createCardArtMarkup(card)}
    ${createCardChromeMarkup(card)}
    <strong>${escapeHtml(card.name)}</strong>
    <small class="card-type-line">${escapeHtml(formatTypes(card.types))}</small>
    ${createCardKeywordRowMarkup(card)}
    <span class="description card-description">${escapeHtml(card.description ?? "")}</span>
    <span class="shop-build-fit shop-build-fit--${fit.tone}" data-testid="shop-build-fit">${escapeHtml(fit.label)}</span>
    <span class="shop-build-fit-detail" data-testid="shop-build-fit-detail">${escapeHtml(fit.detail)}</span>
    <span class="shop-price-chip" data-testid="shop-price-chip">${price}铜钱</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}
```

- [ ] **Step 4: Share reward-fit tone styles with shop fit**

In `src/styles/theme.css`, update the reward-fit selectors near `.reward-archetype-role` so shop chips share the same base and tone styles:

```css
.reward-build-fit,
.shop-build-fit {
  justify-self: center;
  min-height: 20px;
  padding: 3px 9px;
  border: 1px solid rgba(44, 41, 36, 0.24);
  border-radius: 999px;
  color: #2c2924;
  background: rgba(255, 252, 239, 0.68);
  font-size: 11px;
  line-height: 1.2;
  box-shadow: inset 0 0 0 1px rgba(255, 252, 239, 0.38);
}

.reward-build-fit--main,
.shop-build-fit--main {
  border-color: rgba(183, 53, 42, 0.36);
  color: #8d2b23;
  background: rgba(255, 235, 225, 0.62);
}

.reward-build-fit--branch,
.shop-build-fit--branch {
  border-color: rgba(47, 124, 110, 0.34);
  color: #1f5b51;
  background: rgba(234, 247, 239, 0.58);
}

.reward-build-fit--utility,
.shop-build-fit--utility {
  border-color: rgba(122, 91, 46, 0.3);
  color: #684c25;
  background: rgba(255, 248, 222, 0.6);
}

.reward-build-fit--risk,
.shop-build-fit--risk {
  border-color: rgba(68, 44, 78, 0.38);
  color: #4d274f;
  background: rgba(239, 229, 244, 0.62);
}

.reward-build-fit-detail,
.shop-build-fit-detail {
  display: block;
  min-height: 32px;
  padding: 6px 8px;
  border: 1px solid rgba(47, 124, 110, 0.2);
  border-radius: 5px;
  color: #234f48;
  background: rgba(255, 252, 239, 0.5);
  font-size: 11px;
  line-height: 1.28;
  text-align: center;
}
```

- [ ] **Step 5: Run focused verification**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics" --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts tests/run/run-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show shop build fit"
```

## Task 2: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run final verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts tests/run/run-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics|boots, enters a Zhao Yun battle" --project=chromium
```

Expected: PASS.

- [ ] **Step 2: Update `Documentation.md`**

Add a Wave46 implementation entry with docs read, subagents used, changed files, verification output, known gaps, and next milestone.

- [ ] **Step 3: Commit documentation**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave46 shop build fit"
```
