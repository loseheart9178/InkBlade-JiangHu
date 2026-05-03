import type { CardArchetypeId, CardDefinition } from "../combat/types";

export const ARCHETYPE_LABELS: Record<CardArchetypeId, string> = {
  "zhao-spear-chain": "连斩枪势流",
  "zhao-guardian-counter": "护主防反流",
  "diao-dance-chain": "舞势连击流",
  "diao-charm-control": "魅惑控制流",
  "cai-qin-echo": "琴音余韵流",
  "cai-cleanse-melody": "净弦清音流"
};

export type CardArchetypeRole = "主线强化" | "副线补强" | "通用补短";

export interface ArchetypeScore {
  id: CardArchetypeId;
  label: string;
  score: number;
  cardCount: number;
}

export interface DeckArchetypeAnalysis {
  scores: ArchetypeScore[];
  top?: ArchetypeScore;
  summary: string;
}

const ARCHETYPE_ORDER: CardArchetypeId[] = [
  "zhao-spear-chain",
  "zhao-guardian-counter",
  "diao-dance-chain",
  "diao-charm-control",
  "cai-qin-echo",
  "cai-cleanse-melody"
];

export function analyzeDeckArchetypes(cards: CardDefinition[]): DeckArchetypeAnalysis {
  const counts: Record<CardArchetypeId, number> = {
    "zhao-spear-chain": 0,
    "zhao-guardian-counter": 0,
    "diao-dance-chain": 0,
    "diao-charm-control": 0,
    "cai-qin-echo": 0,
    "cai-cleanse-melody": 0
  };

  for (const card of cards) {
    for (const archetype of card.archetypes ?? []) {
      counts[archetype] += 1;
    }
  }

  const scores = ARCHETYPE_ORDER.map((id) => ({
    id,
    label: ARCHETYPE_LABELS[id],
    score: counts[id],
    cardCount: counts[id]
  })).sort((left, right) => right.score - left.score || ARCHETYPE_ORDER.indexOf(left.id) - ARCHETYPE_ORDER.indexOf(right.id));

  const top = scores.find((score) => score.score > 0);

  return {
    scores,
    top,
    summary: top ? `${top.label} ${top.cardCount}式` : "尚未成型"
  };
}

export function getCardArchetypeRole(card: CardDefinition, analysis: DeckArchetypeAnalysis): CardArchetypeRole {
  if (!card.archetypes || card.archetypes.length === 0 || !analysis.top) {
    return "通用补短";
  }

  if (card.archetypes.includes(analysis.top.id)) {
    return "主线强化";
  }

  return "副线补强";
}
