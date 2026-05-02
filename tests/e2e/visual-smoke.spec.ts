import { expect, test } from "@playwright/test";

test("captures desktop combat smoke screenshots for Zhao Yun and Diao Chan", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /zhaoyun-standee-gpt-v2-cutout\.png$/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /ink-bandit-standee-gpt-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
  await expect(page.getByTestId("card-art").first()).toHaveAttribute("src", /^\/assets\/generated\/cards\/.+\.png$/);
  await expect(page.getByTestId("card-art").first()).toHaveCSS("object-fit", "contain");

  const playableAttack = page.locator(".combat-card:not([disabled])").filter({ hasText: "攻" }).first();
  await playableAttack.click();
  await expect(page.getByTestId("combat-sprite-player")).toHaveCSS("background-image", /zhaoyun-attack-strip-gpt-v2\.png/);
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
