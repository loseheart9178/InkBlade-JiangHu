import type { CardDefinition, CardEffect, EnemyIntent } from "../systems/combat/types";

export type GlossaryCategory =
  | "cardType"
  | "combo"
  | "formation"
  | "intent"
  | "keyword"
  | "mind"
  | "resource"
  | "status"
  | "statusCard";

export interface GlossaryEntry {
  id: string;
  category: GlossaryCategory;
  label: string;
  description: string;
}

export interface GlossarySurface {
  id: string;
  label: string;
  entry?: GlossaryEntry;
}

export const glossaryEntries: GlossaryEntry[] = [
  { id: "cardType.attack", category: "cardType", label: "攻击", description: "以造成伤害为主的招式牌，是破阵、连斩和击杀节奏的基础。" },
  { id: "cardType.skill", category: "cardType", label: "技法", description: "提供防御、抽牌、净化、资源或控场的非直接武学手段。" },
  { id: "cardType.body", category: "cardType", label: "身法", description: "表现闪避、步法、保留和跨回合节奏的轻身招式。" },
  { id: "cardType.power", category: "cardType", label: "能力", description: "打出后在本场战斗持续生效，常作为构筑核心。" },
  { id: "cardType.mind", category: "cardType", label: "心境", description: "进入或利用宁、怒、悲、魅、乱、悟等心境，并影响事件与结局倾向。" },
  { id: "cardType.ink", category: "cardType", label: "墨灾", description: "高收益高风险的墨灾牌，通常会获得墨痕或污染牌堆。" },

  { id: "status.charm", category: "status", label: "魅惑", description: "貂蝉施加的控制状态，降低敌人攻击并为离间与爆发创造机会。" },
  { id: "status.weak", category: "status", label: "虚弱", description: "造成的攻击伤害降低，回合流转时逐层衰减。" },
  { id: "status.vulnerable", category: "status", label: "易伤", description: "受到的攻击伤害提高，是爆发回合前的常见铺垫。" },
  { id: "status.dodge", category: "status", label: "闪避", description: "抵消下一次敌人的攻击伤害，多段攻击只抵消其中一段。" },
  { id: "status.guard", category: "status", label: "护主", description: "赵云的守护层数，下次受攻击时减少固定伤害。" },
  { id: "status.ink", category: "status", label: "墨化", description: "被墨灾侵蚀的战斗状态，通常和墨痕、污染牌或结局风险相连。" },

  { id: "statusCard.zayin", category: "statusCard", label: "杂音", description: "蔡文姬相关负面状态牌，会干扰手牌或消耗音律，可被净化转化。" },
  { id: "statusCard.rainChill", category: "statusCard", label: "雨寒", description: "竹林雨声留下的负面状态牌，常让玩家获得易伤。" },
  { id: "statusCard.canyin", category: "statusCard", label: "残音", description: "琴魔余声化成的状态牌，常把墨痕压入牌组循环。" },
  { id: "statusCard.redactedHistory", category: "statusCard", label: "涂史", description: "长安墨书改写后的残页，会带来墨痕与易伤压力。" },

  { id: "resource.energy", category: "resource", label: "能量", description: "每回合用于支付卡牌费用的基础资源。" },
  { id: "resource.hp", category: "resource", label: "生命", description: "归零时本场战斗失败，墨痕和事件代价也会影响生命。" },
  { id: "resource.block", category: "resource", label: "护甲", description: "优先抵挡攻击伤害，通常会在下一回合开始时清空。" },
  { id: "resource.inkMarks", category: "resource", label: "墨痕", description: "墨灾风险累积，每层会在战后造成生命损失并推动心魔风险。" },
  { id: "resource.drawPile", category: "resource", label: "抽牌堆", description: "尚未抽到的牌；为空时会把弃牌堆洗回继续循环。" },
  { id: "resource.discardPile", category: "resource", label: "弃牌堆", description: "使用后或回合结束弃置的牌会先进入这里。" },
  { id: "resource.exhaustPile", category: "resource", label: "消耗堆", description: "本场战斗内移出的牌会进入这里，通常不再参与洗牌。" },
  { id: "resource.spear", category: "resource", label: "枪势", description: "赵云通过攻击、防御、破甲和招式链积累的战斗节奏资源。" },
  { id: "resource.dance", category: "resource", label: "舞势", description: "貂蝉通过身法、魅惑、闪避和招式链积累的节奏优势。" },
  { id: "resource.sound", category: "resource", label: "音律", description: "蔡文姬通过琴音、净化和余韵积累，用于强化琴音与终曲。" },
  { id: "resource.strategy", category: "resource", label: "筹策", description: "诸葛亮通过观星、布阵和反制敌意积累的谋略资源。" },

  { id: "keyword.damage", category: "keyword", label: "破势", description: "造成直接伤害，优先扣除目标护甲。" },
  { id: "keyword.draw", category: "keyword", label: "抽牌", description: "从抽牌堆获得更多手牌；抽牌堆不足时会洗入弃牌堆。" },
  { id: "keyword.gainResource", category: "keyword", label: "蓄势", description: "获得当前角色的专属资源，如枪势、舞势、音律或筹策。" },
  { id: "keyword.cleanse", category: "keyword", label: "净化", description: "移除状态或诅咒牌，常用于对抗竹林、长安和墨灾污染。" },
  { id: "keyword.echo", category: "keyword", label: "余韵", description: "蔡文姬的琴音回响，会在下回合开始再次触发部分效果。" },
  { id: "keyword.qin", category: "keyword", label: "琴音", description: "蔡文姬专属琴音牌，通常获得音律并服务于余韵或终曲节奏。" },
  { id: "keyword.scry", category: "keyword", label: "观星", description: "查看并调整抽牌堆顶部卡牌，提高后续回合稳定性。" },
  { id: "keyword.formation", category: "keyword", label: "阵法", description: "诸葛亮布置的持续战场效果，同一时间通常只保留一个主阵法。" },
  { id: "keyword.retain", category: "keyword", label: "保留", description: "回合结束时不会被弃置，继续留在手牌中等待关键时机。" },
  { id: "keyword.exhaust", category: "keyword", label: "消耗", description: "使用后本场战斗内移出牌组，常换取更高即时收益。" },
  { id: "keyword.temporary", category: "keyword", label: "临时", description: "战斗结束后移除，不会永久加入玩家牌组。" },

  { id: "mind.ning", category: "mind", label: "入宁", description: "进入宁心境，偏向防御、净化和稳定路线。" },
  { id: "mind.nu", category: "mind", label: "入怒", description: "进入怒心境，偏向攻击、爆发和代价路线。" },
  { id: "mind.bei", category: "mind", label: "入悲", description: "进入悲心境，偏向受伤收益、记忆和反击。" },
  { id: "mind.mei", category: "mind", label: "入魅", description: "进入魅心境，偏向控制、闪避和扰乱。" },
  { id: "mind.luan", category: "mind", label: "入乱", description: "进入乱心境，偏向抽牌、随机和墨灾力量。" },
  { id: "mind.wu", category: "mind", label: "入悟", description: "进入悟心境，偏向转化、消耗和终局收益。" },

  { id: "formation.eight", category: "formation", label: "八阵", description: "回合结束获得护甲的稳守阵法。" },
  { id: "formation.fire", category: "formation", label: "火阵", description: "敌人受状态伤害时追加火伤的压制阵法。" },
  { id: "formation.wind", category: "formation", label: "风阵", description: "每回合第一次技能牌带来额外抽牌的流转阵法。" },
  { id: "formation.stone", category: "formation", label: "石阵", description: "降低多段攻击压力的防御阵法。" },
  { id: "formation.empty", category: "formation", label: "空城阵", description: "不打攻击牌时压低敌人攻势的反制阵法。" },

  { id: "combo.lianzhan", category: "combo", label: "连斩", description: "连续打出三张攻击牌，追加一次伤害。" },
  { id: "combo.xushi", category: "combo", label: "蓄势", description: "先技法后攻击，让该次攻击获得额外伤害。" },
  { id: "combo.zhuiying", category: "combo", label: "追影", description: "先身法后攻击，获得护甲并追加伤害。" },
  { id: "combo.jingshou", category: "combo", label: "静守", description: "先心境后技法，获得额外护甲。" },
  { id: "combo.xinren", category: "combo", label: "心刃", description: "先心境后攻击，将心念化作额外伤害。" },
  { id: "combo.gushou", category: "combo", label: "固守", description: "连续打出三张技法牌，获得额外护甲。" },
  { id: "combo.moxi", category: "combo", label: "墨袭", description: "先墨灾后攻击，追加伤害但获得墨痕。" },
  { id: "combo.duanzhao", category: "combo", label: "断招", description: "消耗牌后的攻击节奏，抽一张牌补回手势。" },

  { id: "intent.attack", category: "intent", label: "杀意", description: "敌人准备攻击，数值显示即将造成的伤害和段数。" },
  { id: "intent.block", category: "intent", label: "运功", description: "敌人准备获得护甲，暂时提高生存能力。" },
  { id: "intent.idle", category: "intent", label: "观望", description: "敌人暂不行动或等待下一轮意图。" },
  { id: "intent.special", category: "intent", label: "特殊", description: "Boss 或章节敌人的特殊行动，可能混合伤害、护甲、状态、召唤或墨痕。" },
  { id: "intent.paperUmbrella", category: "intent", label: "纸伞迷魂", description: "纸伞女鬼以迷魂雨影削弱玩家，并夹带伤害与墨痕压力。" },
  { id: "intent.swordFocus", category: "intent", label: "剑心蓄势", description: "剑痴残影运剑蓄势，获得护甲并让玩家易伤。" },
  { id: "intent.bloodBanner", category: "intent", label: "血旗号令", description: "血旗都尉借军令压迫战场，护住自身并暴露玩家破绽。" },
  { id: "intent.palacePressure", category: "intent", label: "宫宴压迫", description: "墨影董卓以旧宴权势造成伤害、易伤与墨痕压力。" },
  { id: "intent.devourAuthority", category: "intent", label: "吞噬权柄", description: "墨影董卓攻击并回复生命，象征吞噬他人命运。" },
  { id: "intent.inkPalaceCollapse", category: "intent", label: "墨宫倾塌", description: "墨宫崩落般的多段高压攻击，并附带虚弱。" },
  { id: "intent.rainBambooVoice", category: "intent", label: "雨竹寒声", description: "雨竹幽魂把雨寒状态塞入循环，同时造成伤害。" },
  { id: "intent.brokenBrushScroll", category: "intent", label: "断笔污卷", description: "断笔书生以污卷加入杂音并施加虚弱。" },
  { id: "intent.bambooStance", category: "intent", label: "阵脚不退", description: "兵煞竹影固守阵脚，获得护甲并加入雨寒、易伤压力。" },
  { id: "intent.scoreLoop", category: "intent", label: "残谱回环", description: "琴魔残谱把杂音压入弃牌堆并获得护甲。" },
  { id: "intent.brokenStringPress", category: "intent", label: "断弦压心", description: "断弦声化作多段伤害并附带虚弱。" },
  { id: "intent.bambooSurround", category: "intent", label: "竹阵合围", description: "兵煞竹阵合围防守，并把雨寒加入牌堆。" },
  { id: "intent.stutterBeat", category: "intent", label: "断续残拍", description: "琴魔残音用断续拍点造成多段伤害、杂音与虚弱。" },
  { id: "intent.griefLoop", category: "intent", label: "悲声回环", description: "琴魔残音以悲声回环获得护甲、加入残音并回复生命。" },
  { id: "intent.endlessEcho", category: "intent", label: "绝响不散", description: "琴魔残音让余声持续压迫，造成伤害、墨痕与状态牌污染。" },
  { id: "intent.chaosBeat", category: "intent", label: "乱拍催魂", description: "失序琴拍造成多段伤害并加入杂音。" },
  { id: "intent.marketExtortion", category: "intent", label: "市契勒索", description: "墨市守卫用契约勒索获得护甲，并加入涂史。" },
  { id: "intent.redBrushNote", category: "intent", label: "朱笔旁批", description: "逆史书吏以旁批让玩家易伤，并加入涂史。" },
  { id: "intent.publicHistory", category: "intent", label: "众口成史", description: "无名城民以众声固化历史，获得护甲、涂史并施加虚弱。" },
  { id: "intent.heavyHalberd", category: "intent", label: "方天重压", description: "吕布墨影以重压一击造成伤害，并让玩家易伤。" },
  { id: "intent.stelaEcho", category: "intent", label: "碑文回声", description: "白袍碑林以碑文回声获得护甲并加入涂史。" },
  { id: "intent.rosterSeal", category: "intent", label: "名册封存", description: "白袍碑林封存名册，施加虚弱并造成伤害。" },
  { id: "intent.record", category: "intent", label: "记录", description: "墨书执笔官记录玩家路径，获得护甲并加入涂史。" },
  { id: "intent.rewrite", category: "intent", label: "改写", description: "墨书执笔官改写手牌循环，造成伤害、加入涂史并施加虚弱。" },
  { id: "intent.finalize", category: "intent", label: "定稿", description: "墨书执笔官将选择定稿，造成多段伤害并增加墨痕。" },
  { id: "intent.recordRoad", category: "intent", label: "记录旧路", description: "无名史官记录本局旧路，获得护甲、加入涂史并施加虚弱。" },
  { id: "intent.rewriteHand", category: "intent", label: "改写手牌", description: "无名史官改写玩家手牌循环，加入涂史并造成多段伤害。" },
  { id: "intent.heartQuestion", category: "intent", label: "照心质问", description: "无名史官逼问本心，施加虚弱、易伤并增加墨痕。" },
  { id: "intent.disasterDraft", category: "intent", label: "定稿成灾", description: "无名史官将记录写成墨灾，造成多段伤害、涂史和墨痕。" }
];

