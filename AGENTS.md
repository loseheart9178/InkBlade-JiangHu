# AGENTS.md

## Project

《云水江湖》 / Inkblade: Tales of Jianghu is a 2D ink-wash wuxia deckbuilding roguelike. The current development goal is a browser-playable vertical slice inspired by the PRD in `docs/`.

## Collaboration Rules

- Read `Prompt.md`, `Plan.md`, `Implement.md`, and `Documentation.md` before implementation work.
- Before new feature work, story/copy changes, UI art generation, character/enemy art generation, or asset replacement, re-read the relevant `docs/` source files for PRD, gameplay, world/chapter, and character/enemy settings, then record the docs read in `Documentation.md`.
- Keep gameplay rules outside renderer code. Phaser scenes adapt state to visuals; TypeScript systems own combat, cards, map, rewards, and persistence.
- Prefer data-driven content under `src/game/data/` for cards, enemies, characters, relics, events, and map node pools.
- Build in small milestones. Each milestone must update `Documentation.md` with progress, decisions, verification, failures, and next step.
- Use multi-agent work only for independent tasks. Default role flow:
  - PM: scope, acceptance criteria, milestone control.
  - Explorer: read docs/code, identify dependencies and constraints.
  - Builder: implement scoped changes.
  - Tester: run unit, build, lint, and browser playtest checks.
  - Reporter: summarize changed files, verification, risks.
- Do not ask the user for decisions unless external resources or product direction are genuinely blocked. Bias to action with reasonable assumptions.

## Engineering Standards

- Stack: Phaser + TypeScript + Vite, with DOM HUD/menu overlay.
- Current platform priority: desktop landscape browser first. Do not spend implementation time on mobile portrait (`390x844` / 竖屏) layout, mobile input, or mobile screenshot adaptation unless the user explicitly reopens mobile support.
- UI approval and visual QA must judge combat UI kit work against desktop landscape screenshots first, such as `1440x900` or `1280x720`. Existing mobile screenshots are reference artifacts only and must not drive implementation tradeoffs while mobile support is paused.
- Tests: Vitest for deterministic simulation modules. Use test-first for gameplay rules and bug fixes.
- Browser QA: run a local dev server and use Playwright or equivalent browser checks for boot, screenshots, input, and desktop landscape layout. Mobile portrait checks are paused unless explicitly requested.
- File boundaries:
  - `src/game/systems/`: pure gameplay logic.
  - `src/game/data/`: declarative game content.
  - `src/game/scenes/`: Phaser scenes and visual adapters.
  - `src/ui/`: DOM HUD, menus, and overlays.
  - `src/styles/`: theme and layout CSS.
  - `tests/`: unit and browser tests.
- UI style should follow the user reference: ink mountain battlefield, paper texture, red/teal role accents, brush-frame cards, top health bars, bottom hand, readable combat center.

## Output Format

When finishing a milestone, report:

1. What changed.
2. Verification commands and results.
3. Any known gaps or risks.
4. Next milestone.
