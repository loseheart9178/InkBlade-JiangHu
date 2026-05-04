# Wave 8 Content And Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for implementation work and keep each task in an isolated worktree. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the next autonomous content/release wave on top of the verified Wave 7 + observed bugfix branch: complete all-four-character growth support, deepen event replayability, broaden deterministic balance evidence, and prepare desktop playtest/release handoff docs.

**Architecture:** Pure TypeScript systems remain authoritative for run state, combat, events, methods, relics, balance simulation, and release evidence. `src/app/inkbladeController.ts` only adapts system outputs into DOM. Phaser remains a battlefield adapter. Desktop browser is the only active UI target for this wave.

**Tech Stack:** TypeScript, Vite, Phaser, Vitest, Playwright, generated asset audit, bundled Node v24.

---

## Current Verified Base

- Base worktree: `/mnt/d/InkBlade-JiangHu/.worktrees/wave6-integration`
- Base branch for this plan: `codex/wave8-content-release-plan`
- Base commit includes:
  - Wave 7 demo hardening.
  - Observed bugfixes 2: stable combat hand layout and standee-only attack feedback for first-chapter stand-ins.
- Last verified gate before this plan:
  - Vitest: 15 files / 170 tests passed.
  - TypeScript: `tsc --noEmit` passed.
  - Vite build passed with known non-blocking Phaser chunk-size warning.
  - Playwright desktop e2e: 26 Chromium tests passed.
  - Asset audit: runtime refs 102, missing 0, ink-pass debt 0, card fallback debt 56.

Use bundled Node commands from every worktree:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

## Required Context For Every Worker

Read and record these in `Documentation.md` or the task's agent-run note before edits:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- Relevant chapter docs:
  - Events: `docs/chapters/chapter_01.md`, `docs/chapters/chapter_02.md`, `docs/chapters/chapter_03.md`, `docs/chapters/final_chapter.md`
  - Methods/relics: gameplay doc plus character setting docs for touched characters.
  - Balance/release docs: `docs/playtest/alpha-acceptance.md`
- Relevant character docs when touching character-specific cards, methods, events, copy, or balance:
  - `docs/character_settings/赵云_角色设定文档.md`
  - `docs/character_settings/貂蝉_角色设定文档.md`
  - `docs/character_settings/蔡文姬_角色设定文档.md`
  - `docs/character_settings/诸葛亮_角色设定文档.md`

## Worktree And Ownership Map

| Worktree | Branch | Owner Role | Scope | Primary Write Set |
|---|---|---|---|---|
| `.worktrees/wave8-all-character-methods` | `codex/wave8-all-character-methods` | Builder | Add Cai Wenji and Zhuge Liang method/relic support so all four MVP heroes have growth choices | `src/game/content/methods.ts`, `src/game/content/relics.ts`, `src/game/systems/methods/methods.ts`, `src/game/systems/relics/relicEffects.ts`, `src/game/systems/combat/combat.ts`, `tests/methods/method-system.test.ts`, `tests/relics/relic-system.test.ts`, `Documentation.md` |
| `.worktrees/wave8-event-depth` | `codex/wave8-event-depth` | Builder | Add Cai/Zhuge role event hooks and late-chapter event consequence coverage | `src/game/content/events.ts`, `src/game/systems/events/eventEffects.ts`, `src/game/systems/run/run.ts`, `tests/events/event-system.test.ts`, `tests/run/run-system.test.ts`, `tests/e2e/playable-flow.spec.ts`, `Documentation.md` |
| `.worktrees/wave8-balance-multiseed` | `codex/wave8-balance-multiseed` | Builder | Broaden deterministic balance report from one seed to a multi-seed aggregate and update watchlist output | `src/game/systems/debug/balanceReport.ts`, `src/game/systems/debug/runSimulator.ts`, `scripts/balance-report.mjs`, `tests/playtest/run-simulator.test.ts`, `docs/playtest/alpha-acceptance.md`, `Documentation.md` |
| `.worktrees/wave8-release-docs` | `codex/wave8-release-docs` | Reporter | Produce desktop playtest handoff docs, known gaps, and QA checklist without changing runtime behavior | `README.md`, `docs/playtest/alpha-acceptance.md`, `docs/playtest/desktop-playtest-checklist.md`, `docs/art/gpt2-priority-queue.md`, `Documentation.md` |

Parallel rule: Workers are not alone in the codebase. Each worker must keep to its write set, avoid reverting edits made by others, and commit only semantic changes. `Documentation.md` conflict resolution happens during integration.

## Task 8.1: All-Character Methods And Relic Growth

**Acceptance:**

