export interface CombatPortraitDefinition {
  id: string;
  assetPath: string;
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
    assetPath: "/assets/characters/zhaoyun.svg",
    alt: "Ink-wash portrait of Zhao Yun with a spear",
    accent: "red"
  },
  {
    id: "diaochan",
    assetPath: "/assets/characters/diaochan.svg",
    alt: "Ink-wash portrait of Diao Chan with flowing ribbons",
    accent: "teal"
  },
  {
    id: "enemy_ink_bandit",
    assetPath: "/assets/characters/ink-bandit.svg",
    alt: "Ink-corrupted bandit silhouette",
    accent: "ink"
  },
  {
    id: "enemy_faceless_soldier",
    assetPath: "/assets/characters/faceless-soldier.svg",
    alt: "Faceless soldier ink silhouette",
    accent: "ink"
  },
  {
    id: "enemy_paper_umbrella",
    assetPath: "/assets/characters/paper-umbrella-ghost.svg",
    alt: "Paper umbrella ghost in teal ink",
    accent: "teal"
  },
  {
    id: "elite_sword_echo",
    assetPath: "/assets/characters/sword-echo.svg",
    alt: "Sword echo elite ink silhouette",
    accent: "red"
  },
  {
    id: "elite_blood_banner",
    assetPath: "/assets/characters/blood-banner.svg",
    alt: "Blood banner officer ink silhouette",
    accent: "red"
  },
  {
    id: "boss_ink_dongzhuo",
    assetPath: "/assets/characters/ink-dongzhuo.svg",
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
    assetPath: "/assets/cards/zhao-strike.svg",
    alt: "Spear strike ink card art",
    accent: "red"
  },
  {
    id: "zhao_qixing_spear",
    assetPath: "/assets/cards/zhao-qixing-spear.svg",
    alt: "Seven star spear shadow card art",
    accent: "gold"
  },
  {
    id: "diao_charm",
    assetPath: "/assets/cards/diao-charm.svg",
    alt: "Charm ribbon ink card art",
    accent: "teal"
  },
  {
    id: "diao_closed_moon",
    assetPath: "/assets/cards/diao-closed-moon.svg",
    alt: "Closed moon dance ink card art",
    accent: "teal"
  },
  {
    id: "ink_luoshui_tide",
    assetPath: "/assets/cards/ink-luoshui-tide.svg",
    alt: "Luoshui ink tide card art",
    accent: "ink"
  },
  {
    id: "type_attack",
    assetPath: "/assets/cards/card-attack-default.svg",
    alt: "Default attack ink card art",
    accent: "red"
  },
  {
    id: "type_skill",
    assetPath: "/assets/cards/card-skill-default.svg",
    alt: "Default skill ink card art",
    accent: "teal"
  },
  {
    id: "type_body",
    assetPath: "/assets/cards/card-skill-default.svg",
    alt: "Default body skill ink card art",
    accent: "teal"
  },
  {
    id: "type_ink",
    assetPath: "/assets/cards/card-ink-default.svg",
    alt: "Default ink disaster card art",
    accent: "ink"
  },
  {
    id: "type_mind",
    assetPath: "/assets/cards/card-skill-default.svg",
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
    assetPath: "/assets/sprites/zhaoyun-attack-strip.svg",
    frameCount: 4,
    frameWidth: 256,
    frameHeight: 256,
    anchor: "bottom-center"
  },
  {
    id: "diaochan_attack",
    assetPath: "/assets/sprites/diaochan-attack-strip.svg",
    frameCount: 4,
    frameWidth: 256,
    frameHeight: 256,
    anchor: "bottom-center"
  },
  {
    id: "enemy_slash",
    assetPath: "/assets/sprites/enemy-slash-strip.svg",
    frameCount: 4,
    frameWidth: 256,
    frameHeight: 256,
    anchor: "bottom-center"
  }
];

export const combatSpriteSheetsById: Record<string, CombatSpriteSheetDefinition> = Object.fromEntries(
  combatSpriteSheetList.map((sheet) => [sheet.id, sheet])
);

export const battlefieldAssets: Record<"luoshui", BattlefieldAssetDefinition> = {
  luoshui: {
    id: "luoshui",
    assetPath: "/assets/environment/luoshui-battlefield.svg",
    alt: "Luoshui ink-wash battlefield"
  }
};
