# Wave 43 Build Recap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic completed-run build recap so EA playtesters can understand what martial style their final deck became.

**Architecture:** Pure TypeScript in `src/game/systems/deck/buildRecap.ts` derives recap data from card definitions and optional run context. The app controller only adapts run state to that helper and renders DOM/CSS. No renderer or Phaser scene owns build analysis rules.

**Tech Stack:** TypeScript, Vitest, Playwright, DOM/CSS.

---

## Files

- Create `src/game/systems/deck/buildRecap.ts`: pure build recap derivation.
- Create `tests/deck/build-recap.test.ts`: unit coverage for deterministic summaries.
- Modify `src/app/inkbladeController.ts`: add recap data to completed-run summary and render a recap panel.
- Modify `src/styles/theme.css`: style the completed-run build recap.
- Modify `tests/e2e/playable-flow.spec.ts`: assert recap visibility in debug completed-run summary.
- Modify `Documentation.md`: record planning and implementation status.

## Acceptance Criteria

- [ ] `createDeckBuildRecap({ cards })` returns a stable unformed recap for an empty deck.
- [ ] Zhao Yun spear-chain decks report `连斩枪势流`, deterministic signature cards, and an attack-oriented tactical note.
- [ ] Mixed support decks still report card-type breakdown and support notes even without a strong archetype.
- [ ] Method, relic, and challenge names become support cues without mutating input arrays.
- [ ] Completed-run summary renders `data-testid="run-build-recap"`.
- [ ] Completed-run summary shows signature cards through `data-testid="run-build-signature-card"`.
- [ ] Existing `profile-goals-list`, `profile-run-ledger`, and ending summary tests continue to pass.
- [ ] No Steam/platform, analytics, release packaging, mobile, or new gameplay-rule code is introduced.

## Task 1: Pure Deck Build Recap System

**Files:**

- Create: `src/game/systems/deck/buildRecap.ts`
- Create: `tests/deck/build-recap.test.ts`

- [ ] **Step 1: Write failing build recap tests**

Create `tests/deck/build-recap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { createDeckBuildRecap } from "../../src/game/systems/deck/buildRecap";

describe("deck build recap", () => {
  it("returns a stable unformed recap for empty decks", () => {
    const recap = createDeckBuildRecap({ cards: [] });

    expect(recap.primaryLabel).toBe("尚未成型");
    expect(recap.signatureCards).toEqual([]);
    expect(recap.typeBreakdown).toContain("暂无武学");
    expect(recap.tacticalNotes).toContain("继续收集带有流派标签的武学。");
  });

  it("summarizes Zhao Yun spear-chain decks with signatures and attack pressure", () => {
    const cards = [
      cardsById.zhao_thrust,
      cardsById.zhao_white_dragon,
      cardsById.zhao_break_spear,
      cardsById.zhao_seven_entries,
      cardsById.zhao_guardian
    ];

    const recap = createDeckBuildRecap({
      cards,
      methodNames: ["龙胆连势"],
      relicNames: ["白龙枪缨"],
      challengeName: "墨潮压境"
    });

    expect(recap.primaryLabel).toBe("连斩枪势流");
    expect(recap.summary).toContain("4式");
    expect(recap.signatureCards).toEqual(["突刺", "白龙探爪", "破军枪", "七进七出"]);
    expect(recap.typeBreakdown[0]).toMatch(/^攻击 4式/);
    expect(recap.tacticalNotes).toContain("以攻击牌连续压迫敌阵。");
    expect(recap.supportSignals).toEqual(expect.arrayContaining(["心法 龙胆连势", "法宝 白龙枪缨", "试炼 墨潮压境"]));
  });

  it("keeps mixed decks readable without mutating inputs", () => {
    const cards = [cardsById.common_tuna, cardsById.common_qingshen, cardsById.common_xixin];
    const originalIds = cards.map((card) => card.id);
    const methods = ["长坂守心", "清音续谱", "八阵入门", "余音绕梁"];
    const relics = ["旧木剑", "清音玉", "断弦", "记忆竹简"];

    const recap = createDeckBuildRecap({ cards, methodNames: methods, relicNames: relics });

    expect(cards.map((card) => card.id)).toEqual(originalIds);
    expect(recap.primaryLabel).toBe("尚未成型");
    expect(recap.typeBreakdown).toEqual(expect.arrayContaining(["技法 2式", "心境 1式"]));
    expect(recap.signatureCards.length).toBeGreaterThan(0);
    expect(recap.supportSignals).toEqual(["心法 长坂守心、清音续谱、八阵入门", "法宝 旧木剑、清音玉、断弦"]);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/build-recap.test.ts --reporter=dot
```

