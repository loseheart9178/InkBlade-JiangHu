# Wave 13 Simulator Report Artifacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make deterministic simulator balance reports exportable as file artifacts for QA and CI handoff, while preserving the current stdout workflow.

**Architecture:** Keep report generation in pure debug systems and the CLI script. The script may write files, but the report data must still come from `src/game/systems/debug/balanceReport.ts`; no DOM, Phaser, or browser state.

**Tech Stack:** Node CLI, Vite SSR loader, TypeScript debug systems, Vitest.

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
- `docs/superpowers/plans/2026-05-04-wave8-content-release.md`
- `docs/superpowers/plans/2026-05-05-wave12-save-profile-hardening.md`

Current Wave 12 baseline:

- Branch: `codex/wave12-save-profile-hardening`
- Vitest: 18 files / 189 tests
- TypeScript: passed
- Vite build: passed without the previous Phaser chunk-size warning
- Playwright desktop: 27 Chromium tests
- Asset audit: runtime references 159, missing 0, card fallback debt 0
- Balance report: 12/12 routes, timeout risks 0, unsafe damage spikes 0

Implementation rules:

- Do not change simulator balance math, thresholds, route selection, or report schema.
- Preserve stdout output exactly for existing `scripts/balance-report.mjs --markdown --seeds ...` calls.
- `--out <path>` should create parent directories and write the same rendered payload that stdout receives.
- Do not commit generated report artifacts; the feature is the CLI support and docs.
- Subagent dispatch may be unavailable until the usage limit resets; if so, implement in an isolated worktree from the main thread.

## Task 1: Balance Report `--out` Artifact Support

**Files:**

- Modify: `scripts/balance-report.mjs`
- Add: `tests/playtest/balance-report-script.test.ts`

- [ ] **Step 1: Write the failing CLI artifact test**

Add `tests/playtest/balance-report-script.test.ts`:

```ts
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = resolve(repoRoot, "scripts/balance-report.mjs");

describe("balance report script", () => {
  it("writes the rendered markdown report to an explicit artifact path", () => {
    const artifactDir = mkdtempSync(join(tmpdir(), "inkblade-balance-"));
    const artifactPath = join(artifactDir, "nested", "balance-report.md");

    try {
      const stdout = execFileSync(process.execPath, [
        scriptPath,
        "--markdown",
        "--seeds",
        "9001,9002,9003",
        "--out",
        artifactPath
      ], {
        cwd: repoRoot,
        encoding: "utf8"
      });

      const artifact = readFileSync(artifactPath, "utf8");
      expect(stdout).toContain("# Wave 7 Alpha Balance Report");
      expect(artifact).toBe(stdout);
      expect(artifact).toContain("Routes completed: 12/12");
    } finally {
      rmSync(artifactDir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/balance-report-script.test.ts --reporter=dot
```

Expected: fails because `--out` is ignored and the nested artifact file is not written.

- [ ] **Step 3: Implement minimal CLI output support**

In `scripts/balance-report.mjs`:

- Import `mkdir` and `writeFile` from `node:fs/promises`.
- Add `const outputPath = getOutputPath(process.argv);`
- Render once into a `payload` string.
- Always write `payload` to stdout as today.
- If `outputPath` exists, create its parent directory and write `payload`.
- Add:

```js
function getOutputPath(argv) {
  const outputFlagIndex = argv.indexOf("--out");
  if (outputFlagIndex === -1) {
    return undefined;
  }

  const value = argv[outputFlagIndex + 1];
  return value && !value.startsWith("--") ? resolve(root, value) : undefined;
}
```

Use `dirname(outputPath)` for parent creation.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/balance-report-script.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out D:/tmp/inkblade-balance-report.md >/mnt/d/tmp/inkblade-balance-stdout.md
test -s /mnt/d/tmp/inkblade-balance-report.md
cmp -s /mnt/d/tmp/inkblade-balance-report.md /mnt/d/tmp/inkblade-balance-stdout.md
rm -f /mnt/d/tmp/inkblade-balance-report.md /mnt/d/tmp/inkblade-balance-stdout.md
git diff --check
```

Expected: test passes, manual command writes an artifact and preserves stdout, diff check passes.

- [ ] **Step 5: Commit worker branch**

```bash
git add scripts/balance-report.mjs tests/playtest/balance-report-script.test.ts
git commit -m "feat: export balance report artifacts"
```

## Task 2: Integration And Release Notes

**Files:**

- Modify: `README.md`
- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `Documentation.md`

- [ ] **Step 1: Merge worker branch**

From the Wave 13 integration branch:

```bash
git merge --no-edit codex/wave13-balance-report-outfile
```

- [ ] **Step 2: Update docs**

Record:

```text
Wave 13 scope: balance report `--out` artifact export while preserving stdout.
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

Expected: all commands pass. Vitest count should increase by 1 file / 1 test.

- [ ] **Step 4: Commit integration branch**

```bash
git add Documentation.md README.md docs/playtest/alpha-acceptance.md scripts/balance-report.mjs tests/playtest/balance-report-script.test.ts
git commit -m "feat: add balance report artifact export"
```

## Follow-Up Round Seed

After Wave 13 is verified and committed:

- Return to Milestone 58 if bitmap generation is available and worth a dedicated art pass.
- Otherwise continue low-conflict alpha hardening with compendium unlock-depth presentation.
