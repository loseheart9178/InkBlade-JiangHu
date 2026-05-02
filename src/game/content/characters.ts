import type { CharacterDefinition } from "../systems/combat/types";

export const characterList: CharacterDefinition[] = [
  {
    id: "zhaoyun",
    name: "赵云",
    maxHp: 82,
    energyPerTurn: 3,
    drawPerTurn: 5,
    resource: {
      id: "spear",
      name: "枪势",
      max: 6,
      initial: 0
    },
    starterDeck: [
      "zhao_strike",
      "zhao_strike",
      "zhao_strike",
      "zhao_strike",
      "zhao_strike",
      "zhao_guard",
      "zhao_guard",
      "zhao_guard",
      "zhao_guard",
      "zhao_longdan"
    ]
  },
  {
    id: "diaochan",
    name: "貂蝉",
    maxHp: 68,
    energyPerTurn: 3,
    drawPerTurn: 5,
    resource: {
      id: "dance",
      name: "舞势",
      max: 8,
      initial: 0
    },
    starterDeck: [
      "diao_strike",
      "diao_strike",
      "diao_strike",
      "diao_strike",
      "diao_guard",
      "diao_guard",
      "diao_guard",
      "diao_guard",
      "diao_charm",
      "diao_lingbo"
    ]
  }
];

export const charactersById: Record<string, CharacterDefinition> = Object.fromEntries(
  characterList.map((character) => [character.id, character])
);

