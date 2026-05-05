# Wave 33 EA Combat Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the combat screen expose enemy intent detail and current build context clearly enough for first-time desktop playtesters.

**Architecture:** Keep combat rules and intent execution in `src/game/systems/combat/`. This wave only renders existing combat state through DOM helpers and CSS in `src/app/inkbladeController.ts` and `src/styles/theme.css`.

**Tech Stack:** TypeScript DOM rendering, CSS custom properties, Playwright.

---

## File Structure

- Modify `tests/e2e/playable-flow.spec.ts`: add assertions and screenshot coverage for combat intent/build readability.
- Modify `src/app/inkbladeController.ts`: render structured intent title/detail/chips and a compact combat build readout.
- Modify `src/styles/theme.css`: style the structured intent box and combat build readout without covering the playfield.
- Modify `Documentation.md`: record docs read, implementation notes, verification, gaps, and next step.

## Acceptance Criteria

- [ ] Enemy intent is still visible in the top bar, but now includes `combat-intent-title`, `combat-intent-detail`, and `combat-intent-chip` elements.
- [ ] Attack intents expose damage detail such as `造成6点伤害。` in visible text, not only `title` or `aria-label`.
- [ ] Combat screen exposes a compact `combat-build-readout` with active relic names and method status.
- [ ] Diao Chan combat still surfaces `闭月香囊` in combat feedback and now also surfaces it in the build readout.
- [ ] Desktop Playwright captures `wave33-combat-readability.png`.
- [ ] No combat rules, enemy AI, card effects, relic effects, or balance numbers change.

## Task 1: Add Browser Expectations

- [ ] **Step 1: Update Zhao Yun first-combat test**

In `tests/e2e/playable-flow.spec.ts`, change `boots, enters a Zhao Yun battle, wins, and returns to the route map` to accept `testInfo`, then assert after combat loads:

```ts
await expect(page.getByTestId("combat-intent-title")).toContainText("杀意");
await expect(page.getByTestId("combat-intent-detail")).toContainText("造成6点伤害。");
await expect(page.getByTestId("combat-intent-chip").first()).toContainText("伤害 6");
await expect(page.getByTestId("combat-build-readout")).toContainText("法宝 白龙枪缨");
await expect(page.getByTestId("combat-build-readout")).toContainText("心法 未定");
await capturePlaytestScreenshot(page, testInfo, "wave33-combat-readability.png");
```

- [ ] **Step 2: Update Diao Chan relic combat test**

In `Diao Chan starting relic applies charm and weak at combat start`, add:

```ts
await expect(page.getByTestId("combat-build-readout")).toContainText("法宝 闭月香囊");
await expect(page.getByTestId("combat-intent-detail")).toBeVisible();
```

- [ ] **Step 3: Verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "Zhao Yun battle|Diao Chan starting relic"
```

Expected: FAIL because the structured intent and build readout elements do not exist yet.

## Task 2: Render Structured Combat Readability

- [ ] **Step 1: Replace plain intent text with structured markup**

Modify `createIntent` so it uses existing `describeIntent(intent)` and new helper functions:

```ts
box.innerHTML = `
  <span class="combat-intent-kicker">敌意</span>
  <strong data-testid="combat-intent-title">${escapeHtml(formatIntentTitle(intent))}</strong>
  <span class="combat-intent-detail" data-testid="combat-intent-detail">${escapeHtml(intentDetail)}</span>
  <span class="combat-intent-chips">${formatIntentChips(intent).map(createIntentChipMarkup).join("")}</span>
`;
```

- [ ] **Step 2: Add intent helper functions near `describeIntent`**

```ts
function formatIntentTitle(intent: CombatState["enemies"][number]["currentIntent"]): string {
  if (intent.type === "attack") {
    return intent.hits > 1 ? `杀意 ${intent.damage}x${intent.hits}` : `杀意 ${intent.damage}`;
  }
  if (intent.type === "block") {
    return `运功 ${intent.block}`;
  }
  if (intent.type === "special") {
    return intent.name;
  }
  return "观望";
}

function formatIntentChips(intent: CombatState["enemies"][number]["currentIntent"]): string[] {
  if (intent.type === "attack") {
    return [`伤害 ${intent.damage}`, `${intent.hits}段`];
  }
  if (intent.type === "block") {
    return [`护甲 ${intent.block}`];
  }
  if (intent.type === "special") {
    return intent.effects.slice(0, 3).map(formatIntentEffectChip);
  }
  return ["无行动"];
}
```

- [ ] **Step 3: Add build readout**

Create `createCombatBuildReadout(run, combat)` and append it after the top bar:

```ts
panel.append(top, createCombatBuildReadout(run, combat), field, ...);
```

The helper should render:

```ts
const relicNames = combat.relicIds.map((id) => relicsById[id]?.name ?? id).slice(0, 4).join("、") || "未持有";
const methodNames = getRunMethods(run).map((method) => method.name).slice(0, 3).join("、") || "未定";
```

With markup:

```ts
readout.dataset.testid = "combat-build-readout";
readout.innerHTML = `
  <span><b>法宝</b> ${escapeHtml(relicNames)}</span>
  <span><b>心法</b> ${escapeHtml(methodNames)}</span>
  <span><b>招式链</b> ${escapeHtml(formatComboTrail(combat))}</span>
`;
```

## Task 3: Style Combat Readability

- [ ] **Step 1: Style structured intent box**

Add CSS:

```css
.intent-box {
  display: grid;
  gap: 3px;
  min-width: 176px;
  max-width: 240px;
  padding: 8px 12px;
}
```

Add chip/detail styles for `.combat-intent-kicker`, `.combat-intent-detail`, `.combat-intent-chips`, and `.combat-intent-chip`.

- [ ] **Step 2: Style compact build readout**

Add CSS:

```css
.combat-build-readout {
  position: absolute;
  top: 94px;
  right: 50%;
  z-index: 5;
  display: flex;
  gap: 8px;
  max-width: min(760px, 72vw);
  transform: translateX(50%);
}
```

Keep it compact and above the playfield, below the top meter bar.

## Task 4: Verify And Record

- [ ] **Step 1: Focused Playwright**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "Zhao Yun battle|Diao Chan starting relic"
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

Record the screenshot path, verification outputs, no-rules-change decision, and next candidate milestone.
