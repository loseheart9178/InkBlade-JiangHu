import { cardList, cardsById } from "../../src/game/content/cards";
import { characterList } from "../../src/game/content/characters";
import { enemyList } from "../../src/game/content/enemies";
import { eventList } from "../../src/game/content/events";
import { relicList } from "../../src/game/content/relics";
import { combatPortraitsById } from "../../src/game/content/visuals";

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
    expect(cardList.length).toBeGreaterThanOrEqual(24);
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

  it("defines first chapter enemies including elites and the Dong Zhuo boss", () => {
    expect(enemyList.length).toBeGreaterThanOrEqual(5);
    expect(enemyList.some((enemy) => enemy.id === "boss_ink_dongzhuo")).toBe(true);

    for (const enemy of enemyList) {
      expect(enemy.maxHp).toBeGreaterThan(0);
      expect(enemy.intents.length).toBeGreaterThan(0);
    }
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
      "boss_ink_dongzhuo"
    ];

    for (const id of expectedIds) {
      expect(combatPortraitsById[id]).toBeDefined();
      expect(combatPortraitsById[id].assetPath).toMatch(/^\/assets\/characters\/.+\.svg$/);
    }
  });
});
