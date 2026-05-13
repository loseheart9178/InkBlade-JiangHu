# Combat UI Kit Gate 3 Reward And Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved combat UI kit card-frame language into desktop Reward and Shop production surfaces without changing gameplay.

**Architecture:** Reuse the existing Gate 2 runtime assets from `src/app/combatUiKit.ts`. Export one shared rarity-to-frame helper, set card-frame CSS variables in the Reward and Shop DOM renderers, and apply focused CSS classes for kit-backed cards and card-group surfaces. Keep Phaser, reward drafting, shop pricing, relic logic, and mobile portrait out of scope.

**Tech Stack:** TypeScript, Vite, DOM renderer in `src/app/inkbladeController.ts`, CSS custom properties in `src/styles/theme.css`, Playwright, Vitest.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-13-combat-ui-kit-gate3-reward-shop-design.md`
- Gate 2 contract: `src/app/combatUiKit.ts`
- Current platform rule: desktop landscape first. Do not spend implementation time on mobile portrait layout or touch adaptation.
- Preserve current card-art review behavior: `card-art--kit img` remains `object-fit: contain`.
- Do not generate new UI assets, PSD files, or manifest entries in this gate.

## File Structure

- Modify: `src/app/combatUiKit.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

## Task 1: Add Failing Reward/Shop UI Kit Assertions

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Add reward assertions**

In the reward part of the `"combo-aware rewards explain why cards are offered"` test, immediately after:

```ts
await expect(page.getByTestId("reward-card").first().getByTestId("card-cost")).toBeVisible();
```

add:

```ts
await expect(page.getByTestId("reward-card").first()).toHaveClass(/reward-card--kit/);
await expect(page.getByTestId("reward-card").first()).toHaveAttribute("style", /--ui-kit-card-frame/);
await expect(page.getByTestId("reward-card").first().locator(".card-art")).toHaveClass(/card-art--kit/);
```

- [ ] **Step 2: Add shop assertions**

In the `"shops can add relics after the first battle"` test, immediately after:

```ts
await expect(travelCard).toHaveClass(/shop-item--card/);
```

add:

```ts
await expect(travelCard).toHaveClass(/shop-item--kit/);
await expect(travelCard).toHaveAttribute("style", /--ui-kit-card-frame/);
await expect(travelCard.locator(".card-art")).toHaveClass(/card-art--kit/);
```

After:

```ts
await expect(roleRelic).toHaveClass(/shop-item--relic/);
```

add:

```ts
await expect(roleRelic).not.toHaveClass(/shop-item--kit/);
```

After:

```ts
await expect(removeService).toHaveClass(/shop-item--service/);
```

add:

```ts
await expect(removeService).not.toHaveClass(/shop-item--kit/);
```

- [ ] **Step 3: Run the focused e2e test and confirm RED**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "combo-aware rewards|shops can add"
```

Expected: fail because reward cards do not have `reward-card--kit` and shop card offers do not have `shop-item--kit` or `--ui-kit-card-frame`.

- [ ] **Step 4: Commit the failing test**

Run:

```bash
git add tests/e2e/playable-flow.spec.ts
git commit -m "test: require ui kit on reward and shop cards"
```

## Task 2: Share Card Frame Asset Selection

**Files:**
- Modify: `src/app/combatUiKit.ts`
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Export the shared helper**

In `src/app/combatUiKit.ts`, append:

```ts
export type CombatUiCardRarity = "starter" | "common" | "uncommon" | "rare" | "event" | "ink" | "curse";

export function getCombatUiCardFrameAssetId(rarity: CombatUiCardRarity): CombatUiAssetId {
  if (rarity === "uncommon") {
    return "card-frame-uncommon";
  }

  if (rarity === "rare" || rarity === "ink" || rarity === "curse") {
    return "card-frame-rare";
  }

  if (rarity === "event") {
    return "card-frame-event";
  }

  return "card-frame-common";
}
```

- [ ] **Step 2: Update imports**

In `src/app/inkbladeController.ts`, update the `./combatUiKit` import so it imports `getCombatUiCardFrameAssetId` and no longer imports `type CombatUiAssetId`.

The import should read:

```ts
import {
  combatResourceIconByOwner,
  combatStatusIconByStatus,
  combatStatusIconByTone,
  getCombatUiAsset,
  getCombatUiCardFrameAssetId
} from "./combatUiKit";
```

- [ ] **Step 3: Replace combat-only helper use**

In the combat hand card loop, replace:

```ts
cardButton.style.setProperty("--ui-kit-card-frame", `url("${getCombatUiAsset(getCardFrameAssetId(definition.rarity))}")`);
```

with:

```ts
cardButton.style.setProperty("--ui-kit-card-frame", `url("${getCombatUiAsset(getCombatUiCardFrameAssetId(definition.rarity))}")`);
```

- [ ] **Step 4: Remove the local helper**

Delete the local `getCardFrameAssetId` function from `src/app/inkbladeController.ts`.

- [ ] **Step 5: Verify TypeScript**

Run:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Expected: pass.

## Task 3: Wire UI Kit Markup Into Reward And Shop Cards

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Add reward card frame variables**

In `renderReward`, change:

```ts
button.className = `reward-card card-type-${card.types[0]}`;
```

to:

```ts
button.className = `reward-card reward-card--kit card-type-${card.types[0]}`;
button.style.setProperty("--ui-kit-card-frame", `url("${getCombatUiAsset(getCombatUiCardFrameAssetId(card.rarity))}")`);
```

- [ ] **Step 2: Add shop card frame variables**

In `createShopCardAction`, change:

```ts
button.className = `choice-action shop-item shop-item--card card-type-${type}`;
```

to:

```ts
button.className = `choice-action shop-item shop-item--card shop-item--kit card-type-${type}`;
button.style.setProperty("--ui-kit-card-frame", `url("${getCombatUiAsset(getCombatUiCardFrameAssetId(card.rarity))}")`);
```

- [ ] **Step 3: Run the focused e2e test**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "combo-aware rewards|shops can add"
```

