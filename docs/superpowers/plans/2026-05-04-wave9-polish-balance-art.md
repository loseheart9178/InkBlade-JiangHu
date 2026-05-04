# Wave 9 Polish Balance Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the Wave 8 desktop alpha by resolving the Zhuge Liang seed `9003` balance failure, reducing starter-card fallback art debt, and giving first-chapter elite/boss combatants semantic attack strips.

**Architecture:** Gameplay changes stay in pure TypeScript simulation/content modules and are proven with Vitest before integration. Art debt changes use data-driven visual manifests and repo-local runtime assets under `public/assets/`; Phaser remains only the visual adapter through existing manifest helpers. Documentation updates trail verified evidence and must not claim lower debt or better balance until the audit/report commands prove it.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, Playwright, repo-local SVG/PNG assets, `scripts/audit-generated-assets.mjs`, deterministic `scripts/balance-report.mjs`.

---

## Project Context And Required Reads

All workers must read these files before editing:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-04-wave9-polish-balance-art.md`

Additional required reads by task:

- Task 1 balance: `docs/playtest/alpha-acceptance.md`, `docs/character_settings/诸葛亮_角色设定文档.md`, `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`.
- Task 2 card art: `docs/art/gpt2-priority-queue.md`, `src/game/content/cards.ts`, `src/game/content/visuals.ts`, `scripts/audit-generated-assets.mjs`.
- Task 3 enemy attacks: `docs/art/gpt2-priority-queue.md`, `docs/chapters/chapter_01.md`, `src/game/content/enemies.ts`, `src/game/content/visuals.ts`, `tests/data/content.test.ts`, `tests/e2e/visual-smoke.spec.ts`.
- Task 4 docs: `README.md`, `docs/playtest/alpha-acceptance.md`, `docs/playtest/desktop-playtest-checklist.md`, `docs/art/gpt2-priority-queue.md`, `Documentation.md`.

## Branch And Worktree Plan

Coordinator branch:

```bash
git switch -c codex/wave9-polish-balance-art-plan
```

Worker worktrees, all based on `codex/wave9-polish-balance-art-plan`:

```bash
git worktree add /mnt/d/InkBlade-JiangHu/.worktrees/wave9-zhuge-balance -b codex/wave9-zhuge-balance codex/wave9-polish-balance-art-plan
git worktree add /mnt/d/InkBlade-JiangHu/.worktrees/wave9-starter-card-art -b codex/wave9-starter-card-art codex/wave9-polish-balance-art-plan
git worktree add /mnt/d/InkBlade-JiangHu/.worktrees/wave9-first-chapter-attacks -b codex/wave9-first-chapter-attacks codex/wave9-polish-balance-art-plan
git worktree add /mnt/d/InkBlade-JiangHu/.worktrees/wave9-release-docs -b codex/wave9-release-docs codex/wave9-polish-balance-art-plan
```

Each worker may link or reuse the known-good dependency tree from `/mnt/d/InkBlade-JiangHu/.worktrees/wave6-integration/node_modules` as long as `git status --short` stays clean except the assigned files.

## Task 1: Zhuge Liang Seed 9003 Balance

**Owner:** Builder worktree `wave9-zhuge-balance`.

**Files:**

- Modify: `tests/playtest/run-simulator.test.ts`
- Modify as needed: `src/game/systems/debug/runSimulator.ts`
- Modify only if root-cause evidence shows actual content tuning is better than simulator support: `src/game/content/cards.ts`, `src/game/content/relics.ts`, `src/game/content/methods.ts`
- Modify: `Documentation.md`

**Acceptance Criteria:**

- Multi-seed report for `9001,9002,9003` completes all 12 representative routes.
- Zhuge Liang completes all three seeds and reaches `moyuan`.
- No timeout risks and no unsafe damage spikes are introduced.
- The fix preserves Zhuge Liang's documented identity: low HP, high strategy, formation/scry defensive planning.
- No Phaser scene or DOM UI file is edited.

- [ ] **Step 1: Add the failing multi-seed regression test**

Append this assertion to the existing `builds a deterministic multi-seed balance aggregate` test in `tests/playtest/run-simulator.test.ts`:

```ts
expect(report.aggregate.completedRoutes).toBe(12);
expect(report.aggregate.characters.zhugeliang.completed).toBe(3);
expect(report.routes.filter((route) => route.characterId === "zhugeliang").every((route) => route.outcome === "completed")).toBe(true);
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts
```

Expected: FAIL because the Wave 8 report has `completedRoutes === 11` and `zhugeliang.completed === 2`.

- [ ] **Step 3: Investigate root cause before tuning**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
```

