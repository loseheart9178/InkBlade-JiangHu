import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import {
  characterEpiloguesById,
  evaluateEnding,
  evaluateRunEnding,
  finalChoiceList,
  getAvailableFinalChoices,
  selectCharacterEpilogue,
  selectFinalChoice
} from "../../src/game/systems/endings/endings";
import { advanceToNextChapter, getRunFinalState } from "../../src/game/systems/run/run";

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

  it("evaluates an ending only after the final run state is ready", () => {
    const run = createDebugRun({ characterId: "zhaoyun", chapterId: "moyuan" });
    run.mindTendencies = { ning: 5, nu: 0, bei: 0, mei: 0, luan: 0, wu: 8 };

    expect(evaluateRunEnding(getRunFinalState(run), run)).toBeUndefined();

    expect(advanceToNextChapter(run)).toBe(false);
    const ending = evaluateRunEnding(getRunFinalState(run), run);

    expect(ending?.id).toBe("ending_hidden_wu");
    expect(ending?.title).toBe("隐藏清悟");
  });

  it("defines the five final player choices as data mapped to world endings", () => {
    expect(finalChoiceList.map((choice) => choice.title)).toEqual(["封印墨渊", "焚毁墨书", "接管墨书", "与心魔合一", "放下笔"]);
    expect(finalChoiceList.map((choice) => choice.endingId)).toEqual([
      "ending_clear_seal",
      "ending_burn_book",
      "ending_rewrite_fate",
      "ending_heart_demon",
      "ending_hidden_wu"
    ]);
    expect(finalChoiceList.every((choice) => choice.summary.length > 6 && choice.body.length > 20)).toBe(true);
  });

  it("hides the lay-down-brush choice until the run qualifies for hidden wu", () => {
    const ordinaryRun = createDebugRun({ characterId: "zhaoyun", chapterId: "moyuan" });
    ordinaryRun.mindTendencies = { ning: 4, nu: 0, bei: 0, mei: 0, luan: 0, wu: 5 };

    expect(getAvailableFinalChoices(ordinaryRun).map((choice) => choice.id)).not.toContain("final_lay_down_brush");
    expect(selectFinalChoice(ordinaryRun, "final_lay_down_brush")).toBeUndefined();

    const hiddenRun = createDebugRun({ characterId: "zhaoyun", chapterId: "moyuan" });
    hiddenRun.mindTendencies = { ning: 5, nu: 0, bei: 0, mei: 0, luan: 0, wu: 8 };

    const hiddenChoices = getAvailableFinalChoices(hiddenRun);
    expect(hiddenChoices.map((choice) => choice.id)).toContain("final_lay_down_brush");

    const selection = selectFinalChoice(hiddenRun, "final_lay_down_brush");
    expect(selection?.ending.id).toBe("ending_hidden_wu");
    expect(selection?.characterEpilogue.id).toBe("epilogue_zhaoyun_changban_nameless");
  });

  it("rejects final choices that do not match the run's mind and ink eligibility", () => {
    const calmRun = createDebugRun({ characterId: "diaochan", chapterId: "moyuan" });
    calmRun.mindTendencies = { ning: 5, nu: 0, bei: 0, mei: 1, luan: 0, wu: 4 };

    expect(selectFinalChoice(calmRun, "final_merge_heart_demon")).toBeUndefined();
    expect(selectFinalChoice(calmRun, "final_seal_moyuan")?.ending.id).toBe("ending_clear_seal");
  });

  it("provides grounded character epilogues for all four MVP characters", () => {
    expect(characterEpiloguesById.epilogue_zhaoyun_white_dragon_return.title).toBe("白龙归阵");
    expect(characterEpiloguesById.epilogue_diaochan_closed_moon_return.title).toBe("闭月归心");
    expect(characterEpiloguesById.epilogue_caiwenji_clear_tone_ferry.title).toBe("清音渡魂");
    expect(characterEpiloguesById.epilogue_zhugeliang_wolong_return.title).toBe("卧龙归山");
    expect(Object.values(characterEpiloguesById).every((epilogue) => epilogue.body.length > 20)).toBe(true);

    expect(selectCharacterEpilogue(createDebugRun({ characterId: "diaochan" }), "ending_heart_demon")?.id).toBe("epilogue_diaochan_heart_demon_charm");
    expect(selectCharacterEpilogue(createDebugRun({ characterId: "caiwenji" }), "ending_hidden_wu")?.id).toBe("epilogue_caiwenji_five_tones_one");
    expect(selectCharacterEpilogue(createDebugRun({ characterId: "zhugeliang" }), "ending_rewrite_fate")?.id).toBe("epilogue_zhugeliang_borrow_wind_fate");
  });
});
