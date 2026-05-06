import { createInkbladeController } from "../src/app/inkbladeController";
import { createAudioFeedback } from "../src/app/audioFeedback";
import { cardList } from "../src/game/content/cards";
import { charactersById } from "../src/game/content/characters";
import { enemiesById } from "../src/game/content/enemies";
import {
  DEFAULT_DESKTOP_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  saveSettings,
  type DesktopSettings
} from "../src/app/settingsPersistence";
import { createCombat } from "../src/game/systems/combat/combat";
import {
  COMBAT_ONBOARDING_HINT_IDS,
  createMapOnboardingHints,
  createCombatOnboardingHints
} from "../src/game/systems/tutorial/onboarding";
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
      musicVolume: 0,
      dismissedOnboardingHintIds: ["combat-energy", "combat-hand"]
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
      musicVolume: 0,
      dismissedOnboardingHintIds: []
    });
  });

  it("normalizes onboarding hint dismissal ids with the rest of desktop settings", () => {
    const storage = new MemoryStorage();

    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      version: 1,
      settings: {
        reducedMotion: false,
        fastCombatText: false,
        muted: false,
        masterVolume: 80,
        musicVolume: 70,
        dismissedOnboardingHintIds: [
          "combat-energy",
          "map-route",
          "missing-hint",
          "combat-energy",
          "character-zhaoyun",
          "combat-end-turn",
          "map-route"
        ]
      }
    }));

    expect(loadSettings(storage).dismissedOnboardingHintIds).toEqual([
      "combat-energy",
      "map-route",
      "character-zhaoyun",
      "combat-end-turn"
    ]);
  });

  it("selects contextual first-combat onboarding hints and excludes dismissed hints", () => {
    const combat = createCombat({
      character: charactersById.zhaoyun,
      cards: cardList,
      enemies: [enemiesById.enemy_ink_bandit],
      rngSeed: 22,
      relicIds: [],
      shuffleDeck: false
    });

    const allHints = createCombatOnboardingHints(combat, []);
    expect(allHints.map((hint) => hint.id)).toEqual([...COMBAT_ONBOARDING_HINT_IDS, "character-zhaoyun"]);

    const filtered = createCombatOnboardingHints(combat, ["combat-energy", "combat-end-turn"]);
    expect(filtered.map((hint) => hint.id)).toEqual(["combat-hand", "combat-intent", "combat-block", "character-zhaoyun"]);
  });

  it("adds a role-specific combat onboarding hint for each playable character", () => {
    const cases = [
      ["zhaoyun", "character-zhaoyun"],
      ["diaochan", "character-diaochan"],
      ["caiwenji", "character-caiwenji"],
      ["zhugeliang", "character-zhugeliang"]
    ] as const;

    for (const [characterId, expectedHintId] of cases) {
      const combat = createCombat({
        character: charactersById[characterId],
        cards: cardList,
        enemies: [enemiesById.enemy_ink_bandit],
        rngSeed: 22,
        relicIds: [],
        shuffleDeck: false
      });

      const hints = createCombatOnboardingHints(combat, []);
      expect(hints.at(-1)?.id).toBe(expectedHintId);
      expect(hints.some((hint) => hint.id === expectedHintId)).toBe(true);
      expect(createCombatOnboardingHints(combat, [expectedHintId]).some((hint) => hint.id === expectedHintId)).toBe(false);
    }
  });

  it("creates map surface hints and respects dismissed ids", () => {
    expect(createMapOnboardingHints([]).map((hint) => hint.id)).toEqual(["map-route", "map-mind", "map-ink"]);
    expect(createMapOnboardingHints(["map-route", "combat-energy"]).map((hint) => hint.id)).toEqual(["map-mind", "map-ink"]);
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
      musicVolume: 44,
      dismissedOnboardingHintIds: []
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
      musicVolume: 21,
      dismissedOnboardingHintIds: []
    });
  });

  it("persists dismissed combat onboarding hints across controller reloads", () => {
    const storage = new MemoryStorage();
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='map-node-battle-1']")?.click();

    expect(host.querySelector("[data-testid='onboarding-hint-combat-energy']")).not.toBeNull();
    expect(host.querySelector("[data-testid='onboarding-hint-combat-hand']")).not.toBeNull();

    host.querySelector<HTMLButtonElement>("[data-testid='onboarding-dismiss-combat-energy']")?.click();

    expect(loadSettings(storage).dismissedOnboardingHintIds).toEqual(["combat-energy"]);
    expect(host.querySelector("[data-testid='onboarding-hint-combat-energy']")).toBeNull();
    expect(host.querySelector("[data-testid='onboarding-hint-combat-hand']")).not.toBeNull();

    const continuedHost = document.createElement("div");
    const continued = createInkbladeController(continuedHost, { storage });
    expect(continued.continueRun()).toBe(true);

    expect(continuedHost.querySelector("[data-testid='onboarding-hint-combat-energy']")).toBeNull();
    expect(continuedHost.querySelector("[data-testid='onboarding-hint-combat-hand']")).not.toBeNull();
  });

  it("does not mark onboarding complete when debug skip advances the route", () => {
    const storage = new MemoryStorage();
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='debug-skip-chapter']")?.click();

    expect(loadSettings(storage).dismissedOnboardingHintIds).toEqual([]);

    host.querySelector<HTMLButtonElement>("[data-testid='map-node-battle-1']")?.click();

    expect(host.querySelector("[data-testid='onboarding-hint-combat-energy']")).not.toBeNull();
    expect(host.querySelector("[data-testid='onboarding-hint-combat-end-turn']")).not.toBeNull();
  });
});
