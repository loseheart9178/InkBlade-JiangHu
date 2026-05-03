import { DEFAULT_DESKTOP_SETTINGS, normalizeSettings, type DesktopSettings } from "./settingsPersistence";

type AudioContextConstructor = new () => AudioContext;

export interface AudioFeedback {
  playUi(): void;
  playCard(): void;
  playVictory(): void;
  playDefeat(): void;
  setSettings(settings: DesktopSettings): void;
  dispose(): void;
}

interface ToneShape {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volumeScale: number;
}

export function createAudioFeedback(initialSettings: DesktopSettings = DEFAULT_DESKTOP_SETTINGS): AudioFeedback {
  let settings = normalizeSettings(initialSettings);
  let context: AudioContext | undefined;

  const getAudioContext = (): AudioContext | undefined => {
    if (!canPlay(settings)) {
      return undefined;
    }

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
      gain.gain.exponentialRampToValueAtTime(getOutputGain(settings, shape.volumeScale), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration);
      oscillator.connect(gain);
      gain.connect(activeContext.destination);
      oscillator.start(now);
      oscillator.stop(now + shape.duration + 0.02);
    } catch {
      // Audio feedback must never interrupt UI or browser tests.
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
    setSettings(nextSettings: DesktopSettings) {
      settings = normalizeSettings(nextSettings);
    },
    dispose() {
      const activeContext = context;
      context = undefined;
      void activeContext?.close().catch(() => undefined);
    }
  };
}

function canPlay(settings: DesktopSettings): boolean {
  return !settings.muted && settings.masterVolume > 0;
}

function getOutputGain(settings: DesktopSettings, volumeScale: number): number {
  return Math.max(0.0001, (settings.masterVolume / 100) * volumeScale);
}

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
}