Record the exact Zhuge Liang seed `9003` failure chapter/enemy, turns, damage taken, lowest HP, and last route node in `Documentation.md`.

- [ ] **Step 4: Implement one root-cause fix**

Choose exactly one of these fixes after evidence:

1. If the failure is simulator route support starving formation defense, add `relic_starlit_tactical_map` to `ALPHA_SIMULATION_RELIC_IDS.zhugeliang` before generic relics so formation cards generate enough 筹策.
2. If the failure is too few defensive support cards in later chapters, adjust `ALPHA_SIMULATION_CARD_IDS.zhugeliang` order so `zhuge_straw_boats` and `zhuge_stone_array` arrive before the second damage rare.
3. If the failure is a real content weakness across normal play, tune only Zhuge defensive content by increasing `zhuge_guard` from 5/8 block to 6/9 block or `zhuge_small_eight_array` initial block from 4/6 to 5/7. Update matching tests/descriptions.

Do not stack fixes. Re-run the report after one change before trying another.

- [ ] **Step 5: Run GREEN and focused gates**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/combat/combat-system.test.ts tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all pass, balance report says `Routes completed: 12/12`, timeout risks `0`, unsafe damage spikes `0`.

- [ ] **Step 6: Commit**

```bash
git add tests/playtest/run-simulator.test.ts src/game/systems/debug/runSimulator.ts src/game/content/cards.ts src/game/content/relics.ts src/game/content/methods.ts Documentation.md
git commit -m "fix: stabilize zhuge multi-seed route"
```

Only stage files that actually changed.

## Task 2: Starter Card Semantic Art Pass

**Owner:** Builder worktree `wave9-starter-card-art`.

**Files:**

- Create: `public/assets/generated/cards/wave9-*.svg`
- Modify: `src/game/content/visuals.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `Documentation.md`

**Acceptance Criteria:**

- Add semantic, non-type-fallback card art for these 11 starter readability cards:
  `zhao_strike`, `zhao_guard`, `zhao_longdan`, `diao_strike`, `diao_guard`, `diao_lingbo`, `cai_plain_strike`, `cai_pluck_string`, `cai_gong_tone`, `zhuge_fan_strike`, `zhuge_guard`.
- `scripts/audit-generated-assets.mjs` lowers `card fallback debt` by at least 11.
- New assets are under `/assets/generated/cards/`, have no text labels inside the artwork, and are not the shared `type_*` fallback paths.

- [ ] **Step 1: Add failing content assertions**

Add a test to `tests/data/content.test.ts` near existing card-art assertions:

```ts
it("binds semantic starter card art away from shared type fallbacks", () => {
  const starterArtIds = [
    "zhao_strike",
    "zhao_guard",
    "zhao_longdan",
    "diao_strike",
    "diao_guard",
    "diao_lingbo",
    "cai_plain_strike",
    "cai_pluck_string",
    "cai_gong_tone",
    "zhuge_fan_strike",
    "zhuge_guard"
  ];

  for (const id of starterArtIds) {
    expect(cardArtById[id]?.assetPath).toMatch(/^\/assets\/generated\/cards\/wave9-/);
    expect(cardArtById[id]?.assetPath).not.toBe(cardArtById.type_attack.assetPath);
    expect(cardArtById[id]?.assetPath).not.toBe(cardArtById.type_skill.assetPath);
  }
});
```

If `cardArtById` is not imported in that file, extend the existing `visuals` import rather than adding a new manifest parser.

- [ ] **Step 2: Run RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
```

