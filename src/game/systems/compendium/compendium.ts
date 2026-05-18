import { cardList } from "../../content/cards";
import { chapterList, chaptersById, type ChapterId } from "../../content/chapters";
import { characterList, charactersById } from "../../content/characters";
import { enemiesById, enemyList } from "../../content/enemies";
import { eventList } from "../../content/events";
import { logbookEntryList } from "../../content/logbook";
import { relicList } from "../../content/relics";
import { defaultComboRules, exhaustAttackComboRule } from "../combat/combos";
import type { CardEffect, CardRarity, CardType, ComboEffect, ComboRule, EnemyIntent, TargetKind } from "../combat/types";
import type { PlayerProfile } from "../profile/profile";

export type CompendiumCategory = "cards" | "relics" | "enemies" | "combos" | "story";
export type CompendiumUnlockState = "reference" | "unlocked" | "locked";
export type CompendiumUnlockFilter = "all" | CompendiumUnlockState;

export interface CompendiumFilters {
  category?: CompendiumCategory | "all";
  character?: string | "all";
  rarity?: string | "all";
  chapter?: ChapterId | "all";
  unlock?: CompendiumUnlockFilter;
}

export interface CompendiumItem {
  id: string;
  category: CompendiumCategory;
  title: string;
  subtitle: string;
  body: string;
  meta: string[];
  character?: string;
  rarity?: string;
  chapter?: ChapterId;
  unlockState?: CompendiumUnlockState;
  unlockReason?: string;
  eventId?: string;
  bossId?: string;
}

export interface CompendiumGroup {
  id: CompendiumCategory;
  items: CompendiumItem[];
}

export interface CompendiumFacet {
  id: string;
  label: string;
  count: number;
}

export interface CompendiumView {
  totalCount: number;
  filteredCount: number;
  unlockSummary: {
    total: number;
    unlocked: number;
    locked: number;
  };
  groups: CompendiumGroup[];
  facets: {
    categories: CompendiumFacet[];
    characters: CompendiumFacet[];
    rarities: CompendiumFacet[];
    chapters: CompendiumFacet[];
  };
}

const categoryOrder: CompendiumCategory[] = ["cards", "relics", "enemies", "combos", "story"];
const categoryLabels: Record<CompendiumCategory, string> = {
  cards: "卡牌",
  relics: "法宝",
  enemies: "敌影",
  combos: "招式链",
  story: "残页"
};

const rarityOrder: Array<CardRarity | "boss"> = ["starter", "common", "uncommon", "rare", "event", "ink", "status", "curse", "boss"];
const rarityLabels: Record<string, string> = {
  starter: "初始",
  common: "普通",
  uncommon: "罕见",
  rare: "稀有",
  event: "事件",
  ink: "墨灾",
  status: "状态",
  curse: "诅咒",
  boss: "首领"
};

const cardTypeLabels: Record<CardType, string> = {
  attack: "攻击",
  skill: "技能",
  body: "身法",
  power: "能力",
  mind: "心境",
  ink: "墨灾"
};

const targetLabels: Record<TargetKind, string> = {
  enemy: "对敌",
  self: "自身",
  none: "无目标"
};

const enemyRoleLabels = {
  normal: "普通",
  elite: "精英",
  boss: "首领"
} as const;

const relicSourceLabels = {
  elite: "精英",
  boss: "首领",
  shop: "商店"
} as const;

