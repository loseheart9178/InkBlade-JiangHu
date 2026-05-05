# Wave 19 Handoff Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fast Markdown preflight command that tells external testers whether their checkout has the expected Node runtime, git identity, npm report scripts, and playtest handoff docs before they run the heavier alpha gate.

**Architecture:** Implement a standalone Node ESM script under `scripts/` with deterministic environment overrides for testing. It should perform local file/package/git checks only; it must not start Vite, run tests, mutate game state, or generate reports. Documentation should add the preflight command to quick-start/handoff flow without replacing the full verification gate.

**Tech Stack:** Node ESM scripts, Vitest CLI integration tests, npm scripts, Markdown docs.

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
- `docs/playtest/external-bug-intake.md`
- `docs/superpowers/plans/2026-05-05-wave18-node-runtime-requirements.md`

Current Wave 18 baseline:

- Branch: `codex/wave18-node-runtime-requirements`
- Commit: `2505c2a docs: integrate wave18 node runtime requirements`
- Node runtime requirement is declared as `>=24` and release-facing docs warn that Node 18 shells are not verified.

Implementation rules:

- Do not change gameplay logic, renderer behavior, save schema, art assets, Vite config, or existing report script internals.
- Keep preflight read-only and fast.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass.

## Task 1: Preflight CLI

**Files:**

- Create: `scripts/handoff-preflight.mjs`
- Create: `tests/playtest/handoff-preflight-script.test.ts`
- Modify: `package.json`
- Do not modify: `README.md`, `docs/playtest/alpha-acceptance.md`

- [ ] **Step 1: Write failing CLI integration test**

Create `tests/playtest/handoff-preflight-script.test.ts`:

```ts
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = resolve(repoRoot, "scripts/handoff-preflight.mjs");

describe("handoff preflight script", () => {
  it("prints deterministic markdown status for runtime, git, scripts, and handoff docs", () => {
    const stdout = execFileSync(process.execPath, [scriptPath], {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        INKBLADE_PREFLIGHT_NOW: "2026-05-05T06:00:00.000Z",
        INKBLADE_PREFLIGHT_NODE: "v24.14.0",
        INKBLADE_PREFLIGHT_BRANCH: "codex/test-preflight",
        INKBLADE_PREFLIGHT_COMMIT: "def5678"
      }
    });

    expect(stdout).toContain("# Inkblade Handoff Preflight");
    expect(stdout).toContain("Generated: 2026-05-05T06:00:00.000Z");
    expect(stdout).toContain("- Node runtime: `v24.14.0` PASS");
    expect(stdout).toContain("- Branch: `codex/test-preflight`");
    expect(stdout).toContain("- Commit: `def5678`");
    expect(stdout).toContain("- `report:balance`: PASS");
    expect(stdout).toContain("- `report:handoff`: PASS");
    expect(stdout).toContain("- `docs/playtest/desktop-playtest-checklist.md`: PASS");
    expect(stdout).toContain("- `docs/playtest/external-bug-intake.md`: PASS");
    expect(stdout).toContain("Next: run `npm run report:balance` then `npm run report:handoff`.");
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/handoff-preflight-script.test.ts --reporter=dot
```

Expected: fail because `scripts/handoff-preflight.mjs` does not exist.

- [ ] **Step 3: Implement script and npm entry**

Create `scripts/handoff-preflight.mjs`:

```js
#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const nodeVersion = process.env.INKBLADE_PREFLIGHT_NODE ?? process.version;
const generatedAt = process.env.INKBLADE_PREFLIGHT_NOW ?? new Date().toISOString();
const branch = process.env.INKBLADE_PREFLIGHT_BRANCH ?? getGitValue(["branch", "--show-current"]);
const commit = process.env.INKBLADE_PREFLIGHT_COMMIT ?? getGitValue(["rev-parse", "--short", "HEAD"]);
const reportBalance = manifest.scripts?.["report:balance"];
const reportHandoff = manifest.scripts?.["report:handoff"];

process.stdout.write(`# Inkblade Handoff Preflight

