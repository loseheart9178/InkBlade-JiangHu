import { cardsById } from "../../content/cards";
import { chaptersById, type ChapterDefinition, type ChapterId } from "../../content/chapters";
import { charactersById } from "../../content/characters";
import { enemiesById } from "../../content/enemies";
import { eventsById, type EventChoiceEffect } from "../../content/events";
import { relicsById, type RelicDefinition } from "../../content/relics";
import { applyChallengeToRunStart, resolveChallengeProfile } from "../challenges/challenges";
import type { CardArchetypeId, CardDefinition, EnemyDefinition, EnemyIntent } from "../combat/types";
import { getRelicRewardPool, getShopRelicPool, type RelicRewardSource } from "../relics/relicEffects";
import type {
  BattleSpoils,
  CardRewardDraft,
  ChapterRewardChoice,
  CreateRunOptions,
  MapNode,
  MapNodePreview,
  MapNodeType,
  RunCompletionSnapshot,
  RunFinalChoiceRecord,
  RunFinalState,
  RunState,
  ShopCardOffer,
  ShopDraft,
  ShopRelicOffer
} from "./types";

const ZHAO_REWARD_POOL = [
  "zhao_thrust",
  "zhao_guardian",
  "zhao_white_dragon",
  "zhao_white_horse_breakout",
  "zhao_return_spear",
  "zhao_break_spear",
  "zhao_river_guard",
  "zhao_spear_wall",
  "zhao_seven_entries",
  "zhao_dragon_fang",
  "zhao_rearguard_oath",
  "zhao_turning_lance",
  "zhao_white_mantle_vow",
  "zhao_cloud_rescue",
  "zhao_river_lunge",
  "zhao_spear_reversal",
  "zhao_horse_sky_arc",
  "zhao_dragon_courage"
];
const DIAO_REWARD_POOL = [
  "diao_hongyan",
  "diao_glance",
  "diao_red_ribbon",
  "diao_flying_sleeves",
  "diao_lijian",
  "diao_step_lotus",
  "diao_lotus_blade",
  "diao_mirror_flower",
  "diao_jinghong_strike",
  "diao_frost_sleeve",
  "diao_swallow_return",
  "diao_crimson_snare",
  "diao_feather_feint",
  "diao_lantern_glance",
  "diao_silk_veil",
  "diao_reflecting_fan",
  "diao_ribbon_cut",
  "diao_moon_palace_pledge"
];
const CAI_REWARD_POOL = [
  "cai_clear_tone",
  "cai_broken_string",
  "cai_echoing_melody",
  "cai_five_tones_start",
  "cai_hujia_beat",
  "cai_listen_still",
  "cai_soul_ferry",
  "cai_clean_string",
  "cai_shang_tone",
  "cai_frost_strings",
  "cai_wash_dust",
  "cai_lingering_chord",
  "cai_jade_nocturne",
  "cai_river_refrain",
  "cai_plum_tone",
  "cai_clear_ashes",
  "cai_returning_hum",
  "cai_broken_rain",
  "cai_song_of_exile"
];
const ZHUGE_REWARD_POOL = [
  "zhuge_empty_city",
  "zhuge_fire_array",
  "zhuge_wind_array",
  "zhuge_stone_array",
  "zhuge_deduction",
  "zhuge_plan_set",
  "zhuge_straw_boats",
  "zhuge_borrow_wind",
  "zhuge_starfall",
  "zhuge_stargazer",
  "zhuge_reed_formation",
  "zhuge_hidden_route",
  "zhuge_command_wind",
  "zhuge_heavenly_plot",
  "zhuge_lamp_calculation",
  "zhuge_borrowed_path",
  "zhuge_feather_order",
  "zhuge_stone_gate",
  "zhuge_cloud_script"
];
const ELITE_ZHAO_REWARD_POOL = [
  "zhao_qixing_spear",
  "zhao_seven_entries",
  "zhao_spear_wall",
  "zhao_break_spear",
  "zhao_single_rider",
  "zhao_turning_lance",
  "zhao_white_mantle_vow",
  "zhao_spear_reversal",
  "zhao_horse_sky_arc",
  "zhao_dragon_courage"
];
const ELITE_DIAO_REWARD_POOL = [
  "diao_closed_moon",
  "diao_jinghong_strike",
  "diao_mirror_flower",
  "diao_step_lotus",
  "diao_red_ribbon",
  "diao_crimson_snare",
  "diao_feather_feint",
  "diao_reflecting_fan",
  "diao_ribbon_cut",
  "diao_moon_palace_pledge"
];
const ELITE_CAI_REWARD_POOL = [
  "cai_soul_ferry",
  "cai_final_song",
  "cai_hujia_beat",
  "cai_clean_string",
  "cai_five_tones_start",
  "cai_lingering_chord",
  "cai_river_refrain",
  "cai_returning_hum",
  "cai_broken_rain",
  "cai_song_of_exile"
];
const ELITE_ZHUGE_REWARD_POOL = [
  "zhuge_borrow_wind",
  "zhuge_starfall",
  "zhuge_plan_set",
  "zhuge_straw_boats",
  "zhuge_wind_array",
  "zhuge_command_wind",
  "zhuge_heavenly_plot",
  "zhuge_feather_order",
  "zhuge_stone_gate",
  "zhuge_cloud_script"
];
const COMMON_REWARD_POOL = [
  "common_pifeng",
  "common_duanzhu",
  "common_gedang",
  "common_xieli",
  "common_tuna",
  "common_qingshen",
  "common_jiexue",
  "common_xixin",
  "mind_jingxin",
  "mind_nuzhan",
  "common_mirror_armor",
  "common_scout_feather",
  "common_brush_parry",
  "common_lockstep",
  "common_clear_mist",
  "common_river_stance",
  "mind_chenlian",
  "mind_taoguang",
  "common_bamboo_guard",
  "common_rain_cut",
  "common_travel_medicine",
  "common_sudden_step",
  "common_paper_ward",
  "common_old_wine",
  "common_watch_fire",
  "mind_wangyou"
];
const EARLY_LUOSHUI_SUSTAIN_POOL = ["common_tuna", "common_qingshen", "common_xixin", "common_jiexue"];
const SHOP_TRAVEL_CARD_POOL = [
  "common_pifeng",
  "common_duanzhu",
  "common_gedang",
  "common_xieli",
  "common_tuna",
  "common_qingshen",
  "common_feishi",
  "common_tashui",
  "common_scout_feather",
  "common_brush_parry",
  "common_lockstep",
  "common_clear_mist",
  "common_river_stance",
  "common_bamboo_guard",
  "common_rain_cut",
  "common_travel_medicine",
  "common_sudden_step",
  "common_paper_ward",
  "common_old_wine",
  "common_watch_fire"
];
const SHOP_INK_CARD_POOL = [
  "ink_modian",
  "ink_moren",
  "ink_heiyu",
  "ink_luoshui_tide",
  "ink_unwritten_page",
  "ink_burning_letter",
  "ink_night_tide",
  "ink_black_contract",
  "ink_spilled_moon"
];
const ZHAO_SHOP_ROLE_POOL = [
  "zhao_thrust",
  "zhao_white_dragon",
  "zhao_guardian",
  "zhao_return_spear",
  "zhao_river_guard",
  "zhao_seven_entries",
  "zhao_spear_wall",
  "zhao_cloud_pierce",
  "zhao_dragon_fang",
  "zhao_rearguard_oath",
  "zhao_turning_lance",
  "zhao_white_mantle_vow",
  "zhao_cloud_rescue",
  "zhao_river_lunge",
  "zhao_spear_reversal",
  "zhao_horse_sky_arc",
  "zhao_dragon_courage"
];
const DIAO_SHOP_ROLE_POOL = [
  "diao_hongyan",
  "diao_sleeve_blade",
  "diao_glance",
  "diao_flying_sleeves",
  "diao_lijian",
  "diao_mirror_flower",
  "diao_lotus_blade",
  "diao_moonstep",
  "diao_frost_sleeve",
  "diao_swallow_return",
  "diao_crimson_snare",
  "diao_feather_feint",
  "diao_lantern_glance",
  "diao_silk_veil",
  "diao_reflecting_fan",
  "diao_ribbon_cut",
  "diao_moon_palace_pledge"
];
const CAI_SHOP_ROLE_POOL = [
  "cai_clear_tone",
  "cai_broken_string",
  "cai_echoing_melody",
  "cai_listen_still",
  "cai_clean_string",
  "cai_shang_tone",
  "cai_yulan_echo",
  "cai_cleansing_rain",
  "cai_frost_strings",
  "cai_wash_dust",
  "cai_lingering_chord",
  "cai_jade_nocturne",
  "cai_river_refrain",
  "cai_plum_tone",
  "cai_clear_ashes",
  "cai_returning_hum",
  "cai_broken_rain",
  "cai_song_of_exile"
];
const ZHUGE_SHOP_ROLE_POOL = [
  "zhuge_empty_city",
  "zhuge_fire_array",
  "zhuge_wind_array",
  "zhuge_stone_array",
  "zhuge_deduction",
  "zhuge_plan_set",
  "zhuge_star_gate",
  "zhuge_bamboo_slips",
  "zhuge_stargazer",
  "zhuge_reed_formation",
  "zhuge_hidden_route",
  "zhuge_command_wind",
  "zhuge_heavenly_plot",
  "zhuge_lamp_calculation",
  "zhuge_borrowed_path",
  "zhuge_feather_order",
  "zhuge_stone_gate",
  "zhuge_cloud_script"
];
const SHOP_CARD_PRICE = 35;

