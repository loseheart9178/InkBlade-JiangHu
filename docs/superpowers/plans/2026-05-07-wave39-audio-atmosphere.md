# Wave 39 Audio Atmosphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe procedural ambience layer, SFX volume settings, and an audio asset manifest so the EA browser showcase feels more commercial without relying on external audio files.

**Architecture:** `settingsPersistence.ts` owns normalized desktop audio settings. `audioFeedback.ts` owns no-op-safe WebAudio tones and ambience. `inkbladeController.ts` maps app screens to audio surfaces. `public/assets/audio/manifest.json` documents final asset slots while runtime uses procedural fallback.

**Tech Stack:** TypeScript, WebAudio, DOM settings UI, Vitest, Playwright.

---

## Files

- Modify `src/app/settingsPersistence.ts`: add `sfxVolume`.
- Modify `src/app/inkbladeController.ts`: add SFX slider and screen-to-surface calls.
- Modify `src/app/audioFeedback.ts`: add SFX/music split and procedural ambience surfaces.
- Add `public/assets/audio/manifest.json`.
- Add `public/assets/audio/README.md`.
- Modify `tests/app-settings.test.ts`.
- Add `tests/audio-feedback.test.ts`.
- Add `tests/audio-manifest.test.ts`.
- Modify `tests/e2e/playable-flow.spec.ts`.
- Modify `Documentation.md`.

## Acceptance Criteria

- [ ] Settings persist and normalize `sfxVolume` with default `75`.
- [ ] Settings shell exposes `setting-sfx-volume`.
- [ ] UI/card/victory/defeat tones use `sfxVolume`.
- [ ] Ambience surfaces use `musicVolume`.
- [ ] Muted or zero relevant volume prevents new audio nodes.
- [ ] Controller maps major screens to audio surfaces without affecting gameplay state.
- [ ] Audio manifest includes ambience, SFX, combat cues, victory/defeat, final choice, and fallback ids.
- [ ] Browser settings test verifies SFX slider persistence.

## Task 1: Settings Contract And UI Slider

**Files:**

- Modify: `src/app/settingsPersistence.ts`
- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/app-settings.test.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`

- [ ] **Step 1: Write failing settings tests**

In `tests/app-settings.test.ts`, update settings objects to include `sfxVolume`, then add this expectation to the invalid settings test:

```ts
sfxVolume: 100
```

for an input `sfxVolume: 140`.

In the settings shell test, include:

```ts
sfxVolume: 55,
```

then query:

```ts
const sfx = host.querySelector<HTMLInputElement>("[data-testid='setting-sfx-volume']");
expect(sfx?.disabled).toBe(false);
expect(sfx?.value).toBe("55");
sfx!.value = "31";
sfx!.dispatchEvent(new Event("input", { bubbles: true }));
```

and assert saved settings include:

```ts
sfxVolume: 31,
```

In `tests/e2e/playable-flow.spec.ts`, extend the settings persistence test to set and assert `setting-sfx-volume`.

- [ ] **Step 2: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "settings persist"
```

Expected: FAIL because `sfxVolume` and `setting-sfx-volume` do not exist yet.

- [ ] **Step 3: Add `sfxVolume` to settings**

In `src/app/settingsPersistence.ts`, update:

```ts
export interface DesktopSettings {
  reducedMotion: boolean;
  fastCombatText: boolean;
  muted: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  dismissedOnboardingHintIds: CombatOnboardingHintId[];
}
```

Set default:

```ts
sfxVolume: 75,
```

Normalize:

```ts
sfxVolume: normalizeVolume(candidate.sfxVolume, DEFAULT_DESKTOP_SETTINGS.sfxVolume),
```

- [ ] **Step 4: Add settings UI slider**

In `showSettingsShell(...)` inside `src/app/inkbladeController.ts`, append:

```ts
createSettingRange("setting-sfx-volume", "音效音量", state.settings.sfxVolume, (value) => updateSettings({ sfxVolume: value }))
```

after music volume.

- [ ] **Step 5: Run GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "settings persist"
git diff --check
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/settingsPersistence.ts src/app/inkbladeController.ts tests/app-settings.test.ts tests/e2e/playable-flow.spec.ts
git commit -m "feat: add sfx volume setting"
```

## Task 2: Audio Feedback Ambience And Manifest

**Files:**

- Modify: `src/app/audioFeedback.ts`
- Add: `public/assets/audio/manifest.json`
- Add: `public/assets/audio/README.md`
- Add: `tests/audio-feedback.test.ts`
- Add: `tests/audio-manifest.test.ts`

- [ ] **Step 1: Write failing audio-feedback tests**

Create `tests/audio-feedback.test.ts` with fake `AudioContext` coverage:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { createAudioFeedback } from "../src/app/audioFeedback";
import { DEFAULT_DESKTOP_SETTINGS } from "../src/app/settingsPersistence";

let startedOscillators = 0;

class FakeAudioParam {
  public setValueAtTime(): void {}
  public exponentialRampToValueAtTime(): void {}
  public linearRampToValueAtTime(): void {}
}

class FakeOscillator {
  public type: OscillatorType = "sine";
  public frequency = new FakeAudioParam();
  public connect(): void {}
  public start(): void {
    startedOscillators += 1;
  }
  public stop(): void {}
  public disconnect(): void {}
}

class FakeGain {
  public gain = new FakeAudioParam();
  public connect(): void {}
  public disconnect(): void {}
}

class FakeAudioContext {
  public state: AudioContextState = "running";
  public currentTime = 1;
  public destination = {};
  public createOscillator(): OscillatorNode {
    return new FakeOscillator() as unknown as OscillatorNode;
  }
  public createGain(): GainNode {
    return new FakeGain() as unknown as GainNode;
  }
  public resume(): Promise<void> {
    return Promise.resolve();
  }
  public close(): Promise<void> {
    return Promise.resolve();
  }
}

describe("audio feedback routing", () => {
  afterEach(() => {
    startedOscillators = 0;
    delete (window as Window & { AudioContext?: typeof AudioContext }).AudioContext;
  });

  it("gates sfx tones with sfx volume", () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, sfxVolume: 0 });

    audio.playUi();
    expect(startedOscillators).toBe(0);

    audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, sfxVolume: 50 });
    audio.playUi();
    expect(startedOscillators).toBe(1);
    audio.dispose();
  });

  it("gates ambience with music volume and muted state", () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 0 });

    audio.setSurface("map");
    expect(startedOscillators).toBe(0);

    audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 50 });
    audio.setSurface("map");
    expect(startedOscillators).toBe(1);

    audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, muted: true });
    audio.setSurface("combat");
    expect(startedOscillators).toBe(1);
    audio.dispose();
  });
});
```

