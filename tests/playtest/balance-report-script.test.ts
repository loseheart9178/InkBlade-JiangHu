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
