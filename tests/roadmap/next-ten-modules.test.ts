import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cardList, cardsById } from "../../src/game/content/cards";
import { chapterList, chaptersById } from "../../src/game/content/chapters";
import { enemiesById, enemyList } from "../../src/game/content/enemies";
import { eventList } from "../../src/game/content/events";
import { methodsById } from "../../src/game/content/methods";
import { relicsById } from "../../src/game/content/relics";
import { battlefieldAssets, cardArtById, combatPortraitsById, combatSpriteSheetsById } from "../../src/game/content/visuals";
import { charactersById } from "../../src/game/content/characters";
import { createCombat, endPlayerTurn, playCard } from "../../src/game/systems/combat/combat";
import { createAdvancedRewardDraft } from "../../src/game/systems/rewards/advancedRewards";
import { createDebugRun } from "../../src/game/systems/debug/debugRun";
import {
  getUnlockedLogbookEntries,
  recordLogbookBoss,
  recordLogbookEvent
} from "../../src/game/systems/logbook/logbook";
import {
  advanceToNextChapter,
  claimMethodUpgrade,
  createCardRewardDraft,
  createRun
} from "../../src/game/systems/run/run";

describe("next ten module content contracts", () => {
  it("extends campaign progression through the Chang'an ink city shell", () => {
    expect(chapterList.map((chapter) => chapter.id)).toEqual(expect.arrayContaining(["luoshui", "bamboo", "changan"]));
    expect(chaptersById.bamboo.nextChapterId).toBe("changan");
    expect(chaptersById.changan).toMatchObject({
      name: "长安墨城",
      bossEnemyId: "boss_scribe_officer"
    });

    const run = createRun("zhaoyun", { mapSeed: 11 });
    expect(advanceToNextChapter(run)).toBe(true);
    expect(advanceToNextChapter(run)).toBe(true);

    expect(run.chapterId).toBe("changan");
    expect(run.completedChapterIds).toEqual(["luoshui", "bamboo"]);
    expect(run.mapNodes.find((node) => node.id === "boss")?.enemyId).toBe("boss_scribe_officer");
    expect(run.mapNodes.map((node) => node.eventId).filter(Boolean)).toEqual(
      expect.arrayContaining(["event_nameless_market", "event_rewritten_history_street"])
    );
  });

  it("registers second and third chapter enemies, events, and dedicated visual assets", () => {
    expect(enemyList.filter((enemy) => enemy.chapter === "bamboo").length).toBeGreaterThanOrEqual(6);
    expect(enemyList.filter((enemy) => enemy.chapter === "changan").length).toBeGreaterThanOrEqual(5);
    expect(enemiesById.boss_qin_demon_echo.name).toBe("琴魔·残音");
    expect(enemiesById.boss_scribe_officer.name).toBe("墨书执笔官");

    expect(eventList.map((event) => event.id)).toEqual(
      expect.arrayContaining([
        "event_broken_string_elder",
        "event_wordless_bamboo_scroll",
        "event_nameless_market",
        "event_rewritten_history_street",
        "event_unfinished_chessboard"
      ])
    );

    for (const key of ["bamboo", "changan"]) {
      const asset = battlefieldAssets[key as keyof typeof battlefieldAssets];
      expect(asset?.assetPath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expectAssetPathToExist(asset?.assetPath ?? "");
    }

    for (const id of [
      "boss_qin_demon_echo",
      "boss_scribe_officer",
      "enemy_bamboo_wraith",
      "enemy_history_scribe",
      "elite_memory_stela"
    ]) {
      expect(combatPortraitsById[id]?.standeePath).toMatch(/^\/assets\/generated\/.+\.png$/);
      expectAssetPathToExist(combatPortraitsById[id]?.standeePath ?? "");
    }

    for (const id of ["qin_demon_attack", "bamboo_wraith_attack", "scribe_officer_attack", "history_scribe_attack"]) {
      expect(combatSpriteSheetsById[id]?.frameCount).toBeGreaterThanOrEqual(4);
      expectAssetPathToExist(combatSpriteSheetsById[id]?.assetPath ?? "");
    }
  });

  it("adds cleanse cards, status counterplay art, and advanced relic hooks", () => {
    expect(cardsById.common_jiexue).toMatchObject({
      name: "解穴",
      target: "self",
      rarity: "common"
    });
    expect(cardsById.common_jiexue.effects).toEqual(expect.arrayContaining([expect.objectContaining({ action: "cleanseCards" })]));
    expect(cardsById.common_xixin.effects).toEqual(expect.arrayContaining([expect.objectContaining({ action: "cleanseCards" })]));
    expect(cardList.filter((card) => card.effects.some((effect) => effect.action === "cleanseCards")).length).toBeGreaterThanOrEqual(2);

    for (const cardId of ["common_jiexue", "common_xixin", "status_zayin", "status_canyin"]) {
      expect(cardArtById[cardId]?.assetPath).toMatch(/^\/assets\/generated\/cards\/.+\.png$/);
      expectAssetPathToExist(cardArtById[cardId]?.assetPath ?? "");
    }

    expect(relicsById.relic_qingyin_jade).toMatchObject({
      rarity: "rare",
      sources: expect.arrayContaining(["boss"])
    });
    expect(relicsById.relic_broken_string).toMatchObject({
      rarity: "uncommon",
      sources: expect.arrayContaining(["elite"])
    });
  });
});

describe("next ten module combat and growth contracts", () => {
  it("lets cleanse cards remove status-card pollution before Qin Demon can snowball", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["common_jiexue", "status_zayin", "status_rain_chill", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.boss_qin_demon_echo],
      rngSeed: 31,
      shuffleDeck: false
    });

    const qinBlockAfterDraw = state.enemies[0].block;
    const cleanse = state.piles.hand.find((card) => card.definitionId === "common_jiexue");
    const result = playCard(state, cleanse?.instanceId ?? "", "player");

    expect(result.ok).toBe(true);
    expect(state.enemies[0].block).toBeLessThan(qinBlockAfterDraw);
    expect([...state.piles.hand, ...state.piles.draw, ...state.piles.discard].some((card) => card.definitionId.startsWith("status_"))).toBe(false);
    expect(state.combatLog).toContain("清音解秽");
  });

  it("switches Qin Demon into mid and final phase intent tables by health threshold", () => {
    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_qixing_spear", "zhao_qixing_spear", "zhao_qixing_spear", "zhao_qixing_spear", "zhao_qixing_spear"] },
      cards: cardList,
      enemies: [enemiesById.boss_qin_demon_echo],
      rngSeed: 32,
      shuffleDeck: false
    });

    state.player.energy = 10;
    state.enemies[0].hp = Math.floor(state.enemies[0].maxHp * 0.68);
    playCard(state, state.piles.hand[0].instanceId, state.enemies[0].id);
    expect(state.enemies[0].phase).toBe("悲声回环");
    expect(state.enemies[0].currentIntent).toMatchObject({ type: "special", name: "悲声回环" });

    state.enemies[0].hp = Math.floor(state.enemies[0].maxHp * 0.32);
    playCard(state, state.piles.hand[1].instanceId, state.enemies[0].id);
    expect(state.enemies[0].phase).toBe("绝响不散");
    expect(state.enemies[0].currentIntent).toMatchObject({ type: "special", name: "绝响不散" });
  });

  it("executes the scribe officer record, rewrite, and final-draft boss pressure", () => {
    const state = createCombat({
      character: { ...charactersById.diaochan, starterDeck: ["diao_strike", "diao_charm", "diao_guard", "common_jiexue", "diao_lingbo"] },
      cards: cardList,
      enemies: [enemiesById.boss_scribe_officer],
      rngSeed: 33,
      shuffleDeck: false
    });

    playCard(state, state.piles.hand[0].instanceId, state.enemies[0].id);
    endPlayerTurn(state);
    endPlayerTurn(state);
    endPlayerTurn(state);

    expect(state.combatLog).toEqual(expect.arrayContaining(["记录", "改写", "定稿"]));
    expect([...state.piles.hand, ...state.piles.draw, ...state.piles.discard].some((card) => card.definitionId === "status_redacted_history")).toBe(true);
  });

  it("upgrades heart methods between chapters and applies their stronger combat hooks", () => {
    const run = createRun("zhaoyun");
    run.methodIds.push("method_dragon_spear_chain");

    expect(claimMethodUpgrade(run, "method_dragon_spear_chain")).toBe(true);
    expect(run.methodLevels?.method_dragon_spear_chain).toBe(2);
    expect(methodsById.method_dragon_spear_chain.upgrades?.[2]?.triggerText).toContain("2");

    const state = createCombat({
      character: { ...charactersById.zhaoyun, starterDeck: ["zhao_strike", "zhao_strike", "zhao_strike", "zhao_guard", "zhao_guard"] },
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 34,
      methodIds: [...run.methodIds],
      methodLevels: run.methodLevels,
      shuffleDeck: false
    });

    const attacks = state.piles.hand.filter((card) => card.definitionId === "zhao_strike");
    playCard(state, attacks[0].instanceId, state.enemies[0].id);
    playCard(state, attacks[1].instanceId, state.enemies[0].id);
    playCard(state, attacks[2].instanceId, state.enemies[0].id);

    expect(state.player.resource.value).toBe(6);
    expect(state.combatLog).toContain("龙胆连势·进境");
  });
});

