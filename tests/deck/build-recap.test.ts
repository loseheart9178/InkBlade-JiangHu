import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { createDeckBuildRecap } from "../../src/game/systems/deck/buildRecap";

describe("deck build recap", () => {
  it("returns a stable unformed recap for empty decks", () => {
    const recap = createDeckBuildRecap({ cards: [] });

    expect(recap.primaryLabel).toBe("尚未成型");
    expect(recap.signatureCards).toEqual([]);
    expect(recap.typeBreakdown).toContain("暂无武学");
    expect(recap.tacticalNotes).toContain("继续收集带有流派标签的武学。");
  });

  it("summarizes Zhao Yun spear-chain decks with signatures and attack pressure", () => {
    const cards = [
      cardsById.zhao_thrust,
      cardsById.zhao_white_dragon,
      cardsById.zhao_break_spear,
      cardsById.zhao_seven_entries,
      cardsById.zhao_guardian
    ];

    const recap = createDeckBuildRecap({
      cards,
      methodNames: ["龙胆连势"],
      relicNames: ["白龙枪缨"],
      challengeName: "墨潮压境"
    });

    expect(recap.primaryLabel).toBe("连斩枪势流");
    expect(recap.summary).toContain("4式");
    expect(recap.signatureCards).toEqual(["突刺", "白龙探爪", "破军枪", "七进七出"]);
    expect(recap.typeBreakdown[0]).toMatch(/^攻击 4式/);
    expect(recap.tacticalNotes).toContain("以攻击牌连续压迫敌阵。");
    expect(recap.supportSignals).toEqual(expect.arrayContaining(["心法 龙胆连势", "法宝 白龙枪缨", "试炼 墨潮压境"]));
  });

  it("keeps mixed decks readable without mutating inputs", () => {
    const cards = [cardsById.common_tuna, cardsById.common_qingshen, cardsById.common_xixin];
    const originalIds = cards.map((card) => card.id);
    const methods = ["长坂守心", "清音续谱", "八阵入门", "余音绕梁"];
    const relics = ["旧木剑", "清音玉", "断弦", "记忆竹简"];

    const recap = createDeckBuildRecap({ cards, methodNames: methods, relicNames: relics });

    expect(cards.map((card) => card.id)).toEqual(originalIds);
    expect(methods).toEqual(["长坂守心", "清音续谱", "八阵入门", "余音绕梁"]);
    expect(relics).toEqual(["旧木剑", "清音玉", "断弦", "记忆竹简"]);
    expect(recap.primaryLabel).toBe("尚未成型");
    expect(recap.typeBreakdown).toEqual(expect.arrayContaining(["技法 2式", "身法 1式", "心境 1式"]));
    expect(recap.signatureCards.length).toBeGreaterThan(0);
    expect(recap.supportSignals).toEqual(["心法 长坂守心、清音续谱、八阵入门", "法宝 旧木剑、清音玉、断弦"]);
  });
});
