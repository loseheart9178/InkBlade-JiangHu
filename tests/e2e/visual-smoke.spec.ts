import { expect, type Locator, type Page, type TestInfo, test } from "@playwright/test";
import { getCombatAttackSprite } from "../../src/game/content/visuals";

const firstChapterSemanticEnemyAttacks = {
  elite_sword_echo: "/assets/sprites/sword-echo-attack-strip-gpt-v2.png",
  elite_blood_banner: "/assets/sprites/blood-banner-attack-strip-gpt-v2.png",
  boss_ink_dongzhuo: "/assets/sprites/ink-dongzhuo-boss-attack-strip-gpt-v2.png"
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

test("title character select presents four readable EA role cards", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.locator("#hud-host")).toHaveClass(/ui-kit-visual-qa/);
  await expect(page.locator("#hud-host")).toHaveAttribute("data-ui-kit-gates", "3-8");
  await expect(page.getByTestId("title-kicker")).toContainText("水墨武侠");
  await expect(page.getByTestId("title-route-ledger")).toBeVisible();
  await expect(page.getByTestId("title-route-ledger")).toContainText(/执笔者[\s\S]*四位侠客[\s\S]*江湖卷[\s\S]*四章墨雨/);
  await expect(page.getByTestId("title-route-ledger")).toContainText(/战斗核[\s\S]*牌组构筑[\s\S]*终局[\s\S]*心境定稿/);

  const expectedCards = [
    { id: "zhaoyun", resource: "枪势", mechanic: /破阵|连攻/, stats: /生命 82/ },
    { id: "diaochan", resource: "舞势", mechanic: /魅惑|闪避/, stats: /生命 68/ },
    { id: "caiwenji", resource: "音律", mechanic: /净化|余韵/, stats: /生命 72/ },
    { id: "zhugeliang", resource: "筹策", mechanic: /观星|布阵/, stats: /生命 66/ }
  ] as const;

  for (const character of expectedCards) {
    const card = page.getByTestId(`character-${character.id}`);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("type", "button");
    await expect(card).toHaveClass(/character-choice--kit/);
    await expect(card).toHaveAttribute("data-character-role", character.id);
    await expect(card).toHaveCSS("overflow-wrap", "anywhere");
    await expect(card.getByTestId(`character-name-${character.id}`)).toBeVisible();
    await expect(card.getByTestId(`character-resource-${character.id}`)).toContainText(character.resource);
    await expect(card.getByTestId(`character-mechanic-${character.id}`)).toContainText(character.mechanic);
    await expect(card.getByTestId(`character-stats-${character.id}`)).toContainText(character.stats);
  }

  await expect(page.getByTestId("character-zhaoyun")).toHaveClass(/is-selected/);
  await expectTitleSurfaceLayout(page);
  await capturePlaytestScreenshot(page, testInfo, "title-character-select-desktop.png");
});

