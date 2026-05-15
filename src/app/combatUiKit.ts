export const COMBAT_UI_ASSET_BASE = "/assets/generated/ui/combat-hud/" as const;

export const combatUiAssetIds = [
  "hud-frame-player",
  "hud-frame-enemy",
  "intent-crest",
  "hand-shelf",
  "energy-orb",
  "pile-seal",
  "card-frame-common",
  "card-frame-uncommon",
  "card-frame-rare",
  "card-frame-event",
  "map-battle",
  "map-elite",
  "map-boss",
  "map-shop",
  "map-event",
  "map-rest",
  "map-route",
  "resource-health",
  "resource-coin",
  "resource-deck",
  "resource-logbook",
  "status-block",
  "status-armor",
  "status-mind",
  "status-ink",
  "status-bleed",
  "status-vulnerable",
  "status-charm",
  "resource-attack",
  "resource-armor",
  "resource-charm"
] as const;

export type CombatUiAssetId = (typeof combatUiAssetIds)[number];

export const combatUiAssets: Record<CombatUiAssetId, string> = Object.fromEntries(
  combatUiAssetIds.map((id) => {
    let path = `${COMBAT_UI_ASSET_BASE}${id}.png`;
    // Overrides for Dark Wuxia Kit
    if (id === "hud-frame-player" || id === "hud-frame-enemy") {
      path = "/assets/generated/ui/combat-dark-kit/top-health-bar-frame.png";
    } else if (id === "energy-orb") {
      path = "/assets/generated/ui/combat-dark-kit/energy-orb-button.png";
    } else if (id.startsWith("card-frame-")) {
      path = "/assets/generated/ui/combat-dark-kit/card-frame.png";
    } else if (id === "map-battle" || id === "map-elite") {
      path = "/assets/generated/ui/combat-dark-kit-v2/map-node-icons/battle-swords.png";
    } else if (id === "map-boss") {
      path = "/assets/generated/ui/combat-dark-kit-v2/map-node-icons/boss-mask.png";
    } else if (id === "map-shop") {
      path = "/assets/generated/ui/combat-dark-kit-v2/map-node-icons/shop-pavilion.png";
    } else if (id === "map-rest") {
      path = "/assets/generated/ui/combat-dark-kit-v2/map-node-icons/rest-brazier.png";
    }
    return [id, path];
  })
) as Record<CombatUiAssetId, string>;

export const combatStatusIconByTone = {
  block: "status-armor",
  mind: "status-mind",
  ink: "status-ink"
} as const satisfies Record<"block" | "mind" | "ink", CombatUiAssetId>;

export const combatStatusIconByStatus = {
  charm: "status-charm",
  dodge: "status-block",
  guard: "status-armor",
  ink: "status-ink",
  vulnerable: "status-vulnerable",
  weak: "status-vulnerable"
} as const satisfies Partial<Record<string, CombatUiAssetId>>;

export const combatResourceIconByOwner = {
  player: "resource-attack",
  enemy: "resource-charm"
} as const satisfies Record<"player" | "enemy", CombatUiAssetId>;

export const runStatusIconByKind = {
  health: "resource-health",
  gold: "resource-coin",
  deck: "resource-deck",
  logbook: "resource-logbook"
} as const satisfies Record<"health" | "gold" | "deck" | "logbook", CombatUiAssetId>;

export const mapNodeIconByType = {
  start: "map-event",
  battle: "map-battle",
  elite: "map-elite",
  event: "map-event",
  shop: "map-shop",
  rest: "map-rest",
  boss: "map-boss"
} as const satisfies Record<"start" | "battle" | "elite" | "event" | "shop" | "rest" | "boss", CombatUiAssetId>;

export function getCombatUiAsset(id: CombatUiAssetId): string {
  return combatUiAssets[id];
}

export type CombatUiCardRarity = "starter" | "common" | "uncommon" | "rare" | "event" | "ink" | "curse" | "status";

export function getCombatUiCardFrameAssetId(rarity: CombatUiCardRarity): CombatUiAssetId {
  if (rarity === "uncommon") {
    return "card-frame-uncommon";
  }

  if (rarity === "rare" || rarity === "ink" || rarity === "curse") {
    return "card-frame-rare";
  }

  if (rarity === "event") {
    return "card-frame-event";
  }

  return "card-frame-common";
}
