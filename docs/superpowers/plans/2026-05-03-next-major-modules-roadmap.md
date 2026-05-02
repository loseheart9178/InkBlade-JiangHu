# Next Major Modules Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the next five large modules after character archetype card-pool deepening, in the order that most improves repeatable play, build clarity, and vertical-slice polish.

**Architecture:** Keep gameplay rules in TypeScript systems under `src/game/systems/`; keep content data in `src/game/content/`; keep Phaser as visual adapter and DOM as text-heavy HUD/menu layer. Every module starts by re-reading relevant `docs/` files and logging them in `Documentation.md`.

**Tech Stack:** Phaser, TypeScript, Vite, Vitest, Playwright, DOM/CSS HUD, project-local generated raster assets.

---

## Recommended Order

1. **流派成型反馈与牌组诊断 MVP**
2. **心法系统 MVP 与流派定向成长**
3. **第一章事件池、心境倾向与角色剧情深化**
4. **法宝池与精英/Boss 奖励深化**
5. **专属卡图、招式演出与战斗氛围第二美术资产 Pass**

This order first makes the new archetype work visible to players, then gives those archetypes long-term power, then adds route/story variety, then adds run-to-run build modifiers, and finally spends art effort on mechanics that have stabilized.

---

## Module 1: 流派成型反馈与牌组诊断 MVP

**Purpose:** Let players understand what their deck is becoming: 赵云偏连斩枪势还是护主防反，貂蝉偏舞势连击还是魅惑控制.

**Files:**

- Create: `src/game/systems/deck/archetype.ts`
- Test: `tests/deck/archetype-system.test.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Scope:**

- Add a pure `analyzeDeckArchetypes(runOrCards)` function.
- Score archetypes from `CardDefinition.archetypes`.
- Show top archetype in run status, deck viewer, and reward screen.
- In reward UI, mark whether a card is `主线强化`, `副线补强`, or `通用补短`.
- Do not add new gameplay power yet.

**Acceptance Criteria:**

- Unit tests prove Zhao/Diao decks produce expected archetype scores after adding cards.
- Browser test opens deck viewer and sees the current build direction.
- Reward screen displays recommendation reason plus whether it strengthens the current build.

**Verification:**

```bash
npm test -- tests/deck/archetype-system.test.ts tests/run/run-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
```

---

## Module 2: 心法系统 MVP 与流派定向成长

**Purpose:** Turn archetypes into durable run-defining choices without building the full late-game 心法 system.

**Files:**

- Create: `src/game/content/methods.ts`
- Create: `src/game/systems/methods/methods.ts`
- Test: `tests/methods/method-system.test.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Scope:**

- Add 4 MVP heart methods:
  - `method_dragon_spear_chain`: 赵云连斩枪势流.
  - `method_changban_guard`: 赵云护主防反流.
  - `method_jinghong_dance`: 貂蝉舞势连击流.
  - `method_qingcheng_charm`: 貂蝉魅惑控制流.
- Award heart-method choice after first elite or Boss bridge.
- Apply simple deterministic effects:
  - 连斩枪势: first attack chain reward each combat gains +1 枪势.
  - 护主防反: first guard/block card each combat grants +1 护主.
  - 舞势连击: first body card each combat gains +1 舞势.
  - 魅惑控制: first charm application each combat adds +1 魅惑.
- Show owned heart method in run status and deck viewer.

**Acceptance Criteria:**

- Run state persists selected methods through save/continue.
- Combat tests prove each method modifies exactly its first eligible trigger per combat.
- Browser test can choose a method and see it listed afterward.

**Verification:**

```bash
npm test -- tests/methods/method-system.test.ts tests/combat/combat-system.test.ts tests/save/save-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

---

## Module 3: 第一章事件池、心境倾向与角色剧情深化

**Purpose:** Improve route replayability and make events meaningfully feed deck, mind, and character identity.

**Files:**

- Modify: `src/game/content/events.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/run/run.ts`
- Create: `src/game/systems/events/eventEffects.ts`
- Test: `tests/events/event-system.test.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Scope:**