test("captures desktop combat smoke screenshots for all four characters", async ({ page }, testInfo) => {
  test.setTimeout(140_000);

  for (const character of combatSmokeCharacters) {
    await startDesktopCombat(page, character.id);

    await expect(page.getByTestId("screen-combat")).toHaveAttribute("data-battlefield", "luoshui");
    await expect(page.getByTestId("player-hp")).toContainText(character.label);
    await expect(page.getByTestId("player-resource")).toContainText(character.resource);
    await expect(page.getByText(character.resource)).toBeVisible();
    await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");
    await expect(page.getByTestId("enemy-resource")).toContainText(/敌势\s+1\/3/);
    await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", character.standee);
    await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-ink-bandit-standee-cutout\.png$/);
    await expect(page.getByTestId("combat-sprite-player")).toHaveCount(0);
    await expect(page.getByTestId("combat-sprite-enemy")).toHaveCount(0);
    await expect(page.getByTestId("card-art").first()).toHaveAttribute("src", /^\/assets\/generated\/cards\/.+\.(png|svg)$/);
    await expect(page.getByTestId("card-art").first()).toHaveCSS("object-fit", "contain");
    await expect(page.locator(".combat-card").first()).toHaveAttribute("style", /--ui-kit-card-frame/);
    await expect(page.locator(".combat-card .card-art").first()).toHaveClass(/card-art--kit/);
    await expect(page.getByTestId("card-type-badge").first()).toBeVisible();
    await expect(page.getByTestId("card-rarity-mark").first()).toBeVisible();
    await expect(page.getByTestId("card-keyword-row").first()).toBeVisible();
    await expect(page.getByTestId("card-cost").first()).toBeVisible();
    await expect(page.getByTestId("player-status")).toHaveClass(/status-line--kit/);
    await expect(page.getByTestId("enemy-status")).toHaveClass(/status-line--kit/);
    await expect(page.getByTestId("status-icon").first()).toBeVisible();
    await expect(page.getByTestId("player-resource")).toHaveClass(/resource-pill--kit/);
    await expect(page.getByTestId("player-hud-group").getByTestId("player-resource")).toBeVisible();
    await expect(page.locator(".combat-field [data-testid='player-resource']")).toHaveCount(0);
    await expect(page.locator(".combat-field [data-testid='enemy-resource']")).toHaveCount(0);
    await expect(page.getByTestId("resource-icon").first()).toBeVisible();
    await expect(page.getByTestId("energy")).toHaveClass(/energy-orb--kit/);
    await expect(page.getByTestId("glossary-chip").first()).toHaveAttribute("title", /。/);
    await expect(page.getByTestId("glossary-chip").first()).toHaveAttribute("aria-label", /：/);
    await expect(page.getByTestId("intent")).toHaveAttribute("title", /敌人意图|杀意|运功/);
    await expect(page.getByTestId("intent")).toHaveAttribute("aria-label", /敌人意图/);
    await expect(page.getByTestId("intent")).toHaveAttribute("data-intent-type", /attack|block|special|idle/);
    await expect(page.getByTestId("intent")).toHaveAttribute("data-intent-pressure", /low|medium|high/);
    await expect(page.getByTestId("intent")).toHaveClass(/intent-box--/);
    await expect(page.getByTestId("intent-pressure")).toContainText(/轻势|逼近|重压/);
    await expect(page.getByTestId("pile-counter-draw")).toHaveAttribute("data-glossary-id", "resource.drawPile");
    await expect(page.getByTestId("pile-counter-discard")).toHaveAttribute("data-glossary-id", "resource.discardPile");
    await expect(page.getByTestId("pile-counter-exhaust")).toHaveAttribute("data-glossary-id", "resource.exhaustPile");
    await expect(page.getByTestId("combo-trail")).toContainText("待发");
    await expect(page.getByTestId("combo-trail")).toHaveAttribute("title", /招式链/);
    await expect(page.getByTestId("combo-trail")).toHaveAttribute("aria-label", /招式链/);
    await expect(page.getByTestId("combo-trail")).toHaveCSS("pointer-events", "auto");
    await expect(page.getByTestId("played-feedback")).toHaveAttribute("data-played-count", "0");
    if (character.id === "diaochan") {
      const statusBadge = page.getByTestId("status-badge").first();
      await expect(statusBadge).toBeVisible();
      await expect(statusBadge).toHaveAttribute("data-glossary-id", /status\./);
      await expect(statusBadge).toHaveAttribute("title", /：/);
      await expect(statusBadge).toHaveAttribute("aria-label", /：/);
      await expect(statusBadge).toHaveAttribute("data-tooltip", /：/);
      await expectStatusTooltipVisible(statusBadge);
    }
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
    await expect(page.getByTestId("target-feedback-enemy")).toBeVisible();
    await expect(page.getByTestId("target-feedback-enemy")).toHaveAttribute("data-feedback-kind", /damage|status|block|resource|ink|draw|trigger/);
    await expect(page.getByTestId("target-feedback-enemy")).toHaveAttribute("data-feedback-tone", /red|teal|gold|ink|neutral|mind/);
    await expect(page.locator(".combatant--enemy")).toHaveClass(/is-target-feedback/);
    await expect(page.getByTestId("target-feedback-enemy")).toBeHidden({ timeout: 3_600 });
    await expect(page.getByTestId("played-feedback")).not.toHaveAttribute("data-played-count", "0");
    await expect(page.getByTestId("combat-vfx-slash")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-sigil")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-seal")).toHaveCount(0);
    await expect(page.getByTestId("combat-vfx-ink")).toHaveCount(0);
    await expect(page.getByTestId("combo-trail")).toContainText("攻");
    await expectDesktopCombatLayout(page);
  }
});

