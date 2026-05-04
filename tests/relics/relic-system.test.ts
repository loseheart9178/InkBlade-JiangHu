import { describe, expect, it } from "vitest";
import { cardList } from "../../src/game/content/cards";
import { charactersById } from "../../src/game/content/characters";
import { enemiesById } from "../../src/game/content/enemies";
import { relicList } from "../../src/game/content/relics";
import { createCombat, endPlayerTurn, playCard } from "../../src/game/systems/combat/combat";
import { claimBattleSpoils, createRun } from "../../src/game/systems/run/run";
import { describeRelicSource, getRelicRewardPool, getShopRelicPool } from "../../src/game/systems/relics/relicEffects";

function playFirst(state: ReturnType<typeof createCombat>, cardId: string, targetId = state.enemies[0].id): void {
  const card = state.piles.hand.find((item) => item.definitionId === cardId);
  if (!card) {
    throw new Error(`Missing card ${cardId}`);
  }

  const result = playCard(state, card.instanceId, targetId);
  expect(result.ok).toBe(true);
}

describe("relic reward pools", () => {
  it("defines a larger first-chapter relic pool split by reward source", () => {
    expect(relicList.length).toBeGreaterThanOrEqual(12);
    expect(getRelicRewardPool("elite", "zhaoyun")).toEqual(expect.arrayContaining(["relic_dragon_scale_tip", "relic_changban_iron_seal"]));
    expect(getRelicRewardPool("elite", "diaochan")).toEqual(expect.arrayContaining(["relic_lotus_step_bell", "relic_half_moon_hairpin"]));
    expect(getRelicRewardPool("elite", "caiwenji")).toEqual(expect.arrayContaining(["relic_echoing_jade_chime"]));
    expect(getRelicRewardPool("elite", "zhugeliang")).toEqual(expect.arrayContaining(["relic_starlit_tactical_map"]));
    expect(getRelicRewardPool("boss", "zhaoyun").length).toBeGreaterThanOrEqual(6);
    expect(getShopRelicPool("diaochan").length).toBeGreaterThanOrEqual(3);
    expect(getShopRelicPool("caiwenji")).toContain("relic_echoing_jade_chime");
    expect(getShopRelicPool("zhugeliang")).toContain("relic_starlit_tactical_map");
  });

  it("elite spoils draw from the expanded unowned pool", () => {
    const run = createRun("zhaoyun", { mapSeed: 8 });
    const spoils = claimBattleSpoils(run, "elite");

    expect(spoils.relicId).toBe("relic_dragon_scale_tip");
    expect(run.relicIds).toContain("relic_dragon_scale_tip");
  });

  it("describes relic reward sources in Chinese-facing UI labels", () => {
    expect(describeRelicSource("relic_old_wooden_sword")).toBe("凡 · 精英/首领/游商");
    expect(describeRelicSource("relic_qingyin_jade")).toBe("绝 · 首领/游商");
    expect(describeRelicSource("relic_white_dragon_tassel")).toBe("章 · 初始");
    expect(describeRelicSource("relic_old_wooden_sword")).not.toMatch(/elite|boss|shop/);
  });
});

describe("relic combat hooks", () => {
  it("Dragon Scale Tip adds damage on the third attack and does not double-fire on the fourth", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_strike", "zhao_strike", "zhao_strike", "zhao_guard"] },
      cards: cardList,
      enemies: [{ ...enemiesById.enemy_ink_bandit, maxHp: 40 }],
      rngSeed: 30,
      relicIds: ["relic_dragon_scale_tip"],
      shuffleDeck: false
    });
    state.player.energy = 4;

    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");

    expect(state.enemies[0].hp).toBe(5);
    expect(state.combatLog.filter((entry) => entry === "鳞锋枪尖")).toHaveLength(1);
  });

  it("Changban Iron Seal reacts once when guard absorbs damage", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_guardian", "zhao_guard", "zhao_strike", "zhao_strike", "zhao_strike"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 31,
      relicIds: ["relic_changban_iron_seal"],
      shuffleDeck: false
    });

    playFirst(state, "zhao_guardian", "player");
    endPlayerTurn(state);

    expect(state.combatLog.filter((entry) => entry === "长坂铁印")).toHaveLength(1);
  });

  it("Lotus Step Bell draws tempo once on the first body card", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_lingbo", "diao_lingbo", "diao_strike", "diao_guard", "diao_charm", "diao_strike"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 32,
      relicIds: ["relic_lotus_step_bell"],
      shuffleDeck: false
    });

    playFirst(state, "diao_lingbo", "player");
    playFirst(state, "diao_lingbo", "player");

    expect(state.combatLog.filter((entry) => entry === "莲步铃")).toHaveLength(1);
  });

  it("Half Moon Hairpin marks the enemy once when charm reaches threshold", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_charm", "diao_charm", "diao_strike", "diao_guard", "diao_lingbo"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 33,
      relicIds: ["relic_half_moon_hairpin"],
      shuffleDeck: false
    });

    playFirst(state, "diao_charm");
    playFirst(state, "diao_charm");

    expect(state.enemies[0].statuses.vulnerable).toBe(1);
    expect(state.combatLog.filter((entry) => entry === "半月钗")).toHaveLength(1);
  });

  it("Echoing Jade Chime draws once on the first echo card", () => {
    const state = createCombat({
      character: {
        ...charactersById.caiwenji,
        starterDeck: ["cai_echoing_melody", "cai_echoing_melody", "cai_plain_strike", "cai_pluck_string", "cai_hujia_beat", "cai_clear_tone"]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 34,
      relicIds: ["relic_echoing_jade_chime"],
      shuffleDeck: false
    });

    playFirst(state, "cai_echoing_melody", "player");
    playFirst(state, "cai_echoing_melody", "player");

    expect(state.combatLog.filter((entry) => entry === "回音玉磬")).toHaveLength(1);
  });

  it("Starlit Tactical Map adds strategy once on the first formation card", () => {
    const state = createCombat({
      character: {
        ...charactersById.zhugeliang,
        starterDeck: [
          "zhuge_small_eight_array",
          "zhuge_small_eight_array",
          "zhuge_fan_strike",
          "zhuge_guard",
          "zhuge_observe_stars"
        ]
      },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 35,
      relicIds: ["relic_starlit_tactical_map"],
      shuffleDeck: false
    });

    playFirst(state, "zhuge_small_eight_array", "player");
    playFirst(state, "zhuge_small_eight_array", "player");

    expect(state.player.resource.value).toBe(4);
    expect(state.combatLog.filter((entry) => entry === "星照阵图")).toHaveLength(1);
  });
});
