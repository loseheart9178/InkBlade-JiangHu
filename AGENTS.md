# AGENTS.md

## Project

《云水江湖》 / Inkblade: Tales of Jianghu is a 2D ink-wash wuxia deckbuilding roguelike. The current development goal is a browser-playable vertical slice inspired by the PRD in `docs/`.

## Collaboration Rules

- Read `Prompt.md`, `Plan.md`, `Implement.md`, and `Documentation.md` before implementation work.
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
- Tests: Vitest for deterministic simulation modules. Use test-first for gameplay rules and bug fixes.
- Browser QA: run a local dev server and use Playwright or equivalent browser checks for boot, screenshots, input, and responsive layout.
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

