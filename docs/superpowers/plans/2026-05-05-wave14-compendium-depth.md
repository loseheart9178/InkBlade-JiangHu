# Wave 14 Compendium Unlock Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add profile-aware unlock depth to the desktop compendium so QA and players can distinguish discovered story/endings from preview/reference content without hiding the full alpha reference.

**Architecture:** Keep unlock classification in the pure compendium system. The DOM controller should render metadata from `buildCompendium`; it must not infer unlock rules from text or profile internals. Phaser remains untouched.

**Tech Stack:** TypeScript, Vitest, Playwright, existing DOM compendium UI.

---

## Context And Constraints

Use the bundled Node runtime:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/superpowers/plans/2026-05-05-wave13-simulator-report-artifacts.md`

Current Wave 13 baseline:

- Branch: `codex/wave13-simulator-report-artifacts`
- Vitest: 19 files / 190 tests
- TypeScript: passed
- Vite build: passed without the previous Phaser chunk-size warning
- Playwright desktop: 27 Chromium tests
- Asset audit: runtime references 159, missing 0, card fallback debt 0
- Balance report artifact: stdout and `--out` file matched

Implementation rules:

- Desktop browser only.
- Keep compendium rules outside renderer code.
- Preserve the current full-reference compendium; do not hide cards, relics, enemies, combos, or story entries.
- Add profile-aware unlock metadata and filters as a presentation layer, not as content deletion.
- Do not modify art assets or gameplay content.
- Milestone 58 remains the only open optional GPT Image 2 bitmap card-art quality pass.

## Task 1: Pure Compendium Unlock Metadata

**Files:**

- Modify: `src/game/systems/compendium/compendium.ts`
- Modify: `tests/compendium/compendium-system.test.ts`
- Do not modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Write failing pure-system tests**

Extend compendium tests to pass a profile with one unlocked fragment and one ending. Assert:

- `buildCompendium({ category: "story" }, profile)` marks matching story fragments as `unlockState: "unlocked"`.
- Locked story entries remain visible with `unlockState: "locked"`.
- `compendium.unlockSummary` reports total/unlocked/locked counts for story.
- Existing calls without a profile keep `unlockState: "reference"` for non-gated content.

- [ ] **Step 2: Implement pure metadata**

Add to `CompendiumItem`:

```ts
unlockState?: "reference" | "unlocked" | "locked";
unlockReason?: string;
```

Add to `CompendiumView`:

```ts
unlockSummary: {
  total: number;
  unlocked: number;
  locked: number;
};
```

Accept an optional `PlayerProfile` parameter in `buildCompendium(filters, profile)`.

Rules:

- Non-story content uses `reference`.
- Story entries use `unlocked` when their fragment id appears in `profile.unlockedFragments`.
- Story entries that unlock from a boss with an ending-ready boss id may use `profile.unlockedEndings.length > 0` only if an exact fragment unlock is unavailable; keep this conservative.
- Missing profile means story entries are `locked`, while non-story remains `reference`.

- [ ] **Step 3: Verify**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/compendium/compendium-system.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

## Task 2: DOM Compendium Unlock Badges And Filter

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify as needed: `src/styles/theme.css`

- [ ] **Step 1: Write failing browser assertions**

Extend the title compendium test to assert:

- `screen-compendium` exposes `data-unlocked-count`, `data-locked-count`, and `data-reference-count`.
- Story item cards expose `data-unlock-state`.
- A compact unlock filter/select can show all/reference/unlocked/locked states.

- [ ] **Step 2: Render metadata from the pure system**

- Pass `state.profile` to `buildCompendium`.
- Add an unlock filter to `CompendiumFilters`, defaulting to `"all"`.
- Render item cards with `data-unlock-state` and a small badge text:
  - `已录`
  - `未录`
  - `参照`
- Keep text compact and avoid changing card grid dimensions.

- [ ] **Step 3: Verify**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "compendium|墨录图鉴"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

## Task 3: Integration, Docs, And Release Gate

**Files:**

- Modify: `Documentation.md`
- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`

- [ ] **Step 1: Merge work**

If subagent usage is available, split Task 1 and Task 2 into separate worktrees. If usage remains blocked, implement sequentially in isolated worktrees from the main thread.

- [ ] **Step 2: Update docs**

Record:

```text
Wave 14 scope: profile-aware compendium unlock metadata, badges, and unlock filter while keeping full reference visibility.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Full release gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out D:/tmp/inkblade-balance-report.md >/mnt/d/tmp/inkblade-balance-stdout.md
test -s /mnt/d/tmp/inkblade-balance-report.md
cmp -s /mnt/d/tmp/inkblade-balance-report.md /mnt/d/tmp/inkblade-balance-stdout.md
rm -f /mnt/d/tmp/inkblade-balance-report.md /mnt/d/tmp/inkblade-balance-stdout.md
git diff --check
```

## Follow-Up Round Seed

After Wave 14 is verified and committed:

- Return to Milestone 58 if bitmap generation is available and worth a dedicated art pass.
- Otherwise continue polishing release-facing QA notes and human playtest scripts.
