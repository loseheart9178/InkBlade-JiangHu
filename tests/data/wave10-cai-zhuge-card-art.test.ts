import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wave10CaiZhugeCardArt } from "../../src/game/content/cardArt/wave10CaiZhugeCardArt";

const expectedIds = [
  "cai_broken_string",
  "cai_clean_string",
  "cai_clear_tone",
  "cai_echoing_melody",
  "cai_five_tones_start",
  "cai_listen_still",
  "cai_shang_tone",
  "cai_soul_ferry",
  "zhuge_deduction",
  "zhuge_empty_city",
  "zhuge_fire_array",
  "zhuge_plan_set",
  "zhuge_starfall",
  "zhuge_stone_array",
  "zhuge_straw_boats",
  "zhuge_wind_array"
];

describe("Wave 10 Cai Wenji and Zhuge Liang card art batch", () => {
  it("defines semantic art and concrete files for every Cai and Zhuge fallback target", () => {
    expect(wave10CaiZhugeCardArt.map((art) => art.id)).toEqual(expectedIds);

    for (const art of wave10CaiZhugeCardArt) {
      expect(art.assetPath).toMatch(/^\/assets\/generated\/cards\/foundation(?:-[a-z]+)?-v\d+-.+\.png$/);
      expect(art.alt.length).toBeGreaterThan(12);
      expect(["red", "teal", "ink", "gold"]).toContain(art.accent);

      const filePath = path.join(process.cwd(), "public", art.assetPath.replace(/^\//, ""));
      expect(fs.existsSync(filePath), art.id).toBe(true);
      const png = fs.readFileSync(filePath);
      expect(png.subarray(0, 8).toString("hex"), art.id).toBe("89504e470d0a1a0a");
    }
  });
});
