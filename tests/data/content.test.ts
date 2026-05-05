import { cardList, cardsById } from "../../src/game/content/cards";
import { chapterList } from "../../src/game/content/chapters";
import { characterList } from "../../src/game/content/characters";
import { enemyList } from "../../src/game/content/enemies";
import { eventList } from "../../src/game/content/events";
import {
  getCardGlossarySurfaces,
  getGlossaryEntry,
  getGlossaryEntryByLabel,
  glossaryEntries
} from "../../src/game/content/glossary";
import { methodList } from "../../src/game/content/methods";
import { relicList } from "../../src/game/content/relics";
import * as visuals from "../../src/game/content/visuals";
import { defaultComboRules, exhaustAttackComboRule } from "../../src/game/systems/combat/combos";
import type { EnemyIntent, StatusId } from "../../src/game/systems/combat/types";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { battlefieldAssets, cardArtById, combatPortraitsById, combatSpriteSheetsById } = visuals;

const annotatedArtifactPaths = new Set([
  "/assets/generated/sword-echo-standee-gpt-v2-cutout.png",
  "/assets/generated/blood-banner-standee-gpt-v2-cutout.png",
  "/assets/sprites/sword-echo-attack-strip-gpt-v2.png",
  "/assets/sprites/blood-banner-attack-strip-gpt-v2.png",
  "/assets/sprites/ink-dongzhuo-boss-attack-strip-gpt-v2.png"
]);

const supportedActions = new Set([
  "damage",
  "block",
  "draw",
  "gainResource",
  "applyStatus",
  "gainInk",
  "cleanseCards",
  "queueEcho",
  "scry",
  "setFormation",
  "setMind"
]);

