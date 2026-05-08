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
    expect(relicList.length).toBeGreaterThanOrEqual(40);
    expect(getRelicRewardPool("elite", "zhaoyun")).toEqual(expect.arrayContaining(["relic_dragon_scale_tip", "relic_changban_iron_seal"]));
    expect(getRelicRewardPool("elite", "diaochan")).toEqual(expect.arrayContaining(["relic_lotus_step_bell", "relic_half_moon_hairpin"]));
    expect(getRelicRewardPool("elite", "caiwenji")).toEqual(expect.arrayContaining(["relic_echoing_jade_chime"]));
    expect(getRelicRewardPool("elite", "zhugeliang")).toEqual(expect.arrayContaining(["relic_starlit_tactical_map"]));
    expect(getRelicRewardPool("elite", "zhaoyun")).toEqual(expect.arrayContaining(["relic_cloud_dragon_scale", "relic_white_cloak_knot"]));
    expect(getRelicRewardPool("elite", "diaochan")).toEqual(expect.arrayContaining(["relic_moon_shadow_bell", "relic_silk_scheme_token"]));
    expect(getRelicRewardPool("elite", "caiwenji")).toEqual(expect.arrayContaining(["relic_orchid_jade_pick", "relic_clear_rain_score"]));
    expect(getRelicRewardPool("elite", "zhugeliang")).toEqual(expect.arrayContaining(["relic_astrolabe_shard", "relic_bagua_copper_coin"]));
    expect(getRelicRewardPool("elite", "zhaoyun")).toEqual(expect.arrayContaining([
      "relic_morning_tea_cup",
      "relic_dark_ink_amulet",
      "relic_sky_piercer_coin",
      "relic_silk_step_amulet",
      "relic_peaceful_scroll",
      "relic_willow_brace"
    ]));
    expect(getRelicRewardPool("elite", "caiwenji")).toContain("relic_qin_resonance_scale");
    expect(getRelicRewardPool("elite", "zhugeliang")).toContain("relic_star_seal_bracket");
    expect(getRelicRewardPool("boss", "zhaoyun").length).toBeGreaterThanOrEqual(6);
    expect(getShopRelicPool("diaochan").length).toBeGreaterThanOrEqual(3);
    expect(getShopRelicPool("zhaoyun")).toContain("relic_traveling_cloak");
    expect(getShopRelicPool("caiwenji")).toContain("relic_echoing_jade_chime");
    expect(getShopRelicPool("zhugeliang")).toContain("relic_starlit_tactical_map");
    expect(getShopRelicPool()).toEqual(expect.arrayContaining(["relic_still_heart_lantern", "relic_unwritten_inkstone", "relic_morning_tea_cup", "relic_peaceful_scroll"]));
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
    expect(describeRelicSource("relic_unwritten_inkstone")).toBe("绝 · 首领/游商");
    expect(describeRelicSource("relic_cloud_dragon_scale")).toBe("凡 · 精英/首领/游商");
    expect(describeRelicSource("relic_white_dragon_tassel")).toBe("章 · 初始");
    expect(describeRelicSource("relic_old_wooden_sword")).not.toMatch(/elite|boss|shop/);
  });
});