const glossaryById = new Map(glossaryEntries.map((entry) => [entry.id, entry]));

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return glossaryById.get(id);
}

export function getGlossaryEntryByLabel(category: GlossaryCategory, label: string): GlossaryEntry | undefined {
  return glossaryEntries.find((entry) => entry.category === category && entry.label === label);
}

export function formatGlossaryTooltip(entry: GlossaryEntry, detail?: string): string {
  const base = `${entry.label}：${ensureSentence(entry.description)}`;
  return detail ? `${base} ${ensureSentence(detail)}` : base;
}

export function getIntentGlossarySurface(intent: EnemyIntent): GlossarySurface {
  if (intent.type === "attack") {
    return makeSurface("intent.attack", "杀意");
  }

  if (intent.type === "block") {
    return makeSurface("intent.block", "运功");
  }

  if (intent.type === "idle") {
    return makeSurface("intent.idle", "观望");
  }

  const entry = getGlossaryEntryByLabel("intent", intent.name) ?? getGlossaryEntry("intent.special");
  return {
    id: entry?.id ?? "intent.special",
    label: intent.name,
    entry
  };
}

export function getCardGlossarySurfaces(card: CardDefinition): GlossarySurface[] {
  const surfaces: GlossarySurface[] = [];
  const seenIds = new Set<string>();

  const add = (id: string, fallbackLabel: string) => {
    if (seenIds.has(id)) {
      return;
    }

    seenIds.add(id);
    surfaces.push(makeSurface(id, fallbackLabel));
  };

  card.types.forEach((type) => add(`cardType.${type}`, type));
  card.effects.forEach((effect) => addEffectSurface(effect, add));
  (card.keywords ?? []).forEach((keyword) => addKeywordSurface(keyword, add));

  if (card.retain) {
    add("keyword.retain", "保留");
  }

  if (card.exhaust) {
    add("keyword.exhaust", "消耗");
  }

  if (card.temporary) {
    add("keyword.temporary", "临时");
  }

  if (card.rarity === "status") {
    addStatusCardSurface(card, add);
  }

  return surfaces;
}

