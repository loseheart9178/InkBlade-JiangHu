# Combat UI Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved premium combat UI direction into Photoshop-openable layered PSD sources, transparent runtime slices, a browser prototype, and then integrate it into combat only after user approval.

**Architecture:** The work is split into two gates. Gate 1 creates design assets and a prototype under `assets/source`, `public/assets/generated/ui`, and `docs/superpowers/prototypes` without touching production UI code. Gate 2 begins only after explicit user approval and wires the approved bitmap UI kit into the existing Phaser battlefield plus DOM HUD, preserving Phaser for combat bodies and DOM for text-heavy controls.

**Tech Stack:** TypeScript, Vite, Phaser 3.90, DOM HUD overlays, Vitest, Playwright, `ag-psd@30.1.1`, `pngjs@7.0.0`, `@types/pngjs@6.0.5`, AI-generated transparent PNG layer sources, Photoshop PSD.

---

## Source Requirements

- Design spec: `docs/superpowers/specs/2026-05-09-combat-ui-kit-design.md`
- Approved concept image: `docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png`
- User gate: no production UI code changes before the user approves a high-fidelity browser prototype and preview screenshots.
- Local note: `reports/card-art-quality-report.json` and `reports/card-art-quality-report.md` may already be dirty from report regeneration. Do not stage, revert, or rewrite those files for this plan.
- PSD smoke result already verified in `/tmp`: `ag-psd@30.1.1` can write a layered PSD from `imageData`, and `readPsd(..., { skipLayerImageData: true })` reads it back as `8BPS 16x16 test transparent layer`.

## File Structure

