import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPsd } from "ag-psd";
import { PNG } from "pngjs";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const manifestPath = join(projectRoot, "assets/source/ui/combat-hud/combat-ui-kit-manifest.json");

type UiKitAsset = {
  id: string;
  kind: "nine-slice" | "icon" | "ornament" | "card-frame" | "preview";
  src: string;
  width: number;
  height: number;
  rawSource: {
    kind: "imagegen" | "fallback";
    path: string;
    sheet?: {
      col: number;
      row: number;
      cols: number;
      rows: number;
    };
  };
  nineSlice?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sourceLayer: string;
};

type PsdSource = {
  id: string;
  path: string;
  requiredLayerNames: string[];
};

type UiKitManifest = {
  version: 1;
  name: "combat-ui-kit";
  sourceSpec: string;
  approvedConcept: string;
  aiRawSources: Array<{
    id: string;
    kind: "imagegen";
    path: string;
    notes: string;
  }>;
  psdSources: PsdSource[];
  runtime: {
    assets: UiKitAsset[];
  };
  prototype: {
    path: string;
    desktopScreenshot: string;
    mobileScreenshot: string;
  };
};

const requiredRuntimeAssetIds = [
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
  "resource-deck",
  "resource-coin",
  "resource-logbook",
  "resource-health",
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

const imagegenBackedAssetIds = [
  "hud-frame-player",
  "hud-frame-enemy",
  "intent-crest",
  "hand-shelf",
  "energy-orb",
  "pile-seal",
  "map-battle",
  "map-elite",
  "map-boss",
  "map-shop",
  "map-event",
  "map-rest",
  "map-route",
  "resource-deck",
  "resource-coin",
  "resource-logbook",
  "resource-health",
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

function readManifest(): UiKitManifest {
  expect(existsSync(manifestPath)).toBe(true);
  return JSON.parse(readFileSync(manifestPath, "utf8")) as UiKitManifest;
}

function publicUrlToFilePath(src: string): string {
  expect(src).toMatch(/^\/assets\/generated\/ui\/combat-hud\/.+\.png$/);
  return join(projectRoot, "public", src.replace(/^\//, ""));
}

function hasTransparentPixels(png: PNG): boolean {
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] < 255) {
      return true;
    }
  }

  return false;
}

function collectLayerNames(layers: Array<{ name?: string; children?: unknown[] }>): string[] {
  const names: string[] = [];

  for (const layer of layers) {
    if (layer.name) {
      names.push(layer.name);
    }

    if (Array.isArray(layer.children)) {
      names.push(...collectLayerNames(layer.children as Array<{ name?: string; children?: unknown[] }>));
    }
  }

  return names;
}

describe("combat UI kit manifest", () => {
  it("documents the approved design spec, PSD sources, prototype, and runtime assets", () => {
    const manifest = readManifest();

    expect(manifest.version).toBe(1);
    expect(manifest.name).toBe("combat-ui-kit");
    expect(manifest.sourceSpec).toBe("docs/superpowers/specs/2026-05-09-combat-ui-kit-design.md");
    expect(existsSync(join(projectRoot, manifest.sourceSpec))).toBe(true);
    expect(manifest.approvedConcept).toBe("docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png");
    expect(existsSync(join(projectRoot, manifest.approvedConcept))).toBe(true);
    expect(manifest.aiRawSources).toContainEqual({
      id: "imagegen-icon-sheet-v1",
      kind: "imagegen",
      path: "assets/source/ui/_ai-raw/combat-ui-kit/imagegen-icon-sheet-v1.png",
      notes: expect.stringContaining("4x4")
    });
    expect(manifest.aiRawSources).toContainEqual({
      id: "imagegen-hud-sheet-v1",
      kind: "imagegen",
      path: "assets/source/ui/_ai-raw/combat-ui-kit/imagegen-hud-sheet-v1.png",
      notes: expect.stringContaining("2x3")
    });
    for (const source of manifest.aiRawSources) {
      expect(existsSync(join(projectRoot, source.path)), source.path).toBe(true);
    }
    expect(manifest.psdSources.map((source) => source.path).sort()).toEqual([
      "assets/source/ui/cards/card-frame-kit.psd",
      "assets/source/ui/combat-hud/combat-hud-kit.psd",
      "assets/source/ui/icons/status-icon-kit.psd"
    ]);
    expect(manifest.runtime.assets.map((asset) => asset.id).sort()).toEqual([...requiredRuntimeAssetIds].sort());
    expect(manifest.prototype.path).toBe("docs/superpowers/prototypes/combat-ui-kit/index.html");
    expect(manifest.prototype.desktopScreenshot).toBe("docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png");
    expect(manifest.prototype.mobileScreenshot).toBe("docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png");
    expect(existsSync(join(projectRoot, manifest.prototype.path))).toBe(true);
    expect(existsSync(join(projectRoot, manifest.prototype.desktopScreenshot))).toBe(true);
    expect(existsSync(join(projectRoot, manifest.prototype.mobileScreenshot))).toBe(true);
  });

  it("keeps every runtime asset as a transparent PNG with stable dimensions", () => {
    const manifest = readManifest();

    for (const asset of manifest.runtime.assets) {
      const filePath = publicUrlToFilePath(asset.src);
      expect(existsSync(filePath), asset.id).toBe(true);

      const png = PNG.sync.read(readFileSync(filePath));
      expect(png.width, asset.id).toBe(asset.width);
      expect(png.height, asset.id).toBe(asset.height);
      expect(png.width, asset.id).toBeGreaterThanOrEqual(32);
      expect(png.height, asset.id).toBeGreaterThanOrEqual(32);
      expect(hasTransparentPixels(png), asset.id).toBe(true);
      expect(existsSync(join(projectRoot, asset.rawSource.path)), asset.id).toBe(true);
      if ((imagegenBackedAssetIds as readonly string[]).includes(asset.id)) {
        expect(asset.rawSource.kind, asset.id).toBe("imagegen");
      }

      if (asset.kind === "nine-slice") {
        expect(asset.nineSlice, asset.id).toBeDefined();
        expect(asset.nineSlice!.left + asset.nineSlice!.right, asset.id).toBeLessThan(asset.width);
        expect(asset.nineSlice!.top + asset.nineSlice!.bottom, asset.id).toBeLessThan(asset.height);
      }
    }
  });

  it("writes Photoshop-readable PSD files with named layers", () => {
    const manifest = readManifest();

    for (const source of manifest.psdSources) {
      const psdPath = join(projectRoot, source.path);
      expect(existsSync(psdPath), source.path).toBe(true);
      expect(readFileSync(psdPath).subarray(0, 4).toString("ascii"), source.path).toBe("8BPS");

      const psd = readPsd(readFileSync(psdPath), {
        skipCompositeImageData: true,
        skipLayerImageData: true,
        skipThumbnail: true
      });
      const names = collectLayerNames((psd.children ?? []) as Array<{ name?: string; children?: unknown[] }>);

      for (const expectedName of source.requiredLayerNames) {
        expect(names, `${source.path} missing ${expectedName}`).toContain(expectedName);
      }
    }
  });
});
