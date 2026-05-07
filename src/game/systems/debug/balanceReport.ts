import { chapterList, type ChapterId } from "../../content/chapters";
import type { ChallengeProfileId } from "../../content/challenges";
import { characterList } from "../../content/characters";
import { resolveChallengeProfile } from "../challenges/challenges";
import { simulateFullRoute, type BattlePlanResult, type FullRouteOptions } from "./runSimulator";

export interface BalanceReportOptions extends FullRouteOptions {
  routeSeed?: number;
  seeds?: number[];
  challengeId?: ChallengeProfileId;
}

export const BALANCE_REPORT_ID = "wave24-alpha-balance-v1";
export const BALANCE_REPORT_TITLE = "Wave 24 Alpha Balance Report";

export interface BalanceReportCharacter {
  id: string;
  name: string;
}

export interface BalanceReportChapter {
  id: ChapterId;
  name: string;
}

export interface BalanceChapterTurnSummary {
  encounters: number;
  total: number;
  average: number;
  max: number;
}

export interface BalanceTurnCounts {
  total: number;
  average: number;
  max: number;
  byChapter: Record<ChapterId, BalanceChapterTurnSummary>;
}

export interface BalanceHealingPressure {
  totalDamageTaken: number;
  averageDamageTaken: number;
  lowestPostCombatHp: number;
  finalHp: number;
  finalHpRatio: number;
  rating: "low" | "moderate" | "high";
}

export interface BalanceUnsafeDamageSpike {
  chapterId: ChapterId;
  enemyId: string;
  enemyName?: string;
  maxDamageTakenInTurn: number;
  threshold: number;
}

export interface BalanceRouteEvidence {
  seed: number;
  characterId: string;
  characterName: string;
  outcome: string;
  chapterReach: {
    completed: ChapterId[];
    highest: ChapterId | "none";
    endingReady: boolean;
  };
  routeNodeIds: string[];
  combatCount: number;
  maxDamageTakenInTurn: number;
  turnCounts: BalanceTurnCounts;
  healingPressure: BalanceHealingPressure;
  timeoutRisk: {
    hasTimeout: boolean;
    encounters: string[];
  };
  unsafeDamageSpikes: BalanceUnsafeDamageSpike[];
  warnings: string[];
}

export interface BalanceReportCharacterAggregate {
  completed: number;
  minLowestPostCombatHp: number;
  medianLowestPostCombatHp: number;
  maxLowestPostCombatHp: number;
  maxSingleTurnDamage: number;
  timeoutRiskCount: number;
  unsafeSpikeCount: number;
  totalRuns: number;
}

export interface BalanceReportAggregate {
  routeCount: number;
  totalRuns: number;
  completedRoutes: number;
  completionRate: number;
  combatCount: number;
  maxSingleTurnDamage: number;
  warningCount: number;
  timeoutRiskCount: number;
  unsafeSpikeCount: number;
  highestHealingPressure: BalanceHealingPressure["rating"];
  characters: Record<string, BalanceReportCharacterAggregate>;
}

export interface BalanceReportAcceptance {
  hasRepresentativeCompletionRoute: boolean;
  allShippedHeroRoutesComplete: boolean;
  usesRendererState: false;
  timeoutRiskCount: number;
  unsafeSpikeCount: number;
}

export interface BalanceReport {
  reportId: typeof BALANCE_REPORT_ID;
  seed: number;
  seeds?: number[];
  challenge: {
    id: ChallengeProfileId;
    name: string;
  };
  chapters: BalanceReportChapter[];
  characters: BalanceReportCharacter[];
  routes: BalanceRouteEvidence[];
  aggregate: BalanceReportAggregate;
  acceptance: BalanceReportAcceptance;
  findings: string[];
}

const DEFAULT_ROUTE_SEED = 9001;
const DEFAULT_UNSAFE_DAMAGE = 24;
const PRESSURE_ORDER: Record<BalanceHealingPressure["rating"], number> = {
  low: 0,
  moderate: 1,
  high: 2
};

