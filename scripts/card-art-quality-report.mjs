#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(scriptDir, "..");

const CARD_ART_RATIO_MIN = 0.65;
const CARD_ART_RATIO_MAX = 1.9;
const CARD_ART_MIN_WIDTH = 384;
const CARD_ART_MIN_HEIGHT = 256;
const CARD_ART_MIN_AREA = CARD_ART_MIN_WIDTH * CARD_ART_MIN_HEIGHT;

const genericCardAssetNames = new Set([
  "card-guqin-wave-gpt.png",
  "card-ink-slash-gpt.png",
  "card-meditation-guard-gpt.png",
  "card-red-ribbon-gpt.png",
  "card-red-spear-gpt.png",
  "card-teal-dodge-gpt.png"
]);

const suspiciousAssetNamePattern = /\b(source|sheet|sprite|strip|cutout|crop|panel|card-sheet)\b/i;

export function generateCardArtQualityReport(options = {}) {
  const projectRoot = options.projectRoot ? path.resolve(options.projectRoot) : defaultProjectRoot;
  const reportsDir = options.reportsDir ? path.resolve(projectRoot, options.reportsDir) : path.join(projectRoot, "reports");
  const jsonPath = options.jsonPath ? path.resolve(projectRoot, options.jsonPath) : path.join(reportsDir, "card-art-quality-report.json");
  const markdownPath = options.markdownPath
    ? path.resolve(projectRoot, options.markdownPath)
    : path.join(reportsDir, "card-art-quality-report.md");

  const cardsSource = readFileSync(path.join(projectRoot, "src", "game", "content", "cards.ts"), "utf8");
  const visualsPath = path.join(projectRoot, "src", "game", "content", "visuals.ts");
  const visualsSource = readFileSync(visualsPath, "utf8");
  const cardArtSources = readCardArtModuleSources(path.join(projectRoot, "src", "game", "content", "cardArt"));
  const assetAudit = readJsonIfPresent(path.join(projectRoot, "public", "assets", "generated", "asset-audit.json"));

  const cards = extractCards(cardsSource);
  const artById = extractCardArt([
    { filePath: visualsPath, source: visualsSource, arrayNames: ["cardArtList"] },
    ...cardArtSources.map((source) => ({ ...source, arrayNames: extractExportedCardArtArrayNames(source.source) }))
  ]);
  const typeFallbacks = getTypeFallbacks(artById);
  const cardBindings = cards.map((card) => createCardBinding(projectRoot, card, artById, typeFallbacks));
  const duplicateReuse = summarizeDuplicateReuse(cardBindings);
  const queue = rankReplacementQueue(cardBindings, duplicateReuse.byAssetPath);
  const summary = summarize(cardBindings, artById, assetAudit, queue, duplicateReuse.groups);
  const sourceSheetSignals = summarizeSourceSheetSignals(projectRoot, assetAudit);

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    projectRoot,
    inputs: {
      cards: "src/game/content/cards.ts",
      visuals: "src/game/content/visuals.ts",
      cardArtModules: cardArtSources.map(({ filePath }) => path.relative(projectRoot, filePath).replaceAll(path.sep, "/")),
      assetAudit: "public/assets/generated/asset-audit.json"
    },
    summary,
    duplicateReuse: {
      totalDuplicateAssets: duplicateReuse.groups.length,
      totalCardsUsingDuplicateAssets: duplicateReuse.groups.reduce((total, group) => total + group.cards.length, 0),
      groups: duplicateReuse.groups
    },
    fallbackAndDefaultArt: {
      fallbackCount: cardBindings.filter((binding) => binding.qualityFlags.includes("missing-card-art-id")).length,
      sharedTypeAssetCount: cardBindings.filter((binding) => binding.qualityFlags.includes("shared-type-asset")).length,
      genericAssetCount: cardBindings.filter((binding) => binding.qualityFlags.includes("generic-card-asset")).length,
      cards: cardBindings
        .filter((binding) => binding.qualityFlags.some((flag) => ["missing-card-art-id", "shared-type-asset", "generic-card-asset"].includes(flag)))
        .map(toCardFinding)
    },
    missingFiles: cardBindings.filter((binding) => binding.qualityFlags.includes("missing-file")).map(toCardFinding),
    formatDistribution: summary.formatDistribution,
    dimensionFindings: cardBindings
      .filter((binding) => binding.qualityFlags.includes("low-resolution") || binding.qualityFlags.includes("odd-aspect-ratio"))
      .map(toCardFinding),
    sourceSheetSignals,
    cardBindings: cardBindings.map((binding) => ({
      id: binding.id,
      name: binding.name,
      character: binding.character,
      rarity: binding.rarity,
      types: binding.types,
      visualCue: binding.visualCue,
      artId: binding.artId,
      artSource: binding.artSource,
      assetPath: binding.assetPath,
      format: binding.asset.format,
      dimensions: binding.asset.dimensions,
      qualityFlags: binding.qualityFlags
    })),
    replacementQueue: queue
  };

  mkdirSync(path.dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, renderMarkdown(report, projectRoot, jsonPath), "utf8");

  return { report, jsonPath, markdownPath };
}

