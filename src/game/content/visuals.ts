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
    id: "enemy_ink_bandit",
    assetPath: "/assets/generated/ink-bandit-standee-gpt.png",
    standeePath: "/assets/generated/ink-bandit-standee-gpt-cutout.png",
    alt: "Ink-corrupted bandit silhouette",
    accent: "ink"
  },
  {
    id: "enemy_faceless_soldier",
    assetPath: "/assets/generated/ink-bandit-standee-gpt.png",
    standeePath: "/assets/generated/ink-bandit-standee-gpt-cutout.png",
    alt: "Faceless soldier ink silhouette",
    accent: "ink"
  },
  {
    id: "enemy_paper_umbrella",
    assetPath: "/assets/generated/paper-umbrella-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/paper-umbrella-standee-gpt-v2-cutout.png",
    alt: "Paper umbrella ghost in teal ink",
    accent: "teal"
  },
  {
    id: "elite_sword_echo",
    assetPath: "/assets/generated/sword-echo-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/sword-echo-standee-gpt-v2-cutout.png",
    alt: "Sword echo elite ink silhouette",
    accent: "red"
  },
  {
    id: "elite_blood_banner",
    assetPath: "/assets/generated/blood-banner-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/blood-banner-standee-gpt-v2-cutout.png",
    alt: "Blood banner officer ink silhouette",
    accent: "red"
  },
  {
    id: "boss_ink_dongzhuo",
    assetPath: "/assets/generated/ink-dongzhuo-boss-standee-gpt-v2-cutout.png",
    standeePath: "/assets/generated/ink-dongzhuo-boss-standee-gpt-v2-cutout.png",
    alt: "Ink shadow Dong Zhuo boss silhouette",
    accent: "ink"
  },
  {
    id: "enemy_bamboo_wraith",
    assetPath: "/assets/generated/bamboo-wraith-standee-ink-pass.png",
    standeePath: "/assets/generated/bamboo-wraith-standee-ink-pass.png",
    alt: "Rain bamboo wraith in teal ink",
    accent: "teal"
  },
  {
    id: "enemy_broken_scholar",
    assetPath: "/assets/generated/broken-scholar-standee-ink-pass.png",
    standeePath: "/assets/generated/broken-scholar-standee-ink-pass.png",
    alt: "Broken brush scholar ink apparition",
    accent: "ink"
  },
  {
    id: "enemy_bamboo_soldier",
    assetPath: "/assets/generated/bamboo-soldier-standee-ink-pass.png",
    standeePath: "/assets/generated/bamboo-soldier-standee-ink-pass.png",
    alt: "Bamboo phalanx soldier ink shade",
    accent: "teal"
  },
  {
    id: "elite_qin_score",
    assetPath: "/assets/generated/qin-score-standee-ink-pass.png",
    standeePath: "/assets/generated/qin-score-standee-ink-pass.png",
    alt: "Qin score elite surrounded by rain ink",
    accent: "teal"
  },
  {
    id: "elite_bamboo_phalanx",
    assetPath: "/assets/generated/bamboo-phalanx-standee-ink-pass.png",
    standeePath: "/assets/generated/bamboo-phalanx-standee-ink-pass.png",
    alt: "Bamboo battle array elite ink soldier",
    accent: "ink"
  },
  {
    id: "boss_qin_demon_echo",
    assetPath: "/assets/generated/qin-demon-standee-ink-pass.png",
    standeePath: "/assets/generated/qin-demon-standee-ink-pass.png",
    alt: "Qin Demon Echo boss in cold teal ink",
    accent: "teal"
  },
  {
    id: "enemy_ink_market_guard",
    assetPath: "/assets/generated/ink-market-guard-standee-ink-pass.png",
    standeePath: "/assets/generated/ink-market-guard-standee-ink-pass.png",
    alt: "Ink market guard in Chang'an black and cinnabar",
    accent: "ink"
  },
  {
    id: "enemy_history_scribe",
    assetPath: "/assets/generated/history-scribe-standee-ink-pass.png",
    standeePath: "/assets/generated/history-scribe-standee-ink-pass.png",
    alt: "History scribe with red brush and ink scrolls",
    accent: "red"
  },
  {
    id: "enemy_nameless_citizen",
    assetPath: "/assets/generated/nameless-citizen-standee-ink-pass.png",
    standeePath: "/assets/generated/nameless-citizen-standee-ink-pass.png",
    alt: "Nameless masked citizen in ink robes",
    accent: "ink"
  },
  {
    id: "elite_lubu_shadow",
    assetPath: "/assets/generated/lubu-shadow-standee-ink-pass.png",
    standeePath: "/assets/generated/lubu-shadow-standee-ink-pass.png",
    alt: "Lu Bu ink shadow with halberd",
    accent: "red"
  },
  {
    id: "elite_memory_stela",
    assetPath: "/assets/generated/memory-stela-standee-ink-pass.png",
    standeePath: "/assets/generated/memory-stela-standee-ink-pass.png",
    alt: "White-robed memory stela elite in ink mist",
    accent: "teal"
  },
  {
    id: "boss_scribe_officer",
    assetPath: "/assets/generated/scribe-officer-standee-ink-pass.png",
    standeePath: "/assets/generated/scribe-officer-standee-ink-pass.png",
    alt: "Ink book scribe officer boss with cinnabar seal",
    accent: "red"
  }
];

export const combatPortraitsById: Record<string, CombatPortraitDefinition> = Object.fromEntries(
  combatPortraitList.map((portrait) => [portrait.id, portrait])
);

