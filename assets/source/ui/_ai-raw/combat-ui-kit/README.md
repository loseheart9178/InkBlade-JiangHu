# Combat UI Kit AI Raw Sources

These transparent PNG files are AI-generated source layers for the approved combat UI kit direction.

Approved concept reference:
`docs/superpowers/specs/assets/2026-05-09-combat-ui-kit-concept.png`

The runtime files are not edited directly. Run:

```bash
node scripts/build-combat-ui-kit.mjs
```

Imagegen source sheets:

- `imagegen-icon-sheet-v1.png` - 4x4 imagegen bitmap sheet for map, shop, event, rest, boss, resources, and statuses.
- `imagegen-hud-sheet-v1.png` - 2x3 imagegen bitmap sheet for player/enemy HUD frames, hand shelf, energy orb, intent crest, and pile seal.

The builder preserves these files and never regenerates or overwrites raw AI sources. It normalizes them into layered PSD sources, transparent runtime PNG slices, and `assets/source/ui/combat-hud/combat-ui-kit-manifest.json`.
