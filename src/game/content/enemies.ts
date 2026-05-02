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
    maxHp: 30,
    intents: [
      { type: "attack", damage: 7, hits: 1 },
      { type: "block", block: 5 }
    ]
  },
  {
    id: "enemy_faceless_soldier",
    name: "无面兵卒",
    role: "normal",
    chapter: "luoshui",
    maxHp: 26,
    intents: [
      { type: "attack", damage: 4, hits: 2 },
      { type: "attack", damage: 6, hits: 1 }
    ]
  },
  {
    id: "enemy_paper_umbrella",
    name: "纸伞女鬼",
    role: "normal",
    chapter: "luoshui",
    maxHp: 30,
    intents: [
      { type: "attack", damage: 5, hits: 1 },
      { type: "block", block: 6 }
    ]
  },
  {
    id: "elite_sword_echo",
    name: "剑痴残影",
    role: "elite",
    chapter: "luoshui",
    maxHp: 82,
    intents: [
      { type: "attack", damage: 10, hits: 1 },
      { type: "block", block: 12 },
      { type: "attack", damage: 18, hits: 1 }
    ]
  },
  {
    id: "elite_blood_banner",
    name: "血旗都尉",
    role: "elite",
    chapter: "luoshui",
    maxHp: 72,
    intents: [
      { type: "block", block: 12 },
      { type: "attack", damage: 7, hits: 2 },
      { type: "attack", damage: 14, hits: 1 }
    ]
  },
  {
    id: "boss_ink_dongzhuo",
    name: "墨影董卓",
    role: "boss",
    chapter: "luoshui",
    maxHp: 96,
    intents: [
      { type: "attack", damage: 9, hits: 1 },
      { type: "block", block: 12 },
      { type: "attack", damage: 5, hits: 2 },
      { type: "attack", damage: 16, hits: 1 }
    ]
  }
];

export const enemiesById: Record<string, ChapterEnemyDefinition> = Object.fromEntries(
  enemyList.map((enemy) => [enemy.id, enemy])
);