Expected: FAIL because these ids currently use missing direct art or shared type fallback.

- [ ] **Step 3: Create dedicated SVG assets**

Create one compact SVG per card using this pattern, varying palette and motif per card. Example for `zhuge_guard`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Zhuge guard ink card art">
  <rect width="512" height="512" fill="#eee5d3"/>
  <path d="M54 392C126 312 206 262 320 236c58-14 96-38 132-82" fill="none" stroke="#1f3f44" stroke-width="28" stroke-linecap="round" opacity=".82"/>
  <path d="M128 150c66 18 142 18 226 0 10 76 0 142-46 200-26 32-58 56-96 74-39-18-72-42-98-74-45-58-56-124-46-200z" fill="#f8f1df" stroke="#2d3a3a" stroke-width="12"/>
  <path d="M174 248h116M198 292h88M225 194l58 116" fill="none" stroke="#b38a39" stroke-width="10" stroke-linecap="round" opacity=".85"/>
  <circle cx="368" cy="132" r="36" fill="none" stroke="#b38a39" stroke-width="8" opacity=".72"/>
</svg>
```

Required destination names:

```text
public/assets/generated/cards/wave9-zhao-strike.svg
public/assets/generated/cards/wave9-zhao-guard.svg
public/assets/generated/cards/wave9-zhao-longdan.svg
public/assets/generated/cards/wave9-diao-strike.svg
public/assets/generated/cards/wave9-diao-guard.svg
public/assets/generated/cards/wave9-diao-lingbo.svg
public/assets/generated/cards/wave9-cai-plain-strike.svg
public/assets/generated/cards/wave9-cai-pluck-string.svg
public/assets/generated/cards/wave9-cai-gong-tone.svg
public/assets/generated/cards/wave9-zhuge-fan-strike.svg
public/assets/generated/cards/wave9-zhuge-guard.svg
```

- [ ] **Step 4: Bind card art definitions**

Add `CardArtDefinition` entries in `src/game/content/visuals.ts` before the `type_*` fallback entries. Use accents:

```ts
{ id: "zhao_strike", assetPath: "/assets/generated/cards/wave9-zhao-strike.svg", alt: "Zhao Yun spear strike card art in teal ink", accent: "teal" },
{ id: "zhao_guard", assetPath: "/assets/generated/cards/wave9-zhao-guard.svg", alt: "Zhao Yun guard card art with spear wall", accent: "teal" },
{ id: "zhao_longdan", assetPath: "/assets/generated/cards/wave9-zhao-longdan.svg", alt: "Zhao Yun Longdan card art with white dragon spear", accent: "teal" },
{ id: "diao_strike", assetPath: "/assets/generated/cards/wave9-diao-strike.svg", alt: "Diao Chan fan strike card art in red silk ink", accent: "red" },
{ id: "diao_guard", assetPath: "/assets/generated/cards/wave9-diao-guard.svg", alt: "Diao Chan guarded dance card art with ribbon screen", accent: "red" },
{ id: "diao_lingbo", assetPath: "/assets/generated/cards/wave9-diao-lingbo.svg", alt: "Diao Chan Lingbo step card art with petal footwork", accent: "teal" },
{ id: "cai_plain_strike", assetPath: "/assets/generated/cards/wave9-cai-plain-strike.svg", alt: "Cai Wenji plain strike card art with qin-string slash", accent: "teal" },
{ id: "cai_pluck_string", assetPath: "/assets/generated/cards/wave9-cai-pluck-string.svg", alt: "Cai Wenji pluck string card art with teal sound waves", accent: "teal" },
{ id: "cai_gong_tone", assetPath: "/assets/generated/cards/wave9-cai-gong-tone.svg", alt: "Cai Wenji gong tone card art with resonant jade wave", accent: "gold" },
{ id: "zhuge_fan_strike", assetPath: "/assets/generated/cards/wave9-zhuge-fan-strike.svg", alt: "Zhuge Liang fan strike card art with wind and star chart", accent: "teal" },
{ id: "zhuge_guard", assetPath: "/assets/generated/cards/wave9-zhuge-guard.svg", alt: "Zhuge Liang guard card art with formation shield", accent: "teal" }
```

- [ ] **Step 5: Run GREEN and audit**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: content test passes, audit reports missing `0`, card fallback debt at most `45`.

- [ ] **Step 6: Update docs and commit**

Update `docs/art/gpt2-priority-queue.md` and `Documentation.md` with the exact new audit count and state clearly that Wave 9 starter art is semantic repo-local SVG, not GPT Image 2 bitmap generation.

```bash
git add public/assets/generated/cards src/game/content/visuals.ts tests/data/content.test.ts docs/art/gpt2-priority-queue.md Documentation.md
git commit -m "feat: add semantic starter card art"
```

## Task 3: First-Chapter Semantic Attack Strips

**Owner:** Builder worktree `wave9-first-chapter-attacks`.

**Files:**

- Create: `public/assets/sprites/wave9-sword-echo-attack-strip.svg`
- Create: `public/assets/sprites/wave9-blood-banner-attack-strip.svg`
- Create: `public/assets/sprites/wave9-ink-dongzhuo-boss-attack-strip.svg`
- Modify: `src/game/content/visuals.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `Documentation.md`

