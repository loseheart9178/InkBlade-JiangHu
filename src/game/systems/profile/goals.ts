import { profileGoals, type ProfileGoalDefinition, type ProfileGoalId } from "../../content/goals";
import { normalizeProfile, type PlayerProfile } from "./profile";

export interface ProfileGoalProgress {
  current: number;
  target: number;
}

export interface ProfileGoalRecord {
  goal: ProfileGoalDefinition;
  progress: ProfileGoalProgress;
  completed: boolean;
  recorded: boolean;
}

export interface RecordCompletedGoalsResult {
  profile: PlayerProfile;
  newlyCompletedGoalIds: ProfileGoalId[];
}

export function evaluateProfileGoals(profile: PlayerProfile): ProfileGoalRecord[] {
  const normalized = normalizeProfile(profile);
  const recordedGoalIds = new Set(normalized.completedGoalIds);

  return profileGoals.map((goal) => {
    const current = getGoalCurrentValue(normalized, goal);
    return {
      goal,
      progress: {
        current,
        target: goal.target
      },
      completed: current >= goal.target,
      recorded: recordedGoalIds.has(goal.id)
    };
  });
}

export function recordCompletedGoals(profile: PlayerProfile): RecordCompletedGoalsResult {
  const normalized = normalizeProfile(profile);
  const recordedGoalIds = new Set(normalized.completedGoalIds);
  const newlyCompletedGoalIds = evaluateProfileGoals(normalized)
    .filter((record) => record.completed && !recordedGoalIds.has(record.goal.id))
    .map((record) => record.goal.id);

  return {
    profile: {
      ...normalized,
      completedGoalIds: [...normalized.completedGoalIds, ...newlyCompletedGoalIds]
    },
    newlyCompletedGoalIds
  };
}

function getGoalCurrentValue(profile: PlayerProfile, goal: ProfileGoalDefinition): number {
  if (goal.metric === "totalRuns") {
    return profile.stats.totalRuns;
  }

  if (goal.metric === "victories") {
    return profile.stats.victories;
  }

  if (goal.metric === "characterVictory" && goal.characterId) {
    return profile.characterStats[goal.characterId]?.victories ?? 0;
  }

  if (goal.metric === "charactersStarted") {
    return Object.values(profile.characterStats).filter((stats) => stats.totalRuns > 0).length;
  }

  if (goal.metric === "endingsUnlocked") {
    return profile.unlockedEndings.length;
  }

  if (goal.metric === "fragmentsUnlocked") {
    return profile.unlockedFragments.length;
  }

  if (goal.metric === "epiloguesUnlocked") {
    return profile.unlockedCharacterEpilogues.length;
  }

  if (goal.metric === "challengeVictory" && goal.challengeId) {
    return profile.challengeVictories?.includes(goal.challengeId) ? 1 : 0;
  }

  return 0;
}
