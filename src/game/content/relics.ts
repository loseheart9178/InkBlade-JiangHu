export interface RelicDefinition {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "boss";
  character?: "zhaoyun" | "diaochan";
  price: number;
  description: string;
}

export const relicList: RelicDefinition[] = [
  {
    id: "relic_white_dragon_tassel",
    name: "白龙枪缨",
    rarity: "boss",
    character: "zhaoyun",
    price: 0,
    description: "每场战斗第一次触发破阵时，获得1点能量并抽1张牌。"
  },
  {
    id: "relic_closed_moon_sachet",
    name: "闭月香囊",
    rarity: "boss",
    character: "diaochan",
    price: 0,
    description: "战斗开始时，随机敌人获得2层魅惑。"
  },
  {
    id: "relic_old_wooden_sword",
    name: "旧木剑",
    rarity: "common",
    price: 65,
    description: "基础攻击伤害+2。"
  },
  {
    id: "relic_black_paper_umbrella",
    name: "黑纸伞",
    rarity: "uncommon",
    price: 75,
    description: "获得墨痕时，获得2点护甲。"
  }
];

export const relicsById: Record<string, RelicDefinition> = Object.fromEntries(
  relicList.map((relic) => [relic.id, relic])
);
