# Wave 20 Release Gate Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the desktop alpha release-gate evidence after Waves 15-19 so README and playtest handoff docs point at the current verified branch instead of the older Wave 14 gate.

**Architecture:** Keep this as a documentation and verification milestone. The main integration thread owns the full release gate because exact stdout, artifact parity, and failure triage are sequential. A parallel docs worker may inspect release-facing references and prepare text-only doc updates after the gate results are known.

**Tech Stack:** Git worktrees, bundled Node v24.14.0, Vitest, TypeScript, Vite, Playwright Chromium, Markdown docs.

---

## Context And Constraints

Use the bundled Node runtime for all release-gate commands:

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
- `docs/playtest/external-bug-intake.md`
- `docs/superpowers/plans/2026-05-05-wave19-handoff-preflight.md`

Current Wave 19 baseline:

- Branch: `codex/wave19-handoff-preflight`
- Commit: `45beb8d docs: integrate wave19 handoff preflight`
- Scope since the previous full public gate includes external playtest kit docs, alpha handoff report generation, npm report shortcuts, Node >=24 runtime documentation, and handoff preflight.

Implementation rules:

- Do not change gameplay logic, renderer behavior, save schema, art assets, Vite config, or test semantics.
- Do not use the shell default Node 18 for verification; it is not a verified Vite/Rolldown runtime for this repo.
- Do not update release docs with guessed numbers. Copy exact counts and headline facts from fresh command output.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass unless verification uncovers a new blocker.

## Task 1: Plan Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Record the plan in Documentation**

Add a new top status entry to `Documentation.md`:

```markdown
### 2026-05-05 15:03 Asia/Shanghai

Wave 20 Release Gate Refresh planning started in `.worktrees/wave6-integration` on branch `codex/wave20-release-gate-refresh-plan`.

Docs read before planning:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `README.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/playtest/desktop-playtest-checklist.md`
- `docs/playtest/external-bug-intake.md`
- `docs/superpowers/plans/2026-05-05-wave19-handoff-preflight.md`

Plan added:

- `docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md`

Scope:

- Run the full bundled Node release gate after Waves 15-19.
- Refresh release-facing docs with exact current gate results.
- Preserve desktop-only alpha handoff scope and the optional Milestone 58 art gap.

Next step:

- Commit the Wave 20 plan, then create the release-gate integration branch.
```

- [ ] **Step 2: Verify the plan has no unresolved markers**

```bash
grep -n "Wave 20 Release Gate Refresh" Documentation.md docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md
git diff --check
```

- [ ] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave20-release-gate-refresh.md
git commit -m "docs: plan wave20 release gate refresh"
```

## Task 2: Full Release Gate Evidence

**Files:**

- No source edits in this task.
- Temporary artifacts only: `/mnt/d/tmp/inkblade-wave20-balance-report.md`, `/mnt/d/tmp/inkblade-wave20-balance-stdout.md`, `/mnt/d/tmp/inkblade-wave20-alpha-handoff.md`, `/mnt/d/tmp/inkblade-wave20-alpha-handoff-stdout.md`

- [ ] **Step 1: Run deterministic unit coverage**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
```

Expected: exit 0. Record the exact `Test Files` and `Tests` counts from stdout.

- [ ] **Step 2: Run TypeScript compile**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Run production build**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
```

Expected: exit 0. Record whether the previous lazy Phaser chunk-size warning remains absent.

- [ ] **Step 4: Run desktop Chromium Playwright gate**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
```

Expected: exit 0. Record the exact Chromium test count from stdout.

- [ ] **Step 5: Run generated asset audit**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
```

Expected: exit 0. Record runtime refs, missing refs, ink-pass debt, and card fallback debt.

- [ ] **Step 6: Verify balance report artifact parity**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out /mnt/d/tmp/inkblade-wave20-balance-report.md
```

Redirect stdout to `/mnt/d/tmp/inkblade-wave20-balance-stdout.md` when running the command. Then verify:

```bash
test -s /mnt/d/tmp/inkblade-wave20-balance-report.md
cmp /mnt/d/tmp/inkblade-wave20-balance-report.md /mnt/d/tmp/inkblade-wave20-balance-stdout.md
```

