import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wave10ZhaoDiaoCardArt } from "../../src/game/content/cardArt/wave10ZhaoDiaoCardArt";

const expectedIds = [
  "zhao_guardian",
  "zhao_qixing_spear",
  "zhao_single_rider",
  "zhao_stable_formation",
  "zhao_sweep",
  "zhao_thrust",
  "zhao_white_dragon",
  "diao_falling_fan",
  "diao_glance",
  "diao_hongyan",
  "diao_red_ribbon",
  "diao_sleeve_blade",
  "diao_step_lotus"
];

describe("Wave 10 Zhao Yun and Diao Chan card art batch", () => {
  it("defines semantic art and concrete SVG files for every Zhao/Diao fallback target", () => {
    expect(wave10ZhaoDiaoCardArt.map((art) => art.id)).toEqual(expectedIds);
    for (const art of wave10ZhaoDiaoCardArt) {
      expect(art.assetPath).toMatch(/^\/assets\/generated\/cards\/wave10-.+\.svg$/);
      expect(art.alt.length).toBeGreaterThan(12);
      expect(["red", "teal", "ink", "gold"]).toContain(art.accent);
      const filePath = path.join(process.cwd(), "public", art.assetPath.replace(/^\//, ""));
      const svg = fs.readFileSync(filePath, "utf8");
      expect(svg).toContain("<svg");
      expect(svg).toContain('viewBox="0 0 640 900"');
      expect(svg).not.toMatch(/<text\b/i);
    }
  });
});
