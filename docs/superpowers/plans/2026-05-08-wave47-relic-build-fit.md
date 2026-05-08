# Wave 47 Relic Build Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add build-fit guidance for shop relic offers so long-term passive purchases explain how they relate to the current deck.

**Architecture:** A pure relic-fit helper derives label/detail/tone from current deck archetype analysis and explicit relic metadata. The app controller adapts shop relic offers into this helper and renders DOM chips/details. CSS shares the existing build-fit tone palette. No relic trigger, economy, shop generation, combat, save, platform, art, or mobile code changes.

**Tech Stack:** TypeScript, Vitest, Playwright, DOM/CSS.

---

## Files

- Create `src/game/systems/relics/relicBuildFit.ts`: pure relic-fit derivation.
- Create `tests/relics/relic-build-fit.test.ts`: unit coverage for fit outcomes.
- Modify `src/app/inkbladeController.ts`: render shop relic-fit chips/details.
- Modify `src/styles/theme.css`: share build-fit tone styles with relic chips.
- Modify `tests/e2e/playable-flow.spec.ts`: assert shop relic-fit UI in the existing shop flow.
- Modify `Documentation.md`: record planning and implementation status.

## Acceptance Criteria

- [ ] `createRelicBuildFit(currentDeck, characterId, relic)` returns stable labels without mutating input.
- [ ] Matching current deck archetype relics return `流派共鸣`.
- [ ] Off-archetype same-character relics return `本命支路`.
- [ ] Ink-support relics return `墨灾奇物` and detail contains `墨痕`.
- [ ] Mind-state relics return `心境辅佐`.
- [ ] Generic relics return `通用稳固`.
- [ ] Empty-deck archetype relics return `开局法门`.
- [ ] Shop relic buttons render `data-testid="shop-relic-fit"` and `data-testid="shop-relic-fit-detail"`.
- [ ] Shop relic buttons expose `data-build-fit-tone`.
- [ ] Existing shop relic source/rarity text, trigger text, description, price chip, owned state, affordability state, and purchase behavior remain unchanged.
- [ ] No relic content, relic trigger, relic pool, shop generation, price, combat, persistence, Steam/platform, release packaging, art, or mobile work is introduced.

## Task 1: Pure Relic Fit Helper

**Files:**

- Create: `src/game/systems/relics/relicBuildFit.ts`
- Create: `tests/relics/relic-build-fit.test.ts`

- [ ] **Step 1: Write failing relic-fit tests**

Create `tests/relics/relic-build-fit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { relicsById } from "../../src/game/content/relics";
import { createRelicBuildFit } from "../../src/game/systems/relics/relicBuildFit";

describe("relic build fit", () => {
  const zhaoSpearDeck = [cardsById.zhao_thrust, cardsById.zhao_white_dragon, cardsById.zhao_break_spear];

  it("labels matching archetype relics as mainline resonance", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(fit.label).toBe("流派共鸣");
    expect(fit.tone).toBe("main");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("labels off-archetype same-character relics as character branches", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_white_cloak_knot);

    expect(fit.label).toBe("本命支路");
    expect(fit.tone).toBe("branch");
    expect(fit.detail).toContain("护主防反流");
  });

  it("labels ink-support relics as risk tools", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_black_paper_umbrella);

    expect(fit.label).toBe("墨灾奇物");
    expect(fit.tone).toBe("risk");
    expect(fit.detail).toContain("墨痕");
  });

  it("labels mind-state relics as utility support", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_silent_zither_string);

    expect(fit.label).toBe("心境辅佐");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("心境");
  });

  it("labels generic relics as stable utility", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_old_wooden_sword);

    expect(fit.label).toBe("通用稳固");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("所有流派");
  });

  it("labels empty-deck archetype relics as opening direction", () => {
    const fit = createRelicBuildFit([], "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(fit.label).toBe("开局法门");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("does not mutate the current deck while deriving fit", () => {
    const deck = [...zhaoSpearDeck];
    const originalDeckIds = deck.map((card) => card.id);

    createRelicBuildFit(deck, "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(deck.map((card) => card.id)).toEqual(originalDeckIds);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/relics/relic-build-fit.test.ts --reporter=dot
```

Expected: FAIL because `relicBuildFit.ts` does not exist.

- [ ] **Step 3: Add relic-fit helper**

Create `src/game/systems/relics/relicBuildFit.ts`:

