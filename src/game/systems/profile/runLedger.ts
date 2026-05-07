import { normalizeProfile, type PlayerProfile, type ProfileRunRecord } from "./profile";

export interface ProfileRunLedger {
  recentRecords: ProfileRunRecord[];
  bestRun?: ProfileRunRecord;
}

export function evaluateRunLedger(profile: PlayerProfile): ProfileRunLedger {
  const normalized = normalizeProfile(profile);
  const recentRecords = [...normalized.runRecords];
  const bestRun = recentRecords
    .slice()
    .sort((left, right) => compareRunRecords(right, left))[0];

  return {
    recentRecords,
    bestRun
  };
}

function compareRunRecords(left: ProfileRunRecord, right: ProfileRunRecord): number {
  if (left.victory !== right.victory) {
    return left.victory ? 1 : -1;
  }

  const chapterDelta = left.chaptersCompleted.length - right.chaptersCompleted.length;
  if (chapterDelta !== 0) {
    return chapterDelta;
  }

  return left.endedAtIso.localeCompare(right.endedAtIso);
}