const eventChapterById: Record<string, ChapterId> = {
  event_black_rain_ferry: "luoshui",
  event_changban_echo: "luoshui",
  event_palace_lantern_banquet: "luoshui",
  event_luoshui_mirror: "luoshui",
  event_broken_spear_shrine: "luoshui",
  event_silk_lantern_market: "luoshui",
  event_rain_washed_tablet: "luoshui",
  event_fisher_old_song: "luoshui",
  event_deserted_armory: "luoshui",
  event_silent_bridge: "luoshui",
  event_red_sleeve_letter: "luoshui",
  event_black_lotus_pool: "luoshui",
  event_ruined_temple_night_qin: "bamboo",
  event_rain_tea_pavilion: "bamboo",
  event_bamboo_heart_question: "bamboo",
  event_bamboo_soldier_array: "bamboo",
  event_red_cloth_faceless: "bamboo",
  event_broken_string_elder: "bamboo",
  event_wordless_bamboo_scroll: "bamboo",
  event_white_horse_lost_path: "bamboo",
  event_red_dust_guest: "bamboo",
  event_nameless_market: "changan",
  event_rewritten_history_street: "changan",
  event_white_robed_stelae: "changan",
  event_faceless_stage: "changan",
  event_unfinished_chessboard: "changan",
  event_heart_mirror: "moyuan",
  event_unwritten_page: "moyuan",
  event_broken_brush_altar: "moyuan",
  event_river_bones_lantern: "luoshui",
  event_mountain_pass_riddle: "luoshui",
  event_silent_training_yard: "luoshui",
  event_muddy_ferry_lantern: "luoshui",
  event_old_roadside_inn: "luoshui",
  event_qingyin_lost_score: "bamboo",
  event_bamboo_grave_song: "bamboo",
  event_spear_oath_pavilion: "bamboo",
  event_lotus_reflection_stage: "bamboo",
  event_qin_rain_pavilion: "bamboo",
  event_star_board_argument: "changan",
  event_empty_city_wind: "changan",
  event_ink_seller_contract: "changan",
  event_broken_name_register: "changan",
  event_star_board_camp: "changan",
  event_cloud_water_dream: "moyuan"
};

const eventsById = Object.fromEntries(eventList.map((event) => [event.id, event]));

export function buildCompendium(filters: CompendiumFilters = {}, profile?: PlayerProfile): CompendiumView {
  const allItems = createCompendiumItems(profile);
  const normalizedFilters = normalizeFilters(filters);
  const filteredItems = allItems.filter((item) => matchesFilters(item, normalizedFilters));

  return {
    totalCount: allItems.length,
    filteredCount: filteredItems.length,
    unlockSummary: createUnlockSummary(filteredItems),
    groups: createGroups(filteredItems),
    facets: createFacets(allItems)
  };
}

export function getCompendiumCategoryLabel(category: CompendiumCategory): string {
  return categoryLabels[category];
}

function normalizeFilters(filters: CompendiumFilters): Required<CompendiumFilters> {
  return {
    category: filters.category ?? "all",
    character: filters.character ?? "all",
    rarity: filters.rarity ?? "all",
    chapter: filters.chapter ?? "all",
    unlock: filters.unlock ?? "all"
  };
}

