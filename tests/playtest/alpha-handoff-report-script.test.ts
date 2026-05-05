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
      expect(stdout).toContain("Wave 20 release gate refresh");
      expect(stdout).toContain("Vitest 24 files / 200 tests");
      expect(stdout).toContain("Zhuge Liang lowest HP band improved to 8/10/14");
      expect(stdout).toContain("docs/playtest/desktop-playtest-checklist.md");
      expect(stdout).toContain("docs/playtest/external-bug-intake.md");
      expect(stdout).toContain("Balance artifact: `reports/balance-report.md`");
      expect(stdout).toContain("Wave 21 resolves Milestone 58");
    } finally {
      rmSync(artifactDir, { recursive: true, force: true });
    }
  });

  it("resolves checkout metadata without environment overrides", () => {
    const env = { ...process.env };
    delete env.INKBLADE_HANDOFF_BRANCH;
    delete env.INKBLADE_HANDOFF_COMMIT;

    const stdout = execFileSync(process.execPath, [scriptPath], {
      cwd: repoRoot,
      encoding: "utf8",
      env
    });

    expect(stdout).not.toContain("Branch: `unknown`");
    expect(stdout).toMatch(/Commit: `[0-9a-f]{7}`/);
  });
});
