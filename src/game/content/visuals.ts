import { wave10CaiZhugeCardArt } from "./cardArt/wave10CaiZhugeCardArt";
import { wave10CommonCardArt } from "./cardArt/wave10CommonCardArt";
import { wave10ZhaoDiaoCardArt } from "./cardArt/wave10ZhaoDiaoCardArt";
import { wave27EaCardArt } from "./cardArt/wave27EaCardArt";
import { wave49EaCardArt } from "./cardArt/wave49EaCardArt";
import { wave50EaCardArt } from "./cardArt/wave50EaCardArt";
import type { CardVisualCueId, CombatVisualTone } from "../systems/combat/types";

export interface CombatPortraitDefinition {
  id: string;
  assetPath: string;
  standeePath?: string;
  alt: string;
  accent: "red" | "teal" | "ink";
}

export interface CardArtDefinition {
  id: string;
  assetPath: string;
  alt: string;
  accent: "red" | "teal" | "ink" | "gold";
}

export interface CombatSpriteSheetDefinition {
  id: string;
  assetPath: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  anchor: "bottom-center";
}

export interface BattlefieldAssetDefinition {
  id: string;
  assetPath: string;
  alt: string;
}

export interface SignatureVfxDefinition {
  id: CardVisualCueId;
  cardId: string;
  assetPath: string;
  className: string;
  testId: string;
  tone: CombatVisualTone;
  alt: string;
}

