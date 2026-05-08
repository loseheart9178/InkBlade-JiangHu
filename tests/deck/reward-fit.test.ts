import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { createRewardBuildFit } from "../../src/game/systems/deck/rewardFit";

describe("reward build fit", () => {
  const zhaoSpearDeck = [cardsById.zhao_thrust, cardsById.zhao_white_dragon, cardsById.zhao_break_spear];

  it("labels matching archetype rewards as mainline reinforcement", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.zhao_seven_entries);

    expect(fit.label).toBe("顺势精进");
    expect(fit.tone).toBe("main");
    expect(fit.detail).toContain("连斩枪势流");
  });

  it("labels different archetype rewards as branch pivots", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.zhao_guardian);

    expect(fit.label).toBe("另开支路");
    expect(fit.tone).toBe("branch");
    expect(fit.detail).toContain("护主防反流");
  });

  it("labels ink cards as risk power", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.ink_moren);

    expect(fit.label).toBe("墨灾取势");
    expect(fit.tone).toBe("risk");
    expect(fit.detail).toContain("墨痕");
  });

  it("labels untagged utility as coverage", () => {
    const fit = createRewardBuildFit(zhaoSpearDeck, cardsById.common_tuna);

    expect(fit.label).toBe("补足周旋");
    expect(fit.tone).toBe("utility");
    expect(fit.detail).toContain("技法");
  });

  it("labels empty-deck rewards as opening direction without mutating inputs", () => {
    const fit = createRewardBuildFit([], cardsById.zhao_thrust);

    expect(fit.label).toBe("开局定向");
    expect(fit.tone).toBe("utility");
  });

  it("does not mutate the current deck while deriving fit", () => {
    const deck = [...zhaoSpearDeck];
    const originalDeckIds = deck.map((card) => card.id);

    createRewardBuildFit(deck, cardsById.zhao_seven_entries);

    expect(deck.map((card) => card.id)).toEqual(originalDeckIds);
  });
});
