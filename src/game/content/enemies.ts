import type { EnemyDefinition } from "../systems/combat/types";

export interface ChapterEnemyDefinition extends EnemyDefinition {
  role: "normal" | "elite" | "boss";
  chapter: "luoshui";
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
  }
];

export const enemiesById: Record<string, ChapterEnemyDefinition> = Object.fromEntries(
  enemyList.map((enemy) => [enemy.id, enemy])
);
