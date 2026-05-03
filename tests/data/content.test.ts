import { cardList, cardsById } from "../../src/game/content/cards";
import { chapterList } from "../../src/game/content/chapters";
import { characterList } from "../../src/game/content/characters";
import { enemyList } from "../../src/game/content/enemies";
import { eventList } from "../../src/game/content/events";
import { relicList } from "../../src/game/content/relics";
import * as visuals from "../../src/game/content/visuals";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { battlefieldAssets, cardArtById, combatPortraitsById, combatSpriteSheetsById } = visuals;

const supportedActions = new Set([
  "damage",
  "block",
  "draw",
  "gainResource",
  "applyStatus",
  "gainInk",
  "cleanseCards",
  "queueEcho",
  "setMind"
]);

describe("content data", () => {
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
    expect(characterList.map((character) => character.id)).toEqual(["zhaoyun", "diaochan", "caiwenji"]);

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
    expect(enemyList.find((enemy) => enemy.id === "boss_qin_demon_echo")?.maxHp).toBe(168);

    expect(chapterThreeNormal.every((enemy) => enemy.maxHp >= 48 && enemy.maxHp <= 54)).toBe(true);
    expect(chapterThreeNormal.every((enemy) => getPeakIntentDamage(enemy) <= 15)).toBe(true);
    expect(chapterThreeNormal.every((enemy) => enemy.intents.some(intentAddsStatusCard))).toBe(true);

    expect(chapterThreeElite.every((enemy) => enemy.maxHp >= 124 && enemy.maxHp <= 132)).toBe(true);
    expect(enemyList.find((enemy) => enemy.id === "boss_scribe_officer")?.maxHp).toBe(196);
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
      "enemy_ink_bandit",
      "enemy_faceless_soldier",
      "enemy_paper_umbrella",
      "elite_sword_echo",
      "elite_blood_banner",
      "boss_ink_dongzhuo",
      "enemy_bamboo_wraith",
      "enemy_broken_scholar",
      "elite_qin_score",
      "boss_qin_demon_echo"
    ];

    for (const id of expectedIds) {
      expect(combatPortraitsById[id]).toBeDefined();
      expect(combatPortraitsById[id].assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expect(combatPortraitsById[id].standeePath).toMatch(/^\/assets\/generated\/.+\.png$/);
    }
  });

  it("gives the paper umbrella, sword echo, blood banner, and Dong Zhuo distinct standees", () => {
    expect(combatPortraitsById.enemy_ink_bandit.standeePath).toBe("/assets/generated/gpt2-ink-bandit-standee-cutout.png");
    expect(combatPortraitsById.enemy_faceless_soldier.standeePath).toBe("/assets/generated/gpt2-faceless-soldier-standee-cutout.png");
    expect(combatPortraitsById.enemy_paper_umbrella.standeePath).toBe("/assets/generated/gpt2-paper-umbrella-ghost-standee-cutout.png");
    expect(combatPortraitsById.elite_sword_echo.standeePath).toBe("/assets/generated/sword-echo-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.elite_blood_banner.standeePath).toBe("/assets/generated/blood-banner-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.boss_ink_dongzhuo.standeePath).toBe("/assets/generated/gpt2-ink-dongzhuo-boss-standee-cutout.png");
    expect(new Set([
      combatPortraitsById.enemy_ink_bandit.standeePath,
      combatPortraitsById.enemy_faceless_soldier.standeePath,
      combatPortraitsById.enemy_paper_umbrella.standeePath
    ]).size).toBe(3);
    for (const id of ["enemy_ink_bandit", "enemy_faceless_soldier", "enemy_paper_umbrella", "boss_ink_dongzhuo"]) {
      expectAssetPathToExist(combatPortraitsById[id].standeePath ?? "");
    }
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
  });

  it("maps featured cards, battlefield, and attack sprite strips to art assets", () => {
    for (const cardId of ["zhao_strike", "zhao_qixing_spear", "diao_charm", "diao_closed_moon", "ink_luoshui_tide"]) {
      expect(cardArtById[cardId]).toBeDefined();
      expect(cardArtById[cardId].assetPath).toMatch(/^\/assets\/generated\/cards\/.+\.png$/);
    }

    expect(battlefieldAssets.luoshui.assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
    expect(combatSpriteSheetsById.zhaoyun_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.zhaoyun_attack.assetPath).toBe("/assets/sprites/zhaoyun-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.diaochan_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.diaochan_attack.assetPath).toBe("/assets/sprites/diaochan-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.ink_bandit_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.ink_bandit_attack.assetPath).toBe("/assets/sprites/ink-bandit-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.paper_umbrella_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.paper_umbrella_attack.assetPath).toBe("/assets/sprites/paper-umbrella-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.sword_echo_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.sword_echo_attack.assetPath).toBe("/assets/sprites/sword-echo-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.blood_banner_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.blood_banner_attack.assetPath).toBe("/assets/sprites/blood-banner-attack-strip-gpt-v2.png");
    expect(combatSpriteSheetsById.ink_dongzhuo_boss_attack.frameCount).toBeGreaterThanOrEqual(4);
    expect(combatSpriteSheetsById.ink_dongzhuo_boss_attack.assetPath).toBe("/assets/sprites/ink-dongzhuo-boss-attack-strip-gpt-v2.png");
  });

  it("binds new archetype cards to dedicated ink-wash card art assets", () => {
    const dedicatedCardArtIds = [
      "zhao_seven_entries",
      "zhao_white_horse_breakout",
      "zhao_return_spear",
      "zhao_spear_wall",
      "zhao_break_spear",
      "zhao_river_guard",
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

  it("uses GPT Image 2 card art for the currently visible priority card faces", () => {
    const priorityCards = {
      zhao_river_guard: "/assets/generated/cards/gpt2-zhao-river-guard.png",
      diao_jinghong_strike: "/assets/generated/cards/gpt2-diao-jinghong-strike.png",
      common_jiexue: "/assets/generated/cards/gpt2-common-jiexue.png",
      common_xixin: "/assets/generated/cards/gpt2-common-xixin.png",
      zhao_seven_entries: "/assets/generated/cards/gpt2-zhao-seven-entries.png",
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
      changan: "/assets/generated/gpt2-changan-battlefield.png"
    };

    for (const [battlefieldId, assetPath] of Object.entries(priorityBattlefields)) {
      expect(battlefieldAssets[battlefieldId]?.assetPath).toBe(assetPath);
      expectAssetPathToExist(assetPath);
    }

    const priorityStandees = {
      enemy_bamboo_wraith: "/assets/generated/gpt2-bamboo-wraith-standee-cutout.png",
      enemy_broken_scholar: "/assets/generated/gpt2-broken-scholar-standee-cutout.png",
      boss_qin_demon_echo: "/assets/generated/gpt2-qin-demon-standee-cutout.png",
      enemy_history_scribe: "/assets/generated/gpt2-history-scribe-standee-cutout.png",
      boss_scribe_officer: "/assets/generated/gpt2-scribe-officer-standee-cutout.png"
    };

    for (const [enemyId, assetPath] of Object.entries(priorityStandees)) {
      expect(combatPortraitsById[enemyId]?.standeePath).toBe(assetPath);
      expect(combatPortraitsById[enemyId]?.assetPath).toBe(assetPath);
      expectAssetPathToExist(assetPath);
    }
  });

  it("tracks remaining non-final ink-pass art debt by semantic asset id", () => {
    const allowedInkPassDebt = new Set([
      "cardArt:diao_flying_sleeves",
      "cardArt:diao_lijian",
      "cardArt:diao_lotus_blade",
      "cardArt:diao_mirror_flower",
      "cardArt:status_canyin",
      "cardArt:status_zayin",
      "cardArt:zhao_break_spear",
      "cardArt:zhao_return_spear",
      "cardArt:zhao_spear_wall",
      "cardArt:zhao_white_horse_breakout",
      "combatPortrait:elite_bamboo_phalanx",
      "combatPortrait:elite_lubu_shadow",
      "combatPortrait:elite_qin_score",
      "combatPortrait:enemy_bamboo_soldier",
      "combatSpriteSheet:bamboo_soldier_attack",
      "combatSpriteSheet:bamboo_wraith_attack",
      "combatSpriteSheet:broken_scholar_attack",
      "combatSpriteSheet:history_scribe_attack",
      "combatSpriteSheet:qin_demon_attack",
      "combatSpriteSheet:scribe_officer_attack"
    ]);
    const semanticDebt = collectInkPassDebt();

    for (const debtId of semanticDebt.map((entry) => `${entry.kind}:${entry.id}`)) {
      expect(allowedInkPassDebt.has(debtId)).toBe(true);
    }
    expect(semanticDebt.length).toBeLessThanOrEqual(allowedInkPassDebt.size);

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
});

function getArchetypeCardIds(archetypeId: string): string[] {
  return cardList
    .filter((card) => ((card as { archetypes?: string[] }).archetypes ?? []).includes(archetypeId))
    .map((card) => card.id);
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
