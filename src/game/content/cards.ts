import type { CardDefinition } from "../systems/combat/types";

export const cardList: CardDefinition[] = [
  {
    id: "zhao_strike",
    name: "枪击",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 6 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成6点伤害，获得1枪势。",
    upgrade: {
      effects: [
        { action: "damage", amount: 9 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成9点伤害，获得1枪势。"
    }
  },
  {
    id: "zhao_guard",
    name: "架枪",
    cost: 1,
    rarity: "starter",
    target: "self",
    character: "zhaoyun",
    types: ["skill"],
    effects: [{ action: "block", amount: 5 }],
    description: "获得5点护甲。",
    upgrade: {
      effects: [{ action: "block", amount: 8 }],
      description: "获得8点护甲。"
    }
  },
  {
    id: "zhao_longdan",
    name: "龙胆",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack", "skill"],
    effects: [
      { action: "damage", amount: 5 },
      { action: "block", amount: 4 }
    ],
    description: "造成5点伤害，获得4点护甲。",
    upgrade: {
      effects: [
        { action: "damage", amount: 7 },
        { action: "block", amount: 6 }
      ],
      description: "造成7点伤害，获得6点护甲。"
    }
  },
  {
    id: "zhao_thrust",
    name: "突刺",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 8 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成8点伤害，获得1枪势。",
    upgrade: {
      effects: [
        { action: "damage", amount: 11 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成11点伤害，获得1枪势。"
    }
  },
  {
    id: "zhao_white_dragon",
    name: "白龙探爪",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 6 },
      { action: "draw", amount: 1 }
    ],
    description: "造成6点伤害，抽1张牌。",
    upgrade: {
      effects: [
        { action: "damage", amount: 8 },
        { action: "draw", amount: 1 }
      ],
      description: "造成8点伤害，抽1张牌。"
    }
  },
  {
    id: "zhao_sweep",
    name: "横扫",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [{ action: "damage", amount: 9 }],
    description: "造成9点伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 13 }],
      description: "造成13点伤害。"
    }
  },
  {
    id: "zhao_guardian",
    name: "护主",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "zhaoyun",
    types: ["skill"],
    effects: [
      { action: "block", amount: 8 },
      { action: "applyStatus", status: "guard", amount: 1 }
    ],
    description: "获得8点护甲和1层护主。",
    upgrade: {
      effects: [
        { action: "block", amount: 11 },
        { action: "applyStatus", status: "guard", amount: 1 }
      ],
      description: "获得11点护甲和1层护主。"
    }
  },
  {
    id: "zhao_stable_formation",
    name: "稳阵",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "zhaoyun",
    types: ["skill"],
    effects: [
      { action: "gainResource", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得1枪势，抽1张牌。",
    upgrade: {
      effects: [
        { action: "gainResource", amount: 2 },
        { action: "draw", amount: 1 }
      ],
      description: "获得2枪势，抽1张牌。"
    }
  },
  {
    id: "zhao_break_spear",
    name: "破军枪",
    cost: 2,
    rarity: "uncommon",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 16 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成16点伤害，获得1枪势。",
    upgrade: {
      effects: [
        { action: "damage", amount: 21 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成21点伤害，获得1枪势。"
    }
  },
  {
    id: "zhao_single_rider",
    name: "单骑救主",
    cost: 2,
    rarity: "rare",
    target: "self",
    character: "zhaoyun",
    types: ["skill"],
    effects: [
      { action: "block", amount: 14 },
      { action: "applyStatus", status: "guard", amount: 2 },
      { action: "draw", amount: 1 }
    ],
    description: "获得14点护甲和2层护主，抽1张牌。",
    upgrade: {
      effects: [
        { action: "block", amount: 18 },
        { action: "applyStatus", status: "guard", amount: 2 },
        { action: "draw", amount: 1 }
      ],
      description: "获得18点护甲和2层护主，抽1张牌。"
    }
  },
  {
    id: "diao_strike",
    name: "素刃",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "diaochan",
    types: ["attack"],
    effects: [{ action: "damage", amount: 6 }],
    description: "造成6点伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 9 }],
      description: "造成9点伤害。"
    }
  },
  {
    id: "diao_guard",
    name: "回袖",
    cost: 1,
    rarity: "starter",
    target: "self",
    character: "diaochan",
    types: ["skill"],
    effects: [{ action: "block", amount: 5 }],
    description: "获得5点护甲。",
    upgrade: {
      effects: [{ action: "block", amount: 8 }],
      description: "获得8点护甲。"
    }
  },
  {
    id: "diao_charm",
    name: "魅影",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "diaochan",
    types: ["skill"],
    effects: [
      { action: "applyStatus", status: "charm", amount: 2 },
      { action: "gainResource", amount: 1 }
    ],
    description: "施加2层魅惑，获得1舞势。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "charm", amount: 3 },
        { action: "gainResource", amount: 1 }
      ],
      description: "施加3层魅惑，获得1舞势。"
    }
  },
  {
    id: "diao_lingbo",
    name: "凌波步",
    cost: 1,
    rarity: "starter",
    target: "self",
    character: "diaochan",
    retain: true,
    types: ["body"],
    effects: [
      { action: "block", amount: 4 },
      { action: "gainResource", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得4点护甲和1舞势，抽1张牌。保留。",
    upgrade: {
      effects: [
        { action: "block", amount: 6 },
        { action: "gainResource", amount: 1 },
        { action: "draw", amount: 1 }
      ],
      description: "获得6点护甲和1舞势，抽1张牌。保留。"
    }
  },
  {
    id: "diao_hongyan",
    name: "红颜",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "diaochan",
    types: ["attack"],
    effects: [{ action: "damage", amount: 8 }],
    description: "造成8点伤害。若目标有魅惑，后续版本会追加伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 12 }],
      description: "造成12点伤害。若目标有魅惑，后续版本会追加伤害。"
    }
  },
  {
    id: "diao_falling_fan",
    name: "落英扇",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "diaochan",
    types: ["attack"],
    effects: [{ action: "damage", amount: 10 }],
    description: "造成10点伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 14 }],
      description: "造成14点伤害。"
    }
  },
  {
    id: "diao_sleeve_blade",
    name: "袖中刃",
    cost: 0,
    rarity: "common",
    target: "enemy",
    character: "diaochan",
    exhaust: true,
    types: ["attack"],
    effects: [{ action: "damage", amount: 4 }],
    description: "造成4点伤害。消耗。",
    upgrade: {
      effects: [{ action: "damage", amount: 7 }],
      description: "造成7点伤害。消耗。"
    }
  },
  {
    id: "diao_glance",
    name: "回眸",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "diaochan",
    types: ["skill"],
    effects: [
      { action: "applyStatus", status: "dodge", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得1层闪避，抽1张牌。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "dodge", amount: 1 },
        { action: "draw", amount: 2 }
      ],
      description: "获得1层闪避，抽2张牌。"
    }
  },
  {
    id: "diao_red_ribbon",
    name: "红绫牵",
    cost: 1,
    rarity: "uncommon",
    target: "enemy",
    character: "diaochan",
    types: ["skill"],
    effects: [
      { action: "applyStatus", status: "charm", amount: 3 },
      { action: "applyStatus", status: "weak", amount: 1 }
    ],
    description: "施加3层魅惑和1层虚弱。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "charm", amount: 4 },
        { action: "applyStatus", status: "weak", amount: 1 }
      ],
      description: "施加4层魅惑和1层虚弱。"
    }
  },
  {
    id: "diao_step_lotus",
    name: "步步生莲",
    cost: 0,
    rarity: "rare",
    target: "self",
    character: "diaochan",
    retain: true,
    exhaust: true,
    types: ["body"],
    effects: [{ action: "gainResource", amount: 2 }],
    description: "获得2舞势。保留，消耗。",
    upgrade: {
      effects: [
        { action: "gainResource", amount: 2 },
        { action: "draw", amount: 1 }
      ],
      description: "获得2舞势，抽1张牌。保留，消耗。"
    }
  },
  {
    id: "common_pifeng",
    name: "劈风",
    cost: 1,
    rarity: "common",
    target: "enemy",
    types: ["attack"],
    effects: [{ action: "damage", amount: 8 }],
    description: "造成8点伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 11 }],
      description: "造成11点伤害。"
    }
  },
  {
    id: "common_duanzhu",
    name: "断竹",
    cost: 1,
    rarity: "common",
    target: "enemy",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 5 },
      { action: "applyStatus", status: "vulnerable", amount: 1 }
    ],
    description: "造成5点伤害，施加1层易伤。",
    upgrade: {
      effects: [
        { action: "damage", amount: 8 },
        { action: "applyStatus", status: "vulnerable", amount: 1 }
      ],
      description: "造成8点伤害，施加1层易伤。"
    }
  },
  {
    id: "common_gedang",
    name: "格挡",
    cost: 1,
    rarity: "common",
    target: "self",
    types: ["skill"],
    effects: [{ action: "block", amount: 7 }],
    description: "获得7点护甲。",
    upgrade: {
      effects: [{ action: "block", amount: 10 }],
      description: "获得10点护甲。"
    }
  },
  {
    id: "common_xieli",
    name: "卸力",
    cost: 1,
    rarity: "common",
    target: "enemy",
    types: ["skill"],
    effects: [
      { action: "block", amount: 5 },
      { action: "applyStatus", status: "weak", amount: 1 }
    ],
    description: "获得5点护甲，施加1层虚弱。",
    upgrade: {
      effects: [
        { action: "block", amount: 8 },
        { action: "applyStatus", status: "weak", amount: 1 }
      ],
      description: "获得8点护甲，施加1层虚弱。"
    }
  },
  {
    id: "common_tuna",
    name: "吐纳",
    cost: 1,
    rarity: "common",
    target: "self",
    types: ["skill"],
    effects: [
      { action: "draw", amount: 1 },
      { action: "block", amount: 2 }
    ],
    description: "抽1张牌，获得2点护甲。",
    upgrade: {
      effects: [
        { action: "draw", amount: 2 },
        { action: "block", amount: 2 }
      ],
      description: "抽2张牌，获得2点护甲。"
    }
  },
  {
    id: "common_qingshen",
    name: "轻身",
    cost: 0,
    rarity: "common",
    target: "self",
    exhaust: true,
    types: ["body"],
    effects: [
      { action: "block", amount: 2 },
      { action: "draw", amount: 1 }
    ],
    description: "获得2点护甲，抽1张牌。消耗。",
    upgrade: {
      effects: [
        { action: "block", amount: 4 },
        { action: "draw", amount: 1 }
      ],
      description: "获得4点护甲，抽1张牌。消耗。"
    }
  },
  {
    id: "mind_jingxin",
    name: "静心",
    cost: 1,
    rarity: "common",
    target: "self",
    types: ["skill", "mind"],
    effects: [
      { action: "setMind", mind: "ning", amount: 1 },
      { action: "block", amount: 6 }
    ],
    description: "进入宁，获得6点护甲。",
    upgrade: {
      effects: [
        { action: "setMind", mind: "ning", amount: 1 },
        { action: "block", amount: 9 }
      ],
      description: "进入宁，获得9点护甲。"
    }
  },
  {
    id: "mind_nuzhan",
    name: "怒斩",
    cost: 1,
    rarity: "common",
    target: "enemy",
    types: ["attack", "mind"],
    effects: [
      { action: "setMind", mind: "nu", amount: 1 },
      { action: "damage", amount: 7 }
    ],
    description: "进入怒，造成7点伤害。",
    upgrade: {
      effects: [
        { action: "setMind", mind: "nu", amount: 1 },
        { action: "damage", amount: 10 }
      ],
      description: "进入怒，造成10点伤害。"
    }
  },
  {
    id: "mind_luanxin",
    name: "乱心",
    cost: 0,
    rarity: "common",
    target: "self",
    exhaust: true,
    types: ["skill", "mind"],
    effects: [
      { action: "setMind", mind: "luan", amount: 1 },
      { action: "draw", amount: 1 },
      { action: "gainInk", amount: 1 }
    ],
    description: "进入乱，抽1张牌，获得1墨痕。消耗。",
    upgrade: {
      effects: [
        { action: "setMind", mind: "luan", amount: 1 },
        { action: "draw", amount: 2 },
        { action: "gainInk", amount: 1 }
      ],
      description: "进入乱，抽2张牌，获得1墨痕。消耗。"
    }
  },
  {
    id: "ink_modian",
    name: "墨点",
    cost: 0,
    rarity: "ink",
    target: "enemy",
    exhaust: true,
    types: ["attack", "ink"],
    effects: [
      { action: "damage", amount: 2 },
      { action: "gainInk", amount: 1 }
    ],
    description: "造成2点伤害，获得1墨痕。消耗。",
    upgrade: {
      effects: [
        { action: "damage", amount: 5 },
        { action: "gainInk", amount: 1 }
      ],
      description: "造成5点伤害，获得1墨痕。消耗。"
    }
  },
  {
    id: "ink_moren",
    name: "墨刃",
    cost: 1,
    rarity: "ink",
    target: "enemy",
    types: ["attack", "ink"],
    effects: [
      { action: "damage", amount: 12 },
      { action: "gainInk", amount: 1 }
    ],
    description: "造成12点伤害，获得1墨痕。",
    upgrade: {
      effects: [
        { action: "damage", amount: 16 },
        { action: "gainInk", amount: 1 }
      ],
      description: "造成16点伤害，获得1墨痕。"
    }
  },
  {
    id: "ink_heiyu",
    name: "黑雨入梦",
    cost: 0,
    rarity: "ink",
    target: "self",
    exhaust: true,
    types: ["skill", "ink", "mind"],
    effects: [
      { action: "setMind", mind: "luan", amount: 1 },
      { action: "draw", amount: 3 },
      { action: "gainInk", amount: 2 }
    ],
    description: "进入乱，抽3张牌，获得2墨痕。消耗。",
    upgrade: {
      effects: [
        { action: "setMind", mind: "luan", amount: 1 },
        { action: "draw", amount: 4 },
        { action: "gainInk", amount: 2 }
      ],
      description: "进入乱，抽4张牌，获得2墨痕。消耗。"
    }
  },
  {
    id: "zhao_qixing_spear",
    name: "七星枪影",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "zhaoyun",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 9 },
      { action: "damage", amount: 9 },
      { action: "gainResource", amount: 2 }
    ],
    description: "造成9点伤害两次，获得2枪势。",
    upgrade: {
      effects: [
        { action: "damage", amount: 11 },
        { action: "damage", amount: 11 },
        { action: "gainResource", amount: 2 }
      ],
      description: "造成11点伤害两次，获得2枪势。"
    }
  },
  {
    id: "zhao_river_guard",
    name: "截江守势",
    cost: 2,
    rarity: "uncommon",
    target: "self",
    character: "zhaoyun",
    types: ["skill"],
    effects: [
      { action: "block", amount: 12 },
      { action: "applyStatus", status: "guard", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得12点护甲和1层护主，抽1张牌。",
    upgrade: {
      effects: [
        { action: "block", amount: 16 },
        { action: "applyStatus", status: "guard", amount: 1 },
        { action: "draw", amount: 1 }
      ],
      description: "获得16点护甲和1层护主，抽1张牌。"
    }
  },
  {
    id: "diao_closed_moon",
    name: "闭月回风",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "diaochan",
    types: ["skill", "body"],
    effects: [
      { action: "applyStatus", status: "charm", amount: 5 },
      { action: "applyStatus", status: "weak", amount: 2 },
      { action: "gainResource", amount: 2 }
    ],
    description: "施加5层魅惑和2层虚弱，获得2舞势。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "charm", amount: 7 },
        { action: "applyStatus", status: "weak", amount: 2 },
        { action: "gainResource", amount: 2 }
      ],
      description: "施加7层魅惑和2层虚弱，获得2舞势。"
    }
  },
  {
    id: "diao_lotus_blade",
    name: "莲步藏锋",
    cost: 1,
    rarity: "uncommon",
    target: "enemy",
    character: "diaochan",
    types: ["attack", "body"],
    effects: [
      { action: "damage", amount: 7 },
      { action: "applyStatus", status: "charm", amount: 1 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成7点伤害，施加1层魅惑，获得1舞势。",
    upgrade: {
      effects: [
        { action: "damage", amount: 10 },
        { action: "applyStatus", status: "charm", amount: 1 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成10点伤害，施加1层魅惑，获得1舞势。"
    }
  },
  {
    id: "common_mirror_armor",
    name: "镜甲",
    cost: 1,
    rarity: "uncommon",
    target: "self",
    types: ["skill"],
    effects: [
      { action: "block", amount: 9 },
      { action: "applyStatus", status: "guard", amount: 1 }
    ],
    description: "获得9点护甲和1层护主。",
    upgrade: {
      effects: [
        { action: "block", amount: 12 },
        { action: "applyStatus", status: "guard", amount: 1 }
      ],
      description: "获得12点护甲和1层护主。"
    }
  },
  {
    id: "ink_luoshui_tide",
    name: "洛水墨潮",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    types: ["attack", "ink"],
    effects: [
      { action: "damage", amount: 20 },
      { action: "gainInk", amount: 2 }
    ],
    description: "造成20点伤害，获得2墨痕。",
    upgrade: {
      effects: [
        { action: "damage", amount: 26 },
        { action: "gainInk", amount: 2 }
      ],
      description: "造成26点伤害，获得2墨痕。"
    }
  }
];

export const cardsById: Record<string, CardDefinition> = Object.fromEntries(
  cardList.map((card) => [card.id, card])
);
