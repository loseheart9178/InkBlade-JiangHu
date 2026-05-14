import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readPsd } from "ag-psd";
import { PNG } from "pngjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = join(projectRoot, "assets/source/ui/art-gate-a/art-gate-a-ui-kit-manifest.json");
const requiredLayerNames = ["paper", "ink wash", "cinnabar seal", "jade accent", "frame", "shadow"];
const requiredAssetIds = [
  "xuan-paper-main-panel",
  "cinnabar-chapter-seal",
  "map-route-scroll-board",
  "character-select-card-bg",
  "decision-card-bg"
];

type ArtGateAAsset = {
  id: string;
  src: string;
  rawSource: string;
  psd: string;
  layerPngDir: string;
  cssVariable: string;
  width: number;
  height: number;
  requiredLayerNames: string[];
};

type ArtGateAManifest = {
  version: 1;
  name: "art-gate-a-ui-bitmap-kit";
  assets: ArtGateAAsset[];
};

function readManifest(): ArtGateAManifest {
  expect(existsSync(manifestPath)).toBe(true);
  return JSON.parse(readFileSync(manifestPath, "utf8")) as ArtGateAManifest;
}

function publicUrlToFilePath(src: string): string {
  expect(src).toMatch(/^\/assets\/generated\/ui\/art-gate-a\/.+\.png$/);
  return join(projectRoot, "public", src.replace(/^\//, ""));
}

describe("Art Gate A UI bitmap kit", () => {
  it("keeps Imagegen runtime PNGs, raw sources, and PSD sources registered", () => {
    const manifest = readManifest();

    expect(manifest.version).toBe(1);
    expect(manifest.name).toBe("art-gate-a-ui-bitmap-kit");
    expect(manifest.assets.map((asset) => asset.id).sort()).toEqual([...requiredAssetIds].sort());

    for (const asset of manifest.assets) {
      expect(asset.requiredLayerNames).toEqual(requiredLayerNames);
      expect(existsSync(join(projectRoot, asset.rawSource)), asset.rawSource).toBe(true);
      expect(existsSync(join(projectRoot, asset.psd)), asset.psd).toBe(true);

      const runtimePath = publicUrlToFilePath(asset.src);
      expect(existsSync(runtimePath), asset.src).toBe(true);
      const png = PNG.sync.read(readFileSync(runtimePath));
      expect(png.width, asset.id).toBe(asset.width);
      expect(png.height, asset.id).toBe(asset.height);
      expect(png.width, asset.id).toBeGreaterThanOrEqual(900);
      expect(png.height, asset.id).toBeGreaterThanOrEqual(887);
    }
  });

  it("writes every PSD with Photoshop-readable named layers", () => {
    const manifest = readManifest();

    for (const asset of manifest.assets) {
      const psd = readPsd(readFileSync(join(projectRoot, asset.psd)), {
        skipCompositeImageData: true,
        skipLayerImageData: true
      });
      expect(psd.width, asset.id).toBe(asset.width);
      expect(psd.height, asset.id).toBe(asset.height);
      expect(psd.children?.map((layer) => layer.name)).toEqual(["shadow", ...requiredLayerNames.slice(0, 5)]);
    }
  });

  it("uses Art Gate A bitmap variables in the UI kit stylesheet", () => {
    const theme = readFileSync(join(projectRoot, "src/styles/theme.css"), "utf8");

    for (const asset of readManifest().assets) {
      expect(theme, asset.cssVariable).toContain(asset.cssVariable);
      expect(theme, asset.src).toContain(asset.src);
    }

    for (const selector of [
      ".title-screen--kit",
      ".route-map--kit",
      ".title-screen .character-choice--kit",
      ".reward-card",
      ".shop-item--card",
      ".choice-action--event-kit",
      ".choice-action--rest"
    ]) {
      expect(theme, selector).toContain(selector);
    }
  });
});