function addEffectSurface(effect: CardEffect, add: (id: string, fallbackLabel: string) => void): void {
  if (effect.action === "damage") {
    add("keyword.damage", "破势");
  } else if (effect.action === "block") {
    add("resource.block", "护甲");
  } else if (effect.action === "draw") {
    add("keyword.draw", "抽牌");
  } else if (effect.action === "gainResource") {
    add("keyword.gainResource", "蓄势");
  } else if (effect.action === "applyStatus") {
    add(`status.${effect.status}`, effect.status);
  } else if (effect.action === "gainInk") {
    add("resource.inkMarks", "墨痕");
  } else if (effect.action === "cleanseCards") {
    add("keyword.cleanse", "净化");
  } else if (effect.action === "queueEcho") {
    add("keyword.echo", "余韵");
  } else if (effect.action === "scry") {
    add("keyword.scry", "观星");
  } else if (effect.action === "setFormation") {
    add(`formation.${effect.formation}`, effect.name);
  } else if (effect.action === "setMind") {
    add(`mind.${effect.mind}`, effect.mind);
  }
}

function addKeywordSurface(keyword: string, add: (id: string, fallbackLabel: string) => void): void {
  const keywordIds: Record<string, [string, string]> = {
    cleanse: ["keyword.cleanse", "净化"],
    echo: ["keyword.echo", "余韵"],
    formation: ["keyword.formation", "阵法"],
    qin: ["keyword.qin", "琴音"],
    scry: ["keyword.scry", "观星"]
  };
  const mapped = keywordIds[keyword];

  if (mapped) {
    add(mapped[0], mapped[1]);
  }
}

function addStatusCardSurface(card: CardDefinition, add: (id: string, fallbackLabel: string) => void): void {
  const statusCardIds: Record<string, string> = {
    status_canyin: "statusCard.canyin",
    status_rain_chill: "statusCard.rainChill",
    status_redacted_history: "statusCard.redactedHistory",
    status_zayin: "statusCard.zayin"
  };
  const id = statusCardIds[card.id];

  if (id) {
    add(id, card.name);
  }
}

function makeSurface(id: string, fallbackLabel: string): GlossarySurface {
  const entry = getGlossaryEntry(id);
  return {
    id,
    label: entry?.label ?? fallbackLabel,
    entry
  };
}

function ensureSentence(value: string): string {
  const trimmed = value.trim();
  return /[。.!?？]$/.test(trimmed) ? trimmed : `${trimmed}。`;
}
