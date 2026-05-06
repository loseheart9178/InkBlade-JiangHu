# Wave 37 Title And Character Select Polish Design

## Context

Wave 36 added lightweight teaching hints across map, combat, reward, and method screens. The next EA showcase gap is the first screen: the current title menu is usable but sparse, and character buttons only show names. External players should understand the four playable roles before they enter the map.

Docs read before design:

- `AGENTS.md`
- `Prompt.md`
- `Plan.md`
- `Implement.md`
- `Documentation.md`
- `docs/superpowers/plans/2026-05-05-ea-playable-showcase-roadmap.md`
- `docs/playtest/alpha-acceptance.md`
- `docs/yunshui_game_prd_v1.md`
- `docs/云水江湖_游戏核心玩法机制文档_v1.0.md`
- `src/app/appShell.ts`
- `src/styles/theme.css`
- `tests/e2e/visual-smoke.spec.ts`

## Approach Chosen

Use a focused title/character-select polish pass rather than a broad all-screen redesign. This is the lowest-risk commercial presentation improvement because it does not touch gameplay systems, save data, rewards, or combat state. It also creates reusable visual-smoke assertions for non-combat UI surfaces.

Alternatives considered:

- Full all-screen UI restyle: higher impact but too broad for one autonomous wave and likely to create unrelated regressions.
- Art generation pass: valuable later, but first-screen readability can improve without waiting for new bitmap assets.
- Tutorial flow expansion: Wave 36 already addressed first-time teaching, so another teaching wave would duplicate recent work.

## Design

The title screen remains the first actionable surface. It should keep the existing title, subtitle, character selection, start/continue/clear actions, settings, and compendium actions. The improvement is richer hierarchy:

- Add a small title kicker that frames the build as a playable ink-wash roguelike showcase without Steam/release wording.
- Convert character buttons into compact paper cards with name, resource, mechanic identity, HP, and starter deck size.
- Preserve `data-testid="character-${id}"` and current selected-state behavior.
- Keep button controls stable: no extra modal, no intro animation, no carousel.
- Use existing red/teal/gold/ink palette, paper texture, 6-8px radii, and desktop-first constraints.

## Data Contract

`src/app/appShell.ts` can keep a small presentation-only metadata map keyed by character id:

- Zhao Yun: 枪势 / 破阵连攻 / 孤勇护主
- Diao Chan: 舞势 / 魅惑闪避 / 宫灯离间
- Cai Wenji: 音律 / 净化余韵 / 琴音续势
- Zhuge Liang: 筹策 / 观星布阵 / 借风控局

This metadata is UI copy only. Combat rules remain in systems and character numeric data remains sourced from `characterList`.

## Testing

Add a Playwright visual-smoke test for the title surface:

- Boot desktop title.
- Assert all four character cards are visible.
- Assert each card exposes resource/mechanic/stat text and remains a real button.
- Assert title actions do not overlap character cards.
- Assert key character-card text elements do not overflow their containers.
- Capture a desktop screenshot attachment.

Focused verification:

```bash
/mnt/c/Users/loseheart/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe ./node_modules/@playwright/test/cli.js test tests/e2e/visual-smoke.spec.ts --grep "title character select"
```

Full verification remains TypeScript, build, full visual smoke, and full playable flow.

## Out Of Scope

- Steam/storefront/release packaging.
- Mobile-specific layout.
- New gameplay rules or balance changes.
- New generated bitmap art.
- Reworking existing settings, compendium, map, reward, shop, or combat flows.

## Risks

- The title screen currently uses buttons as character choices, so richer nested markup must remain accessible and clickable.
- Longer Chinese labels can overflow if the grid is too dense; visual-smoke text-fit assertions are required.
