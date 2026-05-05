# Wave 15 External Desktop Playtest Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the human desktop alpha playtest materials so an external tester can run the current Wave 14 build, cover the newly shipped compendium unlock depth, and file actionable bug reports without needing agent context.

**Architecture:** Documentation-only release hardening. Do not change gameplay logic, renderer behavior, art bindings, save schema, or content data. Keep the docs aligned with the verified desktop-first alpha gate.

**Tech Stack:** Markdown docs, existing Playwright/Vitest command references, current bundled Node runtime paths.

---

## Context And Constraints

Use the bundled Node runtime for verification commands when a command needs Node:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `README.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/playtest/desktop-playtest-checklist.md`
- `docs/superpowers/plans/2026-05-05-wave14-compendium-depth.md`

Current Wave 14 baseline:

- Branch: `codex/wave14-compendium-depth`
- Commit: `784e876 feat: add compendium unlock depth`
- Vitest: 19 files / 192 tests
- TypeScript: passed
- Vite build: passed without the previous Phaser chunk-size warning
- Playwright desktop: 27 Chromium tests
- Asset audit: runtime references 159, missing 0, card fallback debt 0
- Balance report artifact: stdout and `--out` file matched

Implementation rules:

- Desktop browser only.
- Do not reopen mobile layout or touch support.
- Do not modify gameplay systems or art assets.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass.
- Use worktrees/subagents only for independent documentation slices; merge only after review.

## Task 1: Refresh Desktop Playtest Checklist

**Files:**

- Modify: `docs/playtest/desktop-playtest-checklist.md`

- [ ] **Step 1: Update release focus**

Replace stale Wave 11 release focus with Wave 14 acceptance language:

- Wave 14 compendium unlock metadata.
- Wave 13 balance report artifact export.
- Wave 12 save/profile hardening.
- Wave 11 final-choice/glossary/chunk-budget closure.
- Milestone 58 remains optional art-quality backlog.

- [ ] **Step 2: Add explicit human routes**

Add compact route scripts for:

- Title compendium: verify `参照`, `未录`, and empty-state behavior.
- Run compendium: unlock one logbook fragment, reopen `墨录图鉴`, and confirm the run state is preserved.
- Save/reload: continue from map or combat.
- Debug skip: use only as prototype acceleration and label bug reports accordingly.
- Final boss route: verify final choice, reload from final choice, and ending/profile summary.

- [ ] **Step 3: Verification**

```bash
grep -n "Wave 14" docs/playtest/desktop-playtest-checklist.md
grep -n "compendium" docs/playtest/desktop-playtest-checklist.md
git diff --check
```

## Task 2: Add External Bug Intake Guide

**Files:**

- Add: `docs/playtest/external-bug-intake.md`
- Modify: `README.md`
- Modify as needed: `docs/playtest/alpha-acceptance.md`

- [ ] **Step 1: Create the guide**

The guide should include:

- Setup and branch/build recording fields.
- Severity rubric: blocker, major, minor, polish.
- Route tags: title, compendium, map, combat, reward, event, shop, rest, boss, final-choice, save/reload, debug-skip.
- Required evidence: screenshot, console errors, missing network URL, route steps, character, and whether debug skip was used.
- A copy-ready bug report template.

- [ ] **Step 2: Wire documentation links**

Add pointers from README and alpha acceptance so a non-agent tester finds the guide quickly.

- [ ] **Step 3: Verification**

```bash
test -s docs/playtest/external-bug-intake.md
grep -n "external-bug-intake" README.md docs/playtest/alpha-acceptance.md
git diff --check
```

## Task 3: Integration And Release Notes

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Merge worktree outputs**

If subagent usage is available:

- Checklist worker owns `docs/playtest/desktop-playtest-checklist.md`.
- Intake worker owns `docs/playtest/external-bug-intake.md`, README link, and alpha acceptance link.

If subagent usage is blocked, implement sequentially in the integration worktree.

- [ ] **Step 2: Update project documentation**

Record:

```text
Wave 15 scope: external desktop playtest checklist and bug intake guide refresh for the Wave 14 alpha.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Verification**

Run:

```bash
grep -R "Wave 11 final Playwright" -n README.md docs/playtest && exit 1 || true
grep -R "profile-gated compendium presentation" -n README.md docs/playtest && exit 1 || true
git diff --check
```

Optional sanity gate if docs changes touch command blocks substantially:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "compendium|墨录图鉴|debug skip"
```

## Follow-Up Round Seed

After Wave 15 is verified and committed:

- Consider a small release packaging/readme pass if external handoff still feels underspecified.
- Revisit Milestone 58 only if bitmap generation can produce source sheets and cropped runtime assets in a reproducible workflow.