**Acceptance Criteria:**

- `getCombatAttackSprite("elite_sword_echo")`, `getCombatAttackSprite("elite_blood_banner")`, and `getCombatAttackSprite("boss_ink_dongzhuo")` return semantic `wave9-*` strips.
- None of the three use `/assets/sprites/enemy-slash-strip.svg` or the quarantined `*-gpt-v2.png` paths.
- Existing visual-smoke coverage proves first-chapter stand-ins do not swap to generic slash.
- Asset audit remains missing `0`.

- [ ] **Step 1: Replace the old standee-only expectation with RED assertions**

In `tests/data/content.test.ts`, replace the expectation that the three ids return `undefined` with:

```ts
expect(visuals.getCombatAttackSprite("elite_sword_echo")?.assetPath).toBe("/assets/sprites/wave9-sword-echo-attack-strip.svg");
expect(visuals.getCombatAttackSprite("elite_blood_banner")?.assetPath).toBe("/assets/sprites/wave9-blood-banner-attack-strip.svg");
expect(visuals.getCombatAttackSprite("boss_ink_dongzhuo")?.assetPath).toBe("/assets/sprites/wave9-ink-dongzhuo-boss-attack-strip.svg");
for (const id of ["elite_sword_echo", "elite_blood_banner", "boss_ink_dongzhuo"]) {
  expect(visuals.getCombatAttackSprite(id)?.assetPath).not.toBe("/assets/sprites/enemy-slash-strip.svg");
}
```

- [ ] **Step 2: Run RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
```

Expected: FAIL because the three ids currently return `undefined`.

- [ ] **Step 3: Add semantic SVG sprite strips**

Each SVG must be `viewBox="0 0 2048 512"` with four 512-wide frames. Use repeated silhouettes, weapon/banner/boss motifs, and motion arcs. Do not include text labels. Use the same frame dimensions as the existing sprite manifest.

Minimal frame scaffold:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 512" role="img" aria-label="Sword echo four frame attack strip">
  <rect width="2048" height="512" fill="none"/>
  <g transform="translate(0 0)">...</g>
  <g transform="translate(512 0)">...</g>
  <g transform="translate(1024 0)">...</g>
  <g transform="translate(1536 0)">...</g>
</svg>
```

- [ ] **Step 4: Bind sprite sheets**

