# EA Playable Showcase Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring 《云水江湖》 from the verified desktop alpha into an EA-quality playable showcase that foregrounds distinctive gameplay, richer content volume, polished art/audio/UI presentation, and repeatable run variety.

**Architecture:** Keep Phaser as a battlefield renderer, DOM as the text-heavy HUD/menu layer, and pure TypeScript systems as the source of truth for combat, run progression, saves, profile, endings, events, relics, methods, and debug reports. The EA plan excludes Steam packaging and storefront release work; the target remains a desktop-browser playable build that can impress external players with feature depth and commercial-grade presentation.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, Playwright, DOM/CSS HUD, project-local generated PNG/SVG asset workflow, browser WebAudio.

---

## Current Baseline

Docs and files read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `docs/云水江湖_世界观与背景故事设定文档_v0.3.md`
- `docs/云水江湖_通用牌组设计文档_v1.0.md`
- `docs/chapters/chapter_01.md`
- `docs/chapters/chapter_02.md`
- `docs/chapters/chapter_03.md`
- `docs/chapters/final_chapter.md`
- `docs/character_settings/赵云_角色设定文档.md`
- `docs/character_settings/貂蝉_角色设定文档.md`
- `docs/character_settings/蔡文姬_角色设定文档.md`
- `docs/character_settings/诸葛亮_角色设定文档.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/superpowers/specs/2026-05-03-wave6-ea-readiness-design.md`

Current content counts from the Vite content modules:

| Category | Current | EA target | Gap |
|---|---:|---:|---:|
| Playable characters | 4 | 4 | 0 |
| Chapters | 4 | 3 main + final | 0 |
| Cards | 81 | 150+ | 69+ |
| Relics | 20 | 60+ | 40+ |
| Events | 29 | 40+ | 11+ |
| Enemies | 19 | Broader chapter/final pools | Needs final-chapter depth |
| Methods | 8 | 16+ or 3-level depth | 8+ or upgrade tier |
| World endings | 5 | Basic multi-ending | 0 |
| Character epilogues | 16 | Character-flavored endings | Needs trigger coverage polish |
| Logbook fragments | 14 | Strong lore/meta collection | Needs expansion |

User scope update:

- Do not spend EA effort on Steam launch, installers, depots, storefront metadata, or other publishing infrastructure.
- Keep the current desktop-browser target.
- Prioritize making external players see and play the game's distinctive mechanics and commercial-quality content, art, UI, audio, and polish.

## EA Quality Pillars

1. **Feature Visibility**
   - Character mechanics, mind state, ink risk, combo chains, methods, relic triggers, and route consequences must be visible without reading docs.
   - Debug controls must not look like player-facing progression.

2. **Content Volume**
   - Expand from 81 cards to 120 in the first content wave and 150+ before EA readiness.
   - Expand from 20 relics to 40 in the first relic wave and 60+ before EA readiness.
   - Expand from 29 events to 45+, with role-specific choices for all four characters.

3. **Replayability**
   - Add challenge seeds / difficulty mutators after content-count gates exist.
   - Add profile goals and achievement-like meta objectives that expose why a player might start another run.

4. **Commercial Presentation**
   - Polish title, character select, map, combat, reward, event, and final-choice surfaces so they feel like a finished demo rather than a tool screen.
   - Add music/ambience/SFX manifest and settings coverage while preserving no-op safety.
   - Improve asset quality for high-visibility enemies, cards, events, and chapter backgrounds.

5. **Reliability**
   - Continue using deterministic systems and browser QA gates.
   - Add save migration/recovery and player-visible recovery UX before broad external play.

## Master Wave Sequence

### Wave 26: EA Public Demo Surface And Debug Gate

**Purpose:** Make the current build safe and polished for external players by moving debug affordances behind an explicit dev/test gate and adding EA content metric baselines.

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/app/settingsPersistence.ts` if a persisted developer setting already fits the local pattern
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `README.md`
- Modify: `Documentation.md`

**Acceptance:**

- Default browser title/run UI does not show `调试跳章`, direct final-route debug actions, or debug ending summary actions.
- Playwright can still enable debug tools through an explicit test-only mechanism and keep the existing final boss/debug-skip coverage.
- Data tests record the current EA baseline counts: 81 cards, 20 relics, 29 events, 19 enemies, 8 methods.
- README and acceptance docs describe the build as an EA-playable showcase target, not Steam/release packaging.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "debug skip|final boss route|boots"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

### Wave 27: EA Card Pool Expansion I

**Purpose:** Raise card pool from 81 to at least 120 while preserving existing completion balance.

**Files:**

- Modify: `src/game/content/cards.ts`
- Modify: `src/game/content/glossary.ts`
- Modify: `src/game/content/visuals.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `docs/云水江湖_通用牌组设计文档_v1.0.md` only if the implemented card set records design decisions
- Modify: `Documentation.md`