export function createBalanceReport(options: BalanceReportOptions = {}): BalanceReport {
  const seeds = normalizeSeeds(options);
  const seed = seeds[0];
  const challenge = resolveChallengeProfile(options.challengeId);
  const unsafeDamageTaken = options.unsafeDamageTaken ?? DEFAULT_UNSAFE_DAMAGE;
  const routes = seeds.flatMap((routeSeed) =>
    characterList.map((character) => {
      const result = simulateFullRoute(character.id, {
        ...options,
        mapSeed: routeSeed,
        challengeId: challenge.id,
        unsafeDamageTaken
      });

      return createRouteEvidence(routeSeed, character.id, character.name, result, unsafeDamageTaken);
    })
  );

  const aggregate = createAggregate(routes);
  const findings = createFindings(routes, aggregate);

  return {
    reportId: BALANCE_REPORT_ID,
    seed,
    ...(seeds.length > 1 ? { seeds } : {}),
    challenge: {
      id: challenge.id,
      name: challenge.name
    },
    chapters: chapterList.map((chapter) => ({ id: chapter.id, name: chapter.name })),
    characters: characterList.map((character) => ({ id: character.id, name: character.name })),
    routes,
    aggregate,
    acceptance: {
      hasRepresentativeCompletionRoute: aggregate.completedRoutes > 0,
      allShippedHeroRoutesComplete: aggregate.completedRoutes === routes.length,
      usesRendererState: false,
      timeoutRiskCount: aggregate.timeoutRiskCount,
      unsafeSpikeCount: aggregate.unsafeSpikeCount
    },
    findings
  };
}

export function formatBalanceReportMarkdown(report: BalanceReport): string {
  const lines = [
    `# ${BALANCE_REPORT_TITLE}`,
    "",
    `- Report id: ${report.reportId}`,
    `- Seed: ${report.seed}`,
    ...(report.seeds ? [`- Seeds: ${report.seeds.join(",")}`] : []),
    `- Challenge: ${report.challenge.name} (${report.challenge.id})`,
    `- Routes completed: ${report.aggregate.completedRoutes}/${report.aggregate.routeCount}`,
    `- Combat samples: ${report.aggregate.combatCount}`,
    `- Timeout risks: ${report.aggregate.timeoutRiskCount}`,
    `- Unsafe damage spikes: ${report.aggregate.unsafeSpikeCount}`,
    `- Highest healing pressure: ${report.aggregate.highestHealingPressure}`,
    "",
    "## Findings",
    ...report.findings.map((finding) => `- ${finding}`),
    ...(report.seeds
      ? [
          "",
          "## Aggregate",
          "| Character | Completed | Lowest HP min/median/max | Max single-turn damage | Timeout risks | Unsafe spikes | Runs |",
          "|---|---:|---:|---:|---:|---:|---:|",
          ...report.characters.map((character) => {
            const aggregate = report.aggregate.characters[character.id];
            return `| ${character.name} (${character.id}) | ${aggregate.completed} | ${aggregate.minLowestPostCombatHp}/${aggregate.medianLowestPostCombatHp}/${aggregate.maxLowestPostCombatHp} | ${aggregate.maxSingleTurnDamage} | ${aggregate.timeoutRiskCount} | ${aggregate.unsafeSpikeCount} | ${aggregate.totalRuns} |`;
          })
        ]
      : []),
    "",
    "## Routes",
    ...report.routes.map((route) => {
      const chapters = route.chapterReach.completed.join(">");
      return [
        `### ${route.characterName} (${route.characterId})`,
        ...(report.seeds ? [`- Seed: ${route.seed}`] : []),
        `- Outcome: ${route.outcome}`,
        `- Chapters: ${chapters}`,
        `- Turns: ${route.turnCounts.total} total, ${route.turnCounts.average} average, ${route.turnCounts.max} max`,
        `- Damage taken: ${route.healingPressure.totalDamageTaken}, pressure ${route.healingPressure.rating}`,
        `- Max single-turn damage: ${route.maxDamageTakenInTurn}`,
        `- Lowest post-combat HP: ${route.healingPressure.lowestPostCombatHp}`,
        `- Warnings: ${route.warnings.length === 0 ? "none" : route.warnings.join("; ")}`
      ].join("\n");
    })
  ];

  return `${lines.join("\n")}\n`;
}

function createRouteEvidence(
  seed: number,
  characterId: string,
  characterName: string,
  result: ReturnType<typeof simulateFullRoute>,
  unsafeDamageTaken: number
): BalanceRouteEvidence {
  const turnCounts = createTurnCounts(result.encounters);
  const timeoutEncounters = result.encounters
    .filter((encounter) => encounter.outcome === "timeout")
    .map(createEncounterLabel);
  const unsafeDamageSpikes = result.encounters
    .filter((encounter) => encounter.maxDamageTakenInTurn > unsafeDamageTaken)
    .map((encounter) => ({
      chapterId: encounter.chapterId as ChapterId,
      enemyId: encounter.enemyId,
      enemyName: encounter.enemyName,
      maxDamageTakenInTurn: encounter.maxDamageTakenInTurn,
      threshold: unsafeDamageTaken
    }));

  return {
    seed,
    characterId,
    characterName,
    outcome: result.outcome,
    chapterReach: {
      completed: [...result.completedChapterIds],
      highest: getHighestReachedChapter(result.encounters, result.completedChapterIds),
      endingReady: result.finalState?.status === "endingReady"
    },
    routeNodeIds: [...result.routeNodeIds],
    combatCount: result.encounters.length,
    maxDamageTakenInTurn: result.encounters.reduce((max, encounter) => Math.max(max, encounter.maxDamageTakenInTurn), 0),
    turnCounts,
    healingPressure: createHealingPressure(result.encounters, result.finalPlayerHp, result.finalMaxHp),
    timeoutRisk: {
      hasTimeout: timeoutEncounters.length > 0,
      encounters: timeoutEncounters
    },
    unsafeDamageSpikes,
    warnings: [...result.warnings]
  };
}

