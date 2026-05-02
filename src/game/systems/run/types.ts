import type { CardDefinition } from "../combat/types";

export type MapNodeType = "start" | "battle" | "elite" | "event" | "shop" | "rest" | "boss";

export interface RunDeckEntry {
  instanceId: string;
  cardId: string;
  upgraded?: boolean;
}

export interface MapNode {
  id: string;
  type: MapNodeType;
  label: string;
  enemyId?: string;
  connections: string[];
}

export interface RunState {
  characterId: string;
  hp: number;
  maxHp: number;
  gold: number;
  deck: RunDeckEntry[];
  mapNodes: MapNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  nextDeckInstanceNumber: number;
  rewardHistory: string[];
}

export interface CardReward {
  cards: CardDefinition[];
}

