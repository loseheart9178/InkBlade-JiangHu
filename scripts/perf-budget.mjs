#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kib = 1024;
const mib = 1024 * kib;

const budgets = {
  phaserRaw: 1.4 * mib,
  phaserGzip: 380 * kib,
  otherJsRaw: 450 * kib,
  otherJsGzip: 110 * kib,
  cssRaw: 180 * kib,
  publicAssetsRaw: 260 * mib,
  cardAssetsRaw: 45 * mib,
  spriteAssetsRaw: 40 * mib,
  cardPngRaw: 1 * mib,
  rasterRaw: 4.5 * mib,
  auditMissing: 0,
  auditCardFallbackDebt: 0,
  auditUniqueRuntimeFiles: 180,
  auditSourceSheets: 25
};

export async function evaluatePerfBudget(options = {}) {
  const projectRoot = resolve(options.root ?? root);
  const build = Boolean(options.build);
  let dist = options.dist ? resolve(projectRoot, options.dist) : resolve(projectRoot, "dist");
  let tempDist;

  try {
    if (build) {
      tempDist = mkdtempSync(join(projectRoot, ".perf-budget-build-"));
      dist = tempDist;
      runViteBuild(projectRoot, dist);
    }

    const distFiles = listFiles(dist);
    const publicAssetsRoot = resolve(projectRoot, "public/assets");
    const cardAssetsRoot = resolve(publicAssetsRoot, "generated/cards");
    const spriteAssetsRoot = resolve(publicAssetsRoot, "sprites");
    const publicFiles = listFiles(publicAssetsRoot);
    const cardFiles = listFiles(cardAssetsRoot);
    const spriteFiles = listFiles(spriteAssetsRoot);
    const audit = readAssetAudit(resolve(publicAssetsRoot, "generated/asset-audit.json"));
    const chunkSummary = summarizeChunks(distFiles, dist);
    const assetSummary = {
      publicAssetsRaw: sumBytes(publicFiles),
      cardAssetsRaw: sumBytes(cardFiles),
      spriteAssetsRaw: sumBytes(spriteFiles),
      largestCardPng: largestFile(cardFiles.filter((file) => file.path.toLowerCase().endsWith(".png"))),
      largestRaster: largestFile(publicFiles.filter((file) => isBudgetedRaster(file.path, publicAssetsRoot)))
    };

    const summary = {
      dist,
      chunks: chunkSummary,
      assets: assetSummary,
      assetAudit: audit.summary
    };
    const failures = collectFailures(summary, projectRoot);

    return {
      ok: failures.length === 0,
      failures,
      summary,
      budgets
    };
  } finally {
    if (tempDist) {
      rmSync(tempDist, { recursive: true, force: true });
    }
  }
}

function runViteBuild(projectRoot, outDir) {
  const viteBin = resolve(projectRoot, "node_modules/vite/bin/vite.js");
  execFileSync(process.execPath, [viteBin, "build", "--outDir", outDir, "--emptyOutDir"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NAPI_RS_FORCE_WASI: "1"
    }
  });
}

function listFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      entries.push(...listFiles(path));
    } else if (stats.isFile()) {
      entries.push({ path, bytes: stats.size });
    }
  }
  return entries;
}

function summarizeChunks(files, distRoot) {
  const scripts = files.filter((file) => file.path.endsWith(".js")).map((file) => withGzip(file, distRoot));
  const styles = files.filter((file) => file.path.endsWith(".css")).map((file) => withGzip(file, distRoot));
  return {
    phaser: scripts.filter((file) => basename(file.path).toLowerCase().includes("phaser")),
    otherJs: scripts.filter((file) => !basename(file.path).toLowerCase().includes("phaser")),
    css: styles
  };
}

function withGzip(file, rootDir) {
  return {
    ...file,
    relativePath: relative(rootDir, file.path),
    gzipBytes: gzipSync(readFileSync(file.path)).byteLength
  };
}

function readAssetAudit(path) {
  if (!existsSync(path)) {
    return {
      summary: {
        missingCount: Number.POSITIVE_INFINITY,
        cardFallbackDebtCount: Number.POSITIVE_INFINITY,
        uniqueRuntimeFileCount: Number.POSITIVE_INFINITY,
        sourceSheetCount: Number.POSITIVE_INFINITY
      }
    };
  }

  const audit = JSON.parse(readFileSync(path, "utf8"));
  return {
    summary: {
      missingCount: audit.summary?.missingCount ?? Number.POSITIVE_INFINITY,
      cardFallbackDebtCount: audit.summary?.cardFallbackDebtCount ?? Number.POSITIVE_INFINITY,
      uniqueRuntimeFileCount: audit.summary?.uniqueRuntimeFileCount ?? Number.POSITIVE_INFINITY,
      sourceSheetCount: audit.summary?.sourceSheetCount ?? Number.POSITIVE_INFINITY
    }
  };
}

