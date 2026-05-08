# Wave 53 Card Art Quality Plan

**Goal:** Convert card-face quality complaints into a measurable replacement pipeline before generating new art.

## Implemented Scope

- Added `scripts/card-art-quality-report.mjs`.
- Added `tests/data/card-art-quality-report.test.ts`.
- Generated `reports/card-art-quality-report.json`.
- Generated `reports/card-art-quality-report.md`.

## Audit Coverage

- Card art binding coverage for the 150-card EA pool.
- Duplicate asset reuse groups and cards affected.
- Fallback/default/generic early card asset signals.
- PNG/SVG format distribution.
- PNG dimensions, SVG dimensions when parseable, low-resolution flags, and aspect-ratio flags.
- Suspicious source-sheet/crop naming signals.
- Runtime asset audit totals.
- Ranked replacement queue for starter/common/signature/ink/status/duplicate/low-resolution/vector-placeholder cards.

## Findings

- Runtime missing files: 0.
- Runtime card fallback debt: 0.
- Direct card art bindings: 150 / 150.
- Duplicate asset groups: 37.
- Dimension/crop signals: 28.
- Replacement queue entries: 150.
- Highest-priority replacements are low-resolution common/starter Wave21 assets and duplicate-reused ink/status/vector placeholder cards.

## Non-goals

- No new `gpt-image-2` images generated in this wave.
- No art wiring changed.
- No combat, reward, relic, save, or balance logic changed.

## Verification

```text
/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/card-art-quality-report.mjs
Result: passed; reports generated.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run tests/data/card-art-quality-report.test.ts --reporter=dot
Result: passed, 1 file / 1 test.

/Users/lushihao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/audit-generated-assets.mjs
Result: missing 0, ink-pass debt 0, card fallback debt 0.
```

## Next Step

Use the top of `reports/card-art-quality-report.md` as the Wave57 generation queue. The first generated batch should prioritize common low-resolution duplicates, starter low-resolution cards, and high-visibility signature cards.
