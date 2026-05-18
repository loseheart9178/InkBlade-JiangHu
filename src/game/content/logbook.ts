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
  },
  {
    id: "fragment_luoshui_mirror",
    title: "洛水照影",
    body: "水面映出的不是容貌，而是被墨色浸染的另一种可能。",
    unlocks: { eventId: "event_luoshui_mirror" }
  },
  {
    id: "fragment_broken_spear_shrine",
    title: "断枪古祠",
    body: "断枪虽残，仍守着旧日的誓言。在这黑雨中，它是唯一的脊梁。",
    unlocks: { eventId: "event_broken_spear_shrine" }
  },
  {
    id: "fragment_silk_lantern_market",
    title: "绛灯夜市",
    body: "灯火明灭间，市集售卖着过往的欢愉，也售卖着不为人知的代价。",
    unlocks: { eventId: "event_silk_lantern_market" }
  },
  {
    id: "fragment_rain_washed_tablet",
    title: "雨洗墨碑",
    body: "名字被雨洗去，但伤痕留了下来。每一笔刻痕都是一段未完的史诗。",
    unlocks: { eventId: "event_rain_washed_tablet" }
  },
  {
    id: "fragment_fisher_old_song",
    title: "渔叟旧歌",
    body: "歌声随洛水流逝，渔叟钓起的不是鱼，而是沉入水底的旧日残章。",
    unlocks: { eventId: "event_fisher_old_song" }
  },
  {
    id: "fragment_deserted_armory",
    title: "荒营兵库",
    body: "兵甲未寒，故人已散。在这荒废的校场，只有雨声在操演。",
    unlocks: { eventId: "event_deserted_armory" }
  },
  {
    id: "fragment_silent_bridge",
    title: "无声石桥",
    body: "桥的那头是彼岸，这头是执念。每走一步，影子便重一分。",
    unlocks: { eventId: "event_silent_bridge" }
  },
  {
    id: "fragment_red_sleeve_letter",
    title: "红袖残书",
    body: "书信字迹已模糊，却仍透着当年的温存与决绝。",
    unlocks: { eventId: "event_red_sleeve_letter" }
  },
  {
    id: "fragment_black_lotus_pool",
    title: "黑莲池",
    body: "墨色莲叶中心，是最后一点未被污染的纯净。",
    unlocks: { eventId: "event_black_lotus_pool" }
  },
  {
    id: "fragment_rain_tea_pavilion",
    title: "雨中茶亭",
    body: "茶已凉，棋局未终。世事如棋，每一手都牵动着墨色的流向。",
    unlocks: { eventId: "event_rain_tea_pavilion" }
  },
  {
    id: "fragment_bamboo_heart_question",
    title: "竹林问心",
    body: "竹影重重，问的是路，也是心。若心无定所，何处不是迷途。",
    unlocks: { eventId: "event_bamboo_heart_question" }
  },
  {
    id: "fragment_bamboo_soldier_array",
    title: "兵煞竹阵",
    body: "死去的兵卒在竹林中复苏，他们守着的，是再也回不去的长坂。",
    unlocks: { eventId: "event_bamboo_soldier_array" }
  },
  {
    id: "fragment_red_cloth_faceless",
    title: "红衣无面",
    body: "红衣如火，舞步如幻。在这无面的戏里，谁才是真正的影子。",
    unlocks: { eventId: "event_red_cloth_faceless" }
  },
  {
    id: "fragment_wordless_bamboo_scroll",
    title: "无字竹简",
    body: "无字之处，自有深意。那些被墨书抹去的，都在简中低语。",
    unlocks: { eventId: "event_wordless_bamboo_scroll" }
  },
  {
    id: "fragment_white_horse_lost_path",
    title: "白马失路",
    body: "白马嘶鸣，它还记得那条通往英雄冢的老路。",
    unlocks: { eventId: "event_white_horse_lost_path" }
  },
  {
    id: "fragment_red_dust_guest",
    title: "红尘旧客",
    body: "红尘如梦，过客匆匆。拨动琴弦的人，早已消失在黑雨尽头。",
    unlocks: { eventId: "event_red_dust_guest" }
  },
  {
    id: "fragment_white_robed_stelae",
    title: "白袍碑林",
    body: "碑林尽头，白袍残迹。英雄名毁，唯有枪意长存。",
    unlocks: { eventId: "event_white_robed_stelae" }
  },
  {
    id: "fragment_faceless_stage",
    title: "无面戏台",
    body: "人生如戏，台上台下皆是幻影。看客散去，戏文依旧在雨中流转。",
    unlocks: { eventId: "event_faceless_stage" }
  },
  {
    id: "fragment_unfinished_chessboard",
    title: "未央棋局",
    body: "未央宫前，残局未了。黑白博弈，胜负早已写在墨迹深处。",
    unlocks: { eventId: "event_unfinished_chessboard" }
  },
  {
    id: "fragment_river_bones_lantern",
    title: "河骨灯",
    body: "骨灯微火，照亮沉冤。河水带不走的，都留在了灯芯里。",
    unlocks: { eventId: "event_river_bones_lantern" }
  },
  {
    id: "fragment_mountain_pass_riddle",
    title: "山隘问答",
    body: "隘口碑影，拦路问心。入江湖易，出江湖难。",
    unlocks: { eventId: "event_mountain_pass_riddle" }
  },
  {
    id: "fragment_silent_training_yard",
    title: "无声校场",
    body: "木桩转身，心跳共振。在这无人的校场，战意从未熄灭。",
    unlocks: { eventId: "event_silent_training_yard" }
  },
  {
    id: "fragment_muddy_ferry_lantern",
    title: "墨渡残灯",
    body: "残灯照路，墨渡迷津。路虽难行，灯火尚在。",
    unlocks: { eventId: "event_muddy_ferry_lantern" }
  },
  {
    id: "fragment_spear_oath_pavilion",
    title: "长槊誓亭",
    body: "誓言刻在石柱上，随雨水浸入地层。虽万千人，吾往矣。",
    unlocks: { eventId: "event_spear_oath_pavilion" }
  },
  {
    id: "fragment_lotus_reflection_stage",
    title: "莲影回台",
    body: "水月镜花，莲影回环。舞步未止，心火已燃。",
    unlocks: { eventId: "event_lotus_reflection_stage" }
  },
  {
    id: "fragment_qin_rain_pavilion",
    title: "雨亭听弦",
    body: "雨落琴弦，声声入耳。洗去的是铅华，留下的是风骨。",
    unlocks: { eventId: "event_qin_rain_pavilion" }
  },
  {
    id: "fragment_star_board_camp",
    title: "星盘军帐",
    body: "营帐之内，星布八方。运筹帷幄，皆在指掌之间。",
    unlocks: { eventId: "event_star_board_camp" }
  }
];

export const logbookEntriesById: Record<string, LogbookEntryDefinition> = Object.fromEntries(
  logbookEntryList.map((entry) => [entry.id, entry])
);
