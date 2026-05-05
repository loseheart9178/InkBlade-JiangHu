import { cardList } from "../../src/game/content/cards";
import { enemyList } from "../../src/game/content/enemies";
import { logbookEntryList } from "../../src/game/content/logbook";
import { relicList } from "../../src/game/content/relics";
import { defaultComboRules, exhaustAttackComboRule } from "../../src/game/systems/combat/combos";
import { buildCompendium, getCompendiumCategoryLabel } from "../../src/game/systems/compendium/compendium";
import { createProfile, unlockEnding, unlockLogbookFragment } from "../../src/game/systems/profile/profile";

describe("compendium system", () => {
  it("groups every shipped content family without renderer state", () => {
    const compendium = buildCompendium();

    expect(compendium.totalCount).toBe(cardList.length + relicList.length + enemyList.length + defaultComboRules.length + 1 + logbookEntryList.length);
    expect(compendium.filteredCount).toBe(compendium.totalCount);
    expect(compendium.groups.map((group) => group.id)).toEqual(["cards", "relics", "enemies", "combos", "story"]);
    expect(compendium.groups.find((group) => group.id === "combos")?.items.map((item) => item.title)).toContain(exhaustAttackComboRule.name);
    expect(getCompendiumCategoryLabel("story")).toBe("残页");
  });

  it("filters card entries by category, character, and rarity", () => {
    const compendium = buildCompendium({
      category: "cards",
      character: "zhaoyun",
      rarity: "starter"
    });

    expect(compendium.groups).toHaveLength(1);
    expect(compendium.groups[0].id).toBe("cards");
    expect(compendium.groups[0].items.map((item) => item.title)).toEqual(["枪击", "架枪", "龙胆"]);
    expect(compendium.groups[0].items.every((item) => item.character === "zhaoyun" && item.rarity === "starter")).toBe(true);
    expect(compendium.groups[0].items.some((item) => item.title === "素刃")).toBe(false);
  });

  it("filters enemies and story fragments by chapter", () => {
    const luoshuiEnemies = buildCompendium({ category: "enemies", chapter: "luoshui" });
    expect(luoshuiEnemies.groups).toHaveLength(1);
    expect(luoshuiEnemies.groups[0].items.map((item) => item.title)).toEqual(
      enemyList.filter((enemy) => enemy.chapter === "luoshui").map((enemy) => enemy.name)
    );
    expect(luoshuiEnemies.groups[0].items.map((item) => item.title)).toContain("墨影董卓");

    const bambooStory = buildCompendium({ category: "story", chapter: "bamboo" });
    expect(bambooStory.groups).toHaveLength(1);
    expect(bambooStory.groups[0].items.map((item) => item.title)).toEqual(expect.arrayContaining(["荒寺夜琴", "琴魔·残音"]));
    expect(bambooStory.groups[0].items.every((item) => item.chapter === "bamboo")).toBe(true);
  });

  it("exposes compact filter facets with labels and counts", () => {
    const compendium = buildCompendium({ category: "cards" });

    expect(compendium.facets.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "cards", label: "卡牌", count: cardList.length }),
        expect.objectContaining({ id: "relics", label: "法宝", count: relicList.length }),
        expect.objectContaining({ id: "enemies", label: "敌影", count: enemyList.length }),
        expect.objectContaining({ id: "combos", label: "招式链", count: defaultComboRules.length + 1 }),
        expect.objectContaining({ id: "story", label: "残页", count: logbookEntryList.length })
      ])
    );
    expect(compendium.facets.characters).toEqual(expect.arrayContaining([expect.objectContaining({ id: "zhaoyun", label: "赵云" })]));
    expect(compendium.facets.rarities).toEqual(expect.arrayContaining([expect.objectContaining({ id: "starter", label: "初始" })]));
    expect(compendium.facets.chapters).toEqual(expect.arrayContaining([expect.objectContaining({ id: "moyuan", label: "墨渊照心" })]));
  });

  it("marks profile-unlocked story fragments while keeping locked fragments visible", () => {
    const unlockedFragment = logbookEntryList[0];
    const profile = unlockEnding(unlockLogbookFragment(createProfile(), unlockedFragment.id), "ending_test_luoshui", "zhaoyun");
    const compendium = buildCompendium({ category: "story" }, profile);
    const storyItems = compendium.groups.flatMap((group) => group.items);

    expect(storyItems).toHaveLength(logbookEntryList.length);
    expect(storyItems.find((item) => item.id === unlockedFragment.id)).toMatchObject({
      unlockState: "unlocked",
      unlockReason: "已收录残页"
    });
    expect(storyItems.find((item) => item.id !== unlockedFragment.id)).toMatchObject({
      unlockState: "locked",
      unlockReason: "尚未在本存档中收录"
    });
    expect(compendium.unlockSummary).toEqual({
      total: logbookEntryList.length,
      unlocked: 1,
      locked: logbookEntryList.length - 1
    });
  });

  it("keeps reference content visible without profile data and filters by unlock state", () => {
    const cards = buildCompendium({ category: "cards" });
    expect(cards.groups[0].items.every((item) => item.unlockState === "reference")).toBe(true);
    expect(cards.unlockSummary).toEqual({ total: 0, unlocked: 0, locked: 0 });

    const referenceCards = buildCompendium({ category: "cards", unlock: "reference" });
    expect(referenceCards.filteredCount).toBe(cardList.length);
    expect(referenceCards.groups[0].items.every((item) => item.unlockState === "reference")).toBe(true);

    const lockedStory = buildCompendium({ category: "story", unlock: "locked" });
    expect(lockedStory.filteredCount).toBe(logbookEntryList.length);
    expect(lockedStory.groups[0].items.every((item) => item.unlockState === "locked")).toBe(true);
  });
});
