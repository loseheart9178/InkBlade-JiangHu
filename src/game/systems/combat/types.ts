export type CardType = "attack" | "skill" | "body" | "power" | "mind" | "ink";
export type CardRarity = "starter" | "common" | "uncommon" | "rare" | "event" | "ink" | "status" | "curse";
export type TargetKind = "enemy" | "self" | "none";
export type StatusId = "charm" | "weak" | "vulnerable" | "dodge" | "guard" | "ink";
export type MindState = "none" | "ning" | "nu" | "bei" | "mei" | "luan" | "wu";

export type CardEffect =
  | { action: "damage"; amount: number }
  | { action: "block"; amount: number }
  | { action: "draw"; amount: number }
  | { action: "gainResource"; amount: number }
  | { action: "applyStatus"; status: StatusId; amount: number }
  | { action: "gainInk"; amount: number }
  | { action: "setMind"; mind: MindState; amount?: number };

export interface CardDefinition {
  id: string;
  name: string;
  cost: number;
  rarity: CardRarity;
  target: TargetKind;
  types: CardType[];
  effects: CardEffect[];
  retain?: boolean;
  exhaust?: boolean;
  temporary?: boolean;
  character?: string;
  description?: string;
  flavor?: string;
  upgrade?: {
    cost?: number;
    effects?: CardEffect[];
    description?: string;
  };
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  upgraded?: boolean;
}

export interface CharacterResourceDefinition {
  id: string;
  name: string;
  max: number;
  initial: number;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  maxHp: number;
  drawPerTurn: number;
  energyPerTurn: number;
  starterDeck: string[];
  resource: CharacterResourceDefinition;
}

export type EnemyIntent =
  | { type: "attack"; damage: number; hits: number }
  | { type: "block"; block: number }
  | { type: "idle" }
  | { type: "special"; name: string; effects: EnemyIntentEffect[] };

export type EnemyIntentEffect =
  | { action: "damage"; amount: number; hits?: number }
  | { action: "block"; amount: number }
  | { action: "applyStatus"; target: "player" | "self"; status: StatusId; amount: number }
  | { action: "gainInk"; amount: number }
  | { action: "heal"; amount: number };

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  intents: EnemyIntent[];
}

export interface CombatantState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  statuses: Partial<Record<StatusId, number>>;
}

export interface PlayerState extends CombatantState {
  energy: number;
  maxEnergy: number;
  drawPerTurn: number;
  characterId: string;
  resource: {
    id: string;
    name: string;
    value: number;
    max: number;
  };
  mind: MindState;
  mindTendency: Record<Exclude<MindState, "none">, number>;
  inkMarks: number;
}

export interface EnemyState extends CombatantState {
  definitionId: string;
  intents: EnemyIntent[];
  intentIndex: number;
  currentIntent: EnemyIntent;
}

export interface CombatPiles {
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  exhaust: CardInstance[];
}

export type CombatVisualEventKind = "damage" | "block" | "status" | "resource" | "ink" | "draw" | "trigger" | "turn";
export type CombatVisualTarget = "player" | "enemy" | "center";
export type CombatVisualTone = "red" | "teal" | "ink" | "gold" | "neutral";

export interface CombatVisualEvent {
  id: number;
  kind: CombatVisualEventKind;
  target: CombatVisualTarget;
  label: string;
  tone: CombatVisualTone;
  amount?: number;
}

export type ComboEffect =
  | { action: "damage"; amount: number }
  | { action: "block"; amount: number }
  | { action: "draw"; amount: number }
  | { action: "gainInk"; amount: number };

export interface ComboRule {
  id: string;
  name: string;
  sequence: CardType[];
  effects: ComboEffect[];
  tone: CombatVisualTone;
}

export interface CombatState {
  turn: number;
  phase: "player" | "won" | "lost";
  player: PlayerState;
  enemies: EnemyState[];
  piles: CombatPiles;
  cardDefinitions: Record<string, CardDefinition>;
  character: CharacterDefinition;
  combatLog: string[];
  visualEvents: CombatVisualEvent[];
  relicIds: string[];
  relicMemory: Partial<Record<string, boolean>>;
  playedCardTypesThisTurn: CardType[];
  comboTriggersThisTurn: string[];
  comboTriggersThisCombat: string[];
  lastPlayedCardExhaustedThisTurn: boolean;
  attacksPlayedThisTurn: number;
  nextInstanceNumber: number;
  nextVisualEventId: number;
}

export interface CreateCombatInput {
  character: CharacterDefinition;
  cards: CardDefinition[];
  playerHp?: number;
  upgradedCardInstanceIds?: string[];
  enemies: EnemyDefinition[];
  rngSeed: number;
  relicIds?: string[];
  shuffleDeck?: boolean;
}

export type PlayCardResult =
  | { ok: true; state: CombatState }
  | { ok: false; state: CombatState; reason: "card-not-found" | "not-enough-energy" | "invalid-target" | "combat-ended" };