Expected: both commands exit 0. Record completed routes, sample count, timeout risks, and unsafe spikes.

- [ ] **Step 7: Verify handoff preflight and alpha handoff artifacts**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/handoff-preflight.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/alpha-handoff-report.mjs --out /mnt/d/tmp/inkblade-wave20-alpha-handoff.md --balance-report /mnt/d/tmp/inkblade-wave20-balance-report.md
```

Redirect the handoff report stdout to `/mnt/d/tmp/inkblade-wave20-alpha-handoff-stdout.md` when running the second command. Then verify:

```bash
test -s /mnt/d/tmp/inkblade-wave20-alpha-handoff.md
cmp /mnt/d/tmp/inkblade-wave20-alpha-handoff.md /mnt/d/tmp/inkblade-wave20-alpha-handoff-stdout.md
grep -n "Inkblade Alpha Handoff Report" /mnt/d/tmp/inkblade-wave20-alpha-handoff.md
```

Expected: all commands exit 0.

- [ ] **Step 8: Remove temporary artifacts**

```bash
rm -f /mnt/d/tmp/inkblade-wave20-balance-report.md /mnt/d/tmp/inkblade-wave20-balance-stdout.md /mnt/d/tmp/inkblade-wave20-alpha-handoff.md /mnt/d/tmp/inkblade-wave20-alpha-handoff-stdout.md
```

- [ ] **Step 9: Check whitespace**

```bash
git diff --check
```

Expected: exit 0.

## Task 3: Release-Facing Documentation Refresh

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `docs/playtest/desktop-playtest-checklist.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Update README release verification paragraph**

Replace the Wave 14 release verification paragraph with a Wave 20 paragraph that includes:

- Branch `codex/wave20-release-gate-refresh`
- Scope: release-gate refresh after Waves 15-19 handoff and runtime tooling
- Exact Vitest file/test counts from Task 2
- TypeScript compile result
- Vite build result
- Exact Playwright Chromium test count from Task 2
- Exact asset audit numbers from Task 2
- Balance artifact parity result from Task 2
- Handoff preflight and alpha handoff artifact parity result from Task 2
- Milestone 58 optional art gap

- [ ] **Step 2: Update alpha acceptance current state**

Refresh `docs/playtest/alpha-acceptance.md`:

- Change the opening scope from Wave 14 to Wave 20.
- Change `Last full gate verified` to Wave 20 on branch `codex/wave20-release-gate-refresh`.
- Add a Wave 20 gate summary before the Wave 14 historical line.
- Update the verification table with exact current counts.
- Keep Wave 7-14 historical sections as historical references.

- [ ] **Step 3: Update desktop checklist release focus**

Refresh `docs/playtest/desktop-playtest-checklist.md`:

- Rename `Wave 14 Release Focus` to `Wave 20 Release Focus`.
- Carry forward the compendium acceptance points.
- Add handoff docs/report scripts, Node 24 runtime, and preflight as Wave 15-19 carry-forward surfaces.
- Update the final gate line and automated Playwright count with exact current results.

- [ ] **Step 4: Record integration in Documentation**

Add a top `Documentation.md` entry with:

- Docs read and plan file read.
- What changed.
- Any worker worktrees or subagents used, including timeout or completion status.
- Exact verification commands and results from Task 2.
- Known gaps or risks.
- Next milestone.

- [ ] **Step 5: Verify docs**

```bash
grep -n "Wave 20" README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md Documentation.md
grep -n "handoff:preflight" README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md
git diff --check
```

- [ ] **Step 6: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md Documentation.md
git commit -m "docs: refresh wave20 release gate evidence"
```

## Task 4: Integration Branch Closure

**Files:**

- Read-only checks unless Task 3 missed a documentation reference.

- [ ] **Step 1: Review final diff**

```bash
git status --short
git log --oneline -5
git diff --stat HEAD~1..HEAD
```

- [ ] **Step 2: Re-run final documentation whitespace check**

```bash
git diff --check
```

Expected: exit 0.

- [ ] **Step 3: Mark plan complete**

If the release docs commit is clean and verification evidence is recorded, leave no uncommitted changes and continue to the next autonomous wave.