- [ ] **Step 2: Write failing manifest test**

Create `tests/audio-manifest.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface AudioManifest {
  version: number;
  ambience: Record<string, { fallback: string; description: string }>;
  sfx: Record<string, { fallback: string; description: string }>;
}

describe("audio manifest", () => {
  it("documents required ambience and sfx slots", () => {
    const manifest = JSON.parse(readFileSync("public/assets/audio/manifest.json", "utf8")) as AudioManifest;

    expect(manifest.version).toBe(1);
    expect(Object.keys(manifest.ambience)).toEqual(["title", "map", "combat", "reward", "event", "shop", "rest", "final"]);
    expect(Object.keys(manifest.sfx)).toEqual(["ui", "card", "victory", "defeat", "final-choice"]);
    for (const entry of [...Object.values(manifest.ambience), ...Object.values(manifest.sfx)]) {
      expect(entry.fallback).toMatch(/^procedural:/);
      expect(entry.description.length).toBeGreaterThan(8);
    }
  });
});
```

- [ ] **Step 3: Run RED**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/audio-feedback.test.ts tests/audio-manifest.test.ts --reporter=dot
```

Expected: FAIL because `setSurface`, `sfxVolume`, and the manifest do not exist yet.

- [ ] **Step 4: Extend audio API and routing**

In `src/app/audioFeedback.ts`, export:

```ts
export type AudioSurface = "title" | "map" | "combat" | "reward" | "event" | "shop" | "rest" | "final" | "silent";
```

Add to `AudioFeedback`:

```ts
setSurface(surface: AudioSurface): void;
stopAmbience(): void;
```

Use `settings.sfxVolume` for one-shot tones and `settings.musicVolume` for ambience. `setSurface("silent")`, muted, master volume `0`, or music volume `0` should stop ambience and not start a new oscillator.

- [ ] **Step 5: Add audio manifest docs**

Create `public/assets/audio/manifest.json` with `version`, `ambience`, and `sfx` entries from the manifest test.

Create `public/assets/audio/README.md` explaining:

- current runtime uses procedural fallback;
- manifest entries reserve final asset slots;
- no external audio files are required for the browser showcase.

- [ ] **Step 6: Run GREEN**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/audio-feedback.test.ts tests/audio-manifest.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/audioFeedback.ts public/assets/audio/manifest.json public/assets/audio/README.md tests/audio-feedback.test.ts tests/audio-manifest.test.ts
git commit -m "feat: add procedural audio ambience"
```

## Task 3: Controller Surface Hooks And Final Verification

**Files:**

- Modify: `src/app/inkbladeController.ts`
- Modify: `tests/e2e/playable-flow.spec.ts`
- Modify: `Documentation.md`

- [ ] **Step 1: Add focused browser assertion**

In `tests/e2e/playable-flow.spec.ts`, extend the settings test to assert `setting-sfx-volume` persists after reload.

- [ ] **Step 2: Wire audio surfaces**

In `createInkbladeController(...).render()`, call `audioFeedback.setSurface(...)` for each screen before returning:

- `map` -> `"map"`
- `combat` -> `"combat"`
- `reward` and `methodReward` -> `"reward"`
- `event` -> `"event"`
- `shop` -> `"shop"`
- `rest` -> `"rest"`
- ending/result/final choice screens -> `"final"`

Title-shell settings may remain on the default `"title"` surface.

- [ ] **Step 3: Run integration checks**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run tests/app-settings.test.ts tests/audio-feedback.test.ts tests/audio-manifest.test.ts --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts --grep "settings"
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Full verification**

Run:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vitest/vitest.mjs run --reporter=dot
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/vite/bin/vite.js build
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/playable-flow.spec.ts
```

Expected: all pass.

- [ ] **Step 5: Documentation and commit**

Update `Documentation.md` with:

- docs read;
- subagent commits;
- RED/GREEN evidence;
- verification commands;
- known risks around procedural placeholder ambience and browser autoplay.

Commit:

```bash
git add Documentation.md src/app/inkbladeController.ts tests/e2e/playable-flow.spec.ts
git commit -m "docs: record wave39 audio atmosphere"
```
