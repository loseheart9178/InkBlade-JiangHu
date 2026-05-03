# Autonomous Alpha Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or an equivalent PM -> Explorer -> Builder -> Tester -> Reporter flow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move 《云水江湖》 from the current desktop MVP into an alpha-quality browser vertical slice with a complete three-chapter run spine, stronger long-term progression, higher-fidelity art coverage, and repeatable playtest tooling.

**Architecture:** Keep deterministic gameplay rules in `src/game/systems/` and declarative content in `src/game/content/`. Phaser remains a thin battlefield renderer; DOM owns dense card, map, reward, logbook, settings, and ending UI. Each worktree owns a disjoint write surface whenever possible, and integration happens only after its tests pass.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, Playwright, CSS custom properties, GPT Image 2 generated PNG assets, project-local skills under `skills/`.

---

## Operating Rules For This Long Run

- Re-read `Prompt.md`, `Plan.md`, `Implement.md`, `Documentation.md`, and relevant `docs/` files before each feature, story, UI, art, or asset task.
- Record every docs-read set, implementation decision, generated art source, verification command, and known gap in `Documentation.md`.
- Desktop browser is the only layout target until the user explicitly reopens mobile.
- No renderer-owned gameplay rules. If a rule affects combat, rewards, run state, endings, profile, or save behavior, implement it under `src/game/systems/`.
- Every bug fix or gameplay feature starts with a failing test when practical.
- Every worktree must verify its narrow tests first, then `npm test`, `npm run build`, and relevant Playwright checks before integration.
- Integrate only one worktree at a time into `codex/next-major-modules`, rerun full verification after each integration, and close the subagent/worktree after acceptance.

---

## Parallel Worktree Matrix

| Wave | Worktree Branch | Owner | Primary Write Surface | Acceptance Gate |
|---|---|---|---|---|
| 1A | `codex/auton-playtest-lab` | Tester/Builder | `src/game/systems/debug/`, `tests/playtest/`, `tests/roadmap/` | deterministic simulations and roadmap contracts pass |
| 1B | `codex/auton-profile-endings` | Builder | `src/game/systems/profile/`, `src/game/systems/endings/`, `tests/profile/`, `tests/endings/` | profile/endings unit tests pass without controller rewrites |
| 1C | `codex/auton-art-audit` | Builder/Reporter | `scripts/`, `tests/data/`, `skills/inkblade-art-asset-pipeline/`, `public/assets/generated/manifest*.json` | asset coverage report and data tests pass |
| 1D | `codex/auton-ui-shells` | Builder | `src/app/inkbladeController.ts`, `src/styles/theme.css`, `tests/e2e/` | desktop UI shells for settings/logbook/reward/ending pass Playwright |
| 2A | `codex/auton-final-chapter` | Builder | `src/game/content/chapters.ts`, `src/game/content/enemies.ts`, `src/game/content/events.ts`, `src/game/content/logbook.ts`, `tests/data/` | 墨渊照心 content shell and final Boss data pass |
| 2B | `codex/auton-caiwenji-mvp` | Builder | `src/game/content/cards.ts`, `src/game/content/characters.ts`, combat resource hooks, tests | 蔡文姬 selectable MVP passes unit and browser smoke |
| 2C | `codex/auton-zhugeliang-mvp` | Builder | same character/card surfaces after 2B integration | 诸葛亮 selectable MVP passes unit and browser smoke |
| 3A | `codex/auton-gpt2-final-assets` | Builder/Reporter | generated source PNGs, cropped runtime PNGs, `src/game/content/visuals.ts` | remaining priority `*-ink-pass.png` assets replaced or documented |
| 3B | `codex/auton-alpha-balance` | Tester/Builder | `src/game/content/enemies.ts`, reward tuning, playtest tests | first-to-third chapter deterministic playthrough and balance bands pass |

Wave 1 is safe to run immediately in parallel because it isolates systems/tooling/UI shell surfaces. Wave 2 waits for Wave 1 integration where controller/profile/endings boundaries are known. Wave 3 waits for art and content manifests to stabilize.

---

## Milestone 42: Autonomous Planning, Worktree Setup, And Dispatch

**Files:**
- Modify: `Plan.md`
- Modify: `Documentation.md`
- Modify: `.gitignore`
- Create: `docs/superpowers/plans/2026-05-03-autonomous-alpha-roadmap.md`

- [ ] **Step 1: Ensure worktree directory is ignored**

Run:

```bash
git check-ignore -q .worktrees
```