- Cai Wenji and Zhuge Liang each get two method definitions tied to existing archetype ids and starter/card identities.
- Method reward drafts can offer methods for all four playable characters, not only Zhao Yun and Diao Chan.
- Combat hooks for new methods are deterministic and once-per-combat unless an explicit method level says otherwise.
- At least two new relics support Cai/Zhuge archetypes, and reward/shop pools include them by source.
- Existing Zhao/Diao method and relic tests keep passing.

**Red test to add first:**

In `tests/methods/method-system.test.ts`, add:

```ts
it("offers method rewards for Cai Wenji and Zhuge Liang archetypes", () => {
  const caiRun = createRun("caiwenji", { mapSeed: 21 });
  takeCardReward(caiRun, cardsById.cai_echoing_melody);
  const caiDraft = createMethodRewardDraft(caiRun);
  expect(caiDraft.methods.every((method) => method.characterId === "caiwenji")).toBe(true);
  expect(caiDraft.methods.map((method) => method.id)).toEqual(expect.arrayContaining(["method_qingyin_echo", "method_hujia_cleanse"]));

  const zhugeRun = createRun("zhugeliang", { mapSeed: 22 });
  takeCardReward(zhugeRun, cardsById.zhuge_small_eight_array);
  const zhugeDraft = createMethodRewardDraft(zhugeRun);
  expect(zhugeDraft.methods.every((method) => method.characterId === "zhugeliang")).toBe(true);
  expect(zhugeDraft.methods.map((method) => method.id)).toEqual(expect.arrayContaining(["method_star_observation", "method_wind_array"]));
});
```

Add focused combat-hook tests after defining exact semantics:

```ts
it("Qingyin Echo grants one sound on the first echo card each combat", () => {
  const state = createCombat({
    character: { ...charactersById.caiwenji, starterDeck: ["cai_echoing_melody", "cai_echoing_melody", "cai_plain_strike", "cai_pluck_string", "cai_hujia_beat"] },
    cards: cardList,
    enemies: [enemiesById.enemy_bamboo_wraith],
    rngSeed: 41,
    methodIds: ["method_qingyin_echo"],
    shuffleDeck: false
  });
  playFirst(state, "cai_echoing_melody", "player");
  playFirst(state, "cai_echoing_melody", "player");
  expect(state.player.resource.value).toBeGreaterThan(1);
  expect(state.combatLog.filter((entry) => entry === "清音回响")).toHaveLength(1);
});
```

**Implementation notes:**

- Extend `MethodId` in `src/game/content/methods.ts` with:
  - `method_qingyin_echo`
  - `method_hujia_cleanse`
  - `method_star_observation`
  - `method_wind_array`
- Reuse existing card tags/archetypes; do not invent new resources.
- Prefer hook semantics that can be expressed by existing combat event surfaces:
  - Cai echo: first `echo` or `qin` card grants sound.
  - Cai cleanse: first cleanse/status interaction grants block or sound.
  - Zhuge observation: first `scry` card grants strategy.
  - Zhuge formation: first `formation` card grants block or strategy.
- Add relics:
  - `relic_echoing_jade_chime` for Cai echo.
  - `relic_starlit_tactical_map` for Zhuge formation/scry.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/methods/method-system.test.ts tests/relics/relic-system.test.ts tests/combat/combat-system.test.ts tests/save/save-system.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

## Task 8.2: Event Depth For All Four Heroes

**Acceptance:**

- Event pools include at least two Cai Wenji choices and two Zhuge Liang choices across chapter two, chapter three, or final chapter.
- Existing `getAvailableEventChoices` filters role choices correctly for all four playable characters.
- Late event IDs remain seed-varied.
- Event summaries expose concrete consequences before the player clicks.
- Browser coverage verifies one Cai or Zhuge role-specific choice in an event route or via deterministic seed.

**Red test to add first:**

In `tests/events/event-system.test.ts`, add:

```ts
it("contains role-specific event choices for all four MVP characters", () => {
  const choices = eventList.flatMap((event) => event.choices);
  expect(choices.filter((choice) => choice.characterId === "zhaoyun").length).toBeGreaterThanOrEqual(2);
  expect(choices.filter((choice) => choice.characterId === "diaochan").length).toBeGreaterThanOrEqual(2);
  expect(choices.filter((choice) => choice.characterId === "caiwenji").length).toBeGreaterThanOrEqual(2);
  expect(choices.filter((choice) => choice.characterId === "zhugeliang").length).toBeGreaterThanOrEqual(2);
});
```

Update the `GameEventChoice.characterId` type to include `"caiwenji" | "zhugeliang"` and add event choices that award existing cards:

- Cai: `cai_echoing_melody`, `cai_hujia_beat`, `cai_clear_tone`, or `cai_soul_ferry`.
- Zhuge: `zhuge_observe_stars`, `zhuge_small_eight_array`, `zhuge_deduction`, or `zhuge_borrow_wind`.

**Browser test target:**

Add a deterministic Playwright check in `tests/e2e/playable-flow.spec.ts` that proves all-four-character event support is visible without relying on hidden route internals:

