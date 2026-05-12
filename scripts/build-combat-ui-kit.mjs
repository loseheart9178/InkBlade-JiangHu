import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writePsdBuffer } from "ag-psd";
import { PNG } from "pngjs";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const rawDir = join(projectRoot, "assets/source/ui/_ai-raw/combat-ui-kit");
const layerDir = join(projectRoot, "assets/source/ui/combat-hud/layers");
const runtimeDir = join(projectRoot, "public/assets/generated/ui/combat-hud");
const hudSourceDir = join(projectRoot, "assets/source/ui/combat-hud");
const cardSourceDir = join(projectRoot, "assets/source/ui/cards");
const iconSourceDir = join(projectRoot, "assets/source/ui/icons");

const runtimeAssets = [
  { id: "hud-frame-player", kind: "nine-slice", width: 420, height: 128, nineSlice: { top: 38, right: 62, bottom: 38, left: 62 }, source: "hud-frame-player.png", sourceLayer: "player status plate" },
  { id: "hud-frame-enemy", kind: "nine-slice", width: 420, height: 128, nineSlice: { top: 38, right: 62, bottom: 38, left: 62 }, source: "hud-frame-enemy.png", sourceLayer: "enemy status plate" },
  { id: "intent-crest", kind: "ornament", width: 156, height: 156, source: "intent-crest.png", sourceLayer: "enemy intent crest" },
  { id: "hand-shelf", kind: "nine-slice", width: 1680, height: 320, nineSlice: { top: 92, right: 180, bottom: 70, left: 180 }, source: "hand-shelf.png", sourceLayer: "hand shelf" },
  { id: "energy-orb", kind: "ornament", width: 148, height: 148, source: "energy-orb.png", sourceLayer: "energy orb" },
  { id: "pile-seal", kind: "ornament", width: 82, height: 82, source: "pile-seal.png", sourceLayer: "pile counter seals" },
  { id: "card-frame-common", kind: "card-frame", width: 340, height: 476, source: "card-frame-common.png", sourceLayer: "card frame common" },
  { id: "card-frame-uncommon", kind: "card-frame", width: 340, height: 476, source: "card-frame-uncommon.png", sourceLayer: "card frame uncommon" },
  { id: "card-frame-rare", kind: "card-frame", width: 340, height: 476, source: "card-frame-rare.png", sourceLayer: "card frame rare" },
  { id: "card-frame-event", kind: "card-frame", width: 340, height: 476, source: "card-frame-event.png", sourceLayer: "card frame event" },
  { id: "status-block", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 0, row: 0, cols: 3, rows: 2 }, sourceLayer: "status block icon" },
  { id: "status-mind", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 1, row: 0, cols: 3, rows: 2 }, sourceLayer: "status mind icon" },
  { id: "status-ink", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 2, row: 0, cols: 3, rows: 2 }, sourceLayer: "status ink icon" },
  { id: "status-bleed", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 0, row: 1, cols: 3, rows: 2 }, sourceLayer: "status bleed icon" },
  { id: "status-vulnerable", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 1, row: 1, cols: 3, rows: 2 }, sourceLayer: "status vulnerable icon" },
  { id: "status-charm", kind: "icon", width: 72, height: 72, source: "status-icon-sheet.png", sheet: { col: 2, row: 1, cols: 3, rows: 2 }, sourceLayer: "status charm icon" },
  { id: "resource-attack", kind: "icon", width: 72, height: 72, source: "resource-icon-sheet.png", sheet: { col: 0, row: 0, cols: 3, rows: 1 }, sourceLayer: "resource attack icon" },
  { id: "resource-armor", kind: "icon", width: 72, height: 72, source: "resource-icon-sheet.png", sheet: { col: 1, row: 0, cols: 3, rows: 1 }, sourceLayer: "resource armor icon" },
  { id: "resource-charm", kind: "icon", width: 72, height: 72, source: "resource-icon-sheet.png", sheet: { col: 2, row: 0, cols: 3, rows: 1 }, sourceLayer: "resource charm icon" }
];

