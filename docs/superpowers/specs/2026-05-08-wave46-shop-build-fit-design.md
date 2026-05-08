# Wave 46 Shop Build Fit Design

## Goal

Show build-fit guidance on shop card offers so players can judge paid card purchases with the same language used by rewards, deck compass, and run recap.

## Player Value

- The shop becomes a deck-building decision surface instead of a simple price list.
- External EA players can understand whether a paid card reinforces the current style, opens a branch, patches a shortfall, or carries ink risk.
- The feature keeps the recent build-language system consistent across run recap, deck viewer, rewards, and shop cards.

## Scope

In scope:

- Reuse `createRewardBuildFit()` for shop card offers.
- Add `data-testid="shop-build-fit"` and `data-testid="shop-build-fit-detail"` to every shop card button.
- Add compact shop-fit styles that share the reward-fit tone language.
- Extend the existing shop Playwright flow to assert card-fit chips and ink-risk text.
- Keep the work desktop-browser first.

Out of scope:

- Changing shop draft generation, prices, relic offers, card pools, rewards, combat rules, save data, balance, analytics, Steam/storefront/release packaging, new art, or mobile layout work.
- Adding fit chips to relics or delete-card service in this wave. Those choices need a different pure evaluator and can follow later.

## Design

`createShopCardAction()` already receives the `RunState` and the card offer. It will derive the current run deck with `getRunCardDefinitions(run)`, call `createRewardBuildFit(currentDeckCards, card)`, and render the label/detail inside the existing shop card markup.

The shop UI will use dedicated class names (`shop-build-fit`, `shop-build-fit-detail`) while sharing the same tone colors as reward fit through grouped CSS selectors. This keeps the visual system consistent without coupling tests to reward-specific class names.

The browser test will stay inside the existing `"shops can add relics after the first battle"` route. It will assert that travel, role, and ink card offers expose a fit label/detail, and that the ink slot clearly shows `墨灾取势` and `墨痕`.

## Acceptance Criteria

- Every shop card offer renders a build-fit label and detail.
- Shop card buttons expose a stable `data-build-fit-tone` attribute with `main`, `branch`, `utility`, or `risk`.
- Ink shop cards display `墨灾取势` and detail text containing `墨痕`.
- Existing shop card art, chrome, keywords, price chip, affordability data, click purchase behavior, relic offers, and delete-card service behavior remain unchanged.
- No gameplay, economy, persistence, platform, release packaging, art generation, or mobile work is introduced.
