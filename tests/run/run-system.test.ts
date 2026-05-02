import { cardsById } from "../../src/game/content/cards";
import {
  addRelic,
  claimBattleSpoils,
  createCardRewardDraft,
  createCardRewardReasonMap,
  createRun,
  getAvailableNodes,
  getComboRewardHint,
  getNextRelicReward,
  getUpgradeCandidates,
  recordRunCombatCombos,
  removeDeckCard,
  takeCardReward,
  travelToNode,
  upgradeDeckCard
} from "../../src/game/systems/run/run";

describe("run system", () => {
  it("creates a run with starter deck and first reachable map nodes", () => {
    const run = createRun("zhaoyun");

    expect(run.characterId).toBe("zhaoyun");
    expect(run.deck).toHaveLength(10);
    expect(run.relicIds).toEqual(["relic_white_dragon_tassel"]);
    expect(run.currentNodeId).toBe("start");
    expect(getAvailableNodes(run).map((node) => node.type)).toEqual(expect.arrayContaining(["battle", "event"]));
  });

  it("assigns character-specific event nodes for the first route event", () => {
    const zhaoRun = createRun("zhaoyun");
    const diaoRun = createRun("diaochan");

    expect(zhaoRun.mapNodes.find((node) => node.id === "event-1")?.eventId).toBe("event_changban_echo");
    expect(diaoRun.mapNodes.find((node) => node.id === "event-1")?.eventId).toBe("event_palace_lantern_banquet");
  });

  it("creates deterministic route variants from a map seed", () => {
    const baseRun = createRun("zhaoyun", { mapSeed: 0 });
    const variantRun = createRun("zhaoyun", { mapSeed: 1 });

    expect(baseRun.mapNodes.find((node) => node.id === "elite-1")?.enemyId).toBe("elite_sword_echo");
    expect(variantRun.mapNodes.find((node) => node.id === "elite-1")?.enemyId).toBe("elite_blood_banner");
    expect(variantRun.mapSeed).toBe(1);
  });

  it("builds a procedural chapter topology with floors, lanes, and forward connections", () => {
    const run = createRun("zhaoyun", { mapSeed: 9 });
    const start = run.mapNodes.find((node) => node.id === "start");
    const boss = run.mapNodes.find((node) => node.id === "boss");

    expect(start?.floor).toBe(0);
    expect(start?.connections.length).toBeGreaterThanOrEqual(2);
    expect(boss?.type).toBe("boss");
    expect(boss?.connections).toEqual([]);
    expect(run.mapNodes.length).toBeGreaterThan(9);

    const floors = new Map<number, number>();
    for (const node of run.mapNodes) {
      floors.set(node.floor, (floors.get(node.floor) ?? 0) + 1);
      for (const connectionId of node.connections) {
        const next = run.mapNodes.find((item) => item.id === connectionId);
        expect(next).toBeDefined();
        expect(next!.floor).toBeGreaterThan(node.floor);
      }
    }

    expect(floors.get(1)).toBeGreaterThanOrEqual(2);
    expect(floors.get(2)).toBeGreaterThanOrEqual(2);
    expect(boss?.floor).toBe(Math.max(...run.mapNodes.map((node) => node.floor)));
  });

  it("changes optional branches for different map seeds while preserving the main route", () => {
    const runA = createRun("zhaoyun", { mapSeed: 2 });
    const runB = createRun("zhaoyun", { mapSeed: 5 });

    expect(runA.mapNodes.map((node) => `${node.id}:${node.type}:${node.enemyId ?? node.eventId ?? ""}`)).not.toEqual(
      runB.mapNodes.map((node) => `${node.id}:${node.type}:${node.enemyId ?? node.eventId ?? ""}`)
    );
    expect(runA.mapNodes.some((node) => node.id === "event-1")).toBe(true);
    expect(runA.mapNodes.some((node) => node.id === "rest-1")).toBe(true);
    expect(runA.mapNodes.some((node) => node.id === "battle-3")).toBe(true);
    expect(runB.mapNodes.some((node) => node.id === "event-1")).toBe(true);
    expect(runB.mapNodes.some((node) => node.id === "rest-1")).toBe(true);
    expect(runB.mapNodes.some((node) => node.id === "battle-3")).toBe(true);
  });

  it("gives Diao Chan her starting relic", () => {
    const run = createRun("diaochan");

    expect(run.relicIds).toEqual(["relic_closed_moon_sachet"]);
  });

  it("rejects travel to nodes that are not connected from the current node", () => {
    const run = createRun("diaochan");

    expect(() => travelToNode(run, "boss")).toThrow("Cannot travel");
  });

  it("travels to connected nodes and marks the previous node visited", () => {
    const run = createRun("zhaoyun");

    travelToNode(run, "battle-1");

    expect(run.currentNodeId).toBe("battle-1");
    expect(run.visitedNodeIds).toContain("start");
    expect(getAvailableNodes(run).map((node) => node.id)).toEqual(["shop-1", "battle-2"]);
  });

  it("adds selected reward cards to the permanent deck", () => {
    const run = createRun("zhaoyun");

    takeCardReward(run, cardsById.common_pifeng);

    expect(run.deck.at(-1)?.cardId).toBe("common_pifeng");
  });

  it("records combat combos for the next reward draft", () => {
    const run = createRun("zhaoyun");

    recordRunCombatCombos(run, ["xushi", "lianzhan"]);

    expect(run.lastCombatComboTriggers).toEqual(["xushi", "lianzhan"]);
  });

  it("biases Zhao Yun normal card rewards toward the latest combo chain", () => {
    const run = createRun("zhaoyun");
    recordRunCombatCombos(run, ["xushi", "lianzhan"]);

    const draft = createCardRewardDraft(run, "battle");
    const reasons = (draft as unknown as { reasons: Record<string, string> }).reasons;

    expect(draft.comboId).toBe("lianzhan");
    expect(draft.comboName).toBe("连斩");
    expect(draft.cards).toHaveLength(3);
    expect(draft.cards[0].id).toBe("zhao_white_dragon");
    expect(draft.cards.map((card) => card.id)).toContain("common_feishi");
    expect(new Set(draft.cards.map((card) => card.id)).size).toBe(3);
    expect(reasons[draft.cards[0].id]).toContain("连斩枪势流");
    expect(getComboRewardHint(run)).toContain("连斩");
  });

  it("biases Diao Chan rewards toward body-attack chain support", () => {
    const run = createRun("diaochan");
    recordRunCombatCombos(run, ["zhuiying"]);

    const draft = createCardRewardDraft(run, "battle");
    const reasons = createCardRewardReasonMap(run, draft.cards);

    expect(draft.comboId).toBe("zhuiying");
    expect(draft.cards[0].id).toBe("diao_lotus_blade");
    expect(draft.cards.map((card) => card.id)).toContain("common_zhuiying");
    expect(reasons[draft.cards[0].id]).toContain("舞势连击流");
  });

  it("uses archetype tags to recommend defensive and charm build rewards", () => {
    const zhaoRun = createRun("zhaoyun");
    recordRunCombatCombos(zhaoRun, ["xushi"]);
    const zhaoDraft = createCardRewardDraft(zhaoRun, "battle");

    expect((zhaoDraft.cards[0] as { archetypes?: string[] }).archetypes).toContain("zhao-guardian-counter");
    expect((zhaoDraft as unknown as { reasons: Record<string, string> }).reasons[zhaoDraft.cards[0].id]).toContain("护主防反流");

    const diaoRun = createRun("diaochan");
    recordRunCombatCombos(diaoRun, ["xushi"]);
    const diaoDraft = createCardRewardDraft(diaoRun, "battle");

    expect((diaoDraft.cards[0] as { archetypes?: string[] }).archetypes).toContain("diao-charm-control");
    expect((diaoDraft as unknown as { reasons: Record<string, string> }).reasons[diaoDraft.cards[0].id]).toContain("魅惑控制流");
  });

  it("keeps ink cards out of ordinary rewards unless the ink combo was used", () => {
    const ordinary = createCardRewardDraft(createRun("zhaoyun"), "battle");
    expect(ordinary.cards.some((card) => card.rarity === "ink")).toBe(false);

    const run = createRun("zhaoyun");
    recordRunCombatCombos(run, ["moxi"]);

    const inkDraft = createCardRewardDraft(run, "battle");

    expect(inkDraft.comboId).toBe("moxi");
    expect(inkDraft.cards[0].rarity).toBe("ink");
  });

  it("adds relics once and refuses duplicates", () => {
    const run = createRun("zhaoyun");

    expect(addRelic(run, "relic_old_wooden_sword")).toBe(true);
    expect(addRelic(run, "relic_old_wooden_sword")).toBe(false);
    expect(run.relicIds).toContain("relic_old_wooden_sword");
  });

  it("claims normal battle spoils as gold without relics", () => {
    const run = createRun("zhaoyun");
    const beforeGold = run.gold;

    const spoils = claimBattleSpoils(run, "battle");

    expect(spoils).toEqual({ gold: 12 });
    expect(run.gold).toBe(beforeGold + 12);
    expect(run.relicIds).toEqual(["relic_white_dragon_tassel"]);
  });

  it("claims elite spoils with the next unowned relic", () => {
    const run = createRun("zhaoyun");

    const spoils = claimBattleSpoils(run, "elite");

    expect(spoils).toEqual({ gold: 25, relicId: "relic_old_wooden_sword" });
    expect(run.relicIds).toContain("relic_old_wooden_sword");
  });

  it("claims boss spoils with boss-level gold and a relic when available", () => {
    const run = createRun("diaochan");

    const spoils = claimBattleSpoils(run, "boss");

    expect(spoils).toEqual({ gold: 50, relicId: "relic_old_wooden_sword" });
    expect(run.gold).toBe(149);
    expect(run.relicIds).toContain("relic_old_wooden_sword");
  });

  it("falls back to gold-only spoils when relic pool is exhausted", () => {
    const run = createRun("zhaoyun");
    addRelic(run, "relic_old_wooden_sword");
    addRelic(run, "relic_black_paper_umbrella");

    expect(getNextRelicReward(run)).toBeUndefined();
    expect(claimBattleSpoils(run, "elite")).toEqual({ gold: 25 });
  });

  it("removes deck cards and upgrades eligible cards", () => {
    const run = createRun("zhaoyun");
    const removedId = run.deck[0].instanceId;
    const upgradeId = run.deck[1].instanceId;

    expect(removeDeckCard(run, removedId)).toBe(true);
    expect(run.deck.some((entry) => entry.instanceId === removedId)).toBe(false);
    expect(getUpgradeCandidates(run).some((entry) => entry.instanceId === upgradeId)).toBe(true);
    expect(upgradeDeckCard(run, upgradeId)).toBe(true);
    expect(run.deck.find((entry) => entry.instanceId === upgradeId)?.upgraded).toBe(true);
    expect(upgradeDeckCard(run, upgradeId)).toBe(false);
  });
});
