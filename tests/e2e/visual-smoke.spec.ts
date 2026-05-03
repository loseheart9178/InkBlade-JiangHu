import { expect, type Page, type TestInfo, test } from "@playwright/test";

const combatSmokeCharacters = [
  {
    id: "zhaoyun",
    label: "赵云",
    resource: /枪势\s+0\/6/,
    standee: /zhaoyun-standee-gpt-v2-cutout\.png$/,
    attackSprite: /zhaoyun-attack-strip-gpt-v2\.png/
  },
  {
    id: "diaochan",
    label: "貂蝉",
    resource: /舞势\s+0\/8/,
    standee: /diaochan-standee-gpt-v2-cutout\.png$/,
    attackSprite: /diaochan-attack-strip-gpt-v2\.png/
  },
  {
    id: "caiwenji",
    label: "蔡文姬",
    resource: /音律\s+0\/10/,
    standee: /gpt2-caiwenji-standee-cutout\.png$/,
    attackSprite: /caiwenji-qin-attack-strip-gpt2\.png/
  },
  {
    id: "zhugeliang",
    label: "诸葛亮",
    resource: /筹策\s+[12]\/9/,
    standee: /gpt2-zhugeliang-standee-cutout\.png$/,
    attackSprite: /zhugeliang-formation-strip-gpt2\.png/
  }
] as const;

test("captures desktop combat smoke screenshots for all four characters", async ({ page }, testInfo) => {
  for (const character of combatSmokeCharacters) {
    await startDesktopCombat(page, character.id);

    await expect(page.getByTestId("player-hp")).toContainText(character.label);
    await expect(page.getByText(character.resource)).toBeVisible();
    await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");
    await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", character.standee);
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

    await capturePlaytestScreenshot(page, testInfo, `combat-${character.id}-desktop.png`);

    if (character.id === "zhaoyun") {
      await page.getByTestId("end-turn").click();
      await expect(page.getByTestId("combat-sprite-enemy")).toHaveCSS("background-image", /ink-bandit-attack-strip-gpt-v2\.png/);
    }

    const playableAttack = page.locator(".combat-card:not([disabled])").filter({ hasText: "攻" }).first();
    await expect(playableAttack).toBeVisible();
    await playableAttack.click();
    await expect(page.getByTestId("combat-sprite-player")).toHaveCSS("background-image", character.attackSprite);
    await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-slash")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-sigil")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-seal")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-ink")).toHaveCount(0);
    await expect(page.getByTestId("combo-trail")).toContainText("攻");
  }
});

async function startDesktopCombat(page: Page, characterId: (typeof combatSmokeCharacters)[number]["id"]): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("screen-title")).toBeVisible();
  await page.getByTestId(`character-${characterId}`).click();
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
}

async function capturePlaytestScreenshot(page: Page, testInfo: TestInfo, fileName: string): Promise<void> {
  const path = testInfo.outputPath(fileName);
  const screenshot = await page.screenshot({ path, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(25_000);
  await testInfo.attach(fileName, { path, contentType: "image/png" });
}

async function expectDesktopCombatLayout(page: Page): Promise<void> {
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

  expect(playerStandee!.y + playerStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(enemyStandee!.y + enemyStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(firstCard!.x - (energy!.x + energy!.width)).toBeGreaterThanOrEqual(28);
}
