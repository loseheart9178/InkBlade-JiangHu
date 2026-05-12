import { expect, test } from "@playwright/test";

test("combat UI kit prototype is framed and interactive on desktop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/superpowers/prototypes/combat-ui-kit/index.html");

  await expect(page.getByTestId("combat-ui-prototype")).toBeVisible();
  await expect(page.getByTestId("prototype-player-hud")).toBeVisible();
  await expect(page.getByTestId("prototype-enemy-hud")).toBeVisible();
  await expect(page.getByTestId("prototype-intent")).toBeVisible();
  await expect(page.getByTestId("prototype-hand")).toBeVisible();
  await expect(page.getByTestId("prototype-card")).toHaveCount(4);
  await expect(page.getByTestId("prototype-status-icon")).toHaveCount(6);

  const hasVerticalScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 2);
  expect(hasVerticalScroll).toBe(false);

  const firstCard = page.getByTestId("prototype-card").first();
  await firstCard.click();
  await expect(firstCard).toHaveClass(/is-played/);
  await expect(page.getByTestId("prototype-message")).toContainText(/已出。/);

  const screenshotPath = testInfo.outputPath("combat-ui-kit-prototype-desktop.png");
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(40_000);
  await testInfo.attach("combat-ui-kit-prototype-desktop.png", { path: screenshotPath, contentType: "image/png" });
});

test("combat UI kit prototype remains readable on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/superpowers/prototypes/combat-ui-kit/index.html");

  await expect(page.getByTestId("combat-ui-prototype")).toBeVisible();
  await expect(page.getByTestId("prototype-card")).toHaveCount(4);

  const cards = await page.getByTestId("prototype-card").evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );

  for (const card of cards) {
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(390);
    expect(card.height).toBeGreaterThan(120);
  }

  const screenshotPath = testInfo.outputPath("combat-ui-kit-prototype-mobile.png");
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(35_000);
  await testInfo.attach("combat-ui-kit-prototype-mobile.png", { path: screenshotPath, contentType: "image/png" });
});