Expected: exit code `0`. If it fails, add `.worktrees` and `.worktrees/` to `.gitignore`, then commit `chore: ignore local worktrees`.

- [ ] **Step 2: Write this autonomous alpha plan**

Create `docs/superpowers/plans/2026-05-03-autonomous-alpha-roadmap.md` with the Wave 1-3 matrix, milestone scope, tests, and integration rules.

- [ ] **Step 3: Create Wave 1 worktrees**

Run:

```bash
git worktree add .worktrees/auton-playtest-lab -b codex/auton-playtest-lab
git worktree add .worktrees/auton-profile-endings -b codex/auton-profile-endings
git worktree add .worktrees/auton-art-audit -b codex/auton-art-audit
git worktree add .worktrees/auton-ui-shells -b codex/auton-ui-shells
```

Expected: each worktree is created from the current clean `codex/next-major-modules` branch head.

- [ ] **Step 4: Baseline each worktree**

Run in each worktree:

```bash
npm test
npm run build
```

Expected: both commands pass. If any worktree fails before changes, record the baseline failure in `Documentation.md` and pause only that worktree.

- [ ] **Step 5: Dispatch Wave 1 subagents**

Spawn one worker per Wave 1 worktree. Each worker must:

- edit only its assigned worktree;
- not revert others' changes;
- run its narrow tests, `npm test`, and `npm run build`;
- update `Documentation.md` in its worktree with docs read, changes, verification, and risks;
- return changed files and verification output.

---

## Milestone 43: Playtest Lab And Balance Instrumentation

**Worktree:** `.worktrees/auton-playtest-lab`  
**Branch:** `codex/auton-playtest-lab`

**Files:**
- Create: `src/game/systems/debug/runSimulator.ts`
- Create: `tests/playtest/run-simulator.test.ts`
- Modify: `src/game/systems/debug/debugRun.ts`
- Modify: `tests/roadmap/next-ten-modules.test.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing simulator contract**

Add `tests/playtest/run-simulator.test.ts`:

```ts
import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import { simulateBattlePlan, summarizeRunPacing } from "../../src/game/systems/debug/runSimulator";

