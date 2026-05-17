import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface AudioManifest {
  version: number;
  ambience: Record<string, { fallback: string; asset?: string; description: string }>;
  sfx: Record<string, { fallback: string; asset?: string; description: string }>;
  combatCues: Record<string, { fallback: string; asset?: string; description: string }>;
  voice: Record<string, { assets: string[]; description: string }>;
}

describe("audio manifest", () => {
  it("documents required ambience and sfx slots", () => {
    const manifest = JSON.parse(readFileSync("public/assets/audio/manifest.json", "utf8")) as AudioManifest;

    expect(manifest.version).toBe(1);
    expect(Object.keys(manifest.ambience)).toEqual(["title", "map", "combat", "reward", "event", "shop", "rest", "final"]);
    expect(Object.keys(manifest.sfx)).toEqual(["ui", "card", "victory", "defeat", "final-choice"]);
    expect(Object.keys(manifest.combatCues)).toEqual(["hit", "block", "status", "turn"]);
    for (const entry of [...Object.values(manifest.ambience), ...Object.values(manifest.sfx), ...Object.values(manifest.combatCues)]) {
      expect(entry.fallback).toMatch(/^procedural:/);
      expect(entry.description.length).toBeGreaterThan(8);
    }
    expect(manifest.ambience.title.asset).toBe("/assets/audio/ambience/title-loop.ogg");
    expect(manifest.ambience.combat.asset).toBe("/assets/audio/ambience/combat-luoshui-loop.ogg");
    expect(Object.keys(manifest.voice)).toEqual(["zhaoyun", "diaochan", "caiwenji", "zhugeliang"]);
    expect(manifest.voice.zhaoyun.assets).toContain("/assets/audio/voice/zhaoyun/zhaoyun-bark-01.ogg");
    expect(manifest.voice.diaochan.assets).toContain("/assets/audio/voice/diaochan/diaochan-charm-03.ogg");
    for (const voice of Object.values(manifest.voice)) {
      expect(voice.assets.length).toBeGreaterThan(10);
      expect(voice.description.length).toBeGreaterThan(8);
    }
  });
});
