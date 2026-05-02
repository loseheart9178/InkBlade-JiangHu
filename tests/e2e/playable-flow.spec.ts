import { expect, type Page, test } from "@playwright/test";

test("boots, enters a Zhao Yun battle, wins, and returns to the route map", async ({ page }) => {
  await startRun(page, "zhaoyun");

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toBeVisible();
  await expect(page.getByTestId("deck-card")).toHaveCount(10);
  await expect(page.getByTestId("deck-viewer")).toContainText("枪击");
  await page.getByTestId("deck-close").click();
  await expect(page.getByTestId("deck-viewer")).toBeHidden();
  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("energy")).toBeVisible();
  await expect(page.getByTestId("player-hp")).toContainText("赵云");
  await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");
  await expect(page.getByTestId("combat-portrait-player")).toHaveAttribute("src", /zhaoyun\.svg$/);
  await expect(page.getByTestId("combat-portrait-enemy")).toHaveAttribute("src", /ink-bandit\.svg$/);

  await winVisibleCombat(page);

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await page.getByTestId("reward-card").first().click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
});

test("shops can add relics after the first battle", async ({ page }) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-battle-1").click();
  await winVisibleCombat(page);
  await page.getByTestId("reward-card").first().click();

  await page.getByTestId("map-node-shop-1").click();
  await expect(page.getByTestId("screen-shop")).toBeVisible();
  await page.getByTestId("shop-relic-relic_old_wooden_sword").click();

  await expect(page.getByTestId("run-relics")).toContainText("旧木剑");
  await expect(page.getByText("购得法宝：旧木剑。")).toBeVisible();
  await expect(page.getByTestId("shop-relic-relic_old_wooden_sword")).toBeDisabled();
  await page.getByTestId("shop-leave").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
});

test("event route can upgrade a deck card at rest", async ({ page }) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-event-1").click();
  await expect(page.getByTestId("screen-event")).toBeVisible();
  await page.getByTestId("event-choice-carve_names").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText("长坂回声：刻下无名者")).toBeVisible();
  await page.getByTestId("map-node-rest-1").click();
  await expect(page.getByTestId("screen-rest")).toBeVisible();
  await page.getByTestId("rest-upgrade-card").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText("精修枪击。")).toBeVisible();
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toContainText("枪击 +");
  await expect(page.getByTestId("deck-viewer")).toContainText("造成9点伤害");
  await page.getByTestId("deck-close").click();
});

test("Diao Chan starting relic applies charm and weak at combat start", async ({ page }) => {
  await startRun(page, "diaochan");
  await expect(page.getByTestId("run-relics")).toContainText("闭月香囊");
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-log")).toContainText("闭月香囊");
  await expect(page.getByTestId("combat-floats")).toContainText("闭月香囊");
  await expect(page.getByTestId("enemy-status")).toContainText("魅惑 2");
  await expect(page.getByTestId("enemy-status")).toContainText("虚弱 1");
});

async function startRun(page: Page, characterId: "zhaoyun" | "diaochan"): Promise<void> {
  await page.goto("/");
  await expect(page.getByText("云水江湖")).toBeVisible();
  await page.getByTestId(`character-${characterId}`).click();
  await page.getByTestId("start-run").click();
}

async function winVisibleCombat(page: Page): Promise<void> {
  for (let step = 0; step < 36; step += 1) {
    if (await page.getByTestId("screen-reward").isVisible().catch(() => false)) {
      return;
    }

    const playable = page.locator(".combat-card:not([disabled])");
    const count = await playable.count();
    if (count > 0) {
      await playable.first().click();
      continue;
    }

    if (await page.getByTestId("screen-reward").isVisible().catch(() => false)) {
      return;
    }

    await page.getByTestId("end-turn").click();
  }

  await expect(page.getByTestId("screen-reward")).toBeVisible();
}
