# Wave 16 Alpha Handoff Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic CLI that generates a single Markdown alpha handoff report linking the current build, verification commands, playtest docs, bug intake guide, and optional balance artifact.

**Architecture:** Keep the generator as a small Node script under `scripts/` with no Vite runtime dependency. It should gather git branch/commit through local git commands, support environment overrides for deterministic tests, write the same Markdown to stdout and optional `--out`, and never mutate game state or generated assets. Documentation should only link the new command and preserve the current Wave 14/Wave 15 acceptance language.

**Tech Stack:** Node ESM scripts, Vitest CLI integration tests, Markdown docs.

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
- `docs/superpowers/plans/2026-05-05-wave15-external-playtest-kit.md`

Current Wave 15 baseline:

- Branch: `codex/wave15-external-playtest-kit`
- Commit: `04d839d docs: integrate wave15 playtest kit`
- Wave 15 gate: documentation greps passed, `git diff --check` passed, and focused Playwright sanity passed for 3 Chromium tests covering compendium and debug skip.
- Previous full release gate remains Wave 14: Vitest 19 files / 192 tests, TypeScript, Vite build, Playwright 27 Chromium tests, asset audit, and balance artifact stdout match.

Implementation rules:

- Do not change gameplay logic, renderer behavior, save schema, art assets, or generated asset manifests.
- Keep desktop browser as the active platform.
- Keep Milestone 58 as the only open optional GPT Image 2 bitmap card-art quality pass.
- Prefer exact stdout/artifact equality, matching the Wave 13 balance report artifact behavior.

## Task 1: Handoff Report CLI

**Files:**

- Create: `scripts/alpha-handoff-report.mjs`
- Create: `tests/playtest/alpha-handoff-report-script.test.ts`
- Do not modify: `README.md`, `docs/playtest/alpha-acceptance.md`

- [ ] **Step 1: Write the failing CLI integration test**

Add `tests/playtest/alpha-handoff-report-script.test.ts`:

```ts
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = resolve(repoRoot, "scripts/alpha-handoff-report.mjs");

describe("alpha handoff report script", () => {
  it("writes the same markdown report to stdout and an explicit artifact path", () => {
    const artifactDir = mkdtempSync(join(tmpdir(), "inkblade-handoff-"));
    const artifactPath = join(artifactDir, "nested", "alpha-handoff.md");

    try {
      const stdout = execFileSync(process.execPath, [
        scriptPath,
        "--out",
        artifactPath,
        "--balance-report",
        "reports/balance-report.md"
      ], {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          INKBLADE_HANDOFF_NOW: "2026-05-05T05:15:00.000Z",
          INKBLADE_HANDOFF_BRANCH: "codex/test-handoff",
          INKBLADE_HANDOFF_COMMIT: "abc1234"
        }
      });

      const artifact = readFileSync(artifactPath, "utf8");
      expect(artifact).toBe(stdout);
      expect(stdout).toContain("# Inkblade Alpha Handoff Report");
      expect(stdout).toContain("Generated: 2026-05-05T05:15:00.000Z");
      expect(stdout).toContain("Branch: `codex/test-handoff`");
      expect(stdout).toContain("Commit: `abc1234`");
      expect(stdout).toContain("docs/playtest/desktop-playtest-checklist.md");
      expect(stdout).toContain("docs/playtest/external-bug-intake.md");
      expect(stdout).toContain("Balance artifact: `reports/balance-report.md`");
      expect(stdout).toContain("Milestone 58 remains optional");
    } finally {
      rmSync(artifactDir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts --reporter=dot
```

Expected: fail because `scripts/alpha-handoff-report.mjs` does not exist.

- [ ] **Step 3: Implement the CLI**

Create `scripts/alpha-handoff-report.mjs`:

