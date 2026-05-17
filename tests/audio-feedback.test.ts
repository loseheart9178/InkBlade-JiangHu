import { afterEach, describe, expect, it } from "vitest";
import { createAudioFeedback } from "../src/app/audioFeedback";
import { DEFAULT_DESKTOP_SETTINGS } from "../src/app/settingsPersistence";

let startedOscillators = 0;
let createdMediaSources: string[] = [];
let playedMediaSources: string[] = [];
let pausedMediaSources: string[] = [];
let mediaPlayAttempts = 0;
let blockFirstAutoplay = false;

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

class FakeMediaElement {
  public loop = false;
  public volume = 1;
  public currentTime = 0;

  public constructor(public readonly src: string) {
    createdMediaSources.push(src);
  }

  public play(): Promise<void> {
    mediaPlayAttempts += 1;
    if (blockFirstAutoplay && this.src.includes("title-loop") && mediaPlayAttempts === 1) {
      return Promise.reject(new Error("autoplay blocked"));
    }
    playedMediaSources.push(this.src);
    return Promise.resolve();
  }

  public pause(): void {
    pausedMediaSources.push(this.src);
  }
}

describe("audio feedback routing", () => {
  afterEach(() => {
    startedOscillators = 0;
    createdMediaSources = [];
    playedMediaSources = [];
    pausedMediaSources = [];
    mediaPlayAttempts = 0;
    blockFirstAutoplay = false;
    delete (window as Window & { AudioContext?: typeof AudioContext }).AudioContext;
    delete (window as Window & { Audio?: typeof Audio }).Audio;
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
    expect(startedOscillators).toBe(1);

    audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, muted: true });
    audio.setSurface("combat");
    expect(startedOscillators).toBe(1);
    audio.dispose();
  });

  it("keeps the active ambience stable when the same surface renders again", () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 50 });

    audio.setSurface("map");
    audio.setSurface("map");

    expect(startedOscillators).toBe(1);
    audio.dispose();
  });

  it("stops ambience for silent surfaces and zero master volume", () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 50 });

    audio.setSurface("title");
    audio.setSurface("silent");
    audio.setSettings({ ...DEFAULT_DESKTOP_SETTINGS, masterVolume: 0, musicVolume: 50 });
    audio.setSurface("final");

    expect(startedOscillators).toBe(1);
    expect(() => audio.stopAmbience()).not.toThrow();
    audio.dispose();
  });

  it("plays authored ambience assets before procedural fallback", async () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    (window as Window & { Audio?: typeof Audio }).Audio = FakeMediaElement as unknown as typeof Audio;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 50 });

    audio.setSurface("title");
    await Promise.resolve();
    audio.setSurface("map");

    expect(playedMediaSources).toEqual(["/assets/audio/ambience/title-loop.ogg", "/assets/audio/ambience/map-loop.ogg"]);
    expect(pausedMediaSources).toEqual(["/assets/audio/ambience/title-loop.ogg"]);
    expect(startedOscillators).toBe(0);
    audio.dispose();
  });

  it("retries authored ambience when the first autoplay attempt is blocked", async () => {
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = FakeAudioContext as unknown as typeof AudioContext;
    (window as Window & { Audio?: typeof Audio }).Audio = FakeMediaElement as unknown as typeof Audio;
    blockFirstAutoplay = true;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, musicVolume: 50 });

    audio.setSurface("title");
    await Promise.resolve();
    await Promise.resolve();
    expect(createdMediaSources).toEqual(["/assets/audio/ambience/title-loop.ogg"]);
    expect(playedMediaSources).toEqual([]);

    audio.setSurface("title");
    await Promise.resolve();
    await Promise.resolve();
    expect(createdMediaSources).toEqual(["/assets/audio/ambience/title-loop.ogg", "/assets/audio/ambience/title-loop.ogg"]);
    expect(playedMediaSources).toEqual(["/assets/audio/ambience/title-loop.ogg"]);
    audio.dispose();
  });

  it("plays character voice cues through authored voice assets", () => {
    (window as Window & { Audio?: typeof Audio }).Audio = FakeMediaElement as unknown as typeof Audio;
    const audio = createAudioFeedback({ ...DEFAULT_DESKTOP_SETTINGS, sfxVolume: 70 });

    audio.playVoiceCue("diaochan", { cardId: "diao_lijian", cardTypes: ["skill"] });

    expect(createdMediaSources).toEqual(["/assets/audio/voice/diaochan/diaochan-charm-03.ogg"]);
    expect(playedMediaSources).toEqual(["/assets/audio/voice/diaochan/diaochan-charm-03.ogg"]);
    audio.dispose();
  });
});
