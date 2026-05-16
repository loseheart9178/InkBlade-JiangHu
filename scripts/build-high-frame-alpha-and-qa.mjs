import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const root = join(repoRoot, "public/assets/generated/sources/high-frame-animation");
const sourceFrameRoot = join(root, "frames-512");
const alphaFrameRoot = join(root, "frames-512-alpha");
const alphaSheetRoot = join(root, "4096-alpha");
const qaRoot = join(repoRoot, "output/high-frame-sheets/qa");

const cellSize = 512;
const columns = 8;
const sheetSize = 4096;
const edgeCrop = 20;

const targets = [
  { character: "zhaoyun", frameCount: 24, output: "zhaoyun-24f-dash-spear-combo-4096-alpha.png" },
  { character: "diaochan", frameCount: 32, output: "diaochan-32f-crimson-dance-4096-alpha.png" },
  { character: "caiwenji", frameCount: 24, output: "caiwenji-24f-qin-resonance-4096-alpha.png" },
  { character: "zhugeliang", frameCount: 32, output: "zhugeliang-32f-qimen-bagua-4096-alpha.png" }
];

function runMagick(args, options = {}) {
  const result = execFileSync("magick", args, { encoding: "utf8", stdio: options.stdio ?? "pipe" });
  return typeof result === "string" ? result.trim() : "";
}

function createSoftAlpha(input, output) {
  // The source sheets use clean white paper. This removes the paper while keeping
  // antialiased ink more gently than a hard key. The result is intended for
  // Multiply-style compositing over the game's xuan-paper battlefield.
  runMagick(
    [
      input,
      "-shave",
      `${edgeCrop}x${edgeCrop}`,
      "-resize",
      `${cellSize}x${cellSize}!`,
      "-alpha",
      "set",
      "(",
      "+clone",
      "-alpha",
      "off",
      "-colorspace",
      "Gray",
      "-negate",
      "-level",
      "6%,35%",
      ")",
      "-compose",
      "CopyOpacity",
      "-composite",
      "PNG32:" + output
    ],
    { stdio: "inherit" }
  );
}

function alphaTrimBox(file) {
  const output = runMagick([file, "-alpha", "extract", "-threshold", "2%", "-trim", "-format", "%@", "info:"]);
  const match = output.match(/^(\d+)x(\d+)\+(-?\d+)\+(-?\d+)$/);
  if (!match) return null;
  const [, width, height, x, y] = match;
  return {
    width: Number(width),
    height: Number(height),
    x: Number(x),
    y: Number(y)
  };
}

function alphaMean(file) {
  const value = runMagick([file, "-alpha", "extract", "-format", "%[fx:mean]", "info:"]);
  return Number(value);
}

function edgeAlphaMean(file) {
  const top = Number(runMagick([file, "-alpha", "extract", "-crop", `${cellSize}x8+0+0`, "-format", "%[fx:mean]", "info:"]));
  const bottom = Number(runMagick([file, "-alpha", "extract", "-crop", `${cellSize}x8+0+504`, "-format", "%[fx:mean]", "info:"]));
  const left = Number(runMagick([file, "-alpha", "extract", "-crop", `8x${cellSize}+0+0`, "-format", "%[fx:mean]", "info:"]));
  const right = Number(runMagick([file, "-alpha", "extract", "-crop", `8x${cellSize}+504+0`, "-format", "%[fx:mean]", "info:"]));
  return { top, bottom, left, right, max: Math.max(top, bottom, left, right) };
}

function classifyFrame(box, coverage, edge) {
  const reasons = [];
  if (!box) reasons.push("empty-alpha");
  else {
    if (box.x <= 2) reasons.push("touches-left-edge");
    if (box.y <= 2) reasons.push("touches-top-edge");
    if (box.x + box.width >= 510) reasons.push("touches-right-edge");
    if (box.y + box.height >= 510) reasons.push("touches-bottom-edge");
    if (box.width < 120 || box.height < 160) reasons.push("subject-too-small");
    if (box.width > 500 || box.height > 500) reasons.push("subject-too-large");
  }
  if (coverage < 0.018) reasons.push("low-ink-coverage");
  if (coverage > 0.42) reasons.push("high-ink-coverage");
  if (edge.max > 0.08) reasons.push("edge-alpha-residue");
  return reasons;
}