const ZHAO_ADVANCED_REWARD_POOL = [
  "zhao_qixing_spear",
  "zhao_single_rider",
  "zhao_seven_entries",
  "zhao_spear_wall",
  "zhao_white_mantle_vow",
  "zhao_turning_lance",
  "zhao_dragon_courage",
  "zhao_horse_sky_arc"
];
const DIAO_ADVANCED_REWARD_POOL = [
  "diao_closed_moon",
  "diao_jinghong_strike",
  "diao_step_lotus",
  "diao_lijian",
  "diao_feather_feint",
  "diao_crimson_snare",
  "diao_moon_palace_pledge",
  "diao_ribbon_cut"
];
const CAI_ADVANCED_REWARD_POOL = [
  "cai_final_song",
  "cai_soul_ferry",
  "cai_hujia_beat",
  "cai_clean_string",
  "cai_river_refrain",
  "cai_lingering_chord",
  "cai_song_of_exile",
  "cai_broken_rain"
];
const ZHUGE_ADVANCED_REWARD_POOL = [
  "zhuge_starfall",
  "zhuge_borrow_wind",
  "zhuge_plan_set",
  "zhuge_straw_boats",
  "zhuge_heavenly_plot",
  "zhuge_command_wind",
  "zhuge_cloud_script",
  "zhuge_stone_gate"
];

const LATE_EVENT_POOL = [
  "event_black_rain_ferry",
  "event_luoshui_mirror",
  "event_broken_spear_shrine",
  "event_silk_lantern_market",
  "event_rain_washed_tablet",
  "event_fisher_old_song",
  "event_deserted_armory",
  "event_silent_bridge",
  "event_red_sleeve_letter",
  "event_black_lotus_pool",
  "event_old_roadside_inn",
  "event_river_bones_lantern",
  "event_mountain_pass_riddle",
  "event_silent_training_yard"
];

const BAMBOO_EVENT_POOL = [
  "event_ruined_temple_night_qin",
  "event_rain_tea_pavilion",
  "event_bamboo_heart_question",
  "event_broken_string_elder",
  "event_wordless_bamboo_scroll",
  "event_white_horse_lost_path",
  "event_red_dust_guest"
];

const CHANGAN_EVENT_POOL = [
  "event_nameless_market",
  "event_rewritten_history_street",
  "event_white_robed_stelae",
  "event_faceless_stage",
  "event_unfinished_chessboard",
  "event_ink_seller_contract",
  "event_broken_name_register"
];

const MOYUAN_EVENT_POOL = [
  "event_heart_mirror",
  "event_unwritten_page",
  "event_broken_brush_altar",
  "event_cloud_water_dream"
];

const ARCHETYPE_LABELS: Record<CardArchetypeId, string> = {
  "zhao-spear-chain": "连斩枪势流",
  "zhao-guardian-counter": "护主防反流",
  "diao-dance-chain": "舞势连击流",
  "diao-charm-control": "魅惑控制流",
  "cai-qin-echo": "琴音余韵流",
  "cai-cleanse-melody": "净弦清音流",
  "zhuge-star-control": "观星控牌流",
  "zhuge-formation-wind": "阵法借风流"
};

const COMBO_ARCHETYPE_PREFERENCES: Record<string, Partial<Record<string, CardArchetypeId>>> = {
  zhaoyun: {
    lianzhan: "zhao-spear-chain",
    duanzhao: "zhao-spear-chain",
    xinren: "zhao-spear-chain",
    moxi: "zhao-spear-chain",
    xushi: "zhao-guardian-counter",
    jingshou: "zhao-guardian-counter",
    gushou: "zhao-guardian-counter"
  },
  diaochan: {
    lianzhan: "diao-dance-chain",
    zhuiying: "diao-dance-chain",
    duanzhao: "diao-dance-chain",
    moxi: "diao-dance-chain",
    xushi: "diao-charm-control",
    jingshou: "diao-charm-control",
    xinren: "diao-charm-control",
    gushou: "diao-charm-control"
  },
  caiwenji: {
    xushi: "cai-qin-echo",
    jingshou: "cai-qin-echo",
    gushou: "cai-cleanse-melody",
    duanzhao: "cai-qin-echo",
    xinren: "cai-qin-echo"
  },
  zhugeliang: {
    xushi: "zhuge-star-control",
    jingshou: "zhuge-formation-wind",
    gushou: "zhuge-formation-wind",
    duanzhao: "zhuge-star-control",
    xinren: "zhuge-star-control"
  }
};

interface ComboRewardRule {
  id: string;
  name: string;
  hint: string;
  byCharacter?: Partial<Record<string, string[]>>;
  cardIds: string[];
}

interface ComboRewardBias {
  comboId: string;
  comboName: string;
  hint: string;
  primaryCardId: string;
  candidateCardIds: string[];
}

const COMBO_REWARD_RULES: ComboRewardRule[] = [
  {
    id: "lianzhan",
    name: "连斩",
    hint: "奖励池偏向低费攻击与连击抽牌。",
    byCharacter: {
      zhaoyun: ["zhao_white_dragon"],
      diaochan: ["diao_sleeve_blade", "diao_jinghong_strike"],
      caiwenji: ["cai_broken_string", "cai_shang_tone"],
      zhugeliang: ["zhuge_fan_strike", "zhuge_borrow_wind"]
    },
    cardIds: ["common_feishi", "zhao_seven_entries", "zhao_qixing_spear"]
  },
  {
    id: "xushi",
    name: "蓄势",
    hint: "奖励池偏向技法起手和攻势衔接。",
    byCharacter: {
      zhaoyun: ["zhao_river_guard", "zhao_return_spear"],
      diaochan: ["diao_red_ribbon", "diao_lijian"],
      caiwenji: ["cai_clear_tone", "cai_echoing_melody"],
      zhugeliang: ["zhuge_deduction", "zhuge_plan_set"]
    },
    cardIds: ["common_tuna", "common_gedang"]
  },
  {
    id: "zhuiying",
    name: "追影",
    hint: "奖励池偏向身法入攻和位移追击。",
    byCharacter: {
      diaochan: ["diao_lotus_blade"],
      zhaoyun: ["zhao_thrust", "zhao_white_horse_breakout"]
    },
    cardIds: ["common_zhuiying", "diao_flying_sleeves", "common_qingshen"]
  },
  {
    id: "jingshou",
    name: "静守",
    hint: "奖励池偏向心境防守与稳态护甲。",
    byCharacter: {
      zhaoyun: ["zhao_spear_wall"],
      diaochan: ["diao_mirror_flower"],
      caiwenji: ["cai_qingxin_song", "cai_clean_string"],
      zhugeliang: ["zhuge_small_eight_array", "zhuge_stone_array"]
    },
    cardIds: ["mind_jingxin", "common_mirror_armor", "common_tuna"]
  },
  {
    id: "xinren",
    name: "心刃",
    hint: "奖励池偏向心境切入与攻势爆发。",
    byCharacter: {
      zhaoyun: ["zhao_seven_entries"],
      diaochan: ["diao_lijian"],
      caiwenji: ["cai_hujia_beat"],
      zhugeliang: ["zhuge_starfall"]
    },
    cardIds: ["mind_nuzhan", "common_feishi", "zhao_white_dragon"]
  },
  {
    id: "gushou",
    name: "固守",
    hint: "奖励池偏向连续技法与高护甲牌。",
    byCharacter: {
      zhaoyun: ["zhao_guardian", "zhao_spear_wall"],
      diaochan: ["diao_glance", "diao_mirror_flower"],
      caiwenji: ["cai_clean_string", "cai_listen_still"],
      zhugeliang: ["zhuge_empty_city", "zhuge_straw_boats"]
    },
    cardIds: ["common_mirror_armor", "common_gedang"]
  },
  {
    id: "moxi",
    name: "墨袭",
    hint: "奖励池打开墨灾特供牌，偏向墨痕攻势。",
    cardIds: ["ink_modian", "mind_luanxin", "ink_moren", "ink_luoshui_tide"]
  },
  {
    id: "duanzhao",
    name: "断招",
    hint: "奖励池偏向消耗牌和低费补牌。",
    cardIds: ["common_feishi", "common_qingshen", "diao_sleeve_blade"]
  }
];

