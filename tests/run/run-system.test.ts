import { cardsById } from "../../src/game/content/cards";
import { createRun, getAvailableNodes, takeCardReward, travelToNode } from "../../src/game/systems/run/run";

describe("run system", () => {
  it("creates a run with starter deck and first reachable map nodes", () => {
    const run = createRun("zhaoyun");

    expect(run.characterId).toBe("zhaoyun");
    expect(run.deck).toHaveLength(10);
    expect(run.currentNodeId).toBe("start");
    expect(getAvailableNodes(run).map((node) => node.type)).toEqual(["battle", "event"]);
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
});

