# Wave 47 Relic Build Fit Design

## Goal

Add build-fit guidance for shop relic offers so players can judge long-term passive purchases with the same readable build language used by cards.

## Player Value

- Relics are central to the EA promise of changing a run's martial direction, but shop relics currently rely on raw trigger text and price.
- Players can see whether a relic strengthens the current archetype, opens a character branch, supports ink/mind-state play, or simply adds general stability.
- This continues the Wave45 and Wave46 build-language pass across another high-value decision surface.

## Scope

In scope:

- A pure `createRelicBuildFit()` helper under `src/game/systems/relics/`.
- Unit tests for matching archetype, character branch, ink-risk, mind-state support, generic utility, and empty-deck opening direction.
- Shop relic UI chips/details using `data-testid="shop-relic-fit"` and `data-testid="shop-relic-fit-detail"`.
- Focused desktop Playwright coverage in the existing shop flow.

Out of scope:

- Changing relic content, relic trigger behavior, relic pools, prices, shop generation, combat, save data, balance, analytics, Steam/storefront/release packaging, new art, or mobile layout work.
- Replacing relic descriptions or the existing source/rarity labels.

## Design

`createRelicBuildFit(currentDeck, characterId, relic)` will derive a short label, detail, and tone from explicit relic metadata first:

- `relic.archetypeId` compared with the current deck's top archetype.
- `relic.character` compared with the current run character.
- `triggerText` and `description` signal ink or mind-state support using stable Chinese keywords already present in relic data.

The helper will not mutate inputs and will not inspect renderer state. It will return tones compatible with the card fit language: `main`, `branch`, `utility`, and `risk`.

The app controller will adapt each shop relic offer with the current run deck and `run.characterId`, then render a fit chip/detail inside the existing relic button. CSS will share the same tone palette as reward/shop card fit through grouped selectors while keeping relic-specific class names for test clarity.

## Acceptance Criteria

- Matching current deck archetype relics return `流派共鸣` with `main` tone.
- Off-archetype same-character relics return `本命支路` with `branch` tone.
- Ink-support relics return `墨灾奇物` with `risk` tone and detail mentioning `墨痕`.
- Mind-state relics return `心境辅佐` with `utility` tone.
- Generic relics return `通用稳固` with `utility` tone.
- Empty-deck archetype relics return `开局法门` with `utility` tone.
- Every shop relic offer renders fit label/detail and exposes `data-build-fit-tone`.
- Existing relic source/rarity text, trigger text, description, price chip, owned/affordable state, and purchase behavior remain unchanged.
