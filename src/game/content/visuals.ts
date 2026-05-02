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
    assetPath: "/assets/generated/ink-bandit-standee-gpt.png",
    standeePath: "/assets/generated/ink-bandit-standee-gpt-cutout.png",
    alt: "Paper umbrella ghost in teal ink",
    accent: "teal"
  },
  {
    id: "elite_sword_echo",
    assetPath: "/assets/generated/ink-bandit-standee-gpt.png",
    standeePath: "/assets/generated/ink-bandit-standee-gpt-cutout.png",
    alt: "Sword echo elite ink silhouette",
    accent: "red"
  },
  {
    id: "elite_blood_banner",
    assetPath: "/assets/generated/ink-dongzhuo-standee-gpt.png",
    standeePath: "/assets/generated/ink-dongzhuo-standee-gpt-cutout.png",
    alt: "Blood banner officer ink silhouette",
    accent: "red"
  },
  {
    id: "boss_ink_dongzhuo",
    assetPath: "/assets/generated/ink-dongzhuo-standee-gpt.png",
    standeePath: "/assets/generated/ink-dongzhuo-standee-gpt-cutout.png",
    alt: "Ink shadow Dong Zhuo boss silhouette",
    accent: "ink"
  }
];

export const combatPortraitsById: Record<string, CombatPortraitDefinition> = Object.fromEntries(
  combatPortraitList.map((portrait) => [portrait.id, portrait])
);

export const cardArtList: CardArtDefinition[] = [
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
    id: "ink_dongzhuo_attack",
    assetPath: "/assets/sprites/ink-dongzhuo-attack-strip-gpt-v2.png",
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