function main() {
  const { report, jsonPath, markdownPath } = generateCardArtQualityReport();

  console.log(
    [
      `Card art quality report wrote ${path.relative(defaultProjectRoot, jsonPath)}`,
      `Markdown report wrote ${path.relative(defaultProjectRoot, markdownPath)}`,
      `cards: ${report.summary.cardCount}`,
      `missing files: ${report.summary.missingFileCount}`,
      `duplicate asset groups: ${report.duplicateReuse.totalDuplicateAssets}`,
      `replacement queue: ${report.replacementQueue.length}`
    ].join("\n")
  );

  if (report.summary.missingFileCount > 0) {
    process.exitCode = 1;
  }
}

function summarize(cardBindings, artById, assetAudit, queue, duplicateGroups) {
  const formatDistribution = countBy(cardBindings, (binding) => binding.asset.format);
  formatDistribution.png ??= 0;
  formatDistribution.svg ??= 0;
  const rarityDistribution = countBy(cardBindings, (binding) => binding.rarity);
  const characterDistribution = countBy(cardBindings, (binding) => binding.character);
  const directArtCount = cardBindings.filter((binding) => !binding.qualityFlags.includes("missing-card-art-id")).length;
  const fallbackCount = cardBindings.length - directArtCount;
  const suspiciousCropCount = cardBindings.filter((binding) => binding.qualityFlags.includes("sheet-or-crop-name")).length;
  const anomalousDimensionCount = cardBindings.filter((binding) =>
    binding.qualityFlags.includes("low-resolution") || binding.qualityFlags.includes("odd-aspect-ratio")
  ).length;

  return {
    cardCount: cardBindings.length,
    cardArtEntryCount: artById.size,
    directArtCount,
    fallbackCount,
    missingFileCount: cardBindings.filter((binding) => binding.qualityFlags.includes("missing-file")).length,
    genericAssetCount: cardBindings.filter((binding) => binding.qualityFlags.includes("generic-card-asset")).length,
    duplicateAssetGroupCount: duplicateGroups.length,
    suspiciousCropSignalCount: suspiciousCropCount,
    anomalousDimensionCount,
    queueCount: queue.length,
    queueTopScore: queue[0]?.score ?? 0,
    formatDistribution,
    rarityDistribution,
    characterDistribution,
    runtimeAssetAudit: summarizeRuntimeAssetAudit(assetAudit)
  };
}

function summarizeRuntimeAssetAudit(assetAudit) {
  if (!assetAudit?.summary) {
    return null;
  }

  return {
    runtimeReferenceCount: assetAudit.summary.runtimeReferenceCount ?? 0,
    uniqueRuntimeFileCount: assetAudit.summary.uniqueRuntimeFileCount ?? 0,
    missingCount: assetAudit.summary.missingCount ?? 0,
    inkPassDebtCount: assetAudit.summary.inkPassDebtCount ?? 0,
    cardFallbackDebtCount: assetAudit.summary.cardFallbackDebtCount ?? 0,
    gpt2RuntimeCount: assetAudit.summary.gpt2RuntimeCount ?? 0,
    sourceSheetCount: assetAudit.summary.sourceSheetCount ?? 0
  };
}