const colors = {
  ink: [21, 18, 15, 226],
  paper: [241, 226, 188, 220],
  gold: [219, 174, 86, 224],
  teal: [74, 166, 151, 214],
  red: [174, 56, 45, 220],
  violet: [116, 80, 142, 208],
  black: [6, 6, 5, 235]
};

for (const dir of [rawDir, layerDir, runtimeDir, hudSourceDir, cardSourceDir, iconSourceDir]) {
  mkdirSync(dir, { recursive: true });
}

writeRawReadme();
ensureRawSources();

const runtimePngs = new Map();
for (const asset of runtimeAssets) {
  const source = readPng(join(rawDir, asset.source));
  const png = asset.sheet ? resizePng(cropSheetCell(source, asset.sheet), asset.width, asset.height) : resizePng(source, asset.width, asset.height);
  const filename = `${asset.id}.png`;
  writePng(join(layerDir, filename), png);
  writePng(join(runtimeDir, filename), png);
  runtimePngs.set(asset.id, png);
}

writeCombatHudPsd(runtimePngs);
writeCardFramePsd(runtimePngs);
writeIconPsd(runtimePngs);
writeManifest();

console.log("Wrote assets/source/ui/combat-hud/combat-hud-kit.psd");
console.log("Wrote assets/source/ui/cards/card-frame-kit.psd");
console.log("Wrote assets/source/ui/icons/status-icon-kit.psd");
console.log("Wrote assets/source/ui/combat-hud/combat-ui-kit-manifest.json");
console.log(`Wrote ${runtimeAssets.length} runtime UI assets`);

function writeRawReadme() {
  writeFileSync(
    join(rawDir, "README.md"),
    `# Combat UI Kit AI Raw Sources

These transparent PNG files are AI-generated source layers for the approved combat UI kit direction.

Approved concept reference:
\`docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png\`

The runtime files are not edited directly. Run:

\`\`\`bash
node scripts/build-combat-ui-kit.mjs
\`\`\`

The builder normalizes these files into layered PSD sources, transparent runtime PNG slices, and \`assets/source/ui/combat-hud/combat-ui-kit-manifest.json\`.
`
  );
}

function ensureRawSources() {
  writePng(join(rawDir, "hud-frame-player.png"), drawHudFrame(420, 128, colors.teal));
  writePng(join(rawDir, "hud-frame-enemy.png"), drawHudFrame(420, 128, colors.red));
  writePng(join(rawDir, "intent-crest.png"), drawIntentCrest(156, 156));
  writePng(join(rawDir, "hand-shelf.png"), drawHandShelf(1680, 320));
  writePng(join(rawDir, "energy-orb.png"), drawOrb(148, 148, colors.teal));
  writePng(join(rawDir, "pile-seal.png"), drawOrb(82, 82, colors.gold));
  writePng(join(rawDir, "card-frame-common.png"), drawCardFrame(340, 476, colors.teal));
  writePng(join(rawDir, "card-frame-uncommon.png"), drawCardFrame(340, 476, [84, 176, 132, 218]));
  writePng(join(rawDir, "card-frame-rare.png"), drawCardFrame(340, 476, colors.red));
  writePng(join(rawDir, "card-frame-event.png"), drawCardFrame(340, 476, colors.violet));
  writePng(join(rawDir, "status-icon-sheet.png"), drawIconSheet(3, 2, ["shield", "lotus", "ink", "bleed", "crack", "fan"]));
  writePng(join(rawDir, "resource-icon-sheet.png"), drawIconSheet(3, 1, ["blade", "guard", "fan"]));
}

function makePng(width, height) {
  const png = new PNG({ width, height, colorType: 6 });
  png.data.fill(0);
  return png;
}

