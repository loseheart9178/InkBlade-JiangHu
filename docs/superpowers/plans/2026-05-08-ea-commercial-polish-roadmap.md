# EA Commercial Polish Roadmap

**Decision date:** 2026-05-08 Asia/Shanghai

**Current baseline:** Wave 52 has started the commercial UI foundation after Wave 47-51 closed core EA content and reward-screen verification.

**Remaining waves to EA visual closeout:** 6 waves.

The remaining EA work should stop expanding raw gameplay content unless a blocker appears. The goal is to make the existing 150-card / 40-relic / 45-event EA build feel commercially presentable: stronger card faces, clearer combat feedback, richer scene surfaces, better transitions, and screenshot-gated QA.

## Wave 53: Card Art Quality Audit And Priority Replacements

**Goal:** Turn the user's card-art complaints into a measurable asset pipeline before generating replacements.

**Scope:**

- Add a card-art quality audit that reports duplicate art reuse, missing unique art, tiny/odd image dimensions, source-sheet leftovers, and suspicious crop ratios.
- Produce a ranked replacement queue for starter cards, common staples, signature rares, ink/status cards, and visibly bad crops.
- Generate the first priority replacement batch with `gpt-image-2`, saved into project assets with stable filenames.
- Wire replacements through `src/game/content/visuals.ts` or card-art modules without breaking existing fallback-zero guarantees.

**Acceptance gate:**

- Asset audit still reports `missing: 0` and `card fallback debt: 0`.
- New quality audit produces a markdown/JSON report with an explicit remaining queue.
- At least the worst visible card-art offenders are replaced and visible in combat/reward screenshots.

## Wave 54: Combat Feedback And Targeting Presentation

**Goal:** Make combat feel responsive and readable, closer to a commercial deckbuilder combat surface.

**Scope:**

- Add richer play feedback for card click/play states: target highlight, release/impact pulse, unavailable-state explanation, and stronger enemy/player hit timing.
- Improve intent readability as an in-world plaque with severity treatment for attack/block/special.
- Strengthen card hover/active states without covering the playfield.
- Add or extend Playwright checks for combat layout, no overlap, and visible feedback after card play/end turn.

**Acceptance gate:**

- Combat screenshots show clear state change after player attack and enemy attack.
- Existing playable-flow and visual-smoke suites pass.
- Reduced-motion setting remains respected for nonessential animation.

## Wave 55: Reward, Shop, Event, And Rest Scene Surfaces

**Goal:** Make non-combat screens feel like game scenes rather than utility panels.

**Scope:**

- Rework reward screen into a scroll/case presentation with stronger pick/skip hierarchy.
- Rework shop into a tea-house/jianghu merchant scene with clearer card/relic/service sections.
- Rework events/rest into illustrated scene surfaces with compact decision cards and readable consequences.
- Keep current reward-fit, shop-fit, relic-fit, event effects, and rest actions intact.

**Acceptance gate:**

- Reward/shop/event/rest screenshots pass no-overlap checks at desktop viewports.
- Shop purchase, relic purchase, remove service, reward skip, event choices, and rest upgrade behavior remain unchanged.

## Wave 56: Route, Victory, Defeat, And Chapter Transition Cinematics

**Goal:** Add short presentational beats around major state changes so the EA route feels authored.

**Scope:**

- Add transition treatment when entering combat, leaving combat, claiming spoils, entering new chapters, and ending runs.
- Add victory/defeat settlement panels with stronger composition and concise run-state details.
- Improve boss/chapter reward continuation as a deliberate scene change.
- Prefer CSS/DOM motion and existing/generated stills before adding heavier video assets.

**Acceptance gate:**

- Transitions do not block or race existing save/continue flows.
- Full first-chapter route and final-boss route Playwright tests pass.
- Reduced-motion users still get clear state changes without heavy animation.

## Wave 57: Bulk Generated Art Replacement And Asset Ledger Cleanup

**Goal:** Finish the high-impact card-art pass and leave a maintainable art ledger for EA.

**Scope:**

- Use Wave 53's queue to generate additional `gpt-image-2` card art batches.
- Prioritize visible player-facing cards over low-frequency or debug-only content.
- Replace remaining bad crop/sheet artifacts and retire unused duplicate assets when safe.
- Update asset reports and documentation so future waves know which assets are final, placeholder, or deferred.

**Acceptance gate:**

- No known severe card-crop bugs remain in the ranked queue.
- Card art report separates final EA art from acceptable placeholders and post-EA backlog.
- Runtime asset audit remains clean.

## Wave 58: EA Visual QA Gate And Release Closeout

**Goal:** Stop polishing by taste and close the EA build with repeatable gates.

**Scope:**

- Add/refresh screenshot gates for title, map, combat, reward, shop, event, rest, compendium, run summary, victory, and defeat.
- Run full TypeScript, unit, build, asset audit, balance report, handoff report, visual smoke, and playable-flow verification.
- Write the EA visual closeout report with known residual risks and post-EA backlog.
- Do not start new features unless they fix release-blocking visual or interaction bugs.

**Acceptance gate:**

- All automated verification passes or documented blockers are fixed.
- EA closeout report states the build is ready for external visual/playtest review.
- Remaining work is explicitly moved to post-EA backlog.

## Stop Rule

After Wave 58, stop autonomous polishing unless verification exposes a release blocker. Further work should be treated as post-EA polish, not EA closeout.
