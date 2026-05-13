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
  "status-block",
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
  combatUiAssetIds.map((id) => [id, `${COMBAT_UI_ASSET_BASE}${id}.png`])
) as Record<CombatUiAssetId, string>;

export const combatStatusIconByTone = {
  block: "status-block",
  mind: "status-mind",
  ink: "status-ink"
} as const satisfies Record<"block" | "mind" | "ink", CombatUiAssetId>;

export const combatStatusIconByStatus = {
  charm: "status-charm",
  dodge: "status-block",
  guard: "status-block",
  ink: "status-ink",
  vulnerable: "status-vulnerable",
  weak: "status-vulnerable"
} as const satisfies Partial<Record<string, CombatUiAssetId>>;

export const combatResourceIconByOwner = {
  player: "resource-attack",
  enemy: "resource-charm"
} as const satisfies Record<"player" | "enemy", CombatUiAssetId>;

export function getCombatUiAsset(id: CombatUiAssetId): string {
  return combatUiAssets[id];
}
