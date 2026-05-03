export interface LogbookEntryDefinition {
  id: string;
  title: string;
  body: string;
  unlocks: {
    eventId?: string;
    bossId?: string;
    chapterId?: string;
  };
}

export const logbookEntryList: LogbookEntryDefinition[] = [
  {
    id: "fragment_bamboo_night_qin",
    title: "荒寺夜琴",
    body: "雨声盖不住断弦，真正留下来的不是曲谱，而是不肯被忘记的人。",
    unlocks: { eventId: "event_ruined_temple_night_qin" }
  },
  {
    id: "fragment_broken_string_elder",
    title: "断弦老人",
    body: "断弦仍能记住声音。有人选择忘记，有人选择把忘记也写下来。",
    unlocks: { eventId: "event_broken_string_elder" }
  },
  {
    id: "fragment_qin_demon_echo",
    title: "琴魔·残音",
    body: "残音的心魔不在杀意，而在一次次把悲声回环成牢笼。",
    unlocks: { bossId: "boss_qin_demon_echo" }
  },
  {
    id: "fragment_nameless_market",
    title: "无面市集",
    body: "长安的市集售卖未来的名声，也典当从未有人承认过的真相。",
    unlocks: { eventId: "event_nameless_market" }
  },
  {
    id: "fragment_rewritten_history",
    title: "逆写史街",
    body: "被倒写的史句会自己寻找主人，直到有人愿意划去第一笔伪墨。",
    unlocks: { eventId: "event_rewritten_history_street" }
  },
  {
    id: "fragment_scribe_officer",
    title: "墨书执笔官",
    body: "执笔官记录招式、改写手牌、定稿结局。战胜它，才算从史书边角走回人间。",
    unlocks: { bossId: "boss_scribe_officer" }
  }
];

export const logbookEntriesById: Record<string, LogbookEntryDefinition> = Object.fromEntries(
  logbookEntryList.map((entry) => [entry.id, entry])
);
