# Wave 18 Node Runtime Requirements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the verified Node runtime requirement explicit so external testers do not run the Vite/Rolldown toolchain with an unsupported Node 18 shell.

**Architecture:** Record the runtime contract in `package.json` through `engines.node`, lock it with a focused Vitest test, and mirror the requirement in release-facing setup docs. Do not change build tooling, dependencies, gameplay, renderer, save schema, or report scripts.

**Tech Stack:** npm package metadata, Vitest file-level regression test, Markdown docs.

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
- `docs/playtest/desktop-playtest-checklist.md`
- `docs/superpowers/plans/2026-05-05-wave17-handoff-npm-scripts.md`

Current Wave 17 observation:

- `npm run report:balance` using the shell default Node v18.19.1 failed inside Vite/Rolldown because `node:util.styleText` was unavailable.
- The same balance + handoff artifact chain passed with the bundled Node v24.14.0.
- External-facing docs currently say "normal Node" without a minimum version.

Implementation rules:

- Keep the active platform desktop browser.
- Do not modify gameplay logic, renderer behavior, save schema, art assets, report script internals, or dependency versions.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass.

## Task 1: Package Runtime Contract

**Files:**

- Modify: `package.json`
- Create: `tests/playtest/runtime-requirements.test.ts`
- Do not modify: `README.md`, `docs/playtest/alpha-acceptance.md`, `docs/playtest/desktop-playtest-checklist.md`

- [ ] **Step 1: Write failing runtime test**

Create `tests/playtest/runtime-requirements.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("runtime requirements", () => {
  it("declares Node 24 or newer for the Vite/Rolldown toolchain", () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
      engines?: Record<string, string>;
    };

    expect(manifest.engines?.node).toBe(">=24");
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/runtime-requirements.test.ts --reporter=dot
```

Expected: fail because `package.json` does not declare `engines.node`.

- [ ] **Step 3: Add `engines.node`**

Add to `package.json` after `private`:

```json
"engines": {
  "node": ">=24"
},
```

- [ ] **Step 4: Verify GREEN**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/runtime-requirements.test.ts --reporter=dot
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add package.json tests/playtest/runtime-requirements.test.ts
git commit -m "chore: declare node runtime requirement"
```

## Task 2: Runtime Documentation

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `docs/playtest/desktop-playtest-checklist.md`
- Do not modify: `package.json`, tests, scripts

- [ ] **Step 1: Update README Quick Start**

Replace "Install dependencies with normal Node" with:

```markdown
Install dependencies with Node 24 or newer:
```

Add after the normal command block:

```markdown
The verified autonomous runtime is Node v24.14.0. Older Node 18 shells cannot run the current Vite/Rolldown toolchain.
```

- [ ] **Step 2: Update playtest docs**

In `docs/playtest/alpha-acceptance.md`, add near "Runnable Commands":

```markdown
Normal `npm` commands require Node 24 or newer. Autonomous worktrees should use the bundled Node v24.14.0 path below.
```

In `docs/playtest/desktop-playtest-checklist.md`, replace "Start the app with normal Node" with:

```markdown
Start the app with Node 24 or newer:
```

Add:

```markdown
If the shell default is Node 18, use the bundled Node command below instead; Node 18 is not a verified toolchain for this Vite/Rolldown build.
```

- [ ] **Step 3: Verify**

```bash
grep -n "Node 24" README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md
grep -n "Node 18" README.md docs/playtest/desktop-playtest-checklist.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md
git commit -m "docs: clarify node runtime requirement"
```

## Task 3: Integration And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Merge worktree outputs**

If subagent usage is available:

- Package worker owns `package.json` and `tests/playtest/runtime-requirements.test.ts`.
- Docs worker owns `README.md`, `docs/playtest/alpha-acceptance.md`, and `docs/playtest/desktop-playtest-checklist.md`.

If subagent usage is blocked, implement sequentially in isolated worktrees from the main thread.

- [ ] **Step 2: Update Documentation**

Record:

```text
Wave 18 scope: Node >=24 runtime requirement in package metadata and release-facing setup docs.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Wave 18 gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/runtime-requirements.test.ts tests/playtest/package-report-scripts.test.ts --reporter=dot
grep -n "Node 24" README.md docs/playtest/alpha-acceptance.md docs/playtest/desktop-playtest-checklist.md
grep -n "Node 18" README.md docs/playtest/desktop-playtest-checklist.md
git diff --check
```

## Follow-Up Round Seed

After Wave 18 is verified and committed:

- Consider adding a preflight command that prints runtime/toolchain status before a handoff.
- Revisit Milestone 58 only if bitmap generation can produce real source sheets and cropped runtime PNGs in a reproducible workflow.
