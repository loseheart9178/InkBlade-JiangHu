# Wave 45 Reward Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reward-fit explanations to card rewards so players understand whether each draft choice reinforces, pivots, covers, or risks their current build.

**Architecture:** A pure `rewardFit` helper derives fit labels from current deck archetype analysis and reward card metadata. The app controller adapts current run cards and reward cards to that helper and renders DOM/CSS chips. Reward generation, combat rules, save data, and Phaser remain untouched.

**Tech Stack:** TypeScript, Vitest, Playwright, DOM/CSS.

---

## Files

- Create `src/game/systems/deck/rewardFit.ts`: pure reward-fit derivation.
- Create `tests/deck/reward-fit.test.ts`: unit coverage for fit outcomes.
- Modify `src/app/inkbladeController.ts`: render reward-fit chips/details on reward cards.
- Modify `src/styles/theme.css`: style reward-fit chips.
- Modify `tests/e2e/playable-flow.spec.ts`: assert reward-fit UI in the existing Zhao Yun reward flow.
- Modify `Documentation.md`: record planning and implementation status.

## Acceptance Criteria

- [ ] `createRewardBuildFit(currentDeck, rewardCard)` returns stable labels without mutating input.
- [ ] Main-archetype cards return `顺势精进`.
- [ ] Off-archetype tagged cards return `另开支路`.
- [ ] Ink cards return `墨灾取势`.
- [ ] Untagged defensive or draw utility cards return `补足周旋`.
- [ ] Empty-deck rewards return `开局定向`.
- [ ] Reward cards render `data-testid="reward-build-fit"` and `data-testid="reward-build-fit-detail"`.
- [ ] Existing reward role, reward reason, combo-biased mark, and card selection behavior remain unchanged.
- [ ] No reward-generation weights, combat rules, persistence, Steam/platform, analytics, release packaging, new art, or mobile work is introduced.

## Task 1: Pure Reward Fit Helper

**Files:**

- Create: `src/game/systems/deck/rewardFit.ts`
- Create: `tests/deck/reward-fit.test.ts`

- [ ] **Step 1: Write failing reward-fit tests**

Create `tests/deck/reward-fit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { createRewardBuildFit } from "../../src/game/systems/deck/rewardFit";

describe("reward build fit", () => {
  const zhaoSpearDeck = [cardsById.zhao_thrust, cardsById.zhao_white_dragon, cardsById.zhao_break_spear];

  it("labels matching archetype rewards as mainline reinforcement", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.zhao_seven_entries);

    expect(fit.label).toBe("顺势精进");
    expect(fit.tone).toBe("main");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("labels different archetype rewards as branch pivots", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.zhao_guardian);

    expect(fit.label).toBe("另开支路");
    expect(fit.tone).toBe("branch");
    expect(fit.detail).toContain("护主防反流");
  });

  it("labels ink cards as risk power", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.ink_moren);

    expect(fit.label).toBe("墨灾取势");
    expect(fit.tone).toBe("risk");
    expect(fit.detail).toContain("墨痕");
  });

  it("labels untagged utility as coverage", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.common_tuna);

    expect(fit.label).toBe("补足周旋");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("技法");
  });

  it("labels empty-deck rewards as opening direction without mutating inputs", () => {
    const deck: typeof zhaoSpearDeck = [];
    const originalDeckIds = deck.map((card) => card.id);
    const fit = createRewardBuildFit([], cardsById.zhao_thrust);

    expect(fit.label).toBe("开局定向");
    expect(fit.tone).toBe("utility");
    expect(deck.map((card) => card.id)).toEqual(originalDeckIds);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts --reporter=dot
```

Expected: FAIL because `rewardFit.ts` does not exist.

- [ ] **Step 3: Add reward-fit helper**

Create `src/game/systems/deck/rewardFit.ts`:

```ts
import type { CardDefinition, CardType } from "../combat/types";
import { ARCHETYPE_LABELS, analyzeDeckArchetypes } from "./archetype";

export type RewardBuildFitTone = "main" | "branch" | "utility" | "risk";

export interface RewardBuildFit {
  label: string;
  detail: string;
  tone: RewardBuildFitTone;
}

const TYPE_LABELS: Record<CardType, string> = {
  attack: "攻击",
  skill: "技法",
  body: "身法",
  power: "心法",
  mind: "心境",
  ink: "墨灾"
};

export function createRewardBuildFit(currentDeck: readonly CardDefinition[], rewardCard: CardDefinition): RewardBuildFit {
  const deck = [...currentDeck].filter((card): card is CardDefinition => Boolean(card));
  const analysis = analyzeDeckArchetypes(deck);
  const rewardArchetypes = rewardCard.archetypes ?? [];

  if (rewardCard.types.includes("ink") || rewardCard.rarity === "ink") {
    return {
      label: "墨灾取势",
      detail: "高收益武学，但会牵动墨痕与结局风险。",
      tone: "risk"
    };
  }

  if (!analysis.top) {
    return {
      label: "开局定向",
      detail: rewardArchetypes.length > 0 ? `可向${formatArchetypeLabels(rewardArchetypes)}成型。` : `提供${formatCardTypes(rewardCard.types)}基础能力。`,
      tone: "utility"
    };
  }

  if (rewardArchetypes.includes(analysis.top.id)) {
    return {
      label: "顺势精进",
      detail: `继续强化${analysis.top.label}。`,
      tone: "main"
    };
  }

  if (rewardArchetypes.length > 0) {
    return {
      label: "另开支路",
      detail: `可转向${formatArchetypeLabels(rewardArchetypes)}。`,
      tone: "branch"
    };
  }

  return {
    label: "补足周旋",
    detail: `补充${formatCardTypes(rewardCard.types)}能力，缓解当前牌组短板。`,
    tone: "utility"
  };
}

function formatArchetypeLabels(archetypes: readonly string[]): string {
  return archetypes.map((id) => ARCHETYPE_LABELS[id as keyof typeof ARCHETYPE_LABELS] ?? id).join("、");
}

function formatCardTypes(types: readonly CardType[]): string {
  return types.map((type) => TYPE_LABELS[type]).join("、");
}
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts tests/deck/archetype-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/game/systems/deck/rewardFit.ts tests/deck/reward-fit.test.ts
git commit -m "feat: add reward build fit"
```

## Task 2: Reward Fit UI

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser assertions**

In `tests/e2e/playable-flow.spec.ts`, extend the Zhao Yun reward section after the existing `reward-archetype-role` assertion:

```ts
await expect(page.getByTestId("reward-build-fit").first()).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
await expect(page.getByTestId("reward-build-fit-detail").first()).toContainText(/流|技法|攻击|墨痕|成型|短板/);
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle" --project=chromium
```

Expected: FAIL because reward-fit chips are not rendered.

- [ ] **Step 3: Render reward-fit chips**

In `src/app/inkbladeController.ts`, import:

```ts
import { createRewardBuildFit } from "../game/systems/deck/rewardFit";
```

In `renderReward()`, store current cards:

```ts
const currentDeckCards = getRunCardDefinitions(run);
const archetypeAnalysis = analyzeDeckArchetypes(currentDeckCards);
```

Inside the reward-card loop:

```ts
const fit = createRewardBuildFit(currentDeckCards, card);
button.dataset.buildFitTone = fit.tone;
```

Add to the reward card markup near `reward-archetype-role`:

```html
<span class="reward-build-fit reward-build-fit--${fit.tone}" data-testid="reward-build-fit">${fit.label}</span>
<span class="reward-build-fit-detail" data-testid="reward-build-fit-detail">${fit.detail}</span>
```

- [ ] **Step 4: Add styles**

In `src/styles/theme.css`, near `.reward-archetype-role` and `.reward-reason`, add:

```css
.reward-build-fit,
.reward-build-fit-detail {
  justify-self: start;
  max-width: 100%;
}

.reward-build-fit {
  padding: 3px 8px;
  border: 1px solid rgba(44, 41, 36, 0.18);
  border-radius: 999px;
  color: #2c2924;
  background: rgba(255, 252, 239, 0.72);
  font-size: 12px;
}

.reward-build-fit--main {
  border-color: rgba(47, 124, 110, 0.36);
  color: #1f5b51;
  background: rgba(47, 124, 110, 0.1);
}

.reward-build-fit--branch {
  border-color: rgba(183, 53, 42, 0.3);
  color: #5f1d18;
  background: rgba(183, 53, 42, 0.08);
}

.reward-build-fit--risk {
  border-color: rgba(44, 41, 36, 0.38);
  color: #2c2924;
  background: rgba(44, 41, 36, 0.1);
}

.reward-build-fit-detail {
  color: rgba(44, 41, 36, 0.68);
  font-size: 12px;
  line-height: 1.35;
}
```

- [ ] **Step 5: Run focused UI checks**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle" --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts tests/deck/build-recap.test.ts tests/deck/archetype-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show reward build fit"
```

## Task 3: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run final verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/reward-fit.test.ts tests/deck/build-recap.test.ts tests/deck/archetype-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "boots, enters a Zhao Yun battle|ending summary records" --project=chromium
```

Expected: PASS.

- [ ] **Step 2: Update documentation**

Append a Wave 45 implementation entry to `Documentation.md` with docs read, changed files, verification, risks, and next step.

- [ ] **Step 3: Commit docs**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave45 reward fit"
```
