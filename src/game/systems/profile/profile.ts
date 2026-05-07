import { profileGoalsById, type ProfileGoalId } from "../../content/goals";

export const PROFILE_VERSION = 1;
export const PROFILE_RUN_RECORD_LIMIT = 12;

export interface ProfileStats {
  totalRuns: number;
  victories: number;
  defeats: number;
}

export interface ProfileCharacterStats extends ProfileStats {
  bestChaptersCompleted: number;
  unlockedEndings: string[];
  unlockedCharacterEpilogues: string[];
}

export interface ProfileRunRecord {
  id: string;
  characterId: string;
  victory: boolean;
  challengeId?: string;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted: string[];
  unlockedFragments: string[];
  newlyCompletedGoalIds: ProfileGoalId[];
  endedAtIso: string;
}

export interface PlayerProfile {
  version: typeof PROFILE_VERSION;
  stats: ProfileStats;
  characterStats: Record<string, ProfileCharacterStats>;
  unlockedFragments: string[];
  unlockedEndings: string[];
  unlockedCharacterEpilogues: string[];
  completedGoalIds: ProfileGoalId[];
  challengeVictories?: string[];
  runRecords: ProfileRunRecord[];
}

export interface RecordRunResultInput {
  characterId: string;
  victory: boolean;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted?: readonly string[];
  challengeId?: string;
}

export interface RecordCompletedRunInput extends RecordRunResultInput {
  unlockedFragments?: readonly string[];
}

export interface RecordProfileRunRecordInput {
  characterId: string;
  victory: boolean;
  challengeId?: string;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted?: readonly string[];
  unlockedFragments?: readonly string[];
  newlyCompletedGoalIds?: readonly ProfileGoalId[];
  endedAtIso?: string;
}

export function createProfile(): PlayerProfile {
  return {
    version: PROFILE_VERSION,
    stats: createEmptyStats(),
    characterStats: {},
    unlockedFragments: [],
    unlockedEndings: [],
    unlockedCharacterEpilogues: [],
    completedGoalIds: [],
    challengeVictories: [],
    runRecords: []
  };
}

export function recordRunResult(profile: PlayerProfile, result: RecordRunResultInput): PlayerProfile {
  const normalized = normalizeProfile(profile);
  const characterStats = normalized.characterStats[result.characterId] ?? createEmptyCharacterStats();
  const chaptersCompleted = result.chaptersCompleted?.length ?? 0;
  const nextCharacterStats: ProfileCharacterStats = {
    ...incrementStats(characterStats, result.victory),
    bestChaptersCompleted: Math.max(characterStats.bestChaptersCompleted, chaptersCompleted),
    unlockedEndings: result.endingId ? addUnique(characterStats.unlockedEndings, result.endingId) : [...characterStats.unlockedEndings],
    unlockedCharacterEpilogues: result.characterEpilogueId
      ? addUnique(characterStats.unlockedCharacterEpilogues, result.characterEpilogueId)
      : [...characterStats.unlockedCharacterEpilogues]
  };

  return {
    ...normalized,
    stats: incrementStats(normalized.stats, result.victory),
    characterStats: {
      ...normalized.characterStats,
      [result.characterId]: nextCharacterStats
    },
    unlockedEndings: result.endingId ? addUnique(normalized.unlockedEndings, result.endingId) : [...normalized.unlockedEndings],
    unlockedCharacterEpilogues: result.characterEpilogueId
      ? addUnique(normalized.unlockedCharacterEpilogues, result.characterEpilogueId)
      : [...normalized.unlockedCharacterEpilogues],
    challengeVictories: result.victory && result.challengeId
      ? addUnique(normalized.challengeVictories ?? [], result.challengeId)
      : [...(normalized.challengeVictories ?? [])]
  };
}

export function recordCompletedRun(profile: PlayerProfile, result: RecordCompletedRunInput): PlayerProfile {
  let next = recordRunResult(profile, result);
  for (const fragmentId of result.unlockedFragments ?? []) {
    next = unlockLogbookFragment(next, fragmentId);
  }
  return next;
}

export function recordProfileRunRecord(profile: PlayerProfile, input: RecordProfileRunRecordInput): PlayerProfile {
  const normalized = normalizeProfile(profile);
  const endedAtIso = input.endedAtIso ?? new Date().toISOString();
  const record = normalizeRunRecord({
    id: createRunRecordId(normalized, endedAtIso),
    characterId: input.characterId,
    victory: input.victory,
    challengeId: input.challengeId,
    endingId: input.endingId,
    characterEpilogueId: input.characterEpilogueId,
    chaptersCompleted: [...(input.chaptersCompleted ?? [])],
    unlockedFragments: [...(input.unlockedFragments ?? [])],
    newlyCompletedGoalIds: [...(input.newlyCompletedGoalIds ?? [])],
    endedAtIso
  });

  if (!record) {
    return normalized;
  }

  return {
    ...normalized,
    runRecords: [record, ...normalized.runRecords].slice(0, PROFILE_RUN_RECORD_LIMIT)
  };
}

export function unlockLogbookFragment(profile: PlayerProfile, fragmentId: string): PlayerProfile {
  const normalized = normalizeProfile(profile);
  return {
    ...normalized,
    unlockedFragments: addUnique(normalized.unlockedFragments, fragmentId)
  };
}

