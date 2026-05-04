import type { CardDefinition, MindState } from "../combat/types";
import type { ChapterId } from "../../content/chapters";

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

export type MapNodePreviewTone = "current" | "combat" | "danger" | "opportunity" | "recovery" | "boss";

export interface MapNodePreview {
  title: string;
  detail: string;
  reward: string;
  tags: string[];
  tone: MapNodePreviewTone;
}

export interface RunState {
  characterId: string;
  chapterId: ChapterId;
  completedChapterIds: ChapterId[];
  mapSeed: number;
  hp: number;
  maxHp: number;
  gold: number;
  deck: RunDeckEntry[];
  relicIds: string[];
  methodIds: string[];
  methodLevels?: Record<string, number>;
  logbook?: RunLogbookState;
  mindTendencies: Record<Exclude<MindState, "none">, number>;
  mapNodes: MapNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  nextDeckInstanceNumber: number;
  rewardHistory: string[];
  chapterRewardHistory: string[];
  lastCombatComboTriggers: string[];
  comboRewardHistory: string[];
  finalState?: RunFinalState;
}

export interface RunFinalState {
  status: "inProgress" | "endingReady";
  chapterId: ChapterId;
  bossId?: string;
  finalChoiceId?: string;
  worldEndingId?: string;
  characterEpilogueId?: string;
}

export interface RunFinalChoiceRecord {
  finalChoiceId: string;
  worldEndingId: string;
  characterEpilogueId: string;
}

export interface RunLogbookState {
  eventIds: string[];
  bossIds: string[];
  fragmentIds: string[];
}

export interface RunCompletionSnapshot {
  status: "completed";
  characterId: string;
  completedChapterIds: ChapterId[];
  unlockedFragmentIds: string[];
  finalState: RunFinalState & { status: "endingReady" };
  deckSize: number;
  relicCount: number;
  gold: number;
  hp: number;
  maxHp: number;
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

export type ChapterRewardType = "maxHp" | "upgrade" | "card";

export interface ChapterRewardChoice {
  id: string;
  type: ChapterRewardType;
  title: string;
  summary: string;
  amount?: number;
  cardId?: string;
}

export interface CreateRunOptions {
  mapSeed?: number;
}