Generated: ${generatedAt}

## Runtime

- Required Node: \`${manifest.engines?.node ?? "not declared"}\`
- Node runtime: \`${nodeVersion}\` ${isNode24OrNewer(nodeVersion) ? "PASS" : "FAIL"}

## Checkout

- Branch: \`${branch || "unknown"}\`
- Commit: \`${commit || "unknown"}\`

## Report Commands

- \`report:balance\`: ${reportBalance ? "PASS" : "FAIL"}${reportBalance ? ` — \`${reportBalance}\`` : ""}
- \`report:handoff\`: ${reportHandoff ? "PASS" : "FAIL"}${reportHandoff ? ` — \`${reportHandoff}\`` : ""}

## Handoff Documents

- \`docs/playtest/alpha-acceptance.md\`: ${fileExists("docs/playtest/alpha-acceptance.md") ? "PASS" : "FAIL"}
- \`docs/playtest/desktop-playtest-checklist.md\`: ${fileExists("docs/playtest/desktop-playtest-checklist.md") ? "PASS" : "FAIL"}
- \`docs/playtest/external-bug-intake.md\`: ${fileExists("docs/playtest/external-bug-intake.md") ? "PASS" : "FAIL"}

Next: run \`npm run report:balance\` then \`npm run report:handoff\`.
`);

function isNode24OrNewer(version) {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  return Number.isFinite(major) && major >= 24;
}

function fileExists(path) {
  return existsSync(resolve(root, path));
}

function getGitValue(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "unknown";
  }
}
```

Add to `package.json` scripts:

```json
"handoff:preflight": "node scripts/handoff-preflight.mjs"
```

- [ ] **Step 4: Verify GREEN**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/handoff-preflight-script.test.ts --reporter=dot
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add scripts/handoff-preflight.mjs tests/playtest/handoff-preflight-script.test.ts package.json
git commit -m "feat: add handoff preflight script"
```

## Task 2: Preflight Documentation

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Do not modify: `package.json`, tests, scripts

- [ ] **Step 1: Add README preflight command**

In README `Alpha Handoff Report`, add preflight before report generation:

```bash
npm run handoff:preflight
npm run report:balance
npm run report:handoff
```

Add one sentence:

```markdown
The preflight command is read-only; it prints runtime, git, command, and handoff-document status.
```

- [ ] **Step 2: Add alpha acceptance preflight command**

In `docs/playtest/alpha-acceptance.md` useful focused reruns block, add:

```bash
npm run handoff:preflight
```

Add near Runnable Commands:

```markdown
Run `npm run handoff:preflight` before a handoff session to catch stale Node/runtime or missing report-doc setup quickly.
```

- [ ] **Step 3: Verify**

```bash
grep -n "handoff:preflight" README.md docs/playtest/alpha-acceptance.md
grep -n "read-only" README.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md
git commit -m "docs: document handoff preflight"
```

## Task 3: Integration And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Merge worktree outputs**

If subagent usage is available:

- Script worker owns `scripts/handoff-preflight.mjs`, `tests/playtest/handoff-preflight-script.test.ts`, and `package.json`.
- Docs worker owns `README.md` and `docs/playtest/alpha-acceptance.md`.

If subagent usage is blocked, implement sequentially in isolated worktrees from the main thread.

- [ ] **Step 2: Update Documentation**

Record:

```text
Wave 19 scope: read-only handoff preflight command for runtime, git, npm script, and playtest doc status.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Wave 19 gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/handoff-preflight-script.test.ts tests/playtest/runtime-requirements.test.ts tests/playtest/package-report-scripts.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/handoff-preflight.mjs | grep -n "Inkblade Handoff Preflight"
grep -n "handoff:preflight" README.md docs/playtest/alpha-acceptance.md
git diff --check
```

## Follow-Up Round Seed

After Wave 19 is verified and committed:

- Consider running a final handoff artifact generation using the preflight + report commands and recording it in Documentation.
- Revisit Milestone 58 only if bitmap generation can produce real source sheets and cropped runtime PNGs in a reproducible workflow.
