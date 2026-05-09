import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const publicRoot = path.join(projectRoot, "public");
const visualsPath = path.join(projectRoot, "src", "game", "content", "visuals.ts");
const cardsPath = path.join(projectRoot, "src", "game", "content", "cards.ts");
const cardArtModuleDir = path.join(projectRoot, "src", "game", "content", "cardArt");
const ledgerPath = path.join(publicRoot, "assets", "generated", "asset-audit.json");
const promptQueuePath = path.join(publicRoot, "assets", "generated", "gpt2-prompt-queue.json");

const visualsSource = readFileSync(visualsPath, "utf8");
const cardsSource = readFileSync(cardsPath, "utf8");
const cardArtModuleSources = readCardArtModuleSources(cardArtModuleDir);

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
const cardArtManifestSource = [visualsSource, ...cardArtModuleSources.map(({ source }) => source)].join("\n");
const runtimeReferences = [
  ...collectRuntimeReferences(visualsSource),
  ...cardArtModuleSources.flatMap(({ source }) => collectRuntimeReferences(source, "cardArt"))
];

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
const promptQueue = summarizePromptQueue(promptQueuePath);
const cardFallbackDebt = summarizeCardFallbackDebt(cardsSource, cardArtManifestSource);

const ledger = {
  schemaVersion: 1,
  visualManifest: "src/game/content/visuals.ts",
  cardManifest: "src/game/content/cards.ts",
  summary: {
    runtimeReferenceCount: runtimeReferences.length,
    uniqueRuntimeFileCount: runtimeFiles.length,
    missingCount: missing.length,
    inkPassDebtCount: inkPassDebt.length,
    gpt2RuntimeCount: gpt2Runtime.length,
    sourceSheetCount: sourceSheets.length,
    cardFallbackDebtCount: cardFallbackDebt.totalCount
  },
  missing,
  inkPassDebt,
  cardFallbackDebt,
  gpt2Runtime,
  sourceSheets,
  promptQueue
};

mkdirSync(path.dirname(ledgerPath), { recursive: true });
writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

console.log(
  [
    `Asset audit wrote ${path.relative(projectRoot, ledgerPath)}`,
    `runtime references: ${runtimeReferences.length}`,
    `missing: ${missing.length}`,
    `ink-pass debt: ${inkPassDebt.length}`,
    `card fallback debt: ${cardFallbackDebt.totalCount}`,
    `GPT2 runtime assets: ${gpt2Runtime.length}`,
    `source sheets: ${sourceSheets.length}`,
    `prompt queue targets: ${promptQueue?.targetCount ?? 0}`
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

function collectRuntimeReferences(source, kindOverride) {
  const references = [];

  for (const match of source.matchAll(runtimeReferencePattern)) {
    const property = match[1];
    const assetPath = match[2];
    const index = match.index ?? 0;
    const objectStart = source.lastIndexOf("{", index);
    const objectPrefix = source.slice(Math.max(0, objectStart), index);
    const idMatches = [...objectPrefix.matchAll(/\bid:\s*"([^"]+)"/g)];
    const id = idMatches.at(-1)?.[1] ?? path.basename(assetPath, path.extname(assetPath));

    references.push({
      assetPath,
      id,
      kind: kindOverride ?? findManifestKind(index),
      property
    });
  }

  return references;
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
  return fileName.startsWith("gpt2-") || fileName.includes("-gpt-v2") || /-gpt2\.(?:png|jpe?g|webp)$/.test(fileName);
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

function summarizePromptQueue(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const queue = JSON.parse(readFileSync(filePath, "utf8"));
  const targets = Array.isArray(queue.targets) ? queue.targets : [];
  const categories = {};
  const types = {};

  for (const target of targets) {
    const category = typeof target.category === "string" ? target.category : "uncategorized";
    const type = typeof target.type === "string" ? target.type : "unknown";

    categories[category] = (categories[category] ?? 0) + 1;
    types[type] = (types[type] ?? 0) + 1;
  }

  return {
    assetPath: toAssetPath(filePath),
    targetCount: targets.length,
    categories,
    types
  };
}

function summarizeCardFallbackDebt(cardSource, visualSource) {
  const cards = extractCards(cardSource);
  const cardArtById = extractCardArt(visualSource);
  const debtCards = cards
    .map((card) => {
      const primaryType = card.types[0] ?? "unknown";
      const fallbackArtId = `type_${primaryType}`;
      const directArt = cardArtById.get(card.id);
      const fallbackArt = cardArtById.get(fallbackArtId);
      const usesTypeFallback = !directArt;
      const usesSharedTypeAsset = Boolean(directArt && fallbackArt && directArt.assetPath === fallbackArt.assetPath);

      if (!usesTypeFallback && !usesSharedTypeAsset) {
        return null;
      }

      return {
        id: card.id,
        name: card.name,
        character: card.character ?? "common",
        type: primaryType,
        rarity: card.rarity,
        fallbackArtId,
        fallbackAssetPath: fallbackArt?.assetPath ?? "",
        reason: usesTypeFallback ? "missing-card-art-id" : "shared-type-asset"
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    totalCount: debtCards.length,
    byCharacter: summarizeBy(debtCards, "character"),
    byType: summarizeBy(debtCards, "type"),
    byRarity: summarizeBy(debtCards, "rarity"),
    cards: debtCards
  };
}

function extractCards(source) {
  return splitTopLevelObjects(extractArrayLiteral(source, "cardList")).map((objectSource) => ({
    id: readStringProperty(objectSource, "id"),
    name: readStringProperty(objectSource, "name"),
    character: readStringProperty(objectSource, "character", false),
    rarity: readStringProperty(objectSource, "rarity"),
    types: readStringArrayProperty(objectSource, "types")
  }));
}

function extractCardArt(source) {
  const artById = new Map();
  const cardArtArrayNames = [
    "cardArtList",
    ...[...source.matchAll(/export const (\w+CardArt):\s*CardArtDefinition\[\]\s*=/g)].map((match) => match[1])
  ];

  for (const arrayName of new Set(cardArtArrayNames)) {
    for (const objectSource of splitTopLevelObjects(extractArrayLiteral(source, arrayName))) {
      const id = readStringProperty(objectSource, "id");
      artById.set(id, {
        id,
        assetPath: readStringProperty(objectSource, "assetPath")
      });
    }
  }

  return artById;
}

function extractArrayLiteral(source, exportName) {
  const declarationIndex = source.indexOf(`export const ${exportName}`);

  if (declarationIndex < 0) {
    throw new Error(`Could not find ${exportName}`);
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

function readStringArrayProperty(objectSource, propertyName) {
  const match = objectSource.match(new RegExp(`\\b${propertyName}:\\s*\\[([^\\]]*)\\]`));

  if (!match) {
    throw new Error(`Missing string array property ${propertyName}`);
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function summarizeBy(entries, key) {
  const counts = new Map();

  for (const entry of entries) {
    counts.set(entry[key], (counts.get(entry[key]) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ [key]: value, count }))
    .sort((left, right) => left[key].localeCompare(right[key]));
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