**Acceptance:**

- Total cards `>= 120`.
- Each character has at least 20 non-status cards.
- Neutral/common cards reach at least 35.
- Ink/status/mind cards expand without adding unchecked infinite energy/draw loops.
- Multi-seed balance remains 12/12 routes with timeout risks 0 and unsafe spikes 0.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 | grep "Routes completed"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
```

### Wave 28: EA Relic Pool Expansion I

**Purpose:** Raise relic pool from 20 to at least 40 with visible archetype support and safe trigger rules.

**Files:**

- Modify: `src/game/content/relics.ts`
- Modify: `src/game/systems/relics/relicEffects.ts`
- Modify: `src/game/systems/combat/combat.ts` only for new hook types that cannot be expressed by existing hooks
- Modify: `tests/relics/relic-system.test.ts`
- Modify: `tests/combat/combat-system.test.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Relics `>= 40`.
- At least 20 neutral relics and at least 5 character/archetype relics per character.
- Elite, boss, and shop sources are explicit.
- Every new triggered relic has a deterministic unit test.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/relics/relic-system.test.ts tests/combat/combat-system.test.ts tests/data/content.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts --reporter=dot
```

### Wave 29: EA Event And Logbook Expansion

**Purpose:** Raise event pool from 29 to at least 45 and make all four characters' story hooks visible in route play.

**Files:**

- Modify: `src/game/content/events.ts`
- Modify: `src/game/systems/events/eventEffects.ts`
- Modify: `src/game/content/logbook.ts`
- Modify: `src/game/systems/logbook/logbook.ts`
- Modify: `tests/events/event-system.test.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `tests/compendium/compendium-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Events `>= 45`.
- Every chapter has at least 10 event candidates or documented final-chapter exception coverage.
- Zhao Yun, Diao Chan, Cai Wenji, and Zhuge Liang each have visible role-specific event options.
- New event outcomes use typed effects and do not bypass economy constraints.
- Logbook fragments cover the new story beats.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/events/event-system.test.ts tests/run/run-system.test.ts tests/compendium/compendium-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "event|compendium"
```

### Wave 30: Final Chapter Enemy And Boss Depth

**Purpose:** Turn `墨渊照心` from a final boss route shell into a fuller final chapter encounter set.

**Files:**

- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/content/chapters.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/game/systems/debug/runSimulator.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/run/run-system.test.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Final chapter has at least 3 normal enemies, 2 elites, and `无名史官` boss.
- New final enemies embody mind/ink/rewriting mechanics without hard-countering one character.
- Multi-seed final route coverage remains green for all four characters.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts tests/run/run-system.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "final boss route"
```

### Wave 31: Challenge Seed And Difficulty MVP

**Purpose:** Add repeatable run variety through opt-in challenge seeds and difficulty modifiers, not storefront features.

**Files:**

- Create: `src/game/systems/challenges/challenges.ts`
- Create: `tests/challenges/challenge-system.test.ts`
- Modify: `src/game/systems/run/types.ts`
- Modify: `src/game/systems/run/run.ts`
- Modify: `src/game/systems/combat/combat.ts`
- Modify: `src/game/systems/debug/balanceReport.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Add at least 3 named challenge seeds / difficulty profiles.
- Balance report can render profile-specific evidence.
- Title or character-select UI exposes challenge selection in a polished, non-debug way.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/challenges/challenge-system.test.ts tests/playtest/run-simulator.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "challenge"
```

### Wave 32: Profile Goals And Achievement-Like Meta Layer

**Purpose:** Give players reasons to replay without requiring platform achievements.

**Files:**

- Create: `src/game/content/goals.ts`
- Create: `src/game/systems/profile/goals.ts`
- Create: `tests/profile/profile-goals.test.ts`
- Modify: `src/game/systems/profile/profile.ts`
- Modify: `src/game/systems/compendium/compendium.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/profile/profile-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Add at least 16 profile goals across character mastery, endings, challenge runs, deck archetypes, and lore unlocks.
- Run summary shows newly advanced goals.
- Compendium/profile surfaces show progress without platform integrations.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/profile/profile-system.test.ts tests/profile/profile-goals.test.ts tests/compendium/compendium-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "profile|summary|compendium"
```

### Wave 33: Save Migration And Recovery UX

**Purpose:** Reduce external-play risk as systems keep growing.

**Files:**

- Modify: `src/game/systems/save/save.ts`
- Modify: `src/game/systems/profile/profile.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/save/save-system.test.ts`
- Modify: `tests/profile/profile-system.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Add explicit save/profile migration registry.
- Corrupt saves produce a player-visible recovery action instead of silent failure.
- Invalid profile recovery preserves as much safe profile data as possible.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/save/save-system.test.ts tests/profile/profile-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "continue|save|recovery"
```

### Wave 34: Gameplay Teaching And Feature Showcase Pass

**Purpose:** Teach distinct mechanics in-game so first-time external players notice what is special.

**Files:**

- Modify: `src/game/systems/tutorial/onboarding.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `tests/app-settings.test.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Add role-specific feature callouts for all four characters.
- Add map/reward/mind/ink/method explanations as short, dismissible, replay-safe hints.
- Hints respect reduced motion and persisted dismissal.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "onboarding|tutorial|hint"
```

