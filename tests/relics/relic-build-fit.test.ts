import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { relicsById } from "../../src/game/content/relics";
import { createRelicBuildFit } from "../../src/game/systems/relics/relicBuildFit";

describe("relic build fit", () => {
  const zhaoSpearDeck = [cardsById.zhao_thrust, cardsById.zhao_white_dragon, cardsById.zhao_break_spear];

  it("labels matching archetype relics as mainline resonance", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(fit.label).toBe("流派共鸣");
    expect(fit.tone).toBe("main");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("labels off-archetype same-character relics as character branches", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_white_cloak_knot);

    expect(fit.label).toBe("本命支路");
    expect(fit.tone).toBe("branch");
    expect(fit.detail).toContain("护主防反流");
  });

  it("labels ink-support relics as risk tools", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_black_paper_umbrella);

    expect(fit.label).toBe("墨灾奇物");
    expect(fit.tone).toBe("risk");
    expect(fit.detail).toContain("墨痕");
  });

  it("labels mind-state relics as utility support", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_silent_zither_string);

    expect(fit.label).toBe("心境辅佐");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("心境");
  });

  it("labels generic relics as stable utility", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_old_wooden_sword);

    expect(fit.label).toBe("通用稳固");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("所有流派");
  });

  it("keeps same-character relics without archetypes in the generic utility lane", () => {
    const fit = createRelicBuildFit(zhaoSpearDeck, "zhaoyun", relicsById.relic_white_dragon_tassel);

    expect(fit.label).toBe("通用稳固");
    expect(fit.tone).toBe("utility");
  });

  it("labels empty-deck archetype relics as opening direction", () => {
    const fit = createRelicBuildFit([], "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(fit.label).toBe("开局法门");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("does not mutate the current deck while deriving fit", () => {
    const deck = [...zhaoSpearDeck];
    const originalDeckIds = deck.map((card) => card.id);

    createRelicBuildFit(deck, "zhaoyun", relicsById.relic_cloud_dragon_scale);

    expect(deck.map((card) => card.id)).toEqual(originalDeckIds);
  });
});
