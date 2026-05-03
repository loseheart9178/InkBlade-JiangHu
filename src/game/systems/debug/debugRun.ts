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

export function createFinalBossDebugRun(): RunState {
  const run = createDebugRun({
    characterId: "zhaoyun",
    chapterId: "moyuan",
    mapSeed: 52,
    cardIds: [
      "zhao_qixing_spear",
      "zhao_qixing_spear",
      "zhao_seven_entries",
      "zhao_seven_entries",
      "zhao_white_dragon",
      "zhao_white_dragon",
      "zhao_break_spear",
      "zhao_break_spear",
      "zhao_return_spear",
      "zhao_return_spear",
      "zhao_spear_wall",
      "zhao_river_guard",
      "common_feishi",
      "common_feishi",
      "common_pifeng",
      "common_duanzhu"
    ],
    relicIds: [
      "relic_dragon_scale_tip",
      "relic_changban_iron_seal",
      "relic_old_wooden_sword",
      "relic_ink_washstone",
      "relic_clear_rain_charm"
    ],
    methodIds: ["method_dragon_spear_chain", "method_changban_guard"],
    methodLevels: {
      method_dragon_spear_chain: 2,
      method_changban_guard: 2
    },
    eventIds: ["event_heart_mirror", "event_unwritten_page", "event_broken_brush_altar"],
    bossIds: ["boss_dongzhuo_shadow", "boss_qin_demon_echo", "boss_scribe_officer"],
    gold: 180
  });

  run.maxHp = Math.max(run.maxHp, 150);
  run.hp = run.maxHp;
  run.currentNodeId = "event-4";
  run.visitedNodeIds = ["start", "event-1", "rest-1", "event-4"];
  run.mindTendencies = {
    ...run.mindTendencies,
    ning: Math.max(run.mindTendencies.ning, 4),
    wu: Math.max(run.mindTendencies.wu, 5)
  };

  return run;
}

function advanceToChapter(run: RunState, chapterId: ChapterId): void {
  while (run.chapterId !== chapterId) {
    if (!advanceToNextChapter(run)) {
      break;
    }
  }
}
