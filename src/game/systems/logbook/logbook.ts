import { logbookEntryList, type LogbookEntryDefinition } from "../../content/logbook";
import type { RunLogbookState, RunState } from "../run/types";

export function recordLogbookEvent(run: RunState, eventId: string): RunState {
  const logbook = normalizeRunLogbook(run);
  addUnique(logbook.eventIds, eventId);
  addUnlockedFragments(logbook, { eventId });
  return run;
}

export function recordLogbookBoss(run: RunState, bossId: string): RunState {
  const logbook = normalizeRunLogbook(run);
  addUnique(logbook.bossIds, bossId);
  addUnlockedFragments(logbook, { bossId });
  return run;
}

export function getUnlockedLogbookEntries(run: RunState): LogbookEntryDefinition[] {
  const logbook = normalizeRunLogbook(run);
  addUnlockedFragments(logbook, {});
  return logbook.fragmentIds.map((id) => logbookEntryList.find((entry) => entry.id === id)).filter((entry): entry is LogbookEntryDefinition => Boolean(entry));
}

export function normalizeRunLogbook(run: RunState): RunLogbookState {
  const current = run.logbook;
  run.logbook = {
    eventIds: Array.isArray(current?.eventIds) ? current.eventIds : [],
    bossIds: Array.isArray(current?.bossIds) ? current.bossIds : [],
    fragmentIds: Array.isArray(current?.fragmentIds) ? current.fragmentIds : []
  };
  return run.logbook;
}

function addUnlockedFragments(logbook: RunLogbookState, latest: { eventId?: string; bossId?: string }): void {
  for (const entry of logbookEntryList) {
    const unlock = entry.unlocks;
    const eventUnlocked = unlock.eventId && (unlock.eventId === latest.eventId || logbook.eventIds.includes(unlock.eventId));
    const bossUnlocked = unlock.bossId && (unlock.bossId === latest.bossId || logbook.bossIds.includes(unlock.bossId));

    if (eventUnlocked || bossUnlocked) {
      addUnique(logbook.fragmentIds, entry.id);
    }
  }
}

function addUnique(list: string[], value: string): void {
  if (!list.includes(value)) {
    list.push(value);
  }
}
