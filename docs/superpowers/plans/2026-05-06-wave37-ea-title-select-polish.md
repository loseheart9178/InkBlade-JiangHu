# Wave 37 EA Title And Character Select Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first playable screen feel like an EA showcase by giving the title and four-character selection surface clear paper/ink hierarchy and role identity.

**Architecture:** Keep this wave presentation-only. `src/app/appShell.ts` owns static title/character-select DOM, `src/styles/theme.css` owns visual hierarchy, and `tests/e2e/visual-smoke.spec.ts` owns desktop browser screenshot and layout assertions.

**Tech Stack:** TypeScript DOM creation, CSS, Playwright visual smoke, Vite.

---

## Files

- Modify `src/app/appShell.ts`: add presentation-only character metadata and richer accessible character button contents.
- Modify `src/styles/theme.css`: polish title layout and character cards using existing ink/paper palette.
- Modify `tests/e2e/visual-smoke.spec.ts`: add title-surface visual smoke and text-fit assertions.
- Modify `Documentation.md`: record planning, RED/GREEN results, verification, and next step.

## Acceptance Criteria

- [ ] Title screen exposes a compact showcase kicker without Steam, storefront, or release copy.
- [ ] Each character button still uses `data-testid="character-${id}"` and remains clickable.
- [ ] Character buttons show name, resource, mechanic identity, HP, and deck size.
- [ ] Selected character keeps a visible selected state.
- [ ] Desktop title actions do not overlap the character grid.
- [ ] Character card text does not overflow at the default desktop viewport.
- [ ] Focused Playwright title visual smoke captures a screenshot.

## Task 1: RED Browser Visual Smoke

**Files:**

- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] **Step 1: Add title-surface test**

Append this test near the other visual-smoke tests:

```ts
test("title character select presents four readable EA role cards", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.getByTestId("title-kicker")).toContainText("水墨武侠");

  const expectedCards = [
    { id: "zhaoyun", resource: "枪势", mechanic: /破阵|连攻/, stats: /生命 82/ },
    { id: "diaochan", resource: "舞势", mechanic: /魅惑|闪避/, stats: /生命 68/ },
    { id: "caiwenji", resource: "音律", mechanic: /净化|余韵/, stats: /生命 72/ },
    { id: "zhugeliang", resource: "筹策", mechanic: /观星|布阵/, stats: /生命 66/ }
  ] as const;

  for (const character of expectedCards) {
    const card = page.getByTestId(`character-${character.id}`);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("type", "button");
    await expect(card.getByTestId(`character-name-${character.id}`)).toBeVisible();
    await expect(card.getByTestId(`character-resource-${character.id}`)).toContainText(character.resource);
    await expect(card.getByTestId(`character-mechanic-${character.id}`)).toContainText(character.mechanic);
    await expect(card.getByTestId(`character-stats-${character.id}`)).toContainText(character.stats);
  }

  await expect(page.getByTestId("character-zhaoyun")).toHaveClass(/is-selected/);
  await expectTitleSurfaceLayout(page);
  await capturePlaytestScreenshot(page, testInfo, "title-character-select-desktop.png");
});
```

- [ ] **Step 2: Add layout helpers**

Append these helpers at the bottom of `tests/e2e/visual-smoke.spec.ts`:

```ts
async function expectTitleSurfaceLayout(page: Page): Promise<void> {
  const actions = await page.locator(".title-actions").boundingBox();
  const characterCards = await page.locator(".character-choice").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
        scrollHeight: card.scrollHeight,
        clientHeight: card.clientHeight
      };
    })
  );

  expect(actions).not.toBeNull();
  expect(characterCards).toHaveLength(4);

  for (const card of characterCards) {
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth + 1);
    expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight + 1);
    expect(rectsOverlap(card, actions!)).toBe(false);
  }
}
```

- [ ] **Step 3: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "title character select"
```

Expected: FAIL because `title-kicker`, `character-resource-*`, `character-mechanic-*`, and `character-stats-*` do not exist yet.

- [ ] **Step 4: Commit test slice**

```bash
git add tests/e2e/visual-smoke.spec.ts
git commit -m "test: cover title character select polish"
```

## Task 2: Title And Character Select DOM/CSS

**Files:**

- Modify: `src/app/appShell.ts`
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Add presentation metadata**

In `src/app/appShell.ts`, add a local map above `createAppShell`:

```ts
const characterChoiceCopy: Record<string, { role: string; mechanic: string; motif: string }> = {
  zhaoyun: {
    role: "白龙枪胆",
    mechanic: "破阵连攻",
    motif: "孤勇护主"
  },
  diaochan: {
    role: "闭月舞影",
    mechanic: "魅惑闪避",
    motif: "宫灯离间"
  },
  caiwenji: {
    role: "胡笳琴心",
    mechanic: "净化余韵",
    motif: "琴音续势"
  },
  zhugeliang: {
    role: "卧龙星盘",
    mechanic: "观星布阵",
    motif: "借风控局"
  }
};
```

- [ ] **Step 2: Add title kicker**

After the subtitle paragraph is created, add:

```ts
const kicker = document.createElement("p");
kicker.className = "title-kicker";
kicker.dataset.testid = "title-kicker";
kicker.textContent = "水墨武侠卡牌构筑 Roguelike";
```

Append `kicker` before `title`.

- [ ] **Step 3: Replace plain character button text with structured spans**

Inside the `for (const [index, character] of characterList.entries())` loop, after assigning classes/test ids, replace `characterButton.textContent = character.name;` with:

```ts
const copy = characterChoiceCopy[character.id];
const name = document.createElement("span");
name.className = "character-choice-name";
name.dataset.testid = `character-name-${character.id}`;
name.textContent = character.name;

