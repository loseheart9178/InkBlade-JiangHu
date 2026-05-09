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

## Progress

- Wave 59 is complete: eight high-priority common card faces were generated, normalized, bound, audited, and merged.
- Wave 60 is complete: combat/reward/shop/deck card frames now share a premium ink-wash card language with accessible cost seals and browser layout gates.
- Wave 61 is complete: combat resource/status/intent/pile/target feedback HUD surfaces now use clearer ink-wash chips with browser layout gates.
- Wave 62 is complete: reward/shop/event/rest scene surfaces now share explicit scene headers, richer paper layers, and browser header/no-overlap gates.
- Wave 63 is complete: title route ledger, route cinematic header, journey strip, route-map visual polish, and transition cinematic rail now have focused Playwright assertions.
- Wave 64 is complete: the top 14 low-resolution starter/common card faces were replaced by 512x768 generated PNGs, the asset audit now counts `*-gpt2.png` runtime assets, and the card-art quality report has 0 dimension/crop signals.

## Remaining Waves

Eight post-EA waves were planned after Wave 58: Wave 59 through Wave 66. After Wave 64, two remain: Wave 65 through Wave 66.

### Wave 59: High-Priority Common Card Art Polish

Status: complete.

Replaced the next severe duplicate/low-resolution common card faces from the quality queue:

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

Status: complete.

Rebuilt card chrome toward a premium deckbuilder surface:

- Cost medallion / ink-jade resource seal.
- Bigger, better protected art window.
- Stronger type plaque and rarity treatment.
- Fan hand spacing with stable hover, drag, disabled, and playable states.
- Card text no-overlap checks at desktop and mobile widths.

Gate: passed. Visual smoke, targeted reward/shop/deck playable-flow checks, TypeScript, Vitest, Vite build, and `git diff --check` are green.

### Wave 61: Combat HUD And Feedback Layer

Status: complete.

Upgraded battle readability and feedback:

- Icon resource chips, intent plaque, status badges, deck/discard piles, and target ghosts.
- Stronger card play impact, hit pulse, block gain, status application, and enemy action timing.
- Reduced-motion parity for every feedback state.

Gate: passed. Visual smoke, targeted status/route playable-flow checks, TypeScript, Vitest, Vite build, and `git diff --check` are green.

### Wave 62: Scene Surfaces V2

Status: complete.

Deepened reward, shop, event, and rest scene surfaces:

- Reusable scene headers for reward, shop, event, and rest.
- Stronger section hierarchy for reward cards, shop cards/relics/services, event choices, and rest actions.
- More authored paper/ink background layering while preserving existing settlement affordances.

Gate: passed. Reward/shop/event/rest browser flows, scene-header assertions, TypeScript, Vitest, Vite build, and `git diff --check` are green.

### Wave 63: Title, Loading, Map, And Transition Cinematics

Status: complete.

Make the route feel authored:

- First-viewport title/background treatment, including a visible route ledger for the four chapter beats.
- Route map cinematic header and journey strip that keep the current chapter and upcoming route readable.
- Route map node, path, line-report, and progress polish without regressing existing risk/reward previews.
- Chapter entry, victory, defeat, and elite/boss settlement composition, including a transition cinematic rail.

Gate: full route flow green, visual smoke green, transition does not race save/continue logic.

### Wave 64: Remaining Card Art And Asset Ledger

Status: complete.

Replaced the severe low-resolution/crop findings at the top of the quality queue:

- Starter low-resolution cards: `zhao_strike`, `zhao_guard`, `zhao_longdan`, `diao_strike`, `diao_guard`, `diao_lingbo`, `cai_plain_strike`, `cai_pluck_string`, `cai_gong_tone`, `zhuge_fan_strike`, and `zhuge_guard`.
- Common low-resolution cards: `common_duanzhu`, `common_feishi`, and `common_xieli`.
- Asset ledger accounting now counts generated files with either a `gpt2-` prefix or a `-gpt2` suffix.
- The remaining top queue is now ink/mind/status vector placeholders, duplicate signature-card reuse, and three generic early card assets rather than bad crops.

Gate: passed. Asset audit is clean, card-art quality report shows 0 dimension/crop signals, targeted data tests, full Vitest, TypeScript, Vite build, and visual smoke are green.

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