export function createRun(characterId: string, options: CreateRunOptions = {}): RunState {
  const character = charactersById[characterId];
  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  const mapSeed = options.mapSeed ?? 0;
  const challengeStart = applyChallengeToRunStart(character, resolveChallengeProfile(options.challengeId), mapSeed);

  const deck = character.starterDeck.map((cardId, index) => ({
    instanceId: `run-card-${index + 1}`,
    cardId
  }));

  return {
    characterId,
    chapterId: "luoshui",
    completedChapterIds: [],
    challengeId: challengeStart.challengeId,
    mapSeed: challengeStart.mapSeed,
    hp: challengeStart.hp,
    maxHp: challengeStart.maxHp,
    gold: challengeStart.gold,
    deck,
    relicIds: [getStartingRelicId(characterId)],
    methodIds: [],
    methodLevels: {},
    logbook: {
      eventIds: [],
      bossIds: [],
      fragmentIds: []
    },
    mindTendencies: {
      ning: 0,
      nu: 0,
      bei: 0,
      mei: 0,
      luan: 0,
      wu: 0
    },
    mapNodes: createChapterOneMap(characterId, challengeStart.mapSeed),
    currentNodeId: "start",
    visitedNodeIds: [],
    nextDeckInstanceNumber: deck.length + 1,
    rewardHistory: [],
    chapterRewardHistory: [],
    lastCombatComboTriggers: [],
    comboRewardHistory: [],
    finalState: {
      status: "inProgress",
      chapterId: "luoshui"
    }
  };
}

export function recordRunCombatCombos(run: RunState, comboTriggers: string[]): RunState {
  normalizeRunComboFields(run);
  run.lastCombatComboTriggers = comboTriggers.filter(Boolean);

  if (run.lastCombatComboTriggers.length > 0) {
    run.comboRewardHistory.push(...run.lastCombatComboTriggers);
    if (run.comboRewardHistory.length > 24) {
      run.comboRewardHistory.splice(0, run.comboRewardHistory.length - 24);
    }
  }

  return run;
}

export function createCardRewardDraft(run: RunState, nodeType: MapNodeType = "battle"): CardRewardDraft {
  normalizeRunChapterFields(run);
  normalizeRunComboFields(run);
  const comboBias = getComboRewardBias(run);
  const offset = run.rewardHistory.length;
  const cards: CardDefinition[] = [];

  if (comboBias) {
    addCardsById(cards, comboBias.candidateCardIds.slice(0, 2));
  }

  if (run.chapterId === "bamboo" || run.chapterId === "changan") {
    addRotatedCards(cards, ["common_jiexue", "common_xixin"], offset, 1);
  }

  if (nodeType === "elite" || nodeType === "boss") {
    addRotatedCards(cards, getEliteRewardPool(run.characterId), offset, 1);
  }

  if (run.chapterId === "bamboo" || run.chapterId === "changan") {
    addRotatedCards(cards, getRoleRewardPool(run.characterId), offset + (comboBias ? 1 : 0), 2);
    addRotatedCards(cards, getEliteRewardPool(run.characterId), offset + cards.length + 1, 3);
    addRotatedCards(cards, COMMON_REWARD_POOL, offset + cards.length, 3);
  } else {
    addRotatedCards(cards, getRoleRewardPool(run.characterId), offset + (comboBias ? 1 : 0), 1);
    if (run.chapterId === "luoshui" && nodeType === "battle" && offset < 2) {
      addRotatedCards(cards, EARLY_LUOSHUI_SUSTAIN_POOL, offset, cards.length + 1);
    }
    addRotatedCards(cards, COMMON_REWARD_POOL, offset + cards.length, 3);
    addRotatedCards(cards, getRoleRewardPool(run.characterId), offset + cards.length + 1, 3);
  }

  if (run.chapterId === "luoshui" && nodeType === "battle" && offset < 2 && !cards.slice(0, 3).some((card) => EARLY_LUOSHUI_SUSTAIN_POOL.includes(card.id))) {
    const sustainCard = pickRotatedCard(EARLY_LUOSHUI_SUSTAIN_POOL, offset, cards);
    if (sustainCard) {
      cards.splice(Math.min(cards.length, comboBias ? 2 : 1), 0, sustainCard);
    }
  }

  const rewardCards = cards.slice(0, 3);

  return {
    cards: rewardCards,
    comboId: comboBias?.comboId,
    comboName: comboBias?.comboName,
    comboHint: comboBias?.hint,
    comboPrimaryCardId: comboBias?.primaryCardId,
    reasons: createCardRewardReasonMap(run, rewardCards)
  };
}

export function createShopDraft(run: RunState): ShopDraft {
  const seed = getShopSeed(run);
  const roleCardPool = getShopRoleCardPool(run.characterId);
  const allCardPool = uniqueIds([...SHOP_TRAVEL_CARD_POOL, ...roleCardPool, ...SHOP_INK_CARD_POOL]);
  const usedCardIds = new Set<string>();
  const usedRelicIds = new Set<string>();
  const allRelicPool = getShopRelicPool(run.characterId);

  return {
    cards: [
      createShopCardOffer("travel", "行旅常备", "补气护身，稳住行程。", SHOP_TRAVEL_CARD_POOL, allCardPool, seed, usedCardIds),
      createShopCardOffer("role", "门路秘招", "照顾当前角色的拿牌方向。", roleCardPool, allCardPool, seed + 3, usedCardIds),
      createShopCardOffer("ink", "偏门异货", "更冒险，也更有记忆点。", SHOP_INK_CARD_POOL, allCardPool, seed + 7, usedCardIds)
    ],
    relics: [
      createShopRelicOffer(
        "utility",
        "江湖旧物",
        "泛用稳妥，谁都能用。",
        getUtilityShopRelicPool(run),
        allRelicPool,
        seed,
        usedRelicIds
      ),
      createShopRelicOffer(
        "role",
        "角色法门",
        "更贴近当前流派。",
        getRoleShopRelicPool(run),
        allRelicPool,
        seed + 5,
        usedRelicIds
      ),
      createShopRelicOffer(
        "premium",
        "压箱珍藏",
        "贵，但值得围着它构筑。",
        getPremiumShopRelicPool(run),
        allRelicPool,
        seed + 11,
        usedRelicIds
      )
    ]
  };
}

export function createRewardCards(run: RunState, nodeType: MapNodeType = "battle"): CardDefinition[] {
  return createCardRewardDraft(run, nodeType).cards;
}

export function getComboRewardHint(run: RunState): string | undefined {
  return getComboRewardBias(run)?.hint;
}

export function getComboRewardPrimaryCardId(run: RunState): string | undefined {
  return getComboRewardBias(run)?.primaryCardId;
}

export function createCardRewardReasonMap(run: RunState, cards: CardDefinition[]): Record<string, string> {
  const comboBias = getComboRewardBias(run);
  const preferredArchetype = comboBias ? getComboPreferredArchetype(run.characterId, comboBias.comboId) : undefined;
  const reasons: Record<string, string> = {};

  for (const card of cards) {
    reasons[card.id] = createCardRewardReason(card, comboBias, preferredArchetype);
  }

  return reasons;
}

