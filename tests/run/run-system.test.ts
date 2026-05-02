import { cardsById } from "../../src/game/content/cards";
import {
  addRelic,
  createRun,
  getAvailableNodes,
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
