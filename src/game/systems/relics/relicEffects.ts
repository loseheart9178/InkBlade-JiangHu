import { relicList, relicsById } from "../../content/relics";

export type RelicRewardSource = "elite" | "boss" | "shop";

export function getRelicRewardPool(source: RelicRewardSource, characterId?: string): string[] {
  return relicList
    .filter((relic) => relic.price > 0)
    .filter((relic) => (relic.sources ?? []).includes(source))
    .filter((relic) => !relic.character || relic.character === characterId)
    .sort((left, right) => getSourcePriority(left.id, source) - getSourcePriority(right.id, source))
    .map((relic) => relic.id);
}

export function getShopRelicPool(characterId?: string): string[] {
  return getRelicRewardPool("shop", characterId);
}

export function describeRelicSource(relicId: string): string {
  const relic = relicsById[relicId];
  if (!relic) {
    return relicId;
  }

  const source = relic.sources?.join("/") ?? "初始";
  return `${formatRarity(relic.rarity)} · ${source}`;
}

function getSourcePriority(relicId: string, source: RelicRewardSource): number {
  const eliteOrder = [
    "relic_dragon_scale_tip",
    "relic_changban_iron_seal",
    "relic_lotus_step_bell",
    "relic_half_moon_hairpin",
    "relic_broken_string",
    "relic_memory_bamboo_slip",
    "relic_old_wooden_sword",
    "relic_black_paper_umbrella",
    "relic_ink_washstone",
    "relic_clear_rain_charm",
    "relic_red_lacquer_token",
    "relic_silent_zither_string",
    "relic_qingyin_jade",
    "relic_scribe_red_seal"
  ];
  const shopOrder = [
    "relic_old_wooden_sword",
    "relic_black_paper_umbrella",
    "relic_ink_washstone",
    "relic_clear_rain_charm",
    "relic_red_lacquer_token",
    "relic_memory_bamboo_slip",
    "relic_qingyin_jade"
  ];
  const order = source === "shop" ? shopOrder : eliteOrder;
  const index = order.indexOf(relicId);
  return index >= 0 ? index : order.length;
}

function formatRarity(rarity: string): string {
  const labels: Record<string, string> = {
    common: "凡",
    uncommon: "奇",
    rare: "绝",
    boss: "章"
  };
  return labels[rarity] ?? rarity;
}
