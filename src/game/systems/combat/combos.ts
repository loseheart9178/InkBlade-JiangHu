import type { ComboRule } from "./types";

export const defaultComboRules: ComboRule[] = [
  {
    id: "lianzhan",
    name: "连斩",
    sequence: ["attack", "attack", "attack"],
    effects: [{ action: "damage", amount: 4 }],
    tone: "red"
  },
  {
    id: "xushi",
    name: "蓄势",
    sequence: ["skill", "attack"],
    effects: [{ action: "damage", amount: 3 }],
    tone: "gold"
  },
  {
    id: "zhuiying",
    name: "追影",
    sequence: ["body", "attack"],
    effects: [
      { action: "block", amount: 2 },
      { action: "damage", amount: 2 }
    ],
    tone: "teal"
  },
  {
    id: "jingshou",
    name: "静守",
    sequence: ["mind", "skill"],
    effects: [{ action: "block", amount: 3 }],
    tone: "teal"
  },
  {
    id: "xinren",
    name: "心刃",
    sequence: ["mind", "attack"],
    effects: [{ action: "damage", amount: 3 }],
    tone: "gold"
  },
  {
    id: "gushou",
    name: "固守",
    sequence: ["skill", "skill", "skill"],
    effects: [{ action: "block", amount: 6 }],
    tone: "teal"
  },
  {
    id: "moxi",
    name: "墨袭",
    sequence: ["ink", "attack"],
    effects: [
      { action: "damage", amount: 5 },
      { action: "gainInk", amount: 1 }
    ],
    tone: "ink"
  }
];

export const exhaustAttackComboRule: ComboRule = {
  id: "duanzhao",
  name: "断招",
  sequence: ["attack"],
  effects: [{ action: "draw", amount: 1 }],
  tone: "neutral"
};
