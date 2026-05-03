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

    await expect(page.getByTestId("screen-combat")).toHaveAttribute("data-battlefield", "luoshui");
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

test("captures a non-Luoshui chapter battlefield context", async ({ page }, testInfo) => {
  test.setTimeout(80_000);
  await reachSecondChapterCombat(page);

  await expect(page.getByTestId("screen-combat")).toHaveAttribute("data-battlefield", "bamboo");
  await expect(page.getByTestId("enemy-hp")).toContainText(/雨竹幽魂|断笔书生/);
  await expectDesktopCombatLayout(page);
  await capturePlaytestScreenshot(page, testInfo, "combat-bamboo-battlefield-desktop.png");
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

async function reachSecondChapterCombat(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("screen-title")).toBeVisible();
  await page.getByTestId("character-zhaoyun").click();
  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-event-1").click();
  await page.getByTestId("event-choice-carve_names").click();
  await page.getByTestId("map-node-rest-1").click();
  await page.getByTestId("rest-upgrade-card").click();
  await page.getByTestId("map-node-battle-3").click();
  await winVisibleCombat(page, 80);
  await page.getByTestId("reward-card").first().click();
  await page.getByTestId("map-node-boss").click();
  await winVisibleCombat(page, 150, "screen-method-reward");
  await page.locator("[data-testid^='method-choice-']").first().click();
  await page.getByTestId("chapter-reward-choice").first().click();
  await page.getByTestId("boss-reward-continue").click();
  await expect(page.getByTestId("run-chapter")).toContainText("竹林听雨");
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
}

async function winVisibleCombat(page: Page, maxSteps = 36, targetScreen = "screen-reward"): Promise<void> {
  for (let step = 0; step < maxSteps; step += 1) {
    if (await page.getByTestId(targetScreen).isVisible().catch(() => false)) {
      return;
    }

    const playable = page.locator(".combat-card:not([disabled])");
    const attack = playable.filter({ hasText: "攻" });
    const attackCount = await attack.count();
    if (attackCount > 0) {
      await attack.first().click();
      continue;
    }

    const count = await playable.count();
    if (count > 0) {
      await playable.first().click();
      continue;
    }

    if (await page.getByTestId(targetScreen).isVisible().catch(() => false)) {
      return;
    }

    await page.getByTestId("end-turn").click();
  }

  await expect(page.getByTestId(targetScreen)).toBeVisible();
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