export const cardArtList: CardArtDefinition[] = [
  {
    id: "zhao_break_spear",
    assetPath: "/assets/generated/cards/zhao-break-spear-ink-pass.png",
    alt: "Zhao Yun breaking spear ink card art",
    accent: "red"
  },
  {
    id: "zhao_strike",
    assetPath: "/assets/generated/cards/card-red-spear-gpt.png",
    alt: "Spear strike ink card art",
    accent: "red"
  },
  {
    id: "zhao_qixing_spear",
    assetPath: "/assets/generated/cards/card-red-spear-gpt.png",
    alt: "Seven star spear shadow card art",
    accent: "gold"
  },
  {
    id: "zhao_river_guard",
    assetPath: "/assets/generated/cards/zhao-river-guard-ink-pass.png",
    alt: "Zhao Yun river guard ink card art",
    accent: "teal"
  },
  {
    id: "zhao_seven_entries",
    assetPath: "/assets/generated/cards/zhao-seven-entries-ink-pass.png",
    alt: "Zhao Yun seven entries spear rush ink card art",
    accent: "gold"
  },
  {
    id: "zhao_white_horse_breakout",
    assetPath: "/assets/generated/cards/zhao-white-horse-breakout-ink-pass.png",
    alt: "White horse breakout ink card art",
    accent: "teal"
  },
  {
    id: "zhao_return_spear",
    assetPath: "/assets/generated/cards/zhao-return-spear-ink-pass.png",
    alt: "Return spear counter ink card art",
    accent: "teal"
  },
  {
    id: "zhao_spear_wall",
    assetPath: "/assets/generated/cards/zhao-spear-wall-ink-pass.png",
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
    id: "diao_closed_moon",
    assetPath: "/assets/generated/cards/card-meditation-guard-gpt.png",
    alt: "Closed moon dance ink card art",
    accent: "teal"
  },
  {
    id: "diao_lotus_blade",
    assetPath: "/assets/generated/cards/diao-lotus-blade-ink-pass.png",
    alt: "Diao Chan lotus hidden blade ink card art",
    accent: "red"
  },
  {
    id: "diao_jinghong_strike",
    assetPath: "/assets/generated/cards/diao-jinghong-strike-ink-pass.png",
    alt: "Diao Chan swan-strike ribbon ink card art",
    accent: "red"
  },
  {
    id: "diao_flying_sleeves",
    assetPath: "/assets/generated/cards/diao-flying-sleeves-ink-pass.png",
    alt: "Diao Chan flying sleeves ink card art",
    accent: "teal"
  },
  {
    id: "diao_lijian",
    assetPath: "/assets/generated/cards/diao-lijian-ink-pass.png",
    alt: "Diao Chan discord charm ink card art",
    accent: "red"
  },
  {
    id: "diao_mirror_flower",
    assetPath: "/assets/generated/cards/diao-mirror-flower-ink-pass.png",
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
    assetPath: "/assets/generated/cards/common-jiexue-cleanse-ink-pass.png",
    alt: "Acupoint cleanse card art in white ink and teal rain",
    accent: "teal"
  },
  {
    id: "common_xixin",
    assetPath: "/assets/generated/cards/common-xixin-cleanse-ink-pass.png",
    alt: "Cleanse heart card art with clear rain and ink paper",
    accent: "teal"
  },
  {
    id: "status_zayin",
    assetPath: "/assets/generated/cards/status-zayin-ink-pass.png",
    alt: "Noise status card art with broken qin lines",
    accent: "ink"
  },
  {
    id: "status_canyin",
    assetPath: "/assets/generated/cards/status-canyin-ink-pass.png",
    alt: "Echo status card art with cold teal sound waves",
    accent: "ink"
  },
  {
    id: "status_redacted_history",
    assetPath: "/assets/generated/cards/status-redacted-history-ink-pass.png",
    alt: "Redacted history status card with cinnabar brush marks",
    accent: "red"
  },
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
    assetPath: "/assets/sprites/bamboo-wraith-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "broken_scholar_attack",
    assetPath: "/assets/sprites/broken-scholar-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "bamboo_soldier_attack",
    assetPath: "/assets/sprites/bamboo-soldier-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "qin_demon_attack",
    assetPath: "/assets/sprites/qin-demon-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "history_scribe_attack",
    assetPath: "/assets/sprites/history-scribe-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  },
  {
    id: "scribe_officer_attack",
    assetPath: "/assets/sprites/scribe-officer-attack-strip-ink-pass.png",
    frameCount: 4,
    frameWidth: 512,
    frameHeight: 512,
    anchor: "bottom-center"
  }
];

export const combatSpriteSheetsById: Record<string, CombatSpriteSheetDefinition> = Object.fromEntries(
  combatSpriteSheetList.map((sheet) => [sheet.id, sheet])
);

export const battlefieldAssets: Record<string, BattlefieldAssetDefinition> = {
  luoshui: {
    id: "luoshui",
    assetPath: "/assets/generated/luoshui-battlefield-gpt.png",
    alt: "Luoshui ink-wash battlefield"
  },
  bamboo: {
    id: "bamboo",
    assetPath: "/assets/generated/bamboo-battlefield-ink-pass.png",
    alt: "Rain bamboo forest battlefield with qin echoes"
  },
  changan: {
    id: "changan",
    assetPath: "/assets/generated/changan-battlefield-ink-pass.png",
    alt: "Chang'an ink city battlefield with red seals"
  }
};
