import { DEFAULT_DESKTOP_SETTINGS, normalizeSettings, type DesktopSettings } from "./settingsPersistence";

type AudioContextConstructor = new () => AudioContext;
type AudioFeedbackSettings = DesktopSettings & { sfxVolume?: number };

export type AudioSurface = "title" | "map" | "combat" | "reward" | "event" | "shop" | "rest" | "final" | "silent";

export interface AudioFeedback {
  playUi(): void;
  playCard(): void;
  playVictory(): void;
  playDefeat(): void;
  setSurface(surface: AudioSurface): void;
  stopAmbience(): void;
  setSettings(settings: AudioFeedbackSettings): void;
  dispose(): void;
}

interface ToneShape {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volumeScale: number;
}

interface NormalizedAudioSettings extends DesktopSettings {
  sfxVolume: number;
}

interface AmbienceShape {
  frequency: number;
  type: OscillatorType;
  volumeScale: number;
}

interface ActiveAmbience {
  oscillator: OscillatorNode;
  gain: GainNode;
}

const DEFAULT_SFX_VOLUME = 75;

const AMBIENCE_SHAPES: Record<Exclude<AudioSurface, "silent">, AmbienceShape> = {
  title: { frequency: 96, type: "sine", volumeScale: 0.045 },
  map: { frequency: 118, type: "triangle", volumeScale: 0.035 },
  combat: { frequency: 72, type: "sawtooth", volumeScale: 0.03 },
  reward: { frequency: 164, type: "sine", volumeScale: 0.03 },
  event: { frequency: 104, type: "triangle", volumeScale: 0.032 },
  shop: { frequency: 138, type: "sine", volumeScale: 0.028 },
  rest: { frequency: 84, type: "sine", volumeScale: 0.034 },
  final: { frequency: 52, type: "triangle", volumeScale: 0.04 }
};

export function createAudioFeedback(initialSettings: AudioFeedbackSettings = DEFAULT_DESKTOP_SETTINGS): AudioFeedback {
  let settings = normalizeAudioSettings(initialSettings);
  let context: AudioContext | undefined;
  let currentSurface: AudioSurface = "silent";
  let ambience: ActiveAmbience | undefined;

  const getAudioContext = (): AudioContext | undefined => {
    const AudioCtor = getAudioContextConstructor();
    if (!AudioCtor) {
      return undefined;
    }

    try {
      context ??= new AudioCtor();
      return context;
    } catch {
      return undefined;
    }
  };

  const playTone = (shape: ToneShape): void => {
    if (!canPlaySfx(settings)) {
      return;
    }

    const activeContext = getAudioContext();
    if (!activeContext) {
      return;
    }

    try {
      if (activeContext.state === "suspended") {
        void activeContext.resume().catch(() => undefined);
      }

      const now = activeContext.currentTime;
      const oscillator = activeContext.createOscillator();
      const gain = activeContext.createGain();
      oscillator.type = shape.type;
      oscillator.frequency.setValueAtTime(shape.frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(getOutputGain(settings, settings.sfxVolume, shape.volumeScale), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration);
      oscillator.connect(gain);
      gain.connect(activeContext.destination);
      oscillator.start(now);
      oscillator.stop(now + shape.duration + 0.02);
    } catch {
      // Audio feedback must never interrupt UI or browser tests.
    }
  };

  const stopAmbience = (): void => {
    const activeAmbience = ambience;
    ambience = undefined;
    if (!activeAmbience) {
      return;
    }

    try {
      activeAmbience.oscillator.stop();
      activeAmbience.oscillator.disconnect();
      activeAmbience.gain.disconnect();
    } catch {
      // Ambience cleanup must stay safe across browser and fake WebAudio implementations.
    }
  };

  const startAmbience = (surface: Exclude<AudioSurface, "silent">): void => {
    if (!canPlayMusic(settings)) {
      stopAmbience();
      return;
    }

    const activeContext = getAudioContext();
    if (!activeContext) {
      return;
    }

    try {
      if (activeContext.state === "suspended") {
        void activeContext.resume().catch(() => undefined);
      }

      stopAmbience();
      const shape = AMBIENCE_SHAPES[surface];
      const now = activeContext.currentTime;
      const oscillator = activeContext.createOscillator();
      const gain = activeContext.createGain();
      oscillator.type = shape.type;
      oscillator.frequency.setValueAtTime(shape.frequency, now);
      gain.gain.setValueAtTime(getOutputGain(settings, settings.musicVolume, shape.volumeScale), now);
      oscillator.connect(gain);
      gain.connect(activeContext.destination);
      oscillator.start(now);
      ambience = { oscillator, gain };
    } catch {
      ambience = undefined;
    }
  };

  return {
    playUi() {
      playTone({ frequency: 420, duration: 0.055, type: "sine", volumeScale: 0.2 });
    },
    playCard() {
      playTone({ frequency: 220, duration: 0.085, type: "triangle", volumeScale: 0.28 });
    },
    playVictory() {
      playTone({ frequency: 660, duration: 0.14, type: "sine", volumeScale: 0.32 });
    },
    playDefeat() {
      playTone({ frequency: 150, duration: 0.18, type: "sawtooth", volumeScale: 0.18 });
    },
    setSurface(surface: AudioSurface) {
      currentSurface = surface;
      if (surface === "silent") {
        stopAmbience();
        return;
      }

      startAmbience(surface);
    },
    stopAmbience() {
      currentSurface = "silent";
      stopAmbience();
    },
    setSettings(nextSettings: AudioFeedbackSettings) {
      settings = normalizeAudioSettings(nextSettings);
      if (!canPlayMusic(settings)) {
        stopAmbience();
      } else if (currentSurface !== "silent" && ambience) {
        startAmbience(currentSurface);
      }
    },
    dispose() {
      stopAmbience();
      const activeContext = context;
      context = undefined;
      void activeContext?.close().catch(() => undefined);
    }
  };
}

function normalizeAudioSettings(value: AudioFeedbackSettings): NormalizedAudioSettings {
  const normalized = normalizeSettings(value);
  return {
    ...normalized,
    sfxVolume: normalizeVolume((value as AudioFeedbackSettings).sfxVolume, DEFAULT_SFX_VOLUME)
  };
}

function canPlay(settings: NormalizedAudioSettings): boolean {
  return !settings.muted && settings.masterVolume > 0;
}

function canPlaySfx(settings: NormalizedAudioSettings): boolean {
  return canPlay(settings) && settings.sfxVolume > 0;
}

function canPlayMusic(settings: NormalizedAudioSettings): boolean {
  return canPlay(settings) && settings.musicVolume > 0;
}

function getOutputGain(settings: NormalizedAudioSettings, layerVolume: number, volumeScale: number): number {
  return Math.max(0.0001, (settings.masterVolume / 100) * (layerVolume / 100) * volumeScale);
}

function normalizeVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
}
