import type { MindState } from "../systems/combat/types";

export type EventChoiceEffect =
  | { type: "gold"; amount: number }
  | { type: "card"; cardId: string }
  | { type: "inkCardOffer"; cardId: string }
  | { type: "heal"; amount: number }
  | { type: "hpLoss"; amount: number }
  | { type: "removeStarter" }
  | { type: "upgrade" }
  | { type: "mind"; mind: Exclude<MindState, "none">; amount: number };

export interface GameEventChoice {
  id: string;
  label: string;
  summary: string;
  effects: EventChoiceEffect[];
  characterId?: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang";
}

export interface GameEventDefinition {
  id: string;
  title: string;
  description: string;
  character?: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang";
  choices: GameEventChoice[];
}

export const eventList: GameEventDefinition[] = [
  {
    id: "event_black_rain_ferry",
    title: "黑雨渡口",
    description: "船板上有墨水倒流，像一行未写完的命。",
    choices: [
      {
        id: "inspect_cabin",
        label: "检查船舱",
        summary: "获得30铜钱，宁 +1。",
        effects: [
          { type: "gold", amount: 30 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "touch_rain",
        label: "触碰黑雨",
        summary: "获得墨点，失去3点生命，乱 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_modian" },
          { type: "hpLoss", amount: 3 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_changban_echo",
    title: "长坂回声",
    character: "zhaoyun",
    description: "黑雨中传来婴儿哭声，旧日战场再次展开。",
    choices: [
      {
        id: "guard_cry",
        label: "护住哭声",
        summary: "获得护主，失去5点生命，悲 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_guardian" },
          { type: "hpLoss", amount: 5 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "carve_names",
        label: "刻下无名者",
        summary: "回复8点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 8 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_palace_lantern_banquet",
    title: "宫灯旧宴",
    character: "diaochan",
    description: "每个人都在笑，每个人都像没有脸。",
    choices: [
      {
        id: "dance_again",
        label: "再次起舞",
        summary: "获得红绫牵，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_red_ribbon" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "leave_silently",
        label: "默然离席",
        summary: "宁 +1，回复6点生命。",
        effects: [
          { type: "mind", mind: "ning", amount: 1 },
          { type: "heal", amount: 6 }
        ]
      }
    ]
  },
  {
    id: "event_luoshui_mirror",
    title: "洛水照影",
    description: "水面映出另一个你，眉目比记忆更清楚。",
    choices: [
      {
        id: "pierce_reflection",
        label: "刺破倒影",
        summary: "赵云专属：获得突刺，怒 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_thrust" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "answer_with_dance",
        label: "以舞作答",
        summary: "貂蝉专属：获得步步生莲，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_step_lotus" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "look_away",
        label: "移开目光",
        summary: "移除一张初始牌，乱 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_broken_spear_shrine",
    title: "断枪古祠",
    description: "祠前插着半截银枪，枪缨早被黑雨浸暗。",
    choices: [
      {
        id: "lift_spear",
        label: "扶正断枪",
        summary: "赵云专属：获得回马枪，宁 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_return_spear" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "take_rust_coin",
        label: "拾取铜钱",
        summary: "获得18铜钱，悲 +1。",
        effects: [
          { type: "gold", amount: 18 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_silk_lantern_market",
    title: "绛灯夜市",
    description: "灯笼无火自明，摊主的影子却不在脚下。",
    choices: [
      {
        id: "buy_old_scroll",
        label: "买旧残卷",
        summary: "获得一张心境牌，花费12铜钱。",
        effects: [
          { type: "gold", amount: -12 },
          { type: "card", cardId: "mind_jingxin" }
        ]
      },
      {
        id: "follow_music",
        label: "循乐而去",
        summary: "貂蝉专属：获得飞袖连环，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_flying_sleeves" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_rain_washed_tablet",
    title: "雨洗墨碑",
    description: "碑文被雨洗得断断续续，只剩几个名字还亮着。",
    choices: [
      {
        id: "read_names",
        label: "读完碑名",
        summary: "升级一张牌，悲 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "scrape_ink",
        label: "刮下残墨",
        summary: "获得墨刃，失去4点生命，乱 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_moren" },
          { type: "hpLoss", amount: 4 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_fisher_old_song",
    title: "渔叟旧歌",
    description: "老渔人唱着不成调的洛水歌，鱼篓里全是纸鳞。",
    choices: [
      {
        id: "listen_song",
        label: "听完旧歌",
        summary: "回复10点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 10 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "ask_dark_tide",
        label: "问黑潮来处",
        summary: "获得洛水墨潮，失去6点生命，悟 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_luoshui_tide" },
          { type: "hpLoss", amount: 6 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_deserted_armory",
    title: "荒营兵库",
    description: "军械整齐得不像逃亡，倒像有人刚刚离开。",
    choices: [
      {
        id: "repair_gear",
        label: "修整兵甲",
        summary: "升级一张牌，宁 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "take_throwing_stone",
        label: "取飞石囊",
        summary: "获得飞石，怒 +1。",
        effects: [
          { type: "card", cardId: "common_feishi" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_silent_bridge",
    title: "无声石桥",
    description: "桥下没有水声，只有自己的脚步比自己先到对岸。",
    choices: [
      {
        id: "cross_quickly",
        label: "疾行过桥",
        summary: "获得轻身，怒 +1。",
        effects: [
          { type: "card", cardId: "common_qingshen" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "wait_for_echo",
        label: "等回声回来",
        summary: "宁 +2。",
        effects: [{ type: "mind", mind: "ning", amount: 2 }]
      }
    ]
  },
  {
    id: "event_red_sleeve_letter",
    title: "红袖残书",
    description: "一封湿透的书信贴在树根上，字迹像在躲你。",
    choices: [
      {
        id: "burn_letter",
        label: "焚去残书",
        summary: "移除一张初始牌，悟 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "keep_letter",
        label: "收在袖中",
        summary: "获得协力，魅 +1。",
        effects: [
          { type: "card", cardId: "common_xieli" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_black_lotus_pool",
    title: "黑莲池",
    description: "池中莲叶全是墨色，花心却亮得像雪。",
    choices: [
      {
        id: "take_lotus_seed",
        label: "取莲心",
        summary: "获得吐纳，失去2点生命，悟 +1。",
        effects: [
          { type: "card", cardId: "common_tuna" },
          { type: "hpLoss", amount: 2 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "leave_lotus",
        label: "不扰池水",
        summary: "回复6点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 6 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_ruined_temple_night_qin",
    title: "荒寺夜琴",
    description: "雨落荒寺，断续琴声从没有人的殿中传来。",
    choices: [
      {
        id: "listen_all_night",
        label: "静听一夜",
        summary: "获得杂音，宁 +1，回复8点生命。",
        effects: [
          { type: "card", cardId: "status_zayin" },
          { type: "mind", mind: "ning", amount: 1 },
          { type: "heal", amount: 8 }
        ]
      },
      {
        id: "follow_qin_sound",
        label: "追寻琴声",
        summary: "获得飞石，失去3点生命，悟 +1。",
        effects: [
          { type: "card", cardId: "common_feishi" },
          { type: "hpLoss", amount: 3 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "continue_lost_score",
        label: "续亡者残谱",
        summary: "蔡文姬专属：获得胡笳拍，悲 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_hujia_beat" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_rain_tea_pavilion",
    title: "雨中茶亭",
    description: "棋盘摆在茶桌上，棋子每落一枚，雨声便轻一分。",
    choices: [
      {
        id: "finish_the_game",
        label: "续完棋局",
        summary: "升级一张牌，悟 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "drink_warm_tea",
        label: "饮下温茶",
        summary: "回复10点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 10 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "replay_the_variation",
        label: "重算棋变",
        summary: "诸葛亮专属：获得推演，悟 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_deduction" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_bamboo_heart_question",
    title: "竹林问心",
    description: "竹影里站着另一个你，问的问题却像从很久以前传来。",
    choices: [
      {
        id: "answer_with_grief",
        label: "承认悲伤",
        summary: "获得静心，悲 +2。",
        effects: [
          { type: "card", cardId: "mind_jingxin" },
          { type: "mind", mind: "bei", amount: 2 }
        ]
      },
      {
        id: "answer_with_action",
        label: "以行动回答",
        summary: "获得一张角色武学，怒 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_white_horse_breakout" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "answer_with_dance",
        label: "以舞回答",
        summary: "获得一张角色武学，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_flying_sleeves" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "answer_with_qin",
        label: "以琴回答",
        summary: "蔡文姬专属：获得余音回响，宁 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_echoing_melody" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "answer_with_stars",
        label: "以星回答",
        summary: "诸葛亮专属：获得观星，悟 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_observe_stars" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_bamboo_soldier_array",
    title: "兵煞竹阵",
    character: "zhaoyun",
    description: "竹林深处，无面兵卒一列列站起，像等你再次突围。",
    choices: [
      {
        id: "white_robe_enter",
        label: "白袍入阵",
        summary: "赵云专属：获得枪围如墙，失去4点生命，宁 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_spear_wall" },
          { type: "hpLoss", amount: 4 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "remember_names",
        label: "记住无名者",
        summary: "回复8点生命，悲 +1。",
        effects: [
          { type: "heal", amount: 8 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_red_cloth_faceless",
    title: "红衣无面",
    character: "diaochan",
    description: "红衣舞者没有面孔，动作却与你一模一样。",
    choices: [
      {
        id: "dance_with_shadow",
        label: "与影共舞",
        summary: "貂蝉专属：获得离间，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_lijian" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "cut_red_cloth",
        label: "斩断红绫",
        summary: "升级一张牌，悟 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_broken_string_elder",
    title: "断弦老人",
    description: "老人坐在檐下补一根永远补不好的琴弦，说忘记也会留下声音。",
    choices: [
      {
        id: "tie_the_string",
        label: "替他系弦",
        summary: "获得解穴，宁 +1。",
        effects: [
          { type: "card", cardId: "common_jiexue" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "listen_to_silence",
        label: "听断弦无声",
        summary: "获得洗心，悲 +1。",
        effects: [
          { type: "card", cardId: "common_xixin" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "mend_song_memory",
        label: "为亡魂续谱",
        summary: "蔡文姬专属：获得清音，宁 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_clear_tone" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_wordless_bamboo_scroll",
    title: "无字竹简",
    description: "竹简上的字被雨洗空，只有握住它时才听见旧人的名字。",
    choices: [
      {
        id: "read_blank_scroll",
        label: "读无字处",
        summary: "升级一张牌，悟 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "keep_blank_scroll",
        label: "收起竹简",
        summary: "获得解穴，宁 +1。",
        effects: [
          { type: "card", cardId: "common_jiexue" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "deduce_hidden_lines",
        label: "推演隐文",
        summary: "诸葛亮专属：获得小八阵，宁 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_small_eight_array" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_white_horse_lost_path",
    title: "白马失路",
    character: "zhaoyun",
    description: "雨中的白马不肯前行，它似乎记得另一条通往长坂的路。",
    choices: [
      {
        id: "lead_horse_forward",
        label: "牵马入雨",
        summary: "赵云专属：获得白马突围，怒 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_white_horse_breakout" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "brush_mane_clear",
        label: "拂去鬃上雨",
        summary: "回复8点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 8 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_red_dust_guest",
    title: "红尘旧客",
    character: "diaochan",
    description: "茶亭里有位旧客低头拨弦，弦声却像从你袖中传出。",
    choices: [
      {
        id: "answer_with_sleeves",
        label: "以袖应弦",
        summary: "貂蝉专属：获得惊鸿一击，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_jinghong_strike" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "fold_the_song",
        label: "折起曲谱",
        summary: "获得洗心，悟 +1。",
        effects: [
          { type: "card", cardId: "common_xixin" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_nameless_market",
    title: "无面市集",
    description: "长安城门内，摊主们都戴着空白面具，只收还未发生的故事。",
    choices: [
      {
        id: "trade_future_name",
        label: "典当未来名声",
        summary: "获得40铜钱，乱 +1。",
        effects: [
          { type: "gold", amount: 40 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      },
      {
        id: "buy_clean_charm",
        label: "买清音符纸",
        summary: "获得解穴，宁 +1。",
        effects: [
          { type: "card", cardId: "common_jiexue" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "score_nameless_stall",
        label: "为无名者记谱",
        summary: "蔡文姬专属：获得渡魂曲，悲 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_soul_ferry" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_rewritten_history_street",
    title: "逆写史街",
    description: "街边石板上的史句倒着流动，每走一步都有人替你改掉一段过去。",
    choices: [
      {
        id: "scratch_false_line",
        label: "划去伪史",
        summary: "移除一张初始牌，悟 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "accept_redaction",
        label: "收下涂史",
        summary: "获得涂史与30铜钱，乱 +1。",
        effects: [
          { type: "card", cardId: "status_redacted_history" },
          { type: "gold", amount: 30 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      },
      {
        id: "chart_counter_history",
        label: "推演逆史分支",
        summary: "诸葛亮专属：获得借东风，悟 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_borrow_wind" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_white_robed_stelae",
    title: "白袍碑林",
    description: "碑林尽头，白袍人的名字被墨覆住，只剩枪痕与舞步还亮着。",
    choices: [
      {
        id: "trace_spear_marks",
        label: "摹枪痕",
        summary: "赵云专属：获得七进七出，悲 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_seven_entries" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "trace_dance_marks",
        label: "摹舞步",
        summary: "貂蝉专属：获得离间，悲 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_lijian" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "wash_one_stone",
        label: "洗净一碑",
        summary: "获得洗心，宁 +1。",
        effects: [
          { type: "card", cardId: "common_xixin" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_faceless_stage",
    title: "无面戏台",
    description: "戏台上演着尚未发生的结局，台下的掌声像雨点一样冷。",
    choices: [
      {
        id: "interrupt_the_play",
        label: "打断戏文",
        summary: "升级一张牌，怒 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "watch_to_end",
        label: "看完结局",
        summary: "回复12点生命，悲 +1。",
        effects: [
          { type: "heal", amount: 12 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_unfinished_chessboard",
    title: "未央棋局",
    description: "未央宫前摆着一局残局，黑白两色都像刚蘸过墨。",
    choices: [
      {
        id: "take_black_move",
        label: "落黑子",
        summary: "获得洛水墨潮，失去5点生命，悟 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_luoshui_tide" },
          { type: "hpLoss", amount: 5 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "take_white_move",
        label: "落白子",
        summary: "获得洗心，宁 +1。",
        effects: [
          { type: "card", cardId: "common_xixin" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_heart_mirror",
    title: "照心水镜",
    description: "黑水不映人形，只映你一路没有说出口的选择。",
    choices: [
      {
        id: "look_for_calm",
        label: "看向最平静处",
        summary: "回复14点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 14 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "close_eyes_walk",
        label: "闭眼走过",
        summary: "升级一张牌，悟 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_unwritten_page",
    title: "未写之页",
    description: "一页空白悬在水上，笔锋停在你的名字之前。",
    choices: [
      {
        id: "write_regret",
        label: "写下遗憾",
        summary: "获得洛水墨潮，失去6点生命，乱 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_luoshui_tide" },
          { type: "hpLoss", amount: 6 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      },
      {
        id: "fold_paper_boat",
        label: "折成纸船",
        summary: "回复16点生命，悲 +1。",
        effects: [
          { type: "heal", amount: 16 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_broken_brush_altar",
    title: "断笔祭坛",
    description: "折断的朱笔供在残页之间，笔尖仍在滴下未干的墨。",
    choices: [
      {
        id: "burn_bristles",
        label: "焚去笔毫",
        summary: "移除一张初始牌，怒 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "set_brush_down",
        label: "放下断笔",
        summary: "获得洗心，悟 +1。",
        effects: [
          { type: "card", cardId: "common_xixin" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_qingyin_lost_score",
    title: "清音遗谱",
    character: "caiwenji",
    description: "半页残谱贴在雨墙上，缺口处不断渗出旧日哭声。",
    choices: [
      {
        id: "continue_clear_phrase",
        label: "续清音",
        summary: "蔡文姬专属：获得幽兰余响，宁 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_yulan_echo" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "let_score_bleed",
        label: "让残谱泣声",
        summary: "获得未写之页，失去5点生命，悲 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_unwritten_page" },
          { type: "hpLoss", amount: 5 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_bamboo_grave_song",
    title: "竹下归歌",
    character: "caiwenji",
    description: "竹根间埋着无名旧骨，每一阵风都像未归人的合唱。",
    choices: [
      {
        id: "qin_for_buried_names",
        label: "为旧骨调弦",
        summary: "蔡文姬专属：获得洗雨调，悲 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_cleansing_rain" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "bury_false_bamboo_slip",
        label: "埋下伪简",
        summary: "移除一张初始牌，悟 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_star_board_argument",
    title: "星盘争局",
    character: "zhugeliang",
    description: "星盘上两条墨线互相争夺命数，棋子落下前已经有人被改写。",
    choices: [
      {
        id: "break_one_star_line",
        label: "断一线星路",
        summary: "诸葛亮专属：获得星门，悟 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_star_gate" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "accept_dark_calculation",
        label: "收下墨算",
        summary: "获得洛水墨潮，失去4点生命，乱 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_luoshui_tide" },
          { type: "hpLoss", amount: 4 },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_empty_city_wind",
    title: "空城风声",
    character: "zhugeliang",
    description: "城门大开，街上无人，只有风在替某个旧计反复辩解。",
    choices: [
      {
        id: "open_empty_gate",
        label: "开门听风",
        summary: "诸葛亮专属：获得空城，宁 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_empty_city" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "borrow_unseasonal_wind",
        label: "借逆时之风",
        summary: "获得借东风，失去3点生命，悟 +1。",
        effects: [
          { type: "card", cardId: "zhuge_borrow_wind" },
          { type: "hpLoss", amount: 3 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_old_roadside_inn",
    title: "旧道客栈",
    description: "客栈灯火悬在黑雨之外，掌柜却记得每个未曾住下的人。",
    choices: [
      {
        id: "share_warm_wine",
        label: "分饮温酒",
        summary: "回复10点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 10 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "buy_roadside_secret",
        label: "买一段旧闻",
        summary: "花费15铜钱，获得藏锋，悟 +1。",
        effects: [
          { type: "gold", amount: -15 },
          { type: "card", cardId: "common_cangfeng" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_ink_seller_contract",
    title: "墨商契",
    description: "墨商撑着白伞，说他的墨只写捷径，不写代价。",
    choices: [
      {
        id: "sign_half_name",
        label: "签半个名字",
        summary: "获得35铜钱与未写之页，乱 +1。",
        effects: [
          { type: "gold", amount: 35 },
          { type: "inkCardOffer", cardId: "ink_unwritten_page" },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      },
      {
        id: "buy_clear_ink",
        label: "买清墨",
        summary: "花费12铜钱，获得照心，宁 +1。",
        effects: [
          { type: "gold", amount: -12 },
          { type: "card", cardId: "mind_zhaoxin" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_river_bones_lantern",
    title: "河骨灯",
    description: "河岸挂着一排骨灯，灯芯照出的不是路，而是水底沉名。",
    choices: [
      {
        id: "light_bone_lantern",
        label: "点亮一盏",
        summary: "回复8点生命，悲 +1。",
        effects: [
          { type: "heal", amount: 8 },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "dredge_black_bone",
        label: "捞起黑骨",
        summary: "获得墨刃，失去4点生命，怒 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_moren" },
          { type: "hpLoss", amount: 4 },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_mountain_pass_riddle",
    title: "山隘问答",
    description: "山隘口的碑影拦路，只问一句：为何还要入江湖。",
    choices: [
      {
        id: "answer_with_silence",
        label: "以沉默作答",
        summary: "升级一张牌，悟 +1。",
        effects: [
          { type: "upgrade" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      },
      {
        id: "climb_by_force",
        label: "踏石强过",
        summary: "获得踏水，失去3点生命，怒 +1。",
        effects: [
          { type: "card", cardId: "common_tashui" },
          { type: "hpLoss", amount: 3 },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_silent_training_yard",
    title: "无声校场",
    description: "校场上没有兵卒，木桩却按你的心跳一齐转身。",
    choices: [
      {
        id: "practice_hidden_edge",
        label: "练藏锋",
        summary: "获得藏锋，怒 +1。",
        effects: [
          { type: "card", cardId: "common_cangfeng" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      },
      {
        id: "walk_water_steps",
        label: "习踏水步",
        summary: "获得踏水，宁 +1。",
        effects: [
          { type: "card", cardId: "common_tashui" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_broken_name_register",
    title: "残名簿",
    description: "名册被雨泡得破碎，仍有几笔人名贴在纸边不肯散去。",
    choices: [
      {
        id: "copy_remaining_names",
        label: "誊下残名",
        summary: "获得照心，悲 +1。",
        effects: [
          { type: "card", cardId: "mind_zhaoxin" },
          { type: "mind", mind: "bei", amount: 1 }
        ]
      },
      {
        id: "tear_false_page",
        label: "撕去伪页",
        summary: "移除一张初始牌，悟 +1。",
        effects: [
          { type: "removeStarter" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_cloud_water_dream",
    title: "云水一梦",
    description: "你在梦中看见云散水明，醒来时掌心却多了一点未干的墨。",
    choices: [
      {
        id: "stay_until_dawn",
        label: "梦至天明",
        summary: "回复12点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 12 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "take_dream_ink",
        label: "携梦中墨",
        summary: "获得未写之页，失去6点生命，悟 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_unwritten_page" },
          { type: "hpLoss", amount: 6 },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_muddy_ferry_lantern",
    title: "墨渡残灯",
    description: "渡口的灯笼被雨打湿，却还照着一截没走完的路。",
    choices: [
      {
        id: "steady_lantern",
        label: "提灯过渡",
        summary: "回复8点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 8 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "collect_rain_page",
        label: "拾取残页",
        summary: "获得未写之页，乱 +1。",
        effects: [
          { type: "inkCardOffer", cardId: "ink_unwritten_page" },
          { type: "mind", mind: "luan", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_spear_oath_pavilion",
    title: "长槊誓亭",
    character: "zhaoyun",
    description: "旧亭里残留着校枪的痕迹，像有人刚把誓言靠在石柱上。",
    choices: [
      {
        id: "hold_the_line",
        label: "誓守长槊",
        summary: "获得稳阵，宁 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_stable_formation" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "pursue_the_shadow",
        label: "乘势追击",
        summary: "获得七星枪影，怒 +1。",
        characterId: "zhaoyun",
        effects: [
          { type: "card", cardId: "zhao_qixing_spear" },
          { type: "mind", mind: "nu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_lotus_reflection_stage",
    title: "莲影回台",
    character: "diaochan",
    description: "舞台倒映在水里，像一片能走进去的月光。",
    choices: [
      {
        id: "step_again",
        label: "重踏步影",
        summary: "获得凌波步，魅 +1。",
        characterId: "diaochan",
        effects: [
          { type: "card", cardId: "diao_lingbo" },
          { type: "mind", mind: "mei", amount: 1 }
        ]
      },
      {
        id: "leave_with_grace",
        label: "掩扇离席",
        summary: "回复6点生命，宁 +1。",
        effects: [
          { type: "heal", amount: 6 },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_qin_rain_pavilion",
    title: "雨亭听弦",
    character: "caiwenji",
    description: "雨丝打在亭角，像有人在替古琴试音。",
    choices: [
      {
        id: "listen_to_string",
        label: "拂弦清听",
        summary: "获得静听，宁 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_listen_still" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "wash_string_with_rain",
        label: "随雨洗弦",
        summary: "获得洗雨调，悟 +1。",
        characterId: "caiwenji",
        effects: [
          { type: "card", cardId: "cai_cleansing_rain" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  },
  {
    id: "event_star_board_camp",
    title: "星盘军帐",
    character: "zhugeliang",
    description: "军帐里摆着星盘和沙盘，风从帘外穿过，留下细细的推演痕。",
    choices: [
      {
        id: "set_eight_array",
        label: "排定八阵",
        summary: "获得八阵，宁 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_small_eight_array" },
          { type: "mind", mind: "ning", amount: 1 }
        ]
      },
      {
        id: "correct_star_positions",
        label: "校正星位",
        summary: "获得空城，悟 +1。",
        characterId: "zhugeliang",
        effects: [
          { type: "card", cardId: "zhuge_empty_city" },
          { type: "mind", mind: "wu", amount: 1 }
        ]
      }
    ]
  }
];

export const eventsById: Record<string, GameEventDefinition> = Object.fromEntries(
  eventList.map((event) => [event.id, event])
);
