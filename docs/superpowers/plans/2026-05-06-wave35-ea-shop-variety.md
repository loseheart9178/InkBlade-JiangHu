# Wave 35 EA Shop Variety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the fixed shop stock into a deterministic, route-seed-driven货单 system so the EA showcase feels more replayable without changing the core economy.

**Architecture:** Keep shop stock selection in pure TypeScript systems and let the controller only render the resulting offers. Reuse existing card and relic pools, but group them into stable offer slots so each shop communicates a clear identity: steady travel goods, character-facing tech, and higher-variance jianghu side goods.

**Tech Stack:** TypeScript systems, DOM HUD rendering, CSS custom properties, Vitest, Playwright.

---

## File Structure

- Modify `src/game/systems/run/run.ts`: add deterministic shop draft helpers for card and relic offers.
- Modify `src/app/inkbladeController.ts`: render slot-based shop offers from the system draft instead of hard-coded stock.
- Modify `src/styles/theme.css`: style slot labels, stock notes, and slot-level card/relic chrome.
- Modify `tests/run/run-system.test.ts`: add deterministic coverage for shop stock generation.
- Modify `tests/e2e/playable-flow.spec.ts`: verify visible slot labels, stock metadata, and screenshot evidence.
- Modify `Documentation.md`: record docs read, implementation notes, verification, gaps, and next step.

## Acceptance Criteria

- [ ] Shop cards are no longer a fixed hard-coded trio.
- [ ] Shop cards come from stable offer slots with visible labels and notes, and the slot contents vary by run seed/character while staying deterministic for the same run.
- [ ] Shop relics no longer always use the first three pool entries; instead, utility, role-facing, and premium slots are surfaced from the shop-eligible relic pool.
- [ ] Controller rendering remains presentation-only; stock selection logic lives in the system layer.
- [ ] Unit tests prove deterministic stock generation and cross-seed variety.
- [ ] Browser tests verify slot labels, visible prices/metadata, and capture a desktop screenshot.

## Task 1: Add RED Tests For Deterministic Shop Drafts

- [ ] **Step 1: Extend run-system coverage**

In `tests/run/run-system.test.ts`, add focused assertions that:

```ts
const seed0 = createRun("zhaoyun", { mapSeed: 0 });
const seed1 = createRun("zhaoyun", { mapSeed: 1 });

const firstDraft = createShopDraft(seed0);
const secondDraft = createShopDraft(seed0);
const variantDraft = createShopDraft(seed1);

expect(firstDraft.cards.map((offer) => offer.slotId)).toEqual(["travel", "role", "ink"]);
expect(firstDraft.cards.map((offer) => offer.card.id)).toEqual(secondDraft.cards.map((offer) => offer.card.id));
expect(firstDraft.cards.map((offer) => offer.card.id)).not.toEqual(variantDraft.cards.map((offer) => offer.card.id));
expect(firstDraft.relics.map((offer) => offer.slotId)).toEqual(["utility", "role", "premium"]);
expect(firstDraft.relics.find((offer) => offer.slotId === "role")?.relic.character).toBe("zhaoyun");
```

- [ ] **Step 2: Extend the shop Playwright flow**

In `tests/e2e/playable-flow.spec.ts`, inside `shops can add relics after the first battle`, replace the fixed stock-id checks with slot-based assertions such as:

```ts
await expect(page.getByTestId("shop-card-travel")).toContainText("行旅常备");
await expect(page.getByTestId("shop-card-role")).toContainText("门路秘招");
await expect(page.getByTestId("shop-card-ink")).toContainText("偏门异货");
await expect(page.getByTestId("shop-relic-role")).toContainText("角色法门");
await expect(page.getByTestId("shop-relic-premium")).toContainText("压箱珍藏");
```

- [ ] **Step 3: Verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/run/run-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics"
```

Expected: FAIL because `createShopDraft`, slot ids, and slot-based DOM do not exist yet.

## Task 2: Implement Pure Shop Draft Selection

- [ ] **Step 1: Add a system-level shop draft helper**

In `src/game/systems/run/run.ts`, add a pure exported helper:

```ts
export function createShopDraft(run: RunState): ShopDraft {
  const seed = Math.abs(run.mapSeed) + run.rewardHistory.length + run.completedChapterIds.length * 17;
  return {
    cards: [
      createShopCardOffer("travel", "行旅常备", "补气护身，稳住行程。", SHOP_TRAVEL_CARD_POOL, seed),
      createShopCardOffer("role", "门路秘招", "照顾当前角色的拿牌方向。", getRoleRewardPool(run.characterId), seed + 3),
      createShopCardOffer("ink", "偏门异货", "更冒险也更有记忆点。", SHOP_INK_CARD_POOL, seed + 7)
    ],
    relics: [
      createShopRelicOffer("utility", "江湖旧物", "泛用稳妥，谁都能用。", getNeutralShopRelicPool(run), seed),
      createShopRelicOffer("role", "角色法门", "更贴近当下流派。", getRoleShopRelicPool(run), seed + 5),
      createShopRelicOffer("premium", "压箱珍藏", "贵，但值得围着它构筑。", getPremiumShopRelicPool(run), seed + 11)
    ]
  };
}
```

Keep selection deterministic, de-duplicate repeated ids across slots, and fall back to the broader shop pool when a category pool is too small.

- [ ] **Step 2: Keep economy unchanged**

- Card price remains `35`.
- Relic prices still come from content data.
- Card removal service remains `50`.
- No save format changes are needed because the stock is derived from existing run state.

## Task 3: Render The New Shop Slots

- [ ] **Step 1: Replace hard-coded stock in `renderShop`**

Use `createShopDraft(run)` and render the returned slot metadata directly:

```ts
const shopDraft = createShopDraft(run);

for (const offer of shopDraft.cards) {
  list.append(createShopCardAction(run, offer, () => { ... }));
}

for (const offer of shopDraft.relics) {
  relicList.append(createShopRelicAction(run, offer, owned, () => { ... }));
}
```

- [ ] **Step 2: Add visible slot labels and notes**

Each card/relic offer should show:

- slot label, for example `行旅常备`
- one-line note, for example `补气护身，稳住行程。`
- existing price and card/relic detail surfaces

- [ ] **Step 3: Keep existing removal service flow**

Do not change deck-removal rules or leave-shop flow in this wave.

## Task 4: Verify And Record

- [ ] **Step 1: Focused tests**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/run/run-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics"
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

Record:

- docs/files read before this wave
- plan commit and implementation commit hashes
- focused RED result and final GREEN result
- screenshot path for the updated shop surface
- remaining risks around repeated card purchases still being allowed within a single shop visit
