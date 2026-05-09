import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = resolve(repoRoot, "scripts/perf-budget.mjs");
const { evaluatePerfBudget } = await import(scriptPath);

const kib = 1024;
const mib = 1024 * kib;
const tempRoots: string[] = [];

type PerfBudgetFailure = {
  id: string;
};

describe("perf budget script", () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("passes fixture assets and chunks that stay under the Wave65 budgets", async () => {
    const root = createFixture("pass");
    writeDistAsset(root, "assets/phaser-core.js", 120 * kib);
    writeDistAsset(root, "assets/game.js", 70 * kib);
    writeDistAsset(root, "assets/style.css", 12 * kib);
    writePublicAsset(root, "assets/generated/cards/card-small.png", 40 * kib);
    writePublicAsset(root, "assets/sprites/hero-strip.png", 55 * kib);
    writeAudit(root, {
      missingCount: 0,
      cardFallbackDebtCount: 0,
      uniqueRuntimeFileCount: 12,
      sourceSheetCount: 3
    });

    const result = await evaluatePerfBudget({
      root,
      dist: join(root, "dist")
    });

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.summary.assetAudit.missingCount).toBe(0);
  });

  it("reports card PNG and generated asset audit budget failures", async () => {
    const root = createFixture("fail");
    writeDistAsset(root, "assets/phaser-core.js", 120 * kib);
    writeDistAsset(root, "assets/game.js", 70 * kib);
    writeDistAsset(root, "assets/style.css", 12 * kib);
    writePublicAsset(root, "assets/generated/cards/card-too-large.png", 1.05 * mib);
    writePublicAsset(root, "assets/sprites/hero-strip.png", 55 * kib);
    writeAudit(root, {
      missingCount: 2,
      cardFallbackDebtCount: 0,
      uniqueRuntimeFileCount: 12,
      sourceSheetCount: 3
    });

    const result = await evaluatePerfBudget({
      root,
      dist: join(root, "dist")
    });

    expect(result.ok).toBe(false);
    expect(result.failures.map((failure: PerfBudgetFailure) => failure.id)).toEqual(
      expect.arrayContaining(["asset-audit-missing", "card-png-size"])
    );
  });

  it("removes the temporary build output directory when the build command fails", async () => {
    const root = createFixture("build-fail");
    writeFailingViteBin(root);

    await expect(evaluatePerfBudget({ root, build: true })).rejects.toThrow();

    expect(readdirSync(root).filter((entry) => entry.startsWith(".perf-budget-build-"))).toEqual([]);
  });
});

function createFixture(name: string) {
  const root = mkdtempSync(join(tmpdir(), `inkblade-perf-budget-${name}-`));
  tempRoots.push(root);
  mkdirSync(join(root, "dist/assets"), { recursive: true });
  mkdirSync(join(root, "public/assets/generated/cards"), { recursive: true });
  mkdirSync(join(root, "public/assets/sprites"), { recursive: true });
  return root;
}

function writeDistAsset(root: string, relativePath: string, size: number) {
  writeFileSync(join(root, "dist", relativePath), Buffer.alloc(Math.ceil(size), "a"));
}

function writePublicAsset(root: string, relativePath: string, size: number) {
  writeFileSync(join(root, "public", relativePath), Buffer.alloc(Math.ceil(size), "b"));
}

function writeFailingViteBin(root: string) {
  mkdirSync(join(root, "node_modules/vite/bin"), { recursive: true });
  writeFileSync(join(root, "node_modules/vite/bin/vite.js"), "process.exit(1);\n");
}

function writeAudit(
  root: string,
  summary: {
    missingCount: number;
    cardFallbackDebtCount: number;
    uniqueRuntimeFileCount: number;
    sourceSheetCount: number;
  }
) {
  writeFileSync(
    join(root, "public/assets/generated/asset-audit.json"),
    JSON.stringify({ schemaVersion: 1, summary }, null, 2)
  );
}
