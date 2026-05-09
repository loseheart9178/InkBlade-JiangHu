import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cardArtById } from "../../src/game/content/visuals";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const wave64Targets: Record<string, string> = {
  zhao_strike: "/assets/generated/cards/wave64-zhao-strike-gpt2.png",
  zhao_guard: "/assets/generated/cards/wave64-zhao-guard-gpt2.png",
  zhao_longdan: "/assets/generated/cards/wave64-zhao-longdan-gpt2.png",
  diao_strike: "/assets/generated/cards/wave64-diao-strike-gpt2.png",
  diao_guard: "/assets/generated/cards/wave64-diao-guard-gpt2.png",
  diao_lingbo: "/assets/generated/cards/wave64-diao-lingbo-gpt2.png",
  cai_plain_strike: "/assets/generated/cards/wave64-cai-plain-strike-gpt2.png",
  cai_pluck_string: "/assets/generated/cards/wave64-cai-pluck-string-gpt2.png",
  cai_gong_tone: "/assets/generated/cards/wave64-cai-gong-tone-gpt2.png",
  zhuge_fan_strike: "/assets/generated/cards/wave64-zhuge-fan-strike-gpt2.png",
  zhuge_guard: "/assets/generated/cards/wave64-zhuge-guard-gpt2.png",
  common_duanzhu: "/assets/generated/cards/wave64-common-duanzhu-gpt2.png",
  common_feishi: "/assets/generated/cards/wave64-common-feishi-gpt2.png",
  common_xieli: "/assets/generated/cards/wave64-common-xieli-gpt2.png"
};

describe("Wave 64 replacement card art batch", () => {
  it("binds starter and common replacement cards to generated 512x768 PNG card faces", () => {
    for (const [id, assetPath] of Object.entries(wave64Targets)) {
      const filePath = join(repoRoot, "public", assetPath);
      expect(cardArtById[id]?.assetPath, id).toBe(assetPath);
      expect(existsSync(filePath), id).toBe(true);

      const png = readFileSync(filePath);
      expect(png.subarray(0, 8).toString("hex"), id).toBe("89504e470d0a1a0a");
      expect(png.readUInt32BE(16), id).toBe(512);
      expect(png.readUInt32BE(20), id).toBe(768);
    }
  });

  it("counts the wave64 gpt2-suffixed card faces in the generated asset audit", () => {
    const auditPath = join(repoRoot, "public/assets/generated/asset-audit.json");
    const audit = JSON.parse(readFileSync(auditPath, "utf8")) as {
      gpt2Runtime: Array<{ id: string; paths: string[] }>;
    };
    const auditedPaths = new Set(audit.gpt2Runtime.flatMap((entry) => entry.paths));

    for (const assetPath of Object.values(wave64Targets)) {
      expect(auditedPaths.has(assetPath), assetPath).toBe(true);
    }
  });
});
