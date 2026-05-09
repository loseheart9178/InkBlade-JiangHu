import { expect, type Page, type TestInfo, test } from "@playwright/test";

const mobileViewport = { width: 390, height: 844 };

test("narrow viewport title map and combat surfaces remain actionable", async ({ page }, testInfo) => {
  test.setTimeout(70_000);
  await page.setViewportSize(mobileViewport);
  await startFreshTitle(page);

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.getByTestId("start-run")).toBeVisible();
  await expect(page.getByTestId("character-zhaoyun")).toHaveAttribute("aria-pressed", "true");
  await expectNoDocumentHorizontalOverflow(page);

  await page.getByTestId("character-caiwenji").click();
  await expect(page.getByTestId("character-caiwenji")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("start-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("map-node-battle-1")).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);

  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("hand-zone")).toHaveCSS("overflow-x", "auto");
  await expect(page.locator(".combat-card").first()).toBeVisible();
  await expect(page.getByTestId("end-turn")).toBeVisible();
  await captureBoundedScreenshot(page, testInfo, "mobile-combat-actionable.png");
});

test("keyboard can select a role choose a challenge and enter combat", async ({ page }) => {
  test.setTimeout(70_000);
  await startFreshTitle(page);

  await tabUntilTestId(page, "character-zhaoyun");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("character-diaochan")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("character-diaochan")).toHaveAttribute("aria-pressed", "true");

  await tabUntilTestId(page, "challenge-inkRising");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("challenge-inkRising")).toHaveAttribute("aria-pressed", "true");

  await tabUntilTestId(page, "start-run");
  await expect(page.getByTestId("start-run")).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await tabUntilTestId(page, "map-node-battle-1");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("screen-combat")).toBeVisible();
});

test("reduced-motion setting keeps combat readable without large screenshots", async ({ page }, testInfo) => {
  test.setTimeout(70_000);
  await startFreshTitle(page);

  await page.getByTestId("settings-open").click();
  await page.getByTestId("setting-reduced-motion").check();
  await page.getByTestId("settings-back").click();

  await expect(page.locator("#hud-host")).toHaveClass(/prefers-reduced-motion/);
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.locator("#hud-host")).toHaveClass(/prefers-reduced-motion/);
  await expect(page.getByTestId("intent")).toBeVisible();
  await expect(page.getByTestId("hand-zone")).toBeVisible();
  await expect(page.locator(".combat-card").first()).toBeVisible();
  await captureBoundedScreenshot(page, testInfo, "reduced-motion-combat.png");
});

async function startFreshTitle(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("screen-title")).toBeVisible();
}

async function expectNoDocumentHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const viewport = window.innerWidth;
    return {
      viewport,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    };
  });

  expect(Math.max(overflow.documentWidth, overflow.bodyWidth)).toBeLessThanOrEqual(overflow.viewport + 2);
}

async function tabUntilTestId(page: Page, testId: string, maxTabs = 24): Promise<void> {
  for (let index = 0; index <= maxTabs; index += 1) {
    const activeTestId = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? "");
    if (activeTestId === testId) {
      return;
    }
    await page.keyboard.press("Tab");
  }

  const activeTestId = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? "");
  expect(activeTestId).toBe(testId);
}

async function captureBoundedScreenshot(page: Page, testInfo: TestInfo, fileName: string): Promise<void> {
  const path = testInfo.outputPath(fileName);
  const screenshot = await page.screenshot({ path, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(25_000);
  expect(screenshot.byteLength).toBeLessThan(5 * 1024 * 1024);
  await testInfo.attach(fileName, { path, contentType: "image/png" });
}
