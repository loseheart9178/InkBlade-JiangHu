import type { CardArchetypeId } from "../systems/combat/types";

export type MethodId =
  | "method_dragon_spear_chain"
  | "method_changban_guard"
  | "method_jinghong_dance"
  | "method_qingcheng_charm"
  | "method_qingyin_echo"
  | "method_hujia_cleanse"
  | "method_star_observation"
  | "method_wind_array";

export interface MethodDefinition {
  id: MethodId;
  name: string;
  characterId: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang";
  archetypeId: CardArchetypeId;
  description: string;
  triggerText: string;
  maxLevel?: number;
  upgrades?: Record<number, { description: string; triggerText: string }>;
}

export const methodList: MethodDefinition[] = [
  {
    id: "method_dragon_spear_chain",
    name: "龙胆连势",
    characterId: "zhaoyun",
    archetypeId: "zhao-spear-chain",
    description: "每场战斗首次触发连斩时，额外获得1枪势。",
    triggerText: "首个连斩回响，枪势 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次触发连斩时，额外获得2枪势。",
        triggerText: "进境：首个连斩回响，枪势 +2。"
      }
    }
  },
  {
    id: "method_changban_guard",
    name: "长坂守心",
    characterId: "zhaoyun",
    archetypeId: "zhao-guardian-counter",
    description: "每场战斗首次打出护甲或护主牌时，获得1层护主。",
    triggerText: "首个守势扎稳，护主 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出护甲或护主牌时，获得2层护主。",
        triggerText: "进境：首个守势扎稳，护主 +2。"
      }
    }
  },
  {
    id: "method_jinghong_dance",
    name: "惊鸿舞谱",
    characterId: "diaochan",
    archetypeId: "diao-dance-chain",
    description: "每场战斗首次打出身法牌时，额外获得1舞势。",
    triggerText: "首个身法生风，舞势 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出身法牌时，额外获得2舞势。",
        triggerText: "进境：首个身法生风，舞势 +2。"
      }
    }
  },
  {
    id: "method_qingcheng_charm",
    name: "倾城心诀",
    characterId: "diaochan",
    archetypeId: "diao-charm-control",
    description: "每场战斗首次施加魅惑时，额外施加1层魅惑。",
    triggerText: "首个魅惑入心，魅惑 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次施加魅惑时，额外施加2层魅惑。",
        triggerText: "进境：首个魅惑入心，魅惑 +2。"
      }
    }
  },
  {
    id: "method_qingyin_echo",
    name: "清音回响",
    characterId: "caiwenji",
    archetypeId: "cai-qin-echo",
    description: "每场战斗首次打出琴音或余韵牌时，额外获得1音律。",
    triggerText: "首个清音回响，音律 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出琴音或余韵牌时，额外获得2音律。",
        triggerText: "进境：首个清音回响，音律 +2。"
      }
    }
  },
  {
    id: "method_hujia_cleanse",
    name: "胡笳净心",
    characterId: "caiwenji",
    archetypeId: "cai-cleanse-melody",
    description: "每场战斗首次打出净化牌时，获得3点护甲。",
    triggerText: "首个净心入拍，护甲 +3。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出净化牌时，获得5点护甲。",
        triggerText: "进境：首个净心入拍，护甲 +5。"
      }
    }
  },
  {
    id: "method_star_observation",
    name: "观星定策",
    characterId: "zhugeliang",
    archetypeId: "zhuge-star-control",
    description: "每场战斗首次打出观星牌时，额外获得1筹策。",
    triggerText: "首个星轨入局，筹策 +1。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出观星牌时，额外获得2筹策。",
        triggerText: "进境：首个星轨入局，筹策 +2。"
      }
    }
  },
  {
    id: "method_wind_array",
    name: "借风布阵",
    characterId: "zhugeliang",
    archetypeId: "zhuge-formation-wind",
    description: "每场战斗首次打出阵法牌时，获得3点护甲。",
    triggerText: "首个阵势借风，护甲 +3。",
    maxLevel: 2,
    upgrades: {
      2: {
        description: "每场战斗首次打出阵法牌时，获得5点护甲。",
        triggerText: "进境：首个阵势借风，护甲 +5。"
      }
    }
  }
];

export const methodsById: Record<MethodId, MethodDefinition> = Object.fromEntries(
  methodList.map((method) => [method.id, method])
) as Record<MethodId, MethodDefinition>;
