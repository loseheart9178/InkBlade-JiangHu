import type { GameStorage } from "../game/systems/save/save";
import { normalizeOnboardingHintIds, type CombatOnboardingHintId } from "../game/systems/tutorial/onboarding";

export const SETTINGS_STORAGE_KEY = "inkblade-jianghu:desktop-settings:v1";
export const SETTINGS_SCHEMA_VERSION = 1;

export interface DesktopSettings {
  reducedMotion: boolean;
  fastCombatText: boolean;
  muted: boolean;
  masterVolume: number;
  musicVolume: number;
  dismissedOnboardingHintIds: CombatOnboardingHintId[];
}

interface SettingsEnvelope {
  version: typeof SETTINGS_SCHEMA_VERSION;
  savedAt: string;
  settings: DesktopSettings;
}

export const DEFAULT_DESKTOP_SETTINGS: DesktopSettings = {
  reducedMotion: false,
  fastCombatText: false,
  muted: false,
  masterVolume: 80,
  musicVolume: 70,
  dismissedOnboardingHintIds: []
};

export function loadSettings(storage: GameStorage | undefined): DesktopSettings {
  if (!storage) {
    return { ...DEFAULT_DESKTOP_SETTINGS };
  }

  const raw = storage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_DESKTOP_SETTINGS };
  }

  try {
    const envelope = JSON.parse(raw) as Partial<SettingsEnvelope>;
    if (envelope.version !== SETTINGS_SCHEMA_VERSION) {
      return { ...DEFAULT_DESKTOP_SETTINGS };
    }

    return normalizeSettings(envelope.settings);
  } catch {
    return { ...DEFAULT_DESKTOP_SETTINGS };
  }
}

export function saveSettings(storage: GameStorage | undefined, settings: DesktopSettings): void {
  if (!storage) {
    return;
  }

  const envelope: SettingsEnvelope = {
    version: SETTINGS_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    settings: normalizeSettings(settings)
  };
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(envelope));
}

export function normalizeSettings(value: unknown): DesktopSettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_DESKTOP_SETTINGS };
  }

  const candidate = value as Partial<DesktopSettings>;
  return {
    reducedMotion: typeof candidate.reducedMotion === "boolean" ? candidate.reducedMotion : DEFAULT_DESKTOP_SETTINGS.reducedMotion,
    fastCombatText: typeof candidate.fastCombatText === "boolean" ? candidate.fastCombatText : DEFAULT_DESKTOP_SETTINGS.fastCombatText,
    muted: typeof candidate.muted === "boolean" ? candidate.muted : DEFAULT_DESKTOP_SETTINGS.muted,
    masterVolume: normalizeVolume(candidate.masterVolume, DEFAULT_DESKTOP_SETTINGS.masterVolume),
    musicVolume: normalizeVolume(candidate.musicVolume, DEFAULT_DESKTOP_SETTINGS.musicVolume),
    dismissedOnboardingHintIds: normalizeOnboardingHintIds(candidate.dismissedOnboardingHintIds)
  };
}

function normalizeVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