test("mobile combat HUD keeps meters and status stacks inside the viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startDesktopCombat(page, "zhaoyun");

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("player-hud-group").getByTestId("player-resource")).toBeVisible();
  await expect(page.getByTestId("enemy-hud-group").getByTestId("enemy-resource")).toBeVisible();
  await expectMobileCombatLayout(page);
  await capturePlaytestScreenshot(page, testInfo, "combat-zhaoyun-mobile-hud.png");
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
  expect(screenshot.byteLength).toBeLessThan(5 * 1024 * 1024);
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
  const playerHp = await page.getByTestId("player-hp").boundingBox();
  const enemyHp = await page.getByTestId("enemy-hp").boundingBox();
  const playerStatus = await page.getByTestId("player-status").boundingBox();
  const enemyStatus = await page.getByTestId("enemy-status").boundingBox();
  const playerResource = await page.getByTestId("player-resource").boundingBox();
  const enemyResource = await page.getByTestId("enemy-resource").boundingBox();
  const firstCard = await page.locator(".combat-card").first().boundingBox();
  const firstCardArtFrame = await page.locator(".combat-card .card-art").first().boundingBox();
  const cardCost = await page.getByTestId("card-cost").first().boundingBox();
  const cardTitle = await page.locator(".combat-card strong").first().boundingBox();
  const cardChrome = await page.locator(".combat-card .card-chrome-row").first().boundingBox();
  const cardDescription = await page.locator(".combat-card .card-description").first().boundingBox();
  const heading = await page.getByTestId("screen-combat").locator("h2").boundingBox();
  const intent = await page.getByTestId("intent").boundingBox();
  const topbar = await page.locator(".combat-topbar").boundingBox();
  const message = await page.getByTestId("screen-combat").locator(".game-message").boundingBox();
  const combatLog = await page.getByTestId("combat-log").boundingBox();
  const controls = await page.locator(".combat-controls").boundingBox();
  const playedFeedback = await page.getByTestId("played-feedback").boundingBox();
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
  expect(playerHp).not.toBeNull();
  expect(enemyHp).not.toBeNull();
  expect(playerStatus).not.toBeNull();
  expect(enemyStatus).not.toBeNull();
  expect(playerResource).not.toBeNull();
  expect(enemyResource).not.toBeNull();
  expect(firstCard).not.toBeNull();
  expect(firstCardArtFrame).not.toBeNull();
  expect(cardCost).not.toBeNull();
  expect(cardTitle).not.toBeNull();
  expect(cardChrome).not.toBeNull();
  expect(cardDescription).not.toBeNull();
  expect(heading).not.toBeNull();
  expect(intent).not.toBeNull();
  expect(topbar).not.toBeNull();
  expect(message).not.toBeNull();
  expect(combatLog).not.toBeNull();
  expect(controls).not.toBeNull();
  expect(playedFeedback).not.toBeNull();
  expect(cardRects.length).toBeGreaterThan(0);

  expect(playerStandee!.y + playerStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(enemyStandee!.y + enemyStandee!.height).toBeLessThan(handZone!.y + 24);
  expect(Math.abs(energy!.width - energy!.height)).toBeLessThanOrEqual(1);
  expect(firstCard!.x - (energy!.x + energy!.width)).toBeGreaterThanOrEqual(28);
  expect(playerStatus!.x).toBeGreaterThanOrEqual(playerHp!.x + playerHp!.width - 1);
  expect(playerStatus!.y + playerStatus!.height).toBeGreaterThan(playerHp!.y);
  expect(playerStatus!.y).toBeLessThan(playerHp!.y + playerHp!.height);
  expect(enemyStatus!.x + enemyStatus!.width).toBeLessThanOrEqual(enemyHp!.x + 1);
  expect(enemyStatus!.y + enemyStatus!.height).toBeGreaterThan(enemyHp!.y);
  expect(enemyStatus!.y).toBeLessThan(enemyHp!.y + enemyHp!.height);
  await expect(page.locator(".combat-field [data-testid='player-status']")).toHaveCount(0);
  await expect(page.locator(".combat-field [data-testid='enemy-status']")).toHaveCount(0);
  await expect(page.locator(".combat-field [data-testid='player-resource']")).toHaveCount(0);
  await expect(page.locator(".combat-field [data-testid='enemy-resource']")).toHaveCount(0);
  await expect(page.getByTestId("player-hud-group").getByTestId("player-resource")).toBeVisible();
  await expect(page.getByTestId("enemy-hud-group").getByTestId("enemy-resource")).toBeVisible();
  expect(rectsOverlap(playerStatus!, playerStandee!)).toBe(false);
  expect(rectsOverlap(enemyStatus!, enemyStandee!)).toBe(false);
  expect(rectsOverlap(playerResource!, playerStandee!)).toBe(false);
  expect(rectsOverlap(enemyResource!, enemyStandee!)).toBe(false);
  expect(cardCost!.width).toBeGreaterThanOrEqual(30);
  expect(cardCost!.height).toBeGreaterThanOrEqual(30);
  expect(cardCost!.x).toBeGreaterThanOrEqual(firstCard!.x);
  expect(cardCost!.y).toBeGreaterThanOrEqual(firstCard!.y);
  expect(cardCost!.x + cardCost!.width).toBeLessThanOrEqual(firstCard!.x + firstCard!.width);
  expect(cardCost!.y + cardCost!.height).toBeLessThanOrEqual(firstCard!.y + firstCard!.height);
  expect(firstCardArtFrame!.height).toBeGreaterThan(firstCardArtFrame!.width);
  expect(firstCardArtFrame!.height).toBeGreaterThan(firstCard!.height * 0.44);
  expect(rectsOverlap(cardCost!, firstCardArtFrame!)).toBe(false);
  expect(rectsOverlap(cardTitle!, firstCardArtFrame!)).toBe(false);
  expect(rectsOverlap(cardChrome!, firstCardArtFrame!)).toBe(false);
  expect(rectsOverlap(cardDescription!, firstCardArtFrame!)).toBe(false);
  expect(rectsOverlap(heading!, intent!)).toBe(false);
  expect(rectsOverlap(playedFeedback!, handZone!)).toBe(false);
  expect(rectsOverlap(playedFeedback!, topbar!)).toBe(false);

  const feedbackRects = await page.locator("[data-testid^='target-feedback-']").evaluateAll((items) =>
    items.flatMap((item) => {
      const style = window.getComputedStyle(item);
      if (style.visibility === "hidden" || Number(style.opacity) === 0) {
        return [];
      }
      const rect = item.getBoundingClientRect();
      return [{
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }];
    })
  );

  for (const feedbackRect of feedbackRects) {
    expect(rectsOverlap(feedbackRect, handZone!)).toBe(false);
    expect(rectsOverlap(feedbackRect, topbar!)).toBe(false);
  }

  const expectedCardHeight = Math.round(cardRects[0].height);
  for (const cardRect of cardRects) {
    expect(Math.abs(Math.round(cardRect.height) - expectedCardHeight)).toBeLessThanOrEqual(1);
    expect(rectsOverlap(cardRect, topbar!)).toBe(false);
    expect(rectsOverlap(cardRect, message!)).toBe(false);
    expect(rectsOverlap(cardRect, combatLog!)).toBe(false);
    expect(rectsOverlap(cardRect, controls!)).toBe(false);
  }
}