Expected: FAIL because `src/game/systems/deck/buildRecap.ts` does not exist.

- [ ] **Step 3: Add the pure recap helper**

Create `src/game/systems/deck/buildRecap.ts`:

```ts
import type { CardArchetypeId, CardDefinition, CardType } from "../combat/types";
import { analyzeDeckArchetypes } from "./archetype";

export interface DeckBuildRecapInput {
  cards: readonly CardDefinition[];
  methodNames?: readonly string[];
  relicNames?: readonly string[];
  challengeName?: string;
}

export interface DeckBuildRecap {
  primaryLabel: string;
  summary: string;
  signatureCards: string[];
  typeBreakdown: string[];
  tacticalNotes: string[];
  supportSignals: string[];
}

const CARD_TYPE_LABELS: Record<CardType, string> = {
  attack: "攻击",
  skill: "技法",
  body: "身法",
  power: "心法",
  mind: "心境",
  ink: "墨灾"
};

const CARD_TYPE_ORDER: CardType[] = ["attack", "skill", "body", "power", "mind", "ink"];
const SIGNATURE_LIMIT = 4;
const SUPPORT_NAME_LIMIT = 3;

export function createDeckBuildRecap(input: DeckBuildRecapInput): DeckBuildRecap {
  const cards = [...input.cards].filter(Boolean);
  const analysis = analyzeDeckArchetypes(cards);
  const primaryLabel = analysis.top?.label ?? "尚未成型";
  const primaryCount = analysis.top?.cardCount ?? 0;
  const typeCounts = countCardTypes(cards);
  const typeBreakdown = formatTypeBreakdown(typeCounts);
  const signatureCards = selectSignatureCardNames(cards, analysis.top?.id);
  const supportSignals = createSupportSignals(input);
  const tacticalNotes = createTacticalNotes(typeCounts, Boolean(analysis.top), cards.length);

  return {
    primaryLabel,
    summary: analysis.top ? `${analysis.top.label} ${primaryCount}式，${typeBreakdown.slice(0, 2).join(" / ")}` : `尚未成型，${typeBreakdown.slice(0, 2).join(" / ")}`,
    signatureCards,
    typeBreakdown,
    tacticalNotes,
    supportSignals
  };
}

function countCardTypes(cards: readonly CardDefinition[]): Record<CardType, number> {
  const counts = Object.fromEntries(CARD_TYPE_ORDER.map((type) => [type, 0])) as Record<CardType, number>;
  for (const card of cards) {
    for (const type of card.types) {
      counts[type] += 1;
    }
  }
  return counts;
}

function formatTypeBreakdown(counts: Record<CardType, number>): string[] {
  const rows = CARD_TYPE_ORDER
    .filter((type) => counts[type] > 0)
    .map((type) => `${CARD_TYPE_LABELS[type]} ${counts[type]}式`);
  return rows.length > 0 ? rows : ["暂无武学"];
}

function selectSignatureCardNames(cards: readonly CardDefinition[], primaryArchetypeId?: CardArchetypeId): string[] {
  const primaryCards = primaryArchetypeId ? cards.filter((card) => card.archetypes?.includes(primaryArchetypeId)) : [];
  const nonStarterCards = cards.filter((card) => !primaryCards.includes(card) && card.rarity !== "starter");
  const starterCards = cards.filter((card) => !primaryCards.includes(card) && !nonStarterCards.includes(card));
  const ranked = [...primaryCards, ...nonStarterCards, ...starterCards];
  const names: string[] = [];
  for (const card of ranked) {
    if (!names.includes(card.name)) {
      names.push(card.name);
    }
    if (names.length >= SIGNATURE_LIMIT) {
      break;
    }
  }
  return names;
}

function createSupportSignals(input: DeckBuildRecapInput): string[] {
  const signals: string[] = [];
  const methodText = formatSupportNames(input.methodNames);
  const relicText = formatSupportNames(input.relicNames);
  if (methodText) {
    signals.push(`心法 ${methodText}`);
  }
  if (relicText) {
    signals.push(`法宝 ${relicText}`);
  }
  if (input.challengeName && input.challengeName !== "标准行旅") {
    signals.push(`试炼 ${input.challengeName}`);
  }
  return signals;
}

function formatSupportNames(names: readonly string[] | undefined): string | undefined {
  const clean = [...new Set((names ?? []).map((name) => name.trim()).filter(Boolean))].slice(0, SUPPORT_NAME_LIMIT);
  return clean.length > 0 ? clean.join("、") : undefined;
}

function createTacticalNotes(counts: Record<CardType, number>, hasArchetype: boolean, deckSize: number): string[] {
  if (deckSize === 0) {
    return ["继续收集带有流派标签的武学。"];
  }
  const notes: string[] = [];
  if (counts.attack >= Math.max(2, counts.skill)) {
    notes.push("以攻击牌连续压迫敌阵。");
  }
  if (counts.skill > counts.attack) {
    notes.push("以技法牌周旋、防反或控场。");
  }
  if (counts.ink > 0) {
    notes.push("借墨灾牌换取高收益。");
  }
  if (counts.mind > 0) {
    notes.push("用心境牌牵引战斗与结局倾向。");
  }
  if (!hasArchetype) {
    notes.push("继续收集带有流派标签的武学。");
  }
  return notes;
}
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/build-recap.test.ts tests/deck/archetype-system.test.ts --reporter=dot
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/game/systems/deck/buildRecap.ts tests/deck/build-recap.test.ts
git commit -m "feat: add deck build recap"
```

