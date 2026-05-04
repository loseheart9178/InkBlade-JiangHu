import { expect, type Page, type TestInfo, test } from "@playwright/test";
import { getCombatAttackSprite } from "../../src/game/content/visuals";

const firstChapterSemanticEnemyAttacks = {
  elite_sword_echo: "/assets/sprites/wave9-sword-echo-attack-strip.svg",
  elite_blood_banner: "/assets/sprites/wave9-blood-banner-attack-strip.svg",
  boss_ink_dongzhuo: "/assets/sprites/wave9-ink-dongzhuo-boss-attack-strip.svg"
} as const;

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
    await expect(page.getByTestId("glossary-chip").first()).toHaveAttribute("title", /。/);
    await expect(page.getByTestId("glossary-chip").first()).toHaveAttribute("aria-label", /：/);
    await expect(page.getByTestId("intent")).toHaveAttribute("title", /敌人意图|杀意|运功/);
    await expect(page.getByTestId("intent")).toHaveAttribute("aria-label", /敌人意图/);
    await expect(page.getByTestId("combo-trail")).toContainText("待发");
    await expect(page.getByTestId("combo-trail")).toHaveAttribute("title", /招式链/);
    await expect(page.getByTestId("combo-trail")).toHaveAttribute("aria-label", /招式链/);
    await expect(page.getByTestId("combo-trail")).toHaveCSS("pointer-events", "auto");
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

test("first chapter stand-ins use semantic attack strips instead of generic slash", async ({ page }) => {
  test.setTimeout(80_000);
  for (const [combatantId, assetPath] of Object.entries(firstChapterSemanticEnemyAttacks)) {
    expect(getCombatAttackSprite(combatantId)?.assetPath).toBe(assetPath);
    expect(getCombatAttackSprite(combatantId)?.assetPath).not.toBe("/assets/sprites/enemy-slash-strip.svg");
  }

  await page.addInitScript(() => {
    Date.now = () => 2_000;
  });

  await startDesktopRun(page, "zhaoyun");
  await page.getByTestId("map-node-battle-1").click();
  await winVisibleCombat(page);
  await page.getByTestId("reward-card").first().click();
  await page.getByTestId("map-node-shop-1").click();
  await page.getByTestId("shop-leave").click();
  await page.getByTestId("map-node-elite-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("enemy-hp")).toContainText(/剑痴残影|血旗都尉|血旗残兵/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-(bamboo-soldier|scribe-officer)-standee-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);

  const enemyStandeeSrc = await page.getByTestId("combat-standee-enemy").getAttribute("src");
  const expectedAttackPath = enemyStandeeSrc?.includes("scribe-officer")
    ? firstChapterSemanticEnemyAttacks.elite_blood_banner
    : firstChapterSemanticEnemyAttacks.elite_sword_echo;

  await triggerEnemyAttackSprite(page);
  await expect(page.locator(".combat-standee--enemy")).toHaveClass(/is-attacking/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-(bamboo-soldier|scribe-officer)-standee-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCSS("background-image", new RegExp(escapeRegExp(pathBasename(expectedAttackPath))));
  await expect(page.getByTestId("combat-sprite-enemy")).not.toHaveCSS("background-image", /enemy-slash-strip\.svg/);
});

async function startDesktopRun(page: Page, characterId: (typeof combatSmokeCharacters)[number]["id"]): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("screen-title")).toBeVisible();
  await page.getByTestId(`character-${characterId}`).click();
  await page.getByTestId("start-run").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
}

async function startDesktopCombat(page: Page, characterId: (typeof combatSmokeCharacters)[number]["id"]): Promise<void> {
  await startDesktopRun(page, characterId);
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

async function triggerEnemyAttackSprite(page: Page, maxTurns = 4): Promise<void> {
  for (let turn = 0; turn < maxTurns; turn += 1) {
    await page.getByTestId("end-turn").click();
    if (await page.getByTestId("combat-sprite-enemy").isVisible().catch(() => false)) {
      return;
    }
  }

  await expect(page.getByTestId("combat-sprite-enemy")).toBeVisible();
}

async function capturePlaytestScreenshot(page: Page, testInfo: TestInfo, fileName: string): Promise<void> {
  const path = testInfo.outputPath(fileName);
  const screenshot = await page.screenshot({ path, fullPage: true });
  expect(screenshot.byteLength).toBeGreaterThan(25_000);
  await testInfo.attach(fileName, { path, contentType: "image/png" });
}

function pathBasename(path: string): string {
  return path.split("/").pop() ?? path;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function expectDesktopCombatLayout(page: Page): Promise<void> {
  const playerStandee = await page.getByTestId("combat-standee-player").boundingBox();
  const enemyStandee = await page.getByTestId("combat-standee-enemy").boundingBox();
  const handZone = await page.getByTestId("hand-zone").boundingBox();
  const energy = await page.getByTestId("energy").boundingBox();
  const firstCard = await page.locator(".combat-card").first().boundingBox();
  const heading = await page.getByTestId("screen-combat").locator("h2").boundingBox();
  const intent = await page.getByTestId("intent").boundingBox();
  const topbar = await page.locator(".combat-topbar").boundingBox();
  const message = await page.getByTestId("screen-combat").locator(".game-message").boundingBox();
  const combatLog = await page.getByTestId("combat-log").boundingBox();
  const controls = await page.locator(".combat-controls").boundingBox();
  const cardRects = await page.locator(".combat-card").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    })
  );

  expect(playerStandee).not.toBeNull();
  expect(enemyStandee).not.toBeNull();
  expect(handZone).not.toBeNull();
  expect(energy).not.toBeNull();
  expect(firstCard).not.toBeNull();
  expect(heading).not.toBeNull();
  expect(intent).not.toBeNull();
  expect(topbar).not.toBeNull();
  expect(message).not.toBeNull();
  expect(combatLog).not.toBeNull();
  expect(controls).not.toBeNull();
  expect(cardRects.length).toBeGreaterThan(0);

  expect(playerStandee!.y + playerStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(enemyStandee!.y + enemyStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(firstCard!.x - (energy!.x + energy!.width)).toBeGreaterThanOrEqual(28);
  expect(rectsOverlap(heading!, intent!)).toBe(false);

  const expectedCardHeight = Math.round(cardRects[0].height);
  for (const cardRect of cardRects) {
    expect(Math.abs(Math.round(cardRect.height) - expectedCardHeight)).toBeLessThanOrEqual(1);
    expect(rectsOverlap(cardRect, topbar!)).toBe(false);
    expect(rectsOverlap(cardRect, message!)).toBe(false);
    expect(rectsOverlap(cardRect, combatLog!)).toBe(false);
    expect(rectsOverlap(cardRect, controls!)).toBe(false);
  }
}

function rectsOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number }
): boolean {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}
