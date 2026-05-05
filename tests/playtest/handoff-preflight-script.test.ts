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

  it("resolves checkout metadata without environment overrides", () => {
    const env = { ...process.env };
    delete env.INKBLADE_PREFLIGHT_BRANCH;
    delete env.INKBLADE_PREFLIGHT_COMMIT;

    const stdout = execFileSync(process.execPath, [scriptPath], {
      cwd: repoRoot,
      encoding: "utf8",
      env
    });

    expect(stdout).not.toContain("- Branch: `unknown`");
    expect(stdout).toMatch(/- Commit: `[0-9a-f]{7}`/);
  });
});