Add three `combatSpriteSheetList` entries:

```ts
{
  id: "sword_echo_attack",
  assetPath: "/assets/sprites/wave9-sword-echo-attack-strip.svg",
  frameCount: 4,
  frameWidth: 512,
  frameHeight: 512,
  anchor: "bottom-center"
}
```

Repeat for `blood_banner_attack` and `ink_dongzhuo_boss_attack`.

Remove the three ids from `standeeOnlyAttackCombatantIds` and map:

```ts
elite_sword_echo: "sword_echo_attack",
elite_blood_banner: "blood_banner_attack",
boss_ink_dongzhuo: "ink_dongzhuo_boss_attack",
```

- [ ] **Step 5: Update visual-smoke wording**

Keep the existing browser test intent but rename it to assert semantic strips, and ensure it still checks the three attack assets are not the generic slash path.

- [ ] **Step 6: Run GREEN and browser smoke**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all pass, audit missing `0`.

- [ ] **Step 7: Update docs and commit**

Update `docs/art/gpt2-priority-queue.md` and `Documentation.md` to state the generic slash restriction has been replaced by semantic Wave 9 strips, while bespoke GPT Image 2 regeneration may remain an art-quality backlog.

```bash
git add public/assets/sprites src/game/content/visuals.ts tests/data/content.test.ts tests/e2e/visual-smoke.spec.ts docs/art/gpt2-priority-queue.md Documentation.md
git commit -m "feat: add first chapter semantic attack strips"
```

## Task 4: Release Docs Refresh

**Owner:** Builder worktree `wave9-release-docs`.

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `docs/playtest/desktop-playtest-checklist.md`
- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `Documentation.md`

**Acceptance Criteria:**

- Docs do not reference stale Wave 8 counts after integration.
- Docs mention the exact Wave 9 balance, Playwright, Vitest, asset audit, and fallback debt results after the integration branch provides them.
- Docs preserve desktop-first scope and `调试跳章` debug-only framing.

- [ ] **Step 1: Prepare docs placeholders tied to final verification**

Update docs with a clearly named Wave 9 section that says counts must be refreshed after integration. Do not invent numbers.

- [ ] **Step 2: Run release-doc grep**

```bash
grep -n "Wave 9\\|调试跳章\\|desktop\\|Playwright\\|card fallback debt\\|Zhuge" README.md docs/playtest/desktop-playtest-checklist.md docs/playtest/alpha-acceptance.md docs/art/gpt2-priority-queue.md
git diff --check
```

Expected: grep finds all release terms and diff check passes.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md docs/art/gpt2-priority-queue.md Documentation.md
git commit -m "docs: prepare wave9 release refresh"
```

## Integration Plan

- [ ] Merge `codex/wave9-zhuge-balance` first because docs and acceptance numbers depend on balance evidence.
- [ ] Merge `codex/wave9-starter-card-art` second because it changes `visuals.ts` and content tests.
- [ ] Merge `codex/wave9-first-chapter-attacks` third because it also changes `visuals.ts`; resolve conflicts by preserving all new card art entries and all new sprite sheet entries.
- [ ] Merge `codex/wave9-release-docs` last, then refresh all docs to final integrated gate counts.
- [ ] Run the full Wave 9 gate:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

## Self-Review

- Spec coverage: Covers the three Wave 8 risks called out in `Documentation.md`: Zhuge seed `9003`, card fallback art debt, and first-chapter attack strip debt. Includes docs refresh as final release handoff.
- Placeholder scan: No open-ended implementation steps remain. Task 4 may use clearly marked final-count refresh notes only as a docs branch before final integration; final integration must replace them with verified numbers.
- Type consistency: Uses current ids from `src/game/content/visuals.ts`, `tests/data/content.test.ts`, `scripts/audit-generated-assets.mjs`, and the balance report API.
- Scope: Desktop browser only. No mobile layout, no Phaser gameplay logic, no broad card-pool rebalance.
