import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writePsdBuffer } from "ag-psd";
import { PNG } from "pngjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const rawDir = join(projectRoot, "assets/source/ui/_ai-raw/art-gate-a");
const sourceDir = join(projectRoot, "assets/source/ui/art-gate-a");
const layerRoot = join(sourceDir, "layers");
const runtimeDir = join(projectRoot, "public/assets/generated/ui/art-gate-a");

const assets = [
  {
    id: "xuan-paper-main-panel",
    role: "main-panel",
    raw: "xuan-paper-main-panel.png",
    cssVariable: "--art-gate-main-panel"
  },
  {
    id: "cinnabar-chapter-seal",
    role: "chapter-seal",
    raw: "cinnabar-chapter-seal.png",
    cssVariable: "--art-gate-chapter-seal"
  },
  {
    id: "map-route-scroll-board",
    role: "route-map-scroll",
    raw: "map-route-scroll-board.png",
    cssVariable: "--art-gate-map-scroll"
  },
  {
    id: "character-select-card-bg",
    role: "character-select-card",
    raw: "character-select-card-bg.png",
    cssVariable: "--art-gate-character-card"
  },
  {
    id: "decision-card-bg",
    role: "decision-card",
    raw: "decision-card-bg.png",
    cssVariable: "--art-gate-decision-card"
  }
];

for (const dir of [sourceDir, layerRoot, runtimeDir]) {
  mkdirSync(dir, { recursive: true });
}

const manifestAssets = [];

for (const asset of assets) {
  const raw = readPng(join(rawDir, asset.raw));
  const layers = extractLayers(raw);
  const assetLayerDir = join(layerRoot, asset.id);
  mkdirSync(assetLayerDir, { recursive: true });

  for (const [name, png] of Object.entries(layers)) {
    writePng(join(assetLayerDir, `${slugLayerName(name)}.png`), png);
  }

  writePng(join(runtimeDir, `${asset.id}.png`), raw);
  writeLayeredPsd(join(sourceDir, `${asset.id}.psd`), raw.width, raw.height, [
    layerFromPng("shadow", layers.shadow, 0, 0),
    layerFromPng("paper", layers.paper, 0, 0),
    layerFromPng("ink wash", layers["ink wash"], 0, 0),
    layerFromPng("cinnabar seal", layers["cinnabar seal"], 0, 0),
    layerFromPng("jade accent", layers["jade accent"], 0, 0),
    layerFromPng("frame", layers.frame, 0, 0)
  ]);

  manifestAssets.push({
    id: asset.id,
    role: asset.role,
    src: `/assets/generated/ui/art-gate-a/${asset.id}.png`,
    rawSource: `assets/source/ui/_ai-raw/art-gate-a/${asset.raw}`,
    psd: `assets/source/ui/art-gate-a/${asset.id}.psd`,
    layerPngDir: `assets/source/ui/art-gate-a/layers/${asset.id}`,
    cssVariable: asset.cssVariable,
    width: raw.width,
    height: raw.height,
    requiredLayerNames: ["paper", "ink wash", "cinnabar seal", "jade accent", "frame", "shadow"]
  });
}

writeFileSync(
  join(sourceDir, "art-gate-a-ui-kit-manifest.json"),
  `${JSON.stringify(
    {
      version: 1,
      name: "art-gate-a-ui-bitmap-kit",
      mode: "imagegen-source-pass",
      generatedImageBatch: "/Users/lushihao/.codex/generated_images/019e1fb7-8ab8-74a1-ae01-14bcd27cf46e",
      runtimeBase: "/assets/generated/ui/art-gate-a/",
      assets: manifestAssets
    },
    null,
    2
  )}\n`
);

