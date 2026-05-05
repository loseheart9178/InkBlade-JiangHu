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
    id: "fragment_black_rain_ferry",
    title: "黑雨渡口",
    body: "洛水倒映的不是天光，而是那些尚未被承认的旧梦。",
    unlocks: { eventId: "event_black_rain_ferry" }
  },
  {
    id: "fragment_changban_echo",
    title: "长坂回声",
    body: "白袍越过黑雨，仍听见身后有人唤他回头。守护不是救尽所有人，而是不让当下之人再被抹去。",
    unlocks: { eventId: "event_changban_echo" }
  },
  {
    id: "fragment_palace_lantern_banquet",
    title: "宫灯旧宴",
    body: "红灯再亮时，貂蝉不再被推入席间。她执起折扇，把旧宴改成自己的开场。",
    unlocks: { eventId: "event_palace_lantern_banquet" }
  },
  {
    id: "fragment_ink_dongzhuo",
    title: "墨影董卓",
    body: "权欲化作墨宫，吞下宴席、名将与美人。击破它时，洛水才第一次重映天光。",
    unlocks: { bossId: "boss_ink_dongzhuo" }
  },
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
  },
  {
    id: "fragment_heart_mirror",
    title: "照心水镜",
    body: "墨渊的水镜不审判胜负，只照见每一次选择之后仍在跳动的本心。",
    unlocks: { eventId: "event_heart_mirror" }
  },
  {
    id: "fragment_unwritten_page",
    title: "未写之页",
    body: "空白不是遗忘，而是把最后一笔还给仍愿向前的人。",
    unlocks: { eventId: "event_unwritten_page" }
  },
  {
    id: "fragment_broken_brush_altar",
    title: "断笔祭坛",
    body: "断笔供在祭坛上，提醒后来者：不是所有痛苦都需要被别人定稿。",
    unlocks: { eventId: "event_broken_brush_altar" }
  },
  {
    id: "fragment_nameless_historian",
    title: "无名史官",
    body: "他并非想毁灭江湖，只是不相信苦难会被记住。击败他之后，墨书才真正交回你的手中。",
    unlocks: { bossId: "boss_nameless_historian" }
  },
  {
    id: "fragment_qingyin_lost_score",
    title: "清音遗谱",
    body: "残谱缺了半页，清音仍在雨里寻人。悲声若无人应答，便会被墨写成归路。",
    unlocks: { eventId: "event_qingyin_lost_score" }
  },
  {
    id: "fragment_bamboo_grave_song",
    title: "竹下归歌",
    body: "竹根埋着无名旧骨，琴声落下时，亡者终于记起自己不是墨迹。",
    unlocks: { eventId: "event_bamboo_grave_song" }
  },
  {
    id: "fragment_star_board_argument",
    title: "星盘争局",
    body: "星盘上每一线都像命数，也像借口。落子之前，他先问自己能否承担被改写的人。",
    unlocks: { eventId: "event_star_board_argument" }
  },
  {
    id: "fragment_empty_city_wind",
    title: "空城风声",
    body: "城门大开，风替人守住沉默。真正的空城，不在城中，而在执棋者心里。",
    unlocks: { eventId: "event_empty_city_wind" }
  },
  {
    id: "fragment_old_roadside_inn",
    title: "旧道客栈",
    body: "客栈灯火照见过路人，也照见不肯离席的旧念。喝下温酒，墨色便少一分人声。",
    unlocks: { eventId: "event_old_roadside_inn" }
  },
  {
    id: "fragment_ink_seller_contract",
    title: "墨商契",
    body: "墨商说契上只卖方便，不卖命。可每个签名，都比伤口更难洗净。",
    unlocks: { eventId: "event_ink_seller_contract" }
  },
  {
    id: "fragment_broken_name_register",
    title: "残名簿",
    body: "名册被雨泡烂，仍有几笔不肯散去。有人活过，便不该只剩一团黑痕。",
    unlocks: { eventId: "event_broken_name_register" }
  },
  {
    id: "fragment_cloud_water_dream",
    title: "云水一梦",
    body: "梦里云散水明，醒来仍是黑雨。若本心还在，一页残梦也能引路。",
    unlocks: { eventId: "event_cloud_water_dream" }
  }
];

export const logbookEntriesById: Record<string, LogbookEntryDefinition> = Object.fromEntries(
  logbookEntryList.map((entry) => [entry.id, entry])
);
