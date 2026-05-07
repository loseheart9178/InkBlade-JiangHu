export type ProfileGoalId =
  | "goal_first_run"
  | "goal_first_victory"
  | "goal_zhaoyun_mastery"
  | "goal_diaochan_mastery"
  | "goal_caiwenji_mastery"
  | "goal_zhugeliang_mastery"
  | "goal_all_heroes_started"
  | "goal_three_endings"
  | "goal_lore_collector"
  | "goal_epilogue_collector"
  | "goal_ink_rising_clear"
  | "goal_iron_rain_clear";

export type ProfileGoalMetric =
  | "totalRuns"
  | "victories"
  | "characterVictory"
  | "charactersStarted"
  | "endingsUnlocked"
  | "fragmentsUnlocked"
  | "epiloguesUnlocked"
  | "challengeVictory";

export interface ProfileGoalDefinition {
  id: ProfileGoalId;
  title: string;
  summary: string;
  metric: ProfileGoalMetric;
  target: number;
  characterId?: string;
  challengeId?: string;
}

export const profileGoals: ProfileGoalDefinition[] = [
  { id: "goal_first_run", title: "初入江湖", summary: "完成任意一局行旅。", metric: "totalRuns", target: 1 },
  { id: "goal_first_victory", title: "一卷定尘", summary: "赢得任意结局。", metric: "victories", target: 1 },
  {
    id: "goal_zhaoyun_mastery",
    title: "白龙归阵",
    summary: "用赵云完成一次胜利。",
    metric: "characterVictory",
    target: 1,
    characterId: "zhaoyun"
  },
  {
    id: "goal_diaochan_mastery",
    title: "闭月照影",
    summary: "用貂蝉完成一次胜利。",
    metric: "characterVictory",
    target: 1,
    characterId: "diaochan"
  },
  {
    id: "goal_caiwenji_mastery",
    title: "清音续命",
    summary: "用蔡文姬完成一次胜利。",
    metric: "characterVictory",
    target: 1,
    characterId: "caiwenji"
  },
  {
    id: "goal_zhugeliang_mastery",
    title: "卧龙观星",
    summary: "用诸葛亮完成一次胜利。",
    metric: "characterVictory",
    target: 1,
    characterId: "zhugeliang"
  },
  { id: "goal_all_heroes_started", title: "四路开卷", summary: "四名角色都至少开始过一局。", metric: "charactersStarted", target: 4 },
  { id: "goal_three_endings", title: "三问史书", summary: "解锁三个世界结局。", metric: "endingsUnlocked", target: 3 },
  { id: "goal_lore_collector", title: "墨录拾遗", summary: "收录十条墨录残页。", metric: "fragmentsUnlocked", target: 10 },
  { id: "goal_epilogue_collector", title: "众生归页", summary: "解锁四个角色结局。", metric: "epiloguesUnlocked", target: 4 },
  {
    id: "goal_ink_rising_clear",
    title: "踏破墨潮",
    summary: "在墨潮压境试炼中取胜。",
    metric: "challengeVictory",
    target: 1,
    challengeId: "inkRising"
  },
  {
    id: "goal_iron_rain_clear",
    title: "铁雨无声",
    summary: "在铁雨试锋试炼中取胜。",
    metric: "challengeVictory",
    target: 1,
    challengeId: "ironRain"
  }
];

export const profileGoalsById = Object.fromEntries(
  profileGoals.map((goal) => [goal.id, goal])
) as Record<ProfileGoalId, ProfileGoalDefinition>;
