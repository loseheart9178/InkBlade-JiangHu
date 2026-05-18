import { chmod, cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const distDir = join(projectRoot, "dist");
const releaseRoot = join(projectRoot, "release");
const releaseDir = join(releaseRoot, "InkBlade-JiangHu");
const archivePath = join(releaseRoot, "InkBlade-JiangHu-playable.zip");

await ensureDir(distDir, "Build output");
await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseRoot, { recursive: true });
await cp(distDir, releaseDir, { recursive: true });

await removeJunkFiles(releaseDir);
await writeLaunchers(releaseDir);
await writeReleaseReadme(releaseDir);
await writeArchive(releaseRoot, archivePath);

console.log(`Packaged release at ${releaseDir}`);
console.log(`Packaged archive at ${archivePath}`);

async function ensureDir(path, label) {
  try {
    const stats = await stat(path);
    if (!stats.isDirectory()) {
      throw new Error(`${label} exists but is not a directory: ${path}`);
    }
  } catch (error) {
    throw new Error(`${label} not found. Run the build before packaging.`);
  }
}

async function writeLaunchers(root) {
  const commandPath = join(root, "Play InkBlade.command");
  const batPath = join(root, "Play InkBlade.bat");

  const commandScript = `#!/bin/sh
set -e
cd "$(dirname "$0")"
PORT=8787
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM
sleep 1
open "http://127.0.0.1:$PORT/index.html"
wait "$SERVER_PID"
`;

  const batScript = `@echo off
setlocal
cd /d "%~dp0"
set PORT=8787
start "" "http://127.0.0.1:%PORT%/index.html"
where py >nul 2>nul && (py -3 -m http.server %PORT% --bind 127.0.0.1 & goto :eof)
where python >nul 2>nul && (python -m http.server %PORT% --bind 127.0.0.1 & goto :eof)
echo Python 3 is required to launch the local server.
pause
`;

  await writeFile(commandPath, commandScript, "utf8");
  await writeFile(batPath, batScript, "utf8");
  await chmod(commandPath, 0o755);
}

async function removeJunkFiles(root) {
  const { readdir } = await import("node:fs/promises");

  async function walk(current) {
    const items = await readdir(current, { withFileTypes: true });
    await Promise.all(
      items.map(async (item) => {
        const fullPath = join(current, item.name);
        if (item.name === ".DS_Store") {
          await rm(fullPath, { force: true });
          return;
        }

        if (item.isDirectory()) {
          await walk(fullPath);
        }
      })
    );
  }

  await walk(root);
}

async function writeReleaseReadme(root) {
  const readmePath = join(root, "README.txt");
  const text = `InkBlade JiangHu playable build

How to play:
- macOS: double click "Play InkBlade.command".
- Windows: double click "Play InkBlade.bat".

The launcher starts a temporary local web server and opens the game in your browser.
No Node.js install or npm install is required for players.
`;

  await writeFile(readmePath, text, "utf8");
}

async function writeArchive(root, archive) {
  await rm(archive, { force: true });
  await new Promise((resolve, reject) => {
    const child = spawn("zip", ["-qr", archive, "InkBlade-JiangHu"], {
      cwd: root,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`zip exited with code ${code}`));
      }
    });
  });
}