function createCompendiumItems(profile?: PlayerProfile): CompendiumItem[] {
  return [
    ...cardList.map((card) => ({
      id: card.id,
      category: "cards" as const,
      title: card.name,
      subtitle: [formatRarity(card.rarity), formatCharacter(card.character), card.types.map(formatCardType).join("/")].filter(Boolean).join(" · "),
      body: card.description ?? formatCardEffects(card.effects),
      meta: [
        `费用 ${card.cost}`,
        formatTarget(card.target),
        card.exhaust ? "消耗" : "",
        card.retain ? "保留" : "",
        card.temporary ? "临时" : "",
        ...(card.keywords ?? []).map((keyword) => `关键词 ${keyword}`)
      ],
      character: card.character,
      rarity: card.rarity,
      unlockState: "reference" as const,
      unlockReason: "完整参照"
    })),
    ...relicList.map((relic) => ({
      id: relic.id,
      category: "relics" as const,
      title: relic.name,
      subtitle: [formatRarity(relic.rarity), formatCharacter(relic.character), relic.archetypeId ? "流派法宝" : ""].filter(Boolean).join(" · "),
      body: relic.description,
      meta: [
        relic.triggerText ?? "",
        relic.sources && relic.sources.length > 0 ? `来源 ${relic.sources.map((source) => relicSourceLabels[source]).join("/")}` : "来源 初始/特殊",
        relic.price > 0 ? `茶资 ${relic.price}` : "无价"
      ],
      character: relic.character,
      rarity: relic.rarity,
      unlockState: "reference" as const,
      unlockReason: "完整参照"
    })),
    ...enemyList.map((enemy) => ({
      id: enemy.id,
      category: "enemies" as const,
      title: enemy.name,
      subtitle: `${formatChapter(enemy.chapter)} · ${enemyRoleLabels[enemy.role]}`,
      body: `生命 ${enemy.maxHp}。意图：${enemy.intents.map(formatEnemyIntent).join("、")}。`,
      meta: [
        `章节 ${formatChapter(enemy.chapter)}`,
        `类型 ${enemyRoleLabels[enemy.role]}`,
        enemy.phaseIntents && enemy.phaseIntents.length > 0 ? `阶段 ${enemy.phaseIntents.map((phase) => phase.phase).join("/")}` : ""
      ],
      chapter: enemy.chapter,
      unlockState: "reference" as const,
      unlockReason: "完整参照"
    })),
    ...[...defaultComboRules, exhaustAttackComboRule].map(createComboItem),
    ...logbookEntryList.map((entry) => {
      const event = entry.unlocks.eventId ? eventsById[entry.unlocks.eventId] : undefined;
      const boss = entry.unlocks.bossId ? enemiesById[entry.unlocks.bossId] : undefined;
      const chapter = getStoryChapter(entry.unlocks);
      const unlockState: CompendiumUnlockState = profile?.unlockedFragments.includes(entry.id) ? "unlocked" : "locked";
      return {
        id: entry.id,
        category: "story" as const,
        title: entry.title,
        subtitle: [chapter ? formatChapter(chapter) : "江湖残页", event?.character ? formatCharacter(event.character) : ""].filter(Boolean).join(" · "),
        body: entry.body,
        meta: [
          event ? `事件 ${event.title}` : "",
          boss ? `首领 ${boss.name}` : "",
          chapter ? `章节 ${formatChapter(chapter)}` : ""
        ],
        character: event?.character,
        chapter,
        unlockState,
        unlockReason: unlockState === "unlocked" ? "已收录残页" : "尚未在本存档中收录",
        eventId: entry.unlocks.eventId,
        bossId: entry.unlocks.bossId
      };
    })
  ];
}

function createComboItem(combo: ComboRule): CompendiumItem {
  return {
    id: combo.id,
    category: "combos",
    title: combo.name,
    subtitle: combo.sequence.map(formatCardType).join(" → "),
    body: `按 ${combo.sequence.map(formatCardType).join(" → ")} 出牌时触发：${formatComboEffects(combo.effects)}。`,
    meta: [`招式 ${combo.sequence.length} 段`, `色调 ${combo.tone}`],
    unlockState: "reference",
    unlockReason: "完整参照"
  };
}

function getStoryChapter(unlocks: { eventId?: string; bossId?: string; chapterId?: string }): ChapterId | undefined {
  if (unlocks.chapterId && chaptersById[unlocks.chapterId as ChapterId]) {
    return unlocks.chapterId as ChapterId;
  }

  if (unlocks.bossId) {
    return enemiesById[unlocks.bossId]?.chapter;
  }

  if (unlocks.eventId) {
    return eventChapterById[unlocks.eventId];
  }

  return undefined;
}

function createGroups(items: CompendiumItem[]): CompendiumGroup[] {
  return categoryOrder
    .map((category) => ({
      id: category,
      items: items.filter((item) => item.category === category)
    }))
    .filter((group) => group.items.length > 0);
}

