import type { EnemyDefinition } from "../systems/combat/types";

export interface ChapterEnemyDefinition extends EnemyDefinition {
  role: "normal" | "elite" | "boss";
  chapter: "luoshui" | "bamboo" | "changan";
}

export const enemyList: ChapterEnemyDefinition[] = [
  {
    id: "enemy_ink_bandit",
    name: "墨化山贼",
    role: "normal",
    chapter: "luoshui",
    maxHp: 28,
    intents: [
      { type: "attack", damage: 6, hits: 1 },
      { type: "block", block: 5 },
      { type: "attack", damage: 8, hits: 1 }
    ]
  },
  {
    id: "enemy_faceless_soldier",
    name: "无面兵卒",
    role: "normal",
    chapter: "luoshui",
    maxHp: 30,
    intents: [
      { type: "attack", damage: 4, hits: 2 },
      { type: "block", block: 4 },
      { type: "attack", damage: 6, hits: 1 }
    ]
  },
  {
    id: "enemy_paper_umbrella",
    name: "纸伞女鬼",
    role: "normal",
    chapter: "luoshui",
    maxHp: 34,
    intents: [
      {
        type: "special",
        name: "纸伞迷魂",
        effects: [
          { action: "applyStatus", target: "player", status: "weak", amount: 1 },
          { action: "damage", amount: 5, hits: 1 },
          { action: "gainInk", amount: 1 }
        ]
      },
      { type: "block", block: 7 },
      { type: "attack", damage: 7, hits: 1 }
    ]
  },
  {
    id: "elite_sword_echo",
    name: "剑痴残影",
    role: "elite",
    chapter: "luoshui",
    maxHp: 88,
    intents: [
      { type: "attack", damage: 9, hits: 1 },
      {
        type: "special",
        name: "剑心蓄势",
        effects: [
          { action: "block", amount: 10 },
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 }
        ]
      },
      { type: "attack", damage: 22, hits: 1 }
    ]
  },
  {
    id: "elite_blood_banner",
    name: "血旗都尉",
    role: "elite",
    chapter: "luoshui",
    maxHp: 92,
    intents: [
      {
        type: "special",
        name: "血旗号令",
        effects: [
          { action: "block", amount: 14 },
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 }
        ]
      },
      { type: "attack", damage: 7, hits: 2 },
      { type: "block", block: 10 },
      { type: "attack", damage: 15, hits: 1 }
    ]
  },
  {
    id: "boss_ink_dongzhuo",
    name: "墨影董卓",
    role: "boss",
    chapter: "luoshui",
    maxHp: 132,
    intents: [
      {
        type: "special",
        name: "宫宴压迫",
        effects: [
          { action: "damage", amount: 7, hits: 1 },
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 },
          { action: "gainInk", amount: 1 }
        ]
      },
      { type: "block", block: 14 },
      {
        type: "special",
        name: "吞噬权柄",
        effects: [
          { action: "damage", amount: 5, hits: 2 },
          { action: "heal", amount: 8 },
          { action: "gainInk", amount: 1 }
        ]
      },
      { type: "attack", damage: 18, hits: 1 },
      {
        type: "special",
        name: "墨宫倾塌",
        effects: [
          { action: "damage", amount: 7, hits: 3 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "enemy_bamboo_wraith",
    name: "雨竹幽魂",
    role: "normal",
    chapter: "bamboo",
    maxHp: 38,
    intents: [
      {
        type: "special",
        name: "雨竹寒声",
        effects: [
          { action: "addCardToDiscard", cardId: "status_rain_chill", amount: 1 },
          { action: "damage", amount: 5, hits: 1 }
        ]
      },
      { type: "attack", damage: 4, hits: 2 },
      { type: "block", block: 7 }
    ]
  },
  {
    id: "enemy_broken_scholar",
    name: "断笔书生",
    role: "normal",
    chapter: "bamboo",
    maxHp: 42,
    intents: [
      {
        type: "special",
        name: "断笔污卷",
        effects: [
          { action: "addCardToDiscard", cardId: "status_zayin", amount: 2 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      },
      { type: "attack", damage: 9, hits: 1 },
      { type: "block", block: 8 }
    ]
  },
  {
    id: "enemy_bamboo_soldier",
    name: "兵煞竹影",
    role: "normal",
    chapter: "bamboo",
    maxHp: 44,
    intents: [
      { type: "attack", damage: 5, hits: 2 },
      {
        type: "special",
        name: "阵脚不退",
        effects: [
          { action: "block", amount: 9 },
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 }
        ]
      },
      { type: "attack", damage: 12, hits: 1 }
    ]
  },
  {
    id: "elite_qin_score",
    name: "琴魔残谱",
    role: "elite",
    chapter: "bamboo",
    maxHp: 98,
    intents: [
      {
        type: "special",
        name: "残谱回环",
        effects: [
          { action: "addCardToDiscard", cardId: "status_zayin", amount: 2 },
          { action: "block", amount: 12 }
        ]
      },
      {
        type: "special",
        name: "断弦压心",
        effects: [
          { action: "damage", amount: 8, hits: 2 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      },
      { type: "attack", damage: 18, hits: 1 }
    ]
  },
  {
    id: "elite_bamboo_phalanx",
    name: "兵煞竹阵",
    role: "elite",
    chapter: "bamboo",
    maxHp: 104,
    intents: [
      { type: "attack", damage: 7, hits: 3 },
      {
        type: "special",
        name: "竹阵合围",
        effects: [
          { action: "block", amount: 14 },
          { action: "addCardToDiscard", cardId: "status_rain_chill", amount: 1 }
        ]
      },
      { type: "attack", damage: 20, hits: 1 }
    ]
  },
  {
    id: "boss_qin_demon_echo",
    name: "琴魔·残音",
    role: "boss",
    chapter: "bamboo",
    maxHp: 152,
    intents: [
      {
        type: "special",
        name: "断续残拍",
        effects: [
          { action: "damage", amount: 6, hits: 2 },
          { action: "addCardToDiscard", cardId: "status_zayin", amount: 1 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      },
      {
        type: "special",
        name: "悲声回环",
        effects: [
          { action: "block", amount: 16 },
          { action: "addCardToDiscard", cardId: "status_canyin", amount: 2 },
          { action: "heal", amount: 6 }
        ]
      },
      { type: "attack", damage: 10, hits: 2 },
      {
        type: "special",
        name: "绝响不散",
        effects: [
          { action: "damage", amount: 9, hits: 3 },
          { action: "gainInk", amount: 1 },
          { action: "addCardToDiscard", cardId: "status_zayin", amount: 1 }
        ]
      }
    ],
    phaseIntents: [
      {
        phase: "悲声回环",
        thresholdHpRatio: 0.7,
        intents: [
          {
            type: "special",
            name: "悲声回环",
            effects: [
              { action: "block", amount: 18 },
              { action: "addCardToDiscard", cardId: "status_canyin", amount: 2 },
              { action: "heal", amount: 7 }
            ]
          },
          {
            type: "special",
            name: "断弦压心",
            effects: [
              { action: "damage", amount: 8, hits: 2 },
              { action: "applyStatus", target: "player", status: "weak", amount: 1 }
            ]
          }
        ]
      },
      {
        phase: "绝响不散",
        thresholdHpRatio: 0.35,
        intents: [
          {
            type: "special",
            name: "绝响不散",
            effects: [
              { action: "damage", amount: 10, hits: 3 },
              { action: "addCardToDiscard", cardId: "status_canyin", amount: 1 },
              { action: "gainInk", amount: 1 }
            ]
          },
          {
            type: "special",
            name: "乱拍催魂",
            effects: [
              { action: "damage", amount: 7, hits: 2 },
              { action: "addCardToDiscard", cardId: "status_zayin", amount: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "enemy_ink_market_guard",
    name: "墨市守卫",
    role: "normal",
    chapter: "changan",
    maxHp: 48,
    intents: [
      { type: "attack", damage: 8, hits: 1 },
      {
        type: "special",
        name: "市契勒索",
        effects: [
          { action: "addCardToDiscard", cardId: "status_redacted_history", amount: 1 },
          { action: "block", amount: 8 }
        ]
      },
      { type: "attack", damage: 5, hits: 2 }
    ]
  },
  {
    id: "enemy_history_scribe",
    name: "逆史书吏",
    role: "normal",
    chapter: "changan",
    maxHp: 46,
    intents: [
      {
        type: "special",
        name: "朱笔旁批",
        effects: [
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 },
          { action: "addCardToDiscard", cardId: "status_redacted_history", amount: 1 }
        ]
      },
      { type: "attack", damage: 10, hits: 1 },
      { type: "block", block: 9 }
    ]
  },
  {
    id: "enemy_nameless_citizen",
    name: "无名城民",
    role: "normal",
    chapter: "changan",
    maxHp: 44,
    intents: [
      { type: "attack", damage: 4, hits: 3 },
      {
        type: "special",
        name: "众口成史",
        effects: [
          { action: "block", amount: 10 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      },
      { type: "attack", damage: 12, hits: 1 }
    ]
  },
  {
    id: "elite_lubu_shadow",
    name: "吕布墨影",
    role: "elite",
    chapter: "changan",
    maxHp: 118,
    intents: [
      { type: "attack", damage: 9, hits: 2 },
      {
        type: "special",
        name: "方天重压",
        effects: [
          { action: "damage", amount: 18, hits: 1 },
          { action: "applyStatus", target: "player", status: "vulnerable", amount: 1 }
        ]
      },
      { type: "block", block: 16 }
    ]
  },
  {
    id: "elite_memory_stela",
    name: "白袍碑林",
    role: "elite",
    chapter: "changan",
    maxHp: 112,
    intents: [
      {
        type: "special",
        name: "碑文回声",
        effects: [
          { action: "block", amount: 14 },
          { action: "addCardToDiscard", cardId: "status_redacted_history", amount: 2 }
        ]
      },
      { type: "attack", damage: 7, hits: 3 },
      {
        type: "special",
        name: "名册封存",
        effects: [
          { action: "applyStatus", target: "player", status: "weak", amount: 2 },
          { action: "damage", amount: 10, hits: 1 }
        ]
      }
    ]
  },
  {
    id: "boss_scribe_officer",
    name: "墨书执笔官",
    role: "boss",
    chapter: "changan",
    maxHp: 176,
    intents: [
      {
        type: "special",
        name: "记录",
        effects: [
          { action: "block", amount: 16 },
          { action: "addCardToDiscard", cardId: "status_redacted_history", amount: 1 }
        ]
      },
      {
        type: "special",
        name: "改写",
        effects: [
          { action: "damage", amount: 7, hits: 2 },
          { action: "addCardToDiscard", cardId: "status_redacted_history", amount: 2 },
          { action: "applyStatus", target: "player", status: "weak", amount: 1 }
        ]
      },
      {
        type: "special",
        name: "定稿",
        effects: [
          { action: "damage", amount: 12, hits: 2 },
          { action: "gainInk", amount: 2 }
        ]
      }
    ]
  }
];

export const enemiesById: Record<string, ChapterEnemyDefinition> = Object.fromEntries(
  enemyList.map((enemy) => [enemy.id, enemy])
);
