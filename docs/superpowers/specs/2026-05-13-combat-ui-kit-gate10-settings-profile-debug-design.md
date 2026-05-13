# Combat UI Kit Gate10: Settings / Profile / Debug Shells

## Goal

Bring the non-combat utility shells into the same UI kit language as the main route, reward, event, rest, transition, and archive surfaces.

## Scope

- Title settings overlay.
- Title debug buttons.
- Debug profile/run summary shell.
- Profile goal cards, best-run strip, recent run ledger, and shell actions.

## Non-Goals

- No changes to settings persistence, profile goal evaluation, run ledger data, or debug route behavior.
- No changes to public debug visibility rules.
- No map, title, result, compendium, reward, event, or combat changes beyond shared shell styling hooks.
- No bitmap asset generation in this gate.

## Acceptance

- Focused Playwright coverage proves settings, debug, profile goals, and ledger surfaces expose Gate10 UI kit hooks.
- Public builds still hide debug shortcuts.
- Full verification remains green after merge.
