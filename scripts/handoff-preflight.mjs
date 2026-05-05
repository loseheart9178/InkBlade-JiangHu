#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const nodeVersion = process.env.INKBLADE_PREFLIGHT_NODE ?? process.version;
const generatedAt = process.env.INKBLADE_PREFLIGHT_NOW ?? new Date().toISOString();
const checkout = readCheckoutMetadata();
const branch = process.env.INKBLADE_PREFLIGHT_BRANCH
  ?? getGitValue(["branch", "--show-current"])
  ?? checkout.branch
  ?? "unknown";
const commit = process.env.INKBLADE_PREFLIGHT_COMMIT
  ?? getGitValue(["rev-parse", "--short", "HEAD"])
  ?? checkout.commit
  ?? "unknown";
const reportBalance = manifest.scripts?.["report:balance"];
const reportHandoff = manifest.scripts?.["report:handoff"];

process.stdout.write(`# Inkblade Handoff Preflight

Generated: ${generatedAt}

## Runtime

- Required Node: \`${manifest.engines?.node ?? "not declared"}\`
- Node runtime: \`${nodeVersion}\` ${isNode24OrNewer(nodeVersion) ? "PASS" : "FAIL"}

## Checkout

- Branch: \`${branch || "unknown"}\`
- Commit: \`${commit || "unknown"}\`

## Report Commands

- \`report:balance\`: ${reportBalance ? "PASS" : "FAIL"}${reportBalance ? ` — \`${reportBalance}\`` : ""}
- \`report:handoff\`: ${reportHandoff ? "PASS" : "FAIL"}${reportHandoff ? ` — \`${reportHandoff}\`` : ""}

## Handoff Documents

- \`docs/playtest/alpha-acceptance.md\`: ${fileExists("docs/playtest/alpha-acceptance.md") ? "PASS" : "FAIL"}
- \`docs/playtest/desktop-playtest-checklist.md\`: ${fileExists("docs/playtest/desktop-playtest-checklist.md") ? "PASS" : "FAIL"}
- \`docs/playtest/external-bug-intake.md\`: ${fileExists("docs/playtest/external-bug-intake.md") ? "PASS" : "FAIL"}

Next: run \`npm run report:balance\` then \`npm run report:handoff\`.
`);

function isNode24OrNewer(version) {
  const major = Number(version.replace(/^v/, "").split(".")[0]);
  return Number.isFinite(major) && major >= 24;
}

function fileExists(path) {
  return existsSync(resolve(root, path));
}

function getGitValue(args) {
  try {
    const value = execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

function readCheckoutMetadata() {
  const gitPath = resolve(root, ".git");
  if (!existsSync(gitPath)) {
    return {};
  }

  const gitDir = resolveGitPath(readGitDir(gitPath), root);
  const head = readText(resolve(gitDir, "HEAD"));
  if (!head) {
    return {};
  }

  if (!head.startsWith("ref:")) {
    return { branch: "detached", commit: shortSha(head) };
  }

  const refName = head.slice("ref:".length).trim();
  const commonDir = readCommonDir(gitDir);
  const commit = readText(resolve(commonDir, refName)) ?? readPackedRef(commonDir, refName);

  return {
    branch: refName.replace(/^refs\/heads\//, ""),
    commit: commit ? shortSha(commit) : undefined
  };
}

function readGitDir(gitPath) {
  const gitFile = readText(gitPath);
  if (!gitFile?.startsWith("gitdir:")) {
    return gitPath;
  }

  return gitFile.slice("gitdir:".length).trim();
}

function readCommonDir(gitDir) {
  const commonDir = readText(resolve(gitDir, "commondir"));
  return commonDir ? resolveGitPath(commonDir, gitDir) : gitDir;
}

function readPackedRef(commonDir, refName) {
  const packedRefs = readText(resolve(commonDir, "packed-refs"));
  if (!packedRefs) {
    return undefined;
  }

  const line = packedRefs
    .split(/\r?\n/)
    .find((entry) => !entry.startsWith("#") && entry.endsWith(` ${refName}`));
  return line?.split(" ")[0];
}

function readText(path) {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return undefined;
  }
}

function resolveGitPath(path, base) {
  const normalized = path.replace(/\\/g, "/");
  const wslMount = normalized.match(/^\/mnt\/([a-zA-Z])\/(.+)$/);
  if (process.platform === "win32" && wslMount) {
    return `${wslMount[1].toUpperCase()}:/${wslMount[2]}`;
  }

  if (/^[a-zA-Z]:\//.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/") && process.platform !== "win32") {
    return normalized;
  }

  return resolve(base, path);
}

function shortSha(value) {
  return value.trim().slice(0, 7);
}
