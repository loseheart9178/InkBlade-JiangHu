# Wave 39 Audio Atmosphere Design

## Context

The EA roadmap calls for commercial presentation, including safe BGM, ambience, SFX layers, and complete settings coverage. The current build already has no-op-safe procedural UI/card/victory/defeat tones plus master and music sliders, but the music slider is not used for a persistent ambience layer and there is no separate SFX volume.

Wave 39 should raise perceived quality without introducing external audio files, network dependencies, or brittle browser-autoplay assumptions.

Docs and files read before design:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `src/app/audioFeedback.ts`
- `src/app/settingsPersistence.ts`
- `src/app/inkbladeController.ts`
- `tests/app-settings.test.ts`
- `tests/e2e/playable-flow.spec.ts`

## Approach Chosen

Use procedural WebAudio fallback and an asset manifest instead of adding real audio files. This keeps the browser build self-contained and deterministic while establishing the production-facing audio contract.

Alternatives considered:

- Import generated audio files now: higher presentation value, but requires asset creation and review beyond a small autonomous wave.
- Keep single-shot tones only: lowest risk, but it leaves the roadmap's music/ambience pillar mostly unaddressed.
- Add a full audio mixer abstraction: useful later, but heavier than needed for the current scope.

## Design

Wave 39 adds three layers:

1. **Settings**
   - Extend desktop settings with `sfxVolume`.
   - Keep `masterVolume` as the global multiplier.
   - Use `musicVolume` for ambience.
   - Use `sfxVolume` for UI/card/victory/defeat tones.
   - Keep `muted` as a hard stop for all audio.

2. **Procedural ambience**
   - Extend `AudioFeedback` with `setSurface(surface)` and `stopAmbience()`.
   - Supported surfaces: `title`, `map`, `combat`, `reward`, `event`, `shop`, `rest`, `final`, and `silent`.
   - Each surface maps to a low-volume oscillator profile. This is not final music; it is a safe placeholder ambience bed that proves audio routing.
   - If no `AudioContext` exists, audio remains a no-op.
   - If autoplay keeps the context suspended, calls should remain safe and retry through future user gestures.

3. **Manifest**
   - Add `public/assets/audio/manifest.json` describing final asset slots and procedural fallback ids.
   - Add `public/assets/audio/README.md` documenting that the current runtime uses procedural fallback until final assets arrive.

## Controller Integration

`inkbladeController.ts` should call `audioFeedback.setSurface(...)` after rendering each major screen:

- title overlays/settings remain `title`
- map uses `map`
- combat uses `combat`
- reward/method reward use `reward`
- event/shop/rest use their matching surfaces
- ending/final/result surfaces use `final`

The call should be presentation-only and must not influence run, combat, reward, or save rules.

## Testing

Use RED-first tests:

- `tests/app-settings.test.ts` covers `sfxVolume` normalization, persistence, and settings-shell wiring.
- `tests/audio-feedback.test.ts` uses a fake `AudioContext` to prove SFX respects `sfxVolume`, ambience respects `musicVolume`, and muted settings stop new audio safely.
- `tests/audio-manifest.test.ts` validates manifest shape and required surface/cue ids.
- `tests/e2e/playable-flow.spec.ts` covers the SFX slider and existing settings persistence path.

Browser verification remains Playwright-managed through the Wave 38 runtime fix.

## Out Of Scope

- Final composed music or licensed/recorded audio assets.
- Audio file decoding, streaming, or preload UX.
- Mobile audio policies.
- Steam/storefront/release packaging.
- Gameplay balance or content changes.

## Risks

- Browser autoplay policy means ambience may not audibly begin until a user gesture; this is acceptable as long as calls are safe and state updates after interactions.
- Procedural ambience is a quality bridge, not final sound direction.
- Existing tests run in jsdom, so fake `AudioContext` coverage must focus on routing and safety, not subjective sound.
