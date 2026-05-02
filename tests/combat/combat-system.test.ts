import { createRng } from "../../src/game/core/rng";
import {
  createCombat,
  drawCards,
  endPlayerTurn,
  playCard
} from "../../src/game/systems/combat/combat";
import type {
  CardDefinition,
  CharacterDefinition,
  CombatState,
  EnemyDefinition
} from "../../src/game/systems/combat/types";

const strike: CardDefinition = {
  id: "strike",
  name: "素刃",
  cost: 1,
  rarity: "common",
  target: "enemy",
  types: ["attack"],
  effects: [{ action: "damage", amount: 6 }]
};

const heavyStrike: CardDefinition = {
  id: "heavy-strike",
  name: "重斩",
  cost: 4,
  rarity: "common",
  target: "enemy",
  types: ["attack"],
  effects: [{ action: "damage", amount: 18 }]
};

const guard: CardDefinition = {
  id: "guard",
  name: "格挡",
  cost: 1,
  rarity: "common",
  target: "self",
  types: ["skill"],
  effects: [{ action: "block", amount: 7 }]
};

const retainGuard: CardDefinition = {
  id: "retain-guard",
  name: "回身",
  cost: 1,
  rarity: "common",
  retain: true,
  target: "self",
  types: ["skill"],
  effects: [{ action: "block", amount: 4 }]
};

const shadowStep: CardDefinition = {
  id: "shadow-step",
  name: "凌波步",
  cost: 1,
  rarity: "common",
  target: "self",
  types: ["body"],
  effects: [
    { action: "block", amount: 4 },
    { action: "gainResource", amount: 1 },
    { action: "draw", amount: 1 }
  ]
};

const charm: CardDefinition = {
  id: "charm",
  name: "魅影",
  cost: 1,
  rarity: "common",
  target: "enemy",
  types: ["skill"],
  effects: [
    { action: "applyStatus", status: "charm", amount: 2 },
    { action: "gainResource", amount: 1 }
  ]
};

const zhaoYun: CharacterDefinition = {
  id: "zhaoyun",
  name: "赵云",
  maxHp: 82,
  drawPerTurn: 5,
  energyPerTurn: 3,
  resource: { id: "spear", name: "枪势", max: 6, initial: 0 },
  starterDeck: ["strike", "strike", "strike", "guard", "guard"]
};

const diaoChan: CharacterDefinition = {
  id: "diaochan",
  name: "貂蝉",
  maxHp: 68,
  drawPerTurn: 5,
  energyPerTurn: 3,
  resource: { id: "dance", name: "舞势", max: 8, initial: 0 },
  starterDeck: ["strike", "guard", "charm", "shadow-step", "retain-guard"]
};

const bandit: EnemyDefinition = {
  id: "bandit",
  name: "墨化山贼",
  maxHp: 30,
  intents: [{ type: "attack", damage: 8, hits: 1 }]
};

const allCards = [strike, heavyStrike, guard, retainGuard, shadowStep, charm];

function startCombat(character: CharacterDefinition, starterDeck = character.starterDeck): CombatState {
  return createCombat({
    character: { ...character, starterDeck },
    cards: allCards,
    enemies: [bandit],
    rngSeed: 7,
    shuffleDeck: false
  });
}

describe("combat system", () => {
  it("draws through discard when the draw pile is short", () => {
    const state = startCombat(zhaoYun, ["strike"]);
    const firstCard = state.piles.hand[0];
    state.piles.hand = [];
    state.piles.draw = [firstCard];
    state.piles.discard = [
      { instanceId: "discard-a", definitionId: "guard" },
      { instanceId: "discard-b", definitionId: "strike" }
    ];

    drawCards(state, 3, createRng(11));

    expect(state.piles.hand).toHaveLength(3);
    expect(state.piles.draw).toHaveLength(0);
    expect(state.piles.discard).toHaveLength(0);
  });

  it("refuses a card when energy is insufficient and leaves state unchanged", () => {
    const state = startCombat(zhaoYun, ["heavy-strike", "strike", "strike", "guard", "guard"]);
    const beforeEnergy = state.player.energy;
    const beforeEnemyHp = state.enemies[0].hp;
    const card = state.piles.hand.find((item) => item.definitionId === "heavy-strike");

    const result = playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-enough-energy");
    }
    expect(state.player.energy).toBe(beforeEnergy);
    expect(state.enemies[0].hp).toBe(beforeEnemyHp);
    expect(state.piles.hand.some((item) => item.definitionId === "heavy-strike")).toBe(true);
  });

  it("spends energy, damages the target, and discards a normal played card", () => {
    const state = startCombat(zhaoYun);
    const card = state.piles.hand.find((item) => item.definitionId === "strike");

    const result = playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(result.ok).toBe(true);
    expect(state.player.energy).toBe(2);
    expect(state.enemies[0].hp).toBe(24);
    expect(state.piles.discard.some((item) => item.instanceId === card?.instanceId)).toBe(true);
  });

  it("resolves enemy attack intents through block and starts the next player turn", () => {
    const state = startCombat(zhaoYun);
    const card = state.piles.hand.find((item) => item.definitionId === "guard");
    playCard(state, card?.instanceId ?? "", "player");

    endPlayerTurn(state);

    expect(state.turn).toBe(2);
    expect(state.player.hp).toBe(81);
    expect(state.player.block).toBe(0);
    expect(state.player.energy).toBe(3);
    expect(state.piles.hand).toHaveLength(5);
  });

  it("triggers Zhao Yun break-formation on the third attack card", () => {
    const state = startCombat(zhaoYun, ["strike", "strike", "strike", "strike", "guard"]);
    const attacks = state.piles.hand.filter((item) => item.definitionId === "strike");

    playCard(state, attacks[0].instanceId, state.enemies[0].id);
    playCard(state, attacks[1].instanceId, state.enemies[0].id);
    playCard(state, attacks[2].instanceId, state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(8);
    expect(state.player.resource.value).toBe(1);
    expect(state.combatLog).toContain("破阵");
  });

  it("lets Diao Chan charm reduce incoming enemy attack damage", () => {
    const state = startCombat(diaoChan);
    const charmCard = state.piles.hand.find((item) => item.definitionId === "charm");

    playCard(state, charmCard?.instanceId ?? "", state.enemies[0].id);
    endPlayerTurn(state);

    expect(state.enemies[0].statuses.charm).toBe(2);
    expect(state.player.hp).toBe(61);
    expect(state.player.resource.value).toBe(1);
  });

  it("retains cards with retain when the player ends the turn", () => {
    const state = startCombat(diaoChan);

    endPlayerTurn(state);

    expect(state.piles.hand.some((item) => item.definitionId === "retain-guard")).toBe(true);
  });

  it("cycles through enemy behavior table intents", () => {
    const alternatingEnemy: EnemyDefinition = {
      id: "alternating",
      name: "无面兵卒",
      maxHp: 40,
      intents: [
        { type: "attack", damage: 8, hits: 1 },
        { type: "attack", damage: 2, hits: 1 }
      ]
    };
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [alternatingEnemy],
      rngSeed: 9,
      shuffleDeck: false
    });

    endPlayerTurn(state);
    endPlayerTurn(state);

    expect(state.player.hp).toBe(72);
  });
});
