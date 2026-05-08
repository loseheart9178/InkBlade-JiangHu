# Post-EA Autonomous Commercial Polish Roadmap

Date: 2026-05-08 Asia/Shanghai
Baseline branch: `codex/wave47-relic-fit-system`
Baseline commit: `3673103`

## Status

Wave 58 closed the EA visual QA gate. The build is already suitable for external EA visual/playtest review: TypeScript, Vitest, Vite build, full Chromium e2e, visual smoke, asset audit, balance report, and handoff report were green at closeout.

Further autonomous work should therefore be tracked as post-EA commercial polish rather than EA blockers. The goal is to keep improving screenshot quality and production feel without expanding gameplay scope.

## Reference Direction From Night-Patrol

The reference repo at `https://github.com/op7418/Night-Patrol.git` uses a useful commercial deckbuilder language:

- Full-screen scene surfaces instead of utility-page layouts.
- Heavy top HUD with icon chips, strong resource hierarchy, and layered shadows.
- Thick illustrated card frames with cost gems, art windows, type plaques, and strong hover/drag feedback.
- Combat stage split into background scene, actors, HUD plaques, target ghosts, bursts, energy orb, piles, and hand fan.
- Reward/shop/event/rest screens use scene wrappers and dense repeated cards rather than blank panels.
- Victory/transition screens use composed actors, slash overlays, caption cards, and settlement panels.

For InkBlade, translate these patterns into ancient wuxia ink-wash jianghu style: xuan paper texture, black ink, jade/teal guard light, cinnabar strike marks, restrained gold accents, brushwork borders, and no modern shrine/ghost-horror literal copying.

## Remaining Waves

Eight post-EA waves are planned after Wave 58: Wave 59 through Wave 66.

### Wave 59: High-Priority Common Card Art Polish

Replace the next severe duplicate/low-resolution common card faces from the quality queue:

- `common_lockstep`
- `common_old_wine`
- `common_paper_ward`
- `common_rain_cut`
- `common_pifeng`
- `common_tuna`
- `common_mirror_armor`
- `common_zhuiying`

Gate: asset audit clean, card-art quality report improved, card-art tests and content tests green, visual smoke green.

### Wave 60: Commercial Card Frame And Hand Presentation

Rebuild card chrome toward a premium deckbuilder surface:

- Cost medallion / ink-jade resource seal.
- Bigger, better protected art window.
- Stronger type plaque and rarity treatment.
- Fan hand spacing with stable hover, drag, disabled, and playable states.
- Card text no-overlap checks at desktop and mobile widths.

Gate: card screenshots readable, no text clipping, hand interaction e2e green.

### Wave 61: Combat HUD And Feedback Layer

Upgrade battle readability and feedback:

- Icon resource chips, intent plaque, status badges, deck/discard piles, and target ghosts.
- Stronger card play impact, hit pulse, block gain, status application, and enemy action timing.
- Reduced-motion parity for every feedback state.

Gate: combat visual smoke captures clear before/after state changes, playable-flow green.

### Wave 62: Scene Surfaces V2

Deepen reward, shop, event, rest, compendium, and run summary screens:

- Merchant/rest/event backgrounds or generated stills where useful.
- Better section hierarchy for cards/relics/services/choices.
- Settlement affordances for skip/leave/confirm actions.

Gate: reward/shop/event/rest flows unchanged, no-overlap browser checks green.

### Wave 63: Title, Loading, Map, And Transition Cinematics

Make the route feel authored:

- First-viewport title/background treatment.
- Loading brush-thread transition.
- Route map node and path polish.
- Chapter entry, victory, defeat, and elite/boss settlement composition.

Gate: full route flow green, transition does not race save/continue logic.

### Wave 64: Remaining Card Art And Asset Ledger

Continue replacing visible placeholder groups:

- Starter low-resolution cards.
- Ink/mind/status vector placeholders.
- Signature card duplicate groups.
- Report clear final/deferred asset classes.

Gate: no severe bad-crop/runtime duplicate remains in the top quality queue.

### Wave 65: Responsive, Accessibility, And Performance QA

Harden the polished UI:

- Desktop and mobile no-overlap screenshots.
- Reduced-motion pass.
- Keyboard/focus pass for important controls.
- Asset-size and build chunk budget review.

Gate: TypeScript, unit, build, visual smoke, full Chromium e2e, and targeted mobile screenshots green.

### Wave 66: Post-EA Candidate Gate

Run the release-style closeout again after the post-EA polish:

- Full audit, tests, build, balance, handoff, screenshots, and documentation refresh.
- Known risks and deferred backlog.
- Stop rule for the next external review candidate.

Gate: all automated verification passes or blockers are fixed/documented.

## Execution Model

- Use one dedicated worktree per wave.
- Dispatch subagents for independent work when usage allows; if subagent quota is unavailable, continue locally without blocking.
- Merge only after the wave acceptance gate is green.
- Remove the completed worktree after merge.

