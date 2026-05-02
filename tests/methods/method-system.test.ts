import { describe, expect, it } from "vitest";
import { cardList, cardsById } from "../../src/game/content/cards";
import { charactersById } from "../../src/game/content/characters";
import { enemiesById } from "../../src/game/content/enemies";
import { createCombat, playCard } from "../../src/game/systems/combat/combat";
import { createRun, takeCardReward } from "../../src/game/systems/run/run";
import { claimMethodReward, createMethodRewardDraft } from "../../src/game/systems/methods/methods";

function playFirst(state: ReturnType<typeof createCombat>, definitionId: string, targetId = state.enemies[0].id): void {
  const card = state.piles.hand.find((item) => item.definitionId === definitionId);
  if (!card) {
    throw new Error(`Missing test card ${definitionId}`);
  }

  const result = playCard(state, card.instanceId, targetId);
  expect(result.ok).toBe(true);
}

describe("heart method rewards", () => {
  it("prioritizes method choices for the current character and deck archetype", () => {
    const run = createRun("zhaoyun", { mapSeed: 2 });
    takeCardReward(run, cardsById.zhao_thrust);
    takeCardReward(run, cardsById.zhao_white_dragon);

    const draft = createMethodRewardDraft(run);

    expect(draft.methods[0].id).toBe("method_dragon_spear_chain");
    expect(draft.methods.map((method) => method.id)).toContain("method_changban_guard");
    expect(draft.methods.every((method) => method.characterId === "zhaoyun")).toBe(true);
  });

  it("claims a method once and keeps it on the run", () => {
    const run = createRun("diaochan", { mapSeed: 3 });

    expect(run.methodIds).toEqual([]);
    expect(claimMethodReward(run, "method_qingcheng_charm")).toBe(true);
    expect(claimMethodReward(run, "method_qingcheng_charm")).toBe(false);
    expect(run.methodIds).toEqual(["method_qingcheng_charm"]);
  });
});

describe("heart method combat hooks", () => {
  it("Dragon Spear Chain grants one extra resource on the first attack chain each combat", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_strike", "zhao_strike", "zhao_strike", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 12,
      methodIds: ["method_dragon_spear_chain"],
      shuffleDeck: false
    });

    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");

    expect(state.player.resource.value).toBe(5);
    expect(state.combatLog.filter((entry) => entry === "龙胆连势")).toHaveLength(1);
  });

  it("Changban Guard grants one guard stack on the first guard or block card each combat", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_guard", "zhao_guard", "zhao_strike", "zhao_strike", "zhao_strike"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 13,
      methodIds: ["method_changban_guard"],
      shuffleDeck: false
    });

    playFirst(state, "zhao_guard", "player");
    playFirst(state, "zhao_guard", "player");

    expect(state.player.statuses.guard).toBe(1);
    expect(state.combatLog.filter((entry) => entry === "长坂守心")).toHaveLength(1);
  });

  it("Jinghong Dance grants one extra dance on the first body card each combat", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_lingbo", "diao_lingbo", "diao_strike", "diao_charm", "diao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 14,
      methodIds: ["method_jinghong_dance"],
      shuffleDeck: false
    });

    playFirst(state, "diao_lingbo", "player");
    playFirst(state, "diao_lingbo", "player");

    expect(state.player.resource.value).toBe(5);
    expect(state.combatLog.filter((entry) => entry === "惊鸿舞谱")).toHaveLength(1);
  });

  it("Qingcheng Charm adds one charm on the first charm application each combat", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_charm", "diao_charm", "diao_strike", "diao_guard", "diao_lingbo"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 15,
      methodIds: ["method_qingcheng_charm"],
      shuffleDeck: false
    });

    playFirst(state, "diao_charm");
    playFirst(state, "diao_charm");

    expect(state.enemies[0].statuses.charm).toBe(5);
    expect(state.combatLog.filter((entry) => entry === "倾城心诀")).toHaveLength(1);
  });
});