describe("relic combat hooks", () => {
  it("Jianghu Whetstone increases all attack card damage", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [{ ...enemiesById.enemy_ink_bandit, maxHp: 20 }],
      rngSeed: 28,
      relicIds: ["relic_jianghu_whetstone"],
      shuffleDeck: false
    });

    playFirst(state, "zhao_strike");

    expect(state.enemies[0].hp).toBe(13);
  });

  it("Traveling Cloak grants opening block", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 29,
      relicIds: ["relic_traveling_cloak"],
      shuffleDeck: false
    });

    expect(state.player.block).toBe(3);
    expect(state.combatLog).toContain("行脚斗篷");
  });

  it("Cloud Dragon Scale adds spear resource on the third attack", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_strike", "zhao_strike", "zhao_strike", "zhao_guard"] },
      cards: cardList,
      enemies: [{ ...enemiesById.enemy_ink_bandit, maxHp: 50 }],
      rngSeed: 30,
      relicIds: ["relic_cloud_dragon_scale"],
      shuffleDeck: false
    });

    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");

    expect(state.player.resource.value).toBe(5);
    expect(state.combatLog.filter((entry) => entry === "云龙鳞")).toHaveLength(1);
  });

  it("Moon Shadow Bell grants dodge on the first body card", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_lingbo", "diao_lingbo", "diao_strike", "diao_guard", "diao_charm"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 31,
      relicIds: ["relic_moon_shadow_bell"],
      shuffleDeck: false
    });

    playFirst(state, "diao_lingbo", "player");
    playFirst(state, "diao_lingbo", "player");

    expect(state.player.statuses.dodge).toBe(1);
    expect(state.combatLog.filter((entry) => entry === "月影铃")).toHaveLength(1);
  });

  it("Still Heart Lantern rewards the first mind transition", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["mind_jingxin", "zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 32,
      relicIds: ["relic_still_heart_lantern"],
      shuffleDeck: false
    });

    playFirst(state, "mind_jingxin", "player");

    expect(state.player.block).toBeGreaterThanOrEqual(12);
    expect(state.combatLog.filter((entry) => entry === "止水灯")).toHaveLength(1);
  });

  it("Unwritten Inkstone converts the first ink mark into tempo", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["ink_unwritten_page", "zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 33,
      relicIds: ["relic_unwritten_inkstone"],
      shuffleDeck: false
    });

    playFirst(state, "ink_unwritten_page", "player");

    expect(state.player.block).toBe(2);
    expect(state.combatLog.filter((entry) => entry === "未写砚")).toHaveLength(1);
  });

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

  it("Morning Tea Cup draws opening tempo at combat start", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 36,
      relicIds: ["relic_morning_tea_cup"],
      shuffleDeck: false
    });

    expect(state.piles.hand).toHaveLength(6);
    expect(state.combatLog.filter((entry) => entry === "晨茶盏")).toHaveLength(1);
  });

  it("Dark Ink Amulet adds draw and armor on the first ink card", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["ink_unwritten_page", "zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 37,
      relicIds: ["relic_dark_ink_amulet"],
      shuffleDeck: false
    });

    playFirst(state, "ink_unwritten_page", "player");

    expect(state.piles.hand).toHaveLength(7);
    expect(state.combatLog.filter((entry) => entry === "墨影符")).toHaveLength(1);
  });

  it("Sky Piercer Coin adds armor on the third attack", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_strike", "zhao_strike", "zhao_strike", "zhao_guard"] },
      cards: cardList,
      enemies: [{ ...enemiesById.enemy_ink_bandit, maxHp: 50 }],
      rngSeed: 38,
      relicIds: ["relic_sky_piercer_coin"],
      shuffleDeck: false
    });
    state.player.energy = 4;

    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");
    playFirst(state, "zhao_strike");

    expect(state.player.block).toBe(3);
    expect(state.combatLog.filter((entry) => entry === "穿云钱")).toHaveLength(1);
  });

  it("Silk Step Amulet reinforces the first body card", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_lingbo", "diao_strike", "diao_guard", "diao_charm", "diao_lotus_blade"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 39,
      relicIds: ["relic_silk_step_amulet"],
      shuffleDeck: false
    });

    playFirst(state, "diao_lingbo", "player");

    expect(state.player.block).toBe(6);
    expect(state.combatLog.filter((entry) => entry === "绫步佩")).toHaveLength(1);
  });

  it("Peaceful Scroll adds tempo on the first mind transition", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["mind_jingxin", "zhao_strike", "zhao_guard", "zhao_guard", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 40,
      relicIds: ["relic_peaceful_scroll"],
      shuffleDeck: false
    });
    const beforeResource = state.player.resource.value;

    playFirst(state, "mind_jingxin", "player");

    expect(state.player.resource.value).toBe(beforeResource + 1);
    expect(state.piles.hand).toHaveLength(5);
    expect(state.combatLog.filter((entry) => entry === "静心卷")).toHaveLength(1);
  });

  it("Willow Brace refunds resource after the first guard success", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_guardian", "zhao_guard", "zhao_strike", "zhao_strike", "zhao_strike"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 41,
      relicIds: ["relic_willow_brace"],
      shuffleDeck: false
    });
    const beforeResource = state.player.resource.value;

    playFirst(state, "zhao_guardian", "player");
    endPlayerTurn(state);

    expect(state.player.resource.value).toBe(beforeResource + 1);
    expect(state.combatLog.filter((entry) => entry === "垂柳腕")).toHaveLength(1);
  });

  it("Qin Resonance Scale adds sound tempo after the first cleanse", () => {
    const state = createCombat({
      character: { ...charactersById.caiwenji, starterDeck: ["status_canyin", "cai_cleansing_rain", "cai_echoing_melody", "cai_clear_tone", "cai_listen_still", "cai_broken_string", "cai_qingxin_song"] },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 42,
      relicIds: ["relic_qin_resonance_scale"],
      shuffleDeck: false
    });
    const beforeResource = state.player.resource.value;

    playFirst(state, "cai_cleansing_rain", "player");

    expect(state.player.resource.value).toBe(beforeResource + 2);
    expect(state.piles.hand).toHaveLength(5);
    expect(state.combatLog.filter((entry) => entry === "琴应鳞")).toHaveLength(1);
  });

  it("Star Seal Bracket strengthens the first formation card", () => {
    const state = createCombat({
      character: { ...charactersById.zhugeliang, starterDeck: ["zhuge_small_eight_array", "zhuge_observe_stars", "zhuge_guard", "zhuge_fan_strike", "zhuge_empty_city"] },
      cards: cardList,
      enemies: [enemiesById.enemy_bamboo_wraith],
      rngSeed: 43,
      relicIds: ["relic_star_seal_bracket"],
      shuffleDeck: false
    });
    const beforeResource = state.player.resource.value;

    playFirst(state, "zhuge_small_eight_array", "player");

    expect(state.player.resource.value).toBe(beforeResource + 2);
    expect(state.player.block).toBe(6);
    expect(state.combatLog.filter((entry) => entry === "星封箍")).toHaveLength(1);
  });
});