```js
#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = getFlagValue(process.argv, "--out");
const balanceReportPath = getFlagValue(process.argv, "--balance-report");
const report = renderReport({
  generatedAt: process.env.INKBLADE_HANDOFF_NOW ?? new Date().toISOString(),
  branch: process.env.INKBLADE_HANDOFF_BRANCH ?? getGitValue(["branch", "--show-current"]),
  commit: process.env.INKBLADE_HANDOFF_COMMIT ?? getGitValue(["rev-parse", "--short", "HEAD"]),
  balanceReportPath
});

process.stdout.write(report);

if (outputPath) {
  const resolvedOutput = resolve(root, outputPath);
  await mkdir(dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, report, "utf8");
}

function renderReport({ generatedAt, branch, commit, balanceReportPath }) {
  const balanceLine = balanceReportPath
    ? `- Balance artifact: \`${balanceReportPath}\`\n`
    : "- Balance artifact: not attached; generate one with `node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md`.\n";

  return `# Inkblade Alpha Handoff Report

Generated: ${generatedAt}
Branch: \`${branch || "unknown"}\`
Commit: \`${commit || "unknown"}\`

## Current Acceptance Baseline

- Desktop Chromium is the active alpha target; mobile layout and touch QA remain out of scope.
- Wave 14 full release gate: Vitest 19 files / 192 tests, TypeScript, Vite build, Playwright 27 Chromium tests, asset audit, and balance artifact stdout match.
- Wave 15 handoff kit: refreshed desktop playtest checklist and external bug intake guide.
- Milestone 58 remains optional GPT Image 2 bitmap card-art quality backlog.

## Local Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Bundled runtime:

\`\`\`bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js --host 127.0.0.1
\`\`\`

## Verification Commands

\`\`\`bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/audit-generated-assets.mjs
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
\`\`\`

## Playtest Documents

- Alpha acceptance: \`docs/playtest/alpha-acceptance.md\`
- Desktop checklist: \`docs/playtest/desktop-playtest-checklist.md\`
- External bug intake: \`docs/playtest/external-bug-intake.md\`
${balanceLine}
## Debug Notes

- Mark every report that used \`调试跳章\` / debug skip.
- For compendium issues, distinguish current-run logbook fragments from profile-recorded \`已录\` entries.
- Attach screenshot, console errors, missing asset URLs, route tags, character, save/reload state, and branch/commit.
`;
}

function getFlagValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  const value = argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
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

- [ ] **Step 4: Verify GREEN**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts --reporter=dot
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add scripts/alpha-handoff-report.mjs tests/playtest/alpha-handoff-report-script.test.ts
git commit -m "feat: add alpha handoff report script"
```

## Task 2: Handoff Documentation Links

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Do not modify: `scripts/alpha-handoff-report.mjs`, `tests/playtest/alpha-handoff-report-script.test.ts`

- [ ] **Step 1: Add README command reference**

In `README.md`, add a short section after the Wave 14 compendium section:

```markdown
## Alpha Handoff Report

Generate a single Markdown handoff summary for external testers:

\`\`\`bash
node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
\`\`\`

Pair it with:

\`\`\`bash
node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md
\`\`\`
```

- [ ] **Step 2: Add alpha acceptance command reference**

In `docs/playtest/alpha-acceptance.md`, add the bundled Node handoff command to the useful focused reruns block:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md
```

Add one sentence near the external bug intake link:

```markdown
For release handoff, generate `reports/alpha-handoff.md` with `scripts/alpha-handoff-report.mjs` after the balance artifact exists.
```

- [ ] **Step 3: Verify**

```bash
grep -n "alpha-handoff-report" README.md docs/playtest/alpha-acceptance.md
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add README.md docs/playtest/alpha-acceptance.md
git commit -m "docs: document alpha handoff report"
```

## Task 3: Integration And Verification

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Merge worktree outputs**

If subagent usage is available:

- Script worker owns `scripts/alpha-handoff-report.mjs` and `tests/playtest/alpha-handoff-report-script.test.ts`.
- Docs worker owns `README.md` and `docs/playtest/alpha-acceptance.md`.

If subagent usage is blocked, implement sequentially in isolated worktrees from the main thread.

- [ ] **Step 2: Update Documentation**

Record:

```text
Wave 16 scope: alpha handoff report generator, artifact output support, and release-facing command docs.
Milestone 58 remains the only open optional art-quality backlog item.
```

- [ ] **Step 3: Full Wave 16 gate**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/alpha-handoff-report-script.test.ts tests/playtest/balance-report-script.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/alpha-handoff-report.mjs --out D:/tmp/inkblade-alpha-handoff.md --balance-report D:/tmp/inkblade-balance-report.md >/mnt/d/tmp/inkblade-alpha-handoff-stdout.md
test -s /mnt/d/tmp/inkblade-alpha-handoff.md
cmp -s /mnt/d/tmp/inkblade-alpha-handoff.md /mnt/d/tmp/inkblade-alpha-handoff-stdout.md
rm -f /mnt/d/tmp/inkblade-alpha-handoff.md /mnt/d/tmp/inkblade-alpha-handoff-stdout.md
grep -n "alpha-handoff-report" README.md docs/playtest/alpha-acceptance.md
git diff --check
```

## Follow-Up Round Seed

After Wave 16 is verified and committed:

- Consider a tiny cleanup pass for old worktree directories and branch hygiene only if no active work depends on them.
- Revisit Milestone 58 only if bitmap generation can produce real source sheets and cropped runtime PNGs in a reproducible workflow.