function writePng(path, png) {
  writeFileSync(path, PNG.sync.write(png));
}

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function blendPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (Math.floor(y) * png.width + Math.floor(x)) * 4;
  const alpha = color[3] / 255;
  const inv = 1 - alpha;
  const dstA = png.data[index + 3] / 255;
  const outA = alpha + dstA * inv;
  if (outA <= 0) return;
  png.data[index] = Math.round((color[0] * alpha + png.data[index] * dstA * inv) / outA);
  png.data[index + 1] = Math.round((color[1] * alpha + png.data[index + 1] * dstA * inv) / outA);
  png.data[index + 2] = Math.round((color[2] * alpha + png.data[index + 2] * dstA * inv) / outA);
  png.data[index + 3] = Math.round(outA * 255);
}

function rect(png, x, y, width, height, color) {
  for (let yy = Math.max(0, y); yy < Math.min(png.height, y + height); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(png.width, x + width); xx += 1) {
      blendPixel(png, xx, yy, color);
    }
  }
}

function roundedRect(png, x, y, width, height, radius, color) {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      const dx = Math.max(x + radius - xx, 0, xx - (x + width - radius));
      const dy = Math.max(y + radius - yy, 0, yy - (y + height - radius));
      if (dx * dx + dy * dy <= radius * radius) blendPixel(png, xx, yy, color);
    }
  }
}

function circle(png, cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius) blendPixel(png, x, y, color);
    }
  }
}

function ring(png, cx, cy, radius, thickness, color) {
  for (let y = Math.floor(cy - radius - thickness); y <= Math.ceil(cy + radius + thickness); y += 1) {
    for (let x = Math.floor(cx - radius - thickness); x <= Math.ceil(cx + radius + thickness); x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d >= radius - thickness / 2 && d <= radius + thickness / 2) blendPixel(png, x, y, color);
    }
  }
}

function line(png, x1, y1, x2, y2, thickness, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    circle(png, x, y, thickness / 2, color);
  }
}

function noise(png, density, color) {
  let seed = 9209;
  for (let i = 0; i < png.width * png.height * density; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % png.width;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = seed % png.height;
    blendPixel(png, x, y, color);
  }
}

function drawHudFrame(width, height, accent) {
  const png = makePng(width, height);
  roundedRect(png, 14, 18, width - 28, height - 34, 24, colors.ink);
  roundedRect(png, 26, 28, width - 52, height - 54, 18, [236, 218, 177, 150]);
  roundedRect(png, 34, 36, width - 68, height - 70, 12, [12, 10, 8, 120]);
  ring(png, 56, height / 2, 28, 5, colors.gold);
  ring(png, width - 56, height / 2, 28, 5, accent);
  for (let i = 0; i < 4; i += 1) {
    line(png, 86 + i * 72, 34, 124 + i * 72, height - 36, 3, [accent[0], accent[1], accent[2], 90]);
  }
  noise(png, 0.018, [255, 245, 210, 36]);
  return png;
}

function drawIntentCrest(width, height) {
  const png = makePng(width, height);
  circle(png, width / 2, height / 2 + 6, 62, [20, 17, 13, 218]);
  ring(png, width / 2, height / 2 + 6, 56, 8, colors.gold);
  ring(png, width / 2, height / 2 + 6, 38, 3, colors.red);
  line(png, width / 2 - 28, height / 2 + 26, width / 2 + 30, height / 2 - 24, 7, colors.red);
  line(png, width / 2 - 12, 16, width / 2 + 12, 16, 5, colors.gold);
  line(png, width / 2, 16, width / 2, 34, 4, colors.red);
  noise(png, 0.02, [255, 233, 182, 40]);
  return png;
}

