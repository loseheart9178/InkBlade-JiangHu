import { cardsById } from "../../content/cards";
import type { GameEventChoice, GameEventDefinition } from "../../content/events";
import type { MindState } from "../combat/types";
import { getUpgradeCandidates, healRun, removeDeckCard, takeCardReward, upgradeDeckCard } from "../run/run";
import type { RunState } from "../run/types";

export type RunMindTendencies = Record<Exclude<MindState, "none">, number>;

export function applyEventChoiceEffects(run: RunState, choice: GameEventChoice): RunState {
  normalizeRunMindTendencies(run);

  for (const effect of choice.effects) {
    if (effect.type === "gold") {
      run.gold = Math.max(0, run.gold + effect.amount);
    }

    if (effect.type === "heal") {
      healRun(run, effect.amount);
    }

    if (effect.type === "hpLoss") {
      run.hp = Math.max(1, run.hp - effect.amount);
    }

    if (effect.type === "card" || effect.type === "inkCardOffer") {
      const card = cardsById[effect.cardId];
      if (card) {
        takeCardReward(run, card);
      }
    }

    if (effect.type === "removeStarter") {
      removeFirstStarterCard(run);
    }

    if (effect.type === "upgrade") {
      const candidate = getUpgradeCandidates(run)[0];
      if (candidate) {
        upgradeDeckCard(run, candidate.instanceId);
      }
    }

    if (effect.type === "mind") {
      run.mindTendencies[effect.mind] += effect.amount;
      run.rewardHistory.push(`mind:${effect.mind}:${effect.amount}`);
    }
  }

  return run;
}

export function getAvailableEventChoices(event: GameEventDefinition, characterId: string): GameEventChoice[] {
  return event.choices.filter((choice) => !choice.characterId || choice.characterId === characterId);
}

export function normalizeRunMindTendencies(run: RunState): void {
  const base: RunMindTendencies = {
    ning: 0,
    nu: 0,
    bei: 0,
    mei: 0,
    luan: 0,
    wu: 0
  };

  run.mindTendencies = {
    ...base,
    ...(run.mindTendencies ?? {})
  };
}

function removeFirstStarterCard(run: RunState): void {
  const starter = run.deck.find((entry) => cardsById[entry.cardId]?.rarity === "starter");
  if (starter && run.deck.length > 1) {
    removeDeckCard(run, starter.instanceId);
  }
}
