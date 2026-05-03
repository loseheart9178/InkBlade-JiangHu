# Autonomous MVP Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or an equivalent PM -> Explorer -> Builder -> Tester -> Reporter flow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the browser-playable desktop MVP by adding the fourth character, wiring profile/endings into real run outcomes, replacing priority art debt with GPT Image 2 assets, and validating full-route balance.

**Architecture:** Gameplay rules stay in `src/game/systems/`; content stays in `src/game/content/`; Phaser scenes remain visual adapters; DOM owns title, combat HUD, reward, logbook, profile, settings, summary, and ending surfaces. Worktrees isolate disjoint write surfaces and integrate one branch at a time after verification.

**Tech Stack:** Phaser, TypeScript, Vite, Vitest, Playwright, CSS custom properties, generated PNG assets, project-local skills under `skills/`.

---

## Operating Rules

- Re-read `Prompt.md`, `Plan.md`, `Implement.md`, `Documentation.md`, and relevant `docs/` files before every feature, story/copy, UI, or art task.
- Record docs read, implementation decisions, verification, risks, generated prompts, and saved asset paths in `Documentation.md`.
- Keep desktop browser as the only supported layout target until mobile support is explicitly reopened.
- Use test-first for gameplay and bug fixes.
- Use one worktree per independent module and one subagent per worktree.
- Integrate one worktree at a time into `codex/next-major-modules`.
- After each accepted worktree: run narrow tests, `npm test`, `npm run build`, relevant Playwright, update docs, then remove the worktree and close the agent.

---

## Wave Matrix

| Wave | Branch | Worktree | Owner | Primary Write Surface | Acceptance Gate |
|---|---|---|---|---|---|
| 3A | `codex/auton-zhugeliang-mvp` | `.worktrees/auton-zhugeliang-mvp` | Worker | Zhuge Liang data/cards/combat/run/e2e | Zhuge unit + browser smoke pass |
| 3B | `codex/auton-profile-ending-ui` | `.worktrees/auton-profile-ending-ui` | Worker | profile/endings/save/controller/summary UI | final-state to ending/profile summary pass |
| 3C | `codex/auton-art-debt-prep` | `.worktrees/auton-art-debt-prep` | Worker/Reporter | audit ledger, visual manifest tests, prompt queue docs | no missing assets, prioritized GPT2 debt queue |
| 4A | `codex/auton-gpt2-final-assets` | `.worktrees/auton-gpt2-final-assets` | Main + Worker | generated PNGs, `visuals.ts`, art tests | audit shrinks priority debt, screenshots pass |
| 4B | `codex/auton-alpha-balance` | `.worktrees/auton-alpha-balance` | Worker | simulator, enemies, rewards, full-route tests | all four characters route to ending shell |
| 5A | `codex/auton-release-polish` | `.worktrees/auton-release-polish` | Worker | desktop UX, docs, final smoke | alpha acceptance gate passes |

Wave 3 can start immediately because Zhuge Liang, profile/ending UI, and art-debt prep are mostly independent. GPT Image 2 generation waits for Wave 3C's priority queue and Wave 3A's new character debt.

---

## Milestone 49: Zhuge Liang MVP Character

**Worktree:** `.worktrees/auton-zhugeliang-mvp`  
**Branch:** `codex/auton-zhugeliang-mvp`