export function addRelic(run: RunState, relicId: string): boolean {
  if (!relicsById[relicId]) {
    throw new Error(`Unknown relic: ${relicId}`);
  }

  if (run.relicIds.includes(relicId)) {
    return false;
  }

  run.relicIds.push(relicId);
  return true;
}

export function hasRunRelic(run: RunState, relicId: string): boolean {
  return run.relicIds.includes(relicId);
}

export function getNextRelicReward(run: RunState, pool: string[] = getRelicRewardPool("elite", run.characterId)): string | undefined {
  return pool.find((relicId) => !run.relicIds.includes(relicId));
}

export function claimRelicReward(run: RunState, pool: string[] = getRelicRewardPool("elite", run.characterId)): string | undefined {
  const relicId = getNextRelicReward(run, pool);
  if (!relicId) {
    return undefined;
  }

  addRelic(run, relicId);
  return relicId;
}

export function claimBattleSpoils(run: RunState, nodeType: MapNodeType): BattleSpoils {
  const gold = getBattleGold(nodeType);
  const relicId = nodeType === "elite" || nodeType === "boss" ? claimRelicReward(run, getRelicRewardPool(getRelicSourceForNode(nodeType), run.characterId)) : undefined;
  run.gold += gold;

  return relicId ? { gold, relicId } : { gold };
}

export function getCurrentChapter(run: RunState): ChapterDefinition {
  normalizeRunChapterFields(run);
  return chaptersById[run.chapterId];
}

export function getNextChapter(run: RunState): ChapterDefinition | undefined {
  const current = getCurrentChapter(run);
  return current.nextChapterId ? chaptersById[current.nextChapterId] : undefined;
}

export function advanceToNextChapter(run: RunState): boolean {
  normalizeRunChapterFields(run);
  const current = getCurrentChapter(run);
  const next = getNextChapter(run);
  if (!next) {
    if (current.id === "moyuan") {
      markFinalChapterComplete(run, current);
    }
    return false;
  }

  if (!run.completedChapterIds.includes(current.id)) {
    run.completedChapterIds.push(current.id);
  }

  run.chapterId = next.id;
  run.mapNodes = createMapForChapter(next.id, run.characterId, run.mapSeed);
  run.currentNodeId = "start";
  run.visitedNodeIds = [];
  run.lastCombatComboTriggers = [];
  run.finalState = {
    status: "inProgress",
    chapterId: next.id
  };
  return true;
}

export function getRunFinalState(run: RunState): RunFinalState {
  normalizeRunChapterFields(run);
  const current = getCurrentChapter(run);
  if (current.id === "moyuan" && run.completedChapterIds.includes("moyuan")) {
    return {
      ...(run.finalState?.status === "endingReady" ? run.finalState : {}),
      status: "endingReady",
      chapterId: "moyuan",
      bossId: current.bossEnemyId
    };
  }

  return run.finalState ?? {
    status: "inProgress",
    chapterId: run.chapterId
  };
}

export function recordRunFinalChoice(run: RunState, choice: RunFinalChoiceRecord): RunState {
  const finalState = getRunFinalState(run);
  if (finalState.status !== "endingReady") {
    return run;
  }

  run.finalState = {
    ...finalState,
    finalChoiceId: choice.finalChoiceId,
    worldEndingId: choice.worldEndingId,
    characterEpilogueId: choice.characterEpilogueId
  };
  return run;
}

export function createRunCompletionSnapshot(run: RunState): RunCompletionSnapshot | undefined {
  const finalState = getRunFinalState(run);
  if (finalState.status !== "endingReady") {
    return undefined;
  }

  return {
    status: "completed",
    characterId: run.characterId,
    completedChapterIds: [...run.completedChapterIds],
    unlockedFragmentIds: [...(run.logbook?.fragmentIds ?? [])],
    finalState: {
      ...finalState,
      status: "endingReady"
    },
    deckSize: run.deck.length,
    relicCount: run.relicIds.length,
    gold: run.gold,
    hp: run.hp,
    maxHp: run.maxHp
  };
}

export function createChapterRewardChoices(run: RunState): ChapterRewardChoice[] {
  normalizeRunChapterFields(run);
  const chapter = getCurrentChapter(run);
  const chapterKey = chapter.id;
  const rareCardId = getAdvancedRewardCardId(run);

  return [
    {
      id: `${chapterKey}-max-hp`,
      type: "maxHp",
      title: "清雨洗髓",
      summary: "最大生命 +6，并回复6点生命。",
      amount: 6
    },
    {
      id: `${chapterKey}-upgrade`,
      type: "upgrade",
      title: "残页点化",
      summary: "升级牌组中第一张尚未精修的牌。"
    },
    {
      id: `${chapterKey}-rare-card`,
      type: "card",
      title: "高阶武学",
      summary: `获得${cardsById[rareCardId]?.name ?? "一式高阶武学"}。`,
      cardId: rareCardId
    }
  ];
}

export function claimChapterReward(run: RunState, choiceId: string): ChapterRewardChoice | undefined {
  normalizeRunChapterFields(run);
  const choice = createChapterRewardChoices(run).find((item) => item.id === choiceId);
  if (!choice) {
    return undefined;
  }

  if (choice.type === "maxHp") {
    const amount = choice.amount ?? 0;
    run.maxHp += amount;
    run.hp = Math.min(run.maxHp, run.hp + amount);
  }

  if (choice.type === "upgrade") {
    const candidate = getUpgradeCandidates(run)[0];
    if (candidate) {
      upgradeDeckCard(run, candidate.instanceId);
    }
  }

  if (choice.type === "card" && choice.cardId) {
    const card = cardsById[choice.cardId];
    if (card) {
      takeCardReward(run, card);
    }
  }

  if (!run.chapterRewardHistory.includes(choice.id)) {
    run.chapterRewardHistory.push(choice.id);
  }
  run.rewardHistory.push(`chapterReward:${choice.id}`);
  return choice;
}

export function getCurrentNode(run: RunState): MapNode {
  const node = run.mapNodes.find((item) => item.id === run.currentNodeId);
  if (!node) {
    throw new Error(`Current node missing: ${run.currentNodeId}`);
  }

  return node;
}

export function getAvailableNodes(run: RunState): MapNode[] {
  const current = getCurrentNode(run);
  return current.connections.map((id) => getNode(run, id));
}

export function createMapNodePreview(run: RunState, node: MapNode): MapNodePreview {
  normalizeRunChapterFields(run);
  const chapter = getCurrentChapter(run);

  if (node.type === "start") {
    return {
      title: node.label,
      detail: `${chapter.name}起点，选择下一段江湖行旅。`,
      reward: "路线选择",
      tags: ["起点", chapter.name],
      tone: "current"
    };
  }

  if (node.type === "battle" || node.type === "elite" || node.type === "boss") {
    return createCombatNodePreview(run, node, chapter);
  }

  if (node.type === "event") {
    return createEventNodePreview(node, chapter);
  }

  if (node.type === "shop") {
    return {
      title: node.label,
      detail: `${node.label}：购买武学/法宝或删牌；当前铜钱${run.gold}。`,
      reward: "消费铜钱 / 调整牌组",
      tags: ["商店", "铜钱", "删牌"],
      tone: "opportunity"
    };
  }

  return {
    title: node.label,
    detail: `${node.label}：回复约30%生命（约${Math.ceil(run.maxHp * 0.3)}点）或精修一张未升级武学。`,
    reward: "治疗 / 升级",
    tags: ["回复", "升级", "低风险"],
    tone: "recovery"
  };
}

export function travelToNode(run: RunState, nodeId: string): RunState {
  const current = getCurrentNode(run);
  if (!current.connections.includes(nodeId)) {
    throw new Error(`Cannot travel from ${current.id} to ${nodeId}`);
  }

  if (!run.visitedNodeIds.includes(current.id)) {
    run.visitedNodeIds.push(current.id);
  }

  run.currentNodeId = nodeId;
  return run;
}

export function takeCardReward(run: RunState, card: CardDefinition): RunState {
  run.deck.push({
    instanceId: `run-card-${run.nextDeckInstanceNumber}`,
    cardId: card.id
  });
  run.nextDeckInstanceNumber += 1;
  run.rewardHistory.push(card.id);
  return run;
}

export function healRun(run: RunState, amount: number): number {
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + amount);
  return run.hp - before;
}

export function removeDeckCard(run: RunState, instanceId: string): boolean {
  const index = run.deck.findIndex((entry) => entry.instanceId === instanceId);
  if (index < 0) {
    return false;
  }

  run.deck.splice(index, 1);
  return true;
}