### Wave 35: Commercial UI Polish Pass

**Purpose:** Make key screens feel like a coherent commercial demo, not a debug prototype.

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Title, character select, map, reward, event, shop, rest, compendium, final choice, and run summary have consistent paper/ink hierarchy.
- Text fits in controls at desktop sizes.
- Visual smoke asserts no overlap on the most important surfaces.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "compendium|final boss route|settings"
```

### Wave 36: Audio Atmosphere And Settings Pass

**Purpose:** Raise perceived quality through safe BGM/ambience/SFX layers and complete audio settings.

**Files:**

- Modify: `src/app/audioFeedback.ts`
- Modify: `src/app/settingsPersistence.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Add: `public/assets/audio/manifest.json`
- Add: `public/assets/audio/README.md`
- Modify: `tests/app-settings.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Add audio manifest for chapter ambience, combat cues, UI clicks, victory/defeat, final choice, and no-op fallback.
- Settings expose master/music/SFX toggles or sliders.
- Reduced-motion/no-audio safe paths remain deterministic in tests.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "settings"
```

### Wave 37: Art Quality Pass For High-Visibility Content

**Purpose:** Replace the next most visible semantic/SVG or lower-fidelity art with commercial-facing assets.

**Files:**

- Modify: `docs/art/gpt2-priority-queue.md`
- Modify: `src/game/content/visuals.ts`
- Modify: `public/assets/generated/asset-audit.json`
- Add: `public/assets/generated/cards/*.png`
- Add: `public/assets/generated/events/*.png` if event art surfaces are added
- Add: `public/assets/generated/enemies/*.png`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `Documentation.md`

**Acceptance:**

- Replace high-visibility remaining non-starter card faces or enemy/event illustrations selected from the audit queue.
- Preserve source sheets under `public/assets/generated/sources/`.
- Asset audit reports missing 0 and card fallback debt 0.
- Browser screenshots show nonblank, properly framed art.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/data/content.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts
```

### Wave 38: EA Content Scale II And Final Balance Gate

**Purpose:** Push content counts to EA target and produce a final playable-showcase evidence bundle.

**Files:**

- Modify: `src/game/content/cards.ts`
- Modify: `src/game/content/relics.ts`
- Modify: `src/game/content/events.ts`
- Modify: `src/game/content/enemies.ts`
- Modify: `tests/data/content.test.ts`
- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `scripts/balance-report.mjs` only if report fields need new content-count output
- Modify: `docs/playtest/alpha-acceptance.md` or create an EA-focused `docs/playtest/ea-playable-showcase-checklist.md`
- Modify: `README.md`
- Modify: `Documentation.md`

**Acceptance:**

- Cards `>= 150`.
- Relics `>= 60`.
- Events `>= 45`.
- Multi-seed simulator remains green for all four characters.
- Full Playwright desktop gate passes.
- README describes the EA playable showcase, not storefront packaging.

**Verification:**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003
git diff --check
```

## Parallelization Rules

- Use worktrees for independent slices.
- Do not parallelize broad edits to `src/app/inkbladeController.ts` unless write scopes are clearly disjoint.
- Content count tests can run in a docs/data worker while UI workers handle Playwright-focused surfaces.
- Card, relic, event, enemy, audio, and art waves can each use explorer/tester subagents in parallel, but integration should happen in one main worktree with fresh verification.

## Plan Self-Review

- Spec coverage: The plan covers content scale, distinctive mechanics visibility, replayability, UI/audio/art polish, reliability, and final EA evidence. Steam/storefront packaging is intentionally excluded per the user's latest instruction.
- Placeholder scan: No task depends on unspecified files or future decisions. Each wave has exact file targets and verification commands.
- Type consistency: Existing project terms are preserved: cards, relics, events, enemies, methods, profile, compendium, final choices, and balance report.