async function expectStatusTooltipVisible(status: Locator): Promise<void> {
  await status.focus();
  await expect.poll(async () =>
    status.evaluate((node) => {
      const style = window.getComputedStyle(node, "::after");
      return {
        content: style.content,
        opacity: Number(style.opacity)
      };
    })
  ).toMatchObject({
    content: expect.stringMatching(/护甲|心境|墨痕|：/),
    opacity: expect.any(Number)
  });
  const opacity = await status.evaluate((node) => Number(window.getComputedStyle(node, "::after").opacity));
  expect(opacity).toBeGreaterThan(0.5);
}

async function expectMobileCombatLayout(page: Page): Promise<void> {
  const topbar = page.locator(".combat-topbar");
  const screen = page.getByTestId("screen-combat");
  const playerHud = page.getByTestId("player-hud-group");
  const enemyHud = page.getByTestId("enemy-hud-group");
  const playerMeter = page.getByTestId("player-hp");
  const enemyMeter = page.getByTestId("enemy-hp");
  const intent = page.getByTestId("intent");

  const metrics = await page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      const rect = element?.getBoundingClientRect();
      return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
    };
    const top = document.querySelector<HTMLElement>(".combat-topbar");
    const screenNode = document.querySelector<HTMLElement>("[data-testid='screen-combat']");
    return {
      viewportWidth: window.innerWidth,
      topbarScrollWidth: top?.scrollWidth ?? 0,
      topbarClientWidth: top?.clientWidth ?? 0,
      screenScrollWidth: screenNode?.scrollWidth ?? 0,
      screenClientWidth: screenNode?.clientWidth ?? 0,
      playerHud: read("[data-testid='player-hud-group']"),
      enemyHud: read("[data-testid='enemy-hud-group']"),
      playerMeter: read("[data-testid='player-hp']"),
      enemyMeter: read("[data-testid='enemy-hp']"),
      intent: read("[data-testid='intent']")
    };
  });

  await expect(topbar).toBeVisible();
  await expect(screen).toBeVisible();
  await expect(playerHud).toBeVisible();
  await expect(enemyHud).toBeVisible();
  await expect(playerMeter).toBeVisible();
  await expect(enemyMeter).toBeVisible();
  await expect(intent).toBeVisible();
  expect(metrics.topbarScrollWidth).toBeLessThanOrEqual(metrics.topbarClientWidth + 1);
  expect(metrics.screenScrollWidth).toBeLessThanOrEqual(metrics.screenClientWidth + 1);
  for (const rect of [metrics.playerHud, metrics.enemyHud, metrics.playerMeter, metrics.enemyMeter, metrics.intent]) {
    expect(rect).not.toBeNull();
    expect(rect!.x).toBeGreaterThanOrEqual(-1);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  }
  expect(rectsOverlap(metrics.intent!, metrics.playerHud!)).toBe(false);
  expect(rectsOverlap(metrics.intent!, metrics.enemyHud!)).toBe(false);
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

async function expectTitleSurfaceLayout(page: Page): Promise<void> {
  const actions = await page.locator(".title-actions").boundingBox();
  const routeLedger = await page.getByTestId("title-route-ledger").boundingBox();
  const characterCards = await page.locator(".character-choice").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
        scrollHeight: card.scrollHeight,
        clientHeight: card.clientHeight
      };
    })
  );

  expect(actions).not.toBeNull();
  expect(routeLedger).not.toBeNull();
  expect(characterCards).toHaveLength(4);

  for (const card of characterCards) {
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth + 1);
    expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight + 1);
    expect(rectsOverlap(card, actions!)).toBe(false);
    expect(rectsOverlap(card, routeLedger!)).toBe(false);
  }
}