export function getRunDeckCardDefinitions(run: RunState): CardDefinition[] {
  return run.deck.map((entry) => {
    const card = cardsById[entry.cardId];
    if (!card) {
      throw new Error(`Unknown run deck card: ${entry.cardId}`);
    }

    return card;
  });
}

export function getUpgradeCandidates(run: RunState): RunState["deck"] {
  return run.deck.filter((entry) => !entry.upgraded);
}

export function upgradeDeckCard(run: RunState, instanceId: string): boolean {
  const entry = run.deck.find((item) => item.instanceId === instanceId);
  if (!entry || entry.upgraded) {
    return false;
  }

  entry.upgraded = true;
  return true;
}

function getComboRewardBias(run: RunState): ComboRewardBias | undefined {
  normalizeRunComboFields(run);
  const rule = getLatestComboRewardRule(run.lastCombatComboTriggers);
  if (!rule) {
    return undefined;
  }

  const candidateCardIds = getComboCandidateCardIds(rule, run.characterId).filter((cardId) => Boolean(cardsById[cardId]));
  const primaryCardId = candidateCardIds[0];
  if (!primaryCardId) {
    return undefined;
  }

  return {
    comboId: rule.id,
    comboName: rule.name,
    hint: `招式回响：${rule.name}，${rule.hint}`,
    primaryCardId,
    candidateCardIds
  };
}

function getComboPreferredArchetype(characterId: string, comboId: string): CardArchetypeId | undefined {
  return COMBO_ARCHETYPE_PREFERENCES[characterId]?.[comboId];
}

function createCardRewardReason(
  card: CardDefinition,
  comboBias: ComboRewardBias | undefined,
  preferredArchetype: CardArchetypeId | undefined
): string {
  const cardArchetypes = card.archetypes ?? [];

  if (preferredArchetype && cardArchetypes.includes(preferredArchetype)) {
    return `推荐：契合${ARCHETYPE_LABELS[preferredArchetype]}这一流派，承接${comboBias?.comboName ?? "当前"}招式。`;
  }

  if (cardArchetypes.length > 0) {
    return `推荐：补强${ARCHETYPE_LABELS[cardArchetypes[0]]}这一流派。`;
  }

  if (comboBias && comboBias.candidateCardIds.includes(card.id)) {
    return `推荐：承接${comboBias.comboName}招式回响，补足当前流派节奏。`;
  }

  if (card.types.includes("attack")) {
    return "推荐：补足输出密度，保持流派进攻节奏。";
  }

  if (card.types.includes("body")) {
    return "推荐：补足身法起手，帮助流派招式链转动。";
  }

  if (card.types.includes("mind")) {
    return "推荐：补足心境入口，增加流派攻防转向。";
  }

  if (card.rarity === "ink" || card.types.includes("ink")) {
    return "推荐：墨灾高收益入口，注意墨痕代价。";
  }

  return "推荐：补足防御与过牌，稳住第一章流派节奏。";
}

function getLatestComboRewardRule(comboTriggers: string[]): ComboRewardRule | undefined {
  for (let index = comboTriggers.length - 1; index >= 0; index -= 1) {
    const rule = COMBO_REWARD_RULES.find((item) => item.id === comboTriggers[index]);
    if (rule) {
      return rule;
    }
  }

  return undefined;
}

function getComboCandidateCardIds(rule: ComboRewardRule, characterId: string): string[] {
  return [...(rule.byCharacter?.[characterId] ?? []), ...rule.cardIds];
}

function addCardsById(cards: CardDefinition[], cardIds: string[]): void {
  for (const cardId of cardIds) {
    const card = cardsById[cardId];
    if (card && !cards.some((item) => item.id === card.id)) {
      cards.push(card);
    }
  }
}

function addRotatedCards(cards: CardDefinition[], cardIds: string[], offset: number, desiredCount: number): void {
  if (cardIds.length === 0 || cards.length >= desiredCount) {
    return;
  }

  for (let index = 0; index < cardIds.length && cards.length < desiredCount; index += 1) {
    const cardId = cardIds[(offset + index) % cardIds.length];
    addCardsById(cards, [cardId]);
  }
}

function pickRotatedCard(cardIds: string[], offset: number, existingCards: CardDefinition[]): CardDefinition | undefined {
  for (let index = 0; index < cardIds.length; index += 1) {
    const cardId = cardIds[(offset + index) % cardIds.length];
    const card = cardsById[cardId];
    if (card && !existingCards.some((item) => item.id === card.id)) {
      return card;
    }
  }

  return undefined;
}

function getRoleRewardPool(characterId: string): string[] {
  if (characterId === "diaochan") {
    return DIAO_REWARD_POOL;
  }

  if (characterId === "caiwenji") {
    return CAI_REWARD_POOL;
  }

  if (characterId === "zhugeliang") {
    return ZHUGE_REWARD_POOL;
  }

  return ZHAO_REWARD_POOL;
}

function getShopRoleCardPool(characterId: string): string[] {
  if (characterId === "diaochan") {
    return DIAO_SHOP_ROLE_POOL;
  }

  if (characterId === "caiwenji") {
    return CAI_SHOP_ROLE_POOL;
  }

  if (characterId === "zhugeliang") {
    return ZHUGE_SHOP_ROLE_POOL;
  }

  return ZHAO_SHOP_ROLE_POOL;
}

function getEliteRewardPool(characterId: string): string[] {
  if (characterId === "diaochan") {
    return ELITE_DIAO_REWARD_POOL;
  }

  if (characterId === "caiwenji") {
    return ELITE_CAI_REWARD_POOL;
  }

  if (characterId === "zhugeliang") {
    return ELITE_ZHUGE_REWARD_POOL;
  }

  return ELITE_ZHAO_REWARD_POOL;
}

function createShopCardOffer(
  slotId: ShopCardOffer["slotId"],
  label: string,
  note: string,
  primaryPool: string[],
  fallbackPool: string[],
  seed: number,
  usedCardIds: Set<string>
): ShopCardOffer {
  const card = pickUniqueCard(primaryPool, fallbackPool, seed, usedCardIds);
  usedCardIds.add(card.id);
  return {
    slotId,
    label,
    note,
    card,
    price: SHOP_CARD_PRICE
  };
}

function createShopRelicOffer(
  slotId: ShopRelicOffer["slotId"],
  label: string,
  note: string,
  primaryPool: string[],
  fallbackPool: string[],
  seed: number,
  usedRelicIds: Set<string>
): ShopRelicOffer {
  const relic = pickUniqueRelic(primaryPool, fallbackPool, seed, usedRelicIds);
  usedRelicIds.add(relic.id);
  return {
    slotId,
    label,
    note,
    relic
  };
}

function pickUniqueCard(primaryPool: string[], fallbackPool: string[], seed: number, usedCardIds: Set<string>): CardDefinition {
  for (const cardId of createSeededOfferOrder(primaryPool, fallbackPool, seed)) {
    const card = cardsById[cardId];
    if (card && !usedCardIds.has(card.id)) {
      return card;
    }
  }

  throw new Error("No shop card available for draft.");
}

function pickUniqueRelic(primaryPool: string[], fallbackPool: string[], seed: number, usedRelicIds: Set<string>): RelicDefinition {
  for (const relicId of createSeededOfferOrder(primaryPool, fallbackPool, seed)) {
    const relic = relicsById[relicId];
    if (relic && !usedRelicIds.has(relic.id)) {
      return relic;
    }
  }

  throw new Error("No shop relic available for draft.");
}

function createSeededOfferOrder(primaryPool: string[], fallbackPool: string[], seed: number): string[] {
  const uniquePrimary = uniqueIds(primaryPool);
  const uniqueFallback = uniqueIds(fallbackPool.filter((id) => !uniquePrimary.includes(id)));
  return [...rotateIds(uniquePrimary, seed), ...rotateIds(uniqueFallback, seed + 1)];
}

