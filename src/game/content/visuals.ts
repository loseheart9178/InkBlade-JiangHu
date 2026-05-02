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
  }
];

export const combatSpriteSheetsById: Record<string, CombatSpriteSheetDefinition> = Object.fromEntries(
  combatSpriteSheetList.map((sheet) => [sheet.id, sheet])
);

export const battlefieldAssets: Record<"luoshui", BattlefieldAssetDefinition> = {
  luoshui: {
    id: "luoshui",
    assetPath: "/assets/generated/luoshui-battlefield-gpt.png",
    alt: "Luoshui ink-wash battlefield"
  }
};
