export interface CombatPortraitDefinition {
  id: string;
  assetPath: string;
  alt: string;
  accent: "red" | "teal" | "ink";
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
    id: "boss_ink_dongzhuo",
    assetPath: "/assets/characters/ink-dongzhuo.svg",
    alt: "Ink shadow Dong Zhuo boss silhouette",
    accent: "ink"
  }
];

export const combatPortraitsById: Record<string, CombatPortraitDefinition> = Object.fromEntries(
  combatPortraitList.map((portrait) => [portrait.id, portrait])
);