writeFileSync(
  join(rawDir, "README.md"),
  `# Art Gate A UI Raw Sources

These PNGs are Imagegen source assets for the Art Gate A bitmap UI kit pass.

Builder:

\`\`\`bash
node scripts/build-art-gate-a-ui-kit.mjs
\`\`\`

The builder writes Photoshop-readable PSD files with required named layers:
\`paper\`, \`ink wash\`, \`cinnabar seal\`, \`jade accent\`, \`frame\`, and \`shadow\`.
Runtime PNGs are written to \`public/assets/generated/ui/art-gate-a/\`.
`
);

console.log(`Wrote ${assets.length} Art Gate A runtime PNGs and layered PSD files`);

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function writePng(path, png) {
  writeFileSync(path, PNG.sync.write(png));
}

function makePng(width, height) {
  const png = new PNG({ width, height, colorType: 6 });
  png.data.fill(0);
  return png;
}

function clonePng(source) {
  const out = makePng(source.width, source.height);
  out.data.set(source.data);
  return out;
}

function extractLayers(source) {
  const paper = clonePng(source);
  const ink = makePng(source.width, source.height);
  const cinnabar = makePng(source.width, source.height);
  const jade = makePng(source.width, source.height);
  const frame = makePng(source.width, source.height);
  const shadow = makePng(source.width, source.height);

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const index = (y * source.width + x) * 4;
      const r = source.data[index];
      const g = source.data[index + 1];
      const b = source.data[index + 2];
      const luma = r * 0.299 + g * 0.587 + b * 0.114;
      const edge = edgeAmount(x, y, source.width, source.height);

      if (luma < 112) {
        const alpha = clamp((128 - luma) * 1.8 + edge * 54, 0, 190);
        setPixel(ink, index, 28, 24, 20, alpha);
      }

      if (r > g * 1.18 && r > b * 1.22 && r > 94) {
        const alpha = clamp((r - Math.max(g, b)) * 1.35, 0, 230);
        setPixel(cinnabar, index, 169, 48, 38, alpha);
      }

      if (g > r * 0.92 && g > b * 1.02 && b > 52 && r < 150) {
        const alpha = clamp((g - r + b * 0.24) * 1.2, 0, 180);
        setPixel(jade, index, 48, 120, 104, alpha);
      }

      if (edge > 0 || luma < 82) {
        const alpha = clamp(edge * 185 + Math.max(0, 86 - luma) * 1.1, 0, 220);
        setPixel(frame, index, 32, 26, 20, alpha);
      }

      const shadowAlpha = softShadowAlpha(x, y, source.width, source.height);
      if (shadowAlpha > 0) {
        setPixel(shadow, index, 18, 16, 14, shadowAlpha);
      }
    }
  }

  return {
    paper,
    "ink wash": ink,
    "cinnabar seal": cinnabar,
    "jade accent": jade,
    frame,
    shadow
  };
}

function edgeAmount(x, y, width, height) {
  const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
  if (edge >= Math.min(width, height) * 0.09) return 0;
  return 1 - edge / (Math.min(width, height) * 0.09);
}

function softShadowAlpha(x, y, width, height) {
  const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
  if (edge > Math.min(width, height) * 0.11) return 0;
  return Math.round((1 - edge / (Math.min(width, height) * 0.11)) * 72);
}

function setPixel(png, index, r, g, b, a) {
  png.data[index] = r;
  png.data[index + 1] = g;
  png.data[index + 2] = b;
  png.data[index + 3] = a;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function layerFromPng(name, png, left, top) {
  return {
    name,
    left,
    top,
    right: left + png.width,
    bottom: top + png.height,
    imageData: {
      width: png.width,
      height: png.height,
      data: new Uint8ClampedArray(png.data)
    }
  };
}

function writeLayeredPsd(path, width, height, children) {
  const psd = {
    width,
    height,
    children,
    imageData: {
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4)
    }
  };
  writeFileSync(path, writePsdBuffer(psd, { generateThumbnail: false }));
}

function slugLayerName(name) {
  return name.replace(/\s+/g, "-");
}
