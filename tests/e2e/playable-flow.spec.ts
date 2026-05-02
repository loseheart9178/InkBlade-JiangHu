import { expect, test } from "@playwright/test";

test("boots, enters a Zhao Yun battle, wins, and returns to the route map", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("云水江湖")).toBeVisible();
  await page.getByTestId("character-zhaoyun").click();
  await page.getByTestId("start-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("energy")).toBeVisible();
  await expect(page.getByTestId("player-hp")).toContainText("赵云");
  await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");

  for (let step = 0; step < 24; step += 1) {
    if (await page.getByTestId("screen-reward").isVisible().catch(() => false)) {
      break;
    }

    const playable = page.locator(".combat-card:not([disabled])");
    const count = await playable.count();
    if (count > 0) {
      await playable.first().click();
      continue;
    }

    if (await page.getByTestId("screen-reward").isVisible().catch(() => false)) {
      break;
    }

    await page.getByTestId("end-turn").click();
  }

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await page.getByTestId("reward-card").first().click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
});
