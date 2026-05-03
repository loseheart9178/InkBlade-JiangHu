import { createInkbladeController } from "../src/app/inkbladeController";
import { createAudioFeedback } from "../src/app/audioFeedback";
import {
  DEFAULT_DESKTOP_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  saveSettings,
  type DesktopSettings
} from "../src/app/settingsPersistence";
import type { GameStorage } from "../src/game/systems/save/save";

class MemoryStorage implements GameStorage {
  public readonly items = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  public removeItem(key: string): void {
    this.items.delete(key);
  }
}

describe("desktop settings persistence", () => {
  it("normalizes and persists desktop settings separately from run saves", () => {
    const storage = new MemoryStorage();
    const settings: DesktopSettings = {
      reducedMotion: true,
      fastCombatText: true,
      muted: true,
      masterVolume: 24,
      musicVolume: 0
    };

    saveSettings(storage, settings);

    expect(storage.items.has(SETTINGS_STORAGE_KEY)).toBe(true);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it("falls back to defaults for missing, invalid, or out-of-range settings", () => {
    const storage = new MemoryStorage();

    expect(loadSettings(storage)).toEqual(DEFAULT_DESKTOP_SETTINGS);

    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      version: 1,
      settings: {
        reducedMotion: "yes",
        fastCombatText: true,
        muted: false,
        masterVolume: 180,
        musicVolume: -20
      }
    }));

    expect(loadSettings(storage)).toEqual({
      reducedMotion: false,
      fastCombatText: true,
      muted: false,
      masterVolume: 100,
      musicVolume: 0
    });
  });

  it("exposes a no-op safe procedural audio surface in jsdom", () => {
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, masterVolume: 0 });

    expect(() => {
      audio.playUi();
      audio.playCard();
      audio.playVictory();
      audio.playDefeat();
      audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, muted: true });
      audio.dispose();
    }).not.toThrow();
  });
});

describe("settings shell wiring", () => {
  it("loads saved values, saves changes, and applies reduced motion class", () => {
    const storage = new MemoryStorage();
    saveSettings(storage, {
      reducedMotion: true,
      fastCombatText: true,
      muted: false,
      masterVolume: 33,
      musicVolume: 44
    });
    const host = document.createElement("div");
    host.innerHTML = `<section class="title-screen"><div class="title-actions"></div></section>`;

    createInkbladeController(host, { storage });

    expect(host.classList.contains("prefers-reduced-motion")).toBe(true);
    host.querySelector<HTMLButtonElement>("[data-testid='settings-open']")?.click();

    const reduced = host.querySelector<HTMLInputElement>("[data-testid='setting-reduced-motion']");
    const fastText = host.querySelector<HTMLInputElement>("[data-testid='setting-fast-combat-text']");
    const muted = host.querySelector<HTMLInputElement>("[data-testid='setting-muted']");
    const master = host.querySelector<HTMLInputElement>("[data-testid='setting-master-volume']");
    const music = host.querySelector<HTMLInputElement>("[data-testid='setting-music-volume']");

    expect(reduced?.checked).toBe(true);
    expect(fastText?.checked).toBe(true);
    expect(muted?.checked).toBe(false);
    expect(master?.disabled).toBe(false);
    expect(master?.value).toBe("33");
    expect(music?.disabled).toBe(false);
    expect(music?.value).toBe("44");

    muted!.checked = true;
    muted!.dispatchEvent(new Event("change", { bubbles: true }));
    master!.value = "12";
    master!.dispatchEvent(new Event("input", { bubbles: true }));
    music!.value = "21";
    music!.dispatchEvent(new Event("input", { bubbles: true }));
    reduced!.checked = false;
    reduced!.dispatchEvent(new Event("change", { bubbles: true }));

    expect(host.classList.contains("prefers-reduced-motion")).toBe(false);
    expect(loadSettings(storage)).toEqual({
      reducedMotion: false,
      fastCombatText: true,
      muted: true,
      masterVolume: 12,
      musicVolume: 21
    });
  });
});
