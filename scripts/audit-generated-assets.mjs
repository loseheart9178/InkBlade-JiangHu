import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const publicRoot = path.join(projectRoot, "public");
const visualsPath = path.join(projectRoot, "src", "game", "content", "visuals.ts");
const ledgerPath = path.join(publicRoot, "assets", "generated", "asset-audit.json");

const visualsSource = readFileSync(visualsPath, "utf8");

const manifestSections = [
  ["combatPortrait", "combatPortraitList"],
  ["cardArt", "cardArtList"],
  ["signatureVfx", "signatureVfxList"],
  ["combatSpriteSheet", "combatSpriteSheetList"],
  ["battlefield", "battlefieldAssets"]
]
  .map(([kind, token]) => ({ kind, start: visualsSource.indexOf(token) }))
  .filter((section) => section.start >= 0)
  .sort((left, right) => left.start - right.start);

const runtimeReferencePattern = /\b(assetPath|standeePath):\s*"((?:\/assets\/generated|\/assets\/sprites)\/[^"]+)"/g;
const runtimeReferences = [];

for (const match of visualsSource.matchAll(runtimeReferencePattern)) {
  const property = match[1];
  const assetPath = match[2];
  const index = match.index ?? 0;
  const objectStart = visualsSource.lastIndexOf("{", index);
  const objectPrefix = visualsSource.slice(Math.max(0, objectStart), index);
  const idMatches = [...objectPrefix.matchAll(/\bid:\s*"([^"]+)"/g)];
  const id = idMatches.at(-1)?.[1] ?? path.basename(assetPath, path.extname(assetPath));

  runtimeReferences.push({
    assetPath,
    id,
    kind: findManifestKind(index),
    property
  });
}

const runtimeFiles = groupByAssetPath(runtimeReferences);
const missing = runtimeFiles
  .filter((file) => !existsSync(toPublicFilePath(file.assetPath)))
  .map((file) => ({
    assetPath: file.assetPath,
    references: file.references.map(({ kind, id, property }) => ({ kind, id, property }))
  }));

const inkPassDebt = groupBySemanticAsset(runtimeReferences.filter((reference) => reference.assetPath.includes("ink-pass")));
const gpt2Runtime = groupBySemanticAsset(runtimeReferences.filter((reference) => isGpt2RuntimeAsset(reference.assetPath)));
const sourceSheets = findSourceSheets(path.join(publicRoot, "assets", "generated"));

const ledger = {
  schemaVersion: 1,
  visualManifest: "src/game/content/visuals.ts",
  summary: {
    runtimeReferenceCount: runtimeReferences.length,
    uniqueRuntimeFileCount: runtimeFiles.length,
    missingCount: missing.length,
    inkPassDebtCount: inkPassDebt.length,
    gpt2RuntimeCount: gpt2Runtime.length,
    sourceSheetCount: sourceSheets.length
  },
  missing,
  inkPassDebt,
  gpt2Runtime,
  sourceSheets
};

mkdirSync(path.dirname(ledgerPath), { recursive: true });
writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

console.log(
  [
    `Asset audit wrote ${path.relative(projectRoot, ledgerPath)}`,
    `runtime references: ${runtimeReferences.length}`,
    `missing: ${missing.length}`,
    `ink-pass debt: ${inkPassDebt.length}`,
    `GPT2 runtime assets: ${gpt2Runtime.length}`,
    `source sheets: ${sourceSheets.length}`
  ].join("\n")
);

if (missing.length > 0) {
  process.exitCode = 1;
}

function findManifestKind(index) {
  let kind = "unknown";

  for (const section of manifestSections) {
    if (section.start > index) {
      break;
    }

    kind = section.kind;
  }

  return kind;
}

function groupByAssetPath(references) {
  const grouped = new Map();

  for (const reference of references) {
    if (!grouped.has(reference.assetPath)) {
      grouped.set(reference.assetPath, {
        assetPath: reference.assetPath,
        references: []
      });
    }

    grouped.get(reference.assetPath).references.push(reference);
  }

  return [...grouped.values()].sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

function groupBySemanticAsset(references) {
  const grouped = new Map();

  for (const reference of references) {
    const key = `${reference.kind}:${reference.id}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        kind: reference.kind,
        id: reference.id,
        paths: new Set()
      });
    }

    grouped.get(key).paths.add(reference.assetPath);
  }

  return [...grouped.values()]
    .map((entry) => ({
      kind: entry.kind,
      id: entry.id,
      paths: [...entry.paths].sort()
    }))
    .sort((left, right) => `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`));
}

function isGpt2RuntimeAsset(assetPath) {
  const fileName = path.posix.basename(assetPath).toLowerCase();
  return fileName.startsWith("gpt2-") || fileName.includes("-gpt-v2");
}

function findSourceSheets(rootDir) {
  if (!existsSync(rootDir)) {
    return [];
  }

  return walkFiles(rootDir)
    .filter((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath).toLowerCase();
      const normalizedPath = toAssetPath(filePath);

      return [".png", ".jpg", ".jpeg", ".webp"].includes(extension)
        && (normalizedPath.includes("/assets/generated/sources/") || fileName.includes("source") || fileName.includes("sheet"));
    })
    .map((filePath) => ({
      assetPath: toAssetPath(filePath),
      bytes: statSync(filePath).size
    }))
    .sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

function walkFiles(rootDir) {
  const files = [];

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function toPublicFilePath(assetPath) {
  return path.join(publicRoot, assetPath.replace(/^\//, ""));
}

function toAssetPath(filePath) {
  return `/${path.relative(publicRoot, filePath).replaceAll(path.sep, "/")}`;
}
