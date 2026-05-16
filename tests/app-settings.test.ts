import { createInkbladeController, mapScreenToAudioSurface } from "../src/app/inkbladeController";
import { createAudioFeedback, type AudioFeedback, type AudioSurface } from "../src/app/audioFeedback";
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

function createFakeAudioFeedback(surfaces: AudioSurface[]): AudioFeedback {
  return {
    playUi() {},
    playCard() {},
    playVictory() {},
    playDefeat() {},
    setSurface(surface) {
      surfaces.push(surface);
    },
    stopAmbience() {},
    setSettings() {},
    dispose() {}
  };
}

describe("desktop settings persistence", () => {
  it("normalizes and persists desktop settings separately from run saves", () => {
    const storage = new MemoryStorage();
    const settings: DesktopSettings = {
      reducedMotion: true,
      fastCombatText: true,
      developerMode: true,
      muted: true,
      masterVolume: 24,
      musicVolume: 0,
      sfxVolume: 75,
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
        developerMode: true,
        muted: false,
        masterVolume: 180,
        musicVolume: -20,
        sfxVolume: 140
      }
    }));

    expect(loadSettings(storage)).toEqual({
      reducedMotion: false,
      fastCombatText: true,
      developerMode: true,
      muted: false,
      masterVolume: 100,
      musicVolume: 0,
      sfxVolume: 100,
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
        sfxVolume: 75,
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
  it("maps controller screens to ambience surfaces", () => {
    expect(mapScreenToAudioSurface("title")).toBe("title");
    expect(mapScreenToAudioSurface("map")).toBe("map");
    expect(mapScreenToAudioSurface("combat")).toBe("combat");
    expect(mapScreenToAudioSurface("reward")).toBe("reward");
    expect(mapScreenToAudioSurface("methodReward")).toBe("reward");
    expect(mapScreenToAudioSurface("chapterReward")).toBe("reward");
    expect(mapScreenToAudioSurface("bossReward")).toBe("reward");
    expect(mapScreenToAudioSurface("event")).toBe("event");
    expect(mapScreenToAudioSurface("shop")).toBe("shop");
    expect(mapScreenToAudioSurface("rest")).toBe("rest");
    expect(mapScreenToAudioSurface("finalChoice")).toBe("final");
    expect(mapScreenToAudioSurface("victory")).toBe("final");
    expect(mapScreenToAudioSurface("defeat")).toBe("final");
    expect(mapScreenToAudioSurface("runSummary")).toBe("final");
    expect(mapScreenToAudioSurface("compendium", "combat")).toBe("combat");
    expect(mapScreenToAudioSurface("logbook", "reward")).toBe("reward");
    expect(mapScreenToAudioSurface("compendium")).toBe("title");

    const surfaces: AudioSurface[] = [];
    const host = document.createElement("div");
    host.innerHTML = `<section class="title-screen"><div class="title-actions"></div></section>`;
    const controller = createInkbladeController(host, {
      storage: new MemoryStorage(),
      audioFeedback: createFakeAudioFeedback(surfaces)
    });

    expect(surfaces.at(-1)).toBe("title");
    controller.startRun("zhaoyun");
    expect(surfaces.at(-1)).toBe("map");

    host.querySelector<HTMLButtonElement>("[data-testid='map-node-event-1']")?.click();
    expect(surfaces.at(-1)).toBe("event");
  });

  it("renders compact map nodes and top status chips with full details in titles", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");

    const battleNode = host.querySelector<HTMLElement>("[data-testid='map-node-battle-1']");
    expect(battleNode?.querySelector("[data-testid='map-node-details-battle-1']")).not.toBeNull();
    expect(battleNode?.querySelector("[data-testid='map-node-preview-battle-1']")).not.toBeNull();

    const relicChip = host.querySelector<HTMLElement>("[data-testid='run-relics']");
    const methodChip = host.querySelector<HTMLElement>("[data-testid='run-methods']");
    const archetypeChip = host.querySelector<HTMLElement>("[data-testid='run-archetype']");

    expect(relicChip?.dataset.statusKind).toBe("relics");
    expect(methodChip?.dataset.statusKind).toBe("methods");
    expect(archetypeChip?.dataset.statusKind).toBe("archetype");
    expect(relicChip?.getAttribute("title")).toContain("法宝");
    expect(methodChip?.getAttribute("title")).toContain("心法");
    expect(archetypeChip?.getAttribute("title")).toContain("流派");
    expect(relicChip?.textContent?.length).toBeLessThanOrEqual(12);
    expect(methodChip?.textContent?.length).toBeLessThanOrEqual(12);
    expect(archetypeChip?.textContent?.length).toBeLessThanOrEqual(14);
  });

  it("shows card art thumbnails in compendium card entries", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='compendium-open']")?.click();

    const cardEntry = host.querySelector<HTMLElement>("[data-category='cards']");
    const art = cardEntry?.querySelector<HTMLImageElement>("[data-testid='card-art']");
    expect(cardEntry).not.toBeNull();
    expect(art?.getAttribute("src")).toMatch(/^\/assets\//);
  });

  it("opens the original compendium image in a dismissible preview", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='compendium-open']")?.click();

    const thumbnail = host.querySelector<HTMLImageElement>("[data-category='cards'] [data-testid='card-art']");
    const source = thumbnail?.getAttribute("src");
    thumbnail?.click();

    const preview = host.querySelector<HTMLElement>("[data-testid='compendium-image-preview']");
    const previewImage = preview?.querySelector<HTMLImageElement>("[data-testid='compendium-image-preview-img']");
    expect(source).toMatch(/^\/assets\//);
    expect(preview).not.toBeNull();
    expect(previewImage?.getAttribute("src")).toBe(source);

    host.querySelector<HTMLButtonElement>("[data-testid='compendium-image-preview-close']")?.click();
    expect(host.querySelector("[data-testid='compendium-image-preview']")).toBeNull();
  });

  it("does not replay player attack visuals after a later non-attack card", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='map-node-battle-1']")?.click();

    const attackCard = Array.from(host.querySelectorAll<HTMLButtonElement>(".combat-card:not([disabled])"))
      .find((card) => card.classList.contains("card-type-attack"));
    expect(attackCard).not.toBeUndefined();
    attackCard?.click();

    expect(host.querySelector("[data-testid='combat-sprite-player']")).not.toBeNull();
    expect(host.querySelector("[data-testid='target-feedback-enemy']")?.textContent).toContain("-6");

    const nonAttackCard = Array.from(host.querySelectorAll<HTMLButtonElement>(".combat-card:not([disabled])"))
      .find((card) => !card.classList.contains("card-type-attack"));
    expect(nonAttackCard).not.toBeUndefined();
    nonAttackCard?.click();

    expect(host.querySelector("[data-testid='combat-sprite-player']")).toBeNull();
    expect(host.querySelector("[data-testid='target-feedback-enemy']")).toBeNull();
    expect(host.querySelector("[data-testid='target-feedback-player']")?.getAttribute("data-feedback-kind")).toBe("block");
    expect(host.querySelector("[data-testid='combat-floats']")?.textContent).not.toContain("-6");
  });

  it("renders the in-run compendium with a dedicated scroll region before the return action", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='compendium-open']")?.click();

    const panel = host.querySelector<HTMLElement>("[data-testid='screen-compendium']");
    const list = panel?.querySelector<HTMLElement>("[data-testid='compendium-scroll-region']");
    const back = panel?.querySelector<HTMLButtonElement>("[data-testid='compendium-back']");
    expect(panel).not.toBeNull();
    expect(list).not.toBeNull();
    expect(back).not.toBeNull();
    if (!panel || !list || !back) {
      throw new Error("Expected the compendium panel, scroll region, and back action to render.");
    }

    expect(list.classList.contains("compendium-list")).toBe(true);
    expect(back.classList.contains("compendium-back-action")).toBe(true);
    expect(back.parentElement).toBe(panel);
    expect(list.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows imagegen relic art thumbnails in compendium relic entries", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("zhaoyun");
    host.querySelector<HTMLButtonElement>("[data-testid='compendium-open']")?.click();
    host.querySelector<HTMLButtonElement>("[data-testid='compendium-tab-relics']")?.click();

    const relicEntry = host.querySelector<HTMLElement>("[data-category='relics']");
    const art = relicEntry?.querySelector<HTMLImageElement>("[data-testid='relic-art'] img");
    expect(relicEntry).not.toBeNull();
    expect(art?.getAttribute("src")).toMatch(/^\/assets\/generated\/relics\/imagegen-.+\.png$/);
  });

  it("loads saved values, saves changes, and applies reduced motion class", () => {
    const storage = new MemoryStorage();
    saveSettings(storage, {
      reducedMotion: true,
      fastCombatText: true,
      developerMode: true,
      muted: false,
      masterVolume: 33,
      musicVolume: 44,
      sfxVolume: 55,
      dismissedOnboardingHintIds: []
    });
    const host = document.createElement("div");
    host.innerHTML = `<section class="title-screen"><div class="title-actions"></div></section>`;

    createInkbladeController(host, { storage });

    expect(host.classList.contains("prefers-reduced-motion")).toBe(true);
    host.querySelector<HTMLButtonElement>("[data-testid='settings-open']")?.click();

    const reduced = host.querySelector<HTMLInputElement>("[data-testid='setting-reduced-motion']");
    const fastText = host.querySelector<HTMLInputElement>("[data-testid='setting-fast-combat-text']");
    const developer = host.querySelector<HTMLInputElement>("[data-testid='setting-developer-mode']");
    const muted = host.querySelector<HTMLInputElement>("[data-testid='setting-muted']");
    const master = host.querySelector<HTMLInputElement>("[data-testid='setting-master-volume']");
    const music = host.querySelector<HTMLInputElement>("[data-testid='setting-music-volume']");
    const sfx = host.querySelector<HTMLInputElement>("[data-testid='setting-sfx-volume']");

    expect(reduced?.checked).toBe(true);
    expect(fastText?.checked).toBe(true);
    expect(developer?.checked).toBe(true);
    expect(muted?.checked).toBe(false);
    expect(host.querySelector("[data-testid='debug-run-summary']")).not.toBeNull();
    expect(master?.disabled).toBe(false);
    expect(master?.value).toBe("33");
    expect(music?.disabled).toBe(false);
    expect(music?.value).toBe("44");
    expect(sfx?.disabled).toBe(false);
    expect(sfx?.value).toBe("55");

    muted!.checked = true;
    muted!.dispatchEvent(new Event("change", { bubbles: true }));
    master!.value = "12";
    master!.dispatchEvent(new Event("input", { bubbles: true }));
    music!.value = "21";
    music!.dispatchEvent(new Event("input", { bubbles: true }));
    sfx!.value = "31";
    sfx!.dispatchEvent(new Event("input", { bubbles: true }));
    reduced!.checked = false;
    reduced!.dispatchEvent(new Event("change", { bubbles: true }));
    developer!.checked = false;
    developer!.dispatchEvent(new Event("change", { bubbles: true }));

    expect(host.classList.contains("prefers-reduced-motion")).toBe(false);
    expect(host.querySelector("[data-testid='debug-run-summary']")).toBeNull();
    expect(loadSettings(storage)).toEqual({
      reducedMotion: false,
      fastCombatText: true,
      developerMode: false,
      muted: true,
      masterVolume: 12,
      musicVolume: 21,
      sfxVolume: 31,
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

  it("renders combat resource HUD and status tooltips inside the top HUD groups", () => {
    const host = document.createElement("div");
    const controller = createInkbladeController(host, { storage: new MemoryStorage() });

    controller.startRun("diaochan");
    host.querySelector<HTMLButtonElement>("[data-testid='map-node-battle-1']")?.click();

    expect(host.querySelector("[data-testid='player-hud-group'] [data-testid='player-resource']")?.textContent).toContain("舞势");
    expect(host.querySelector("[data-testid='enemy-hud-group'] [data-testid='enemy-resource']")?.textContent).toContain("敌势");
    expect(host.querySelector(".combat-field [data-testid='player-resource']")).toBeNull();
    expect(host.querySelector(".combat-field [data-testid='enemy-resource']")).toBeNull();

    const statusChip = host.querySelector<HTMLElement>(".status-chip");
    const statusBadge = host.querySelector<HTMLElement>("[data-testid='status-badge']");
    expect(statusChip?.getAttribute("title")).toBe(statusChip?.dataset.tooltip);
    expect(statusChip?.getAttribute("aria-label")).toBe(statusChip?.dataset.tooltip);
    expect(statusChip?.getAttribute("tabindex")).toBe("0");
    expect(statusBadge?.dataset.tooltip).toMatch(/：/);
    expect(statusBadge?.getAttribute("tabindex")).toBe("0");
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
