# Wave 24 Balance Report Label Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the deterministic balance report's public id and markdown heading from stale Wave 7 wording to the current Wave 24 evidence label while preserving all simulator outcomes.

**Architecture:** Keep simulation, aggregation, and acceptance rules unchanged. Add exported report metadata constants in `src/game/systems/debug/balanceReport.ts`, use them in the generated report object and markdown title, and update tests/docs to pin the current label.

**Tech Stack:** TypeScript, Vitest, bundled Node v24.14.0, existing `scripts/balance-report.mjs`.

---

## Context And Constraints

Use the bundled Node runtime for commands:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
```

Docs/files read before this plan:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/playtest/alpha-acceptance.md`
- `src/game/systems/debug/balanceReport.ts`
- `tests/playtest/run-simulator.test.ts`
- `tests/playtest/balance-report-script.test.ts`
- `scripts/balance-report.mjs`

Current issue:

- Runtime report metadata still emits `reportId: "wave7-alpha-balance-v1"`.
- Markdown output still starts with `# Wave 7 Alpha Balance Report`.
- Tests currently lock the stale label, so the drift can persist even after Wave 22/23 balance updates.

Desired output shape:

```text
# Wave 24 Alpha Balance Report
- Report id: wave24-alpha-balance-v1
```

## Task 1: Planning Baseline

**Files:**

- Create: `docs/superpowers/plans/2026-05-05-wave24-balance-report-label-refresh.md`
- Modify: `Documentation.md`

- [x] **Step 1: Record planning entry**

Add a top `Documentation.md` entry with docs read, stale-label evidence, plan path, and next step.

- [x] **Step 2: Verify**

```bash
grep -n "Wave 24 Balance Report Label Refresh" Documentation.md docs/superpowers/plans/2026-05-05-wave24-balance-report-label-refresh.md
git diff --check
```

- [x] **Step 3: Commit**

```bash
git add Documentation.md docs/superpowers/plans/2026-05-05-wave24-balance-report-label-refresh.md
git commit -m "docs: plan wave24 balance report label refresh"
```

## Task 2: Failing Label Regression

**Files:**

- Modify: `tests/playtest/run-simulator.test.ts`
- Modify: `tests/playtest/balance-report-script.test.ts`

- [x] **Step 1: Pin the new runtime metadata in simulator tests**

Update the balance report import:

```ts
import {
  BALANCE_REPORT_ID,
  BALANCE_REPORT_TITLE,
  createBalanceReport,
  formatBalanceReportMarkdown
} from "../../src/game/systems/debug/balanceReport";
```

In `creates deterministic balance report evidence for shipped hero routes`, replace the stale expectations with:

```ts
expect(BALANCE_REPORT_ID).toBe("wave24-alpha-balance-v1");
expect(BALANCE_REPORT_TITLE).toBe("Wave 24 Alpha Balance Report");
expect(first.reportId).toBe(BALANCE_REPORT_ID);
const firstMarkdown = formatBalanceReportMarkdown(first);
expect(firstMarkdown).toContain(`# ${BALANCE_REPORT_TITLE}`);
expect(firstMarkdown).not.toContain("Wave 7 Alpha Balance Report");
```

- [x] **Step 2: Pin the new script output label**

In `tests/playtest/balance-report-script.test.ts`, import the constants:

```ts
import { BALANCE_REPORT_ID, BALANCE_REPORT_TITLE } from "../../src/game/systems/debug/balanceReport";
```

Replace the stale stdout assertion with:

```ts
expect(BALANCE_REPORT_ID).toBe("wave24-alpha-balance-v1");
expect(BALANCE_REPORT_TITLE).toBe("Wave 24 Alpha Balance Report");
expect(stdout).toContain(`# ${BALANCE_REPORT_TITLE}`);
expect(stdout).toContain(`- Report id: ${BALANCE_REPORT_ID}`);
expect(stdout).not.toContain("Wave 7 Alpha Balance Report");
```

- [x] **Step 3: Verify red**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/playtest/balance-report-script.test.ts --reporter=dot
```

Expected first result: fail because `BALANCE_REPORT_ID` and `BALANCE_REPORT_TITLE` are not exported yet and the runtime still emits Wave 7 labels.

## Task 3: Runtime Metadata Refresh

**Files:**

- Modify: `src/game/systems/debug/balanceReport.ts`

- [x] **Step 1: Add metadata constants near defaults**

Add:

```ts
export const BALANCE_REPORT_ID = "wave24-alpha-balance-v1";
export const BALANCE_REPORT_TITLE = "Wave 24 Alpha Balance Report";
```

- [x] **Step 2: Use constants in the report type and factory**

Change the `BalanceReport` interface and `createBalanceReport` return object:

```ts
export interface BalanceReport {
  reportId: typeof BALANCE_REPORT_ID;
```

```ts
return {
  reportId: BALANCE_REPORT_ID,
```

- [x] **Step 3: Use the title constant in markdown output**

Change the markdown heading line:

```ts
`# ${BALANCE_REPORT_TITLE}`,
```

- [x] **Step 4: Verify focused tests**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/playtest/run-simulator.test.ts tests/playtest/balance-report-script.test.ts --reporter=dot
```

Expected: pass.

## Task 4: Acceptance Docs And Gate

**Files:**

- Modify: `docs/playtest/alpha-acceptance.md`
- Modify: `Documentation.md`
- Modify: `docs/superpowers/plans/2026-05-05-wave24-balance-report-label-refresh.md`

- [x] **Step 1: Refresh acceptance wording**

Add a short latest-label gate sentence near the top of `docs/playtest/alpha-acceptance.md`:

```md
Latest balance report label gate verified: 2026-05-05 Wave 24 balance report label refresh on branch `codex/wave24-balance-report-label-refresh`; `scripts/balance-report.mjs --markdown --seeds 9001,9002,9003` now emits `# Wave 24 Alpha Balance Report` with report id `wave24-alpha-balance-v1` while preserving the Wave 22 aggregate outcomes.
```

Update the current artifact sentence:

```md
Wave 7 through Wave 14 balance-report and acceptance sections remain historical references below. The current Wave 24 multi-seed artifact result is 12/12 completed routes, 84 combat samples, timeout risks 0, unsafe damage spikes 0, and the Wave 24 report label/report id above.
```

- [x] **Step 2: Verify script output**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 | head -5
```

Expected: first line is `# Wave 24 Alpha Balance Report` and the report id line is `- Report id: wave24-alpha-balance-v1`.

- [x] **Step 3: Run broad gates**

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
git diff --check
```

- [x] **Step 4: Record final Documentation entry**

Record changed files, subagent/worktree status, verification commands/results, and residual risks.

- [x] **Step 5: Commit**

```bash
git add Documentation.md docs/playtest/alpha-acceptance.md docs/superpowers/plans/2026-05-05-wave24-balance-report-label-refresh.md src/game/systems/debug/balanceReport.ts tests/playtest/run-simulator.test.ts tests/playtest/balance-report-script.test.ts
git commit -m "test: refresh balance report label"
```

## Acceptance

- The balance report id is `wave24-alpha-balance-v1`.
- Markdown balance output starts with `# Wave 24 Alpha Balance Report`.
- Tests reject the stale `Wave 7 Alpha Balance Report` runtime output.
- Multi-seed simulator outcomes remain unchanged: 12/12 routes, 84 combat samples, timeout risks 0, unsafe spikes 0, Zhuge Liang lowest HP band 8/10/14.
- Full Vitest, TypeScript, Vite build, and `git diff --check` pass.
