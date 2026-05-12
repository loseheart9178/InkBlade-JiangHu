import { expect, type Page, test } from "@playwright/test";

async function expectCardTitlesClearArt(page: Page): Promise<void> {
  const cardRects = await page.getByTestId("prototype-card").evaluateAll((items) =>
    items.map((item) => {
      const title = item.querySelector(".card-title")?.getBoundingClientRect();
      const art = item.querySelector(".combat-ui-prototype-card-art")?.getBoundingClientRect();
      const artImage = item.querySelector(".combat-ui-prototype-card-art img");
      const objectFit = artImage ? getComputedStyle(artImage).objectFit : undefined;

      return title && art
        ? { titleBottom: title.bottom, artTop: art.top, artWidth: art.width, artHeight: art.height, cardHeight: item.getBoundingClientRect().height, objectFit }
        : undefined;
    })
  );

  for (const rect of cardRects) {
    expect(rect).toBeDefined();
    expect(rect!.titleBottom).toBeLessThanOrEqual(rect!.artTop - 2);
    expect(rect!.artHeight).toBeGreaterThan(rect!.cardHeight * 0.48);
    expect(rect!.artWidth).toBeLessThan(rect!.artHeight);
    expect(rect!.objectFit).toBe("contain");
  }
}

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
  await expectCardTitlesClearArt(page);

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
  await expectCardTitlesClearArt(page);

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
