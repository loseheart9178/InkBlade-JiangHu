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

const mindFocus: CardDefinition = {
  id: "mind-focus",
  name: "静心",
  cost: 0,
  rarity: "common",
  target: "self",
  types: ["mind"],
  effects: [{ action: "setMind", mind: "ning" }]
};

const inkPrep: CardDefinition = {
  id: "ink-prep",
  name: "墨引",
  cost: 0,
  rarity: "ink",
  target: "self",
  types: ["ink"],
  effects: [{ action: "gainInk", amount: 1 }]
};

const statusNoise: CardDefinition = {
  id: "status_zayin",
  name: "杂音",
  cost: 1,
  rarity: "status",
  target: "self",
  types: ["skill"],
  effects: [{ action: "applyStatus", status: "weak", amount: 1 }]
};

const vanish: CardDefinition = {
  id: "vanish",
  name: "隐锋",
  cost: 0,
  rarity: "common",
  target: "self",
  types: ["power"],
  effects: [],
  exhaust: true
};

const signatureSpearArt: CardDefinition = {
  id: "signature-spear-art",
  name: "七进七出",
  cost: 1,
  rarity: "uncommon",
  target: "enemy",
  types: ["attack"],
  effects: [{ action: "damage", amount: 4 }]
} as CardDefinition;
(signatureSpearArt as CardDefinition & { visualCue: string }).visualCue = "zhao-seven-entries";

const qinTone = {
  id: "qin-tone",
  name: "清心曲",
  cost: 0,
  rarity: "common",
  target: "self",
  character: "caiwenji",
  types: ["skill"],
  keywords: ["qin", "echo"],
  effects: [
    { action: "gainResource", amount: 1 },
    { action: "queueEcho", effects: [{ action: "block", amount: 2 }] }
  ]
} as unknown as CardDefinition;

const zhugeScry = {
  id: "zhuge-scry",
  name: "观星",
  cost: 0,
  rarity: "common",
  target: "self",
  character: "zhugeliang",
  types: ["skill"],
  keywords: ["scry"],
  effects: [
    { action: "scry", amount: 2 },
    { action: "gainResource", amount: 1 }
  ]
} as unknown as CardDefinition;

const zhugeEightFormation = {
  id: "zhuge-eight-formation",
  name: "八阵",
  cost: 1,
  rarity: "common",
  target: "self",
  character: "zhugeliang",
  types: ["skill"],
  keywords: ["formation"],
  effects: [
    { action: "block", amount: 4 },
    { action: "setFormation", formation: "eight", name: "八阵", duration: 3, blockAtTurnEnd: 2 },
    { action: "gainResource", amount: 1 }
  ]
} as unknown as CardDefinition;

const zhugeFireFormation = {
  id: "zhuge-fire-formation",
  name: "火阵",
  cost: 1,
  rarity: "common",
  target: "self",
  character: "zhugeliang",
  types: ["skill"],
  keywords: ["formation"],
  effects: [
    { action: "setFormation", formation: "fire", name: "火阵", duration: 2, damageAtTurnEnd: 3 },
    { action: "gainResource", amount: 1 }
  ]
} as unknown as CardDefinition;

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

const caiWenji: CharacterDefinition = {
  id: "caiwenji",
  name: "蔡文姬",
  maxHp: 72,
  drawPerTurn: 5,
  energyPerTurn: 3,
  resource: { id: "sound", name: "音律", max: 10, initial: 0 },
  starterDeck: ["qin-tone", "qin-tone", "qin-tone", "qin-tone", "guard"]
};

const zhugeLiang: CharacterDefinition = {
  id: "zhugeliang",
  name: "诸葛亮",
  maxHp: 66,
  drawPerTurn: 5,
  energyPerTurn: 3,
  resource: { id: "strategy", name: "筹策", max: 9, initial: 1 },
  starterDeck: ["zhuge-scry", "zhuge-eight-formation", "zhuge-fire-formation", "strike", "guard", "heavy-strike", "retain-guard"]
};

const bandit: EnemyDefinition = {
  id: "bandit",
  name: "墨化山贼",
  maxHp: 30,
  intents: [{ type: "attack", damage: 8, hits: 1 }]
};

const allCards = [
  strike,
  heavyStrike,
  guard,
  retainGuard,
  shadowStep,
  charm,
  mindFocus,
  inkPrep,
  statusNoise,
  vanish,
  signatureSpearArt,
  qinTone,
  zhugeScry,
  zhugeEightFormation,
  zhugeFireFormation
];

