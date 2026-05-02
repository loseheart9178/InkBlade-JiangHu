export type EventChoiceEffect =
  | { type: "gold"; amount: number }
  | { type: "card"; cardId: string; hpLoss?: number }
  | { type: "heal"; amount: number }
  | { type: "mind"; mind: "ning" | "nu" | "bei" | "mei" | "luan" | "wu"; amount: number };

export interface GameEventChoice {
  id: string;
  label: string;
  summary: string;
  effect: EventChoiceEffect;
}

export interface GameEventDefinition {
  id: string;
  title: string;
  description: string;
  character?: "zhaoyun" | "diaochan";
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
        summary: "获得30铜钱。",
        effect: { type: "gold", amount: 30 }
      },
      {
        id: "touch_rain",
        label: "触碰黑雨",
        summary: "获得墨点，失去3点生命。",
        effect: { type: "card", cardId: "ink_modian", hpLoss: 3 }
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
        summary: "获得护主，失去5点生命。",
        effect: { type: "card", cardId: "zhao_guardian", hpLoss: 5 }
      },
      {
        id: "carve_names",
        label: "刻下无名者",
        summary: "回复8点生命。",
        effect: { type: "heal", amount: 8 }
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
        summary: "获得红绫牵。",
        effect: { type: "card", cardId: "diao_red_ribbon" }
      },
      {
        id: "leave_silently",
        label: "默然离席",
        summary: "进入宁。",
        effect: { type: "mind", mind: "ning", amount: 1 }
      }
    ]
  }
];

export const eventsById: Record<string, GameEventDefinition> = Object.fromEntries(
  eventList.map((event) => [event.id, event])
);

