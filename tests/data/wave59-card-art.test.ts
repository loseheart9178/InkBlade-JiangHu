import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cardArtById } from "../../src/game/content/visuals";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const wave59Targets: Record<string, string> = {
  common_lockstep: "/assets/generated/cards/wave59-common-lockstep-gpt2.png",
  common_mirror_armor: "/assets/generated/cards/wave59-common-mirror-armor-gpt2.png",
  common_old_wine: "/assets/generated/cards/wave59-common-old-wine-gpt2.png",
  common_paper_ward: "/assets/generated/cards/wave59-common-paper-ward-gpt2.png",
  common_pifeng: "/assets/generated/cards/wave59-common-pifeng-gpt2.png",
  common_rain_cut: "/assets/generated/cards/wave59-common-rain-cut-gpt2.png",
  common_tuna: "/assets/generated/cards/wave59-common-tuna-gpt2.png",
  common_zhuiying: "/assets/generated/cards/wave59-common-zhuiying-gpt2.png"
};

describe("Wave 59 high-priority common card art batch", () => {
  it("binds the visible common replacement queue to generated 512x768 PNG card faces", () => {
    for (const [id, assetPath] of Object.entries(wave59Targets)) {
      const filePath = join(repoRoot, "public", assetPath);
      expect(cardArtById[id]?.assetPath, id).toBe(assetPath);
      expect(existsSync(filePath), id).toBe(true);
      const png = readFileSync(filePath);
      expect(png.subarray(0, 8).toString("hex"), id).toBe("89504e470d0a1a0a");
    }
  });
});
