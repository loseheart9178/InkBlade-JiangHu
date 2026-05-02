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
  floor: number;
  lane: number;
  enemyId?: string;
  eventId?: string;
  connections: string[];
}

export interface RunState {
  characterId: string;
  mapSeed: number;
  hp: number;
  maxHp: number;
  gold: number;
  deck: RunDeckEntry[];
  relicIds: string[];
  methodIds: string[];
  mapNodes: MapNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  nextDeckInstanceNumber: number;
  rewardHistory: string[];
  lastCombatComboTriggers: string[];
  comboRewardHistory: string[];
}

export interface CardReward {
  cards: CardDefinition[];
}

export interface CardRewardDraft {
  cards: CardDefinition[];
  comboId?: string;
  comboName?: string;
  comboHint?: string;
  comboPrimaryCardId?: string;
  reasons: Record<string, string>;
}

export interface BattleSpoils {
  gold: number;
  relicId?: string;
}

export interface CreateRunOptions {
  mapSeed?: number;
}
