export const PROFILE_VERSION = 1;

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

export interface PlayerProfile {
  version: typeof PROFILE_VERSION;
  stats: ProfileStats;
  characterStats: Record<string, ProfileCharacterStats>;
  unlockedFragments: string[];
  unlockedEndings: string[];
  unlockedCharacterEpilogues: string[];
}

export interface RecordRunResultInput {
  characterId: string;
  victory: boolean;
  endingId?: string;
  characterEpilogueId?: string;
  chaptersCompleted?: readonly string[];
}

export interface RecordCompletedRunInput extends RecordRunResultInput {
  unlockedFragments?: readonly string[];
}

export function createProfile(): PlayerProfile {
  return {
    version: PROFILE_VERSION,
    stats: createEmptyStats(),
    characterStats: {},
    unlockedFragments: [],
    unlockedEndings: [],
    unlockedCharacterEpilogues: []
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
      : [...normalized.unlockedCharacterEpilogues]
  };
}

export function recordCompletedRun(profile: PlayerProfile, result: RecordCompletedRunInput): PlayerProfile {
  let next = recordRunResult(profile, result);
  for (const fragmentId of result.unlockedFragments ?? []) {
    next = unlockLogbookFragment(next, fragmentId);
  }
  return next;
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
  if (!profile) {
    return createProfile();
  }

  const characterStats = Object.fromEntries(
    Object.entries(profile.characterStats ?? {}).map(([characterId, stats]) => [
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
    unlockedCharacterEpilogues: uniqueStrings(profile.unlockedCharacterEpilogues)
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

function normalizeStats(stats: Partial<ProfileStats> | undefined): ProfileStats {
  return {
    totalRuns: Math.max(0, stats?.totalRuns ?? 0),
    victories: Math.max(0, stats?.victories ?? 0),
    defeats: Math.max(0, stats?.defeats ?? 0)
  };
}

function normalizeCharacterStats(stats: Partial<ProfileCharacterStats> | undefined): ProfileCharacterStats {
  return {
    ...normalizeStats(stats),
    bestChaptersCompleted: Math.max(0, stats?.bestChaptersCompleted ?? 0),
    unlockedEndings: uniqueStrings(stats?.unlockedEndings),
    unlockedCharacterEpilogues: uniqueStrings(stats?.unlockedCharacterEpilogues)
  };
}

function addUnique(values: readonly string[], value: string): string[] {
  if (!value) {
    return [...values];
  }

  return values.includes(value) ? [...values] : [...values, value];
}

function uniqueStrings(values: readonly string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).filter((value) => typeof value === "string" && value.length > 0)));
}