function createFacets(items: CompendiumItem[]): CompendiumView["facets"] {
  return {
    categories: categoryOrder.map((category) => ({
      id: category,
      label: categoryLabels[category],
      count: items.filter((item) => item.category === category).length
    })),
    characters: characterList
      .map((character) => ({
        id: character.id,
        label: character.name,
        count: items.filter((item) => item.character === character.id).length
      }))
      .filter((facet) => facet.count > 0),
    rarities: rarityOrder
      .map((rarity) => ({
        id: rarity,
        label: formatRarity(rarity),
        count: items.filter((item) => item.rarity === rarity).length
      }))
      .filter((facet) => facet.count > 0),
    chapters: chapterList
      .map((chapter) => ({
        id: chapter.id,
        label: chapter.name,
        count: items.filter((item) => item.chapter === chapter.id).length
      }))
      .filter((facet) => facet.count > 0)
  };
}

function createUnlockSummary(items: CompendiumItem[]): CompendiumView["unlockSummary"] {
  const storyItems = items.filter((item) => item.unlockState === "unlocked" || item.unlockState === "locked");
  return {
    total: storyItems.length,
    unlocked: storyItems.filter((item) => item.unlockState === "unlocked").length,
    locked: storyItems.filter((item) => item.unlockState === "locked").length
  };
}

function matchesFilters(item: CompendiumItem, filters: Required<CompendiumFilters>): boolean {
  if (filters.category !== "all" && item.category !== filters.category) {
    return false;
  }

  if (filters.character !== "all" && item.character !== filters.character) {
    return false;
  }

  if (filters.rarity !== "all" && item.rarity !== filters.rarity) {
    return false;
  }

  if (filters.chapter !== "all" && item.chapter !== filters.chapter) {
    return false;
  }

  if (filters.unlock !== "all" && (item.unlockState ?? "reference") !== filters.unlock) {
    return false;
  }

  return true;
}

function formatCharacter(characterId: string | undefined): string {
  if (!characterId) {
    return "通用";
  }

  return charactersById[characterId]?.name ?? characterId;
}

function formatRarity(rarity: string): string {
  return rarityLabels[rarity] ?? rarity;
}

function formatChapter(chapterId: ChapterId): string {
  return chaptersById[chapterId]?.name ?? chapterId;
}

function formatCardType(type: CardType): string {
  return cardTypeLabels[type] ?? type;
}

function formatTarget(target: TargetKind): string {
  return targetLabels[target] ?? target;
}

function formatCardEffects(effects: CardEffect[]): string {
  return effects.map(formatCardEffect).join("，");
}

function formatCardEffect(effect: CardEffect): string {
  switch (effect.action) {
    case "damage":
      return `造成${effect.amount}点伤害`;
    case "block":
      return `获得${effect.amount}点护甲`;
    case "draw":
      return `抽${effect.amount}张牌`;
    case "gainResource":
      return `获得${effect.amount}点角色资源`;
    case "applyStatus":
      return `施加${effect.amount}层${effect.status}`;
    case "gainInk":
      return `获得${effect.amount}层墨痕`;
    case "cleanseCards":
      return `净化${effect.amount}张状态/诅咒牌`;
    case "queueEcho":
      return "下回合余韵再奏";
    case "scry":
      return `观星${effect.amount}`;
    case "setFormation":
      return `布下${effect.name}`;
    case "setMind":
      return `进入${effect.mind}心境`;
  }
}

function formatComboEffects(effects: ComboEffect[]): string {
  return effects.map((effect) => {
    switch (effect.action) {
      case "damage":
        return `造成${effect.amount}点伤害`;
      case "block":
        return `获得${effect.amount}点护甲`;
      case "draw":
        return `抽${effect.amount}张牌`;
      case "gainInk":
        return `获得${effect.amount}层墨痕`;
    }
  }).join("，");
}

function formatEnemyIntent(intent: EnemyIntent): string {
  if (intent.type === "attack") {
    return `攻击 ${intent.damage}x${intent.hits}`;
  }

  if (intent.type === "block") {
    return `护甲 ${intent.block}`;
  }

  if (intent.type === "idle") {
    return "蓄势";
  }

  return intent.name;
}