Expected: pass.

## Task 4: Apply Reward/Shop UI Kit Styling

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Add kit-backed reward card styling**

Near the existing `.reward-card` styles, add:

```css
.reward-card--kit::before,
.shop-item--kit::after {
  background:
    var(--ui-kit-card-frame, none),
    linear-gradient(90deg, transparent 0 10px, var(--card-ornament) 10px 11px, transparent 11px calc(100% - 11px), var(--card-ornament) calc(100% - 11px) calc(100% - 10px), transparent calc(100% - 10px)),
    linear-gradient(180deg, transparent 0 12px, rgba(44, 41, 36, 0.1) 12px 13px, transparent 13px calc(100% - 13px), rgba(44, 41, 36, 0.1) calc(100% - 13px) calc(100% - 12px), transparent calc(100% - 12px));
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%, auto, auto;
  opacity: 0.42;
}

.reward-card--kit .card-art img,
.shop-item--kit .card-art img {
  object-fit: contain;
  object-position: center;
  mix-blend-mode: normal;
}
```

- [ ] **Step 2: Add subtle kit group surfaces**

Near `.reward-stage .reward-cards` and `.shop-section`, add:

```css
.reward-stage .reward-cards,
.shop-section {
  position: relative;
}

.reward-stage .reward-cards::before,
.shop-section--cards::before {
  position: absolute;
  inset: 6px;
  z-index: 0;
  content: "";
  border-radius: 7px;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(238, 190, 91, 0.16), transparent 64%),
    linear-gradient(90deg, transparent, rgba(47, 124, 110, 0.1), transparent);
  pointer-events: none;
}

.reward-stage .reward-cards > *,
.shop-section > * {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Run CSS and focused browser checks**

Run:

```bash
git diff --check
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "combo-aware rewards|shops can add"
```

Expected: both pass.

## Task 5: Document And Verify Gate 3

**Files:**
- Modify: `Documentation.md`

- [ ] **Step 1: Add documentation entry**

Append this entry to `Documentation.md`:

```markdown
## 2026-05-13 Combat UI Kit Gate 3 Reward And Shop

Gate 3 extended the approved combat UI kit card-frame language into desktop Reward and Shop surfaces.

What changed:

- Shared card rarity to UI kit frame selection through `src/app/combatUiKit.ts`.
- Applied approved card frame slices to reward cards and shop card offers.
- Kept generated card art in `object-fit: contain` for uncut card-art review.
- Preserved reward drafting, shop pricing, relic purchases, card removal, and build-fit guidance.
- Added focused Playwright assertions for Reward and Shop UI kit integration.

Verification:

```text
git diff --check
Result: passed.

node node_modules/typescript/bin/tsc --noEmit
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "combo-aware rewards|shops can add"
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
Result: passed.

NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
Result: passed.
```
```

- [ ] **Step 2: Run full verification**

Run:

```bash
git diff --check
node node_modules/typescript/bin/tsc --noEmit
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium --grep "combo-aware rewards|shops can add"
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
```

Expected: all pass.

- [ ] **Step 3: Commit production integration**

Run:

```bash
git add src/app/combatUiKit.ts src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts Documentation.md
git commit -m "feat: extend combat ui kit to reward shop"
```

Expected: commit excludes `node_modules`, screenshot output, and unrelated local files.

## Self-Review

- Spec coverage: tasks cover Reward, Shop, shared helper, CSS, tests, documentation, and verification.
- Scope guard: no asset generation, no manifest changes, no Event/Rest/Map/Compendium/Title work, no mobile portrait work.
- Type consistency: the shared helper is `getCombatUiCardFrameAssetId`, and renderers call it with `card.rarity` / `definition.rarity`.
- Test-first: Task 1 creates failing Playwright assertions before production code changes.