function drawHandShelf(width, height) {
  const png = makePng(width, height);
  roundedRect(png, 56, 56, width - 112, height - 86, 72, [15, 12, 10, 224]);
  roundedRect(png, 92, 84, width - 184, height - 140, 48, [61, 42, 25, 136]);
  line(png, 160, 98, width - 160, 98, 8, colors.gold);
  line(png, 190, height - 74, width - 190, height - 74, 6, [226, 182, 92, 150]);
  for (let i = 0; i < 7; i += 1) {
    ring(png, 230 + i * 205, 160 + (i % 2) * 14, 22, 3, [218, 174, 86, 90]);
  }
  noise(png, 0.01, [255, 236, 201, 26]);
  return png;
}

function drawOrb(width, height, accent) {
  const png = makePng(width, height);
  const r = Math.min(width, height) / 2 - 7;
  circle(png, width / 2, height / 2, r, colors.ink);
  ring(png, width / 2, height / 2, r - 7, 6, colors.gold);
  circle(png, width / 2, height / 2, r - 18, [accent[0], accent[1], accent[2], 150]);
  circle(png, width / 2 - r * 0.22, height / 2 - r * 0.24, r * 0.28, [255, 251, 226, 88]);
  noise(png, 0.025, [255, 239, 202, 42]);
  return png;
}

function drawCardFrame(width, height, accent) {
  const png = makePng(width, height);
  roundedRect(png, 8, 8, width - 16, height - 16, 24, [23, 18, 13, 235]);
  roundedRect(png, 22, 22, width - 44, height - 44, 18, [238, 221, 180, 226]);
  roundedRect(png, 42, 78, width - 84, 188, 10, [0, 0, 0, 0]);
  ring(png, 56, 56, 30, 7, colors.gold);
  roundedRect(png, 76, 34, width - 112, 38, 10, [20, 17, 14, 192]);
  roundedRect(png, 52, 284, width - 104, 34, 10, [accent[0], accent[1], accent[2], 120]);
  roundedRect(png, 42, 336, width - 84, 78, 12, [246, 232, 190, 180]);
  roundedRect(png, 56, height - 48, width - 112, 22, 10, [18, 15, 12, 132]);
  line(png, 42, 274, width - 42, 274, 4, accent);
  line(png, 42, 326, width - 42, 326, 3, colors.gold);
  noise(png, 0.02, [65, 45, 26, 30]);
  return png;
}

function drawIconSheet(cols, rows, symbols) {
  const cell = 96;
  const png = makePng(cols * cell, rows * cell);
  symbols.forEach((symbol, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    drawIcon(png, col * cell + cell / 2, row * cell + cell / 2, symbol);
  });
  return png;
}

function drawIcon(png, cx, cy, symbol) {
  circle(png, cx, cy, 34, colors.ink);
  ring(png, cx, cy, 29, 5, colors.gold);
  const accent = symbol === "bleed" || symbol === "blade" ? colors.red : symbol === "ink" ? colors.black : symbol === "fan" ? colors.violet : colors.teal;
  circle(png, cx, cy, 20, [accent[0], accent[1], accent[2], 84]);
  if (symbol === "shield" || symbol === "guard") {
    line(png, cx, cy - 20, cx - 16, cy - 4, 6, colors.teal);
    line(png, cx, cy - 20, cx + 16, cy - 4, 6, colors.teal);
    line(png, cx - 16, cy - 4, cx, cy + 20, 6, colors.teal);
    line(png, cx + 16, cy - 4, cx, cy + 20, 6, colors.teal);
  } else if (symbol === "lotus") {
    for (let i = -2; i <= 2; i += 1) line(png, cx, cy + 16, cx + i * 8, cy - 16 + Math.abs(i) * 5, 5, colors.teal);
  } else if (symbol === "ink") {
    circle(png, cx - 5, cy + 4, 15, [0, 0, 0, 180]);
    circle(png, cx + 10, cy - 8, 8, [0, 0, 0, 150]);
  } else if (symbol === "bleed") {
    line(png, cx - 18, cy - 16, cx + 20, cy + 18, 7, colors.red);
    circle(png, cx + 7, cy + 14, 6, colors.red);
  } else if (symbol === "crack") {
    line(png, cx - 2, cy - 22, cx + 3, cy - 4, 4, colors.teal);
    line(png, cx + 3, cy - 4, cx - 10, cy + 10, 4, colors.teal);
    line(png, cx + 3, cy - 4, cx + 18, cy + 14, 4, colors.teal);
  } else if (symbol === "fan") {
    for (let i = -3; i <= 3; i += 1) line(png, cx, cy + 20, cx + i * 7, cy - 18 + Math.abs(i) * 2, 4, colors.violet);
    line(png, cx - 22, cy - 2, cx + 22, cy - 2, 3, colors.gold);
  } else {
    line(png, cx - 20, cy + 18, cx + 20, cy - 18, 7, colors.red);
    line(png, cx + 8, cy - 20, cx + 20, cy - 10, 4, colors.gold);
  }
}