```ts
test("Cai Wenji event route keeps consequence summaries visible", async ({ page }) => {
  await startRun(page, "caiwenji");
  await page.getByTestId("map-node-event-1").click();
  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.locator("[data-testid^='event-choice-']").first()).toBeVisible();
  await expect(page.locator("[data-testid^='event-choice-']").first()).toContainText(/获得|回复|失去|升级|移除|宁|怒|悲|魅|乱|悟/);
});
```

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/events/event-system.test.ts tests/run/run-system.test.ts tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts -g "event|Cai Wenji|Zhuge Liang"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

## Task 8.3: Multi-Seed Balance Report

**Acceptance:**

- `createBalanceReport` supports a `seeds` option or equivalent helper that aggregates at least three deterministic seed runs.
- Report output includes per-character completion count, min/median/max lowest post-combat HP, max single-turn damage, timeout risk count, and unsafe spike count.
- CLI keeps current single-seed behavior by default and adds a documented multi-seed flag, such as `--seeds 9001,9002,9003`.
- `docs/playtest/alpha-acceptance.md` records the latest aggregate findings and preserves the single-seed evidence when helpful.

**Red test to add first:**

In `tests/playtest/run-simulator.test.ts`, add:

```ts
it("builds a deterministic multi-seed balance aggregate", () => {
  const report = createBalanceReport({ seeds: [9001, 9002, 9003] });
  expect(report.seed).toBe(9001);
  expect(report.seeds).toEqual([9001, 9002, 9003]);
  expect(report.aggregate?.characters.zhaoyun.completed).toBeGreaterThanOrEqual(1);
  expect(report.aggregate?.characters.zhugeliang).toBeDefined();
  expect(report.aggregate?.totalRuns).toBe(12);
});
```

**Implementation notes:**

- Keep DOM/Phaser out of report generation.
- Preserve existing Markdown output shape, then append an `Aggregate` section when multiple seeds are provided.
- Use stable object keys matching character ids: `zhaoyun`, `diaochan`, `caiwenji`, `zhugeliang`.
- Do not tune card/enemy numbers in this branch unless a deterministic regression is severe enough to block report generation.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/roadmap/next-ten-modules.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
```

## Task 8.4: Desktop Playtest And Release Handoff Docs

**Acceptance:**

- `README.md` gives a new contributor/tester enough desktop instructions to install, run, test, and play the current slice using bundled or normal Node commands.
- `docs/playtest/desktop-playtest-checklist.md` exists with concrete smoke routes, debug skip usage, known non-blocking issues, and bug-report capture guidance.
- `docs/playtest/alpha-acceptance.md` reflects Wave 7 + observed bugfixes 2 baseline:
  - Vitest 170 tests.
  - Playwright 26 Chromium tests.
  - Asset audit runtime refs 102, missing 0, card fallback debt 56.
  - First-chapter stand-ins use standee-only attack feedback until bespoke strips exist.
- `docs/art/gpt2-priority-queue.md` keeps first-chapter standee/attack strip regeneration debt explicit and does not reintroduce generic slash as acceptable runtime binding.
- No runtime files change.

**Docs-only verification:**

```bash
grep -n "调试跳章\\|desktop\\|Playwright\\|card fallback debt" README.md docs/playtest/desktop-playtest-checklist.md docs/playtest/alpha-acceptance.md
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
git diff --check
```

**Recommended README sections:**

- Project summary.
- Quick start.
- Test commands.
- Desktop playtest route.
- Debug controls.
- Known gaps.
- Bug report template.

## Integration Order

1. Commit this plan on `codex/wave8-content-release-plan`.
2. Create all four Wave 8 worktrees from the plan branch.
3. Dispatch tasks 8.1, 8.2, 8.3, and 8.4 in parallel because their primary write sets are mostly disjoint.
4. Review and integrate docs-only Task 8.4 first only if it does not stale the runtime numbers; otherwise integrate it last and refresh counts from the final gate.
5. Integrate runtime tasks in this order:
   - 8.1 all-character methods/relics.
   - 8.2 event depth.
   - 8.3 multi-seed balance report.
   - 8.4 release docs refresh.
6. After each branch integration, rerun its narrow verification on the integration branch.
7. Close the corresponding subagent and remove the completed worktree after the branch is merged or explicitly deferred.
8. Run the final Wave 8 gate:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

## Completion Criteria

- Every runtime task includes a red/green test record in `Documentation.md`.
- Docs-only task includes command evidence and no runtime churn.
- All four MVP characters have method reward support.
- Event role-specific support covers all four MVP characters.
- Balance evidence has both single-seed continuity and multi-seed aggregate context.
- Desktop playtest handoff docs are ready for a human tester.
- Final integrated branch passes the full Wave 8 gate.