function createTurnCounts(encounters: BattlePlanResult[]): BalanceTurnCounts {
  const byChapter = Object.fromEntries(
    chapterList.map((chapter) => [
      chapter.id,
      {
        encounters: 0,
        total: 0,
        average: 0,
        max: 0
      }
    ])
  ) as Record<ChapterId, BalanceChapterTurnSummary>;

  for (const encounter of encounters) {
    const chapterId = encounter.chapterId as ChapterId;
    byChapter[chapterId].encounters += 1;
    byChapter[chapterId].total += encounter.turns;
    byChapter[chapterId].max = Math.max(byChapter[chapterId].max, encounter.turns);
  }

  for (const chapter of Object.values(byChapter)) {
    chapter.average = chapter.encounters > 0 ? round(chapter.total / chapter.encounters) : 0;
  }

  const total = encounters.reduce((sum, encounter) => sum + encounter.turns, 0);
  return {
    total,
    average: encounters.length > 0 ? round(total / encounters.length) : 0,
    max: encounters.reduce((max, encounter) => Math.max(max, encounter.turns), 0),
    byChapter
  };
}

function createHealingPressure(encounters: BattlePlanResult[], finalHp: number, finalMaxHp: number): BalanceHealingPressure {
  const totalDamageTaken = encounters.reduce((sum, encounter) => sum + encounter.damageTaken, 0);
  const lowestPostCombatHp = encounters.reduce(
    (lowest, encounter) => Math.min(lowest, encounter.finalPlayerHp),
    encounters.length > 0 ? encounters[0].finalPlayerHp : finalHp
  );
  const finalHpRatio = finalMaxHp > 0 ? round(finalHp / finalMaxHp) : 0;

  return {
    totalDamageTaken,
    averageDamageTaken: encounters.length > 0 ? round(totalDamageTaken / encounters.length) : 0,
    lowestPostCombatHp,
    finalHp,
    finalHpRatio,
    rating: getHealingPressureRating(totalDamageTaken, lowestPostCombatHp, finalHp, finalMaxHp)
  };
}

function getHealingPressureRating(totalDamageTaken: number, lowestPostCombatHp: number, finalHp: number, finalMaxHp: number): BalanceHealingPressure["rating"] {
  if (finalMaxHp <= 0) {
    return "high";
  }

  if (lowestPostCombatHp <= Math.ceil(finalMaxHp * 0.35) || finalHp <= Math.ceil(finalMaxHp * 0.3) || totalDamageTaken >= finalMaxHp) {
    return "high";
  }

  if (lowestPostCombatHp <= Math.ceil(finalMaxHp * 0.55) || finalHp <= Math.ceil(finalMaxHp * 0.5) || totalDamageTaken >= Math.ceil(finalMaxHp * 0.55)) {
    return "moderate";
  }

  return "low";
}

function getHighestReachedChapter(encounters: BattlePlanResult[], completedChapterIds: ChapterId[]): ChapterId | "none" {
  const lastEncounter = encounters.at(-1);
  if (lastEncounter?.chapterId && isChapterId(lastEncounter.chapterId)) {
    return lastEncounter.chapterId;
  }

  return completedChapterIds.at(-1) ?? "none";
}

function createAggregate(routes: BalanceRouteEvidence[]): BalanceReportAggregate {
  const completedRoutes = routes.filter((route) => route.outcome === "completed").length;
  const highestHealingPressure = routes.reduce<BalanceHealingPressure["rating"]>((highest, route) => {
    return PRESSURE_ORDER[route.healingPressure.rating] > PRESSURE_ORDER[highest] ? route.healingPressure.rating : highest;
  }, "low");

  return {
    routeCount: routes.length,
    totalRuns: routes.length,
    completedRoutes,
    completionRate: routes.length > 0 ? round(completedRoutes / routes.length) : 0,
    combatCount: routes.reduce((sum, route) => sum + route.combatCount, 0),
    maxSingleTurnDamage: routes.reduce((max, route) => Math.max(max, route.maxDamageTakenInTurn), 0),
    warningCount: routes.reduce((sum, route) => sum + route.warnings.length, 0),
    timeoutRiskCount: routes.reduce((sum, route) => sum + route.timeoutRisk.encounters.length, 0),
    unsafeSpikeCount: routes.reduce((sum, route) => sum + route.unsafeDamageSpikes.length, 0),
    highestHealingPressure,
    characters: createCharacterAggregate(routes)
  };
}

