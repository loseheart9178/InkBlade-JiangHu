import { cardList, cardsById } from "../../src/game/content/cards";
import { characterList } from "../../src/game/content/characters";
import { enemyList } from "../../src/game/content/enemies";
import { eventList } from "../../src/game/content/events";
import { relicList } from "../../src/game/content/relics";
import * as visuals from "../../src/game/content/visuals";
import { existsSync } from "node:fs";
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
    expect(characterList.map((character) => character.id)).toEqual(["zhaoyun", "diaochan"]);

    for (const character of characterList) {
      expect(character.starterDeck).toHaveLength(10);
      for (const cardId of character.starterDeck) {
        expect(cardsById[cardId]).toBeDefined();
      }
    }
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
      "boss_ink_dongzhuo"
    ];

    for (const id of expectedIds) {
      expect(combatPortraitsById[id]).toBeDefined();
      expect(combatPortraitsById[id].assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expect(combatPortraitsById[id].standeePath).toMatch(/^\/assets\/generated\/.+\.png$/);
    }
  });

  it("gives the paper umbrella, sword echo, blood banner, and Dong Zhuo distinct standees", () => {
    expect(combatPortraitsById.enemy_paper_umbrella.standeePath).toBe("/assets/generated/paper-umbrella-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.elite_sword_echo.standeePath).toBe("/assets/generated/sword-echo-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.elite_blood_banner.standeePath).toBe("/assets/generated/blood-banner-standee-gpt-v2-cutout.png");
    expect(combatPortraitsById.boss_ink_dongzhuo.standeePath).toBe("/assets/generated/ink-dongzhuo-boss-standee-gpt-v2-cutout.png");
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
