import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface AudioManifest {
  version: number;
  ambience: Record<string, { fallback: string; description: string }>;
  sfx: Record<string, { fallback: string; description: string }>;
  combatCues: Record<string, { fallback: string; description: string }>;
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
  });
});