### Gate 1: Design Assets And Prototype

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/ui-assets/ui-kit-manifest.test.ts`
- Create: `tests/e2e/combat-ui-prototype.spec.ts`
- Create: `scripts/build-combat-ui-kit.mjs`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/README.md`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/*.png`
- Create: `assets/source/ui/combat-hud/layers/*.png`
- Create: `assets/source/ui/combat-hud/combat-hud-kit.psd`
- Create: `assets/source/ui/cards/card-frame-kit.psd`
- Create: `assets/source/ui/icons/status-icon-kit.psd`
- Create: `assets/source/ui/combat-hud/combat-ui-kit-manifest.json`
- Create: `public/assets/generated/ui/combat-hud/*.png`
- Create: `docs/superpowers/prototypes/combat-ui-kit/index.html`
- Create: `docs/superpowers/prototypes/combat-ui-kit/styles.css`
- Create: `docs/superpowers/prototypes/combat-ui-kit/prototype.js`
- Create: `docs/superpowers/prototypes/combat-ui-kit/screenshots/*.png`

### Gate 2: Production Integration After User Approval

- Create: `src/app/combatUiKit.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `src/styles/theme.css`
- Modify: `tests/e2e/visual-smoke.spec.ts`
- Modify: `Documentation.md`

## Asset Contract

The manifest at `assets/source/ui/combat-hud/combat-ui-kit-manifest.json` is the single contract between design files, prototype, and production. It must expose these runtime assets:

```json
[
  "hud-frame-player",
  "hud-frame-enemy",
  "intent-crest",
  "hand-shelf",
  "energy-orb",
  "pile-seal",
  "card-frame-common",
  "card-frame-uncommon",
  "card-frame-rare",
  "card-frame-event",
  "status-block",
  "status-mind",
  "status-ink",
  "status-bleed",
  "status-vulnerable",
  "status-charm",
  "resource-attack",
  "resource-armor",
  "resource-charm"
]
```

The PSD sources must contain these readable layer names:

```json
{
  "assets/source/ui/combat-hud/combat-hud-kit.psd": [
    "battlefield vignette",
    "player status plate",
    "enemy status plate",
    "enemy intent crest",
    "status icon rail",
    "hand shelf",
    "energy orb",
    "pile counter seals",
    "gold ink ornaments"
  ],
  "assets/source/ui/cards/card-frame-kit.psd": [
    "card frame common",
    "card frame uncommon",
    "card frame rare",
    "card frame event",
    "cost seal",
    "art window mask",
    "type plaque",
    "keyword ribbon"
  ],
  "assets/source/ui/icons/status-icon-kit.psd": [
    "status block icon",
    "status mind icon",
    "status ink icon",
    "status bleed icon",
    "status vulnerable icon",
    "status charm icon",
    "resource attack icon",
    "resource armor icon",
    "resource charm icon"
  ]
}
```

## Gate 1 Tasks: Assets And Prototype

### Task 1: Install PSD And PNG Tooling

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install exact dev dependencies**

Run:

```bash
npm_config_strict_ssl=false npm install -D ag-psd@30.1.1 pngjs@7.0.0 @types/pngjs@6.0.5
```

Expected: `package.json` contains `ag-psd`, `pngjs`, and `@types/pngjs` in `devDependencies`. `package-lock.json` is updated. Do not create `.npmrc`.

- [ ] **Step 2: Verify clean install metadata**

Run:

```bash
node -e "const p=require('./package.json'); console.log(p.devDependencies['ag-psd'], p.devDependencies.pngjs, p.devDependencies['@types/pngjs'])"
```

Expected:

```text
^30.1.1 ^7.0.0 ^6.0.5
```

### Task 2: Add Asset Manifest Test

**Files:**
- Create: `tests/ui-assets/ui-kit-manifest.test.ts`

- [ ] **Step 1: Write the failing manifest test**

Create `tests/ui-assets/ui-kit-manifest.test.ts` with this content:

```ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPsd } from "ag-psd";
import { PNG } from "pngjs";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const manifestPath = join(projectRoot, "assets/source/ui/combat-hud/combat-ui-kit-manifest.json");

type UiKitAsset = {
  id: string;
  kind: "nine-slice" | "icon" | "ornament" | "card-frame" | "preview";
  src: string;
  width: number;
  height: number;
  nineSlice?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sourceLayer: string;
};

type PsdSource = {
  id: string;
  path: string;
  requiredLayerNames: string[];
};

type UiKitManifest = {
  version: 1;
  name: "combat-ui-kit";
  sourceSpec: string;
  approvedConcept: string;
  psdSources: PsdSource[];
  runtime: {
    assets: UiKitAsset[];
  };
  prototype: {
    path: string;
    desktopScreenshot: string;
    mobileScreenshot: string;
  };
};

const requiredRuntimeAssetIds = [
  "hud-frame-player",
  "hud-frame-enemy",
  "intent-crest",
  "hand-shelf",
  "energy-orb",
  "pile-seal",
  "card-frame-common",
  "card-frame-uncommon",
  "card-frame-rare",
  "card-frame-event",
  "status-block",
  "status-mind",
  "status-ink",
  "status-bleed",
  "status-vulnerable",
  "status-charm",
  "resource-attack",
  "resource-armor",
  "resource-charm"
] as const;

function readManifest(): UiKitManifest {
  expect(existsSync(manifestPath)).toBe(true);
  return JSON.parse(readFileSync(manifestPath, "utf8")) as UiKitManifest;
}

function publicUrlToFilePath(src: string): string {
  expect(src).toMatch(/^\/assets\/generated\/ui\/combat-hud\/.+\.png$/);
  return join(projectRoot, "public", src.replace(/^\//, ""));
}

function hasTransparentPixels(png: PNG): boolean {
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] < 255) {
      return true;
    }
  }

  return false;
}

function collectLayerNames(layers: Array<{ name?: string; children?: unknown[] }>): string[] {
  const names: string[] = [];

  for (const layer of layers) {
    if (layer.name) {
      names.push(layer.name);
    }

    if (Array.isArray(layer.children)) {
      names.push(...collectLayerNames(layer.children as Array<{ name?: string; children?: unknown[] }>));
    }
  }

  return names;
}

describe("combat UI kit manifest", () => {
  it("documents the approved design spec, PSD sources, prototype, and runtime assets", () => {
    const manifest = readManifest();

    expect(manifest.version).toBe(1);
    expect(manifest.name).toBe("combat-ui-kit");
    expect(manifest.sourceSpec).toBe("docs/superpowers/specs/2026-05-09-combat-ui-kit-design.md");
    expect(existsSync(join(projectRoot, manifest.sourceSpec))).toBe(true);
    expect(manifest.approvedConcept).toBe("docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png");
    expect(existsSync(join(projectRoot, manifest.approvedConcept))).toBe(true);
    expect(manifest.psdSources.map((source) => source.path).sort()).toEqual([
      "assets/source/ui/cards/card-frame-kit.psd",
      "assets/source/ui/combat-hud/combat-hud-kit.psd",
      "assets/source/ui/icons/status-icon-kit.psd"
    ]);
    expect(manifest.runtime.assets.map((asset) => asset.id).sort()).toEqual([...requiredRuntimeAssetIds].sort());
    expect(manifest.prototype.path).toBe("docs/superpowers/prototypes/combat-ui-kit/index.html");
    expect(manifest.prototype.desktopScreenshot).toBe("docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png");
    expect(manifest.prototype.mobileScreenshot).toBe("docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png");
  });

  it("keeps every runtime asset as a transparent PNG with stable dimensions", () => {
    const manifest = readManifest();

    for (const asset of manifest.runtime.assets) {
      const filePath = publicUrlToFilePath(asset.src);
      expect(existsSync(filePath), asset.id).toBe(true);

      const png = PNG.sync.read(readFileSync(filePath));
      expect(png.width, asset.id).toBe(asset.width);
      expect(png.height, asset.id).toBe(asset.height);
      expect(png.width, asset.id).toBeGreaterThanOrEqual(32);
      expect(png.height, asset.id).toBeGreaterThanOrEqual(32);
      expect(hasTransparentPixels(png), asset.id).toBe(true);

      if (asset.kind === "nine-slice") {
        expect(asset.nineSlice, asset.id).toBeDefined();
        expect(asset.nineSlice!.left + asset.nineSlice!.right, asset.id).toBeLessThan(asset.width);
        expect(asset.nineSlice!.top + asset.nineSlice!.bottom, asset.id).toBeLessThan(asset.height);
      }
    }
  });

  it("writes Photoshop-readable PSD files with named layers", () => {
    const manifest = readManifest();

    for (const source of manifest.psdSources) {
      const psdPath = join(projectRoot, source.path);
      expect(existsSync(psdPath), source.path).toBe(true);
      expect(readFileSync(psdPath).subarray(0, 4).toString("ascii"), source.path).toBe("8BPS");

      const psd = readPsd(readFileSync(psdPath), {
        skipCompositeImageData: true,
        skipLayerImageData: true,
        skipThumbnail: true
      });
      const names = collectLayerNames((psd.children ?? []) as Array<{ name?: string; children?: unknown[] }>);

      for (const expectedName of source.requiredLayerNames) {
        expect(names, `${source.path} missing ${expectedName}`).toContain(expectedName);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails for the missing manifest**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
```

Expected: fail because `assets/source/ui/combat-hud/combat-ui-kit-manifest.json` does not exist yet.

### Task 3: Generate AI Raw Layer Sources

**Files:**
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/README.md`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/hud-frame-player.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/hud-frame-enemy.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/intent-crest.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/hand-shelf.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/energy-orb.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/pile-seal.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/card-frame-common.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/card-frame-uncommon.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/card-frame-rare.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/card-frame-event.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/status-icon-sheet.png`
- Create: `assets/source/ui/_ai-raw/combat-ui-kit/resource-icon-sheet.png`

- [ ] **Step 1: Generate transparent PNG layers with imagegen**

Use the `imagegen` skill and save each output to the exact path listed above. Use these prompts:

```text
hud-frame-player.png:
Transparent PNG, premium Chinese ink-wash wuxia game HUD frame for the PLAYER health/resource plate, horizontal 4:1 frame, aged black lacquer, worn gold leaf, jade teal enamel accents, hand-brushed edges, subtle rice-paper fibers, no text, no numbers, no character, centered object, clean alpha background.

hud-frame-enemy.png:
Transparent PNG, premium Chinese ink-wash wuxia game HUD frame for the ENEMY health/resource plate, horizontal 4:1 frame, aged black lacquer, worn gold leaf, cinnabar red enamel accents, sharp intent-like corners, hand-brushed edges, subtle rice-paper fibers, no text, no numbers, no character, centered object, clean alpha background.

intent-crest.png:
Transparent PNG, ornate enemy intent crest for a Chinese wuxia deckbuilder combat UI, circular-gong silhouette with broken gold rim, cinnabar ink pressure mark, small top tassel, no text, no numbers, no character, clean alpha background.

hand-shelf.png:
Transparent PNG, premium bottom hand shelf for a Chinese ink-wash deckbuilder, long curved lacquer tray, dark ink stone, worn gold filigree, parchment highlights, enough empty center space for cards, no text, no cards, clean alpha background.

energy-orb.png:
Transparent PNG, circular energy orb UI element, jade teal glass inside black lacquer and worn gold ring, Chinese wuxia fantasy, centered, no text, no number, clean alpha background.

pile-seal.png:
Transparent PNG, small circular pile counter seal UI element, aged gold rim, black lacquer center, parchment highlight, Chinese wuxia deckbuilder, centered, no text, no number, clean alpha background.

card-frame-common.png:
Transparent PNG, full playing card frame for Chinese ink-wash wuxia deckbuilder, common rarity, vertical 5:7 card frame, protected art window, cost medallion socket top-left, type plaque, keyword ribbon, parchment and black lacquer, restrained jade teal accent, no text, no artwork inside the art window, clean alpha background.

card-frame-uncommon.png:
Transparent PNG, full playing card frame for Chinese ink-wash wuxia deckbuilder, uncommon rarity, vertical 5:7 card frame, protected art window, cost medallion socket top-left, type plaque, keyword ribbon, parchment and black lacquer, deeper jade and muted gold accent, no text, no artwork inside the art window, clean alpha background.

card-frame-rare.png:
Transparent PNG, full playing card frame for Chinese ink-wash wuxia deckbuilder, rare rarity, vertical 5:7 card frame, protected art window, cost medallion socket top-left, type plaque, keyword ribbon, parchment and black lacquer, cinnabar and worn gold accent, no text, no artwork inside the art window, clean alpha background.

card-frame-event.png:
Transparent PNG, full playing card frame for Chinese ink-wash wuxia deckbuilder, event rarity, vertical 5:7 card frame, protected art window, cost medallion socket top-left, type plaque, keyword ribbon, parchment and black lacquer, violet ink and antique gold accent, no text, no artwork inside the art window, clean alpha background.

status-icon-sheet.png:
Transparent PNG icon sheet, 3 columns by 2 rows, six distinct premium Chinese wuxia status icons: armor shield, calm mind lotus, black ink mark, bleeding cut, vulnerable cracked armor, charm ribbon fan. Gold-lined circular seals, readable at 32px, no text, clean alpha background.

resource-icon-sheet.png:
Transparent PNG icon sheet, 3 columns by 1 row, three distinct premium Chinese wuxia resource icons: attack blade, armor guard, charm fan. Gold-lined circular seals, readable at 32px, no text, clean alpha background.
```

- [ ] **Step 2: Record source prompts**

Create `assets/source/ui/_ai-raw/combat-ui-kit/README.md` with this content:

~~~markdown
# Combat UI Kit AI Raw Sources

These transparent PNG files are AI-generated source layers for the approved combat UI kit direction.

Approved concept reference:
`docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png`

The runtime files are not edited directly. Run:

```bash
node scripts/build-combat-ui-kit.mjs
```

The builder normalizes these files into layered PSD sources, transparent runtime PNG slices, and `assets/source/ui/combat-hud/combat-ui-kit-manifest.json`.
~~~

### Task 4: Build PSD Sources, Runtime PNGs, And Manifest

**Files:**
- Create: `scripts/build-combat-ui-kit.mjs`
- Create: `assets/source/ui/combat-hud/layers/*.png`
- Create: `assets/source/ui/combat-hud/combat-hud-kit.psd`
- Create: `assets/source/ui/cards/card-frame-kit.psd`
- Create: `assets/source/ui/icons/status-icon-kit.psd`
- Create: `assets/source/ui/combat-hud/combat-ui-kit-manifest.json`
- Create: `public/assets/generated/ui/combat-hud/*.png`

- [ ] **Step 1: Create the asset builder**

Create `scripts/build-combat-ui-kit.mjs`. The script must:

- import `writePsdBuffer` from `ag-psd`;
- import `PNG` from `pngjs`;
- read normalized PNG layers from `assets/source/ui/_ai-raw/combat-ui-kit`;
- write normalized layer copies to `assets/source/ui/combat-hud/layers`;
- write runtime copies to `public/assets/generated/ui/combat-hud`;
- write three PSD files with named layers using `imageData`;
- write the manifest contract from this plan.

Use these fixed output dimensions:

```js
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
```

- [ ] **Step 2: Run the builder**

Run:

```bash
node scripts/build-combat-ui-kit.mjs
```

Expected output:

```text
Wrote assets/source/ui/combat-hud/combat-hud-kit.psd
Wrote assets/source/ui/cards/card-frame-kit.psd
Wrote assets/source/ui/icons/status-icon-kit.psd
Wrote assets/source/ui/combat-hud/combat-ui-kit-manifest.json
Wrote 19 runtime UI assets
```

- [ ] **Step 3: Run the manifest test**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
```

Expected: pass.

- [ ] **Step 4: Commit the asset pipeline and generated sources**

Run:

```bash
git add package.json package-lock.json tests/ui-assets/ui-kit-manifest.test.ts scripts/build-combat-ui-kit.mjs assets/source/ui public/assets/generated/ui
git commit -m "feat: add combat ui kit asset sources"
```

Expected: commit contains only UI kit dependency/test/script/source/runtime asset files. It does not include `reports/card-art-quality-report.json` or `reports/card-art-quality-report.md`.

### Task 5: Add Browser Prototype And Prototype E2E

**Files:**
- Create: `docs/superpowers/prototypes/combat-ui-kit/index.html`
- Create: `docs/superpowers/prototypes/combat-ui-kit/styles.css`
- Create: `docs/superpowers/prototypes/combat-ui-kit/prototype.js`
- Create: `tests/e2e/combat-ui-prototype.spec.ts`

- [ ] **Step 1: Create the prototype HTML**

Create `docs/superpowers/prototypes/combat-ui-kit/index.html` with a static combat state: player `赵云`, enemy `墨化山贼`, four hand cards (`枪击`, `架枪`, `飞石`, `格挡`), status icons under the HP frames, enemy intent crest in the center, and bottom hand shelf. Use asset URLs from `/assets/generated/ui/combat-hud/*.png`. Mark the root with `data-testid="combat-ui-prototype"`.

- [ ] **Step 2: Create prototype CSS**

Create `docs/superpowers/prototypes/combat-ui-kit/styles.css` so the first viewport is the actual combat UI, not a landing page. Required layout rules:

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.prototype-stage {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  color: #f6ecd5;
  background:
    radial-gradient(circle at 50% 45%, rgba(238, 190, 91, 0.16), transparent 36%),
    linear-gradient(180deg, #1b1916, #090807 62%, #050504);
}

.combat-ui-prototype-card-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 38%;
}
```

The full CSS must keep cards inside the hand shelf at 1440x900 and 390x844, keep status icons below the HP plates, and avoid text overlap in every button and card.

- [ ] **Step 3: Create prototype interactivity**

Create `docs/superpowers/prototypes/combat-ui-kit/prototype.js` so clicking a card adds `is-played` to that card and updates `data-testid="prototype-message"` to `枪击已出。`, `架枪已出。`, `飞石已出。`, or `格挡已出。`.

- [ ] **Step 4: Write prototype e2e test**

Create `tests/e2e/combat-ui-prototype.spec.ts` with assertions for:

```ts
import { expect, test } from "@playwright/test";

test("combat UI kit prototype is framed and interactive on desktop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/superpowers/prototypes/combat-ui-kit/index.html");

  await expect(page.getByTestId("combat-ui-prototype")).toBeVisible();
  await expect(page.getByTestId("prototype-player-hud")).toBeVisible();
  await expect(page.getByTestId("prototype-enemy-hud")).toBeVisible();
  await expect(page.getByTestId("prototype-intent")).toBeVisible();
  await expect(page.getByTestId("prototype-hand")).toBeVisible();
  await expect(page.getByTestId("prototype-card")).toHaveCount(4);
  await expect(page.getByTestId("prototype-status-icon")).toHaveCount(6);

  const hasVerticalScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 2);
  expect(hasVerticalScroll).toBe(false);

  const firstCard = page.getByTestId("prototype-card").first();
  await firstCard.click();
  await expect(firstCard).toHaveClass(/is-played/);
  await expect(page.getByTestId("prototype-message")).toContainText(/已出。/);

  const screenshotPath = testInfo.outputPath("combat-ui-kit-prototype-desktop.png");
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(40_000);
  await testInfo.attach("combat-ui-kit-prototype-desktop.png", { path: screenshotPath, contentType: "image/png" });
});

test("combat UI kit prototype remains readable on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/superpowers/prototypes/combat-ui-kit/index.html");

  await expect(page.getByTestId("combat-ui-prototype")).toBeVisible();
  await expect(page.getByTestId("prototype-card")).toHaveCount(4);

  const cards = await page.getByTestId("prototype-card").evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );

  for (const card of cards) {
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(390);
    expect(card.height).toBeGreaterThan(120);
  }

  const screenshotPath = testInfo.outputPath("combat-ui-kit-prototype-mobile.png");
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(35_000);
  await testInfo.attach("combat-ui-kit-prototype-mobile.png", { path: screenshotPath, contentType: "image/png" });
});
```

- [ ] **Step 5: Run prototype e2e**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/combat-ui-prototype.spec.ts --project=chromium
```

Expected: pass.

- [ ] **Step 6: Save approval screenshots**

Run a short Playwright capture script or copy the passing e2e screenshots to:

```text
docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png
docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png
```

Then rerun:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
```

Expected: pass, including screenshot path checks through the manifest.

- [ ] **Step 7: Commit prototype artifacts**

Run:

```bash
git add docs/superpowers/prototypes/combat-ui-kit tests/e2e/combat-ui-prototype.spec.ts assets/source/ui/combat-hud/combat-ui-kit-manifest.json
git commit -m "feat: prototype approved combat ui kit"
```

Expected: commit includes prototype and screenshots only. It does not include production `src` or `src/styles` files.

### Task 6: User Approval Gate

**Files:**
- Read: `docs/superpowers/prototypes/combat-ui-kit/index.html`
- Read: `docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png`
- Read: `docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png`
- Read: `assets/source/ui/combat-hud/combat-hud-kit.psd`
- Read: `assets/source/ui/cards/card-frame-kit.psd`
- Read: `assets/source/ui/icons/status-icon-kit.psd`

- [ ] **Step 1: Present design deliverables to the user**

Report these exact deliverables:

```text
PSD source files:
- assets/source/ui/combat-hud/combat-hud-kit.psd
- assets/source/ui/cards/card-frame-kit.psd
- assets/source/ui/icons/status-icon-kit.psd

Runtime manifest:
- assets/source/ui/combat-hud/combat-ui-kit-manifest.json

Preview:
- docs/superpowers/prototypes/combat-ui-kit/index.html
- docs/superpowers/prototypes/combat-ui-kit/screenshots/desktop.png
- docs/superpowers/prototypes/combat-ui-kit/screenshots/mobile.png
```

- [ ] **Step 2: Stop before production code**

Do not modify `src/app/inkbladeController.ts`, `src/styles/theme.css`, or any production runtime file until the user explicitly approves the prototype.

## Gate 2 Tasks: Production Integration After Approval

### Task 7: Add Production UI Kit Contract

**Files:**
- Create: `src/app/combatUiKit.ts`
- Modify: `tests/e2e/visual-smoke.spec.ts`

- [ ] **Step 1: Create the TypeScript asset contract**

Create `src/app/combatUiKit.ts` with typed asset IDs and URLs matching the manifest:

```ts
export const COMBAT_UI_ASSET_BASE = "/assets/generated/ui/combat-hud/" as const;

export const combatUiAssetIds = [
  "hud-frame-player",
  "hud-frame-enemy",
  "intent-crest",
  "hand-shelf",
  "energy-orb",
  "pile-seal",
  "card-frame-common",
  "card-frame-uncommon",
  "card-frame-rare",
  "card-frame-event",
  "status-block",
  "status-mind",
  "status-ink",
  "status-bleed",
  "status-vulnerable",
  "status-charm",
  "resource-attack",
  "resource-armor",
  "resource-charm"
] as const;

export type CombatUiAssetId = (typeof combatUiAssetIds)[number];

export const combatUiAssets: Record<CombatUiAssetId, string> = Object.fromEntries(
  combatUiAssetIds.map((id) => [id, `${COMBAT_UI_ASSET_BASE}${id}.png`])
) as Record<CombatUiAssetId, string>;

export const combatStatusIconByTone = {
  block: "status-block",
  mind: "status-mind",
  ink: "status-ink"
} as const satisfies Record<"block" | "mind" | "ink", CombatUiAssetId>;

export const combatStatusIconByStatus = {
  bleeding: "status-bleed",
  vulnerable: "status-vulnerable",
  charm: "status-charm"
} as const satisfies Partial<Record<string, CombatUiAssetId>>;

export function getCombatUiAsset(id: CombatUiAssetId): string {
  return combatUiAssets[id];
}
```

- [ ] **Step 2: Update visual smoke expectations before implementation**

In `tests/e2e/visual-smoke.spec.ts`, change the combat card art expectation from `object-fit: contain` to `object-fit: cover`, and add expectations that the new UI kit asset classes exist:

```ts
await expect(page.getByTestId("card-art").first()).toHaveCSS("object-fit", "cover");
await expect(page.getByTestId("player-status")).toHaveClass(/status-line--kit/);
await expect(page.getByTestId("enemy-status")).toHaveClass(/status-line--kit/);
await expect(page.getByTestId("status-icon").first()).toBeVisible();
await expect(page.getByTestId("energy")).toHaveClass(/energy-orb--kit/);
```

- [ ] **Step 3: Run e2e and confirm it fails before production integration**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium --grep "captures desktop combat smoke"
```

Expected: fail because production markup still uses the old CSS surface and `object-fit: contain`.

### Task 8: Integrate Kit Markup In Combat Renderer

**Files:**
- Modify: `src/app/inkbladeController.ts`

- [ ] **Step 1: Import UI kit helpers**

At the top of `src/app/inkbladeController.ts`, add:

```ts
import { combatStatusIconByStatus, combatStatusIconByTone, getCombatUiAsset, type CombatUiAssetId } from "./combatUiKit";
```

- [ ] **Step 2: Add asset CSS variables to combat root**

Inside `renderCombat`, after `panel.dataset.battlefield = run.chapterId;`, add:

```ts
panel.style.setProperty("--ui-kit-hand-shelf", `url("${getCombatUiAsset("hand-shelf")}")`);
panel.style.setProperty("--ui-kit-energy-orb", `url("${getCombatUiAsset("energy-orb")}")`);
panel.style.setProperty("--ui-kit-player-hud", `url("${getCombatUiAsset("hud-frame-player")}")`);
panel.style.setProperty("--ui-kit-enemy-hud", `url("${getCombatUiAsset("hud-frame-enemy")}")`);
panel.style.setProperty("--ui-kit-intent-crest", `url("${getCombatUiAsset("intent-crest")}")`);
```

- [ ] **Step 3: Add card rarity frame variables**

Inside the hand card loop, after `cardButton.className = ...`, add:

```ts
const frameAssetId = getCardFrameAssetId(definition.rarity);
cardButton.style.setProperty("--ui-kit-card-frame", `url("${getCombatUiAsset(frameAssetId)}")`);
```

Add this helper near `createCardChromeMarkup`:

```ts
function getCardFrameAssetId(rarity: CardDefinition["rarity"]): CombatUiAssetId {
  if (rarity === "uncommon") {
    return "card-frame-uncommon";
  }

  if (rarity === "rare") {
    return "card-frame-rare";
  }

  if (rarity === "event") {
    return "card-frame-event";
  }

  return "card-frame-common";
}
```

- [ ] **Step 4: Add status icon markup**

Replace `createStatusChipMarkup` with:

```ts
function createStatusChipMarkup(label: string, value: string, tone: "block" | "mind" | "ink"): string {
  const iconId = combatStatusIconByTone[tone];
  return `
    <span class="status-chip status-chip--${tone} status-chip--kit">
      <img class="status-icon" data-testid="status-icon" src="${getCombatUiAsset(iconId)}" alt="">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </span>
  `;
}
```

Update `formatStatusBadges` so every returned status badge includes a best-match icon:

```ts
const iconId = combatStatusIconByStatus[status] ?? "status-ink";
return `<span class="status-badge status-badge--kit" data-testid="status-badge" data-glossary-id="${escapeAttribute(entry?.id ?? `status.${status}`)}" title="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}"><img class="status-icon" data-testid="status-icon" src="${getCombatUiAsset(iconId)}" alt=""><span>${escapeHtml(label)}</span> <strong>${layers}</strong></span>`;
```

- [ ] **Step 5: Add kit classes to combat resource and status containers**

Change `createCombatResourcePill` class output to:

```ts
<div class="resource-pill resource-pill--${owner} resource-pill--kit" data-testid="${owner}-resource" aria-label="${escapeAttribute(`${label} ${value}`)}">
```

Change `createCombatStatusLine` class output to:

```ts
<div class="status-line status-line--${owner} status-line--kit" data-testid="${owner}-status">
```

- [ ] **Step 6: Change card art to cover**

Update `createCardArtMarkup` to include the class used by CSS:

```ts
return `<span class="card-art card-art--${art.accent} card-art--kit"><img data-testid="card-art" src="${art.assetPath}" alt="${art.alt}"></span>`;
```

### Task 9: Integrate Kit Styling

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Add kit image styling**

Append a focused section near the current combat styles:

```css
.combat-screen {
  --ui-kit-player-hud: none;
  --ui-kit-enemy-hud: none;
  --ui-kit-intent-crest: none;
  --ui-kit-hand-shelf: none;
  --ui-kit-energy-orb: none;
}

.combat-meter:first-child::before,
.combat-meter:last-child::before,
.intent-box::before,
.hand-zone::before,
.energy-orb--kit::before,
.combat-card::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.combat-meter:first-child::before {
  background-image: var(--ui-kit-player-hud);
}

.combat-meter:last-child::before {
  background-image: var(--ui-kit-enemy-hud);
}

.intent-box::before {
  background-image: var(--ui-kit-intent-crest);
}

.hand-zone::before {
  background-image: var(--ui-kit-hand-shelf);
}

.energy-orb--kit::before {
  background-image: var(--ui-kit-energy-orb);
}

.combat-card::before {
  background-image: var(--ui-kit-card-frame);
}

.card-art--kit img {
  object-fit: cover;
  object-position: 50% 38%;
  mix-blend-mode: normal;
}

.status-line--kit {
  top: 72px;
  gap: 6px;
  max-width: min(430px, 38vw);
  background: rgba(17, 17, 17, 0.26);
  backdrop-filter: blur(3px);
}

.status-chip--kit,
.status-badge--kit {
  min-height: 30px;
  padding: 3px 8px 3px 4px;
  border-radius: 999px;
}

.status-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  object-fit: contain;
}
```

- [ ] **Step 2: Retune combat vertical layout**

Adjust the existing `.combatant > .resource-pill` and `.combatant > .status-line` offsets so status no longer covers character standees:

```css
.combatant > .resource-pill {
  top: 8px;
}

.combatant > .status-line {
  top: 64px;
}
```

- [ ] **Step 3: Keep cards stable**

Keep `.combat-card` width and height fixed at the current responsive envelope, but remove any hover scale that changes bounding boxes. Use light, translate, and shadow only:

```css
.combat-card:hover:not(:disabled),
.combat-card:focus-visible:not(:disabled) {
  transform: translateY(-10px);
}
```

### Task 10: Verify Production Integration

**Files:**
- Modify: `Documentation.md`

- [ ] **Step 1: Run targeted verification**

Run:

```bash
git diff --check
node node_modules/typescript/bin/tsc --noEmit
NAPI_RS_FORCE_WASI=1 node node_modules/vitest/vitest.mjs run tests/ui-assets/ui-kit-manifest.test.ts --reporter=dot
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/combat-ui-prototype.spec.ts --project=chromium
NAPI_RS_FORCE_WASI=1 node node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --project=chromium
```

Expected: all pass.

- [ ] **Step 2: Run full app build**

Run:

```bash
NAPI_RS_FORCE_WASI=1 node node_modules/vite/bin/vite.js build
```

Expected: build passes without CSS minifier failure.

- [ ] **Step 3: Update documentation**

Add a short dated entry to `Documentation.md`:

```markdown
### 2026-05-09 Combat UI Kit Gate

- Added Photoshop-openable layered PSD sources for combat HUD, card frames, and status/resource icons.
- Added transparent runtime PNG UI slices plus a manifest linking source PSD layers to runtime assets.
- Added a browser prototype and screenshot approval gate before production UI integration.
- Integrated the approved combat UI kit into combat HUD/cards while keeping Phaser for the battlefield and DOM for text-heavy game controls.
```

- [ ] **Step 4: Commit production integration**

Run:

```bash
git add src/app/combatUiKit.ts src/app/inkbladeController.ts src/styles/theme.css tests/e2e/visual-smoke.spec.ts Documentation.md
git commit -m "feat: integrate combat ui kit"
```

Expected: commit excludes report regeneration files unless the user explicitly asks to include them.

## Self-Review

- Spec coverage: the plan covers PSD deliverables, runtime PNG/manifest deliverables, browser prototype, desktop/mobile screenshots, user approval gate, and later production integration into the existing Phaser plus DOM architecture.
- Placeholder scan: the plan contains exact file paths, exact commands, exact asset IDs, exact layer names, exact dependency versions, exact prompts, and concrete code snippets for the tests and production integration points.
- Type consistency: `CombatUiAssetId`, `combatUiAssets`, `combatStatusIconByTone`, `combatStatusIconByStatus`, and `getCombatUiAsset` are defined before they are used by `inkbladeController.ts`.
- Risk note: the full Phaser UI migration is intentionally excluded from this plan. This pass upgrades the approved combat HUD and cards first, matching the selected priority.
