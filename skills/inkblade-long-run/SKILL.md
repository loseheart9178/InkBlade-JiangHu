---
name: inkblade-long-run
description: Long-running autonomous development workflow for InkBlade-JiangHu.
---

# InkBlade Long-Run Workflow

Use this when continuing development on 《云水江湖》.

## Inputs

Read these first:

1. `AGENTS.md`
2. `Prompt.md`
3. `Plan.md`
4. `Implement.md`
5. `Documentation.md`
6. Relevant `docs/` files whenever changing features, story/copy, UI, character/enemy art, or generated assets.

## Loop

1. Pick the first unchecked milestone step in `Plan.md`.
2. Confirm whether it needs Explorer, Builder, Tester, or Reporter work.
3. Execute the smallest verifiable slice.
4. Run the milestone verification command.
5. Fix failures by root-cause investigation.
6. Update `Documentation.md`.
7. Commit verified milestone changes when git is available.
8. Continue unless blocked by an external dependency.

## Guardrails

- Preserve gameplay/renderer separation.
- Re-read relevant `docs/` settings before feature, story, UI, or art work and log the docs read in `Documentation.md`.
- Prefer tests for rules and browser checks for UX.
- Keep visual style close to ink-wash wuxia: xuan paper, ink mountains, brush strokes, red and teal accents.
- Avoid expanding scope into full EA content before the playable loop is proven.
