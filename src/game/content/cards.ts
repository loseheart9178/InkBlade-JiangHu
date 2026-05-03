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
    archetypes: ["zhao-spear-chain"],
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
    archetypes: ["zhao-spear-chain"],
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
    archetypes: ["zhao-guardian-counter"],
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
    archetypes: ["zhao-guardian-counter"],
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
    archetypes: ["zhao-spear-chain"],
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
    archetypes: ["zhao-guardian-counter"],
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
    archetypes: ["diao-charm-control"],
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
    archetypes: ["diao-dance-chain"],
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
    archetypes: ["diao-charm-control"],
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
    archetypes: ["diao-dance-chain"],
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
    archetypes: ["diao-charm-control"],
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
    archetypes: ["diao-charm-control"],
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
    archetypes: ["diao-dance-chain"],
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
    id: "cai_plain_strike",
    name: "素击",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "caiwenji",
    types: ["attack"],
    effects: [{ action: "damage", amount: 6 }],
    description: "造成6点伤害。",
    upgrade: {
      effects: [{ action: "damage", amount: 9 }],
      description: "造成9点伤害。"
    }
  },
  {
    id: "cai_pluck_string",
    name: "拂弦",
    cost: 1,
    rarity: "starter",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["skill"],
    effects: [
      { action: "block", amount: 5 },
      { action: "gainResource", amount: 1 }
    ],
    description: "获得5点护甲，获得1音律。",
    upgrade: {
      effects: [
        { action: "block", amount: 8 },
        { action: "gainResource", amount: 1 }
      ],
      description: "获得8点护甲，获得1音律。"
    }
  },
  {
    id: "cai_gong_tone",
    name: "宫音",
    cost: 1,
    rarity: "starter",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["attack"],
    effects: [
      { action: "damage", amount: 5 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成5点伤害，获得1音律。",
    upgrade: {
      effects: [
        { action: "damage", amount: 8 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成8点伤害，获得1音律。"
    }
  },
  {
    id: "cai_qingxin_song",
    name: "清心曲",
    cost: 1,
    rarity: "starter",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-qin-echo", "cai-cleanse-melody"],
    keywords: ["qin", "echo"],
    types: ["skill"],
    effects: [
      { action: "block", amount: 5 },
      { action: "gainResource", amount: 1 },
      { action: "queueEcho", effects: [{ action: "block", amount: 3 }] }
    ],
    description: "获得5点护甲和1音律。余韵：下回合获得3点护甲。",
    upgrade: {
      effects: [
        { action: "block", amount: 8 },
        { action: "gainResource", amount: 1 },
        { action: "queueEcho", effects: [{ action: "block", amount: 4 }] }
      ],
      description: "获得8点护甲和1音律。余韵：下回合获得4点护甲。"
    }
  },
  {
    id: "cai_clear_tone",
    name: "清音",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin", "echo"],
    types: ["skill"],
    effects: [
      { action: "block", amount: 6 },
      { action: "gainResource", amount: 1 },
      { action: "queueEcho", effects: [{ action: "block", amount: 3 }] }
    ],
    description: "获得6点护甲和1音律。余韵：下回合获得3点护甲。",
    upgrade: {
      effects: [
        { action: "block", amount: 9 },
        { action: "gainResource", amount: 1 },
        { action: "queueEcho", effects: [{ action: "block", amount: 4 }] }
      ],
      description: "获得9点护甲和1音律。余韵：下回合获得4点护甲。"
    }
  },
  {
    id: "cai_broken_string",
    name: "断弦",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["attack"],
    effects: [
      { action: "damage", amount: 7 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成7点伤害，获得1音律。",
    upgrade: {
      effects: [
        { action: "damage", amount: 10 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成10点伤害，获得1音律。"
    }
  },
  {
    id: "cai_echoing_melody",
    name: "余韵",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin", "echo"],
    types: ["skill"],
    effects: [
      { action: "block", amount: 4 },
      { action: "gainResource", amount: 1 },
      { action: "queueEcho", effects: [{ action: "block", amount: 4 }] }
    ],
    description: "获得4点护甲和1音律。余韵：下回合获得4点护甲。",
    upgrade: {
      effects: [
        { action: "block", amount: 6 },
        { action: "gainResource", amount: 1 },
        { action: "queueEcho", effects: [{ action: "block", amount: 5 }] }
      ],
      description: "获得6点护甲和1音律。余韵：下回合获得5点护甲。"
    }
  },
  {
    id: "cai_five_tones_start",
    name: "五音初起",
    cost: 1,
    rarity: "uncommon",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["skill"],
    effects: [
      { action: "gainResource", amount: 2 },
      { action: "draw", amount: 1 }
    ],
    description: "获得2音律，抽1张牌。",
    upgrade: {
      effects: [
        { action: "gainResource", amount: 2 },
        { action: "draw", amount: 2 }
      ],
      description: "获得2音律，抽2张牌。"
    }
  },
  {
    id: "cai_hujia_beat",
    name: "胡笳一拍",
    cost: 2,
    rarity: "uncommon",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin", "echo"],
    types: ["attack"],
    effects: [
      { action: "damage", amount: 5 },
      { action: "damage", amount: 5 },
      { action: "damage", amount: 5 },
      { action: "gainResource", amount: 1 },
      { action: "queueEcho", effects: [{ action: "damage", amount: 5 }] }
    ],
    description: "造成5点伤害3次，获得1音律。余韵：下回合造成5点伤害。",
    upgrade: {
      effects: [
        { action: "damage", amount: 6 },
        { action: "damage", amount: 6 },
        { action: "damage", amount: 6 },
        { action: "gainResource", amount: 1 },
        { action: "queueEcho", effects: [{ action: "damage", amount: 6 }] }
      ],
      description: "造成6点伤害3次，获得1音律。余韵：下回合造成6点伤害。"
    }
  },
  {
    id: "cai_listen_still",
    name: "静听",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-cleanse-melody"],
    keywords: ["qin"],
    types: ["skill"],
    effects: [
      { action: "block", amount: 3 },
      { action: "gainResource", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得3点护甲和1音律，抽1张牌。",
    upgrade: {
      effects: [
        { action: "block", amount: 5 },
        { action: "gainResource", amount: 1 },
        { action: "draw", amount: 1 }
      ],
      description: "获得5点护甲和1音律，抽1张牌。"
    }
  },
  {
    id: "cai_soul_ferry",
    name: "渡魂曲",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-cleanse-melody"],
    keywords: ["qin"],
    types: ["skill", "attack"],
    effects: [
      { action: "damage", amount: 10 },
      { action: "applyStatus", status: "weak", amount: 2 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成10点伤害，施加2层虚弱，获得1音律。",
    upgrade: {
      effects: [
        { action: "damage", amount: 14 },
        { action: "applyStatus", status: "weak", amount: 2 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成14点伤害，施加2层虚弱，获得1音律。"
    }
  },
  {
    id: "cai_clean_string",
    name: "净弦",
    cost: 1,
    rarity: "uncommon",
    target: "self",
    character: "caiwenji",
    archetypes: ["cai-cleanse-melody"],
    keywords: ["qin", "cleanse"],
    types: ["skill"],
    effects: [
      { action: "cleanseCards", amount: 1 },
      { action: "gainResource", amount: 1 },
      { action: "block", amount: 4 }
    ],
    description: "净化1张状态或诅咒牌，获得1音律和4点护甲。",
    upgrade: {
      effects: [
        { action: "cleanseCards", amount: 2 },
        { action: "gainResource", amount: 1 },
        { action: "block", amount: 6 }
      ],
      description: "净化2张状态或诅咒牌，获得1音律和6点护甲。"
    }
  },
  {
    id: "cai_shang_tone",
    name: "商音",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["attack"],
    effects: [
      { action: "damage", amount: 4 },
      { action: "damage", amount: 4 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成4点伤害2次，获得1音律。",
    upgrade: {
      effects: [
        { action: "damage", amount: 5 },
        { action: "damage", amount: 5 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成5点伤害2次，获得1音律。"
    }
  },
  {
    id: "cai_final_song",
    name: "终曲",
    cost: 3,
    rarity: "rare",
    target: "enemy",
    character: "caiwenji",
    archetypes: ["cai-qin-echo"],
    keywords: ["qin"],
    types: ["attack"],
    effects: [
      { action: "damage", amount: 24 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成24点伤害，获得1音律。",
    upgrade: {
      effects: [
        { action: "damage", amount: 30 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成30点伤害，获得1音律。"
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
    id: "common_feishi",
    name: "飞石",
    cost: 0,
    rarity: "common",
    target: "enemy",
    exhaust: true,
    types: ["attack"],
    effects: [{ action: "damage", amount: 3 }],
    description: "造成3点伤害。消耗。低费起手，适合接入连斩或断招。",
    upgrade: {
      effects: [
        { action: "damage", amount: 5 },
        { action: "draw", amount: 1 }
      ],
      description: "造成5点伤害，抽1张牌。消耗。"
    }
  },
  {
    id: "common_zhuiying",
    name: "追影",
    cost: 1,
    rarity: "uncommon",
    target: "enemy",
    types: ["body", "attack"],
    effects: [
      { action: "block", amount: 3 },
      { action: "damage", amount: 5 }
    ],
    description: "获得3点护甲，造成5点伤害。身法入攻，可自行成链。",
    upgrade: {
      effects: [
        { action: "block", amount: 5 },
        { action: "damage", amount: 7 }
      ],
      description: "获得5点护甲，造成7点伤害。身法入攻，可自行成链。"
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
    id: "common_jiexue",
    name: "解穴",
    cost: 1,
    rarity: "common",
    target: "self",
    types: ["skill"],
    effects: [
      { action: "cleanseCards", amount: 2 },
      { action: "block", amount: 4 }
    ],
    description: "净化至多2张状态或诅咒牌，获得4点护甲。对抗竹林琴音污染的基础手段。",
    upgrade: {
      effects: [
        { action: "cleanseCards", amount: 3 },
        { action: "block", amount: 6 },
        { action: "draw", amount: 1 }
      ],
      description: "净化至多3张状态或诅咒牌，获得6点护甲，抽1张牌。"
    }
  },
  {
    id: "common_xixin",
    name: "洗心",
    cost: 1,
    rarity: "uncommon",
    target: "self",
    types: ["skill", "mind"],
    effects: [
      { action: "cleanseCards", amount: 3 },
      { action: "setMind", mind: "ning", amount: 1 },
      { action: "block", amount: 5 }
    ],
    description: "净化至多3张状态或诅咒牌，进入宁，获得5点护甲。",
    upgrade: {
      effects: [
        { action: "cleanseCards", amount: 4 },
        { action: "setMind", mind: "ning", amount: 1 },
        { action: "block", amount: 8 }
      ],
      description: "净化至多4张状态或诅咒牌，进入宁，获得8点护甲。"
    }
  },
  {
    id: "status_zayin",
    name: "杂音",
    cost: 1,
    rarity: "status",
    target: "self",
    types: ["skill"],
    effects: [{ action: "applyStatus", status: "weak", amount: 1 }],
    temporary: true,
    description: "打出：获得1层虚弱。来自琴魔与雨声的污染。"
  },
  {
    id: "status_rain_chill",
    name: "雨寒",
    cost: 1,
    rarity: "status",
    target: "self",
    types: ["skill"],
    effects: [{ action: "applyStatus", status: "vulnerable", amount: 1 }],
    temporary: true,
    description: "打出：获得1层易伤。雨声把旧伤重新写开。"
  },
  {
    id: "status_canyin",
    name: "残音",
    cost: 1,
    rarity: "status",
    target: "self",
    types: ["skill", "ink"],
    effects: [{ action: "gainInk", amount: 1 }],
    temporary: true,
    description: "打出：获得1层墨痕。琴声不肯散去。"
  },
  {
    id: "status_redacted_history",
    name: "涂史",
    cost: 1,
    rarity: "status",
    target: "self",
    types: ["skill", "ink"],
    effects: [
      { action: "gainInk", amount: 1 },
      { action: "applyStatus", status: "vulnerable", amount: 1 }
    ],
    temporary: true,
    description: "打出：获得1层墨痕和1层易伤。墨书执笔官改写过的残页。"
  },
  {
    id: "zhao_qixing_spear",
    name: "七星枪影",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "zhaoyun",
    archetypes: ["zhao-spear-chain"],
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
    archetypes: ["zhao-guardian-counter"],
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
    id: "zhao_seven_entries",
    name: "七进七出",
    cost: 2,
    rarity: "uncommon",
    target: "enemy",
    character: "zhaoyun",
    archetypes: ["zhao-spear-chain"],
    visualCue: "zhao-seven-entries",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 4 },
      { action: "damage", amount: 4 },
      { action: "damage", amount: 4 },
      { action: "damage", amount: 4 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成4点伤害四次，获得1枪势。适合连续破阵。",
    upgrade: {
      effects: [
        { action: "damage", amount: 5 },
        { action: "damage", amount: 5 },
        { action: "damage", amount: 5 },
        { action: "damage", amount: 5 },
        { action: "gainResource", amount: 1 }
      ],
      description: "造成5点伤害四次，获得1枪势。适合连续破阵。"
    }
  },
  {
    id: "zhao_white_horse_breakout",
    name: "白马突围",
    cost: 1,
    rarity: "uncommon",
    target: "self",
    character: "zhaoyun",
    archetypes: ["zhao-spear-chain"],
    types: ["skill"],
    effects: [
      { action: "gainResource", amount: 1 },
      { action: "draw", amount: 1 },
      { action: "block", amount: 3 }
    ],
    description: "获得1枪势，抽1张牌，获得3点护甲。为下一轮突进蓄路。",
    upgrade: {
      effects: [
        { action: "gainResource", amount: 1 },
        { action: "draw", amount: 2 },
        { action: "block", amount: 4 }
      ],
      description: "获得1枪势，抽2张牌，获得4点护甲。为下一轮突进蓄路。"
    }
  },
  {
    id: "zhao_return_spear",
    name: "回马枪",
    cost: 1,
    rarity: "common",
    target: "enemy",
    character: "zhaoyun",
    archetypes: ["zhao-guardian-counter"],
    types: ["skill", "attack"],
    effects: [
      { action: "block", amount: 5 },
      { action: "damage", amount: 6 }
    ],
    description: "获得5点护甲，造成6点伤害。守势中藏反击。",
    upgrade: {
      effects: [
        { action: "block", amount: 7 },
        { action: "damage", amount: 8 }
      ],
      description: "获得7点护甲，造成8点伤害。守势中藏反击。"
    }
  },
  {
    id: "zhao_spear_wall",
    name: "枪围如墙",
    cost: 2,
    rarity: "uncommon",
    target: "self",
    character: "zhaoyun",
    archetypes: ["zhao-guardian-counter"],
    visualCue: "zhao-spear-wall",
    types: ["skill"],
    effects: [
      { action: "block", amount: 13 },
      { action: "applyStatus", status: "guard", amount: 1 },
      { action: "gainResource", amount: 1 }
    ],
    description: "获得13点护甲、1层护主和1枪势。",
    upgrade: {
      effects: [
        { action: "block", amount: 17 },
        { action: "applyStatus", status: "guard", amount: 2 },
        { action: "gainResource", amount: 1 }
      ],
      description: "获得17点护甲、2层护主和1枪势。"
    }
  },
  {
    id: "diao_closed_moon",
    name: "闭月回风",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "diaochan",
    archetypes: ["diao-charm-control"],
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
    archetypes: ["diao-dance-chain"],
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
    id: "diao_jinghong_strike",
    name: "惊鸿一击",
    cost: 2,
    rarity: "rare",
    target: "enemy",
    character: "diaochan",
    archetypes: ["diao-dance-chain"],
    visualCue: "diao-jinghong-strike",
    types: ["attack"],
    effects: [
      { action: "damage", amount: 14 },
      { action: "gainResource", amount: 1 }
    ],
    description: "造成14点伤害，获得1舞势。舞势流的终结手。",
    upgrade: {
      effects: [
        { action: "damage", amount: 18 },
        { action: "gainResource", amount: 2 }
      ],
      description: "造成18点伤害，获得2舞势。舞势流的终结手。"
    }
  },
  {
    id: "diao_flying_sleeves",
    name: "飞袖连环",
    cost: 1,
    rarity: "common",
    target: "self",
    character: "diaochan",
    archetypes: ["diao-dance-chain"],
    types: ["body"],
    effects: [
      { action: "block", amount: 4 },
      { action: "gainResource", amount: 1 },
      { action: "draw", amount: 1 }
    ],
    description: "获得4点护甲和1舞势，抽1张牌。",
    upgrade: {
      effects: [
        { action: "block", amount: 6 },
        { action: "gainResource", amount: 1 },
        { action: "draw", amount: 1 }
      ],
      description: "获得6点护甲和1舞势，抽1张牌。"
    }
  },
  {
    id: "diao_lijian",
    name: "离间",
    cost: 1,
    rarity: "uncommon",
    target: "enemy",
    character: "diaochan",
    archetypes: ["diao-charm-control"],
    visualCue: "diao-lijian",
    types: ["skill"],
    effects: [
      { action: "applyStatus", status: "charm", amount: 4 },
      { action: "applyStatus", status: "weak", amount: 1 }
    ],
    description: "施加4层魅惑和1层虚弱。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "charm", amount: 5 },
        { action: "applyStatus", status: "weak", amount: 1 },
        { action: "draw", amount: 1 }
      ],
      description: "施加5层魅惑和1层虚弱，抽1张牌。"
    }
  },
  {
    id: "diao_mirror_flower",
    name: "镜中花",
    cost: 2,
    rarity: "uncommon",
    target: "enemy",
    character: "diaochan",
    archetypes: ["diao-charm-control"],
    types: ["skill"],
    effects: [
      { action: "applyStatus", status: "charm", amount: 2 },
      { action: "block", amount: 10 },
      { action: "draw", amount: 1 }
    ],
    description: "施加2层魅惑，获得10点护甲，抽1张牌。",
    upgrade: {
      effects: [
        { action: "applyStatus", status: "charm", amount: 3 },
        { action: "block", amount: 13 },
        { action: "draw", amount: 1 }
      ],
      description: "施加3层魅惑，获得13点护甲，抽1张牌。"
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
