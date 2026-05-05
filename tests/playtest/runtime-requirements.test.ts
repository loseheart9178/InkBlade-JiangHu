import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("runtime requirements", () => {
  it("declares Node 24 or newer for the Vite/Rolldown toolchain", () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
      engines?: Record<string, string>;
    };

    expect(manifest.engines?.node).toBe(">=24");
  });
});