function rotateIds(ids: string[], seed: number): string[] {
  if (ids.length === 0) {
    return [];
  }

  const offset = Math.abs(seed) % ids.length;
  return ids.map((_, index) => ids[(offset + index) % ids.length]);
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function getShopSeed(run: RunState): number {
  normalizeRunChapterFields(run);
  const chapterOffset: Record<RunState["chapterId"], number> = {
    luoshui: 11,
    bamboo: 37,
    changan: 71,
    moyuan: 109
  };

  return Math.abs(run.mapSeed) + run.rewardHistory.length * 5 + run.visitedNodeIds.length * 7 + chapterOffset[run.chapterId];
}

function getUtilityShopRelicPool(run: RunState): string[] {
  return getShopRelicPool(run.characterId).filter((relicId) => {
    const relic = relicsById[relicId];
    return relic && !relic.character && relic.rarity !== "rare";
  });
}

function getRoleShopRelicPool(run: RunState): string[] {
  return getShopRelicPool(run.characterId).filter((relicId) => relicsById[relicId]?.character === run.characterId);
}

function getPremiumShopRelicPool(run: RunState): string[] {
  const pool = getShopRelicPool(run.characterId);
  const rarePool = pool.filter((relicId) => relicsById[relicId]?.rarity === "rare");
  const priceyFallback = pool.filter((relicId) => {
    const relic = relicsById[relicId];
    return relic && relic.rarity !== "rare" && relic.price >= 94;
  });
  return uniqueIds([...rarePool, ...priceyFallback]);
}

function normalizeRunComboFields(run: RunState): void {
  if (!Array.isArray(run.lastCombatComboTriggers)) {
    run.lastCombatComboTriggers = [];
  }

  if (!Array.isArray(run.comboRewardHistory)) {
    run.comboRewardHistory = [];
  }
}

function normalizeRunChapterFields(run: RunState): void {
  run.challengeId = resolveChallengeProfile(run.challengeId).id;

  if (!run.chapterId || !chaptersById[run.chapterId]) {
    run.chapterId = "luoshui";
  }

  if (!Array.isArray(run.completedChapterIds)) {
    run.completedChapterIds = [];
  }

  if (!Array.isArray(run.chapterRewardHistory)) {
    run.chapterRewardHistory = [];
  }

  if (!run.finalState || typeof run.finalState !== "object") {
    run.finalState = {
      status: "inProgress",
      chapterId: run.chapterId
    };
  }
}

function markFinalChapterComplete(run: RunState, chapter: ChapterDefinition): void {
  if (!run.completedChapterIds.includes(chapter.id)) {
    run.completedChapterIds.push(chapter.id);
  }

  run.finalState = {
    status: "endingReady",
    chapterId: chapter.id,
    bossId: chapter.bossEnemyId
  };
}

export function claimMethodUpgrade(run: RunState, methodId: string): boolean {
  normalizeRunMethodLevels(run);
  if (!run.methodIds.includes(methodId)) {
    return false;
  }

  const currentLevel = run.methodLevels?.[methodId] ?? 1;
  if (currentLevel >= 2) {
    return false;
  }

  run.methodLevels![methodId] = currentLevel + 1;
  run.rewardHistory.push(`methodUpgrade:${methodId}:${currentLevel + 1}`);
  return true;
}

export function normalizeRunMethodLevels(run: RunState): void {
  if (!Array.isArray(run.methodIds)) {
    run.methodIds = [];
  }

  if (!run.methodLevels || typeof run.methodLevels !== "object") {
    run.methodLevels = {};
  }

  for (const methodId of run.methodIds) {
    run.methodLevels[methodId] = Math.max(1, run.methodLevels[methodId] ?? 1);
  }
}

function getAdvancedRewardCardId(run: RunState): string {
  const pool = run.characterId === "diaochan"
    ? DIAO_ADVANCED_REWARD_POOL
    : run.characterId === "caiwenji"
      ? CAI_ADVANCED_REWARD_POOL
      : run.characterId === "zhugeliang"
        ? ZHUGE_ADVANCED_REWARD_POOL
        : ZHAO_ADVANCED_REWARD_POOL;
  return pool.find((cardId) => !run.deck.some((entry) => entry.cardId === cardId)) ?? pool[0];
}

function getNode(run: RunState, nodeId: string): MapNode {
  const node = run.mapNodes.find((item) => item.id === nodeId);
  if (!node) {
    throw new Error(`Map node missing: ${nodeId}`);
  }

  return node;
}

function getStartingRelicId(characterId: string): string {
  if (characterId === "diaochan") {
    return "relic_closed_moon_sachet";
  }

  if (characterId === "caiwenji") {
    return "relic_qingyu_qinhui";
  }

  if (characterId === "zhugeliang") {
    return "relic_white_feather_fan";
  }

  return "relic_white_dragon_tassel";
}

function getBattleGold(nodeType: MapNodeType): number {
  if (nodeType === "elite") {
    return 25;
  }

  if (nodeType === "boss") {
    return 50;
  }

  return nodeType === "battle" ? 12 : 0;
}

function getRelicSourceForNode(nodeType: MapNodeType): RelicRewardSource {
  return nodeType === "boss" ? "boss" : "elite";
}

function createCombatNodePreview(run: RunState, node: MapNode, chapter: ChapterDefinition): MapNodePreview {
  const enemy = node.enemyId ? enemiesById[node.enemyId] : undefined;
  const title = enemy?.name ?? node.label;
  const pressure = formatEnemyPressure(enemy);

  if (node.type === "battle") {
    return {
      title,
      detail: `${chapter.name}寻常战，${pressure}；胜后金币+${getBattleGold(node.type)}与三选一武学。`,
      reward: "金币+12 / 三选一武学",
      tags: ["常规", "卡牌奖励", "金币"],
      tone: "combat"
    };
  }

  if (node.type === "elite") {
    const nextRelicId = getNextRelicReward(run, getRelicRewardPool("elite", run.characterId));
    const relicName = nextRelicId ? relicsById[nextRelicId]?.name : undefined;

    return {
      title,
      detail: `${chapter.name}高风险精英，${pressure}；胜后金币+${getBattleGold(node.type)}，优先获得${relicName ?? "法宝"}与高阶武学。`,
      reward: "金币+25 / 法宝 / 稀有武学",
      tags: ["高风险", "法宝", "稀有牌"],
      tone: "danger"
    };
  }

  const finalRoute = chapter.id === "moyuan";
  return {
    title,
    detail: `${chapter.name}章节首领，${pressure}；胜后金币+${getBattleGold(node.type)}，进入${finalRoute ? "终局抉择" : "章末奖励"}。`,
    reward: finalRoute ? "金币+50 / 终局抉择" : "金币+50 / 法宝 / 章节奖励",
    tags: finalRoute ? ["首领", "终局", "高压"] : ["首领", "章节推进", "法宝"],
    tone: "boss"
  };
}

function createEventNodePreview(node: MapNode, chapter: ChapterDefinition): MapNodePreview {
  const event = node.eventId ? eventsById[node.eventId] : undefined;
  const title = event?.title ?? node.label;
  const choices = event?.choices.slice(0, 2).map((choice) => choice.label).join(" / ") || "未知选择";
  const tags = getEventEffectTags(event?.choices.flatMap((choice) => choice.effects) ?? []);

  return {
    title,
    detail: `${title}：可选${choices}；心境和代价会影响${chapter.name}后续路线。`,
    reward: "事件收益 / 代价",
    tags,
    tone: "opportunity"
  };
}

function formatEnemyPressure(enemy: EnemyDefinition | undefined): string {
  if (!enemy) {
    return "敌情未明";
  }

  const maxDamage = Math.max(0, ...enemy.intents.map(getIntentDamage));
  const specialNames = enemy.intents.flatMap((intent) => intent.type === "special" ? [intent.name] : []);

  if (maxDamage > 0) {
    return specialNames.length > 0
      ? `最高攻势${maxDamage}，兼有${specialNames.slice(0, 2).join("、")}`
      : `最高攻势${maxDamage}`;
  }

  if (specialNames.length > 0) {
    return `控场招式：${specialNames.slice(0, 2).join("、")}`;
  }

  return "偏防守蓄势";
}

function getIntentDamage(intent: EnemyIntent): number {
  if (intent.type === "attack") {
    return intent.damage * intent.hits;
  }

  if (intent.type !== "special") {
    return 0;
  }

  return intent.effects.reduce((total, effect) => {
    if (effect.action !== "damage") {
      return total;
    }

    return total + effect.amount * (effect.hits ?? 1);
  }, 0);
}

function getEventEffectTags(effects: EventChoiceEffect[]): string[] {
  const tags = new Set<string>(["奇遇"]);

  for (const effect of effects) {
    if (effect.type === "mind") {
      tags.add("心境");
    }
    if (effect.type === "hpLoss") {
      tags.add("生命代价");
    }
    if (effect.type === "heal") {
      tags.add("回复");
    }
    if (effect.type === "gold") {
      tags.add("铜钱");
    }
    if (effect.type === "card") {
      tags.add("卡牌");
    }
    if (effect.type === "inkCardOffer") {
      tags.add("墨灾");
    }
    if (effect.type === "upgrade") {
      tags.add("升级");
    }
    if (effect.type === "removeStarter") {
      tags.add("删牌");
    }
  }

  return [...tags].slice(0, 5);
}

function createMapForChapter(chapterId: ChapterId, characterId: string, mapSeed: number): MapNode[] {
  if (chapterId === "moyuan") {
    return createFinalChapterMap(characterId, mapSeed);
  }

  if (chapterId === "bamboo") {
    return createChapterTwoMap(characterId, mapSeed);
  }

  if (chapterId === "changan") {
    return createChapterThreeMap(characterId, mapSeed);
  }

  return createChapterOneMap(characterId, mapSeed);
}

function createChapterOneMap(characterId: string, mapSeed: number): MapNode[] {
  const firstEvent = getCharacterEventNode(characterId);
  const eliteEnemyId = mapSeed % 2 === 0 ? "elite_sword_echo" : "elite_blood_banner";
  const secondEliteEnemyId = mapSeed % 5 === 0 ? "elite_blood_banner" : "elite_sword_echo";
  const secondBattleEnemyId = mapSeed % 4 === 1 ? "enemy_paper_umbrella" : "enemy_faceless_soldier";
  const thirdBattleEnemyId = mapSeed % 3 === 2 ? "enemy_faceless_soldier" : "enemy_paper_umbrella";
  const sideBattleEnemyId = mapSeed % 2 === 0 ? "enemy_ink_bandit" : "enemy_faceless_soldier";
  const lateEventId = LATE_EVENT_POOL[Math.abs(mapSeed) % LATE_EVENT_POOL.length];

  return [
    {
      id: "start",
      type: "start",
      label: "黑雨渡口",
      floor: 0,
      lane: 1,
      connections: ["battle-1", "event-1", "battle-side-1"]
    },
    {
      id: "battle-1",
      type: "battle",
      label: "墨化山贼",
      floor: 1,
      lane: 0,
      enemyId: "enemy_ink_bandit",
      connections: ["shop-1", "battle-2"]
    },
    {
      id: "event-1",
      type: "event",
      label: firstEvent.label,
      floor: 1,
      lane: 1,
      eventId: firstEvent.eventId,
      connections: ["battle-2", "rest-1"]
    },
    {
      id: "battle-side-1",
      type: "battle",
      label: sideBattleEnemyId === "enemy_ink_bandit" ? "雨巷山贼" : "无面游兵",
      floor: 1,
      lane: 2,
      enemyId: sideBattleEnemyId,
      connections: ["event-2", "shop-1"]
    },
    {
      id: "shop-1",
      type: "shop",
      label: "茶亭游商",
      floor: 2,
      lane: 0,
      connections: ["elite-1", "rest-1"]
    },
    {
      id: "battle-2",
      type: "battle",
      label: secondBattleEnemyId === "enemy_paper_umbrella" ? "纸伞巡夜" : "无面兵卒",
      floor: 2,
      lane: 1,
      enemyId: secondBattleEnemyId,
      connections: ["rest-1", "battle-3"]
    },
    {
      id: "event-2",
      type: "event",
      label: eventsById[lateEventId]?.title ?? (lateEventId === "event_black_rain_ferry" ? "黑雨渡口" : firstEvent.label),
      floor: 2,
      lane: 2,
      eventId: lateEventId,
      connections: ["battle-2b", "rest-1"]
    },
    {
      id: "elite-1",
      type: "elite",
      label: eliteEnemyId === "elite_sword_echo" ? "剑痴残影" : "血旗都尉",
      floor: 3,
      lane: 0,
      enemyId: eliteEnemyId,
      connections: ["elite-2", "battle-3"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "废寺静修",
      floor: 3,
      lane: 1,
      connections: ["battle-3", "event-3"]
    },
    {
      id: "battle-2b",
      type: "battle",
      label: "墨潮伏兵",
      floor: 3,
      lane: 2,
      enemyId: mapSeed % 3 === 0 ? "enemy_paper_umbrella" : "enemy_ink_bandit",
      connections: ["battle-3", "event-3"]
    },
    {
      id: "elite-2",
      type: "elite",
      label: secondEliteEnemyId === "elite_sword_echo" ? "剑痴残影" : "血旗都尉",
      floor: 4,
      lane: 0,
      enemyId: secondEliteEnemyId,
      connections: ["boss"]
    },
    {
      id: "battle-3",
      type: "battle",
      label: thirdBattleEnemyId === "enemy_paper_umbrella" ? "纸伞女鬼" : "无面伏兵",
      floor: 4,
      lane: 1,
      enemyId: thirdBattleEnemyId,
      connections: ["boss"]
    },
    {
      id: "event-3",
      type: "event",
      label: "墨碑听潮",
      floor: 4,
      lane: 2,
      eventId: "event_black_rain_ferry",
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "墨影董卓",
      floor: 5,
      lane: 1,
      enemyId: "boss_ink_dongzhuo",
      connections: []
    }
  ];
}

function createChapterTwoMap(characterId: string, mapSeed: number): MapNode[] {
  const secondEvent = getChapterTwoRoleEventNode(characterId);
  const lateEventId = BAMBOO_EVENT_POOL[Math.abs(mapSeed + 3) % BAMBOO_EVENT_POOL.length];
  const firstBattleEnemyId = mapSeed % 3 === 0 ? "enemy_broken_scholar" : "enemy_bamboo_wraith";
  const secondBattleEnemyId = mapSeed % 2 === 0 ? "enemy_bamboo_wraith" : "enemy_broken_scholar";
  const sideBattleEnemyId = mapSeed % 5 === 0 ? "enemy_bamboo_soldier" : "enemy_broken_scholar";
  const eliteEnemyId = mapSeed % 2 === 0 ? "elite_qin_score" : "elite_bamboo_phalanx";

  return [
    {
      id: "start",
      type: "start",
      label: "雨入竹林",
      floor: 0,
      lane: 1,
      connections: ["battle-1", "event-1", "battle-side-1"]
    },
    {
      id: "battle-1",
      type: "battle",
      label: firstBattleEnemyId === "enemy_broken_scholar" ? "断笔书生" : "雨竹幽魂",
      floor: 1,
      lane: 0,
      enemyId: firstBattleEnemyId,
      connections: ["event-2", "battle-2"]
    },
    {
      id: "event-1",
      type: "event",
      label: "荒寺夜琴",
      floor: 1,
      lane: 1,
      eventId: "event_ruined_temple_night_qin",
      connections: ["battle-2", "rest-1", "event-tea"]
    },
    {
      id: "battle-side-1",
      type: "battle",
      label: sideBattleEnemyId === "enemy_bamboo_soldier" ? "兵煞竹影" : "断笔书生",
      floor: 1,
      lane: 2,
      enemyId: sideBattleEnemyId,
      connections: ["shop-1", "event-2"]
    },
    {
      id: "event-2",
      type: "event",
      label: secondEvent.label,
      floor: 2,
      lane: 0,
      eventId: secondEvent.eventId,
      connections: ["elite-1", "battle-2"]
    },
    {
      id: "battle-2",
      type: "battle",
      label: secondBattleEnemyId === "enemy_broken_scholar" ? "雨亭书生" : "竹雨亡魂",
      floor: 2,
      lane: 1,
      enemyId: secondBattleEnemyId,
      connections: ["rest-1", "battle-3"]
    },
    {
      id: "shop-1",
      type: "shop",
      label: "茶亭游商",
      floor: 2,
      lane: 2,
      connections: ["battle-3", "rest-1"]
    },
    {
      id: "event-tea",
      type: "event",
      label: "雨中茶亭",
      floor: 2,
      lane: 3,
      eventId: "event_rain_tea_pavilion",
      connections: ["battle-3", "rest-1"]
    },
    {
      id: "elite-1",
      type: "elite",
      label: eliteEnemyId === "elite_qin_score" ? "琴魔残谱" : "兵煞竹阵",
      floor: 3,
      lane: 0,
      enemyId: eliteEnemyId,
      connections: ["event-3", "boss"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "荒寺静修",
      floor: 3,
      lane: 1,
      connections: ["battle-3", "event-3"]
    },
    {
      id: "battle-3",
      type: "battle",
      label: "清音台残影",
      floor: 3,
      lane: 2,
      enemyId: mapSeed % 4 === 0 ? "enemy_bamboo_soldier" : "enemy_bamboo_wraith",
      connections: ["event-late", "boss"]
    },
    {
      id: "event-3",
      type: "event",
      label: "竹林问心",
      floor: 4,
      lane: 1,
      eventId: "event_bamboo_heart_question",
      connections: ["boss"]
    },
    {
      id: "event-late",
      type: "event",
      label: lateEventId === "event_broken_string_elder" ? "断弦老人" : "竹雨旧闻",
      floor: 4,
      lane: 2,
      eventId: lateEventId,
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "琴魔·残音",
      floor: 5,
      lane: 1,
      enemyId: "boss_qin_demon_echo",
      connections: []
    }
  ];
}

function createChapterThreeMap(characterId: string, mapSeed: number): MapNode[] {
  const firstBattleEnemyId = mapSeed % 2 === 0 ? "enemy_ink_market_guard" : "enemy_history_scribe";
  const secondBattleEnemyId = mapSeed % 3 === 0 ? "enemy_nameless_citizen" : "enemy_history_scribe";
  const sideBattleEnemyId = mapSeed % 5 === 0 ? "enemy_ink_market_guard" : "enemy_nameless_citizen";
  const eliteEnemyId = mapSeed % 2 === 0 ? "elite_memory_stela" : "elite_lubu_shadow";
  const secondEliteEnemyId = mapSeed % 4 === 0 ? "elite_lubu_shadow" : "elite_memory_stela";
  const roleEventId = characterId === "zhaoyun" ? "event_white_robed_stelae" : "event_faceless_stage";
  const lateEventId = CHANGAN_EVENT_POOL[Math.abs(mapSeed + 2) % CHANGAN_EVENT_POOL.length];

  return [
    {
      id: "start",
      type: "start",
      label: "无面市集",
      floor: 0,
      lane: 1,
      connections: ["event-1", "battle-1", "battle-side-1"]
    },
    {
      id: "event-1",
      type: "event",
      label: "无面市集",
      floor: 1,
      lane: 0,
      eventId: "event_nameless_market",
      connections: ["battle-2", "shop-1"]
    },
    {
      id: "battle-1",
      type: "battle",
      label: firstBattleEnemyId === "enemy_ink_market_guard" ? "墨市守卫" : "逆史书吏",
      floor: 1,
      lane: 1,
      enemyId: firstBattleEnemyId,
      connections: ["event-2", "battle-2"]
    },
    {
      id: "battle-side-1",
      type: "battle",
      label: sideBattleEnemyId === "enemy_ink_market_guard" ? "朱契守卫" : "无名城民",
      floor: 1,
      lane: 2,
      enemyId: sideBattleEnemyId,
      connections: ["shop-1", "event-2"]
    },
    {
      id: "shop-1",
      type: "shop",
      label: "墨城市肆",
      floor: 2,
      lane: 0,
      connections: ["elite-1", "rest-1"]
    },
    {
      id: "event-2",
      type: "event",
      label: "逆写史街",
      floor: 2,
      lane: 1,
      eventId: "event_rewritten_history_street",
      connections: ["battle-2", "rest-1"]
    },
    {
      id: "battle-2",
      type: "battle",
      label: secondBattleEnemyId === "enemy_nameless_citizen" ? "无名城民" : "逆史书吏",
      floor: 2,
      lane: 2,
      enemyId: secondBattleEnemyId,
      connections: ["battle-3", "elite-1"]
    },
    {
      id: "elite-1",
      type: "elite",
      label: eliteEnemyId === "elite_memory_stela" ? "白袍碑林" : "吕布墨影",
      floor: 3,
      lane: 0,
      enemyId: eliteEnemyId,
      connections: ["event-3", "boss"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "城墙静修",
      floor: 3,
      lane: 1,
      connections: ["battle-3", "event-3"]
    },
    {
      id: "battle-3",
      type: "battle",
      label: "墨城巡史",
      floor: 3,
      lane: 2,
      enemyId: mapSeed % 3 === 1 ? "enemy_ink_market_guard" : "enemy_history_scribe",
      connections: ["elite-2", "event-late", "boss"]
    },
    {
      id: "event-3",
      type: "event",
      label: roleEventId === "event_white_robed_stelae" ? "白袍碑林" : "无面戏台",
      floor: 4,
      lane: 0,
      eventId: roleEventId,
      connections: ["boss"]
    },
    {
      id: "elite-2",
      type: "elite",
      label: secondEliteEnemyId === "elite_memory_stela" ? "白袍碑林" : "吕布墨影",
      floor: 4,
      lane: 1,
      enemyId: secondEliteEnemyId,
      connections: ["boss"]
    },
    {
      id: "event-late",
      type: "event",
      label: lateEventId === "event_unfinished_chessboard" ? "未央棋局" : "墨城残页",
      floor: 4,
      lane: 2,
      eventId: lateEventId,
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "墨书执笔官",
      floor: 5,
      lane: 1,
      enemyId: "boss_scribe_officer",
      connections: []
    }
  ];
}

function createFinalChapterMap(characterId: string, mapSeed: number): MapNode[] {
  const roleQuestionLabel = characterId === "diaochan" ? "倾城之影" : "无归白龙";
  const roleQuestionEventId = MOYUAN_EVENT_POOL[Math.abs(mapSeed) % MOYUAN_EVENT_POOL.length];

  return [
    {
      id: "start",
      type: "start",
      label: "黑水镜",
      floor: 0,
      lane: 1,
      connections: ["event-1", "event-2"]
    },
    {
      id: "event-1",
      type: "event",
      label: "照心水镜",
      floor: 1,
      lane: 0,
      eventId: "event_heart_mirror",
      connections: ["rest-1", "event-3"]
    },
    {
      id: "event-2",
      type: "event",
      label: "未写之页",
      floor: 1,
      lane: 2,
      eventId: "event_unwritten_page",
      connections: ["event-3", "rest-1"]
    },
    {
      id: "rest-1",
      type: "rest",
      label: "漂页静修",
      floor: 2,
      lane: 0,
      connections: ["event-4", "boss"]
    },
    {
      id: "event-3",
      type: "event",
      label: roleQuestionLabel,
      floor: 2,
      lane: 1,
      eventId: roleQuestionEventId,
      connections: ["event-4", "boss"]
    },
    {
      id: "event-4",
      type: "event",
      label: "断笔祭坛",
      floor: 3,
      lane: 1,
      eventId: "event_broken_brush_altar",
      connections: ["boss"]
    },
    {
      id: "boss",
      type: "boss",
      label: "无名史官",
      floor: 4,
      lane: 1,
      enemyId: "boss_nameless_historian",
      connections: []
    }
  ];
}

function getCharacterEventNode(characterId: string): { label: string; eventId: string } {
  if (characterId === "zhaoyun") {
    return { label: "长坂回声", eventId: "event_changban_echo" };
  }

  if (characterId === "diaochan") {
    return { label: "宫灯旧宴", eventId: "event_palace_lantern_banquet" };
  }

  if (characterId === "caiwenji") {
    return { label: "清音遗谱", eventId: "event_qingyin_lost_score" };
  }

  if (characterId === "zhugeliang") {
    return { label: "星盘争局", eventId: "event_star_board_argument" };
  }

  return { label: "黑雨渡口", eventId: "event_black_rain_ferry" };
}

function getChapterTwoRoleEventNode(characterId: string): { label: string; eventId: string } {
  if (characterId === "zhaoyun") {
    return { label: "兵煞竹阵", eventId: "event_bamboo_soldier_array" };
  }

  if (characterId === "diaochan") {
    return { label: "红衣无面", eventId: "event_red_cloth_faceless" };
  }

  if (characterId === "caiwenji") {
    return { label: "竹下归歌", eventId: "event_bamboo_grave_song" };
  }

  if (characterId === "zhugeliang") {
    return { label: "空城风声", eventId: "event_empty_city_wind" };
  }

  return { label: "竹林问心", eventId: "event_bamboo_heart_question" };
}
