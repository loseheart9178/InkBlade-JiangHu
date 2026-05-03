import { expect, test } from "@playwright/test";

test("captures desktop combat smoke screenshots for Zhao Yun and Diao Chan", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /zhaoyun-standee-gpt-v2-cutout\.png$/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-ink-bandit-standee-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
  await expect(page.getByTestId("card-art").first()).toHaveAttribute("src", /^\/assets\/generated\/cards\/.+\.png$/);
  await expect(page.getByTestId("card-art").first()).toHaveCSS("object-fit", "contain");
  await expect(page.getByTestId("card-type-badge").first()).toBeVisible();
  await expect(page.getByTestId("card-rarity-mark").first()).toBeVisible();
  await expect(page.getByTestId("card-keyword-row").first()).toBeVisible();
  await expect(page.getByTestId("combo-trail")).toContainText("待发");

  await expectDesktopCombatLayout(page);

  await page.getByTestId("end-turn").click();
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCSS("background-image", /ink-bandit-attack-strip-gpt-v2\.png/);

  const playableAttack = page.locator(".combat-card:not([disabled])").filter({ hasText: "攻" }).first();
  await playableAttack.click();
  await expect(page.getByTestId("combat-sprite-player")).toHaveCSS("background-image", /zhaoyun-attack-strip-gpt-v2\.png/);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
  await expect(page.getByTestId("combat-vfx-slash")).toHaveCount(0);
  await expect(page.getByTestId("combat-vfx-sigil")).toHaveCount(0);
  await expect(page.getByTestId("combat-vfx-seal")).toHaveCount(0);
  await expect(page.getByTestId("combat-vfx-ink")).toHaveCount(0);
  await expect(page.getByTestId("combo-trail")).toContainText("攻");
  await page.screenshot({ path: testInfo.outputPath("combat-zhaoyun-desktop.png"), fullPage: true });

  await page.goto("/");
  await page.getByTestId("character-diaochan").click();
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /diaochan-standee-gpt-v2-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("combat-diaochan-desktop.png"), fullPage: true });
});

async function expectDesktopCombatLayout(page: import("@playwright/test").Page) {
  const playerStandee = await page.getByTestId("combat-standee-player").boundingBox();
  const enemyStandee = await page.getByTestId("combat-standee-enemy").boundingBox();
  const handZone = await page.getByTestId("hand-zone").boundingBox();
  const energy = await page.getByTestId("energy").boundingBox();
  const firstCard = await page.locator(".combat-card").first().boundingBox();

  expect(playerStandee).not.toBeNull();
  expect(enemyStandee).not.toBeNull();
  expect(handZone).not.toBeNull();
  expect(energy).not.toBeNull();
  expect(firstCard).not.toBeNull();

  expect(playerStandee!.y + playerStandee!.height).toBeLessThan(handZone!.y + 8);
  expect(enemyStandee!.y + enemyStandee!.height).toBeLessThan(handZone!.y + 8);
  expect(firstCard!.x - (energy!.x + energy!.width)).toBeGreaterThanOrEqual(28);
}
