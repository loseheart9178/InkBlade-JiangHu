# Wave 30 EA Event Surface Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make event encounters feel closer to a commercial EA showcase by improving event scene variety, choice readability, and logbook unlock feedback in the desktop browser UI.

**Architecture:** Keep event rules in TypeScript systems and event data. The DOM controller renders event scenes, choice effect chips, and unlock feedback from existing event payloads; Phaser remains untouched. CSS adds reusable ink-wash scene variants and compact choice metadata without changing gameplay math.

**Tech Stack:** Vite, TypeScript, Phaser canvas background, DOM HUD/event overlays, CSS custom properties, Vitest, Playwright desktop browser screenshots.

---

## Scope

In scope:

- Add event effect chips to each event choice so players can scan rewards, costs, mind shifts, cards, upgrades, and ink risk before clicking.
- Expand `getEventScene` so Wave 29 events no longer collapse into generic ferry/bamboo/changan visuals.
- Add a concise logbook unlock message after event choices record a new fragment.
- Add desktop browser assertions and screenshot capture for Cai Wenji and Zhuge Liang event surfaces.
- Update `Documentation.md` with docs read, decisions, verification, and risks.

Out of scope:

- Steam/storefront/release packaging.
- New event mechanics or conditional choice rules.
- New generated bitmap assets. This wave reuses existing battlefield assets and CSS ink composition.
- Mobile-specific layout work.

## Files

- Modify: `src/app/inkbladeController.ts`
  - Render event-specific choice actions with effect chips.
  - Expand event scene metadata for score/star/road/contract/mirror variants.
  - Add logbook unlock count feedback after event resolution.
- Modify: `src/styles/theme.css`
  - Add compact effect chips and scene variants.
  - Tighten event choice readability while preserving desktop playfield clarity.
- Modify: `tests/e2e/playable-flow.spec.ts`
  - Add browser assertions and screenshot capture for Cai Wenji and Zhuge Liang event scenes.
- Modify: `Documentation.md`
  - Record Wave 30 planning, implementation, verification, and known risks.

## Task 1: Event Choice Readability Test

**Files:**
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Add failing browser assertions for effect chips and event scene classes**

Insert or replace the existing Cai Wenji event route test with:

```ts
test("Cai Wenji event route presents polished choice effects and logbook feedback", async ({ page }, testInfo) => {
  await startRun(page, "caiwenji");
  await page.getByTestId("map-node-event-1").click();

  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--score/);
  await expect(page.getByTestId("event-kicker")).toContainText("蔡文姬");
  await expect(page.getByTestId("event-effect-chip").first()).toBeVisible();
  await expect(page.getByTestId("event-effect-chip").first()).toHaveAttribute("data-effect-tone", /gain|mind|ink|cost/);
  await expect(page.locator("[data-testid='event-effect-chip']").filter({ hasText: /获得|心境|墨灾|生命|铜钱/ }).first()).toBeVisible();

  await capturePlaytestScreenshot(page, testInfo, "wave30-caiwenji-event-surface.png");
  await page.locator("[data-testid^='event-choice-']").first().click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText(/墨录 \+1/)).toBeVisible();
  await expect(page.getByTestId("run-logbook")).toContainText("1");
});
```

Add a Zhuge Liang scene check:

```ts
test("Zhuge Liang event route uses a distinct star-board event scene", async ({ page }, testInfo) => {
  await startRun(page, "zhugeliang");
  await page.getByTestId("map-node-event-1").click();

  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--stars/);
  await expect(page.getByTestId("event-kicker")).toContainText("诸葛亮");
  await expect(page.locator("[data-testid='event-effect-chip']").filter({ hasText: /星门|悟|墨灾/ }).first()).toBeVisible();

  await capturePlaytestScreenshot(page, testInfo, "wave30-zhugeliang-event-surface.png");
});
```