function cropSheetCell(source, sheet) {
  const cellWidth = Math.floor(source.width / sheet.cols);
  const cellHeight = Math.floor(source.height / sheet.rows);
  const out = makePng(cellWidth, cellHeight);
  for (let y = 0; y < cellHeight; y += 1) {
    for (let x = 0; x < cellWidth; x += 1) {
      const srcIndex = ((sheet.row * cellHeight + y) * source.width + sheet.col * cellWidth + x) * 4;
      const dstIndex = (y * cellWidth + x) * 4;
      out.data[dstIndex] = source.data[srcIndex];
      out.data[dstIndex + 1] = source.data[srcIndex + 1];
      out.data[dstIndex + 2] = source.data[srcIndex + 2];
      out.data[dstIndex + 3] = source.data[srcIndex + 3];
    }
  }
  return out;
}

function resizePng(source, width, height) {
  if (source.width === width && source.height === height) return source;
  const out = makePng(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(source.width - 1, Math.floor((x / width) * source.width));
      const sy = Math.min(source.height - 1, Math.floor((y / height) * source.height));
      const srcIndex = (sy * source.width + sx) * 4;
      const dstIndex = (y * width + x) * 4;
      out.data[dstIndex] = source.data[srcIndex];
      out.data[dstIndex + 1] = source.data[srcIndex + 1];
      out.data[dstIndex + 2] = source.data[srcIndex + 2];
      out.data[dstIndex + 3] = source.data[srcIndex + 3];
    }
  }
  return out;
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