export const combatPortraitList: CombatPortraitDefinition[] = [
  {
    id: "zhaoyun",
    assetPath: "/assets/generated/zhaoyun-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/zhaoyun-standee-gpt-v2-cutout.png",
    alt: "Ink-wash portrait of male Zhao Yun with a spear",
    accent: "teal"
  },
  {
    id: "diaochan",
    assetPath: "/assets/generated/diaochan-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/diaochan-standee-gpt-v2-cutout.png",
    alt: "Ink-wash portrait of Diao Chan dancer with fan and flowing ribbons",
    accent: "red"
  },
  {
    id: "caiwenji",
    assetPath: "/assets/generated/gpt2-caiwenji-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-caiwenji-standee-cutout.png",
    alt: "Ink-wash portrait of Cai Wenji with guqin and teal sound waves",
    accent: "teal"
  },
  {
    id: "zhugeliang",
    assetPath: "/assets/generated/gpt2-zhugeliang-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-zhugeliang-standee-cutout.png",
    alt: "Ink-wash portrait of Zhuge Liang with feather fan and formation diagrams",
    accent: "teal"
  },
  {
    id: "enemy_ink_bandit",
    assetPath: "/assets/generated/gpt2-ink-bandit-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-ink-bandit-standee-cutout.png",
    alt: "Ink-corrupted bandit silhouette",
    accent: "ink"
  },
  {
    id: "enemy_faceless_soldier",
    assetPath: "/assets/generated/gpt2-faceless-soldier-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-faceless-soldier-standee-cutout.png",
    alt: "Faceless soldier ink silhouette",
    accent: "ink"
  },
  {
    id: "enemy_paper_umbrella",
    assetPath: "/assets/generated/gpt2-paper-umbrella-ghost-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-paper-umbrella-ghost-standee-cutout.png",
    alt: "Paper umbrella ghost in teal ink",
    accent: "teal"
  },
  {
    id: "elite_sword_echo",
    assetPath: "/assets/generated/gpt2-bamboo-soldier-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-bamboo-soldier-standee-cutout.png",
    alt: "Vetted ink soldier stand-in for sword echo elite",
    accent: "red"
  },
  {
    id: "elite_blood_banner",
    assetPath: "/assets/generated/gpt2-scribe-officer-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-scribe-officer-standee-cutout.png",
    alt: "Vetted red-seal officer stand-in for blood banner elite",
    accent: "red"
  },
  {
    id: "boss_ink_dongzhuo",
    assetPath: "/assets/generated/gpt2-ink-dongzhuo-boss-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-ink-dongzhuo-boss-standee-cutout.png",
    alt: "Ink shadow Dong Zhuo boss silhouette",
    accent: "ink"
  },
  {
    id: "enemy_bamboo_wraith",
    assetPath: "/assets/generated/gpt2-bamboo-wraith-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-bamboo-wraith-standee-cutout.png",
    alt: "Rain bamboo wraith in teal ink",
    accent: "teal"
  },
  {
    id: "enemy_broken_scholar",
    assetPath: "/assets/generated/gpt2-broken-scholar-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-broken-scholar-standee-cutout.png",
    alt: "Broken brush scholar ink apparition",
    accent: "ink"
  },
  {
    id: "enemy_bamboo_soldier",
    assetPath: "/assets/generated/gpt2-bamboo-soldier-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-bamboo-soldier-standee-cutout.png",
    alt: "Ink-corrupted bamboo soldier with spear and teal rain leaves",
    accent: "teal"
  },
  {
    id: "elite_qin_score",
    assetPath: "/assets/generated/gpt2-qin-score-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-qin-score-standee-cutout.png",
    alt: "Haunted qin-score elite surrounded by broken music scrolls",
    accent: "teal"
  },
  {
    id: "elite_bamboo_phalanx",
    assetPath: "/assets/generated/gpt2-bamboo-phalanx-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-bamboo-phalanx-standee-cutout.png",
    alt: "Bamboo phalanx commander with shield formation silhouettes",
    accent: "ink"
  },
  {
    id: "boss_qin_demon_echo",
    assetPath: "/assets/generated/gpt2-qin-demon-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-qin-demon-standee-cutout.png",
    alt: "Qin Demon Echo boss in cold teal ink",
    accent: "teal"
  },
  {
    id: "enemy_ink_market_guard",
    assetPath: "/assets/generated/gpt2-ink-market-guard-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-ink-market-guard-standee-cutout.png",
    alt: "Ink market guard in Chang'an black and cinnabar",
    accent: "ink"
  },
  {
    id: "enemy_history_scribe",
    assetPath: "/assets/generated/gpt2-history-scribe-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-history-scribe-standee-cutout.png",
    alt: "History scribe with red brush and ink scrolls",
    accent: "red"
  },
  {
    id: "enemy_nameless_citizen",
    assetPath: "/assets/generated/gpt2-nameless-citizen-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-nameless-citizen-standee-cutout.png",
    alt: "Nameless masked citizen in ink robes",
    accent: "ink"
  },
  {
    id: "elite_lubu_shadow",
    assetPath: "/assets/generated/gpt2-lubu-shadow-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-lubu-shadow-standee-cutout.png",
    alt: "Lu Bu ink shadow with halberd",
    accent: "red"
  },
  {
    id: "elite_memory_stela",
    assetPath: "/assets/generated/gpt2-memory-stela-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-memory-stela-standee-cutout.png",
    alt: "White-robed memory stela elite in ink mist",
    accent: "teal"
  },
  {
    id: "boss_scribe_officer",
    assetPath: "/assets/generated/gpt2-scribe-officer-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-scribe-officer-standee-cutout.png",
    alt: "Ink book scribe officer boss with cinnabar seal",
    accent: "red"
  },
  {
    id: "boss_nameless_historian",
    assetPath: "/assets/generated/gpt2-nameless-historian-standee-cutout.png",
    standeePath: "/assets/generated/gpt2-nameless-historian-standee-cutout.png",
    alt: "Nameless Historian final boss with cinnabar brush and torn scrolls",
    accent: "red"
  }
];

export const combatPortraitsById: Record<string, CombatPortraitDefinition> = Object.fromEntries(
  combatPortraitList.map((portrait) => [portrait.id, portrait])
);