const role = document.createElement("span");
role.className = "character-choice-role";
role.textContent = copy.role;

const resource = document.createElement("span");
resource.className = "character-choice-resource";
resource.dataset.testid = `character-resource-${character.id}`;
resource.textContent = `${character.resource.name} ${character.resource.initial}/${character.resource.max}`;

const mechanic = document.createElement("span");
mechanic.className = "character-choice-mechanic";
mechanic.dataset.testid = `character-mechanic-${character.id}`;
mechanic.textContent = `${copy.mechanic} · ${copy.motif}`;

const stats = document.createElement("span");
stats.className = "character-choice-stats";
stats.dataset.testid = `character-stats-${character.id}`;
stats.textContent = `生命 ${character.maxHp} · 牌组 ${character.starterDeck.length}`;

characterButton.setAttribute("aria-label", `${character.name}，${copy.role}，${character.resource.name}，${copy.mechanic}`);
characterButton.replaceChildren(name, role, resource, mechanic, stats);
```

- [ ] **Step 4: Apply title CSS**

Update `src/styles/theme.css` title section so `.title-screen` is wider and the character grid is stable:

```css
.title-screen {
  position: absolute;
  top: 7vh;
  left: 7vw;
  display: grid;
  width: min(780px, 86vw);
  max-width: min(780px, 86vw);
  gap: 16px;
  padding: 24px 0 24px 24px;
  border-left: 5px solid #b7352a;
  color: #2c2924;
}

.title-kicker {
  width: fit-content;
  margin: 0;
  padding: 5px 10px;
  border: 1px solid rgba(47, 124, 110, 0.36);
  border-radius: 999px;
  color: #f6ecd5;
  background: rgba(47, 124, 110, 0.88);
  font-size: 13px;
  line-height: 1.2;
}
```

- [ ] **Step 5: Apply character card CSS**

Replace the existing `.character-select`, `.character-choice`, and `.character-choice.is-selected` styles with a two-column card grid:

```css
.character-select {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 10px;
  margin: 0 0 10px;
}

.character-choice {
  position: relative;
  display: grid;
  min-height: 118px;
  align-content: start;
  gap: 5px;
  padding: 12px 14px;
  overflow: hidden;
  border: 1px solid rgba(44, 41, 36, 0.34);
  border-left: 4px solid rgba(47, 124, 110, 0.76);
  border-radius: 8px;
  color: #2c2924;
  text-align: left;
  background:
    linear-gradient(180deg, rgba(255, 252, 239, 0.9), rgba(239, 226, 195, 0.78)),
    rgba(246, 236, 213, 0.86);
  box-shadow: 0 10px 24px rgba(17, 17, 17, 0.14);
  cursor: pointer;
}

.character-choice.is-selected {
  border-color: rgba(183, 53, 42, 0.68);
  border-left-color: #b7352a;
  color: #2c2924;
  background:
    linear-gradient(180deg, rgba(255, 252, 239, 0.96), rgba(239, 226, 195, 0.9)),
    rgba(246, 236, 213, 0.96);
  box-shadow:
    0 14px 30px rgba(17, 17, 17, 0.2),
    inset 0 0 0 1px rgba(183, 53, 42, 0.18);
}
```

Add compact child styles:

```css
.character-choice-name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}

.character-choice-role,
.character-choice-resource,
.character-choice-mechanic,
.character-choice-stats {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-choice-role {
  color: #b7352a;
  font-size: 13px;
  font-weight: 700;
}

.character-choice-resource,
.character-choice-stats {
  color: rgba(44, 41, 36, 0.72);
  font-size: 12px;
}

.character-choice-mechanic {
  color: rgba(44, 41, 36, 0.86);
  font-size: 13px;
}
```

- [ ] **Step 6: Run focused browser test**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "title character select"
```

Expected: PASS, 1 browser test.

- [ ] **Step 7: Commit UI slice**

```bash
git add src/app/appShell.ts src/styles/theme.css
git commit -m "feat: polish title character select"
```

## Task 3: Integration Verification And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Run integration checks**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

Expected: all pass.

- [ ] **Step 2: Update Documentation.md**

Record:

- Docs read.
- Design/plan paths.
- Subagent branches and commits.
- RED result and final GREEN result.
- Full verification commands.
- Remaining risk: this wave improves first-screen presentation only, not all non-combat screens.

- [ ] **Step 3: Commit integration**

```bash
git add Documentation.md src/app/appShell.ts src/styles/theme.css tests/e2e/visual-smoke.spec.ts
git commit -m "feat: polish ea title surface"
```
