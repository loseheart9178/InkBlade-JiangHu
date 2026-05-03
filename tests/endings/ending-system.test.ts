import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import { evaluateEnding } from "../../src/game/systems/endings/endings";

describe("ending evaluator", () => {
  it("chooses a clear seal ending for low ink and calm/wu tendency", () => {
    const run = createDebugRun({ characterId: "zhaoyun", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 4, nu: 0, bei: 0, mei: 0, luan: 0, wu: 3 },
      inkHistory: { totalGained: 1, highestInCombat: 1, disasterCardsPlayed: 0 }
    });

    expect(ending.id).toBe("ending_clear_seal");
    expect(ending.title).toContain("封印");
    expect(ending.body.length).toBeGreaterThan(20);
    expect(ending.summary.length).toBeGreaterThan(6);
  });

  it("chooses heart demon collapse for extreme ink and chaos", () => {
    const run = createDebugRun({ characterId: "diaochan", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 0, nu: 3, bei: 2, mei: 5, luan: 8, wu: 0 },
      inkHistory: { totalGained: 18, highestInCombat: 8, disasterCardsPlayed: 6 }
    });

    expect(ending.id).toBe("ending_heart_demon");
  });

  it("uses deterministic priority for hidden wu before other calm endings", () => {
    const run = createDebugRun({ characterId: "zhaoyun", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 5, nu: 0, bei: 0, mei: 0, luan: 0, wu: 8 },
      inkHistory: { totalGained: 0, highestInCombat: 0, disasterCardsPlayed: 0 }
    });

    expect(ending.id).toBe("ending_hidden_wu");
  });

  it("chooses rewrite fate for heavy ink use without heart demon collapse", () => {
    const run = createDebugRun({ characterId: "diaochan", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 0, nu: 1, bei: 1, mei: 2, luan: 3, wu: 4 },
      inkHistory: { totalGained: 12, highestInCombat: 4, disasterCardsPlayed: 4 }
    });

    expect(ending.id).toBe("ending_rewrite_fate");
  });

  it("chooses burn book for anger and insight when ink has not taken over", () => {
    const run = createDebugRun({ characterId: "zhaoyun", chapterId: "changan" });
    const ending = evaluateEnding({
      ...run,
      mindTendencies: { ning: 1, nu: 6, bei: 0, mei: 0, luan: 1, wu: 3 },
      inkHistory: { totalGained: 3, highestInCombat: 2, disasterCardsPlayed: 1 }
    });

    expect(ending.id).toBe("ending_burn_book");
  });
});
