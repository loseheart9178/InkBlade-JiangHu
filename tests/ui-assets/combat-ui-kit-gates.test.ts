import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const combatUiKitSource = readFileSync(resolve(projectRoot, "src/app/combatUiKit.ts"), "utf8");

const gateDocs = [
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate3-reward-shop-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate3-reward-shop.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate4-event-rest-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate4-event-rest.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate5-route-map-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate5-route-map.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate6-title-select-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate6-title-select.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate7-compendium-logbook-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate7-compendium-logbook.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate8-visual-qa-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate8-visual-qa.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate9-result-final-transition-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate9-result-final-transition.md",
  "docs/superpowers/specs/2026-05-13-combat-ui-kit-gate10-settings-profile-debug-design.md",
  "docs/superpowers/plans/2026-05-13-combat-ui-kit-gate10-settings-profile-debug.md",
  "docs/superpowers/approvals/2026-05-13-combat-ui-kit-gate11-acceptance.md"
];

const controllerHooks = [
  "reward-card--kit",
  "shop-item--kit",
  "choice-action--event-kit",
  "choice-action--rest-kit",
  "map-node--kit",
  "title-screen--kit",
  "compendium-screen--kit",
  "logbook-screen--kit",
  "transition-hero--kit",
  "final-choice-option--kit",
  "result-dossier--kit",
  "settings-screen--kit",
  "profile-run-ledger--kit"
];

const stylesheetHooks = [
  ".ui-kit-visual-qa",
  ".reward-card--kit",
  ".shop-item--kit",
  ".choice-action--event-kit",
  ".choice-action--rest-kit",
  ".map-node--kit",
  ".title-screen--kit",
  ".compendium-item--kit",
  ".logbook-entry--kit",
  ".transition-hero--kit",
  ".final-choice-option--kit",
  ".title-shell-panel--kit",
  ".profile-run-record--kit"
];

const combatUiKitAssetGroups = {
  status: ["status-block", "status-mind", "status-ink", "status-bleed", "status-vulnerable", "status-charm"],
  map: ["map-battle", "map-elite", "map-boss", "map-shop", "map-event", "map-rest"],
  resource: ["resource-health", "resource-coin", "resource-deck", "resource-logbook", "resource-attack", "resource-armor", "resource-charm"]
} as const;

describe("combat UI kit gate acceptance", () => {
  test("keeps gate specs plans and final acceptance ledger in the repo", () => {
    for (const docPath of gateDocs) {
      expect(existsSync(resolve(projectRoot, docPath)), docPath).toBe(true);
    }
  });

  test("keeps core UI kit hooks wired in app markup", () => {
    const markupSources = [
      readFileSync(resolve(projectRoot, "src/app/appShell.ts"), "utf8"),
      readFileSync(resolve(projectRoot, "src/app/inkbladeController.ts"), "utf8")
    ].join("\n");

    for (const hook of controllerHooks) {
      expect(markupSources, hook).toContain(hook);
    }
  });

  test("keeps core UI kit hooks styled in the theme", () => {
    const theme = readFileSync(resolve(projectRoot, "src/styles/theme.css"), "utf8");

    for (const hook of stylesheetHooks) {
      expect(theme, hook).toContain(hook);
    }
  });

  test("keeps generated status, map, and resource asset ids declared in the combat UI kit source", () => {
    expect(combatUiKitSource, "expected the shared generated asset base").toContain('COMBAT_UI_ASSET_BASE = "/assets/generated/ui/combat-hud/"');
    expect(combatUiKitSource, "expected the shared asset id array").toContain("combatUiAssetIds");
    expect(combatUiKitSource, "expected the status icon map").toContain("combatStatusIconByTone");
    expect(combatUiKitSource, "expected the status lookup map").toContain("combatStatusIconByStatus");
    expect(combatUiKitSource, "expected the resource icon map").toContain("combatResourceIconByOwner");
    expect(combatUiKitSource, "expected the run-status icon map").toContain("runStatusIconByKind");
    expect(combatUiKitSource, "expected the map node icon map").toContain("mapNodeIconByType");

    for (const [groupName, assetIds] of Object.entries(combatUiKitAssetGroups)) {
      for (const assetId of assetIds) {
        expect(combatUiKitSource, `${groupName} asset ${assetId}`).toContain(`"${assetId}"`);
      }
    }
  });
});