```ts
import type { RelicDefinition } from "../../content/relics";
import type { CardArchetypeId, CardDefinition } from "../combat/types";
import { ARCHETYPE_LABELS, analyzeDeckArchetypes } from "../deck/archetype";

export type RelicBuildFitTone = "main" | "branch" | "utility" | "risk";

export interface RelicBuildFit {
  label: string;
  detail: string;
  tone: RelicBuildFitTone;
}

const CHARACTER_LABELS: Record<string, string> = {
  zhaoyun: "当前赵云机制",
  diaochan: "当前貂蝉机制",
  caiwenji: "当前蔡文姬机制",
  zhugeliang: "当前诸葛亮机制"
};

export function createRelicBuildFit(currentDeck: readonly CardDefinition[], characterId: string, relic: RelicDefinition): RelicBuildFit {
  const deck = [...currentDeck];
  const analysis = analyzeDeckArchetypes(deck);
  const text = `${relic.triggerText ?? ""}${relic.description}`;

  if (text.includes("墨痕") || text.includes("墨灾")) {
    return {
      label: "墨灾奇物",
      detail: "围绕墨痕收益运转，适合愿意承担墨灾风险的构筑。",
      tone: "risk"
    };
  }

  if (!analysis.top && relic.archetypeId) {
    return {
      label: "开局法门",
      detail: `可围绕${formatArchetypeLabel(relic.archetypeId)}开始定型。`,
      tone: "utility"
    };
  }

  if (analysis.top && relic.archetypeId === analysis.top.id) {
    return {
      label: "流派共鸣",
      detail: `继续强化${analysis.top.label}的长期节奏。`,
      tone: "main"
    };
  }

  if (relic.archetypeId) {
    return {
      label: relic.character === characterId ? "本命支路" : "另觅法门",
      detail: `可转向${formatArchetypeLabel(relic.archetypeId)}。`,
      tone: "branch"
    };
  }

  if (relic.character === characterId) {
    return {
      label: "本命法门",
      detail: `强化${CHARACTER_LABELS[characterId] ?? "当前角色机制"}。`,
      tone: "main"
    };
  }

  if (text.includes("心境")) {
    return {
      label: "心境辅佐",
      detail: "支持心境切换后的防守或节奏收益。",
      tone: "utility"
    };
  }

  return {
    label: "通用稳固",
    detail: "不挑流派，提供所有流派都能使用的长期收益。",
    tone: "utility"
  };
}

function formatArchetypeLabel(archetypeId: CardArchetypeId): string {
  return ARCHETYPE_LABELS[archetypeId] ?? archetypeId;
}
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/relics/relic-build-fit.test.ts tests/relics/relic-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/game/systems/relics/relicBuildFit.ts tests/relics/relic-build-fit.test.ts
git commit -m "feat: add relic build fit"
```

## Task 2: Shop Relic Fit UI

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser assertions**

In `tests/e2e/playable-flow.spec.ts`, inside `"shops can add relics after the first battle"`, add these assertions after the existing role relic price assertion:

```ts
await expect(page.getByTestId("shop-relic-fit")).toHaveCount(3);
await expect(roleRelic.getByTestId("shop-relic-fit")).toContainText(/流派共鸣|本命支路|本命法门|开局法门|通用稳固|墨灾奇物|心境辅佐/);
await expect(roleRelic.getByTestId("shop-relic-fit-detail")).toContainText(/流|机制|墨痕|心境|所有流派|长期/);
await expect(roleRelic).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);
```

Add these assertions after the existing premium relic note assertion:

```ts
await expect(premiumRelic.getByTestId("shop-relic-fit")).toContainText(/流派共鸣|本命支路|本命法门|开局法门|通用稳固|墨灾奇物|心境辅佐/);
await expect(premiumRelic.getByTestId("shop-relic-fit-detail")).toContainText(/流|机制|墨痕|心境|所有流派|长期/);
await expect(premiumRelic).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics" --project=chromium
```

Expected: FAIL because `shop-relic-fit` is not rendered.

- [ ] **Step 3: Render shop relic fit**

In `src/app/inkbladeController.ts`, import the helper:

```ts
import { createRelicBuildFit } from "../game/systems/relics/relicBuildFit";
```

Update `createShopRelicAction()`:

```ts
  const fit = createRelicBuildFit(getRunCardDefinitions(run), run.characterId, relic);
```

Set the dataset after affordability/owned datasets:

```ts
  button.dataset.buildFitTone = fit.tone;
```

Render the chip/detail after the relic description and before the price chip:

```ts
    <span class="shop-relic-fit shop-relic-fit--${fit.tone}" data-testid="shop-relic-fit">${escapeHtml(fit.label)}</span>
    <span class="shop-relic-fit-detail" data-testid="shop-relic-fit-detail">${escapeHtml(fit.detail)}</span>
```

- [ ] **Step 4: Share build-fit tone styles with relic fit**

In `src/styles/theme.css`, update the existing grouped selectors so relic fit classes share the same palette:

```css
.reward-build-fit,
.shop-build-fit,
.shop-relic-fit {
  ...
}

.reward-build-fit--main,
.shop-build-fit--main,
.shop-relic-fit--main {
  ...
}

.reward-build-fit--branch,
.shop-build-fit--branch,
.shop-relic-fit--branch {
  ...
}

.reward-build-fit--utility,
.shop-build-fit--utility,
.shop-relic-fit--utility {
  ...
}

.reward-build-fit--risk,
.shop-build-fit--risk,
.shop-relic-fit--risk {
  ...
}

.reward-build-fit-detail,
.shop-build-fit-detail,
.shop-relic-fit-detail {
  ...
}
```

Only add `.shop-relic-fit` and `.shop-relic-fit-detail` to the existing grouped selectors; do not duplicate the full declarations.

- [ ] **Step 5: Run focused verification**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics" --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/relics/relic-build-fit.test.ts tests/relics/relic-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show shop relic fit"
```

## Task 3: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run final verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/relics/relic-build-fit.test.ts tests/relics/relic-system.test.ts tests/deck/reward-fit.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "shops can add relics|boots, enters a Zhao Yun battle" --project=chromium
```

Expected: PASS.

- [ ] **Step 2: Update `Documentation.md`**

Add a Wave47 implementation entry with docs read, subagents used, changed files, verification output, known gaps, and next milestone.

- [ ] **Step 3: Commit documentation**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave47 relic build fit"
```