**Files:**
- Modify: `src/game/content/characters.ts`
- Modify: `src/game/content/cards.ts`
- Modify: `src/game/content/relics.ts`
- Modify: `src/game/systems/combat/types.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/game/systems/deck/archetype.ts`
- Modify: `tests/combat/combat-system.test.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing data contract**

Add a test requiring:

```ts
expect(characterList.map((character) => character.id)).toContain("zhugeliang");
expect(charactersById.zhugeliang.resource).toMatchObject({ id: "strategy", name: "筹策", max: 9, initial: 1 });
expect(charactersById.zhugeliang.starterDeck).toHaveLength(10);
expect(relicList).toEqual(expect.arrayContaining([expect.objectContaining({ id: "relic_white_feather_fan", character: "zhugeliang" })]));
expect(cardList.filter((card) => card.character === "zhugeliang").length).toBeGreaterThanOrEqual(12);
```

Run:

```bash
npm test -- tests/data/content.test.ts
```

Expected: fail because `zhugeliang` does not exist.

- [ ] **Step 2: Write failing combat contract**

Add tests that verify:

- playing a 观星 card grants 筹策 and places a `scry` event in combat log or visual events;
- playing a 阵法 card sets exactly one active formation;
- playing another formation replaces the previous formation;
- 白羽扇 triggers once at combat start or first 观星 and grants a small 筹策/观星 benefit.

Run:

```bash
npm test -- tests/combat/combat-system.test.ts
```

Expected: fail because formation/scry state is absent.

- [ ] **Step 3: Implement MVP**

Add:

- character `zhugeliang`, max HP 66, resource `筹策 1/9`, 10-card starter deck;
- relic `relic_white_feather_fan`;
- 12 cards: 羽扇、观星、八阵、空城、借风、火阵、风阵、石阵、推演、计定、草船、星落;
- `scry`/观星 as a pure combat effect that records inspected top-card ids and can move up to N cards to bottom with deterministic MVP behavior;
- one active formation slot with id, name, duration, and simple turn-start or turn-end effect;
- reward pools and archetype labels `zhuge-star-control`, `zhuge-formation-wind`.

- [ ] **Step 4: Browser smoke**

Add Playwright flow:

```ts
await startRun(page, "zhugeliang");
await expect(page.getByTestId("player-hp")).toContainText("诸葛亮");
await expect(page.getByText(/筹策\s+1\/9/)).toBeVisible();
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- tests/combat/combat-system.test.ts tests/data/content.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "Zhuge Liang"
npm test
npm run build
```

Commit:

```bash
git add Documentation.md src tests
git commit -m "feat: add Zhuge Liang MVP character"
```

---

## Milestone 52: Profile, Ending, Save, And Run Summary Integration

**Worktree:** `.worktrees/auton-profile-ending-ui`  
**Branch:** `codex/auton-profile-ending-ui`

**Files:**
- Modify: `src/game/systems/save/save.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/profile/profile-system.test.ts`
- Modify: `tests/endings/ending-system.test.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing persistence test**

Require a completed final run to:

- call `evaluateEnding(getRunFinalState(run), run)` or equivalent adapter;
- record profile stats, character stats, unlocked fragments, and ending id;
- persist profile separately from current run save.

Run:

```bash
npm test -- tests/profile/profile-system.test.ts tests/endings/ending-system.test.ts tests/run/run-system.test.ts
```

Expected: fail because profile is not wired to run completion/save.

- [ ] **Step 2: Write failing browser test**

Add a debug route button or helper that opens a real run-summary shell with:

- ending title;
- selected character;
- chapters completed;
- unlocked fragments count;
- profile total runs.

Run:

```bash
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "ending summary|profile summary"
```

Expected: fail because the shell is still debug/sample only.

- [ ] **Step 3: Implement integration**

Add a small controller adapter that:

- detects `getRunFinalState(run).status === "endingReady"`;
- evaluates the ending;
- records profile using the pure profile API;
- saves profile to localStorage through `save.ts`;
- renders real run summary and ending surface from stored data.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/profile/profile-system.test.ts tests/endings/ending-system.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts --grep "ending summary|profile summary"
npm test
npm run build
```

Commit:

```bash
git add Documentation.md src tests
git commit -m "feat: wire endings into profile and run summary"
```

---

## Milestone 50: GPT Image 2 Final Asset Pass

**Worktree:** `.worktrees/auton-gpt2-final-assets`  
**Branch:** `codex/auton-gpt2-final-assets`

**Files:**
- Add/Modify: `public/assets/generated/sources/*.png`
- Add/Modify: `public/assets/generated/cards/*.png`
- Add/Modify: `public/assets/generated/*.png`
- Add/Modify: `public/assets/sprites/*.png`
- Modify: `src/game/content/visuals.ts`
- Modify: `public/assets/generated/asset-audit.json`
- Modify: `tests/data/content.test.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Generate priority queue**

Run:

```bash
node scripts/audit-generated-assets.mjs
```

Expected current baseline: `missing: 0`, `ink-pass debt: 20`, plus new debt for Cai Wenji/Zhuge Liang if added.

- [ ] **Step 2: Generate GPT Image 2 assets**

Use the project art skill and built-in image generation. Generate source sheets for:

- Zhuge Liang full-body standee and attack/formation strip;
- Cai Wenji full-body standee and qin/echo attack strip;
- final Boss `无名史官`;
- 12 priority card faces from Cai Wenji/Zhuge/final chapter;
- final battlefield `墨渊照心`.

Save sources under:

```text
public/assets/generated/sources/
```

- [ ] **Step 3: Crop and wire runtime files**

Runtime outputs:

- standees under `public/assets/generated/`;
- cards under `public/assets/generated/cards/`;
- sprite strips under `public/assets/sprites/`;
- references through `src/game/content/visuals.ts`.

- [ ] **Step 4: Verify**

Run:

```bash
node scripts/audit-generated-assets.mjs
npm test -- tests/data/content.test.ts
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
```

Commit:

```bash
git add Documentation.md public src tests
git commit -m "art: replace priority GPT2 MVP assets"
```

---

## Milestone 51: Alpha Balance And Full Route Playtest

**Worktree:** `.worktrees/auton-alpha-balance`  
**Branch:** `codex/auton-alpha-balance`

**Files:**
- Modify: `src/game/systems/debug/runSimulator.ts`
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/content/cards.ts`
- Modify: `src/game/content/relics.ts`
- Modify: `src/game/systems/rewards/advancedRewards.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Write failing full-route contracts**

Require simulator summaries for all playable characters:

```ts
const summary = summarizeRunPacing(["luoshui", "bamboo", "changan", "moyuan"], ["zhaoyun", "diaochan", "caiwenji", "zhugeliang"]);
expect(summary.warnings).not.toContainEqual(expect.stringMatching(/missing enemy|timeout-prone|unsafe spike/));
```

- [ ] **Step 2: Tune**

Tune HP, peak damage, status-card pressure, cleanse access, rare reward density, and advanced rewards until route warnings are meaningful but non-blocking.

- [ ] **Step 3: Verify**

Run:

```bash
npm test -- tests/playtest/run-simulator.test.ts tests/data/content.test.ts tests/run/run-system.test.ts
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

Commit:

```bash
git add Documentation.md src tests
git commit -m "test: tune alpha route balance"
```

---

## Milestone 53: Release Polish And Alpha Acceptance

**Worktree:** `.worktrees/auton-release-polish`  
**Branch:** `codex/auton-release-polish`

**Files:**
- Modify: `Prompt.md`
- Modify: `Plan.md`
- Modify: `Documentation.md`
- Modify: `docs/superpowers/agent-runs/*.md`
- Modify: `README.md` if present, otherwise create `README.md`
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] **Step 1: Final acceptance gate**

Run:

```bash
node scripts/audit-generated-assets.mjs
npm test
npm run typecheck
npm run build
npm run test:e2e
```

- [ ] **Step 2: Desktop screenshots**

Capture and review:

- title character select with four characters;
- Zhao Yun combat;
- Diao Chan combat;
- Cai Wenji combat;
- Zhuge Liang combat;
- final chapter/ending summary.

- [ ] **Step 3: Documentation**

Update docs with:

- playable scope;
- known MVP gaps;
- how to run;
- verification results;
- remaining art debts if any.

- [ ] **Step 4: Commit**

```bash
git add Documentation.md Plan.md Prompt.md README.md tests docs
git commit -m "docs: record alpha MVP acceptance"
```
