import type { CardArchetypeId, CardDefinition, CardType } from "../combat/types";
import { analyzeDeckArchetypes } from "./archetype";

export interface DeckBuildRecapInput {
  cards: readonly CardDefinition[];
  methodNames?: readonly string[];
  relicNames?: readonly string[];
  challengeName?: string;
}

export interface DeckBuildRecap {
  primaryLabel: string;
  summary: string;
  signatureCards: string[];
  typeBreakdown: string[];
  tacticalNotes: string[];
  supportSignals: string[];
}

const CARD_TYPE_LABELS: Record<CardType, string> = {
  attack: "攻击",
  skill: "技法",
  body: "身法",
  power: "心法",
  mind: "心境",
  ink: "墨灾"
};

const CARD_TYPE_ORDER: CardType[] = ["attack", "skill", "body", "power", "mind", "ink"];
const SIGNATURE_LIMIT = 4;
const SUPPORT_NAME_LIMIT = 3;

export function createDeckBuildRecap(input: DeckBuildRecapInput): DeckBuildRecap {
  const cards = [...input.cards].filter((card): card is CardDefinition => Boolean(card));
  const analysis = analyzeDeckArchetypes(cards);
  const typeCounts = countCardTypes(cards);
  const typeBreakdown = formatTypeBreakdown(typeCounts);
  const primaryLabel = analysis.top?.label ?? "尚未成型";
  const signatureCards = selectSignatureCardNames(cards, analysis.top?.id);

  return {
    primaryLabel,
    summary: analysis.top ? `${analysis.top.label} ${analysis.top.cardCount}式，${typeBreakdown.slice(0, 2).join(" / ")}` : `尚未成型，${typeBreakdown.slice(0, 2).join(" / ")}`,
    signatureCards,
    typeBreakdown,
    tacticalNotes: createTacticalNotes(typeCounts, Boolean(analysis.top), cards.length),
    supportSignals: createSupportSignals(input)
  };
}

function countCardTypes(cards: readonly CardDefinition[]): Record<CardType, number> {
  const counts = Object.fromEntries(CARD_TYPE_ORDER.map((type) => [type, 0])) as Record<CardType, number>;
  for (const card of cards) {
    for (const type of card.types) {
      counts[type] += 1;
    }
  }

  return counts;
}

function formatTypeBreakdown(counts: Record<CardType, number>): string[] {
  const rows = CARD_TYPE_ORDER.filter((type) => counts[type] > 0).map((type) => `${CARD_TYPE_LABELS[type]} ${counts[type]}式`);
  return rows.length > 0 ? rows : ["暂无武学"];
}

function selectSignatureCardNames(cards: readonly CardDefinition[], primaryArchetypeId?: CardArchetypeId): string[] {
  const primaryCards = primaryArchetypeId ? cards.filter((card) => card.archetypes?.includes(primaryArchetypeId)) : [];
  const nonStarterCards = cards.filter((card) => !primaryCards.includes(card) && card.rarity !== "starter");
  const starterCards = cards.filter((card) => !primaryCards.includes(card) && !nonStarterCards.includes(card));
  const names: string[] = [];

  for (const card of [...primaryCards, ...nonStarterCards, ...starterCards]) {
    if (!names.includes(card.name)) {
      names.push(card.name);
    }
    if (names.length >= SIGNATURE_LIMIT) {
      break;
    }
  }

  return names;
}

function createSupportSignals(input: DeckBuildRecapInput): string[] {
  const signals: string[] = [];
  const methodText = formatSupportNames(input.methodNames);
  const relicText = formatSupportNames(input.relicNames);
  if (methodText) signals.push(`心法 ${methodText}`);
  if (relicText) signals.push(`法宝 ${relicText}`);
  if (input.challengeName && input.challengeName !== "标准行旅") signals.push(`试炼 ${input.challengeName}`);
  return signals;
}

function formatSupportNames(names: readonly string[] | undefined): string | undefined {
  const clean = [...new Set((names ?? []).map((name) => name.trim()).filter(Boolean))].slice(0, SUPPORT_NAME_LIMIT);
  return clean.length > 0 ? clean.join("、") : undefined;
}

function createTacticalNotes(counts: Record<CardType, number>, hasArchetype: boolean, deckSize: number): string[] {
  if (deckSize === 0) return ["继续收集带有流派标签的武学。"];
  const notes: string[] = [];
  if (counts.attack >= Math.max(2, counts.skill)) notes.push("以攻击牌连续压迫敌阵。");
  if (counts.skill > counts.attack) notes.push("以技法牌周旋、防反或控场。");
  if (counts.ink > 0) notes.push("借墨灾牌换取高收益。");
  if (counts.mind > 0) notes.push("用心境牌牵引战斗与结局倾向。");
  if (!hasArchetype) notes.push("继续收集带有流派标签的武学。");
  return notes;
}
