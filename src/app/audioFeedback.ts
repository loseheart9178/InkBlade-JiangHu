import { DEFAULT_DESKTOP_SETTINGS, normalizeSettings, type DesktopSettings } from "./settingsPersistence";

type AudioContextConstructor = new () => AudioContext;
type AudioElementConstructor = new (src?: string) => HTMLAudioElement;
type AudioFeedbackSettings = DesktopSettings & { sfxVolume?: number };
type CharacterVoiceId = "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang";

export type AudioSurface = "title" | "map" | "combat" | "reward" | "event" | "shop" | "rest" | "final" | "silent";

export interface VoiceCue {
  cardId?: string;
  cardTypes?: string[];
}

export interface AudioFeedback {
  playUi(): void;
  playCard(): void;
  playVictory(): void;
  playDefeat(): void;
  playVoiceCue(characterId: string, cue: VoiceCue): void;
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
  oscillator?: OscillatorNode;
  gain?: GainNode;
  media?: HTMLAudioElement;
}

const DEFAULT_SFX_VOLUME = 75;
const AUDIO_ASSET_ROOT = "/assets/audio";

const AMBIENCE_ASSETS: Partial<Record<Exclude<AudioSurface, "silent">, string>> = {
  title: `${AUDIO_ASSET_ROOT}/ambience/title-loop.ogg`,
  map: `${AUDIO_ASSET_ROOT}/ambience/map-loop.ogg`,
  combat: `${AUDIO_ASSET_ROOT}/ambience/combat-luoshui-loop.ogg`,
  reward: `${AUDIO_ASSET_ROOT}/ambience/map-loop.ogg`,
  event: `${AUDIO_ASSET_ROOT}/ambience/event-loop.ogg`,
  shop: `${AUDIO_ASSET_ROOT}/ambience/shop-loop.ogg`,
  rest: `${AUDIO_ASSET_ROOT}/ambience/rest-loop.ogg`,
  final: `${AUDIO_ASSET_ROOT}/ambience/final-loop.ogg`
};

