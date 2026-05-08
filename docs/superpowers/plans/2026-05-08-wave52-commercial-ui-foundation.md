# Wave 52 Commercial UI Foundation Plan

**Goal:** Move the EA build from functional prototype UI toward a commercial ink-wash wuxia presentation layer, using Night Patrol as interaction/layout inspiration while keeping 云水江湖's own art direction.

## Design Direction

- Material language: 宣纸、墨线、朱砂印、青绿玉、旧金属，不引入 Night Patrol 的暗黑寺庙资产或风格。
- Combat read: top HUD as a compact battle plaque, center playfield protected, bottom hand as a physical card tray.
- Card read: every card should feel like a real paper/talisman object with a frame, cost seal, art window, rarity/type marks, and stable text areas.
- Motion tone: restrained wuxia impact, stronger only on play, hit, reward, defeat, transition.

## Scope

- [x] Add shared ink-wash theme variables and material tokens.
- [x] Redesign combat HUD plaques, HP meters, intent block, energy orb, and hand tray with richer materials.
- [x] Upgrade combat/reward/shop/deck card CSS so existing markup reads as framed cards.
- [ ] Add card-art quality audit for duplicate reuse, tiny source art, and suspicious sheet-slice dimensions.
- [ ] Generate or replace a first high-priority card-art batch with `gpt-image-2` once the audit identifies worst offenders.
- [ ] Add screenshot-based visual acceptance gates for desktop combat, reward, shop, and deck overlay.

## Non-goals

- Do not copy Night Patrol assets, code, names, or copyrighted card frames.
- Do not rebalance gameplay.
- Do not replace all 150 card arts blindly before the audit.
- Do not introduce mobile-first layout refactors in this wave.

## Next Waves

See the committed EA closeout roadmap: `docs/superpowers/plans/2026-05-08-ea-commercial-polish-roadmap.md`.

Remaining waves after Wave 52: **6 waves**.

- Wave 53: card-art audit and top-priority replacements.
- Wave 54: combat feedback, targeting affordances, and richer play/release states.
- Wave 55: reward/shop/event/rest scene surfaces.
- Wave 56: victory/defeat/route transition cinematics.
- Wave 57: bulk generated art replacement and asset ledger cleanup.
- Wave 58: EA visual QA gate and release-readiness screenshots.
