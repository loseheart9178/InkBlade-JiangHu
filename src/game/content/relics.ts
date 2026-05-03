import type { CardArchetypeId } from "../systems/combat/types";

export interface RelicDefinition {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "boss";
  character?: "zhaoyun" | "diaochan";
  archetypeId?: CardArchetypeId;
  sources?: Array<"elite" | "boss" | "shop">;
  triggerText?: string;
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
    triggerText: "破阵首次触发时生效。",
    description: "每场战斗第一次触发破阵时，获得1点能量并抽1张牌。"
  },
  {
    id: "relic_closed_moon_sachet",
    name: "闭月香囊",
    rarity: "boss",
    character: "diaochan",
    price: 0,
    triggerText: "战斗开始时生效。",
    description: "战斗开始时，随机敌人获得2层魅惑。"
  },
  {
    id: "relic_old_wooden_sword",
    name: "旧木剑",
    rarity: "common",
    sources: ["elite", "boss", "shop"],
    price: 65,
    triggerText: "基础攻击生效。",
    description: "基础攻击伤害+2。"
  },
  {
    id: "relic_black_paper_umbrella",
    name: "黑纸伞",
    rarity: "uncommon",
    sources: ["elite", "boss", "shop"],
    price: 75,
    triggerText: "获得墨痕时生效。",
    description: "获得墨痕时，获得2点护甲。"
  },
  {
    id: "relic_dragon_scale_tip",
    name: "鳞锋枪尖",
    rarity: "uncommon",
    character: "zhaoyun",
    archetypeId: "zhao-spear-chain",
    sources: ["elite", "boss"],
    price: 90,
    triggerText: "每场战斗第三张攻击触发。",
    description: "每场战斗第三张攻击额外造成3点伤害。"
  },
  {
    id: "relic_changban_iron_seal",
    name: "长坂铁印",
    rarity: "uncommon",
    character: "zhaoyun",
    archetypeId: "zhao-guardian-counter",
    sources: ["elite", "boss"],
    price: 90,
    triggerText: "每场战斗首次护主抵消伤害触发。",
    description: "每场战斗首次护主抵消伤害时，抽1张牌。"
  },
  {
    id: "relic_lotus_step_bell",
    name: "莲步铃",
    rarity: "uncommon",
    character: "diaochan",
    archetypeId: "diao-dance-chain",
    sources: ["elite", "boss"],
    price: 90,
    triggerText: "每场战斗第一张身法触发。",
    description: "每场战斗首次打出身法牌时，抽1张牌。"
  },
  {
    id: "relic_half_moon_hairpin",
    name: "半月钗",
    rarity: "uncommon",
    character: "diaochan",
    archetypeId: "diao-charm-control",
    sources: ["elite", "boss"],
    price: 90,
    triggerText: "每场战斗首次让敌人魅惑达到4触发。",
    description: "每场战斗首次使敌人魅惑达到4层时，施加1层易伤。"
  },
  {
    id: "relic_ink_washstone",
    name: "洗墨石",
    rarity: "common",
    sources: ["elite", "boss", "shop"],
    price: 70,
    triggerText: "每场战斗首次获得墨痕触发。",
    description: "每场战斗首次获得墨痕时，抽1张牌。"
  },
  {
    id: "relic_clear_rain_charm",
    name: "清雨符",
    rarity: "common",
    sources: ["elite", "boss", "shop"],
    price: 70,
    triggerText: "战斗胜利结算墨痕时触发。",
    description: "战斗胜利时，墨痕造成的生命损失减少1点。"
  },
  {
    id: "relic_red_lacquer_token",
    name: "朱漆令",
    rarity: "common",
    sources: ["elite", "boss", "shop"],
    price: 60,
    triggerText: "战斗开始时触发。",
    description: "战斗开始时，获得2点护甲。"
  },
  {
    id: "relic_silent_zither_string",
    name: "无声琴弦",
    rarity: "uncommon",
    sources: ["elite", "boss"],
    price: 82,
    triggerText: "每场战斗首次进入心境触发。",
    description: "每场战斗首次进入任意心境时，获得2点护甲。"
  },
  {
    id: "relic_qingyin_jade",
    name: "清音玉",
    rarity: "rare",
    sources: ["boss", "shop"],
    price: 120,
    triggerText: "净化状态牌时触发。",
    description: "每场战斗首次净化状态或诅咒牌时，抽1张牌并获得2点护甲。"
  },
  {
    id: "relic_broken_string",
    name: "断弦",
    rarity: "uncommon",
    sources: ["elite", "boss"],
    price: 88,
    triggerText: "抽到状态牌时触发。",
    description: "每场战斗首次抽到状态或诅咒牌时，敌人失去2点护甲。"
  },
  {
    id: "relic_scribe_red_seal",
    name: "朱批印",
    rarity: "rare",
    sources: ["boss"],
    price: 130,
    triggerText: "打出稀有牌后触发。",
    description: "每场战斗首次打出稀有牌后，获得1点能量。"
  },
  {
    id: "relic_memory_bamboo_slip",
    name: "记忆竹简",
    rarity: "uncommon",
    sources: ["elite", "shop"],
    price: 84,
    triggerText: "进入新章节时适配成长。",
    description: "章末奖励更容易出现心法进境与净化牌。"
  }
];

export const relicsById: Record<string, RelicDefinition> = Object.fromEntries(
  relicList.map((relic) => [relic.id, relic])
);