export const cardArtList: CardArtDefinition[] = [
  {
    id: "zhao_break_spear",
    assetPath: "/assets/generated/cards/gpt2-zhao-break-spear.png",
    alt: "Zhao Yun breaking spear ink card art",
    accent: "red"
  },
  {
    id: "zhao_strike",
    assetPath: "/assets/generated/cards/wave64-zhao-strike-gpt2.png",
    alt: "Zhao Yun spear strike card art in teal ink",
    accent: "teal"
  },
  {
    id: "zhao_guard",
    assetPath: "/assets/generated/cards/wave64-zhao-guard-gpt2.png",
    alt: "Zhao Yun guard card art with spear wall",
    accent: "teal"
  },
  {
    id: "zhao_longdan",
    assetPath: "/assets/generated/cards/wave64-zhao-longdan-gpt2.png",
    alt: "Zhao Yun Longdan card art with white dragon spear",
    accent: "teal"
  },
  {
    id: "zhao_river_guard",
    assetPath: "/assets/generated/cards/gpt2-zhao-river-guard.png",
    alt: "Zhao Yun river guard ink card art",
    accent: "teal"
  },
  {
    id: "zhao_seven_entries",
    assetPath: "/assets/generated/cards/gpt2-zhao-seven-entries.png",
    alt: "Zhao Yun seven entries spear rush ink card art",
    accent: "gold"
  },
  {
    id: "zhao_white_horse_breakout",
    assetPath: "/assets/generated/cards/gpt2-zhao-white-horse-breakout.png",
    alt: "White horse breakout ink card art",
    accent: "teal"
  },
  {
    id: "zhao_return_spear",
    assetPath: "/assets/generated/cards/gpt2-zhao-return-spear.png",
    alt: "Return spear counter ink card art",
    accent: "teal"
  },
  {
    id: "zhao_spear_wall",
    assetPath: "/assets/generated/cards/gpt2-zhao-spear-wall.png",
    alt: "Spear wall guard ink card art",
    accent: "teal"
  },
  {
    id: "diao_charm",
    assetPath: "/assets/generated/cards/card-red-ribbon-gpt.png",
    alt: "Charm ribbon ink card art",
    accent: "teal"
  },
  {
    id: "diao_strike",
    assetPath: "/assets/generated/cards/wave64-diao-strike-gpt2.png",
    alt: "Diao Chan fan strike card art in red silk ink",
    accent: "red"
  },
  {
    id: "diao_guard",
    assetPath: "/assets/generated/cards/wave64-diao-guard-gpt2.png",
    alt: "Diao Chan guarded dance card art with ribbon screen",
    accent: "red"
  },
  {
    id: "diao_lingbo",
    assetPath: "/assets/generated/cards/wave64-diao-lingbo-gpt2.png",
    alt: "Diao Chan Lingbo step card art with petal footwork",
    accent: "teal"
  },
  {
    id: "diao_closed_moon",
    assetPath: "/assets/generated/cards/card-meditation-guard-gpt.png",
    alt: "Closed moon dance ink card art",
    accent: "teal"
  },
  {
    id: "diao_lotus_blade",
    assetPath: "/assets/generated/cards/gpt2-diao-lotus-blade.png",
    alt: "Diao Chan lotus hidden blade ink card art",
    accent: "red"
  },
  {
    id: "diao_jinghong_strike",
    assetPath: "/assets/generated/cards/foundation-red-v16-diao-jinghong-strike.png",
    alt: "Diao Chan swan-strike ribbon ink card art",
    accent: "red"
  },
  {
    id: "diao_flying_sleeves",
    assetPath: "/assets/generated/cards/gpt2-diao-flying-sleeves.png",
    alt: "Diao Chan flying sleeves ink card art",
    accent: "teal"
  },
  {
    id: "diao_lijian",
    assetPath: "/assets/generated/cards/gpt2-diao-lijian.png",
    alt: "Diao Chan discord charm ink card art",
    accent: "red"
  },
  {
    id: "diao_mirror_flower",
    assetPath: "/assets/generated/cards/gpt2-diao-mirror-flower.png",
    alt: "Diao Chan mirror flower ink card art",
    accent: "teal"
  },
  {
    id: "ink_luoshui_tide",
    assetPath: "/assets/generated/cards/card-ink-slash-gpt.png",
    alt: "Luoshui ink tide card art",
    accent: "ink"
  },
  {
    id: "common_jiexue",
    assetPath: "/assets/generated/cards/gpt2-common-jiexue.png",
    alt: "Acupoint cleanse card art in white ink and teal rain",
    accent: "teal"
  },
  {
    id: "common_xixin",
    assetPath: "/assets/generated/cards/gpt2-common-xixin.png",
    alt: "Cleanse heart card art with clear rain and ink paper",
    accent: "teal"
  },
  {
    id: "status_zayin",
    assetPath: "/assets/generated/cards/gpt2-status-zayin.png",
    alt: "Noise status card art with broken qin lines",
    accent: "ink"
  },
  {
    id: "status_canyin",
    assetPath: "/assets/generated/cards/gpt2-status-canyin.png",
    alt: "Echo status card art with cold teal sound waves",
    accent: "ink"
  },
  {
    id: "cai_plain_strike",
    assetPath: "/assets/generated/cards/wave64-cai-plain-strike-gpt2.png",
    alt: "Cai Wenji plain strike card art with qin-string slash",
    accent: "teal"
  },
  {
    id: "cai_pluck_string",
    assetPath: "/assets/generated/cards/wave64-cai-pluck-string-gpt2.png",
    alt: "Cai Wenji pluck string card art with teal sound waves",
    accent: "teal"
  },
  {
    id: "cai_gong_tone",
    assetPath: "/assets/generated/cards/wave64-cai-gong-tone-gpt2.png",
    alt: "Cai Wenji gong tone card art with resonant jade wave",
    accent: "gold"
  },
  {
    id: "cai_qingxin_song",
    assetPath: "/assets/generated/cards/gpt2-cai-qingxin-song.png",
    alt: "Cai Wenji Qingxin Song card art with teal cleansing guqin waves",
    accent: "teal"
  },
  {
    id: "cai_hujia_beat",
    assetPath: "/assets/generated/cards/gpt2-cai-hujia-beat.png",
    alt: "Cai Wenji Hujia Beat card art with sound blades",
    accent: "teal"
  },
  {
    id: "cai_final_song",
    assetPath: "/assets/generated/cards/gpt2-cai-final-song.png",
    alt: "Cai Wenji Final Song card art with luminous guqin chord",
    accent: "gold"
  },
  {
    id: "zhuge_fan_strike",
    assetPath: "/assets/generated/cards/wave64-zhuge-fan-strike-gpt2.png",
    alt: "Zhuge Liang fan strike card art with wind and star chart",
    accent: "teal"
  },
  {
    id: "zhuge_guard",
    assetPath: "/assets/generated/cards/wave64-zhuge-guard-gpt2.png",
    alt: "Zhuge Liang guard card art with formation shield",
    accent: "teal"
  },
  {
    id: "zhuge_observe_stars",
    assetPath: "/assets/generated/cards/gpt2-zhuge-observe-stars.png",
    alt: "Zhuge Liang Observe Stars card art with astrolabe and star trails",
    accent: "gold"
  },
  {
    id: "zhuge_small_eight_array",
    assetPath: "/assets/generated/cards/gpt2-zhuge-eight-array.png",
    alt: "Zhuge Liang Eight Array card art with bagua formation",
    accent: "teal"
  },
  {
    id: "zhuge_borrow_wind",
    assetPath: "/assets/generated/cards/gpt2-zhuge-borrow-wind.png",
    alt: "Zhuge Liang Borrow Wind card art with feather fan and eastern wind",
    accent: "teal"
  },
  {
    id: "status_redacted_history",
    assetPath: "/assets/generated/cards/gpt2-status-redacted-history.png",
    alt: "Redacted history status card with cinnabar brush marks",
    accent: "red"
  },
  ...wave10CommonCardArt,
  ...wave10ZhaoDiaoCardArt,
  ...wave10CaiZhugeCardArt,
  ...wave27EaCardArt,
  ...wave49EaCardArt,
  ...wave50EaCardArt,
  {
    id: "type_attack",
    assetPath: "/assets/generated/cards/card-red-spear-gpt.png",
    alt: "Default attack ink card art",
    accent: "red"
  },
  {
    id: "type_skill",
    assetPath: "/assets/generated/cards/card-teal-dodge-gpt.png",
    alt: "Default skill ink card art",
    accent: "teal"
  },
  {
    id: "type_body",
    assetPath: "/assets/generated/cards/card-teal-dodge-gpt.png",
    alt: "Default body skill ink card art",
    accent: "teal"
  },
  {
    id: "type_ink",
    assetPath: "/assets/generated/cards/card-ink-slash-gpt.png",
    alt: "Default ink disaster card art",
    accent: "ink"
  },
  {
    id: "type_mind",
    assetPath: "/assets/generated/cards/card-meditation-guard-gpt.png",
    alt: "Default mind card art",
    accent: "teal"
  }
];