const VOICE_CUES: Record<CharacterVoiceId, { fallback: string[]; cards: Record<string, string[]>; types: Partial<Record<string, string[]>> }> = {
  zhaoyun: {
    fallback: ["zhaoyun-bark-01", "zhaoyun-bark-02", "zhaoyun-bark-03", "zhaoyun-bark-04"],
    cards: {
      zhao_white_dragon: ["zhaoyun-attack-01"],
      zhao_seven_entries: ["zhaoyun-attack-03"],
      zhao_cloud_pierce: ["zhaoyun-attack-04"],
      zhao_guard: ["zhaoyun-guard-02"],
      zhao_oath_guard: ["zhaoyun-guard-03"]
    },
    types: {
      attack: ["zhaoyun-attack-02", "zhaoyun-bark-02"],
      skill: ["zhaoyun-guard-01", "zhaoyun-guard-02"],
      body: ["zhaoyun-guard-01", "zhaoyun-guard-03"]
    }
  },
  diaochan: {
    fallback: ["diaochan-bark-01", "diaochan-bark-02", "diaochan-bark-03", "diaochan-bark-04"],
    cards: {
      diao_sleeve_blade: ["diaochan-attack-01"],
      diao_jinghong_strike: ["diaochan-attack-02"],
      diao_lotus_blade: ["diaochan-attack-03"],
      diao_moonstep: ["diaochan-attack-04"],
      diao_lijian: ["diaochan-charm-03"],
      diao_silk_snare: ["diaochan-charm-04"],
      diao_closed_moon: ["diaochan-ultimate-01"]
    },
    types: {
      attack: ["diaochan-attack-01", "diaochan-attack-02"],
      skill: ["diaochan-charm-01", "diaochan-charm-02"],
      body: ["diaochan-bark-03", "diaochan-bark-04"]
    }
  },
  caiwenji: {
    fallback: ["caiwenji-bark-01", "caiwenji-bark-02", "caiwenji-bark-03", "caiwenji-bark-04"],
    cards: {
      cai_broken_string: ["caiwenji-attack-01"],
      cai_hujia_beat: ["caiwenji-attack-02"],
      cai_qingxin_song: ["caiwenji-cleanse-01"],
      cai_cleansing_rain: ["caiwenji-cleanse-04"],
      cai_soul_ferry: ["caiwenji-ultimate-02"]
    },
    types: {
      attack: ["caiwenji-attack-03", "caiwenji-attack-04"],
      skill: ["caiwenji-cleanse-01", "caiwenji-cleanse-03"],
      power: ["caiwenji-ultimate-01"]
    }
  },
  zhugeliang: {
    fallback: ["zhugeliang-bark-01", "zhugeliang-bark-02", "zhugeliang-bark-03", "zhugeliang-bark-04"],
    cards: {
      zhuge_fan_strike: ["zhugeliang-attack-01"],
      zhuge_starfall: ["zhugeliang-attack-02"],
      zhuge_fire_array: ["zhugeliang-attack-03"],
      zhuge_borrow_wind: ["zhugeliang-attack-04", "zhugeliang-ultimate-01"],
      zhuge_observe_stars: ["zhugeliang-strategy-01"],
      zhuge_small_eight_array: ["zhugeliang-strategy-03"],
      zhuge_plan_set: ["zhugeliang-strategy-04"]
    },
    types: {
      attack: ["zhugeliang-attack-01", "zhugeliang-attack-02"],
      skill: ["zhugeliang-strategy-01", "zhugeliang-strategy-02"],
      power: ["zhugeliang-ultimate-01", "zhugeliang-ultimate-02"]
    }
  }
};

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
  let pendingAmbienceSurface: Exclude<AudioSurface, "silent"> | undefined;
  let ambienceAttemptToken = 0;

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

  const playMediaAsset = (assetPath: string, layerVolume: number, loop: boolean): HTMLAudioElement | undefined => {
    const AudioCtor = getAudioElementConstructor();
    if (!AudioCtor) {
      return undefined;
    }

    try {
      const media = new AudioCtor(assetPath);
      media.loop = loop;
      media.volume = getMediaVolume(settings, layerVolume);
      const playback = media.play();
      void playback?.catch(() => undefined);
      return media;
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
    pendingAmbienceSurface = undefined;
    if (!activeAmbience) {
      return;
    }

    try {
      activeAmbience.media?.pause();
      activeAmbience.media && (activeAmbience.media.currentTime = 0);
      activeAmbience.oscillator?.stop();
      activeAmbience.oscillator?.disconnect();
      activeAmbience.gain?.disconnect();
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

  const startAuthoredAmbience = (surface: Exclude<AudioSurface, "silent">): boolean => {
    const assetPath = AMBIENCE_ASSETS[surface];
    if (!assetPath) {
      return false;
    }

    if (pendingAmbienceSurface === surface) {
      return true;
    }

    stopAmbience();
    const AudioCtor = getAudioElementConstructor();
    if (!AudioCtor) {
      return false;
    }

    try {
      const media = new AudioCtor(assetPath);
      media.loop = true;
      media.volume = getMediaVolume(settings, settings.musicVolume);
      const token = ++ambienceAttemptToken;
      pendingAmbienceSurface = surface;
      const playback = media.play();
      if (playback && typeof playback.then === "function") {
        void playback.then(() => {
          if (token !== ambienceAttemptToken || currentSurface !== surface) {
            try {
              media.pause();
            } catch {
              // Ignore cleanup failures for stale autoplay attempts.
            }
            return;
          }

          ambience = { media };
          pendingAmbienceSurface = undefined;
        }).catch(() => {
          if (token === ambienceAttemptToken && pendingAmbienceSurface === surface) {
            pendingAmbienceSurface = undefined;
          }
        });
      } else {
        ambience = { media };
        pendingAmbienceSurface = undefined;
      }
      return true;
    } catch {
      pendingAmbienceSurface = undefined;
      return false;
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
    playVoiceCue(characterId: string, cue: VoiceCue) {
      if (!canPlaySfx(settings) || !isCharacterVoiceId(characterId)) {
        return;
      }

      const stem = selectVoiceCue(characterId, cue);
      if (!stem) {
        return;
      }

      const assetPath = `${AUDIO_ASSET_ROOT}/voice/${characterId}/${stem}.ogg`;
      if (!playMediaAsset(assetPath, settings.sfxVolume, false)) {
        playTone({ frequency: 300, duration: 0.11, type: "triangle", volumeScale: 0.18 });
      }
    },
    setSurface(surface: AudioSurface) {
      if (surface === currentSurface && surface !== "silent" && ambience) {
        return;
      }

      currentSurface = surface;
      if (surface === "silent") {
        stopAmbience();
        return;
      }

      if (!canPlayMusic(settings)) {
        stopAmbience();
        return;
      }

      if (!startAuthoredAmbience(surface)) {
        startAmbience(surface);
      }
    },
    stopAmbience() {
      currentSurface = "silent";
      stopAmbience();
    },
    setSettings(nextSettings: AudioFeedbackSettings) {
      const previousMusicVolume = settings.musicVolume;
      const previousMasterVolume = settings.masterVolume;
      const previousMuted = settings.muted;
      settings = normalizeAudioSettings(nextSettings);
      if (!canPlayMusic(settings)) {
        stopAmbience();
      } else if (
        currentSurface !== "silent" &&
        (!ambience || previousMusicVolume !== settings.musicVolume || previousMasterVolume !== settings.masterVolume || previousMuted !== settings.muted)
      ) {
        if (!startAuthoredAmbience(currentSurface)) {
          startAmbience(currentSurface);
        }
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

function getMediaVolume(settings: NormalizedAudioSettings, layerVolume: number): number {
  return Math.min(1, Math.max(0, (settings.masterVolume / 100) * (layerVolume / 100)));
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

function getAudioElementConstructor(): AudioElementConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as Window & { Audio?: AudioElementConstructor }).Audio;
}

function isCharacterVoiceId(value: string): value is CharacterVoiceId {
  return value === "zhaoyun" || value === "diaochan" || value === "caiwenji" || value === "zhugeliang";
}

function selectVoiceCue(characterId: CharacterVoiceId, cue: VoiceCue): string | undefined {
  const cues = VOICE_CUES[characterId];
  const cardCue = cue.cardId ? cues.cards[cue.cardId] : undefined;
  if (cardCue) {
    return pick(cardCue);
  }

  for (const type of cue.cardTypes ?? []) {
    const typeCue = cues.types[type];
    if (typeCue) {
      return pick(typeCue);
    }
  }

  return pick(cues.fallback);
}

function pick(values: string[]): string | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return values[Math.floor(Math.random() * values.length)];
}
