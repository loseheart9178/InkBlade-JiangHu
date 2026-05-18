import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const sourceRoot = join(repoRoot, "public/assets/generated/sources/high-frame-animation");
const outRoot = join(sourceRoot, "4096");
const frameRoot = join(sourceRoot, "frames-512");

const cellSize = 512;
const sheetColumns = 8;
const sheetRows = 8;
const sheetSize = cellSize * sheetColumns;

const targets = [
  {
    id: "zhaoyun_dash_spear_combo",
    character: "zhaoyun",
    source: "zhaoyun-24f-dash-spear-combo-sheet-source.png",
    sourceColumns: 5,
    sourceRows: 5,
    frameCount: 24,
    output: "zhaoyun-24f-dash-spear-combo-4096-source.png"
  },
  {
    id: "diaochan_crimson_dance",
    character: "diaochan",
    source: "diaochan-32f-crimson-dance-sheet-source.png",
    sourceColumns: 7,
    sourceRows: 6,
    frameCount: 32,
    output: "diaochan-32f-crimson-dance-4096-source.png"
  },
  {
    id: "caiwenji_qin_resonance",
    character: "caiwenji",
    source: "caiwenji-24f-qin-resonance-sheet-source.png",
    sourceColumns: 5,
    sourceRows: 5,
    frameCount: 24,
    output: "caiwenji-24f-qin-resonance-4096-source.png"
  },
  {
    id: "zhugeliang_qimen_bagua",
    character: "zhugeliang",
    source: "zhugeliang-32f-qimen-bagua-sheet-source.png",
    sourceColumns: 7,
    sourceRows: 6,
    frameCount: 32,
    output: "zhugeliang-32f-qimen-bagua-4096-source.png"
  }
];

function runMagick(args) {
  execFileSync("magick", args, { stdio: "inherit" });
}

function identifySize(file) {
  const result = execFileSync("magick", ["identify", "-format", "%w %h", file], {
    encoding: "utf8"
  }).trim();
  const [width, height] = result.split(/\s+/).map(Number);
  return { width, height };
}

function cropGeometry(sourceSize, columns, rows, index) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const x0 = Math.round((column * sourceSize.width) / columns);
  const x1 = Math.round(((column + 1) * sourceSize.width) / columns);
  const y0 = Math.round((row * sourceSize.height) / rows);
  const y1 = Math.round(((row + 1) * sourceSize.height) / rows);

  return {
    width: x1 - x0,
    height: y1 - y0,
    x: x0,
    y: y0
  };
}

mkdirSync(outRoot, { recursive: true });
mkdirSync(frameRoot, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  tool: "scripts/build-high-frame-animation-sheets.mjs",
  sheet: {
    width: sheetSize,
    height: sheetSize,
    columns: sheetColumns,
    rows: sheetRows,
    frameWidth: cellSize,
    frameHeight: cellSize,
    anchor: "bottom-center",
    populatedFramesStartAt: 0
  },
  targets: []
};

for (const target of targets) {
  const sourcePath = join(sourceRoot, target.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing source sheet: ${sourcePath}`);
  }

  const characterFrameDir = join(frameRoot, target.character);
  rmSync(characterFrameDir, { recursive: true, force: true });
  mkdirSync(characterFrameDir, { recursive: true });

  const sourceSize = identifySize(sourcePath);
  const outputPath = join(outRoot, target.output);
  runMagick(["-size", `${sheetSize}x${sheetSize}`, "xc:white", outputPath]);

  const frames = [];

  for (let index = 0; index < target.frameCount; index += 1) {
    const geometry = cropGeometry(sourceSize, target.sourceColumns, target.sourceRows, index);
    const frameName = `frame_${String(index + 1).padStart(2, "0")}.png`;
    const framePath = join(characterFrameDir, frameName);
    const sheetX = (index % sheetColumns) * cellSize;
    const sheetY = Math.floor(index / sheetColumns) * cellSize;

    runMagick([
      sourcePath,
      "-crop",
      `${geometry.width}x${geometry.height}+${geometry.x}+${geometry.y}`,
      "+repage",
      "-resize",
      `${cellSize}x${cellSize}!`,
      framePath
    ]);

    runMagick([
      outputPath,
      framePath,
      "-geometry",
      `+${sheetX}+${sheetY}`,
      "-composite",
      outputPath
    ]);

    frames.push({
      index,
      file: `../frames-512/${target.character}/${frameName}`,
      sourceCell: {
        columns: target.sourceColumns,
        rows: target.sourceRows,
        row: Math.floor(index / target.sourceColumns),
        column: index % target.sourceColumns
      },
      sheetFrame: {
        row: Math.floor(index / sheetColumns),
        column: index % sheetColumns,
        x: sheetX,
        y: sheetY,
        width: cellSize,
        height: cellSize
      }
    });
  }

  manifest.targets.push({
    id: target.id,
    character: target.character,
    source: `../${target.source}`,
    sourceDimensions: sourceSize,
    sourceGrid: `${target.sourceColumns}x${target.sourceRows}`,
    frameCount: target.frameCount,
    output: target.output,
    outputDimensions: { width: sheetSize, height: sheetSize },
    frames
  });
}

writeFileSync(join(outRoot, "high-frame-animation-4096-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${targets.length} normalized 4096 source sheets to ${outRoot}`);
