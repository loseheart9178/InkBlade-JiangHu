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
      expect(stdout).toContain("Wave 66 candidate gate");
      expect(stdout).toContain("Vitest 37 files / 270 tests");
      expect(stdout).toContain("asset audit 228 runtime references / missing 0 / ink-pass debt 0 / card fallback debt 0");
      expect(stdout).toContain("GPT2 runtime assets 122 / source sheets 21");
      expect(stdout).toContain("performance budget PASS");
      expect(stdout).toContain("Desktop Chromium remains the active external QA target");
      expect(stdout).toContain("Wave65 protects narrow mobile layout smoke coverage");
      expect(stdout).toContain("Wave 24 balance report label");
      expect(stdout).toContain("# Wave 24 Alpha Balance Report");
      expect(stdout).toContain("wave24-alpha-balance-v1");
      expect(stdout).toContain("Current multi-seed balance artifact: 12/12 routes, 84 combat samples");
      expect(stdout).toContain("Zhuge Liang lowest HP band 8/10/15");
      expect(stdout).not.toContain("Wave 20 full desktop gate remains the latest");
      expect(stdout).not.toContain("/mnt/c/Users/loseheart");
      expect(stdout).toContain("docs/playtest/desktop-playtest-checklist.md");
      expect(stdout).toContain("docs/playtest/external-bug-intake.md");
      expect(stdout).toContain("Balance artifact: `reports/balance-report.md`");
      expect(stdout).toContain("node scripts/perf-budget.mjs --build");
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