describe("next ten module run tooling contracts", () => {
  it("biases chapter two and three rewards toward cleanse, rare cards, relics, and current build", () => {
    const bamboo = createRun("diaochan", { mapSeed: 14 });
    advanceToNextChapter(bamboo);
    bamboo.methodIds.push("method_jinghong_dance");
    const bambooDraft = createCardRewardDraft(bamboo, "battle");
    expect(bambooDraft.cards.map((card) => card.id)).toContain("common_jiexue");

    const advanced = createAdvancedRewardDraft(bamboo, "boss");
    expect(advanced.choices.map((choice) => choice.type)).toEqual(expect.arrayContaining(["rareCard", "relic", "methodUpgrade"]));
    expect(advanced.choices.some((choice) => choice.relicId === "relic_qingyin_jade")).toBe(true);
  });

  it("records event and boss fragments in the logbook without duplicating entries", () => {
    const run = createRun("zhaoyun");

    recordLogbookEvent(run, "event_ruined_temple_night_qin");
    recordLogbookEvent(run, "event_ruined_temple_night_qin");
    recordLogbookBoss(run, "boss_qin_demon_echo");

    expect(run.logbook?.eventIds).toEqual(["event_ruined_temple_night_qin"]);
    expect(run.logbook?.bossIds).toEqual(["boss_qin_demon_echo"]);

    const entries = getUnlockedLogbookEntries(run);
    expect(entries.map((entry) => entry.id)).toEqual(expect.arrayContaining(["fragment_bamboo_night_qin", "fragment_qin_demon_echo"]));
    expect(entries.every((entry) => entry.title.length > 0 && entry.body.length > 0)).toBe(true);
  });

  it("creates deterministic debug runs for chapter, deck, relic, method, and logbook validation", () => {
    const run = createDebugRun({
      characterId: "diaochan",
      chapterId: "changan",
      cardIds: ["common_jiexue", "diao_jinghong_strike"],
      relicIds: ["relic_qingyin_jade"],
      methodIds: ["method_jinghong_dance"],
      methodLevels: { method_jinghong_dance: 2 },
      eventIds: ["event_nameless_market"],
      bossIds: ["boss_qin_demon_echo"],
      mapSeed: 77
    });

    expect(run.chapterId).toBe("changan");
    expect(run.deck.map((entry) => entry.cardId)).toEqual(expect.arrayContaining(["common_jiexue", "diao_jinghong_strike"]));
    expect(run.relicIds).toContain("relic_qingyin_jade");
    expect(run.methodLevels?.method_jinghong_dance).toBe(2);
    expect(run.logbook?.eventIds).toContain("event_nameless_market");
    expect(run.mapNodes.find((node) => node.id === "boss")?.enemyId).toBe("boss_scribe_officer");
  });
});

function expectAssetPathToExist(assetPath: string): void {
  const absolute = join(dirname(fileURLToPath(import.meta.url)), "../../public", assetPath.replace(/^\//, ""));
  expect(existsSync(absolute)).toBe(true);
}
