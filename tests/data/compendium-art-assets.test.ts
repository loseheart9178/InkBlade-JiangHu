import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cardList } from "../../src/game/content/cards";
import { relicArtById } from "../../src/game/content/relicArt";
import { relicList } from "../../src/game/content/relics";
import { cardArtById } from "../../src/game/content/visuals";

function expectPngAsset(assetPath: string, label: string): void {
  expect(assetPath, label).toMatch(/^\/assets\/generated\/.+\.png$/);
  const filePath = join(process.cwd(), "public", assetPath.replace(/^\//, ""));
  expect(existsSync(filePath), label).toBe(true);
  const png = readFileSync(filePath);
  expect(png.subarray(0, 8).toString("hex"), label).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16), label).toBeGreaterThanOrEqual(300);
  expect(png.readUInt32BE(20), label).toBeGreaterThanOrEqual(300);
}

describe("compendium high quality art assets", () => {
  it("binds every compendium card to a direct generated PNG instead of SVG or type fallback art", () => {
    for (const card of cardList) {
      const art = cardArtById[card.id];
      const fallback = cardArtById[`type_${card.types[0]}`];

      expect(art, card.id).toBeDefined();
      expect(art.assetPath, card.id).not.toBe(fallback?.assetPath);
      expectPngAsset(art.assetPath, card.id);
    }
  });

  it("binds every compendium relic to imagegen generated PNG art", () => {
    for (const relic of relicList) {
      const art = relicArtById[relic.id];

      expect(art, relic.id).toBeDefined();
      expect(art.alt, relic.id).toContain(relic.name);
      expectPngAsset(art.assetPath, relic.id);
    }
  });
});
