import { expect, test } from "@playwright/test";

test("captures desktop and mobile combat smoke screenshots", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /zhaoyun-standee-gpt-cutout\.png$/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /ink-bandit-standee-gpt-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
  await expect(page.getByTestId("card-art").first()).toHaveAttribute("src", /^\/assets\/generated\/cards\/.+\.png$/);
  await expect(page.getByTestId("card-art").first()).toHaveCSS("object-fit", "contain");
  await page.screenshot({ path: testInfo.outputPath("combat-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("character-diaochan").click();
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /diaochan-standee-gpt\.png$/);
  await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("combat-mobile.png"), fullPage: true });
});
