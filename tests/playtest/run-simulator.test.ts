import { describe, expect, it } from "vitest";
import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import { createBalanceReport, formatBalanceReportMarkdown } from "../../src/game/systems/debug/balanceReport";
import { simulateBattlePlan, simulateFullRoute, summarizeRunPacing } from "../../src/game/systems/debug/runSimulator";

const ALPHA_CHARACTER_IDS = ["zhaoyun", "diaochan", "caiwenji", "zhugeliang"];
const ALPHA_CHAPTER_IDS = ["luoshui", "bamboo", "changan", "moyuan"];

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

  it("keeps normal alpha pacing summaries warning-free for all characters and chapters", () => {
    const summary = summarizeRunPacing(ALPHA_CHAPTER_IDS, ALPHA_CHARACTER_IDS);
    const nonVictories = summary.encounters
      .filter((encounter) => encounter.outcome !== "victory")
      .map((encounter) => `${encounter.chapterId}/${encounter.characterId}/${encounter.enemyId}:${encounter.outcome}`);

    expect(summary.encounters).toHaveLength(76);
    expect(nonVictories).toEqual([]);
    expect(summary.warnings.filter((warning) => warning.includes("missing enemy"))).toEqual([]);
    expect(summary.warnings.filter((warning) => warning.includes("timeout-prone encounter"))).toEqual([]);
    expect(summary.warnings.filter((warning) => warning.includes("unsafe damage spike"))).toEqual([]);
    expect(Object.keys(summary.averageTurnsByChapter)).toEqual(ALPHA_CHAPTER_IDS);
  });

  it("simulates a deterministic full alpha route into an ending-ready summary for all characters", () => {
    const results = ALPHA_CHARACTER_IDS.map((characterId) => simulateFullRoute(characterId, { mapSeed: 9001 }));
    const routeFailures = results
      .filter((result) => result.outcome !== "completed")
      .map((result) => {
        const lastEncounter = result.encounters.at(-1);
        return `${result.characterId}:${result.outcome}:${lastEncounter?.chapterId}/${lastEncounter?.enemyId}:${lastEncounter?.outcome}:${lastEncounter?.finalPlayerHp}`;
      });

    expect(routeFailures).toEqual([]);
    expect(results.every((result) => result.finalState?.status === "endingReady")).toBe(true);
    expect(results.every((result) => result.completedChapterIds.join(">") === "luoshui>bamboo>changan>moyuan")).toBe(true);
    expect(results.flatMap((result) => result.warnings)).toEqual([]);
  });

  it("creates deterministic balance report evidence for shipped hero routes", () => {
    const first = createBalanceReport({ routeSeed: 9001 });
    const second = createBalanceReport({ routeSeed: 9001 });

    expect(second).toEqual(first);
    expect(first.reportId).toBe("wave7-alpha-balance-v1");
    expect(first.seed).toBe(9001);
    expect(first.characters.map((character) => character.id)).toEqual(ALPHA_CHARACTER_IDS);
    expect(first.chapters.map((chapter) => chapter.id)).toEqual(ALPHA_CHAPTER_IDS);
    expect(first.routes).toHaveLength(ALPHA_CHARACTER_IDS.length);
    expect(first.aggregate.completedRoutes).toBeGreaterThanOrEqual(1);
    expect(first.acceptance.hasRepresentativeCompletionRoute).toBe(true);
    expect(first.acceptance.allShippedHeroRoutesComplete).toBe(true);
    expect(first.acceptance.usesRendererState).toBe(false);

    for (const route of first.routes) {
      expect(route).toMatchObject({
        outcome: "completed",
        chapterReach: {
          endingReady: true
        },
        timeoutRisk: {
          hasTimeout: false,
          encounters: []
        }
      });
      expect(route.chapterReach.completed).toEqual(ALPHA_CHAPTER_IDS);
      expect(route.turnCounts.total).toBeGreaterThan(0);
      expect(route.healingPressure.totalDamageTaken).toBeGreaterThanOrEqual(0);
      expect(route.unsafeDamageSpikes).toEqual([]);
    }

    expect(first.findings.some((finding) => finding.includes("4/4 representative shipped hero routes completed"))).toBe(true);
    expect(formatBalanceReportMarkdown(first)).toContain("Wave 7 Alpha Balance Report");
  });

  it("builds a deterministic multi-seed balance aggregate", () => {
    const report = createBalanceReport({ seeds: [9001, 9002, 9003] });

    expect(report.seed).toBe(9001);
    expect(report.seeds).toEqual([9001, 9002, 9003]);
    expect(report.aggregate.characters.zhaoyun.completed).toBeGreaterThanOrEqual(1);
    expect(report.aggregate.characters.diaochan).toBeDefined();
    expect(report.aggregate.characters.caiwenji).toBeDefined();
    expect(report.aggregate.characters.zhugeliang).toBeDefined();
    expect(report.aggregate.totalRuns).toBe(12);
    expect(report.aggregate.completedRoutes).toBe(12);
    expect(report.aggregate.characters.zhugeliang.completed).toBe(3);
    expect(report.aggregate.characters.zhugeliang.minLowestPostCombatHp).toBeGreaterThanOrEqual(8);
    expect(report.aggregate.characters.zhugeliang.medianLowestPostCombatHp).toBeGreaterThanOrEqual(8);
    expect(report.aggregate.characters.zhugeliang.timeoutRiskCount).toBe(0);
    expect(report.aggregate.characters.zhugeliang.unsafeSpikeCount).toBe(0);
    const zhugeRoutes = report.routes.filter((route) => route.characterId === "zhugeliang");
    expect(zhugeRoutes.every((route) => route.outcome === "completed")).toBe(true);
    expect(zhugeRoutes.every((route) => route.turnCounts.total <= 90)).toBe(true);
    expect(zhugeRoutes.every((route) => !route.timeoutRisk.hasTimeout)).toBe(true);
    expect(zhugeRoutes.every((route) => route.unsafeDamageSpikes.length === 0)).toBe(true);
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
