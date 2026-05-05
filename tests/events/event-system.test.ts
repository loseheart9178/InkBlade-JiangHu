import { describe, expect, it } from "vitest";
import { cardsById } from "../../src/game/content/cards";
import { eventList, eventsById } from "../../src/game/content/events";
import { createRun } from "../../src/game/systems/run/run";
import { applyEventChoiceEffects, getAvailableEventChoices } from "../../src/game/systems/events/eventEffects";

const wave29EventIds = [
  "event_qingyin_lost_score",
  "event_bamboo_grave_song",
  "event_star_board_argument",
  "event_empty_city_wind",
  "event_old_roadside_inn",
  "event_ink_seller_contract",
  "event_river_bones_lantern",
  "event_mountain_pass_riddle",
  "event_silent_training_yard",
  "event_broken_name_register",
  "event_cloud_water_dream"
] as const;

const supportedEventEffectTypes = new Set([
  "gold",
  "card",
  "inkCardOffer",
  "heal",
  "hpLoss",
  "removeStarter",
  "upgrade",
  "mind"
]);

const supportedMindIds = new Set(["ning", "nu", "bei", "mei", "luan", "wu"]);

describe("chapter event effects", () => {
  it("applies typed event effects to gold, health, cards, upgrades, and mind tendencies", () => {
    const run = createRun("zhaoyun", { mapSeed: 4 });
    run.hp = 40;

    applyEventChoiceEffects(run, {
      id: "test_compound",
      label: "试招",
      summary: "测试复合效果。",
      effects: [
        { type: "gold", amount: 10 },
        { type: "heal", amount: 5 },
        { type: "hpLoss", amount: 3 },
        { type: "card", cardId: "zhao_guardian" },
        { type: "upgrade" },
        { type: "mind", mind: "ning", amount: 2 }
      ]
    });

    expect(run.gold).toBe(109);
    expect(run.hp).toBe(42);
    expect(run.deck.at(-1)?.cardId).toBe("zhao_guardian");
    expect(run.deck.some((entry) => entry.upgraded)).toBe(true);
    expect(run.mindTendencies.ning).toBe(2);
  });

  it("can remove a starter card and offer an ink card", () => {
    const run = createRun("diaochan", { mapSeed: 5 });
    const beforeDeckSize = run.deck.length;

    applyEventChoiceEffects(run, {
      id: "test_ink",
      label: "听雨",
      summary: "测试墨牌。",
      effects: [
        { type: "removeStarter" },
        { type: "inkCardOffer", cardId: "ink_moren" },
        { type: "mind", mind: "luan", amount: 1 }
      ]
    });

    expect(run.deck).toHaveLength(beforeDeckSize);
    expect(run.deck.at(-1)?.cardId).toBe("ink_moren");
    expect(run.mindTendencies.luan).toBe(1);
  });

  it("filters role-specific choices for the active character", () => {
    const event = eventsById.event_luoshui_mirror;

    expect(getAvailableEventChoices(event, "zhaoyun").map((choice) => choice.id)).toContain("pierce_reflection");
    expect(getAvailableEventChoices(event, "zhaoyun").map((choice) => choice.id)).not.toContain("answer_with_dance");
    expect(getAvailableEventChoices(event, "diaochan").map((choice) => choice.id)).toContain("answer_with_dance");
  });

  it("filters Cai Wenji and Zhuge Liang role choices for the active character", () => {
    const bambooQuestion = eventsById.event_bamboo_heart_question;
    const teaPavilion = eventsById.event_rain_tea_pavilion;

    expect(getAvailableEventChoices(bambooQuestion, "caiwenji").map((choice) => choice.id)).toContain("answer_with_qin");
    expect(getAvailableEventChoices(bambooQuestion, "caiwenji").map((choice) => choice.id)).not.toContain("answer_with_stars");
    expect(getAvailableEventChoices(bambooQuestion, "zhugeliang").map((choice) => choice.id)).toContain("answer_with_stars");
    expect(getAvailableEventChoices(bambooQuestion, "zhugeliang").map((choice) => choice.id)).not.toContain("answer_with_qin");
    expect(getAvailableEventChoices(teaPavilion, "zhugeliang").map((choice) => choice.id)).toContain("replay_the_variation");
  });

  it("contains role-specific event choices for all four MVP characters", () => {
    const choices = eventList.flatMap((event) => event.choices);

    expect(choices.filter((choice) => choice.characterId === "zhaoyun").length).toBeGreaterThanOrEqual(2);
    expect(choices.filter((choice) => choice.characterId === "diaochan").length).toBeGreaterThanOrEqual(2);
    expect(choices.filter((choice) => choice.characterId === "caiwenji").length).toBeGreaterThanOrEqual(2);
    expect(choices.filter((choice) => choice.characterId === "zhugeliang").length).toBeGreaterThanOrEqual(2);
  });

  it("contains enough first-chapter events and role hooks for route replayability", () => {
    const zhaoChoiceCount = eventList.flatMap((event) => event.choices).filter((choice) => choice.characterId === "zhaoyun").length;
    const diaoChoiceCount = eventList.flatMap((event) => event.choices).filter((choice) => choice.characterId === "diaochan").length;

    expect(eventList.length).toBeGreaterThanOrEqual(10);
    expect(zhaoChoiceCount).toBeGreaterThanOrEqual(2);
    expect(diaoChoiceCount).toBeGreaterThanOrEqual(2);
    expect(eventList.every((event) => event.choices.every((choice) => choice.summary.length > 0))).toBe(true);
  });

  it("matches the Wave 29 event-level character distribution", () => {
    expect(countBy(eventList, (event) => event.character ?? "neutral")).toEqual({
      neutral: 30,
      zhaoyun: 3,
      diaochan: 3,
      caiwenji: 2,
      zhugeliang: 2
    });
  });

  it("ships every Wave 29 event with supported choices and effect payloads", () => {
    const missingEventIds = wave29EventIds.filter((eventId) => !eventsById[eventId]);

    expect(missingEventIds).toEqual([]);

    for (const eventId of wave29EventIds) {
      const event = eventsById[eventId];

      expect(event.choices.length, eventId).toBeGreaterThanOrEqual(2);

      for (const choice of event.choices) {
        expect(choice.summary.trim().length, `${eventId}:${choice.id}`).toBeGreaterThan(0);

        for (const effect of choice.effects) {
          expect(supportedEventEffectTypes.has(effect.type), `${eventId}:${choice.id}:${effect.type}`).toBe(true);

          if (effect.type === "card" || effect.type === "inkCardOffer") {
            expect(cardsById[effect.cardId], `${eventId}:${choice.id}:${effect.cardId}`).toBeDefined();
          }

          if (effect.type === "mind") {
            expect(supportedMindIds.has(effect.mind), `${eventId}:${choice.id}:${effect.mind}`).toBe(true);
          }
        }
      }
    }
  });

  it("adds at least two event-level tagged stories for Cai Wenji and Zhuge Liang", () => {
    const eventLevelCharacterCounts = countBy(
      eventList.filter((event) => event.character),
      (event) => event.character ?? "neutral"
    );

    expect(eventLevelCharacterCounts.caiwenji ?? 0).toBeGreaterThanOrEqual(2);
    expect(eventLevelCharacterCounts.zhugeliang ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("generates varied late event ids from map seeds", () => {
    const lateEventIds = Array.from({ length: 8 }, (_, seed) => createRun("zhaoyun", { mapSeed: seed }).mapNodes.find((node) => node.id === "event-2")?.eventId);

    expect(new Set(lateEventIds).size).toBeGreaterThan(2);
  });
});

function countBy<T>(items: readonly T[], getKey: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
