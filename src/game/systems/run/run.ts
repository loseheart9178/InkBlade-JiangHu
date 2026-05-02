import { cardsById } from "../../content/cards";
import { charactersById } from "../../content/characters";
import { relicsById } from "../../content/relics";
import type { CardDefinition } from "../combat/types";
import type { BattleSpoils, CreateRunOptions, MapNode, MapNodeType, RunState } from "./types";

const RELIC_REWARD_POOL = ["relic_old_wooden_sword", "relic_black_paper_umbrella"];

export function createRun(characterId: string, options: CreateRunOptions = {}): RunState {
  const character = charactersById[characterId];
  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  const mapSeed = options.mapSeed ?? 0;

  const deck = character.starterDeck.map((cardId, index) => ({
    instanceId: `run-card-${index + 1}`,
    cardId
  }));

  return {
    characterId,
    mapSeed,
    hp: character.maxHp,
    maxHp: character.maxHp,
    gold: 99,
    deck,
    relicIds: [getStartingRelicId(characterId)],
    mapNodes: createChapterOneMap(characterId, mapSeed),
    currentNodeId: "start",
    visitedNodeIds: [],
    nextDeckInstanceNumber: deck.length + 1,
    rewardHistory: []
  };
}

export function addRelic(run: RunState, relicId: string): boolean {
  if (!relicsById[relicId]) {
    throw new Error(`Unknown relic: ${relicId}`);
  }

  if (run.relicIds.includes(relicId)) {
    return false;
  }

  run.relicIds.push(relicId);
  return true;
}

export function hasRunRelic(run: RunState, relicId: string): boolean {
  return run.relicIds.includes(relicId);
}

export function getNextRelicReward(run: RunState, pool: string[] = RELIC_REWARD_POOL): string | undefined {
  return pool.find((relicId) => !run.relicIds.includes(relicId));
}

export function claimRelicReward(run: RunState, pool: string[] = RELIC_REWARD_POOL): string | undefined {
  const relicId = getNextRelicReward(run, pool);
  if (!relicId) {
    return undefined;
  }

  addRelic(run, relicId);
  return relicId;
}

export function claimBattleSpoils(run: RunState, nodeType: MapNodeType): BattleSpoils {
  const gold = getBattleGold(nodeType);
  const relicId = nodeType === "elite" || nodeType === "boss" ? claimRelicReward(run) : undefined;
  run.gold += gold;

  return relicId ? { gold, relicId } : { gold };
}

export function getCurrentNode(run: RunState): MapNode {
  const node = run.mapNodes.find((item) => item.id === run.currentNodeId);
  if (!node) {
    throw new Error(`Current node missing: ${run.currentNodeId}`);
  }

  return node;
}

export function getAvailableNodes(run: RunState): MapNode[] {
  const current = getCurrentNode(run);
  return current.connections.map((id) => getNode(run, id));
}

export function travelToNode(run: RunState, nodeId: string): RunState {
  const current = getCurrentNode(run);
  if (!current.connections.includes(nodeId)) {
    throw new Error(`Cannot travel from ${current.id} to ${nodeId}`);
  }

  if (!run.visitedNodeIds.includes(current.id)) {
    run.visitedNodeIds.push(current.id);
  }

  run.currentNodeId = nodeId;
  return run;
}

export function takeCardReward(run: RunState, card: CardDefinition): RunState {
  run.deck.push({
    instanceId: `run-card-${run.nextDeckInstanceNumber}`,
    cardId: card.id
  });
  run.nextDeckInstanceNumber += 1;
  run.rewardHistory.push(card.id);
  return run;
}

export function healRun(run: RunState, amount: number): number {
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + amount);
  return run.hp - before;
}

export function removeDeckCard(run: RunState, instanceId: string): boolean {
  const index = run.deck.findIndex((entry) => entry.instanceId === instanceId);
  if (index < 0) {
    return false;
  }

  run.deck.splice(index, 1);
  return true;
}

export function getRunDeckCardDefinitions(run: RunState): CardDefinition[] {
  return run.deck.map((entry) => {
    const card = cardsById[entry.cardId];
    if (!card) {
      throw new Error(`Unknown run deck card: ${entry.cardId}`);
    }

    return card;
  });
}

export function getUpgradeCandidates(run: RunState): RunState["deck"] {
  return run.deck.filter((entry) => !entry.upgraded);
}

export function upgradeDeckCard(run: RunState, instanceId: string): boolean {
  const entry = run.deck.find((item) => item.instanceId === instanceId);
  if (!entry || entry.upgraded) {
    return false;
  }

  entry.upgraded = true;
  return true;
}

function getNode(run: RunState, nodeId: string): MapNode {
  const node = run.mapNodes.find((item) => item.id === nodeId);
  if (!node) {
    throw new Error(`Map node missing: ${nodeId}`);
  }

  return node;
}

function getStartingRelicId(characterId: string): string {
  if (characterId === "diaochan") {
    return "relic_closed_moon_sachet";
  }

  return "relic_white_dragon_tassel";
}

function getBattleGold(nodeType: MapNodeType): number {
  if (nodeType === "elite") {
    return 25;
  }

  if (nodeType === "boss") {
    return 50;
  }

  return nodeType === "battle" ? 12 : 0;
}

function createChapterOneMap(characterId: string, mapSeed: number): MapNode[] {
  const firstEvent = getCharacterEventNode(characterId);
  const eliteEnemyId = mapSeed % 2 === 0 ? "elite_sword_echo" : "elite_blood_banner";
  const thirdBattleEnemyId = mapSeed % 3 === 2 ? "enemy_faceless_soldier" : "enemy_paper_umbrella";

  return [
    {
      id: "start",
      type: "start",
      label: "黑雨渡口",
      connections: ["battle-1", "event-1"]
    },
    {
      id: "battle-1",
      type: "battle",
      label: "墨化山贼",
      enemyId: "enemy_ink_bandit",
      connections: ["shop-1", "elite-1"]
    },
    {
      id: "event-1",
      type: "event",
      label: firstEvent.label,
      eventId: firstEvent.eventId,
      connections: ["battle-2", "rest-1"]
    },
    {
      id: "shop-1",
      type: "shop",
      label: "茶亭游商",
      connections: ["battle-2"]
    },
    {
      id: "elite-1",
      type: "elite",
      label: eliteEnemyId === "elite_sword_echo" ? "剑痴残影" : "血旗都尉",
      enemyId: eliteEnemyId,
      connections: ["rest-1"]
    },
    {
      id: "battle-2",
      type: "battle",
      label: "无面兵卒",
      enemyId: "enemy_faceless_soldier",
      connections: ["rest-1", "battle-3"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "废寺静修",
      connections: ["battle-3"]
    },
    {
      id: "battle-3",
      type: "battle",
      label: thirdBattleEnemyId === "enemy_paper_umbrella" ? "纸伞女鬼" : "无面伏兵",
      enemyId: thirdBattleEnemyId,
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "墨影董卓",
      enemyId: "boss_ink_dongzhuo",
      connections: []
    }
  ];
}

function getCharacterEventNode(characterId: string): { label: string; eventId: string } {
  if (characterId === "zhaoyun") {
    return { label: "长坂回声", eventId: "event_changban_echo" };
  }

  if (characterId === "diaochan") {
    return { label: "宫灯旧宴", eventId: "event_palace_lantern_banquet" };
  }

  return { label: "黑雨渡口", eventId: "event_black_rain_ferry" };
}