function createCharacterAggregate(routes: BalanceRouteEvidence[]): Record<string, BalanceReportCharacterAggregate> {
  return Object.fromEntries(
    characterList.map((character) => {
      const characterRoutes = routes.filter((route) => route.characterId === character.id);
      const lowestHpValues = characterRoutes
        .map((route) => route.healingPressure.lowestPostCombatHp)
        .sort((left, right) => left - right);

      return [
        character.id,
        {
          completed: characterRoutes.filter((route) => route.outcome === "completed").length,
          minLowestPostCombatHp: lowestHpValues[0] ?? 0,
          medianLowestPostCombatHp: median(lowestHpValues),
          maxLowestPostCombatHp: lowestHpValues.at(-1) ?? 0,
          maxSingleTurnDamage: characterRoutes.reduce((max, route) => Math.max(max, route.maxDamageTakenInTurn), 0),
          timeoutRiskCount: characterRoutes.reduce((sum, route) => sum + route.timeoutRisk.encounters.length, 0),
          unsafeSpikeCount: characterRoutes.reduce((sum, route) => sum + route.unsafeDamageSpikes.length, 0),
          totalRuns: characterRoutes.length
        }
      ];
    })
  );
}

function createFindings(routes: BalanceRouteEvidence[], aggregate: BalanceReportAggregate): string[] {
  const chapterChain = chapterList.map((chapter) => chapter.id).join(">");
  const findings = [
    `${aggregate.completedRoutes}/${aggregate.routeCount} representative shipped hero routes completed through ${chapterChain}.`,
    `${aggregate.combatCount} deterministic combat samples produced from seeded run/combat systems with no renderer state.`,
    aggregate.timeoutRiskCount === 0
      ? "No timeout-prone encounters appeared on the representative routes."
      : `${aggregate.timeoutRiskCount} timeout-prone encounter(s) need tuning review.`,
    aggregate.unsafeSpikeCount === 0
      ? `No unsafe damage spikes exceeded the configured threshold; max single-turn damage was ${aggregate.maxSingleTurnDamage}.`
      : `${aggregate.unsafeSpikeCount} unsafe damage spike(s) exceeded the configured threshold.`,
    `Highest healing pressure rating was ${aggregate.highestHealingPressure}.`
  ];

  const stressedCharacters = createHealingPressureWatchlist(routes, aggregate);
  if (stressedCharacters.length > 0) {
    findings.push(`Healing pressure watchlist: ${stressedCharacters.join("; ")}.`);
  }

  return findings;
}

function createHealingPressureWatchlist(routes: BalanceRouteEvidence[], aggregate: BalanceReportAggregate): string[] {
  return characterList
    .map((character) => {
      const characterRoutes = routes.filter((route) => route.characterId === character.id);
      if (characterRoutes.length === 0) {
        return undefined;
      }

      const highestPressure = characterRoutes.reduce<BalanceHealingPressure["rating"]>((highest, route) => {
        return PRESSURE_ORDER[route.healingPressure.rating] > PRESSURE_ORDER[highest] ? route.healingPressure.rating : highest;
      }, "low");

      if (highestPressure === "low") {
        return undefined;
      }

      const characterAggregate = aggregate.characters[character.id];
      const lowestBand = [
        characterAggregate.minLowestPostCombatHp,
        characterAggregate.medianLowestPostCombatHp,
        characterAggregate.maxLowestPostCombatHp
      ].join("/");

      return `${character.name}:${highestPressure} lowest HP ${lowestBand} across ${characterAggregate.totalRuns} ${formatRouteCount(characterAggregate.totalRuns)}`;
    })
    .filter((item): item is string => Boolean(item));
}

function formatRouteCount(count: number): string {
  return count === 1 ? "route" : "routes";
}

function createEncounterLabel(encounter: BattlePlanResult): string {
  return `${encounter.chapterId}/${encounter.characterId}/${encounter.enemyId}`;
}

function isChapterId(chapterId: string): chapterId is ChapterId {
  return chapterList.some((chapter) => chapter.id === chapterId);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const middle = Math.floor(values.length / 2);
  if (values.length % 2 === 1) {
    return values[middle];
  }

  return round((values[middle - 1] + values[middle]) / 2);
}

function normalizeSeeds(options: BalanceReportOptions): number[] {
  if (!options.seeds || options.seeds.length === 0) {
    return [options.routeSeed ?? options.mapSeed ?? DEFAULT_ROUTE_SEED];
  }

  const seeds = options.seeds.filter((seed) => Number.isFinite(seed));
  return seeds.length > 0 ? seeds : [DEFAULT_ROUTE_SEED];
}