function startCombat(character: CharacterDefinition, starterDeck = character.starterDeck): CombatState {
  return createCombat({
    character: { ...character, starterDeck },
    cards: allCards,
    enemies: [bandit],
    rngSeed: 7,
    shuffleDeck: false
  });
}

function startCombatWithRelics(character: CharacterDefinition, relicIds: string[], starterDeck = character.starterDeck): CombatState {
  return createCombat({
    character: { ...character, starterDeck },
    cards: allCards,
    enemies: [bandit],
    rngSeed: 7,
    relicIds,
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

  it("emits readable visual events for player damage and block", () => {
    const state = startCombat(zhaoYun);
    const strikeCard = state.piles.hand.find((item) => item.definitionId === "strike");
    const guardCard = state.piles.hand.find((item) => item.definitionId === "guard");

    playCard(state, strikeCard?.instanceId ?? "", state.enemies[0].id);
    playCard(state, guardCard?.instanceId ?? "", "player");

    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "damage", target: "enemy", label: "-6" }),
        expect.objectContaining({ kind: "block", target: "player", label: "+7 护甲" })
      ])
    );
  });

  it("emits visual events for status applications and incoming enemy damage", () => {
    const state = startCombat(diaoChan);
    const charmCard = state.piles.hand.find((item) => item.definitionId === "charm");

    playCard(state, charmCard?.instanceId ?? "", state.enemies[0].id);
    endPlayerTurn(state);

    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "status", target: "enemy", label: "魅惑 +2" }),
        expect.objectContaining({ kind: "damage", target: "player", label: "-7" })
      ])
    );
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

    expect(state.enemies[0].hp).toBe(4);
    expect(state.player.resource.value).toBe(1);
    expect(state.combatLog).toContain("连斩");
    expect(state.combatLog).toContain("破阵");
  });

  it("triggers skill into attack combo for extra damage once per turn", () => {
    const state = startCombat(zhaoYun, ["guard", "strike", "strike", "strike", "guard"]);
    const guardCard = state.piles.hand.find((item) => item.definitionId === "guard");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, guardCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(21);
    expect(state.combatLog).toContain("蓄势");
    expect(state.visualEvents).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "trigger", label: "蓄势" })]));
  });

  it("keeps combat-wide combo memory after the turn combo trail resets", () => {
    const state = startCombat(zhaoYun, ["guard", "strike", "guard", "guard", "guard", "strike"]);
    const guardCard = state.piles.hand.find((item) => item.definitionId === "guard");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, guardCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.comboTriggersThisTurn).toEqual(["xushi"]);
    expect(state.comboTriggersThisCombat).toEqual(["xushi"]);

    endPlayerTurn(state);

    expect(state.comboTriggersThisTurn).toEqual([]);
    expect(state.comboTriggersThisCombat).toEqual(["xushi"]);
  });

  it("triggers body into attack combo with block and extra damage", () => {
    const state = startCombat(diaoChan, ["shadow-step", "strike", "guard", "guard", "guard"]);
    const bodyCard = state.piles.hand.find((item) => item.definitionId === "shadow-step");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, bodyCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(22);
    expect(state.player.block).toBe(6);
    expect(state.combatLog).toContain("追影");
  });

  it("triggers mind into skill combo as defensive follow-through", () => {
    const state = startCombat(zhaoYun, ["mind-focus", "guard", "strike", "strike", "strike"]);
    const mindCard = state.piles.hand.find((item) => item.definitionId === "mind-focus");
    const guardCard = state.piles.hand.find((item) => item.definitionId === "guard");

    playCard(state, mindCard?.instanceId ?? "", "player");
    playCard(state, guardCard?.instanceId ?? "", "player");

    expect(state.player.block).toBe(12);
    expect(state.combatLog).toContain("静守");
  });

  it("triggers mind into attack combo for heart-blade damage", () => {
    const state = startCombat(zhaoYun, ["mind-focus", "strike", "guard", "guard", "guard"]);
    const mindCard = state.piles.hand.find((item) => item.definitionId === "mind-focus");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, mindCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(21);
    expect(state.combatLog).toContain("心刃");
  });

  it("triggers three skills combo as stable guarding", () => {
    const state = startCombat(zhaoYun, ["guard", "guard", "guard", "strike", "strike"]);
    const skills = state.piles.hand.filter((item) => item.definitionId === "guard");

    playCard(state, skills[0].instanceId, "player");
    playCard(state, skills[1].instanceId, "player");
    playCard(state, skills[2].instanceId, "player");

    expect(state.player.block).toBe(27);
    expect(state.combatLog).toContain("固守");
  });

  it("triggers ink into attack combo with extra damage and ink cost", () => {
    const state = startCombat(zhaoYun, ["ink-prep", "strike", "guard", "guard", "guard"]);
    const inkCard = state.piles.hand.find((item) => item.definitionId === "ink-prep");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, inkCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(19);
    expect(state.player.inkMarks).toBe(2);
    expect(state.combatLog).toContain("墨袭");
  });

  it("triggers exhausted-card into attack combo to draw a card", () => {
    const state = startCombat(zhaoYun, ["vanish", "strike", "guard", "guard", "guard", "strike"]);
    const exhaustCard = state.piles.hand.find((item) => item.definitionId === "vanish");
    const attackCard = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, exhaustCard?.instanceId ?? "", "player");
    playCard(state, attackCard?.instanceId ?? "", state.enemies[0].id);

    expect(state.piles.hand).toHaveLength(4);
    expect(state.piles.exhaust.some((item) => item.definitionId === "vanish")).toBe(true);
    expect(state.combatLog).toContain("断招");
  });

  it("emits source-aware visual cues when a signature martial card is played", () => {
    const state = startCombat(zhaoYun, ["signature-spear-art", "guard", "guard", "guard", "guard"]);
    const card = state.piles.hand.find((item) => item.definitionId === "signature-spear-art");

    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.combatLog).toContain("七进七出");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "trigger",
          target: "center",
          label: "七进七出",
          sourceCardId: "signature-spear-art",
          visualCue: "zhao-seven-entries"
        })
      ])
    );
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

  it("lets Cai Wenji gain sound from qin cards and trigger at most three echoes next player turn", () => {
    const state = startCombat(caiWenji);
    const tones = state.piles.hand.filter((item) => item.definitionId === "qin-tone");

    for (const card of tones) {
      playCard(state, card.instanceId, "player");
    }

    expect(state.player.resource.name).toBe("音律");
    expect(state.player.resource.value).toBe(4);
    expect((state as CombatState & { echoQueue?: unknown[] }).echoQueue).toHaveLength(3);

    endPlayerTurn(state);

    expect(state.turn).toBe(2);
    expect(state.player.block).toBe(6);
    expect((state as CombatState & { echoQueue?: unknown[] }).echoQueue).toHaveLength(0);
    expect(state.combatLog).toContain("余韵");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "trigger", target: "player", label: "余韵" }),
        expect.objectContaining({ kind: "block", target: "player", label: "+2 护甲" })
      ])
    );
  });

  it("lets Zhuge Liang gain strategy and record scry feedback from observing stars", () => {
    const state = startCombat(zhugeLiang);
    const card = state.piles.hand.find((item) => item.definitionId === "zhuge-scry");

    playCard(state, card?.instanceId ?? "", "player");

    expect(state.player.resource.name).toBe("筹策");
    expect(state.player.resource.value).toBe(2);
    expect(state.combatLog).toContain("观星");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "trigger", target: "player", label: "观星" })
      ])
    );
    expect(state.piles.draw.map((item) => item.definitionId)).toEqual(["retain-guard", "heavy-strike"]);
  });

  it("lets Zhuge Liang keep exactly one active formation and replace it with a new one", () => {
    const state = startCombat(zhugeLiang);
    const eight = state.piles.hand.find((item) => item.definitionId === "zhuge-eight-formation");
    const fire = state.piles.hand.find((item) => item.definitionId === "zhuge-fire-formation");

    playCard(state, eight?.instanceId ?? "", "player");
    expect((state as CombatState & { activeFormation?: { id: string; name: string; duration: number } }).activeFormation).toMatchObject({
      id: "eight",
      name: "八阵",
      duration: 3
    });

    playCard(state, fire?.instanceId ?? "", "player");

    expect((state as CombatState & { activeFormation?: { id: string; name: string; duration: number } }).activeFormation).toMatchObject({
      id: "fire",
      name: "火阵",
      duration: 2
    });
    expect(state.combatLog.filter((entry) => entry.includes("阵"))).toEqual(["八阵", "火阵"]);
  });

  it("triggers Zhuge Liang white feather fan at combat start with a scry and strategy gain", () => {
    const state = startCombatWithRelics(zhugeLiang, ["relic_white_feather_fan"]);

    expect(state.player.resource.value).toBe(2);
    expect(state.combatLog).toEqual(expect.arrayContaining(["白羽扇", "观星"]));
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "trigger", target: "player", label: "白羽扇" }),
        expect.objectContaining({ kind: "trigger", target: "player", label: "观星" })
      ])
    );
  });

  it("retains cards with retain when the player ends the turn", () => {
    const state = startCombat(diaoChan);

    endPlayerTurn(state);

    expect(state.piles.hand.some((item) => item.definitionId === "retain-guard")).toBe(true);
  });

  it("makes anger mind state increase player attack damage", () => {
    const state = startCombat(zhaoYun);
    state.player.mind = "nu";
    const card = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(22);
  });

  it("settles ink marks as post-battle life loss on victory", () => {
    const state = startCombat(zhaoYun);
    state.player.inkMarks = 2;
    state.enemies[0].hp = 1;
    const card = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.phase).toBe("won");
    expect(state.player.hp).toBe(80);
    expect(state.combatLog).toContain("墨痕结算");
  });

  it("applies Diao Chan starting relic charm at combat start", () => {
    const state = startCombatWithRelics(diaoChan, ["relic_closed_moon_sachet"]);

    expect(state.enemies[0].statuses.charm).toBe(2);
  });

  it("makes old wooden sword increase starter attack damage", () => {
    const state = startCombatWithRelics(zhaoYun, ["relic_old_wooden_sword"]);
    const card = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(22);
  });

  it("makes black paper umbrella grant block when gaining ink", () => {
    const inkCard: CardDefinition = {
      id: "ink-test",
      name: "墨试",
      cost: 0,
      rarity: "ink",
      target: "self",
      types: ["skill", "ink"],
      effects: [{ action: "gainInk", amount: 1 }]
    };
    const state = createCombat({
      character: { ...diaoChan, starterDeck: ["ink-test", "strike", "guard", "charm", "shadow-step"] },
      cards: [...allCards, inkCard],
      enemies: [bandit],
      rngSeed: 4,
      relicIds: ["relic_black_paper_umbrella"],
      shuffleDeck: false
    });
    const card = state.piles.hand.find((item) => item.definitionId === "ink-test");

    playCard(state, card?.instanceId ?? "", "player");

    expect(state.player.inkMarks).toBe(1);
    expect(state.player.block).toBe(2);
  });

  it("makes white dragon tassel reward the first Zhao Yun break-formation", () => {
    const state = startCombatWithRelics(zhaoYun, ["relic_white_dragon_tassel"], ["strike", "strike", "strike", "strike", "guard"]);
    const attacks = state.piles.hand.filter((item) => item.definitionId === "strike");

    playCard(state, attacks[0].instanceId, state.enemies[0].id);
    playCard(state, attacks[1].instanceId, state.enemies[0].id);
    playCard(state, attacks[2].instanceId, state.enemies[0].id);

    expect(state.player.energy).toBe(1);
    expect(state.piles.hand.length).toBeGreaterThan(1);
    expect(state.combatLog).toContain("白龙枪缨");
  });

  it("applies upgraded card instance damage bonus in combat", () => {
    const state = createCombat({
      character: { ...zhaoYun, starterDeck: ["strike", "guard", "guard", "guard", "guard"] },
      cards: allCards,
      enemies: [bandit],
      rngSeed: 3,
      upgradedCardInstanceIds: ["starter-1"],
      shuffleDeck: false
    });
    const card = state.piles.hand.find((item) => item.definitionId === "strike");

    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(21);
  });

  it("uses card-specific upgraded effects when a card defines them", () => {
    const preciseStrike: CardDefinition = {
      id: "precise-strike",
      name: "定式",
      cost: 1,
      rarity: "common",
      target: "enemy",
      types: ["attack"],
      effects: [{ action: "damage", amount: 4 }],
      upgrade: {
        effects: [{ action: "damage", amount: 11 }],
        description: "造成11点伤害。"
      }
    };
    const state = createCombat({
      character: { ...zhaoYun, starterDeck: ["precise-strike", "guard", "guard", "guard", "guard"] },
      cards: [...allCards, preciseStrike],
      enemies: [bandit],
      rngSeed: 3,
      upgradedCardInstanceIds: ["starter-1"],
      shuffleDeck: false
    });

    playCard(state, state.piles.hand[0].instanceId, state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(19);
  });

  it("starts combat from the current run hp when supplied", () => {
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [bandit],
      playerHp: 42,
      rngSeed: 3,
      shuffleDeck: false
    });

    expect(state.player.hp).toBe(42);
    expect(state.player.maxHp).toBe(82);
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

  it("executes special enemy intents with status, damage, ink, and combat log cues", () => {
    const paperUmbrella = {
      id: "paper",
      name: "纸伞女鬼",
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
        }
      ]
    } as unknown as EnemyDefinition;
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [paperUmbrella],
      rngSeed: 13,
      shuffleDeck: false
    });

    endPlayerTurn(state);

    expect(state.player.statuses.weak).toBe(1);
    expect(state.player.hp).toBe(77);
    expect(state.player.inkMarks).toBe(1);
    expect(state.combatLog).toContain("纸伞迷魂");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "status", target: "player", label: "虚弱 +1" }),
        expect.objectContaining({ kind: "ink", target: "player", label: "墨痕 +1" })
      ])
    );
  });

  it("makes player weak reduce the next attack and then clear one weak stack", () => {
    const hexingEnemy = {
      id: "hex",
      name: "纸伞女鬼",
      maxHp: 30,
      intents: [
        {
          type: "special",
          name: "纸伞迷魂",
          effects: [{ action: "applyStatus", target: "player", status: "weak", amount: 1 }]
        }
      ]
    } as unknown as EnemyDefinition;
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [hexingEnemy],
      rngSeed: 14,
      shuffleDeck: false
    });

    endPlayerTurn(state);
    const card = state.piles.hand.find((item) => item.definitionId === "strike");
    playCard(state, card?.instanceId ?? "", state.enemies[0].id);

    expect(state.enemies[0].hp).toBe(26);
    expect(state.player.statuses.weak).toBe(0);
  });

  it("lets boss feast intents heal the enemy while pressuring the player with ink", () => {
    const dongZhuo = {
      id: "boss",
      name: "墨影董卓",
      maxHp: 132,
      intents: [
        {
          type: "special",
          name: "吞噬权柄",
          effects: [
            { action: "damage", amount: 8, hits: 1 },
            { action: "heal", amount: 10 },
            { action: "gainInk", amount: 2 }
          ]
        }
      ]
    } as unknown as EnemyDefinition;
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [dongZhuo],
      rngSeed: 15,
      shuffleDeck: false
    });
    state.enemies[0].hp = 100;

    endPlayerTurn(state);

    expect(state.player.hp).toBe(74);
    expect(state.player.inkMarks).toBe(2);
    expect(state.enemies[0].hp).toBe(110);
    expect(state.combatLog).toContain("吞噬权柄");
  });

  it("lets second chapter enemies pollute the discard pile with status cards", () => {
    const brokenScholar = {
      id: "broken-scholar",
      name: "断笔书生",
      maxHp: 42,
      intents: [
        {
          type: "special",
          name: "断笔污卷",
          effects: [
            { action: "addCardToDiscard", cardId: "status_zayin", amount: 2 },
            { action: "applyStatus", target: "player", status: "weak", amount: 1 }
          ]
        }
      ]
    } as unknown as EnemyDefinition;
    const state = createCombat({
      character: zhaoYun,
      cards: allCards,
      enemies: [brokenScholar],
      rngSeed: 22,
      shuffleDeck: false
    });

    endPlayerTurn(state);

    const statusCount = [...state.piles.draw, ...state.piles.hand, ...state.piles.discard]
      .filter((card) => card.definitionId === "status_zayin").length;

    expect(statusCount).toBe(2);
    expect(state.combatLog).toContain("断笔污卷");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "status", target: "player", label: "杂音入弃牌 +2" })])
    );
  });

  it("makes Qin Demon Echo gain block when status cards are drawn", () => {
    const qinDemon = {
      id: "boss_qin_demon_echo",
      name: "琴魔·残音",
      maxHp: 150,
      intents: [{ type: "idle" }]
    } as unknown as EnemyDefinition;
    const state = createCombat({
      character: { ...zhaoYun, starterDeck: ["status_zayin", "strike", "guard", "guard", "guard"] },
      cards: allCards,
      enemies: [qinDemon],
      rngSeed: 23,
      shuffleDeck: false
    });

    expect(state.enemies[0].block).toBe(4);
    expect(state.combatLog).toContain("悲声回环");
    expect(state.visualEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "block", target: "enemy", label: "+4 护甲" })])
    );
  });
});
