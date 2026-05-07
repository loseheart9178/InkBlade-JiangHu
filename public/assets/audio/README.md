# Inkblade Audio Manifest

Wave 39 keeps the browser showcase self-contained: the runtime uses procedural WebAudio fallbacks and does not require external audio files.

`manifest.json` reserves the final asset slots for ambience beds and SFX cues. Each entry includes a `procedural:*` fallback id that maps to the current generated tone or ambience behavior in `src/app/audioFeedback.ts`.

Future audio production can replace these slots with authored files while preserving the same surface and cue ids:

- `ambience`: title, map, combat, reward, event, shop, rest, final.
- `sfx`: ui, card, victory, defeat, final-choice.
- `combatCues`: hit, block, status, turn.

The `silent` surface is runtime-only and intentionally omitted from the manifest because it stops ambience instead of playing an asset.
