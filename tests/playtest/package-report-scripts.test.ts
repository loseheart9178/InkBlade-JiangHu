import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "../..");

describe("package report scripts", () => {
  it("exposes short report artifact commands and ignores generated reports", () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const gitignore = readFileSync(resolve(repoRoot, ".gitignore"), "utf8");

    expect(manifest.scripts["report:balance"]).toBe(
      "node scripts/balance-report.mjs --markdown --seeds 9001,9002,9003 --out reports/balance-report.md"
    );
    expect(manifest.scripts["report:handoff"]).toBe(
      "node scripts/alpha-handoff-report.mjs --out reports/alpha-handoff.md --balance-report reports/balance-report.md"
    );
    expect(gitignore.split(/\r?\n/)).toContain("reports/");
  });
});
