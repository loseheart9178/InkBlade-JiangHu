import { cardsById } from "../../src/game/content/cards";
import {
  addRelic,
  claimBattleSpoils,
  createRun,
  getAvailableNodes,
  getNextRelicReward,
  getUpgradeCandidates,
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
    expect(getAvailableNodes(run).map((node) => node.type)).toEqual(["battle", "event"]);
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
    expect(getAvailableNodes(run).map((node) => node.id)).toEqual(["shop-1", "elite-1"]);
  });

  it("adds selected reward cards to the permanent deck", () => {
    const run = createRun("zhaoyun");

    takeCardReward(run, cardsById.common_pifeng);

    expect(run.deck.at(-1)?.cardId).toBe("common_pifeng");
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