describe("content data", () => {
  it("pins the current EA playable showcase content baseline", () => {
    expect(characterList).toHaveLength(4);
    expect(chapterList).toHaveLength(4);
    expect(cardList).toHaveLength(93);
    expect(relicList).toHaveLength(32);
    expect(eventList).toHaveLength(29);
    expect(enemyList).toHaveLength(19);
    expect(methodList).toHaveLength(8);

    expect(countBy(cardList, (card) => card.rarity)).toEqual({
      starter: 15,
      common: 38,
      uncommon: 22,
      rare: 10,
      ink: 4,
      status: 4
    });
    expect(countBy(cardList, (card) => card.character ?? "neutral")).toEqual({
      zhaoyun: 18,
      diaochan: 18,
      caiwenji: 16,
      zhugeliang: 15,
      neutral: 26
    });
    expect(countBy(relicList, (relic) => relic.rarity)).toEqual({
      boss: 4,
      common: 10,
      uncommon: 14,
      rare: 4
    });
    expect(countBy(relicList, (relic) => relic.character ?? "neutral")).toEqual({
      zhaoyun: 5,
      diaochan: 5,
      caiwenji: 4,
      zhugeliang: 4,
      neutral: 14
    });

    const wave27CardIds = [
      "zhao_cloud_pierce",
      "zhao_oath_guard",
      "diao_moonstep",
      "diao_silk_snare",
      "cai_yulan_echo",
      "cai_cleansing_rain",
      "zhuge_star_gate",
      "zhuge_bamboo_slips",
      "common_cangfeng",
      "common_tashui",
      "mind_zhaoxin",
      "ink_unwritten_page"
    ];

    for (const cardId of wave27CardIds) {
      const card = cardsById[cardId];
      const art = cardArtById[cardId];

      expect(card, cardId).toBeDefined();
      expect(art, cardId).toBeDefined();
      expect(art.assetPath, cardId).toMatch(/^\/assets\/generated\/cards\/wave27-.+\.svg$/);
      expect(art.assetPath, cardId).not.toBe(cardArtById[`type_${card.types[0]}`]?.assetPath);
      expectAssetPathToExist(art.assetPath);
    }

    expect(relicList.map((relic) => relic.id)).toEqual(
      expect.arrayContaining([
        "relic_cloud_dragon_scale",
        "relic_white_cloak_knot",
        "relic_moon_shadow_bell",
        "relic_silk_scheme_token",
        "relic_orchid_jade_pick",
        "relic_clear_rain_score",
        "relic_astrolabe_shard",
        "relic_bagua_copper_coin",
        "relic_jianghu_whetstone",
        "relic_traveling_cloak",
        "relic_still_heart_lantern",
        "relic_unwritten_inkstone"
      ])
    );
  });

  it("ships a first slice card pool with common, Zhao Yun, and Diao Chan cards", () => {
    expect(cardList.length).toBeGreaterThanOrEqual(34);
    expect(cardList.some((card) => card.character === "zhaoyun")).toBe(true);
    expect(cardList.some((card) => card.character === "diaochan")).toBe(true);
    expect(cardList.some((card) => card.types.includes("ink"))).toBe(true);
    expect(cardList.some((card) => card.types.includes("mind"))).toBe(true);
  });

  it("keeps card ids unique and card effects executable by the registry", () => {
    const ids = new Set(cardList.map((card) => card.id));
    expect(ids.size).toBe(cardList.length);

    for (const card of cardList) {
      expect(card.name.length).toBeGreaterThan(0);
      expect(card.effects.length).toBeGreaterThan(0);
      for (const effect of card.effects) {
        expect(supportedActions.has(effect.action)).toBe(true);
      }
    }
  });

  it("keeps every character starter deck reference valid", () => {
    expect(characterList.map((character) => character.id)).toEqual(["zhaoyun", "diaochan", "caiwenji", "zhugeliang"]);

    for (const character of characterList) {
      expect(character.starterDeck).toHaveLength(10);
      for (const cardId of character.starterDeck) {
        expect(cardsById[cardId]).toBeDefined();
      }
    }
  });

  it("defines Cai Wenji as a playable MVP with sound resource, starter relic, and card pool", () => {
    const caiWenji = characterList.find((character) => character.id === "caiwenji");
    expect(caiWenji).toMatchObject({
      id: "caiwenji",
      name: "蔡文姬",
      maxHp: 72,
      resource: {
        id: "sound",
        name: "音律",
        max: 10,
        initial: 0
      }
    });
    expect(caiWenji?.starterDeck).toHaveLength(10);
    expect(caiWenji?.starterDeck.filter((cardId) => cardId === "cai_pluck_string")).toHaveLength(4);
    expect(caiWenji?.starterDeck.filter((cardId) => cardId === "cai_qingxin_song")).toHaveLength(1);

    expect(relicList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "relic_qingyu_qinhui",
          name: "青玉琴徽",
          character: "caiwenji"
        })
      ])
    );

    const caiCards = cardList.filter((card) => card.character === "caiwenji");
    expect(caiCards.length).toBeGreaterThanOrEqual(12);
    expect(caiCards.filter((card) => ((card as { keywords?: string[] }).keywords ?? []).includes("qin")).length).toBeGreaterThanOrEqual(6);
    expect(caiCards.filter((card) => ((card as { keywords?: string[] }).keywords ?? []).includes("echo")).length).toBeGreaterThanOrEqual(3);
    expect(caiCards.map((card) => card.id)).toEqual(
      expect.arrayContaining([
        "cai_gong_tone",
        "cai_shang_tone",
        "cai_hujia_beat",
        "cai_echoing_melody",
        "cai_soul_ferry",
        "cai_final_song"
      ])
    );
  });

  it("defines Zhuge Liang as a playable MVP with strategy resource, starter relic, and card pool", () => {
    const zhugeLiang = characterList.find((character) => character.id === "zhugeliang");
    expect(zhugeLiang).toMatchObject({
      id: "zhugeliang",
      name: "诸葛亮",
      maxHp: 66,
      resource: {
        id: "strategy",
        name: "筹策",
        max: 9,
        initial: 1
      }
    });
    expect(zhugeLiang?.starterDeck).toHaveLength(10);
    expect(zhugeLiang?.starterDeck.filter((cardId) => cardId === "zhuge_fan_strike")).toHaveLength(4);
    expect(zhugeLiang?.starterDeck.filter((cardId) => cardId === "zhuge_guard")).toHaveLength(4);
    expect(zhugeLiang?.starterDeck).toEqual(expect.arrayContaining(["zhuge_observe_stars", "zhuge_small_eight_array"]));

    expect(relicList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "relic_white_feather_fan",
          name: "白羽扇",
          character: "zhugeliang"
        })
      ])
    );

    const zhugeCards = cardList.filter((card) => card.character === "zhugeliang");
    expect(zhugeCards.length).toBeGreaterThanOrEqual(12);
    expect(zhugeCards.filter((card) => ((card as { keywords?: string[] }).keywords ?? []).includes("scry")).length).toBeGreaterThanOrEqual(3);
    expect(zhugeCards.filter((card) => ((card as { keywords?: string[] }).keywords ?? []).includes("formation")).length).toBeGreaterThanOrEqual(4);
    expect(getArchetypeCardIds("zhuge-star-control")).toEqual(
      expect.arrayContaining(["zhuge_observe_stars", "zhuge_deduction", "zhuge_plan_set", "zhuge_starfall"])
    );
    expect(getArchetypeCardIds("zhuge-formation-wind")).toEqual(
      expect.arrayContaining(["zhuge_small_eight_array", "zhuge_fire_array", "zhuge_wind_array", "zhuge_stone_array"])
    );
    expect(cardsById.zhuge_empty_city.effects).toEqual([
      { action: "block", amount: 10 },
      { action: "scry", amount: 2 }
    ]);
    expect(cardsById.zhuge_empty_city.upgrade?.effects).toEqual([
      { action: "block", amount: 13 },
      { action: "scry", amount: 3 }
    ]);
    expect(cardsById.zhuge_small_eight_array.effects).toContainEqual({
      action: "setFormation",
      formation: "eight",
      name: "八阵",
      duration: 3,
      blockAtTurnEnd: 3
    });
    expect(cardsById.zhuge_small_eight_array.upgrade?.effects).toContainEqual({
      action: "setFormation",
      formation: "eight",
      name: "八阵",
      duration: 4,
      blockAtTurnEnd: 4
    });
  });

  it("adds common cards that explicitly support combo-chain rewards", () => {
    expect(cardsById.common_feishi).toMatchObject({
      name: "飞石",
      cost: 0,
      rarity: "common",
      target: "enemy",
      exhaust: true
    });
    expect(cardsById.common_feishi.types).toEqual(["attack"]);

    expect(cardsById.common_zhuiying).toMatchObject({
      name: "追影",
      cost: 1,
      rarity: "uncommon",
      target: "enemy"
    });
    expect(cardsById.common_zhuiying.types).toEqual(["body", "attack"]);
  });

  it("tags Zhao Yun and Diao Chan cards into clear build archetypes", () => {
    expect(getArchetypeCardIds("zhao-spear-chain")).toEqual(
      expect.arrayContaining(["zhao_white_dragon", "zhao_qixing_spear", "zhao_seven_entries", "zhao_white_horse_breakout"])
    );
    expect(getArchetypeCardIds("zhao-guardian-counter")).toEqual(
      expect.arrayContaining(["zhao_guardian", "zhao_river_guard", "zhao_return_spear", "zhao_spear_wall"])
    );
    expect(getArchetypeCardIds("diao-dance-chain")).toEqual(
      expect.arrayContaining(["diao_lingbo", "diao_step_lotus", "diao_jinghong_strike", "diao_flying_sleeves"])
    );
    expect(getArchetypeCardIds("diao-charm-control")).toEqual(
      expect.arrayContaining(["diao_charm", "diao_red_ribbon", "diao_lijian", "diao_mirror_flower"])
    );

    for (const archetypeId of ["zhao-spear-chain", "zhao-guardian-counter", "diao-dance-chain", "diao-charm-control"]) {
      expect(getArchetypeCardIds(archetypeId).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("defines first chapter enemies including elites and the Dong Zhuo boss", () => {
    expect(enemyList.length).toBeGreaterThanOrEqual(5);
    expect(enemyList.some((enemy) => enemy.id === "boss_ink_dongzhuo")).toBe(true);

    for (const enemy of enemyList) {
      expect(enemy.maxHp).toBeGreaterThan(0);
      expect(enemy.intents.length).toBeGreaterThan(0);
    }
  });

  it("defines the second chapter content shell and Qin Demon status-card mechanics", () => {
    expect(chapterList.map((chapter) => chapter.id)).toEqual(expect.arrayContaining(["luoshui", "bamboo", "changan"]));
    expect(chapterList[1]).toMatchObject({
      id: "bamboo",
      name: "竹林听雨",
      bossEnemyId: "boss_qin_demon_echo"
    });

    expect(cardsById.status_zayin).toMatchObject({
      name: "杂音",
      rarity: "status",
      target: "self"
    });
    expect(cardsById.status_rain_chill).toMatchObject({
      name: "雨寒",
      rarity: "status",
      target: "self"
    });

    const enemies = Object.fromEntries(enemyList.map((enemy) => [enemy.id, enemy]));
    expect(enemies.enemy_bamboo_wraith).toMatchObject({ chapter: "bamboo", role: "normal" });
    expect(enemies.enemy_broken_scholar).toMatchObject({ chapter: "bamboo", role: "normal" });
    expect(enemies.elite_qin_score).toMatchObject({ chapter: "bamboo", role: "elite" });
    expect(enemies.boss_qin_demon_echo).toMatchObject({ chapter: "bamboo", role: "boss", name: "琴魔·残音" });
    expect(enemies.boss_qin_demon_echo.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "special", name: "断续残拍" }),
        expect.objectContaining({ type: "special", name: "悲声回环" }),
        expect.objectContaining({ type: "special", name: "绝响不散" })
      ])
    );
  });

  it("defines the final Moyuan chapter content spine", () => {
    expect(chapterList.map((chapter) => chapter.id)).toEqual(expect.arrayContaining(["moyuan"]));
    expect(chapterList.find((chapter) => chapter.id === "changan")).toMatchObject({
      nextChapterId: "moyuan"
    });
    expect(chapterList.find((chapter) => chapter.id === "moyuan")).toMatchObject({
      name: "墨渊照心",
      bossEnemyId: "boss_nameless_historian"
    });

    expect(eventList.map((event) => event.id)).toEqual(
      expect.arrayContaining(["event_heart_mirror", "event_unwritten_page", "event_broken_brush_altar"])
    );

    expect(enemyList.find((enemy) => enemy.id === "boss_nameless_historian")).toMatchObject({
      name: "无名史官",
      chapter: "moyuan",
      role: "boss"
    });
    expect(enemyList.find((enemy) => enemy.id === "boss_nameless_historian")?.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "special", name: "记录旧路" }),
        expect.objectContaining({ type: "special", name: "改写手牌" }),
        expect.objectContaining({ type: "special", name: "照心质问" }),
        expect.objectContaining({ type: "special", name: "定稿成灾" })
      ])
    );
  });

  it("keeps chapter two and three combat pacing in desktop vertical-slice bands", () => {
    const chapterTwoNormal = enemyList.filter((enemy) => enemy.chapter === "bamboo" && enemy.role === "normal");
    const chapterTwoElite = enemyList.filter((enemy) => enemy.chapter === "bamboo" && enemy.role === "elite");
    const chapterThreeNormal = enemyList.filter((enemy) => enemy.chapter === "changan" && enemy.role === "normal");
    const chapterThreeElite = enemyList.filter((enemy) => enemy.chapter === "changan" && enemy.role === "elite");

    expect(chapterTwoNormal.every((enemy) => enemy.maxHp >= 40 && enemy.maxHp <= 48)).toBe(true);
    expect(chapterTwoNormal.every((enemy) => getPeakIntentDamage(enemy) <= 12)).toBe(true);
    expect(chapterTwoNormal.every((enemy) => enemy.intents.some(intentAddsStatusCard))).toBe(true);

    expect(chapterTwoElite.every((enemy) => enemy.maxHp >= 116 && enemy.maxHp <= 126)).toBe(true);
    expect(getPeakIntentDamage(enemyList.find((enemy) => enemy.id === "boss_qin_demon_echo")!)).toBeLessThanOrEqual(30);
    expect(enemyList.find((enemy) => enemy.id === "boss_qin_demon_echo")?.maxHp).toBe(88);

    expect(chapterThreeNormal.every((enemy) => enemy.maxHp >= 48 && enemy.maxHp <= 54)).toBe(true);
    expect(chapterThreeNormal.every((enemy) => getPeakIntentDamage(enemy) <= 15)).toBe(true);
    expect(chapterThreeNormal.every((enemy) => enemy.intents.some(intentAddsStatusCard))).toBe(true);

    expect(chapterThreeElite.every((enemy) => enemy.maxHp >= 124 && enemy.maxHp <= 132)).toBe(true);
    expect(enemyList.find((enemy) => enemy.id === "boss_scribe_officer")?.maxHp).toBe(160);
    expect(getPeakIntentDamage(enemyList.find((enemy) => enemy.id === "boss_scribe_officer")!)).toBeLessThanOrEqual(24);
  });

  it("gives first chapter enemies distinct mechanics and a gentler-to-harder pacing curve", () => {
    const enemies = Object.fromEntries(enemyList.map((enemy) => [enemy.id, enemy]));

    expect(enemies.enemy_ink_bandit.maxHp).toBeLessThanOrEqual(32);
    expect(enemies.enemy_ink_bandit.intents[0]).toMatchObject({ type: "attack" });

    expect(enemies.enemy_faceless_soldier.intents.some((intent) => intent.type === "attack" && "hits" in intent && intent.hits >= 2)).toBe(true);

    expect(enemies.enemy_paper_umbrella.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "special",
          name: "纸伞迷魂"
        })
      ])
    );

    expect(enemies.elite_sword_echo.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "special", name: "剑心蓄势" }),
        expect.objectContaining({ type: "attack", damage: expect.any(Number), hits: 1 })
      ])
    );

    expect(enemies.elite_blood_banner.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "special", name: "血旗号令" })
      ])
    );

    expect(enemies.boss_ink_dongzhuo.maxHp).toBeGreaterThanOrEqual(124);
    expect(enemies.boss_ink_dongzhuo.intents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "special", name: "宫宴压迫" }),
        expect.objectContaining({ type: "special", name: "吞噬权柄" })
      ])
    );
  });

  it("defines first slice relics and events from the PRD scope", () => {
    expect(relicList.map((relic) => relic.id)).toEqual(
      expect.arrayContaining(["relic_white_dragon_tassel", "relic_closed_moon_sachet", "relic_old_wooden_sword", "relic_black_paper_umbrella"])
    );
    expect(eventList.map((event) => event.id)).toEqual(
      expect.arrayContaining(["event_black_rain_ferry", "event_changban_echo", "event_palace_lantern_banquet"])
    );

    for (const event of eventList) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("maps playable characters and first chapter enemies to combat portrait assets", () => {
    const expectedIds = [
      "zhaoyun",
      "diaochan",
      "caiwenji",
      "zhugeliang",
      "enemy_ink_bandit",
      "enemy_faceless_soldier",
      "enemy_paper_umbrella",
      "elite_sword_echo",
      "elite_blood_banner",
      "boss_ink_dongzhuo",
      "enemy_bamboo_wraith",
      "enemy_broken_scholar",
      "enemy_bamboo_soldier",
      "elite_qin_score",
      "elite_bamboo_phalanx",
      "boss_qin_demon_echo",
      "elite_lubu_shadow",
      "boss_nameless_historian"
    ];

    for (const id of expectedIds) {
      expect(combatPortraitsById[id]).toBeDefined();
      expect(combatPortraitsById[id].assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expect(combatPortraitsById[id].standeePath).toMatch(/^\/assets\/generated\/.+\.png$/);
    }
  });

  it("keeps first chapter standees bound to vetted clean runtime assets", () => {
    expect(combatPortraitsById.enemy_ink_bandit.standeePath).toBe("/assets/generated/gpt2-ink-bandit-standee-cutout.png");
    expect(combatPortraitsById.enemy_faceless_soldier.standeePath).toBe("/assets/generated/gpt2-faceless-soldier-standee-cutout.png");
    expect(combatPortraitsById.enemy_paper_umbrella.standeePath).toBe("/assets/generated/gpt2-paper-umbrella-ghost-standee-cutout.png");
    expect(combatPortraitsById.elite_sword_echo.standeePath).toBe("/assets/generated/gpt2-bamboo-soldier-standee-cutout.png");
    expect(combatPortraitsById.elite_blood_banner.standeePath).toBe("/assets/generated/gpt2-scribe-officer-standee-cutout.png");
    expect(combatPortraitsById.boss_ink_dongzhuo.standeePath).toBe("/assets/generated/gpt2-ink-dongzhuo-boss-standee-cutout.png");
    expect(new Set([
      combatPortraitsById.enemy_ink_bandit.standeePath,
      combatPortraitsById.enemy_faceless_soldier.standeePath,
      combatPortraitsById.enemy_paper_umbrella.standeePath,
      combatPortraitsById.elite_sword_echo.standeePath,
      combatPortraitsById.elite_blood_banner.standeePath,
      combatPortraitsById.boss_ink_dongzhuo.standeePath
    ]).size).toBe(6);
    for (const id of ["enemy_ink_bandit", "enemy_faceless_soldier", "enemy_paper_umbrella", "elite_sword_echo", "elite_blood_banner", "boss_ink_dongzhuo"]) {
      expectAssetPathToExist(combatPortraitsById[id].standeePath ?? "");
    }
  });

  it("does not bind known annotated artifact outputs to runtime combat visuals", () => {
    const runtimePaths = [
      ...Object.values(combatPortraitsById).flatMap((portrait) => [portrait.assetPath, portrait.standeePath].filter((assetPath): assetPath is string => Boolean(assetPath))),
      ...Object.values(combatSpriteSheetsById).map((sheet) => sheet.assetPath)
    ];

    expect(runtimePaths.filter((assetPath) => annotatedArtifactPaths.has(assetPath))).toEqual([]);
  });

  it("binds generated standees to the correct playable character identities", () => {
    expect(combatPortraitsById.zhaoyun.assetPath).toBe("/assets/generated/zhaoyun-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.zhaoyun.standeePath).toBe("/assets/generated/zhaoyun-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.zhaoyun.alt).toContain("male");
    expect(combatPortraitsById.zhaoyun.alt).toContain("Zhao Yun");

    expect(combatPortraitsById.diaochan.assetPath).toBe("/assets/generated/diaochan-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.diaochan.standeePath).toBe("/assets/generated/diaochan-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.diaochan.alt).toContain("Diao Chan");
    expect(combatPortraitsById.diaochan.alt).not.toContain("Cai Wenji");
    expect(combatPortraitsById.diaochan.alt).not.toContain("guqin");

    expect(combatPortraitsById.caiwenji.assetPath).toBe("/assets/generated/gpt2-caiwenji-standee-cutout.png");
    expect(combatPortraitsById.caiwenji.standeePath).toBe("/assets/generated/gpt2-caiwenji-standee-cutout.png");
    expect(combatPortraitsById.caiwenji.alt).toContain("Cai Wenji");
    expect(combatPortraitsById.caiwenji.alt).toContain("guqin");

    expect(combatPortraitsById.zhugeliang.assetPath).toBe("/assets/generated/gpt2-zhugeliang-standee-cutout.png");
    expect(combatPortraitsById.zhugeliang.standeePath).toBe("/assets/generated/gpt2-zhugeliang-standee-cutout.png");
    expect(combatPortraitsById.zhugeliang.alt).toContain("Zhuge Liang");
    expect(combatPortraitsById.zhugeliang.alt).toContain("formation");
  });

  it("maps featured cards, battlefield, and attack sprite strips to art assets", () => {
    for (const cardId of ["zhao_strike", "zhao_qixing_spear", "diao_charm", "diao_closed_moon", "ink_luoshui_tide"]) {
      expect(cardArtById[cardId]).toBeDefined();
      expect(cardArtById[cardId].assetPath).toMatch(/^\/assets\/generated\/cards\/.+\.(png|svg)$/);
    }

    expect(battlefieldAssets.luoshui.assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
    expect(combatSpriteSheetsById.zhaoyun_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.zhaoyun_attack.assetPath).toBe("/assets/sprites/zhaoyun-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.diaochan_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.diaochan_attack.assetPath).toBe("/assets/sprites/diaochan-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.caiwenji_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.caiwenji_attack.assetPath).toBe("/assets/sprites/caiwenji-qin-attack-strip-gpt2.png");
    expect(combatSpriteSheetsById.zhugeliang_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.zhugeliang_attack.assetPath).toBe("/assets/sprites/zhugeliang-formation-strip-gpt2.png");
    expect(combatSpriteSheetsById.ink_bandit_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.ink_bandit_attack.assetPath).toBe("/assets/sprites/ink-bandit-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.paper_umbrella_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.paper_umbrella_attack.assetPath).toBe("/assets/sprites/paper-umbrella-attack-strip-gpt-v2.png");
  });

  it("binds first chapter stand-in enemies to semantic Wave 9 attack strips", () => {
    const genericSlashBindings = visuals.combatSpriteSheetList
      .filter((sheet) => sheet.assetPath === "/assets/sprites/enemy-slash-strip.svg")
      .map((sheet) => sheet.id);

    expect(genericSlashBindings).toEqual([]);
    expect(visuals.getCombatAttackSprite("elite_sword_echo")?.assetPath).toBe("/assets/sprites/wave9-sword-echo-attack-strip.svg");
    expect(visuals.getCombatAttackSprite("elite_blood_banner")?.assetPath).toBe("/assets/sprites/wave9-blood-banner-attack-strip.svg");
    expect(visuals.getCombatAttackSprite("boss_ink_dongzhuo")?.assetPath).toBe("/assets/sprites/wave9-ink-dongzhuo-boss-attack-strip.svg");
    for (const id of ["elite_sword_echo", "elite_blood_banner", "boss_ink_dongzhuo"]) {
      expect(visuals.getCombatAttackSprite(id)?.assetPath).not.toBe("/assets/sprites/enemy-slash-strip.svg");
    }
    expect(visuals.getCombatAttackSprite("enemy_paper_umbrella")?.assetPath).toBe("/assets/sprites/paper-umbrella-attack-strip-gpt-v2.png");
  });

  it("maps every chapter to a dedicated battlefield asset", () => {
    expect(Object.keys(battlefieldAssets).sort()).toEqual(chapterList.map((chapter) => chapter.id).sort());

    for (const chapter of chapterList) {
      const battlefield = battlefieldAssets[chapter.id];

      expect(battlefield).toBeDefined();
      expect(battlefield.id).toBe(chapter.id);
      expect(battlefield.assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expectAssetPathToExist(battlefield.assetPath);
    }
  });

  it("binds new archetype cards to dedicated ink-wash card art assets", () => {
    const dedicatedCardArtIds = [
      "zhao_seven_entries",
      "zhao_white_horse_breakout",
      "zhao_return_spear",
      "zhao_spear_wall",
      "zhao_break_spear",
      "zhao_river_guard",
      "cai_qingxin_song",
      "cai_hujia_beat",
      "cai_final_song",
      "zhuge_observe_stars",
      "zhuge_small_eight_array",
      "zhuge_borrow_wind",
      "diao_jinghong_strike",
      "diao_flying_sleeves",
      "diao_lijian",
      "diao_mirror_flower",
      "diao_lotus_blade"
    ];

    for (const cardId of dedicatedCardArtIds) {
      const card = cardsById[cardId];
      const art = cardArtById[cardId];

      expect(card).toBeDefined();
      expect(art).toBeDefined();
      expect(art.assetPath).toMatch(/^\/assets\/generated\/cards\/.+\.png$/);
      expect(art.assetPath).not.toBe(cardArtById[`type_${card.types[0]}`]?.assetPath);
      expectAssetPathToExist(art.assetPath);
    }
  });

  it("binds semantic starter card art away from shared type fallbacks", () => {
    const starterArtIds = [
      "zhao_strike",
      "zhao_guard",
      "zhao_longdan",
      "diao_strike",
      "diao_guard",
      "diao_lingbo",
      "cai_plain_strike",
      "cai_pluck_string",
      "cai_gong_tone",
      "zhuge_fan_strike",
      "zhuge_guard"
    ];

    for (const id of starterArtIds) {
      expect(cardArtById[id]?.assetPath).toMatch(/^\/assets\/generated\/cards\/gpt2-wave21-.+\.png$/);
      expect(cardArtById[id]?.assetPath).not.toBe(cardArtById.type_attack.assetPath);
      expect(cardArtById[id]?.assetPath).not.toBe(cardArtById.type_skill.assetPath);
      expectAssetPathToExist(cardArtById[id]?.assetPath);
    }
  });

  it("binds every historic card fallback target to semantic art", () => {
    const wave10FallbackTargets = [
      "common_duanzhu",
      "common_feishi",
      "common_gedang",
      "common_mirror_armor",
      "common_pifeng",
      "common_qingshen",
      "common_tuna",
      "common_xieli",
      "common_zhuiying",
      "ink_heiyu",
      "ink_modian",
      "ink_moren",
      "mind_jingxin",
      "mind_luanxin",
      "mind_nuzhan",
      "status_rain_chill",
      "zhao_guardian",
      "zhao_qixing_spear",
      "zhao_single_rider",
      "zhao_stable_formation",
      "zhao_sweep",
      "zhao_thrust",
      "zhao_white_dragon",
      "diao_falling_fan",
      "diao_glance",
      "diao_hongyan",
      "diao_red_ribbon",
      "diao_sleeve_blade",
      "diao_step_lotus",
      "cai_broken_string",
      "cai_clean_string",
      "cai_clear_tone",
      "cai_echoing_melody",
      "cai_five_tones_start",
      "cai_listen_still",
      "cai_shang_tone",
      "cai_soul_ferry",
      "zhuge_deduction",
      "zhuge_empty_city",
      "zhuge_fire_array",
      "zhuge_plan_set",
      "zhuge_starfall",
      "zhuge_stone_array",
      "zhuge_straw_boats",
      "zhuge_wind_array"
    ];

    expect(new Set(wave10FallbackTargets).size).toBe(45);

    const wave21UpgradedTargets = new Set([
      "common_duanzhu",
      "common_feishi",
      "common_gedang",
      "common_mirror_armor",
      "common_pifeng",
      "common_qingshen",
      "common_tuna",
      "common_xieli",
      "common_zhuiying"
    ]);

    for (const id of wave10FallbackTargets) {
      const card = cardsById[id];
      const art = cardArtById[id];
      const fallbackArt = cardArtById[`type_${card.types[0]}`];
      const expectedBatch = wave21UpgradedTargets.has(id)
        ? /^\/assets\/generated\/cards\/gpt2-wave21-.+\.png$/
        : /^\/assets\/generated\/cards\/wave10-.+\.svg$/;

      expect(card).toBeDefined();
      expect(art, id).toBeDefined();
      expect(art.assetPath, id).toMatch(expectedBatch);
      expect(art.assetPath, id).not.toBe(fallbackArt?.assetPath);
      expectAssetPathToExist(art.assetPath);
    }
  });

  it("uses GPT Image 2 card art for the currently visible priority card faces", () => {
    const priorityCards = {
      zhao_river_guard: "/assets/generated/cards/gpt2-zhao-river-guard.png",
      diao_jinghong_strike: "/assets/generated/cards/gpt2-diao-jinghong-strike.png",
      common_jiexue: "/assets/generated/cards/gpt2-common-jiexue.png",
      common_xixin: "/assets/generated/cards/gpt2-common-xixin.png",
      zhao_seven_entries: "/assets/generated/cards/gpt2-zhao-seven-entries.png",
      zhao_break_spear: "/assets/generated/cards/gpt2-zhao-break-spear.png",
      zhao_return_spear: "/assets/generated/cards/gpt2-zhao-return-spear.png",
      zhao_spear_wall: "/assets/generated/cards/gpt2-zhao-spear-wall.png",
      zhao_white_horse_breakout: "/assets/generated/cards/gpt2-zhao-white-horse-breakout.png",
      diao_flying_sleeves: "/assets/generated/cards/gpt2-diao-flying-sleeves.png",
      diao_lijian: "/assets/generated/cards/gpt2-diao-lijian.png",
      diao_lotus_blade: "/assets/generated/cards/gpt2-diao-lotus-blade.png",
      diao_mirror_flower: "/assets/generated/cards/gpt2-diao-mirror-flower.png",
      cai_qingxin_song: "/assets/generated/cards/gpt2-cai-qingxin-song.png",
      cai_hujia_beat: "/assets/generated/cards/gpt2-cai-hujia-beat.png",
      cai_final_song: "/assets/generated/cards/gpt2-cai-final-song.png",
      zhuge_observe_stars: "/assets/generated/cards/gpt2-zhuge-observe-stars.png",
      zhuge_small_eight_array: "/assets/generated/cards/gpt2-zhuge-eight-array.png",
      zhuge_borrow_wind: "/assets/generated/cards/gpt2-zhuge-borrow-wind.png",
      status_redacted_history: "/assets/generated/cards/gpt2-status-redacted-history.png"
    };

    for (const [cardId, assetPath] of Object.entries(priorityCards)) {
      expect(cardArtById[cardId]?.assetPath).toBe(assetPath);
      expect(cardArtById[cardId]?.assetPath).not.toBe(cardArtById[`type_${cardsById[cardId].types[0]}`]?.assetPath);
      expectAssetPathToExist(assetPath);
    }
  });

  it("uses GPT Image 2 assets for the next priority chapter battlefields and enemies", () => {
    const priorityBattlefields = {
      bamboo: "/assets/generated/gpt2-bamboo-battlefield.png",
      changan: "/assets/generated/gpt2-changan-battlefield.png",
      moyuan: "/assets/generated/gpt2-moyuan-battlefield.png"
    };

    for (const [battlefieldId, assetPath] of Object.entries(priorityBattlefields)) {
      expect(battlefieldAssets[battlefieldId]?.assetPath).toBe(assetPath);
      expectAssetPathToExist(assetPath);
    }

    const priorityStandees = {
      enemy_bamboo_wraith: "/assets/generated/gpt2-bamboo-wraith-standee-cutout.png",
      enemy_broken_scholar: "/assets/generated/gpt2-broken-scholar-standee-cutout.png",
      enemy_bamboo_soldier: "/assets/generated/gpt2-bamboo-soldier-standee-cutout.png",
      elite_qin_score: "/assets/generated/gpt2-qin-score-standee-cutout.png",
      elite_bamboo_phalanx: "/assets/generated/gpt2-bamboo-phalanx-standee-cutout.png",
      boss_qin_demon_echo: "/assets/generated/gpt2-qin-demon-standee-cutout.png",
      enemy_history_scribe: "/assets/generated/gpt2-history-scribe-standee-cutout.png",
      elite_lubu_shadow: "/assets/generated/gpt2-lubu-shadow-standee-cutout.png",
      boss_scribe_officer: "/assets/generated/gpt2-scribe-officer-standee-cutout.png",
      boss_nameless_historian: "/assets/generated/gpt2-nameless-historian-standee-cutout.png"
    };

    for (const [enemyId, assetPath] of Object.entries(priorityStandees)) {
      expect(combatPortraitsById[enemyId]?.standeePath).toBe(assetPath);
      expect(combatPortraitsById[enemyId]?.assetPath).toBe(assetPath);
      expectAssetPathToExist(assetPath);
    }
  });

  it("tracks remaining non-final ink-pass art debt by semantic asset id", () => {
    const semanticDebt = collectInkPassDebt();
    expect(semanticDebt).toEqual([]);

    const ledgerPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/assets/generated/asset-audit.json");
    expect(existsSync(ledgerPath)).toBe(true);

    const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as {
      missing: unknown[];
      inkPassDebt: Array<{ kind: string; id: string }>;
      gpt2Runtime: unknown[];
      sourceSheets: unknown[];
    };

    expect(ledger.missing).toEqual([]);
    expect(ledger.inkPassDebt).toEqual(semanticDebt);
    expect(ledger.gpt2Runtime.length).toBeGreaterThan(0);
    expect(ledger.sourceSheets.length).toBeGreaterThan(0);
  });

  it("keeps card art fallback debt at zero after Wave 10 semantic assets", () => {
    const expectedFallbackDebt = collectCardFallbackDebt();
    expect(expectedFallbackDebt).toEqual({
      totalCount: 0,
      byCharacter: [],
      byType: [],
      byRarity: [],
      cards: []
    });

    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const ledger = JSON.parse(readFileSync(join(projectRoot, "public/assets/generated/asset-audit.json"), "utf8")) as {
      summary: {
        missingCount: number;
        cardFallbackDebtCount?: number;
      };
      missing: unknown[];
      cardFallbackDebt?: {
        totalCount: number;
        byCharacter: Array<{ character: string; count: number }>;
        byType: Array<{ type: string; count: number }>;
        byRarity: Array<{ rarity: string; count: number }>;
        cards: Array<{
          id: string;
          name: string;
          character: string;
          type: string;
          rarity: string;
          fallbackArtId: string;
          fallbackAssetPath: string;
          reason: "missing-card-art-id" | "shared-type-asset";
        }>;
      };
    };

    expect(ledger.missing).toEqual([]);
    expect(ledger.summary.missingCount).toBe(0);
    expect(ledger.summary.cardFallbackDebtCount).toBe(0);
    expect(ledger.cardFallbackDebt).toEqual(expectedFallbackDebt);
  });

  it("ships a GPT Image 2 priority prompt queue for art debt replacement", () => {
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const queuePath = join(projectRoot, "public/assets/generated/gpt2-prompt-queue.json");
    expect(existsSync(queuePath)).toBe(true);

    const audit = JSON.parse(readFileSync(join(projectRoot, "public/assets/generated/asset-audit.json"), "utf8")) as {
      inkPassDebt: Array<{ kind: string; id: string; paths: string[] }>;
      promptQueue?: {
        assetPath: string;
        targetCount: number;
        categories: Record<string, number>;
      };
    };
    const queue = JSON.parse(readFileSync(queuePath, "utf8")) as {
      schemaVersion: number;
      generatedBy: string;
      baselineInkPassDebt: Array<{ kind: string; id: string; paths: string[] }>;
      targets: Array<{
        id: string;
        priority: number;
        category: string;
        type: string;
        semanticId: string;
        destinationPath: string;
        sourcePrompt: string;
        negativePrompt: string;
        cropAlphaSequenceInstructions: string;
        verificationCommand: string;
      }>;
    };

    expect(queue.schemaVersion).toBe(1);
    expect(queue.generatedBy).toBe("Wave 3C art debt prep");
    expect(queue.baselineInkPassDebt).toHaveLength(20);
    expect(audit.inkPassDebt.length).toBeLessThan(queue.baselineInkPassDebt.length);
    expect(audit.promptQueue).toMatchObject({
      assetPath: "/assets/generated/gpt2-prompt-queue.json",
      targetCount: queue.targets.length
    });

    const targetIds = queue.targets.map((target) => target.id);
    expect(new Set(targetIds).size).toBe(targetIds.length);

    const requiredCategories = ["Cai Wenji", "Zhuge Liang", "final boss", "final battlefield", "card-face"];
    for (const category of requiredCategories) {
      expect(queue.targets.some((target) => target.category === category)).toBe(true);
      expect(audit.promptQueue?.categories[category]).toBeGreaterThan(0);
    }

    for (const target of queue.targets) {
      expect(target.type).toMatch(/^(standee|combat-sprite-strip|card-face|battlefield)$/);
      expect(target.semanticId.length).toBeGreaterThan(0);
      expect(target.destinationPath).toMatch(/^\/assets\/(generated|sprites)\//);
      expect(target.destinationPath).toMatch(/\.(png|webp)$/);
      if (target.type === "card-face") {
        expect(target.destinationPath).toMatch(/^\/assets\/generated\/cards\//);
      }
      if (target.type === "combat-sprite-strip") {
        expect(target.destinationPath).toMatch(/^\/assets\/sprites\//);
      }
      expect(target.sourcePrompt.length).toBeGreaterThan(80);
      expect(target.negativePrompt.length).toBeGreaterThan(20);
      expect(target.cropAlphaSequenceInstructions.length).toBeGreaterThan(40);
      expect(target.verificationCommand).toContain("node scripts/audit-generated-assets.mjs");
      expect(target.verificationCommand).toContain("npm test -- tests/data/content.test.ts");
    }
  });

  it("declares signature card VFX cues for key role-defining martial arts", () => {
    const signatureVfxByCue = (
      visuals as typeof visuals & {
        signatureVfxByCue?: Record<string, { cardId: string; className: string; testId: string; assetPath: string }>;
      }
    ).signatureVfxByCue;

    expect(signatureVfxByCue).toBeDefined();
    expect(cardsById.zhao_seven_entries).toMatchObject({ visualCue: "zhao-seven-entries" });
    expect(cardsById.zhao_spear_wall).toMatchObject({ visualCue: "zhao-spear-wall" });
    expect(cardsById.diao_jinghong_strike).toMatchObject({ visualCue: "diao-jinghong-strike" });
    expect(cardsById.diao_lijian).toMatchObject({ visualCue: "diao-lijian" });

    for (const [cueId, cardId] of Object.entries({
      "zhao-seven-entries": "zhao_seven_entries",
      "zhao-spear-wall": "zhao_spear_wall",
      "diao-jinghong-strike": "diao_jinghong_strike",
      "diao-lijian": "diao_lijian"
    })) {
      const vfx = signatureVfxByCue?.[cueId];

      expect(vfx).toMatchObject({
        cardId,
        className: expect.stringMatching(/^combat-vfx-/),
        testId: expect.stringMatching(/^combat-vfx-signature-/)
      });
      expect(vfx?.assetPath).toMatch(/^\/assets\/generated\/vfx\/.+\.png$/);
      expectAssetPathToExist(vfx?.assetPath ?? "");
    }
  });

  it("defines glossary entries for shipped statuses, card types, resources, combos, and enemy intent surfaces", () => {
    expect(glossaryEntries.length).toBeGreaterThan(0);
    expect(new Set(glossaryEntries.map((entry) => entry.id)).size).toBe(glossaryEntries.length);

    const shippedStatusIds: StatusId[] = ["charm", "weak", "vulnerable", "dodge", "guard", "ink"];
    const shippedCardTypeIds = [...new Set(cardList.flatMap((card) => card.types))].sort();
    const shippedResourceIds = [
      ...new Set([
        "energy",
        "hp",
        "block",
        "inkMarks",
        "drawPile",
        "discardPile",
        "exhaustPile",
        ...characterList.map((character) => character.resource.id)
      ])
    ].sort();
    const shippedComboIds = [...defaultComboRules, exhaustAttackComboRule].map((combo) => combo.id).sort();

    const missingIds = [
      ...shippedStatusIds.map((status) => `status.${status}`),
      ...shippedCardTypeIds.map((type) => `cardType.${type}`),
      ...shippedResourceIds.map((resource) => `resource.${resource}`),
      ...shippedComboIds.map((combo) => `combo.${combo}`)
    ].filter((id) => !getGlossaryEntry(id));

    expect(missingIds).toEqual([]);

    const intentLabels = collectEnemyIntentLabels();
    const missingIntentLabels = intentLabels.filter((label) => !getGlossaryEntryByLabel("intent", label));

    expect(missingIntentLabels).toEqual([]);
  });

  it("resolves every shipped card keyword chip surface to glossary metadata", () => {
    const missing = cardList.flatMap((card) =>
      getCardGlossarySurfaces(card)
        .filter((surface) => !surface.entry)
        .map((surface) => `${card.id}:${surface.label}`)
    );

    expect(missing).toEqual([]);
    expect(getCardGlossarySurfaces(cardsById.common_jiexue).map((surface) => surface.label)).toEqual(expect.arrayContaining(["技法", "净化", "护甲"]));
    expect(getCardGlossarySurfaces(cardsById.diao_charm).map((surface) => surface.label)).toEqual(expect.arrayContaining(["技法", "魅惑", "蓄势"]));
    expect(getCardGlossarySurfaces(cardsById.zhuge_observe_stars).map((surface) => surface.label)).toContain("观星");
  });
});

function getArchetypeCardIds(archetypeId: string): string[] {
  return cardList
    .filter((card) => ((card as { archetypes?: string[] }).archetypes ?? []).includes(archetypeId))
    .map((card) => card.id);
}

function countBy<T>(items: readonly T[], getKey: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function expectAssetPathToExist(assetPath: string): void {
  const absolute = join(dirname(fileURLToPath(import.meta.url)), "../../public", assetPath.replace(/^\//, ""));
  expect(existsSync(absolute)).toBe(true);
}

function getPeakIntentDamage(enemy: (typeof enemyList)[number]): number {
  return Math.max(0, ...enemy.intents.map((intent) => {
    if (intent.type === "attack") {
      return intent.damage * intent.hits;
    }

    if (intent.type === "special") {
      return intent.effects
        .filter((effect): effect is { action: "damage"; amount: number; hits?: number } => effect.action === "damage")
        .reduce((total, effect) => total + effect.amount * (effect.hits ?? 1), 0);
    }

    return 0;
  }));
}

function intentAddsStatusCard(intent: (typeof enemyList)[number]["intents"][number]): boolean {
  return intent.type === "special" && intent.effects.some((effect) => effect.action === "addCardToDiscard");
}

function collectEnemyIntentLabels(): string[] {
  const labels = new Set<string>();
  const collect = (intent: EnemyIntent) => {
    if (intent.type === "attack") {
      labels.add("杀意");
    } else if (intent.type === "block") {
      labels.add("运功");
    } else if (intent.type === "special") {
      labels.add(intent.name);
    } else {
      labels.add("观望");
    }
  };

  for (const enemy of enemyList) {
    enemy.intents.forEach(collect);
    enemy.phaseIntents?.forEach((phase) => phase.intents.forEach(collect));
  }

  return [...labels].sort();
}

function collectInkPassDebt(): Array<{ kind: string; id: string; paths: string[] }> {
  return [
    ...Object.values(combatPortraitsById)
      .map((portrait) => ({
        kind: "combatPortrait",
        id: portrait.id,
        paths: [...new Set([portrait.assetPath, portrait.standeePath ?? ""].filter((assetPath) => assetPath.includes("ink-pass")))].sort()
      })),
    ...Object.values(cardArtById)
      .map((art) => ({
        kind: "cardArt",
        id: art.id,
        paths: art.assetPath.includes("ink-pass") ? [art.assetPath] : []
      })),
    ...Object.values(combatSpriteSheetsById)
      .map((sheet) => ({
        kind: "combatSpriteSheet",
        id: sheet.id,
        paths: sheet.assetPath.includes("ink-pass") ? [sheet.assetPath] : []
      })),
    ...Object.values(battlefieldAssets)
      .map((asset) => ({
        kind: "battlefield",
        id: asset.id,
        paths: asset.assetPath.includes("ink-pass") ? [asset.assetPath] : []
      }))
  ]
    .filter((entry) => entry.paths.length > 0)
    .sort((left, right) => `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`));
}

function collectCardFallbackDebt(): {
  totalCount: number;
  byCharacter: Array<{ character: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  byRarity: Array<{ rarity: string; count: number }>;
  cards: Array<{
    id: string;
    name: string;
    character: string;
    type: string;
    rarity: string;
    fallbackArtId: string;
    fallbackAssetPath: string;
    reason: "missing-card-art-id" | "shared-type-asset";
  }>;
} {
  const cards = cardList
    .map((card) => {
      const primaryType = card.types[0] ?? "unknown";
      const fallbackArtId = `type_${primaryType}`;
      const directArt = cardArtById[card.id];
      const fallbackArt = cardArtById[fallbackArtId];
      const usesTypeFallback = !directArt;
      const usesSharedTypeAsset = Boolean(directArt && fallbackArt && directArt.assetPath === fallbackArt.assetPath);

      if (!usesTypeFallback && !usesSharedTypeAsset) {
        return null;
      }

      return {
        id: card.id,
        name: card.name,
        character: card.character ?? "common",
        type: primaryType,
        rarity: card.rarity,
        fallbackArtId,
        fallbackAssetPath: fallbackArt?.assetPath ?? "",
        reason: usesTypeFallback ? "missing-card-art-id" as const : "shared-type-asset" as const
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    totalCount: cards.length,
    byCharacter: summarizeCardFallbackDebt(cards, "character"),
    byType: summarizeCardFallbackDebt(cards, "type"),
    byRarity: summarizeCardFallbackDebt(cards, "rarity"),
    cards
  };
}

function summarizeCardFallbackDebt<T extends "character" | "type" | "rarity">(
  cards: Array<Record<T, string>>,
  key: T
): Array<Record<T, string> & { count: number }> {
  const counts = new Map<string, number>();

  for (const card of cards) {
    counts.set(card[key], (counts.get(card[key]) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ [key]: value, count }) as Record<T, string> & { count: number })
    .sort((left, right) => left[key].localeCompare(right[key]));
}