export const cardArtById: Record<string, CardArtDefinition> = Object.fromEntries(
  cardArtList.map((art) => [art.id, art])
);

export const signatureVfxList: SignatureVfxDefinition[] = [
  {
    id: "zhao-seven-entries",
    cardId: "zhao_seven_entries",
    assetPath: "/assets/generated/vfx/zhao-seven-entries-trail.png",
    className: "combat-vfx-seven-entries",
    testId: "combat-vfx-signature-zhao-seven-entries",
    tone: "gold",
    alt: "Seven spear afterimages in gold and ink"
  },
  {
    id: "zhao-spear-wall",
    cardId: "zhao_spear_wall",
    assetPath: "/assets/generated/vfx/zhao-spear-wall-ward.png",
    className: "combat-vfx-spear-wall",
    testId: "combat-vfx-signature-zhao-spear-wall",
    tone: "teal",
    alt: "Circular spear wall guard ink effect"
  },
  {
    id: "diao-jinghong-strike",
    cardId: "diao_jinghong_strike",
    assetPath: "/assets/generated/vfx/diao-jinghong-ribbon.png",
    className: "combat-vfx-jinghong-strike",
    testId: "combat-vfx-signature-diao-jinghong-strike",
    tone: "red",
    alt: "Crimson ribbon slash with petal ink"
  },
  {
    id: "diao-lijian",
    cardId: "diao_lijian",
    assetPath: "/assets/generated/vfx/diao-lijian-moon.png",
    className: "combat-vfx-lijian",
    testId: "combat-vfx-signature-diao-lijian",
    tone: "red",
    alt: "Moon fan charm seal in crimson ink"
  }
];