function collectFailures(summary, projectRoot) {
  const failures = [];

  for (const chunk of summary.chunks.phaser) {
    addMaxFailure(failures, "phaser-raw-size", chunk.bytes, budgets.phaserRaw, chunk.relativePath);
    addMaxFailure(failures, "phaser-gzip-size", chunk.gzipBytes, budgets.phaserGzip, chunk.relativePath);
  }

  for (const chunk of summary.chunks.otherJs) {
    addMaxFailure(failures, "js-raw-size", chunk.bytes, budgets.otherJsRaw, chunk.relativePath);
    addMaxFailure(failures, "js-gzip-size", chunk.gzipBytes, budgets.otherJsGzip, chunk.relativePath);
  }

  for (const chunk of summary.chunks.css) {
    addMaxFailure(failures, "css-raw-size", chunk.bytes, budgets.cssRaw, chunk.relativePath);
  }

  addMaxFailure(failures, "public-assets-size", summary.assets.publicAssetsRaw, budgets.publicAssetsRaw, "public/assets");
  addMaxFailure(failures, "card-assets-size", summary.assets.cardAssetsRaw, budgets.cardAssetsRaw, "public/assets/generated/cards");
  addMaxFailure(failures, "sprite-assets-size", summary.assets.spriteAssetsRaw, budgets.spriteAssetsRaw, "public/assets/sprites");

  if (summary.assets.largestCardPng) {
    addMaxFailure(
      failures,
      "card-png-size",
      summary.assets.largestCardPng.bytes,
      budgets.cardPngRaw,
      relative(projectRoot, summary.assets.largestCardPng.path)
    );
  }

  if (summary.assets.largestRaster) {
    addMaxFailure(
      failures,
      "raster-size",
      summary.assets.largestRaster.bytes,
      budgets.rasterRaw,
      relative(projectRoot, summary.assets.largestRaster.path)
    );
  }

  addExactFailure(failures, "asset-audit-missing", summary.assetAudit.missingCount, budgets.auditMissing, "asset-audit summary");
  addExactFailure(
    failures,
    "asset-audit-card-fallback-debt",
    summary.assetAudit.cardFallbackDebtCount,
    budgets.auditCardFallbackDebt,
    "asset-audit summary"
  );
  addMaxFailure(
    failures,
    "asset-audit-runtime-files",
    summary.assetAudit.uniqueRuntimeFileCount,
    budgets.auditUniqueRuntimeFiles,
    "asset-audit summary",
    "count"
  );
  addMaxFailure(
    failures,
    "asset-audit-source-sheets",
    summary.assetAudit.sourceSheetCount,
    budgets.auditSourceSheets,
    "asset-audit summary",
    "count"
  );

  return failures;
}

function addMaxFailure(failures, id, actual, limit, subject, unit = "bytes") {
  if (actual > limit) {
    failures.push({ id, subject, actual, limit, unit });
  }
}

function addExactFailure(failures, id, actual, expected, subject) {
  if (actual !== expected) {
    failures.push({ id, subject, actual, limit: expected, unit: "count" });
  }
}

function sumBytes(files) {
  return files.reduce((sum, file) => sum + file.bytes, 0);
}

function largestFile(files) {
  return files.reduce((largest, file) => (!largest || file.bytes > largest.bytes ? file : largest), undefined);
}

function isBudgetedRaster(path, assetsRoot) {
  const lower = path.toLowerCase();
  const raster = [".png", ".jpg", ".jpeg", ".webp", ".avif"].some((extension) => lower.endsWith(extension));
  if (!raster) {
    return false;
  }

  const parts = relative(assetsRoot, path).split(sep).map((part) => part.toLowerCase());
  return !parts.includes("sources") && !parts.includes("source");
}

function parseArgs(argv) {
  const options = { root };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--build") {
      options.build = true;
    } else if (arg === "--dist") {
      index += 1;
      if (!argv[index]) {
        throw new Error("--dist requires a path");
      }
      options.dist = argv[index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "missing";
  }
  if (bytes >= mib) {
    return `${(bytes / mib).toFixed(2)} MiB`;
  }
  return `${(bytes / kib).toFixed(1)} KiB`;
}

function renderSummary(result) {
  const largestPhaser = largestFile(result.summary.chunks.phaser);
  const largestOtherJs = largestFile(result.summary.chunks.otherJs);
  const largestCss = largestFile(result.summary.chunks.css);
  const lines = [
    "# Inkblade Perf Budget",
    "",
    `Status: ${result.ok ? "PASS" : "FAIL"}`,
    `Phaser chunk: ${largestPhaser ? `${formatBytes(largestPhaser.bytes)} raw / ${formatBytes(largestPhaser.gzipBytes)} gzip` : "not found"}`,
    `Largest other JS: ${largestOtherJs ? `${formatBytes(largestOtherJs.bytes)} raw / ${formatBytes(largestOtherJs.gzipBytes)} gzip` : "not found"}`,
    `Largest CSS: ${largestCss ? formatBytes(largestCss.bytes) : "not found"}`,
    `public/assets: ${formatBytes(result.summary.assets.publicAssetsRaw)}`,
    `public/assets/generated/cards: ${formatBytes(result.summary.assets.cardAssetsRaw)}`,
    `public/assets/sprites: ${formatBytes(result.summary.assets.spriteAssetsRaw)}`,
    `Largest card PNG: ${result.summary.assets.largestCardPng ? formatBytes(result.summary.assets.largestCardPng.bytes) : "not found"}`,
    `Largest non-source raster: ${result.summary.assets.largestRaster ? formatBytes(result.summary.assets.largestRaster.bytes) : "not found"}`,
    `Asset audit: missing ${result.summary.assetAudit.missingCount}, card fallback debt ${result.summary.assetAudit.cardFallbackDebtCount}, runtime files ${result.summary.assetAudit.uniqueRuntimeFileCount}, source sheets ${result.summary.assetAudit.sourceSheetCount}`
  ];

  if (!result.ok) {
    lines.push("", "Failures:");
    for (const failure of result.failures) {
      lines.push(`- ${failure.id}: ${failure.subject} ${formatFailureValue(failure.actual, failure.unit)} > ${formatFailureValue(failure.limit, failure.unit)}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function formatFailureValue(value, unit) {
  return unit === "count" ? String(value) : formatBytes(value);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await evaluatePerfBudget(parseArgs(process.argv.slice(2)));
    process.stdout.write(renderSummary(result));
    if (!result.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
