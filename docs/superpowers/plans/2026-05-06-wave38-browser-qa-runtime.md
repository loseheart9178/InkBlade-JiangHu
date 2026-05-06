# Wave 38 Browser QA Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Playwright browser QA start Vite with the same Node runtime that launched Playwright, avoiding shell Node 18 failures in autonomous worktrees.

**Architecture:** Keep the fix in `playwright.config.ts`. Add a small Vitest config regression test so the runtime command cannot drift back to `npm run dev`.

**Tech Stack:** TypeScript, Playwright config, Vitest.

---

## Files

- Modify `playwright.config.ts`: build `webServer.command` from `process.execPath` and Vite's local CLI path.
- Add `tests/playwright-config.test.ts`: assert the webServer command uses the active Node runtime and preserves host/port/reuse settings.
- Modify `Documentation.md`: record root cause, RED/GREEN, verification, and next step.

## Acceptance Criteria

- [ ] `npm run dev -- --port 5173` under shell Node 18 is documented as the reproduced failure source.
- [ ] `tests/playwright-config.test.ts` fails before the config change because `webServer.command` is `npm run dev -- --port 5173`.
- [ ] `playwright.config.ts` webServer command includes `process.execPath`.
- [ ] `playwright.config.ts` webServer command runs `./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`.
- [ ] Playwright focused browser test passes without manually held-open Vite server.

## Task 1: RED Config Test

**Files:**

- Add: `tests/playwright-config.test.ts`

- [ ] **Step 1: Add failing config test**

Create `tests/playwright-config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import playwrightConfig from "../playwright.config";

function getSingleWebServer() {
  const webServer = playwrightConfig.webServer;
  return Array.isArray(webServer) ? webServer[0] : webServer;
}

describe("playwright web server runtime", () => {
  it("launches vite with the same node runtime used by the test runner", () => {
    const webServer = getSingleWebServer();

    expect(webServer).toBeDefined();
    expect(webServer?.command).toContain(process.execPath);
    expect(webServer?.command).toContain("node_modules/vite/bin/vite.js");
    expect(webServer?.command).toContain("--host 127.0.0.1");
    expect(webServer?.command).toContain("--port 5173");
    expect(webServer?.command).not.toContain("npm run dev");
    expect(webServer?.url).toBe("http://127.0.0.1:5173");
    expect(webServer?.reuseExistingServer).toBe(true);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playwright-config.test.ts --reporter=dot
```

Expected: FAIL because `webServer.command` still contains `npm run dev -- --port 5173` and not `process.execPath`.

- [ ] **Step 3: Commit test slice**

```bash
git add tests/playwright-config.test.ts
git commit -m "test: cover playwright dev server runtime"
```

## Task 2: Runtime Command Fix

**Files:**

- Modify: `playwright.config.ts`

- [ ] **Step 1: Add command quoting helper**

In `playwright.config.ts`, add this below the import:

```ts
function quoteCommandPart(value: string): string {
  return `"${value.replace(/"/g, "\\\"")}"`;
}

const viteWebServerCommand = `${quoteCommandPart(process.execPath)} ${quoteCommandPart("./node_modules/vite/bin/vite.js")} --host 127.0.0.1 --port 5173`;
```

- [ ] **Step 2: Use the command in webServer**

Replace:

```ts
command: "npm run dev -- --port 5173",
```

with:

```ts
command: viteWebServerCommand,
```

- [ ] **Step 3: Run focused GREEN checks**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playwright-config.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Commit config slice**

```bash
git add playwright.config.ts
git commit -m "test: launch playwright server with active node"
```

## Task 3: Browser Proof And Documentation

**Files:**

- Modify: `Documentation.md`

- [ ] **Step 1: Ensure no manual Vite server is running**

Verify port `5173` is not held by a separate manual session before the Playwright proof.

- [ ] **Step 2: Run browser proof**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "title character select"
```

Expected: PASS with Playwright starting its own web server.

- [ ] **Step 3: Run full checks**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Update Documentation.md and commit**

Record reproduced failure, worker commits, verification, known risks, and next milestone.

```bash
git add Documentation.md
git commit -m "docs: record wave38 browser qa runtime"
```