function createCardBinding(projectRoot, card, artById, typeFallbacks) {
  const primaryType = card.types[0] ?? "skill";
  const directArt = artById.get(card.id);
  const fallbackArtId = `type_${primaryType}`;
  const fallbackArt = typeFallbacks.get(primaryType);
  const art = directArt ?? fallbackArt;
  const assetPath = art?.assetPath ?? "";
  const asset = inspectAsset(projectRoot, assetPath);
  const qualityFlags = [];

  if (!directArt) {
    qualityFlags.push("missing-card-art-id");
  }

  if (directArt && fallbackArt && directArt.assetPath === fallbackArt.assetPath) {
    qualityFlags.push("shared-type-asset");
  }

  if (genericCardAssetNames.has(path.posix.basename(assetPath))) {
    qualityFlags.push("generic-card-asset");
  }

  if (!asset.exists) {
    qualityFlags.push("missing-file");
  }

  if (asset.format === "svg") {
    qualityFlags.push("vector-placeholder");
  }

  if (asset.dimensions?.width && asset.dimensions?.height) {
    const area = asset.dimensions.width * asset.dimensions.height;

    if (asset.format === "png" && (asset.dimensions.width < CARD_ART_MIN_WIDTH || asset.dimensions.height < CARD_ART_MIN_HEIGHT || area < CARD_ART_MIN_AREA)) {
      qualityFlags.push("low-resolution");
    }

    if (asset.dimensions.aspectRatio < CARD_ART_RATIO_MIN || asset.dimensions.aspectRatio > CARD_ART_RATIO_MAX) {
      qualityFlags.push("odd-aspect-ratio");
    }
  }

  if (suspiciousAssetNamePattern.test(assetPath)) {
    qualityFlags.push("sheet-or-crop-name");
  }

  return {
    ...card,
    artId: art?.id ?? fallbackArtId,
    artSource: art?.source ?? "missing",
    fallbackArtId,
    assetPath,
    asset,
    qualityFlags
  };
}

function inspectAsset(projectRoot, assetPath) {
  const extension = path.posix.extname(assetPath).toLowerCase().replace(".", "") || "unknown";
  const filePath = toPublicFilePath(projectRoot, assetPath);

  if (!assetPath || !existsSync(filePath)) {
    return {
      exists: false,
      format: extension,
      bytes: 0,
      dimensions: null
    };
  }

  const bytes = statSync(filePath).size;

  if (extension === "png") {
    const buffer = readFileSync(filePath);
    const dimensions = readPngDimensions(buffer);

    return {
      exists: true,
      format: "png",
      bytes,
      dimensions
    };
  }

  if (extension === "svg") {
    const source = readFileSync(filePath, "utf8");
    const dimensions = readSvgDimensions(source);

    return {
      exists: true,
      format: "svg",
      bytes,
      dimensions
    };
  }

  return {
    exists: true,
    format: extension,
    bytes,
    dimensions: null
  };
}