describe("run simulator", () => {
  it("estimates battle pacing without renderer state", () => {
    const run = createDebugRun({ chapterId: "bamboo", characterId: "zhaoyun" });
    const result = simulateBattlePlan(run, "enemy_bamboo_wraith", { maxTurns: 8, preferDefenseAtIncomingDamage: 10 });

    expect(result.outcome).toMatch(/victory|defeat|timeout/);
    expect(result.turns).toBeGreaterThan(0);
    expect(result.turns).toBeLessThanOrEqual(8);
    expect(result.damageTaken).toBeGreaterThanOrEqual(0);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it("summarizes chapter two and three pacing bands", () => {
    const summary = summarizeRunPacing(["bamboo", "changan"], ["zhaoyun", "diaochan"]);

    expect(summary.encounters.length).toBeGreaterThanOrEqual(12);
    expect(summary.warnings.every((warning) => !warning.includes("missing enemy"))).toBe(true);
    expect(summary.averageTurnsByChapter.bamboo).toBeGreaterThan(1);
    expect(summary.averageTurnsByChapter.changan).toBeGreaterThan(1);
  });
});
```

Run:

```bash
npm test -- tests/playtest/run-simulator.test.ts
```

Expected: fail because `runSimulator.ts` does not exist.

- [ ] **Step 2: Implement pure simulator**

Create `src/game/systems/debug/runSimulator.ts` with:

- `simulateBattlePlan(run, enemyId, options)` that uses `createCombat`, simple card choice heuristics, `playCard`, and `endPlayerTurn`;
- `summarizeRunPacing(chapterIds, characterIds)` that runs all normal, elite, and boss enemies for provided chapters;
- no DOM, Phaser, localStorage, or random browser state.

- [ ] **Step 3: Verify simulator**

Run:

```bash
npm test -- tests/playtest/run-simulator.test.ts
npm test
npm run build
```

Expected: all pass.

---

## Milestone 44: Profile, Meta Records, And Ending Evaluator Core

**Worktree:** `.worktrees/auton-profile-endings`  
**Branch:** `codex/auton-profile-endings`

**Files:**
- Create: `src/game/systems/profile/profile.ts`
- Create: `src/game/systems/endings/endings.ts`
- Create: `tests/profile/profile-system.test.ts`
- Create: `tests/endings/ending-system.test.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/save/save.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing profile tests**

Add `tests/profile/profile-system.test.ts`:

```ts
import { createProfile, recordRunResult, unlockLogbookFragment } from "../../src/game/systems/profile/profile";

describe("profile system", () => {
  it("records persistent run stats and unlocked fragments", () => {
    const profile = createProfile();
    const next = recordRunResult(profile, {
      characterId: "zhaoyun",
      victory: true,
      endingId: "ending_clear_seal",
      chaptersCompleted: ["luoshui", "bamboo", "changan"]
    });
    const withFragment = unlockLogbookFragment(next, "fragment_changban_echo");

    expect(withFragment.stats.totalRuns).toBe(1);
    expect(withFragment.stats.victories).toBe(1);
    expect(withFragment.characterStats.zhaoyun.victories).toBe(1);
    expect(withFragment.unlockedFragments).toContain("fragment_changban_echo");
  });
});
```

Run:

```bash
npm test -- tests/profile/profile-system.test.ts
```

Expected: fail because profile module does not exist.

- [ ] **Step 2: Write failing ending evaluator tests**

Add `tests/endings/ending-system.test.ts`:

```ts
import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import { evaluateEnding } from "../../src/game/systems/endings/endings";

describe("ending evaluator", () => {
  it("chooses a clear seal ending for low ink and calm/wu tendency", () => {
    const run = createDebugRun({ characterId: "zhaoyun", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 4, nu: 0, bei: 0, mei: 0, luan: 0, wu: 3 },
      inkHistory: { totalGained: 1, highestInCombat: 1, disasterCardsPlayed: 0 }
    });

    expect(ending.id).toBe("ending_clear_seal");
    expect(ending.title).toContain("封印");
  });

  it("chooses heart demon collapse for extreme ink and chaos", () => {
    const run = createDebugRun({ characterId: "diaochan", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 0, nu: 3, bei: 2, mei: 5, luan: 8, wu: 0 },
      inkHistory: { totalGained: 18, highestInCombat: 8, disasterCardsPlayed: 6 }
    });

    expect(ending.id).toBe("ending_heart_demon");
  });
});
```

Run:

```bash
npm test -- tests/endings/ending-system.test.ts
```

Expected: fail because endings module does not exist.

- [ ] **Step 3: Implement profile and ending modules**

Create pure data modules only. Do not add controller UI in this worktree.

Profile must include:

- `version: 1`;
- `stats.totalRuns`, `stats.victories`, `stats.defeats`;
- per-character run and victory counts;
- `unlockedFragments`, `unlockedEndings`;
- pure update functions.

Ending evaluator must include:

- `ending_clear_seal`;
- `ending_burn_book`;
- `ending_rewrite_fate`;
- `ending_heart_demon`;
- `ending_hidden_wu`;
- a deterministic priority order: hidden wu, heart demon, rewrite fate, burn book, clear seal.

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- tests/profile/profile-system.test.ts tests/endings/ending-system.test.ts
npm test
npm run build
```

Expected: all pass.

---

## Milestone 45: Art Coverage Audit And Asset Manifest Tooling

**Worktree:** `.worktrees/auton-art-audit`  
**Branch:** `codex/auton-art-audit`

**Files:**
- Create: `scripts/audit-generated-assets.mjs`
- Create: `public/assets/generated/asset-audit.json`
- Modify: `tests/data/content.test.ts`
- Modify: `skills/inkblade-art-asset-pipeline/SKILL.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing art audit data test**

Add a test to `tests/data/content.test.ts`:

```ts
it("tracks remaining non-final ink-pass art debt by semantic asset id", () => {
  const debt = Object.values(combatPortraitsById)
    .filter((portrait) => portrait.assetPath.includes("ink-pass"))
    .map((portrait) => portrait.id);

  expect(debt).toEqual(expect.arrayContaining(["enemy_bamboo_soldier", "elite_qin_score", "elite_bamboo_phalanx", "elite_lubu_shadow"]));
  expect(debt.length).toBeLessThanOrEqual(8);
});
```

Run:

```bash
npm test -- tests/data/content.test.ts
```

Expected: pass or fail with current debt count; if fail, adjust the cap to the actual debt and document it.

- [ ] **Step 2: Add audit script**

Create `scripts/audit-generated-assets.mjs` that:

- scans `src/game/content/visuals.ts` as text;
- finds `/assets/generated/...` and `/assets/sprites/...` references;
- checks files under `public/`;
- writes `public/assets/generated/asset-audit.json` with `missing`, `inkPassDebt`, `gpt2Runtime`, and `sourceSheets`.

Run:

```bash
node scripts/audit-generated-assets.mjs
```

Expected: `missing` is empty; `asset-audit.json` is created.

- [ ] **Step 3: Update skill**

Add a section to `skills/inkblade-art-asset-pipeline/SKILL.md` titled `Asset Debt Ledger` stating that after every GPT Image 2 replacement pass, run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
```

- [ ] **Step 4: Verify**

Run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm test
npm run build
```

Expected: all pass.

---

## Milestone 46: Desktop UI Shells For Settings, Run Summary, And Ending Surface

**Worktree:** `.worktrees/auton-ui-shells`  
**Branch:** `codex/auton-ui-shells`

**Files:**
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing UI e2e tests**

Add tests to `tests/e2e/playable-flow.spec.ts`:

```ts
test("settings panel opens from title and returns without starting a run", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("settings-open").click();
  await expect(page.getByTestId("screen-settings")).toBeVisible();
  await expect(page.getByTestId("setting-reduced-motion")).toBeVisible();
  await page.getByTestId("settings-back").click();
  await expect(page.getByTestId("screen-title")).toBeVisible();
});

test("run summary shell shows after defeat or victory transition", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("debug-run-summary").click();
  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("run-summary-stat")).toHaveCountGreaterThan(2);
});
```

Run:

```bash
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "settings panel|run summary"
```

Expected: fail because screens/buttons do not exist.

- [ ] **Step 2: Implement settings shell**

Add a `settings` screen in the controller with:

- title action `settings-open`;
- toggles for reduced motion and fast combat text;
- volume sliders as disabled MVP placeholders labeled usable but not wired to audio yet;
- `settings-back` to title.

Keep the settings state in controller memory for now unless profile integration has landed.

- [ ] **Step 3: Implement run summary shell**

Add a `runSummary` screen with:

- character name;
- victory/defeat/result text;
- chapters completed;
- relic count;
- deck size;
- unlocked fragments count;
- buttons to return to title and open logbook.

Add a `debug-run-summary` title button hidden behind the existing debug style if the project already has debug affordances; otherwise use a small footer button.

- [ ] **Step 4: Style desktop shell**

Add restrained brush-paper styles in `src/styles/theme.css`; avoid mobile-specific work. Use compact panels, no nested cards.

- [ ] **Step 5: Verify**

Run:

```bash
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "settings panel|run summary"
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

Expected: all pass.

---

## Milestone 47: Final Chapter Content Spine

**Worktree:** `.worktrees/auton-final-chapter`  
**Branch:** `codex/auton-final-chapter`

**Files:**
- Modify: `src/game/content/chapters.ts`
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/content/events.ts`
- Modify: `src/game/content/logbook.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Add failing content tests for 墨渊照心**

Add tests requiring:

- chapter id `moyuan`;
- boss id `boss_nameless_historian`;
- at least three final events: `event_heart_mirror`, `event_unwritten_page`, `event_broken_brush_altar`;
- transition from `changan` to `moyuan`;
- final boss victory routes into ending evaluation instead of another normal chapter.

- [ ] **Step 2: Implement final chapter data**

Add `墨渊照心` with black-water mirror visual references, final node pool, and final Boss. The Boss must use special intents:

- `记录旧路`: adds status based on common combo memory;
- `改写手牌`: adds redacted history/status pressure;
- `照心质问`: applies weak/vulnerable and unlocks a character fragment;
- `定稿成灾`: controlled high-damage finisher.

- [ ] **Step 3: Verify**

Run:

```bash
npm test -- tests/data/content.test.ts tests/run/run-system.test.ts
npm test
npm run build
```

Expected: all pass.

---

## Milestone 48: Cai Wenji MVP Character

**Worktree:** `.worktrees/auton-caiwenji-mvp`  
**Branch:** `codex/auton-caiwenji-mvp`

**Files:**
- Modify: `src/game/content/characters.ts`
- Modify: `src/game/content/cards.ts`
- Modify: `src/game/content/relics.ts`
- Modify: `src/game/content/methods.ts`
- Modify: `src/game/systems/combat/types.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/combat/combat-system.test.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Add failing data test**

Require `characterList` to include `caiwenji`, a 10-card starter deck, starting relic `relic_qingyu_qinhui`, resource name `音律`, and at least 12 Cai Wenji cards with `qin` or `echo` style types/keywords.

- [ ] **Step 2: Add failing combat test**

Require `caiwenji` to gain 音律 from 琴音 cards and queue at most three 余韵 effects that trigger at next player turn start.

- [ ] **Step 3: Implement minimal mechanics**

Implement:

- 音律 resource, max 10;
- `echo` queue in combat state with save-safe defaulting;
- cards: 拂弦, 清音, 断弦, 余韵, 五音初起, 胡笳一拍, 静听, 渡魂曲, 净弦, 宫音, 商音, 终曲;
- relic `青玉琴徽`: first cleanse or status draw grants 音律;
- method hooks for `五音归一` later-compatible but not overbuilt.

- [ ] **Step 4: Add browser smoke**

Character select must show 蔡文姬, start a run, enter combat, and display 音律 resource.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "Cai Wenji"
npm test
npm run build
```

Expected: all pass.

---

## Milestone 49: Zhuge Liang MVP Character

**Worktree:** `.worktrees/auton-zhugeliang-mvp`  
**Branch:** `codex/auton-zhugeliang-mvp`

This milestone starts only after Cai Wenji integration to avoid shared character/card/controller conflicts.

**Files:** same surfaces as Milestone 48.

- [ ] **Step 1: Add failing data test**

Require `characterList` to include `zhugeliang`, a 10-card starter deck, starting relic `relic_white_feather_fan`, resource name `筹策`, and at least 12 Zhuge Liang cards with `strategy`, `formation`, or `observe` semantics.

- [ ] **Step 2: Add failing combat test**

Require 观星 to inspect/reorder the top draw pile in a pure combat function and 阵法 to maintain one active formation with a duration/effect.

- [ ] **Step 3: Implement minimal mechanics**

Implement:

- 筹策 resource, max 9, starts at 1;
- `scry`/观星 pure helper;
- one active formation slot;
- cards: 羽扇, 观星, 八阵, 空城, 借风, 火阵, 风阵, 石阵, 推演, 计定, 草船, 星落;
- relic `白羽扇`: first 观星 each combat gains 1 筹策.

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "Zhuge Liang"
npm test
npm run build
```

Expected: all pass.

---

## Milestone 50: GPT Image 2 Final Asset Pass

**Worktree:** `.worktrees/auton-gpt2-final-assets`  
**Branch:** `codex/auton-gpt2-final-assets`

**Files:**
- Add: `public/assets/generated/sources/gpt2-*.png`
- Add/Modify: `public/assets/generated/*.png`
- Add/Modify: `public/assets/generated/cards/*.png`
- Add/Modify: `public/assets/sprites/*.png`
- Modify: `src/game/content/visuals.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Identify remaining priority debt**

Run:

```bash
node scripts/audit-generated-assets.mjs
```

Expected: `missing` empty and `inkPassDebt` lists remaining targets.

- [ ] **Step 2: Generate GPT Image 2 source sheets**

Generate:

- remaining second/third chapter normal/elite standees;
- chapter Boss and final Boss standees;
- 12 priority card faces for Cai Wenji, Zhuge Liang, final chapter, and ink disaster cards;
- attack-strip source sheets for later chapter normals/elites and final Boss.

Save source sheets under `public/assets/generated/sources/`.

- [ ] **Step 3: Crop and normalize runtime PNGs**

Runtime rules:

- transparent cutouts for standees;
- card crops fit existing card-art frame with `object-fit: contain`;
- sprite strips have stable `512x512` frames unless the manifest changes all users consistently.

- [ ] **Step 4: Verify**

Run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

Expected: all pass and reviewed desktop screenshots show no placeholder silhouettes or circular residue.

---

## Milestone 51: Alpha Balance And Full Route Playtest Pass

**Worktree:** `.worktrees/auton-alpha-balance`  
**Branch:** `codex/auton-alpha-balance`

**Files:**
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/content/cards.ts`
- Modify: `src/game/systems/rewards/advancedRewards.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Add failing full-route playtest contracts**

Require deterministic debug helpers to complete:

- first chapter to second chapter;
- second chapter to third chapter;
- third chapter to final/ending shell;
- both Zhao Yun and Diao Chan can reach at least chapter three under helper play.

- [ ] **Step 2: Tune against simulator and e2e**

Adjust:

- enemy HP and peak damage bands;
- reward rare/cleanse/method density;
- Boss status pressure;
- starting route safety for Zhao Yun and Diao Chan.

- [ ] **Step 3: Verify**

Run:

```bash
npm test -- tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

Expected: all pass.

---

## Final Alpha Acceptance Gate

The autonomous alpha pass is accepted only when the integration branch satisfies:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
node scripts/audit-generated-assets.mjs
```

And `Documentation.md` records:

- all docs re-read;
- all worktrees opened and closed;
- subagent result summaries;
- commits merged;
- screenshots reviewed;
- known remaining gaps;
- next autonomous wave.