- Expand 第一章 event count toward 10 meaningful events.
- Add run-level mind tendency fields: `ning`, `nu`, `bei`, `mei`, `luan`, `wu`.
- Make event choices use typed effects: gold, heal, hp loss, card add, remove starter, upgrade, mind tendency, ink card offer.
- Add at least two role-specific event choices each for Zhao Yun and Diao Chan.
- Keep event copy short and readable.

**Acceptance Criteria:**

- Unit tests prove event effects mutate run state deterministically.
- Route map can generate varied event IDs by seed.
- Browser test verifies one Zhao and one Diao role-specific event choice.
- Event screen shows mind/ink consequence text before choice.

**Verification:**

```bash
npm test -- tests/events/event-system.test.ts tests/run/run-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

---

## Module 4: 法宝池与精英/Boss 奖励深化

**Purpose:** Make elite/Boss routing more exciting by giving relics enough identity to support archetypes and risk/reward.

**Files:**

- Modify: `src/game/content/relics.ts`
- Create: `src/game/systems/relics/relicEffects.ts`
- Test: `tests/relics/relic-system.test.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Scope:**

- Expand relic pool to roughly 12 first-chapter relics.
- Add archetype-support relics:
  - 连斩枪势: third attack bonus.
  - 护主防反: guard success reward.
  - 舞势连击: body card tempo.
  - 魅惑控制: charm threshold reward.
  - 通用墨灾: ink safety or ink payoff.
- Split relic rewards by source: elite, boss, shop.
- Show relic rarity/source and trigger text in UI.

**Acceptance Criteria:**

- Unit tests prove relics trigger at correct combat hook and do not double-fire.
- Elite rewards can draw from a larger unowned pool.
- Shop can sell at least one new relic without breaking existing purchase flow.
- Browser combat log shows a new relic trigger name.

**Verification:**

```bash
npm test -- tests/relics/relic-system.test.ts tests/combat/combat-system.test.ts tests/run/run-system.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/playable-flow.spec.ts
npm test
npm run build
npm run test:e2e
```

---

## Module 5: 专属卡图、招式演出与战斗氛围第二美术资产 Pass

**Purpose:** Replace fallback art for high-impact archetype cards and make signature actions read closer to the user's ink-wash wuxia reference.

**Files:**

- Modify: `skills/inkblade-art-asset-pipeline/SKILL.md` only if the workflow needs a discovered improvement.
- Modify: `src/game/content/visuals.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Test: `tests/data/content.test.ts`
- Test: `tests/e2e/visual-smoke.spec.ts`
- Add assets under:
  - `public/assets/generated/cards/`
  - `public/assets/generated/vfx/`
  - `public/assets/sprites/`
- Modify: `Documentation.md`

**Scope:**

- Re-read art and character docs before generation.
- Generate dedicated card art for the new archetype cards from Module 24.
- Add signature VFX/sprite cues for:
  - 赵云：七进七出 / 枪围如墙.
  - 貂蝉：惊鸿一击 / 离间.
- Keep desktop-first only.
- Preserve source images and transparent/cropped outputs.
- Add visual checks for nonblank card art and no standee/hand overlap.

**Acceptance Criteria:**

- Every new archetype card has a specific `cardArtById` entry.
- Browser visual smoke confirms desktop combat remains readable.
- Screenshots show no raw background, broken alpha, or overlapping fallback placeholder.
- Generated asset process is logged in `Documentation.md`.

**Verification:**

```bash
npm test -- tests/data/content.test.ts
npm run typecheck
npm run test:e2e -- tests/e2e/visual-smoke.spec.ts
npm test
npm run build
npm run test:e2e
```

---

## Cross-Module Rules

- Before each module, re-read the relevant PRD, gameplay, world/chapter, character, and art docs, then record the list in `Documentation.md`.
- Use TDD for gameplay/data behavior before production code.
- Keep renderer code thin; UI reads system output and does not own gameplay rules.
- Commit after each verified module.
- Desktop browser remains the only layout target unless the user explicitly reopens mobile support.

## Suggested Commit Sequence

1. `feat: show deck archetype diagnostics`
2. `feat: add heart method choices`
3. `feat: deepen chapter one events`
4. `feat: expand relic reward identity`
5. `feat: add archetype card art pass`