export const signatureVfxByCue: Record<CardVisualCueId, SignatureVfxDefinition> = Object.fromEntries(
  signatureVfxList.map((effect) => [effect.id, effect])
) as Record<CardVisualCueId, SignatureVfxDefinition>;

export const combatSpriteSheetList: CombatSpriteSheetDefinition[] = [
  {
    id: "zhaoyun_attack",
    assetPath: "/assets/sprites/zhaoyun-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "diaochan_attack",
    assetPath: "/assets/sprites/diaochan-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "caiwenji_attack",
    assetPath: "/assets/sprites/caiwenji-qin-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "zhugeliang_attack",
    assetPath: "/assets/sprites/zhugeliang-formation-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "ink_bandit_attack",
    assetPath: "/assets/sprites/ink-bandit-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "paper_umbrella_attack",
    assetPath: "/assets/sprites/paper-umbrella-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "sword_echo_attack",
    assetPath: "/assets/sprites/sword-echo-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "blood_banner_attack",
    assetPath: "/assets/sprites/blood-banner-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "ink_dongzhuo_boss_attack",
    assetPath: "/assets/sprites/ink-dongzhuo-boss-attack-strip-gpt-v2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "bamboo_wraith_attack",
    assetPath: "/assets/sprites/bamboo-wraith-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "broken_scholar_attack",
    assetPath: "/assets/sprites/broken-scholar-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "bamboo_soldier_attack",
    assetPath: "/assets/sprites/bamboo-soldier-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "qin_score_attack",
    assetPath: "/assets/sprites/qin-score-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "bamboo_phalanx_attack",
    assetPath: "/assets/sprites/bamboo-phalanx-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "lubu_shadow_attack",
    assetPath: "/assets/sprites/lubu-shadow-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "qin_demon_attack",
    assetPath: "/assets/sprites/qin-demon-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "history_scribe_attack",
    assetPath: "/assets/sprites/history-scribe-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "scribe_officer_attack",
    assetPath: "/assets/sprites/scribe-officer-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "nameless_historian_attack",
    assetPath: "/assets/sprites/nameless-historian-attack-strip-gpt2.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  }
];

export const combatSpriteSheetsById: Record<string, CombatSpriteSheetDefinition> = Object.fromEntries(
  combatSpriteSheetList.map((sheet) => [sheet.id, sheet])
);

const combatAttackSpriteSheetIdsByCombatantId: Record<string, string> = {
  "zhaoyun": "zhaoyun_attack",
  "diaochan": "diaochan_attack",
  "caiwenji": "caiwenji_attack",
  "zhugeliang": "zhugeliang_attack",
  "enemy_ink_bandit": "ink_bandit_attack",
  "enemy_faceless_soldier": "ink_bandit_attack",
  "enemy_paper_umbrella": "paper_umbrella_attack",
  "elite_sword_echo": "sword_echo_attack",
  "elite_blood_banner": "blood_banner_attack",
  "boss_ink_dongzhuo": "ink_dongzhuo_boss_attack",
  "enemy_bamboo_wraith": "bamboo_wraith_attack",
  "elite_qin_score": "qin_score_attack",
  "enemy_broken_scholar": "broken_scholar_attack",
  "enemy_bamboo_soldier": "bamboo_soldier_attack",
  "elite_bamboo_phalanx": "bamboo_phalanx_attack",
  "boss_qin_demon_echo": "qin_demon_attack",
  "elite_lubu_shadow": "lubu_shadow_attack",
  "enemy_history_scribe": "history_scribe_attack",
  "enemy_ink_market_guard": "history_scribe_attack",
  "enemy_nameless_citizen": "history_scribe_attack",
  "elite_memory_stela": "history_scribe_attack",
  "boss_scribe_officer": "scribe_officer_attack",
  "boss_nameless_historian": "nameless_historian_attack"
};

export function getCombatAttackSprite(id: string): CombatSpriteSheetDefinition | undefined {
  const sheetId = combatAttackSpriteSheetIdsByCombatantId[id] ?? "ink_bandit_attack";
  return combatSpriteSheetsById[sheetId];
}

export const battlefieldAssets: Record<string, BattlefieldAssetDefinition> = {
  luoshui: {
    id: "luoshui",
    assetPath: "/assets/generated/luoshui-battlefield-gpt.png",
    alt: "Luoshui ink-wash battlefield"
  },
  bamboo: {
    id: "bamboo",
    assetPath: "/assets/generated/gpt2-bamboo-battlefield.png",
    alt: "Rain bamboo forest battlefield with qin echoes"
  },
  changan: {
    id: "changan",
    assetPath: "/assets/generated/gpt2-changan-battlefield.png",
    alt: "Chang'an ink city battlefield with red seals"
  },
  moyuan: {
    id: "moyuan",
    assetPath: "/assets/generated/gpt2-moyuan-battlefield.png",
    alt: "Moyuan black-water mirror battlefield with torn history pages"
  }
};
