import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cardArtById } from "../../src/game/content/visuals";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const wave21Targets: Record<string, string> = {
  zhao_strike: "/assets/generated/cards/gpt2-wave21-zhao-strike.png",
  zhao_guard: "/assets/generated/cards/gpt2-wave21-zhao-guard.png",
  zhao_longdan: "/assets/generated/cards/gpt2-wave21-zhao-longdan.png",
  diao_strike: "/assets/generated/cards/gpt2-wave21-diao-strike.png",
  diao_guard: "/assets/generated/cards/gpt2-wave21-diao-guard.png",
  diao_lingbo: "/assets/generated/cards/gpt2-wave21-diao-lingbo.png",
  cai_plain_strike: "/assets/generated/cards/gpt2-wave21-cai-plain-strike.png",
  cai_pluck_string: "/assets/generated/cards/gpt2-wave21-cai-pluck-string.png",
  cai_gong_tone: "/assets/generated/cards/gpt2-wave21-cai-gong-tone.png",
  zhuge_fan_strike: "/assets/generated/cards/gpt2-wave21-zhuge-fan-strike.png",
  zhuge_guard: "/assets/generated/cards/gpt2-wave21-zhuge-guard.png",
  common_pifeng: "/assets/generated/cards/wave59-common-pifeng-gpt2.png",
  common_duanzhu: "/assets/generated/cards/gpt2-wave21-common-duanzhu.png",
  common_gedang: "/assets/generated/cards/wave57-common-gedang-gpt2.png",
  common_xieli: "/assets/generated/cards/gpt2-wave21-common-xieli.png",
  common_tuna: "/assets/generated/cards/wave59-common-tuna-gpt2.png",
  common_qingshen: "/assets/generated/cards/wave57-common-qingshen-gpt2.png",
  common_feishi: "/assets/generated/cards/gpt2-wave21-common-feishi.png",
  common_zhuiying: "/assets/generated/cards/wave59-common-zhuiying-gpt2.png",
  common_mirror_armor: "/assets/generated/cards/wave59-common-mirror-armor-gpt2.png"
};

describe("Wave 21 GPT Image 2 starter/common card art batch", () => {
  it("binds starter and common foundation cards to the latest generated bitmap runtime assets", () => {
    for (const [id, assetPath] of Object.entries(wave21Targets)) {
      expect(cardArtById[id]?.assetPath, id).toBe(assetPath);
      expect(assetPath.endsWith(".png"), id).toBe(true);
      expect(existsSync(join(repoRoot, "public", assetPath))).toBe(true);
    }
  });

  it("preserves the generated source sheet", () => {
    expect(existsSync(join(repoRoot, "public/assets/generated/sources/gpt2-wave21-starter-common-card-sheet.png"))).toBe(true);
  });
});
