import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wave10CommonCardArt } from "../../src/game/content/cardArt/wave10CommonCardArt";

const expectedIds = [
  "common_duanzhu",
  "common_feishi",
  "common_gedang",
  "common_mirror_armor",
  "common_pifeng",
  "common_qingshen",
  "common_tuna",
  "common_xieli",
  "common_zhuiying",
  "ink_heiyu",
  "ink_modian",
  "ink_moren",
  "mind_jingxin",
  "mind_luanxin",
  "mind_nuzhan",
  "status_rain_chill"
];

describe("Wave 10 common card art batch", () => {
  it("defines semantic art and concrete files for every common fallback target", () => {
    expect(wave10CommonCardArt.map((art) => art.id)).toEqual(expectedIds);
    const wave64GeneratedTargets = new Set(["common_duanzhu", "common_feishi", "common_xieli"]);
    const wave59GeneratedTargets = new Set(["common_mirror_armor", "common_pifeng", "common_tuna", "common_zhuiying"]);
    for (const art of wave10CommonCardArt) {
      let expectedAssetPath = /^\/assets\/generated\/cards\/wave10-.+\.svg$/;
      if (wave64GeneratedTargets.has(art.id)) {
        expectedAssetPath = /^\/assets\/generated\/cards\/wave64-.+\.png$/;
      }
      if (art.id === "common_gedang" || art.id === "common_qingshen") {
        expectedAssetPath = /^\/assets\/generated\/cards\/wave57-.+\.png$/;
      }
      if (wave59GeneratedTargets.has(art.id)) {
        expectedAssetPath = /^\/assets\/generated\/cards\/wave59-.+\.png$/;
      }

      expect(art.assetPath).toMatch(expectedAssetPath);
      expect(art.alt.length).toBeGreaterThan(12);
      expect(["red", "teal", "ink", "gold"]).toContain(art.accent);
      const filePath = path.join(process.cwd(), "public", art.assetPath.replace(/^\//, ""));
      expect(fs.existsSync(filePath), art.id).toBe(true);

      if (art.assetPath.endsWith(".png")) {
        const png = fs.readFileSync(filePath);
        expect(png.subarray(0, 8).toString("hex"), art.id).toBe("89504e470d0a1a0a");
      } else {
        const svg = fs.readFileSync(filePath, "utf8");
        expect(svg).toContain("<svg");
        expect(svg).toContain('viewBox="0 0 640 900"');
        expect(svg).not.toMatch(/<text\b/i);
      }
    }
  });
});