- [ ] **Step 2: Run RED verification**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "polished choice effects|star-board event scene"
```

Expected: FAIL because `event-effect-chip`, `event-kicker` test id, and new scene classes do not exist yet.

## Task 2: Event Choice Markup And Unlock Feedback

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Replace generic event action rendering with event-specific markup**

Add helpers near `createAction`:

```ts
function createEventChoiceAction(choice: GameEventChoice, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-action choice-action--event";
  button.dataset.testid = `event-choice-${choice.id}`;
  button.innerHTML = `
    <strong>${choice.label}</strong>
    <span>${choice.summary}</span>
    <span class="event-effect-row">
      ${choice.effects.map(createEventEffectChipMarkup).join("")}
    </span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function createEventEffectChipMarkup(effect: EventChoiceEffect): string {
  const descriptor = describeEventEffect(effect);
  return `<span class="event-effect-chip event-effect-chip--${descriptor.tone}" data-testid="event-effect-chip" data-effect-tone="${descriptor.tone}">${descriptor.label}</span>`;
}
```

Add `describeEventEffect` with these exact mappings:

```ts
function describeEventEffect(effect: EventChoiceEffect): { label: string; tone: "gain" | "cost" | "ink" | "mind" | "upgrade" } {
  if (effect.type === "gold") {
    return effect.amount >= 0
      ? { label: `铜钱 +${effect.amount}`, tone: "gain" }
      : { label: `铜钱 ${effect.amount}`, tone: "cost" };
  }

  if (effect.type === "heal") {
    return { label: `生命 +${effect.amount}`, tone: "gain" };
  }

  if (effect.type === "hpLoss") {
    return { label: `生命 -${effect.amount}`, tone: "cost" };
  }

  if (effect.type === "card") {
    return { label: `获得 ${cardsById[effect.cardId]?.name ?? effect.cardId}`, tone: "gain" };
  }

  if (effect.type === "inkCardOffer") {
    return { label: `墨灾 ${cardsById[effect.cardId]?.name ?? effect.cardId}`, tone: "ink" };
  }

  if (effect.type === "removeStarter") {
    return { label: "删初始牌", tone: "upgrade" };
  }

  if (effect.type === "upgrade") {
    return { label: "精修牌", tone: "upgrade" };
  }

  return { label: `心境 ${formatMindLabel(effect.mind)} +${effect.amount}`, tone: "mind" };
}
```

Add:

```ts
function formatMindLabel(mind: Exclude<MindState, "none">): string {
  const labels: Record<Exclude<MindState, "none">, string> = {
    ning: "宁",
    nu: "怒",
    bei: "悲",
    mei: "魅",
    luan: "乱",
    wu: "悟"
  };
  return labels[mind];
}
```

- [ ] **Step 2: Wire unlock feedback into event resolution**

In `renderEvent`, replace the `createAction` event choice loop with `createEventChoiceAction`. Before `recordLogbookEvent`, read `getUnlockedLogbookEntries(run).length`; after recording, read it again and set:

```ts
const unlockedText = afterLogbookCount > beforeLogbookCount ? " · 墨录 +1" : "";
state.message = `${event.title}：${choice.label}${unlockedText}`;
```

- [ ] **Step 3: Add stable test ids to event kicker**

Change:

```html
<span class="event-kicker">${eventScene.kicker}</span>
```

to:

```html
<span class="event-kicker" data-testid="event-kicker">${eventScene.kicker}</span>
```

- [ ] **Step 4: Run focused Playwright**

Run the same command from Task 1.

Expected: Still FAIL until CSS scene keys are added, then PASS after Task 3.

## Task 3: Scene Metadata And CSS Polish

**Files:**
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Expand scene metadata**

Update `getEventScene`:

```ts
if (eventId.includes("qingyin") || eventId.includes("grave_song")) {
  return { key: "score", mark: "音", kicker: "蔡文姬 · 残谱" };
}

if (eventId.includes("star_board") || eventId.includes("empty_city")) {
  return { key: "stars", mark: "星", kicker: "诸葛亮 · 星盘" };
}

if (eventId.includes("inn") || eventId.includes("river_bones") || eventId.includes("mountain_pass") || eventId.includes("training_yard")) {
  return { key: "road", mark: "途", kicker: "江湖岔路" };
}

if (eventId.includes("seller_contract") || eventId.includes("name_register")) {
  return { key: "contract", mark: "契", kicker: "墨书契约" };
}

if (eventId.includes("cloud_water") || eventId.includes("heart_mirror") || eventId.includes("unwritten")) {
  return { key: "mirror", mark: "梦", kicker: "墨渊照心" };
}
```

- [ ] **Step 2: Add CSS scene variants and chips**

Append near existing event CSS:

```css
.event-scene--score {
  background:
    radial-gradient(circle at 40% 34%, rgba(47, 124, 110, 0.3), transparent 18%),
    linear-gradient(180deg, rgba(246, 236, 213, 0.08), rgba(17, 17, 17, 0.22)),
    url("/assets/generated/bamboo-battlefield-ink-pass.png") center / cover;
}

.event-scene--stars {
  background:
    radial-gradient(circle at 58% 30%, rgba(246, 236, 213, 0.32), transparent 14%),
    radial-gradient(circle at 34% 58%, rgba(47, 124, 110, 0.2), transparent 20%),
    url("/assets/generated/changan-battlefield-ink-pass.png") center / cover;
}

.event-scene--road {
  background:
    radial-gradient(circle at 38% 70%, rgba(246, 236, 213, 0.18), transparent 22%),
    linear-gradient(180deg, rgba(44, 41, 36, 0.08), rgba(17, 17, 17, 0.24)),
    url("/assets/generated/luoshui-battlefield-gpt.png") center / cover;
}

.event-scene--contract {
  background:
    radial-gradient(circle at 62% 38%, rgba(183, 53, 42, 0.28), transparent 18%),
    linear-gradient(180deg, rgba(17, 17, 17, 0.08), rgba(17, 17, 17, 0.3)),
    url("/assets/generated/changan-battlefield-ink-pass.png") center / cover;
}

.event-scene--mirror {
  background:
    radial-gradient(circle at 50% 52%, rgba(47, 124, 110, 0.26), transparent 22%),
    linear-gradient(180deg, rgba(246, 236, 213, 0.12), rgba(17, 17, 17, 0.28)),
    url("/assets/generated/moyuan-battlefield-ink-pass.png") center / cover;
}

.event-effect-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.event-effect-chip {
  padding: 4px 7px;
  border: 1px solid rgba(44, 41, 36, 0.2);
  border-radius: 999px;
  color: rgba(44, 41, 36, 0.78);
  background: rgba(255, 252, 239, 0.64);
  font-size: 12px;
  line-height: 1.2;
}

.event-effect-chip--gain,
.event-effect-chip--upgrade {
  border-color: rgba(47, 124, 110, 0.32);
  color: #2f7c6e;
}

.event-effect-chip--cost,
.event-effect-chip--ink {
  border-color: rgba(95, 29, 24, 0.32);
  color: #7f1f1a;
}

.event-effect-chip--mind {
  border-color: rgba(183, 53, 42, 0.28);
  color: #7f1f1a;
  background: rgba(183, 53, 42, 0.08);
}
```

- [ ] **Step 3: Run browser and CSS sanity**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "polished choice effects|star-board event scene|event route can upgrade|logbook opens"
```

Expected: PASS.

## Task 4: Verification And Documentation

**Files:**
- Modify: `Documentation.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
git diff --check
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "polished choice effects|star-board event scene|event route can upgrade|logbook opens"
```

Expected: all commands pass.

- [ ] **Step 2: Update `Documentation.md`**

Record:

- Docs read: `Prompt.md`, `Plan.md`, `Implement.md`, `Documentation.md`, PRD/core/world docs, Wave29 plan, `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/e2e/playable-flow.spec.ts`.
- Scope decision: event UI polish only; no new mechanics or Steam/release work.
- Implementation summary.
- Verification commands and results.
- Known risks: CSS scene variants reuse existing assets; mobile remains out of scope.

- [ ] **Step 3: Commit**

```bash
git add Documentation.md src/app/inkbladeController.ts src/styles/theme.css tests/e2e/playable-flow.spec.ts
git commit -m "feat: polish ea event surface"
```

## Acceptance Criteria

1. Cai Wenji and Zhuge Liang first event routes show distinct scene classes and character-specific kickers.
2. Every visible event choice shows compact effect chips for rewards, costs, mind shifts, upgrades, or ink risk.
3. Completing a newly unlocked event fragment surfaces `墨录 +1` in the map message and increments the run logbook count.
4. Focused Playwright captures event surface screenshots with non-trivial PNG size.
5. Full Vitest, TypeScript, build, and focused Playwright pass.
6. `Documentation.md` records the wave and verification evidence.

## Subagent Split

- Main integration worktree: plan, route coordination, docs, final verification, commit.
- Worker A `codex/wave30-event-markup`: `src/app/inkbladeController.ts` event markup and helpers.
- Worker B `codex/wave30-event-css`: `src/styles/theme.css` scene and chip polish.
- Worker C `codex/wave30-event-e2e`: `tests/e2e/playable-flow.spec.ts` browser assertions and screenshots.

If subagents stall again, the main integration thread should implement directly while preserving file boundaries.