function writePsd(path, width, height, children) {
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

function writeCombatHudPsd(pngs) {
  const vignette = makePng(1920, 1080);
  for (let y = 0; y < vignette.height; y += 1) {
    for (let x = 0; x < vignette.width; x += 1) {
      const d = Math.hypot((x - 960) / 960, (y - 520) / 540);
      const a = Math.max(0, Math.min(120, (d - 0.42) * 120));
      blendPixel(vignette, x, y, [0, 0, 0, a]);
    }
  }
  const rail = makePng(420, 84);
  for (let i = 0; i < 6; i += 1) circle(rail, 40 + i * 64, 42, 28, [26, 22, 16, 170]);
  const ornaments = makePng(1920, 220);
  line(ornaments, 160, 88, 760, 44, 6, colors.gold);
  line(ornaments, 1160, 44, 1760, 88, 6, colors.gold);
  const children = [
    layerFromPng("battlefield vignette", vignette, 0, 0),
    layerFromPng("player status plate", pngs.get("hud-frame-player"), 80, 56),
    layerFromPng("enemy status plate", pngs.get("hud-frame-enemy"), 1420, 56),
    layerFromPng("enemy intent crest", pngs.get("intent-crest"), 882, 72),
    layerFromPng("status icon rail", rail, 108, 188),
    layerFromPng("hand shelf", pngs.get("hand-shelf"), 120, 760),
    layerFromPng("energy orb", pngs.get("energy-orb"), 110, 806),
    layerFromPng("pile counter seals", pngs.get("pile-seal"), 1708, 820),
    layerFromPng("gold ink ornaments", ornaments, 0, 0)
  ];
  writePsd(join(hudSourceDir, "combat-hud-kit.psd"), 1920, 1080, children);
}

function writeCardFramePsd(pngs) {
  const cost = drawOrb(84, 84, colors.gold);
  const artMask = makePng(260, 188);
  roundedRect(artMask, 0, 0, 260, 188, 12, [255, 255, 255, 96]);
  const plaque = makePng(236, 42);
  roundedRect(plaque, 0, 0, 236, 42, 10, [20, 17, 14, 180]);
  const ribbon = makePng(230, 28);
  roundedRect(ribbon, 0, 0, 230, 28, 12, [218, 174, 86, 130]);
  const children = [
    layerFromPng("card frame common", pngs.get("card-frame-common"), 40, 42),
    layerFromPng("card frame uncommon", pngs.get("card-frame-uncommon"), 60, 62),
    layerFromPng("card frame rare", pngs.get("card-frame-rare"), 80, 82),
    layerFromPng("card frame event", pngs.get("card-frame-event"), 100, 102),
    layerFromPng("cost seal", cost, 42, 44),
    layerFromPng("art window mask", artMask, 82, 128),
    layerFromPng("type plaque", plaque, 92, 330),
    layerFromPng("keyword ribbon", ribbon, 96, 482)
  ];
  writePsd(join(cardSourceDir, "card-frame-kit.psd"), 520, 640, children);
}

function writeIconPsd(pngs) {
  const ids = ["status-block", "status-mind", "status-ink", "status-bleed", "status-vulnerable", "status-charm", "resource-attack", "resource-armor", "resource-charm"];
  const children = ids.map((id, index) => {
    const asset = runtimeAssets.find((item) => item.id === id);
    const x = 32 + (index % 3) * 96;
    const y = 28 + Math.floor(index / 3) * 88;
    return layerFromPng(asset.sourceLayer, pngs.get(id), x, y);
  });
  writePsd(join(iconSourceDir, "status-icon-kit.psd"), 340, 300, children);
}

function writeManifest() {
  const manifest = {
    version: 1,
    name: "combat-ui-kit",
    sourceSpec: "docs/superpowers/specs/2026-05-09-combat-ui-kit-design.md",
    approvedConcept: "docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png",
    psdSources: [
      {
        id: "combat-hud",
        path: "assets/source/ui/combat-hud/combat-hud-kit.psd",
        requiredLayerNames: ["battlefield vignette", "player status plate", "enemy status plate", "enemy intent crest", "status icon rail", "hand shelf", "energy orb", "pile counter seals", "gold ink ornaments"]
      },
      {
        id: "card-frame",
        path: "assets/source/ui/cards/card-frame-kit.psd",
        requiredLayerNames: ["card frame common", "card frame uncommon", "card frame rare", "card frame event", "cost seal", "art window mask", "type plaque", "keyword ribbon"]
      },
      {
        id: "status-icons",
        path: "assets/source/ui/icons/status-icon-kit.psd",
        requiredLayerNames: ["status block icon", "status mind icon", "status ink icon", "status bleed icon", "status vulnerable icon", "status charm icon", "resource attack icon", "resource armor icon", "resource charm icon"]
      }
    ],
    runtime: {
      assets: runtimeAssets.map(({ source, sheet, ...asset }) => ({
        ...asset,
        src: `/assets/generated/ui/combat-hud/${asset.id}.png`
      }))
    },
    prototype: {
      path: "docs/superpowers/prototypes/combat-ui-kit/index.html",
      desktopScreenshot: "docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png",
      mobileScreenshot: "docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png"
    }
  };
  writeFileSync(join(hudSourceDir, "combat-ui-kit-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}
