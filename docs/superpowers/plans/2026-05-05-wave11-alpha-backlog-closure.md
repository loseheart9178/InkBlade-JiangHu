# Wave 11 Alpha Backlog Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining non-art alpha backlog by hardening final-choice affordances, combat glossary surfaces, and boot performance warning isolation.

**Architecture:** Keep gameplay and ending rules in TypeScript systems. DOM controller changes only adapt existing final-choice and glossary data into visible, testable UI metadata. Vite config changes explicitly document the already-lazy Phaser runtime chunk instead of changing gameplay boot semantics.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, DOM HUD, existing pure run/ending/glossary systems.

---

## Context And Constraints

Use the bundled Node runtime in every worktree:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/chapters/chapter_03.md`
- `docs/chapters/final_chapter.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/playtest/desktop-playtest-checklist.md`

Current Wave 10 baseline:

- Branch: `codex/wave10-card-fallback-zero`
- Vitest: 18 files / 186 tests
- Playwright desktop: 27 Chromium tests
- Asset audit: runtime references 159, missing 0, card fallback debt 0
- Known remaining non-art backlog: Plan milestones 59, 61, and 62 are unchecked even though the feature spine exists.

Implementation rules:

- Desktop browser only.
- Keep gameplay and ending rules outside renderer code.
- Use TDD for behavior changes.
- Worker branches may touch overlapping controller lines, but each task has a distinct acceptance surface and must commit independently before integration.
- Do not modify mobile layout.
- Do not attempt GPT Image 2 bitmap replacement in this wave; Milestone 58 remains a later art-quality pass.

## Task 1: Final Choice UI Acceptance Hardening

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Do not modify: `src/game/systems/endings/endings.ts`

- [ ] **Step 1: Write the failing browser assertions**

In `tests/e2e/playable-flow.spec.ts`, extend the existing `final boss route reaches ending and profile summary` test after `screen-final-choice` becomes visible:

```ts
await expect(page.getByTestId("screen-final-choice")).toHaveAttribute("data-final-choice-count", "4");
await expect(page.getByTestId("final-choice-option").filter({ hasText: "封印墨渊" })).toHaveAttribute("data-choice-eligible", "true");
await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toHaveAttribute("data-choice-eligible", "false");
await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toHaveAttribute("data-choice-requirement", /怒意足够/);
await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toContainText("未满足");
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
```

Expected: fails because final-choice buttons do not yet expose `data-choice-eligible`, `data-choice-requirement`, or `data-final-choice-count`.

- [ ] **Step 3: Implement minimal DOM metadata**

In `renderFinalChoice` in `src/app/inkbladeController.ts`:

```ts
const choices = getAvailableFinalChoices(run);
panel.dataset.finalChoiceCount = `${choices.length}`;
for (const choice of choices) {
  const button = createAction(choice.title, `${choice.summary} ${choice.eligible ? "" : `未满足：${choice.requirement}`}`, () => {
    ...
  });
  button.classList.add("final-choice-option");
  button.dataset.testid = "final-choice-option";
  button.dataset.choiceId = choice.id;
  button.dataset.choiceEligible = `${choice.eligible}`;
  button.dataset.choiceRequirement = choice.requirement;
  button.disabled = !choice.eligible;
  list.append(button);
}
```

Do not change final-choice eligibility rules.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: final boss route passes, TypeScript passes, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add src/app/inkbladeController.ts tests/e2e/playable-flow.spec.ts
git commit -m "test: harden final choice affordances"
```

## Task 2: Combat Status Glossary Surfaces

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Do not modify: `src/game/content/glossary.ts`

- [ ] **Step 1: Write the failing browser assertions**

In `tests/e2e/visual-smoke.spec.ts`, inside the desktop combat smoke test after a Diao Chan or first visible combat status is present, add:

```ts
await expect(page.getByTestId("status-badge").first()).toBeVisible();
await expect(page.getByTestId("status-badge").first()).toHaveAttribute("data-glossary-id", /status\./);
await expect(page.getByTestId("status-badge").first()).toHaveAttribute("title", /：/);
await expect(page.getByTestId("status-badge").first()).toHaveAttribute("aria-label", /：/);
```

If the existing smoke flow needs deterministic status setup, use Diao Chan's starting relic combat because it applies charm / weak at combat start.

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "desktop combat smoke"
```

Expected: fails because status text is plain text and no `status-badge` test id exists.

- [ ] **Step 3: Implement status badge markup**

In `formatStatusBadges` in `src/app/inkbladeController.ts`, replace plain text fragments with glossary-aware spans:

```ts
return ` · ${entries.map(([status, amount]) => {
  const entry = getGlossaryEntry(`status.${status}`);
  const label = formatStatus(status);
  const tooltip = entry ? formatGlossaryTooltip(entry, `${label} ${amount}层。`) : `${label} ${amount}`;
  return `<span class="status-badge" data-testid="status-badge" data-glossary-id="${escapeAttribute(entry?.id ?? `status.${status}`)}" title="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}">${escapeHtml(label)} ${amount}</span>`;
}).join(" · ")}`;
```

Keep `formatStatusBadges` returning a string so the current template call sites do not need structural rewrites.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "desktop combat smoke"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: visual smoke selection passes, TypeScript passes, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add src/app/inkbladeController.ts tests/e2e/visual-smoke.spec.ts
git commit -m "feat: add glossary metadata to status badges"
```