export function unlockEnding(profile: PlayerProfile, endingId: string, characterId?: string): PlayerProfile {
  const normalized = normalizeProfile(profile);

  if (!characterId) {
    return {
      ...normalized,
      unlockedEndings: addUnique(normalized.unlockedEndings, endingId)
    };
  }

  const characterStats = normalized.characterStats[characterId] ?? createEmptyCharacterStats();
  return {
    ...normalized,
    unlockedEndings: addUnique(normalized.unlockedEndings, endingId),
    characterStats: {
      ...normalized.characterStats,
      [characterId]: {
        ...characterStats,
        unlockedEndings: addUnique(characterStats.unlockedEndings, endingId)
      }
    }
  };
}

export function normalizeProfile(profile: Partial<PlayerProfile> | undefined): PlayerProfile {
  if (!isRecord(profile)) {
    return createProfile();
  }

  const rawCharacterStats = isRecord(profile.characterStats) ? profile.characterStats : {};
  const characterStats = Object.fromEntries(
    Object.entries(rawCharacterStats).map(([characterId, stats]) => [
      characterId,
      normalizeCharacterStats(stats)
    ])
  );

  return {
    version: PROFILE_VERSION,
    stats: normalizeStats(profile.stats),
    characterStats,
    unlockedFragments: uniqueStrings(profile.unlockedFragments),
    unlockedEndings: uniqueStrings(profile.unlockedEndings),
    unlockedCharacterEpilogues: uniqueStrings(profile.unlockedCharacterEpilogues),
    completedGoalIds: uniqueGoalIds(profile.completedGoalIds),
    challengeVictories: uniqueStrings(profile.challengeVictories),
    runRecords: normalizeRunRecords(profile.runRecords)
  };
}

function createEmptyStats(): ProfileStats {
  return {
    totalRuns: 0,
    victories: 0,
    defeats: 0
  };
}

function createEmptyCharacterStats(): ProfileCharacterStats {
  return {
    ...createEmptyStats(),
    bestChaptersCompleted: 0,
    unlockedEndings: [],
    unlockedCharacterEpilogues: []
  };
}

function incrementStats<T extends ProfileStats>(stats: T, victory: boolean): T {
  return {
    ...stats,
    totalRuns: stats.totalRuns + 1,
    victories: stats.victories + (victory ? 1 : 0),
    defeats: stats.defeats + (victory ? 0 : 1)
  };
}

function normalizeStats(stats: unknown): ProfileStats {
  if (!isRecord(stats)) {
    return createEmptyStats();
  }

  const victories = normalizeCount(stats.victories);
  const defeats = normalizeCount(stats.defeats);
  return {
    totalRuns: Math.max(normalizeCount(stats.totalRuns), victories + defeats),
    victories,
    defeats
  };
}

function normalizeCharacterStats(stats: unknown): ProfileCharacterStats {
  if (!isRecord(stats)) {
    return createEmptyCharacterStats();
  }

  return {
    ...normalizeStats(stats),
    bestChaptersCompleted: normalizeCount(stats.bestChaptersCompleted),
    unlockedEndings: uniqueStrings(stats.unlockedEndings),
    unlockedCharacterEpilogues: uniqueStrings(stats.unlockedCharacterEpilogues)
  };
}

function normalizeRunRecords(records: unknown): ProfileRunRecord[] {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map(normalizeRunRecord)
    .filter((record): record is ProfileRunRecord => Boolean(record))
    .slice(0, PROFILE_RUN_RECORD_LIMIT);
}

function normalizeRunRecord(record: unknown): ProfileRunRecord | undefined {
  if (!isRecord(record) || typeof record.id !== "string" || record.id.length === 0) {
    return undefined;
  }

  if (typeof record.characterId !== "string" || record.characterId.length === 0) {
    return undefined;
  }

  if (typeof record.victory !== "boolean") {
    return undefined;
  }

  if (typeof record.endedAtIso !== "string" || record.endedAtIso.length === 0 || Number.isNaN(Date.parse(record.endedAtIso))) {
    return undefined;
  }

  return withoutUndefined({
    id: record.id,
    characterId: record.characterId,
    victory: record.victory,
    challengeId: optionalString(record.challengeId),
    endingId: optionalString(record.endingId),
    characterEpilogueId: optionalString(record.characterEpilogueId),
    chaptersCompleted: uniqueStrings(record.chaptersCompleted),
    unlockedFragments: uniqueStrings(record.unlockedFragments),
    newlyCompletedGoalIds: uniqueGoalIds(record.newlyCompletedGoalIds),
    endedAtIso: record.endedAtIso
  });
}

function createRunRecordId(profile: PlayerProfile, endedAtIso: string): string {
  const safeTimestamp = endedAtIso.replace(/[^0-9A-Za-z]/g, "");
  return `run_${safeTimestamp}_${profile.runRecords.length + 1}`;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function withoutUndefined(record: ProfileRunRecord): ProfileRunRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)) as ProfileRunRecord;
}

function addUnique(values: readonly string[], value: string): string[] {
  if (!value) {
    return [...values];
  }

  return values.includes(value) ? [...values] : [...values, value];
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0)));
}

function uniqueGoalIds(values: unknown): ProfileGoalId[] {
  return uniqueStrings(values).filter((goalId): goalId is ProfileGoalId => goalId in profileGoalsById);
}

function normalizeCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
