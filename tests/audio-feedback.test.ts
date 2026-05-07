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
});