function readPngDimensions(buffer) {
  const isPng = buffer.length >= 24
    && buffer[0] === 0x89
    && buffer.subarray(1, 4).toString("ascii") === "PNG"
    && buffer.subarray(12, 16).toString("ascii") === "IHDR";

  if (!isPng) {
    return null;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return createDimensions(width, height);
}

function readSvgDimensions(source) {
  const viewBox = source.match(/\bviewBox=["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s*["']/i);

  if (viewBox) {
    return createDimensions(Number(viewBox[3]), Number(viewBox[4]));
  }

  const width = readSvgSize(source, "width");
  const height = readSvgSize(source, "height");

  if (width && height) {
    return createDimensions(width, height);
  }

  return null;
}

function readSvgSize(source, property) {
  const match = source.match(new RegExp(`\\b${property}=["']([0-9.]+)(?:px)?["']`, "i"));
  return match ? Number(match[1]) : undefined;
}

function createDimensions(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    width,
    height,
    aspectRatio: Number((width / height).toFixed(3))
  };
}

function summarizeDuplicateReuse(cardBindings) {
  const grouped = new Map();

  for (const binding of cardBindings) {
    if (!binding.assetPath) {
      continue;
    }

    if (!grouped.has(binding.assetPath)) {
      grouped.set(binding.assetPath, []);
    }

    grouped.get(binding.assetPath).push(binding);
  }

  const groups = [...grouped.entries()]
    .filter(([, bindings]) => bindings.length > 1)
    .map(([assetPath, bindings]) => ({
      assetPath,
      reuseCount: bindings.length,
      cards: bindings
        .map((binding) => ({
          id: binding.id,
          name: binding.name,
          character: binding.character,
          rarity: binding.rarity,
          types: binding.types
        }))
        .sort((left, right) => left.id.localeCompare(right.id))
    }))
    .sort((left, right) => right.reuseCount - left.reuseCount || left.assetPath.localeCompare(right.assetPath));

  return {
    groups,
    byAssetPath: new Map(groups.map((group) => [group.assetPath, group]))
  };
}

function rankReplacementQueue(cardBindings, duplicateByAssetPath) {
  return cardBindings
    .map((binding) => {
      const reasons = new Set(binding.qualityFlags);
      const duplicateGroup = duplicateByAssetPath.get(binding.assetPath);
      let score = 0;

      if (binding.qualityFlags.includes("missing-file")) {
        score += 120;
      }

      if (binding.qualityFlags.includes("missing-card-art-id")) {
        score += 100;
      }

      if (binding.qualityFlags.includes("shared-type-asset")) {
        score += 90;
      }

      if (binding.qualityFlags.includes("sheet-or-crop-name")) {
        score += 80;
        reasons.add("bad-crop-suspect");
      }

      if (binding.qualityFlags.includes("low-resolution") || binding.qualityFlags.includes("odd-aspect-ratio")) {
        score += 70;
        reasons.add("dimension-anomaly");
      }

      if (binding.qualityFlags.includes("generic-card-asset")) {
        score += 45;
      }

      if (duplicateGroup) {
        score += 35 + Math.min(40, duplicateGroup.reuseCount * 4);
        reasons.add("duplicate-reuse");
      }

      if (binding.rarity === "starter") {
        score += 35;
        reasons.add("starter-priority");
      }

      if (binding.rarity === "common") {
        score += 25;
        reasons.add("common-priority");
      }

      if (binding.visualCue) {
        score += 35;
        reasons.add("signature-priority");
      }

      if (binding.rarity === "ink" || binding.rarity === "status" || binding.types.includes("ink")) {
        score += 30;
        reasons.add("ink-status-priority");
      }

      if (binding.qualityFlags.includes("vector-placeholder")) {
        score += 12;
      }

      return {
        cardId: binding.id,
        name: binding.name,
        character: binding.character,
        rarity: binding.rarity,
        types: binding.types,
        visualCue: binding.visualCue,
        assetPath: binding.assetPath,
        artId: binding.artId,
        format: binding.asset.format,
        dimensions: binding.asset.dimensions,
        reuseCount: duplicateGroup?.reuseCount ?? 1,
        score,
        reasons: [...reasons].sort()
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.cardId.localeCompare(right.cardId))
    .map((entry, index) => ({ rank: index + 1, ...entry }));
}

function summarizeSourceSheetSignals(projectRoot, assetAudit) {
  const sourceSheets = Array.isArray(assetAudit?.sourceSheets) ? assetAudit.sourceSheets : [];
  const cardRuntimeFiles = listCardRuntimeFiles(projectRoot);
  const suspiciousRuntimeFiles = cardRuntimeFiles
    .filter((assetPath) => suspiciousAssetNamePattern.test(assetPath))
    .sort();

  return {
    sourceSheetCount: sourceSheets.length,
    sourceSheets: sourceSheets.slice(0, 40),
    suspiciousRuntimeFileCount: suspiciousRuntimeFiles.length,
    suspiciousRuntimeFiles
  };
}

function listCardRuntimeFiles(projectRoot) {
  const directory = path.join(projectRoot, "public", "assets", "generated", "cards");

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `/assets/generated/cards/${entry.name}`)
    .sort();
}

function renderMarkdown(report, projectRoot, jsonPath) {
  const lines = [];
  const runtimeAudit = report.summary.runtimeAssetAudit;

  lines.push("# Card Art Quality Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Cards scanned: ${report.summary.cardCount}`);
  lines.push(`- Card art entries: ${report.summary.cardArtEntryCount}`);
  lines.push(`- Direct card art bindings: ${report.summary.directArtCount}`);
  lines.push(`- Fallback/default card issues: ${report.summary.fallbackCount + report.summary.genericAssetCount}`);
  lines.push(`- Duplicate asset groups: ${report.summary.duplicateAssetGroupCount}`);
  lines.push(`- Missing files: ${report.summary.missingFileCount}`);
  lines.push(`- Dimension/crop signals: ${report.summary.anomalousDimensionCount + report.summary.suspiciousCropSignalCount}`);
  lines.push(`- Replacement queue entries: ${report.summary.queueCount}`);
  lines.push("");
  lines.push("## Runtime Totals");
  lines.push("");

  if (runtimeAudit) {
    lines.push(`- Runtime references: ${runtimeAudit.runtimeReferenceCount}`);
    lines.push(`- Unique runtime files: ${runtimeAudit.uniqueRuntimeFileCount}`);
    lines.push(`- Runtime missing files: ${runtimeAudit.missingCount}`);
    lines.push(`- Runtime card fallback debt: ${runtimeAudit.cardFallbackDebtCount}`);
    lines.push(`- Runtime source sheets: ${runtimeAudit.sourceSheetCount}`);
  } else {
    lines.push("- Runtime asset audit was not found.");
  }

  lines.push("");
  lines.push("## Format Distribution");
  lines.push("");
  lines.push(renderKeyValueTable(report.formatDistribution));
  lines.push("");
  lines.push("## Duplicate Asset Reuse");
  lines.push("");

  if (report.duplicateReuse.groups.length === 0) {
    lines.push("No duplicate card asset reuse detected.");
  } else {
    lines.push("| Asset | Reuse | Cards |");
    lines.push("| --- | ---: | --- |");

    for (const group of report.duplicateReuse.groups.slice(0, 25)) {
      const cards = group.cards.map((card) => `${card.name} (${card.id})`).join(", ");
      lines.push(`| \`${group.assetPath}\` | ${group.reuseCount} | ${cards} |`);
    }
  }

  lines.push("");
  lines.push("## Fallback And Default Art");
  lines.push("");
  lines.push(`- Missing direct art ids: ${report.fallbackAndDefaultArt.fallbackCount}`);
  lines.push(`- Shared type fallback assets: ${report.fallbackAndDefaultArt.sharedTypeAssetCount}`);
  lines.push(`- Generic early card assets: ${report.fallbackAndDefaultArt.genericAssetCount}`);
  lines.push("");
  lines.push("## Dimension And Crop Signals");
  lines.push("");
  lines.push(`- Anomalous dimensions: ${report.dimensionFindings.length}`);
  lines.push(`- Suspicious source-sheet/crop runtime names: ${report.sourceSheetSignals.suspiciousRuntimeFileCount}`);
  lines.push(`- Source sheets retained for provenance: ${report.sourceSheetSignals.sourceSheetCount}`);
  lines.push("");
  lines.push("## Ranked Replacement Queue");
  lines.push("");
  lines.push("| Rank | Score | Card | Rarity | Asset | Reasons |");
  lines.push("| ---: | ---: | --- | --- | --- | --- |");

  for (const entry of report.replacementQueue.slice(0, 60)) {
    lines.push(
      `| ${entry.rank} | ${entry.score} | ${entry.name} (${entry.cardId}) | ${entry.rarity} | \`${entry.assetPath}\` | ${entry.reasons.join(", ")} |`
    );
  }

  if (report.replacementQueue.length > 60) {
    lines.push(`| ... | ... | ${report.replacementQueue.length - 60} additional queue entries in JSON | ... | ... | ... |`);
  }

  lines.push("");
  lines.push("## Full Data");
  lines.push("");
  lines.push(`JSON report: \`${path.relative(projectRoot, jsonPath).replaceAll(path.sep, "/")}\``);
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function renderKeyValueTable(record) {
  const entries = Object.entries(record ?? {}).sort(([left], [right]) => left.localeCompare(right));

  if (entries.length === 0) {
    return "No entries.";
  }

  return [
    "| Value | Count |",
    "| --- | ---: |",
    ...entries.map(([value, count]) => `| ${value} | ${count} |`)
  ].join("\n");
}

function toCardFinding(binding) {
  return {
    id: binding.id,
    name: binding.name,
    character: binding.character,
    rarity: binding.rarity,
    types: binding.types,
    assetPath: binding.assetPath,
    artId: binding.artId,
    format: binding.asset.format,
    dimensions: binding.asset.dimensions,
    qualityFlags: binding.qualityFlags
  };
}

function readCardArtModuleSources(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => {
      const filePath = path.join(directory, entry.name);
      return {
        filePath,
        source: readFileSync(filePath, "utf8")
      };
    })
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}

function extractCards(source) {
  return splitTopLevelObjects(extractArrayLiteral(source, "cardList")).map((objectSource) => ({
    id: readStringProperty(objectSource, "id"),
    name: readStringProperty(objectSource, "name"),
    character: readStringProperty(objectSource, "character", false) ?? "neutral",
    rarity: readStringProperty(objectSource, "rarity"),
    types: readStringArrayProperty(objectSource, "types"),
    archetypes: readStringArrayProperty(objectSource, "archetypes", false),
    visualCue: readStringProperty(objectSource, "visualCue", false)
  }));
}

function extractCardArt(sourceFiles) {
  const artById = new Map();

  for (const file of sourceFiles) {
    for (const arrayName of file.arrayNames) {
      const arraySource = extractArrayLiteral(file.source, arrayName, false);

      if (!arraySource) {
        continue;
      }

      for (const objectSource of splitTopLevelObjects(arraySource)) {
        const id = readStringProperty(objectSource, "id", false);
        const assetPath = readStringProperty(objectSource, "assetPath", false);

        if (!id || !assetPath) {
          continue;
        }

        artById.set(id, {
          id,
          assetPath,
          alt: readStringProperty(objectSource, "alt", false) ?? "",
          accent: readStringProperty(objectSource, "accent", false) ?? "ink",
          source: `${path.basename(file.filePath)}:${arrayName}`
        });
      }
    }
  }

  return artById;
}

function extractExportedCardArtArrayNames(source) {
  return [...source.matchAll(/export const (\w+CardArt):\s*CardArtDefinition\[\]\s*=/g)].map((match) => match[1]);
}

function getTypeFallbacks(artById) {
  const fallbacks = new Map();

  for (const [id, art] of artById.entries()) {
    if (id.startsWith("type_")) {
      fallbacks.set(id.slice("type_".length), art);
    }
  }

  return fallbacks;
}

function extractArrayLiteral(source, exportName, required = true) {
  const declarationIndex = source.indexOf(`export const ${exportName}`);

  if (declarationIndex < 0) {
    if (required) {
      throw new Error(`Could not find ${exportName}`);
    }

    return "";
  }

  const assignmentIndex = source.indexOf("=", declarationIndex);

  if (assignmentIndex < 0) {
    throw new Error(`Could not find ${exportName} assignment`);
  }

  const arrayStart = source.indexOf("[", assignmentIndex);

  if (arrayStart < 0) {
    throw new Error(`Could not find ${exportName} array start`);
  }

  const arrayEnd = findMatchingBracket(source, arrayStart, "[", "]");
  return source.slice(arrayStart + 1, arrayEnd);
}

function splitTopLevelObjects(arraySource) {
  const objects = [];
  let index = 0;

  while (index < arraySource.length) {
    const objectStart = arraySource.indexOf("{", index);

    if (objectStart < 0) {
      break;
    }

    const objectEnd = findMatchingBracket(arraySource, objectStart, "{", "}");
    objects.push(arraySource.slice(objectStart, objectEnd + 1));
    index = objectEnd + 1;
  }

  return objects;
}

function findMatchingBracket(source, startIndex, openToken, closeToken) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === openToken) {
      depth += 1;
      continue;
    }

    if (char === closeToken) {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error(`Could not match ${openToken}${closeToken} bracket`);
}

function readStringProperty(objectSource, propertyName, required = true) {
  const match = objectSource.match(new RegExp(`\\b${propertyName}:\\s*"([^"]*)"`));

  if (match) {
    return match[1];
  }

  if (required) {
    throw new Error(`Missing string property ${propertyName}`);
  }

  return undefined;
}

function readStringArrayProperty(objectSource, propertyName, required = true) {
  const match = objectSource.match(new RegExp(`\\b${propertyName}:\\s*\\[([^\\]]*)\\]`));

  if (!match) {
    if (required) {
      throw new Error(`Missing string array property ${propertyName}`);
    }

    return [];
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function countBy(entries, getKey) {
  const counts = {};

  for (const entry of entries) {
    const key = getKey(entry) ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toPublicFilePath(projectRoot, assetPath) {
  return path.join(projectRoot, "public", assetPath.replace(/^\//, ""));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
