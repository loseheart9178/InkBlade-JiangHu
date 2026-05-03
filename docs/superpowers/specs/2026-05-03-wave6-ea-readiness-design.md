# Wave 6 EA Readiness Design

## Context

Wave 5 accepted the desktop MVP polish gate: chapter battlefields switch correctly, the final Boss route is playable in browser QA, settings persist separately from run saves, and the generated asset audit now reports 56 non-blocking card-art fallback entries. The next autonomous wave should improve first public-demo readiness without reopening mobile work.

## Goals

- Replace the most visible starter and common card-art fallbacks with dedicated GPT Image 2 style runtime assets.
- Add a real terminal choice after the final Boss so endings feel like a player decision rather than a hidden evaluator only.
- Add a desktop compendium surface that helps players inspect cards, relics, enemies, combos, and unlocked story fragments.
- Add keyword and intent explanations in combat/reward/deck surfaces so the dense card game remains learnable.
- Reduce or isolate the current Vite large chunk warning by splitting the Phaser/game boot boundary where practical.

## Non-Goals

- Mobile layout, touch adaptation, Steam packaging, daily challenge, achievements, localization, or full production music.
- Replacing all 56 card-art fallbacks in one pass.
- Rewriting the renderer or moving gameplay rules into DOM/Phaser code.
- Building a full content editor.

## Design

### GPT Image 2 Starter And Common Card Art Batch

Use the Wave 5 `cardFallbackDebt` ledger to target two high-visibility groups first: starter readability cards and the common foundation batch. The runtime output should be card-safe crops under `public/assets/generated/cards/`, with untouched source sheets preserved under `public/assets/generated/sources/`. `src/game/content/visuals.ts` remains the only manifest binding. The audit must keep `missing` empty and should shrink `cardFallbackDebt`.

### Final Choice And Character Epilogue

After `无名史官` is defeated, route to a `finalChoice` state before evaluating the ending. The choices mirror the final-chapter doc: seal, burn, rewrite, heart-demon, and hidden wu when the run qualifies. The chosen world ending should still respect eligibility, while character epilogues are selected from run character plus mind/ink tendencies. Profile persistence records both the world ending and character epilogue.

### Desktop Compendium

Add a title/run entry for `墨录图鉴`. The first version is read-only and data-driven: cards, relics, enemies, combos, and story fragments. It should use compact tabs and filters, not a large landing page. During a run, it should preserve the run and return to the prior screen.

### Keyword And Intent Glossary

Create a small data module for keyword, status, card type, combo, and enemy intent explanations. Render concise inline chips or `title`/`aria-label` assisted tooltips on hand cards, reward cards, deck viewer cards, enemy intents, and combo trail entries. The implementation should be CSS/DOM-only and respect reduced motion.

### Boot Performance Split

The current build is accepted but emits a large chunk warning. Split app boot so Phaser and the controller/runtime are dynamically imported after the root shell initializes. Preserve all tests and e2e flows. If code splitting removes the warning, keep it; if Vite still reports a warning because Phaser remains large in its own chunk, document the new chunk boundary and raise the warning limit only with evidence.

## Testing

Final gate for Wave 6:

```bash
node scripts/audit-generated-assets.mjs
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Task-specific gates:

- Card art: `node scripts/audit-generated-assets.mjs`, `npm test -- tests/data/content.test.ts`, visual smoke.
- Final choice: ending/run/profile unit tests and a final-route e2e.
- Compendium: pure content tests and Playwright open/filter/return coverage.
- Glossary: unit coverage for glossary lookup and browser checks for tooltip attributes.
- Performance split: build output review plus boot/playable e2e.

## Approved Assumption

The user explicitly granted autonomous planning and execution authority. This design is treated as approved for implementation without a confirmation stop unless an external resource blocks progress.
