import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function resolveCheckoutMetadata(root, { branchOverride, commitOverride } = {}) {
  const checkout = readCheckoutMetadata(root);
  return {
    branch: branchOverride
      ?? getGitValue(root, ["branch", "--show-current"])
      ?? checkout.branch
      ?? "unknown",
    commit: commitOverride
      ?? getGitValue(root, ["rev-parse", "--short", "HEAD"])
      ?? checkout.commit
      ?? "unknown"
  };
}

function getGitValue(root, args) {
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

function readCheckoutMetadata(root) {
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
