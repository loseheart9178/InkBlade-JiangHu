import type { CardArchetypeId } from "../systems/combat/types";

export type MethodId =
  | "method_dragon_spear_chain"
  | "method_changban_guard"
  | "method_jinghong_dance"
  | "method_qingcheng_charm";

export interface MethodDefinition {
  id: MethodId;
  name: string;
  characterId: "zhaoyun" | "diaochan";
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
  }
];

export const methodsById: Record<MethodId, MethodDefinition> = Object.fromEntries(
  methodList.map((method) => [method.id, method])
) as Record<MethodId, MethodDefinition>;