## Task 3: Boot Performance Warning Isolation

**Files:**

- Modify: `vite.config.ts`
- Modify: `tests/app-shell.test.ts`
- Do not modify: `src/app/gameApp.ts`

- [ ] **Step 1: Write the failing config assertion**

In `tests/app-shell.test.ts`, import the Vite config:

```ts
import viteConfig from "../vite.config";
```

Add this test:

```ts
it("documents the intentionally isolated lazy Phaser chunk budget", () => {
  expect(viteConfig.build?.chunkSizeWarningLimit).toBeGreaterThanOrEqual(1300);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-shell.test.ts --reporter=dot
```

Expected: fails because `build.chunkSizeWarningLimit` is undefined.

- [ ] **Step 3: Configure explicit lazy chunk budget**

In `vite.config.ts`, add:

```ts
  build: {
    // Phaser remains isolated behind the lazy runtime import; keep the warning budget explicit so build output only reports actionable regressions.
    chunkSizeWarningLimit: 1300
  },
```

Do not remove the existing lazy imports from `src/app/gameApp.ts`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-shell.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

Expected: app-shell test passes, Vite build passes without the previous chunk-size warning, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add vite.config.ts tests/app-shell.test.ts
git commit -m "chore: isolate lazy phaser chunk budget"
```

## Task 4: Integration, Docs, And Milestone Closure

**Files:**

- Modify: `Plan.md`
- Modify: `Documentation.md`
- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `docs/playtest/desktop-playtest-checklist.md`

- [ ] **Step 1: Merge worker branches**

Run from the Wave 11 integration branch:

```bash
git merge --no-edit codex/wave11-final-choice-affordance
git merge --no-edit codex/wave11-status-glossary-badges
git merge --no-edit codex/wave11-boot-warning-budget
```

Expected: code merges. If `src/app/inkbladeController.ts` conflicts, keep both final-choice dataset metadata and status-badge glossary markup.

- [ ] **Step 2: Update milestone checkboxes**

In `Plan.md`, mark these remaining shipped milestones complete:

```markdown
## Milestone 59: Final Choice And Character Epilogue

- [x] Add a final-choice screen after defeating `无名史官`.
- [x] Add eligible world-ending choices and character epilogue definitions for all four MVP characters.
- [x] Persist selected world ending and character epilogue into profile/run summary.

## Milestone 61: Keyword And Intent Glossary

- [x] Add data-driven glossary definitions for shipped statuses, card types, resources, combos, and enemy intents.
- [x] Surface desktop tooltip metadata on cards, enemy intents, and combo trail entries.
- [x] Cover glossary completeness and visual tooltip attributes with tests.

## Milestone 62: Boot Performance Split

- [x] Dynamically split the game runtime boot after the root shell mounts.
- [x] Preserve jsdom app-shell and browser boot behavior.
- [x] Review and document Vite chunk output, removing or isolating the existing large chunk warning where practical.
```

- [ ] **Step 3: Update release docs**

Record Wave 11 in `Documentation.md`, `README.md`, `docs/playtest/alpha-acceptance.md`, and `docs/playtest/desktop-playtest-checklist.md` with:

```text
Wave 11 scope: final-choice affordance metadata, status badge glossary metadata, and explicit lazy Phaser chunk budget.
Known art gap: Milestone 58 remains an optional GPT Image 2 bitmap card-art quality pass.
```

- [ ] **Step 4: Full release gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

Expected: all commands pass. Vite build should not print the previous chunk-size warning.

- [ ] **Step 5: Commit integration branch**

```bash
git add Plan.md Documentation.md README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md src/app/inkbladeController.ts tests/e2e/playable-flow.spec.ts tests/e2e/visual-smoke.spec.ts vite.config.ts tests/app-shell.test.ts public/assets/generated/asset-audit.json
git commit -m "feat: close wave11 alpha backlog"
```

## Follow-Up Round Seed

After Wave 11 is verified and committed, start the next autonomous planning loop from the remaining open backlog:

- Milestone 58 remains optional GPT Image 2 bitmap card-art quality replacement.
- If art generation is deferred, choose a low-conflict engineering milestone such as save/profile migration hardening, compendium UX depth, or simulator report artifact export.