mkdirSync(alphaFrameRoot, { recursive: true });
mkdirSync(alphaSheetRoot, { recursive: true });
mkdirSync(qaRoot, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  tool: "scripts/build-high-frame-alpha-and-qa.mjs",
  alphaMethod: `shave ${edgeCrop}px cell border, resize back to 512, grayscale inverse alpha from white source, level 6%-35%`,
  sheet: { width: sheetSize, height: sheetSize, columns, frameWidth: cellSize, frameHeight: cellSize },
  targets: []
};

for (const target of targets) {
  const sourceDir = join(sourceFrameRoot, target.character);
  if (!existsSync(sourceDir)) throw new Error(`Missing frame dir: ${sourceDir}`);

  const outDir = join(alphaFrameRoot, target.character);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const sheetPath = join(alphaSheetRoot, target.output);
  runMagick(["-size", `${sheetSize}x${sheetSize}`, "xc:none", "PNG32:" + sheetPath], { stdio: "inherit" });

  const frames = [];

  for (let i = 0; i < target.frameCount; i += 1) {
    const frame = `frame_${String(i + 1).padStart(2, "0")}.png`;
    const source = join(sourceDir, frame);
    const alpha = join(outDir, frame);
    const x = (i % columns) * cellSize;
    const y = Math.floor(i / columns) * cellSize;

    createSoftAlpha(source, alpha);
    runMagick([sheetPath, alpha, "-geometry", `+${x}+${y}`, "-compose", "Over", "-composite", "PNG32:" + sheetPath], {
      stdio: "inherit"
    });

    const box = alphaTrimBox(alpha);
    const coverage = alphaMean(alpha);
    const edge = edgeAlphaMean(alpha);
    const reasons = classifyFrame(box, coverage, edge);

    frames.push({
      index: i,
      frame: frame,
      alphaFramePath: `../frames-512-alpha/${target.character}/${frame}`,
      sheetCell: { x, y, width: cellSize, height: cellSize },
      alphaBox: box,
      alphaCoverage: Number(coverage.toFixed(5)),
      edgeAlpha: Object.fromEntries(Object.entries(edge).map(([key, value]) => [key, Number(value.toFixed(5))])),
      qa: {
        status: reasons.length ? "review" : "pass",
        reasons
      }
    });
  }

  manifest.targets.push({
    character: target.character,
    frameCount: target.frameCount,
    alphaSheetPath: target.output,
    reviewFrames: frames.filter((frame) => frame.qa.status === "review").map((frame) => frame.frame),
    frames
  });
}

writeFileSync(join(alphaSheetRoot, "high-frame-animation-alpha-qa.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const lines = ["# High-frame Alpha QA", "", `Generated: ${manifest.generatedAt}`, ""];
for (const target of manifest.targets) {
  lines.push(`## ${target.character}`, "");
  lines.push(`Alpha sheet: \`${target.alphaSheetPath}\``);
  lines.push(`Review frames: ${target.reviewFrames.length ? target.reviewFrames.join(", ") : "none"}`, "");
  for (const frame of target.frames.filter((item) => item.qa.status === "review")) {
    lines.push(`- \`${frame.frame}\`: ${frame.qa.reasons.join(", ")}; coverage ${frame.alphaCoverage}`);
  }
  lines.push("");
}
writeFileSync(join(qaRoot, "high-frame-alpha-qa.md"), `${lines.join("\n")}\n`);

console.log(`Wrote alpha frames, alpha sheets, and QA report to ${alphaSheetRoot}`);
