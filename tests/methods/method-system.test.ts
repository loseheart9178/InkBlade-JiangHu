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

  it("offers method rewards for Cai Wenji and Zhuge Liang archetypes", () => {
    const caiRun = createRun("caiwenji", { mapSeed: 21 });
    takeCardReward(caiRun, cardsById.cai_echoing_melody);
    const caiDraft = createMethodRewardDraft(caiRun);
    expect(caiDraft.methods.every((method) => method.characterId === "caiwenji")).toBe(true);
    expect(caiDraft.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining(["method_qingyin_echo", "method_hujia_cleanse"])
    );

    const zhugeRun = createRun("zhugeliang", { mapSeed: 22 });
    takeCardReward(zhugeRun, cardsById.zhuge_small_eight_array);
    const zhugeDraft = createMethodRewardDraft(zhugeRun);
    expect(zhugeDraft.methods.every((method) => method.characterId === "zhugeliang")).toBe(true);
    expect(zhugeDraft.methods.map((method) => method.id)).toEqual(
      expect.arrayContaining(["method_star_observation", "method_wind_array"])
    );
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

  it("Qingyin Echo grants one sound on the first echo card each combat", () => {
    const state = createCombat({
      character: {
        ...charactersById.caiwenji,
        starterDeck: ["cai_echoing_melody", "cai_echoing_melody", "cai_plain_strike", "cai_pluck_string", "cai_hujia_beat"]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 41,
      methodIds: ["method_qingyin_echo"],
      shuffleDeck: false
    });

    playFirst(state, "cai_echoing_melody", "player");
    playFirst(state, "cai_echoing_melody", "player");

    expect(state.player.resource.value).toBe(3);
    expect(state.combatLog.filter((entry) => entry === "清音回响")).toHaveLength(1);
  });

  it("Hujia Cleanse grants block on the first cleanse card each combat", () => {
    const state = createCombat({
      character: {
        ...charactersById.caiwenji,
        starterDeck: ["cai_clean_string", "cai_clean_string", "cai_plain_strike", "cai_pluck_string", "cai_hujia_beat"]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 42,
      methodIds: ["method_hujia_cleanse"],
      shuffleDeck: false
    });

    playFirst(state, "cai_clean_string", "player");
    playFirst(state, "cai_clean_string", "player");

    expect(state.player.block).toBe(11);
    expect(state.combatLog.filter((entry) => entry === "胡笳净心")).toHaveLength(1);
  });

  it("Star Observation grants one strategy on the first scry card each combat", () => {
    const state = createCombat({
      character: {
        ...charactersById.zhugeliang,
        starterDeck: ["zhuge_observe_stars", "zhuge_observe_stars", "zhuge_fan_strike", "zhuge_guard", "zhuge_small_eight_array"]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 43,
      methodIds: ["method_star_observation"],
      shuffleDeck: false
    });

    playFirst(state, "zhuge_observe_stars", "player");
    playFirst(state, "zhuge_observe_stars", "player");

    expect(state.player.resource.value).toBe(4);
    expect(state.combatLog.filter((entry) => entry === "观星定策")).toHaveLength(1);
  });

  it("Wind Array grants block on the first formation card each combat", () => {
    const state = createCombat({
      character: {
        ...charactersById.zhugeliang,
        starterDeck: ["zhuge_small_eight_array", "zhuge_small_eight_array", "zhuge_fan_strike", "zhuge_guard", "zhuge_observe_stars"]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 44,
      methodIds: ["method_wind_array"],
      shuffleDeck: false
    });

    playFirst(state, "zhuge_small_eight_array", "player");
    playFirst(state, "zhuge_small_eight_array", "player");

    expect(state.player.block).toBe(11);
    expect(state.combatLog.filter((entry) => entry === "借风布阵")).toHaveLength(1);
  });
});