## Task 2: Completed-Run Build Recap UI

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing browser assertion**

In `tests/e2e/playable-flow.spec.ts`, extend the `"ending summary records and persists profile summary"` test after `await expect(page.getByTestId("character-epilogue-summary")).toBeVisible();` with:

```ts
await expect(page.getByTestId("run-build-recap")).toBeVisible();
await expect(page.getByTestId("run-build-primary")).toContainText(/尚未成型|流/);
await expect(page.getByTestId("run-build-signature-card").first()).toContainText(/枪击|架枪|龙胆|突刺/);
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "ending summary records" --project=chromium
```

Expected: FAIL because `run-build-recap` is not rendered.

- [ ] **Step 3: Add recap data to completed-run summary**

In `src/app/inkbladeController.ts`, import the helper:

```ts
import { createDeckBuildRecap, type DeckBuildRecap } from "../game/systems/deck/buildRecap";
```

Extend `CompletedRunSummaryView`:

```ts
  buildRecap: DeckBuildRecap;
```

In `completeRunWithEnding()`, before assigning `state.completedRunSummary`, derive:

```ts
const buildRecap = createDeckBuildRecap({
  cards: getRunCardDefinitions(run),
  methodNames: getRunMethods(run).map((method) => method.name),
  relicNames: run.relicIds.map((id) => relicsById[id]?.name ?? id),
  challengeName: resolveChallengeProfile(run.challengeId).name
});
```

Add `buildRecap` to the summary object.

