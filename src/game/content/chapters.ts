export type ChapterId = "luoshui" | "bamboo" | "changan";

export interface ChapterDefinition {
  id: ChapterId;
  order: number;
  name: string;
  subtitle: string;
  mapTitle: string;
  startLabel: string;
  bossEnemyId: string;
  bossVictoryCopy: string;
  nextChapterId?: ChapterId;
}

export const chapterList: ChapterDefinition[] = [
  {
    id: "luoshui",
    order: 1,
    name: "洛水残照",
    subtitle: "权力、恐惧与被书写的命运。",
    mapTitle: "第一章 · 洛水残照",
    startLabel: "黑雨渡口",
    bossEnemyId: "boss_ink_dongzhuo",
    bossVictoryCopy: "墨影董卓崩散，洛水重映天光。",
    nextChapterId: "bamboo"
  },
  {
    id: "bamboo",
    order: 2,
    name: "竹林听雨",
    subtitle: "记忆、悲伤与选择的代价。",
    mapTitle: "第二章 · 竹林听雨",
    startLabel: "雨入竹林",
    bossEnemyId: "boss_qin_demon_echo",
    bossVictoryCopy: "残谱碎成雨声，清音台的灯影指向长安。",
    nextChapterId: "changan"
  },
  {
    id: "changan",
    order: 3,
    name: "长安墨城",
    subtitle: "历史、权力与改写命运的代价。",
    mapTitle: "第三章 · 长安墨城",
    startLabel: "无面市集",
    bossEnemyId: "boss_scribe_officer",
    bossVictoryCopy: "执笔官的朱印裂开，城墙上的名字终于显形。"
  }
];

export const chaptersById: Record<ChapterId, ChapterDefinition> = Object.fromEntries(
  chapterList.map((chapter) => [chapter.id, chapter])
) as Record<ChapterId, ChapterDefinition>;
