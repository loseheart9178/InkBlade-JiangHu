import { cardsById } from "../../content/cards";
import { relicsById } from "../../content/relics";
import type { ChapterId } from "../../content/chapters";
import { recordLogbookBoss, recordLogbookEvent } from "../logbook/logbook";
import { addRelic, advanceToNextChapter, createRun, takeCardReward } from "../run/run";
import type { RunState } from "../run/types";

export interface CreateDebugRunOptions {
  characterId?: string;
  chapterId?: ChapterId;
  cardIds?: string[];
  relicIds?: string[];
  methodIds?: string[];
  methodLevels?: Record<string, number>;
  eventIds?: string[];
  bossIds?: string[];
  hp?: number;
  gold?: number;
  mapSeed?: number;
}

export function createDebugRun(options: CreateDebugRunOptions = {}): RunState {
  const run = createRun(options.characterId ?? "zhaoyun", { mapSeed: options.mapSeed ?? 9001 });
  advanceToChapter(run, options.chapterId ?? "luoshui");

  for (const cardId of options.cardIds ?? []) {
    const card = cardsById[cardId];
    if (card) {
      takeCardReward(run, card);
    }
  }

  for (const relicId of options.relicIds ?? []) {
    if (relicsById[relicId]) {
      addRelic(run, relicId);
    }
  }

  for (const methodId of options.methodIds ?? []) {
    if (!run.methodIds.includes(methodId)) {
      run.methodIds.push(methodId);
    }
  }

  run.methodLevels = {
    ...(run.methodLevels ?? {}),
    ...(options.methodLevels ?? {})
  };
  for (const methodId of run.methodIds) {
    run.methodLevels[methodId] = Math.max(1, run.methodLevels[methodId] ?? 1);
  }

  for (const eventId of options.eventIds ?? []) {
    recordLogbookEvent(run, eventId);
  }

  for (const bossId of options.bossIds ?? []) {
    recordLogbookBoss(run, bossId);
  }

  if (typeof options.hp === "number") {
    run.hp = Math.max(1, Math.min(run.maxHp, options.hp));
  }

  if (typeof options.gold === "number") {
    run.gold = Math.max(0, options.gold);
  }

  return run;
}

function advanceToChapter(run: RunState, chapterId: ChapterId): void {
  while (run.chapterId !== chapterId) {
    if (!advanceToNextChapter(run)) {
      break;
    }
  }
}
