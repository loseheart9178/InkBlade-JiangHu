# Wave 17 Handoff NPM Scripts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add short npm script entry points for generating balance and alpha handoff report artifacts, and ignore the local `reports/` artifact directory.

**Architecture:** Keep this as package/docs hygiene. `package.json` should call existing scripts instead of duplicating logic, `.gitignore` should keep generated reports out of git, and docs should prefer npm commands while retaining direct bundled Node examples where useful.

**Tech Stack:** npm scripts, Vitest file-level regression tests, Markdown docs.

---

## Context And Constraints

Use the bundled Node runtime for verification commands:

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
- `docs/superpowers/plans/2026-05-05-wave16-alpha-handoff-report.md`

Current Wave 16 baseline:

- Branch: `codex/wave16-alpha-handoff-report`
- Commit: `bee7302 docs: integrate wave16 alpha handoff report`
- Wave 16 gate: alpha handoff report CLI test and balance report CLI test passed; handoff artifact output matched stdout; docs linked the command.

Implementation rules:

- Do not change gameplay logic, renderer behavior, save schema, art assets, or report script internals.
- Keep `reports/` as local generated output, not committed content.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass.

## Task 1: Package Script Entries

**Files:**

- Modify: `package.json`
- Modify: `.gitignore`
- Create: `tests/playtest/package-report-scripts.test.ts`
- Do not modify: `scripts/alpha-handoff-report.mjs`, `scripts/balance-report.mjs`

- [ ] **Step 1: Write failing package script test**

Create `tests/playtest/package-report-scripts.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "../..");

describe("package report scripts", () => {
  it("exposes short report artifact commands and ignores generated reports", () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const gitignore = readFileSync(resolve(repoRoot, ".gitignore"), "utf8");

    expect(manifest.scripts["report:balance"]).toBe(
      "node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md"
    );
    expect(manifest.scripts["report:handoff"]).toBe(
      "node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md"
    );
    expect(gitignore.split(/\\r?\\n/)).toContain("reports/");
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/package-report-scripts.test.ts --reporter=dot
```

Expected: fail because the new scripts and `reports/` ignore entry do not exist.

- [ ] **Step 3: Add package scripts and ignore rule**

In `package.json`, add under `scripts`:

```json
"report:balance": "node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md",
"report:handoff": "node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md"
```

In `.gitignore`, add:

```gitignore
reports/
```

- [ ] **Step 4: Verify GREEN**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/package-report-scripts.test.ts --reporter=dot
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore tests/playtest/package-report-scripts.test.ts
git commit -m "chore: add handoff report npm scripts"
```

## Task 2: Documentation Refresh

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Do not modify: `package.json`, `.gitignore`, tests, scripts

- [ ] **Step 1: Prefer npm scripts in README**

In `README.md` under `Alpha Handoff Report`, replace the direct command pair with:

```bash
npm run report:balance
npm run report:handoff
```

Then add one sentence:

```markdown
Both commands write under `reports/`, which is ignored because it is a local handoff artifact directory.
```

- [ ] **Step 2: Add npm command to alpha acceptance**

In `docs/playtest/alpha-acceptance.md`, add to useful focused reruns:

```bash
npm run report:balance
npm run report:handoff
```

Keep the bundled Node direct command for autonomous worktrees.

- [ ] **Step 3: Verify**

```bash
grep -n "report:handoff" README.md docs/playtest/alpha-acceptance.md
grep -n "reports/" README.md .gitignore
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md
git commit -m "docs: document handoff npm scripts"
```

## Task 3: Integration And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Merge worktree outputs**

If subagent usage is available:

- Package worker owns `package.json`, `.gitignore`, and `tests/playtest/package-report-scripts.test.ts`.
- Docs worker owns `README.md` and `docs/playtest/alpha-acceptance.md`.

If subagent usage is blocked, implement sequentially in isolated worktrees from the main thread.

- [ ] **Step 2: Update Documentation**

Record:

```text
Wave 17 scope: npm script shortcuts for balance and alpha handoff report artifacts, plus `reports/` gitignore protection.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Wave 17 gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/package-report-scripts.test.ts tests/playtest/alpha-handoff-report-script.test.ts tests/playtest/balance-report-script.test.ts --reporter=dot
grep -n "report:handoff" README.md docs/playtest/alpha-acceptance.md
grep -n "reports/" README.md .gitignore
git diff --check
```

## Follow-Up Round Seed

After Wave 17 is verified and committed:

- Consider branch/worktree hygiene only if safe; do not delete active worktrees without confirming they are merged.
- Revisit Milestone 58 only if bitmap generation can produce real source sheets and cropped runtime PNGs in a reproducible workflow.
