import { describe, expect, it } from "vitest";
import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import { simulateBattlePlan, summarizeRunPacing } from "../../src/game/systems/debug/runSimulator";

describe("run simulator", () => {
  it("estimates battle pacing without renderer state", () => {
    const run = createDebugRun({ chapterId: "bamboo", characterId: "zhaoyun" });
    const result = simulateBattlePlan(run, "enemy_bamboo_wraith", {
      maxTurns: 8,
      preferDefenseAtIncomingDamage: 10
    });

    expect(result.outcome).toMatch(/victory|defeat|timeout/);
    expect(result.turns).toBeGreaterThan(0);
    expect(result.turns).toBeLessThanOrEqual(8);
    expect(result.damageTaken).toBeGreaterThanOrEqual(0);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it("summarizes chapter two and three pacing bands", () => {
    const summary = summarizeRunPacing(["bamboo", "changan"], ["zhaoyun", "diaochan"]);

    expect(summary.encounters.length).toBeGreaterThanOrEqual(12);
    expect(summary.warnings.every((warning) => !warning.includes("missing enemy"))).toBe(true);
    expect(summary.averageTurnsByChapter.bamboo).toBeGreaterThan(1);
    expect(summary.averageTurnsByChapter.changan).toBeGreaterThan(1);
  });

  it("flags missing enemies, timeout-prone fights, and unsafe damage spikes", () => {
    const missing = simulateBattlePlan(createDebugRun({ chapterId: "bamboo" }), "enemy_missing", { maxTurns: 2 });
    expect(missing.outcome).toBe("missing-enemy");
    expect(missing.warnings).toContain("missing enemy: enemy_missing");

    const summary = summarizeRunPacing(["changan"], ["diaochan"], {
      maxTurns: 1,
      preferDefenseAtIncomingDamage: 99,
      unsafeDamageTaken: 0,
      maxCardsPerTurn: 1
    });

    expect(summary.warnings.some((warning) => warning.includes("timeout-prone encounter"))).toBe(true);
    expect(summary.warnings.some((warning) => warning.includes("unsafe damage spike"))).toBe(true);
  });
});
