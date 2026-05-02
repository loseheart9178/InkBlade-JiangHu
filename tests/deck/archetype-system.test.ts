import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { analyzeDeckArchetypes, getCardArchetypeRole } from "../../src/game/systems/deck/archetype";

describe("deck archetype analysis", () => {
  it("scores Zhao Yun spear-chain decks above guardian-counter cards", () => {
    const analysis = analyzeDeckArchetypes([
      cardsById.zhao_thrust,
      cardsById.zhao_white_dragon,
      cardsById.zhao_break_spear,
      cardsById.zhao_guardian
    ]);

    expect(analysis.top?.id).toBe("zhao-spear-chain");
    expect(analysis.top?.cardCount).toBe(3);
    expect(analysis.scores.find((score) => score.id === "zhao-guardian-counter")?.cardCount).toBe(1);
    expect(analysis.summary).toContain("连斩枪势流");
  });

  it("scores Diao Chan charm-control decks above dance-chain cards", () => {
    const analysis = analyzeDeckArchetypes([
      cardsById.diao_charm,
      cardsById.diao_lijian,
      cardsById.diao_red_ribbon,
      cardsById.diao_lingbo
    ]);

    expect(analysis.top?.id).toBe("diao-charm-control");
    expect(analysis.top?.cardCount).toBe(3);
    expect(analysis.scores.find((score) => score.id === "diao-dance-chain")?.cardCount).toBe(1);
    expect(analysis.summary).toContain("魅惑控制流");
  });

  it("labels reward cards by their relationship to the current deck", () => {
    const analysis = analyzeDeckArchetypes([
      cardsById.zhao_thrust,
      cardsById.zhao_white_dragon,
      cardsById.zhao_break_spear
    ]);

    expect(getCardArchetypeRole(cardsById.zhao_seven_entries, analysis)).toBe("主线强化");
    expect(getCardArchetypeRole(cardsById.zhao_guardian, analysis)).toBe("副线补强");
    expect(getCardArchetypeRole(cardsById.common_tuna, analysis)).toBe("通用补短");
  });
});