- [ ] **Step 4: Render the recap panel**

Add a helper near `createProfileRunLedger()`:

```ts
function createRunBuildRecapPanel(recap: DeckBuildRecap): HTMLElement {
  const section = document.createElement("section");
  section.className = "run-build-recap";
  section.dataset.testid = "run-build-recap";

  const primary = document.createElement("div");
  primary.className = "run-build-primary";
  primary.dataset.testid = "run-build-primary";
  primary.innerHTML = `<span>本局流派</span><strong>${recap.primaryLabel}</strong><small>${recap.summary}</small>`;

  const signatures = document.createElement("div");
  signatures.className = "run-build-signatures";
  const signatureNames = recap.signatureCards.length > 0 ? recap.signatureCards : ["尚无代表招式"];
  for (const name of signatureNames) {
    const chip = document.createElement("span");
    chip.dataset.testid = "run-build-signature-card";
    chip.textContent = name;
    signatures.append(chip);
  }

  const details = document.createElement("div");
  details.className = "run-build-details";
  for (const line of [...recap.typeBreakdown, ...recap.tacticalNotes, ...recap.supportSignals]) {
    const item = document.createElement("span");
    item.textContent = line;
    details.append(item);
  }

  section.append(primary, signatures, details);
  return section;
}
```

In `renderRunSummary()`, create and append the recap:

```ts
const buildRecap = createRunBuildRecapPanel(summary.buildRecap);
panel.append(createMessage(state.message), ending, epilogue, stats, buildRecap, goals, ledger, restart);
```

- [ ] **Step 5: Add compact desktop CSS**

In `src/styles/theme.css`, near the run summary styles, add:

```css
.run-build-recap {
  display: grid;
  width: min(720px, 100%);
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(47, 124, 110, 0.28);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(47, 124, 110, 0.09), rgba(183, 53, 42, 0.07)),
    rgba(255, 252, 239, 0.76);
}

.run-build-primary {
  display: grid;
  gap: 3px;
}

.run-build-primary span,
.run-build-primary small {
  color: rgba(44, 41, 36, 0.68);
  font-size: 13px;
}

.run-build-primary strong {
  color: #5f1d18;
  font-size: 20px;
}

.run-build-signatures,
.run-build-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.run-build-signatures span,
.run-build-details span {
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid rgba(44, 41, 36, 0.16);
  border-radius: 999px;
  color: rgba(44, 41, 36, 0.78);
  background: rgba(255, 252, 239, 0.72);
  font-size: 12px;
}

.run-build-signatures span {
  border-color: rgba(183, 53, 42, 0.22);
  color: #5f1d18;
  background: rgba(183, 53, 42, 0.08);
}
```

- [ ] **Step 6: Run focused UI checks**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "ending summary records|run ledger|profile goals" --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: show run build recap"
```

## Task 3: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/deck/build-recap.test.ts tests/deck/archetype-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --project=chromium
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
```

Expected: PASS.

- [ ] **Step 2: Update documentation**

Append a `2026-05-07 Wave 43 build recap implementation` entry to `Documentation.md` with:

```md
## 2026-05-07 Wave 43 build recap implementation

Docs read:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/superpowers/specs/2026-05-07-wave43-build-recap-design.md`
- `docs/superpowers/plans/2026-05-07-wave43-build-recap.md`

What changed:

- Added pure deck build recap derivation for final-run martial style summaries.
- Added completed-run recap UI with primary build, signature cards, card-type cues, tactical notes, methods, relics, and challenge context.
- Added Vitest and Playwright coverage.

Known gaps / risks:

- The recap is local and explanatory only; it does not persist separate analytics or replay data.
- The helper uses current card archetype tags and card types, so future card batches should keep tags accurate.
- Desktop layout is in scope; mobile remains paused.
```

- [ ] **Step 3: Commit docs**

Run:

```bash
git add Documentation.md
git commit -m "docs: record wave43 build recap"
```
