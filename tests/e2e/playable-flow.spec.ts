import { expect, type Page, type TestInfo, test } from "@playwright/test";

test("boots to title and exposes all four character choices before a run", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.getByText("云水江湖")).toBeVisible();
  await expect(page.getByTestId("character-zhaoyun")).toBeVisible();
  await expect(page.getByTestId("character-diaochan")).toBeVisible();
  await expect(page.getByTestId("character-caiwenji")).toBeVisible();
  await expect(page.getByTestId("character-zhugeliang")).toBeVisible();
  await expect(page.getByTestId("character-zhaoyun")).toHaveClass(/is-selected/);

  await page.getByTestId("character-zhugeliang").click();

  await expect(page.getByTestId("character-zhugeliang")).toHaveClass(/is-selected/);
  await expect(page.getByTestId("start-run")).toBeEnabled();
  await expect(page.getByTestId("continue-run")).toBeDisabled();
  await expect(page.getByTestId("screen-map")).toBeHidden();
});

test("settings panel opens from title and returns without starting a run", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("screen-title")).toBeVisible();

  await page.getByTestId("settings-open").click();
  await expect(page.getByTestId("screen-settings")).toBeVisible();
  await expect(page.getByTestId("setting-reduced-motion")).toBeVisible();
  await page.getByTestId("settings-back").click();

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.getByTestId("screen-map")).toBeHidden();
});

test("run summary shell opens from the title debug entry", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("debug-run-summary").click();
  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  const statCount = await page.getByTestId("run-summary-stat").count();
  expect(statCount).toBeGreaterThan(2);
});

test("ending summary records and persists profile summary", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("debug-ending-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("ending-summary")).toBeVisible();
  await expect(page.getByTestId("ending-id")).toContainText("ending_hidden_wu");
  await expect(page.getByTestId("ending-title")).toContainText("隐藏清悟");
  await expect(page.getByTestId("run-summary-character")).toContainText("赵云");
  await expect(page.getByTestId("run-summary-chapters")).toContainText("4");
  await expect(page.getByTestId("profile-total-runs")).toContainText("1");
  await expect(page.getByTestId("profile-unlocked-endings")).toContainText("隐藏清悟");
  await capturePlaytestScreenshot(page, testInfo, "ending-profile-summary-desktop.png");

  await page.reload();
  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("profile-total-runs")).toContainText("1");
  await expect(page.getByTestId("profile-unlocked-endings")).toContainText("隐藏清悟");
});

test("boots, enters a Zhao Yun battle, wins, and returns to the route map", async ({ page }) => {
  await startRun(page, "zhaoyun");

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-archetype")).toContainText("流派");
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toBeVisible();
  await expect(page.getByTestId("deck-archetype-summary")).toContainText("当前流派");
  await expect(page.getByTestId("deck-card")).toHaveCount(10);
  await expect(page.getByTestId("deck-viewer")).toContainText("枪击");
  await page.getByTestId("deck-close").click();
  await expect(page.getByTestId("deck-viewer")).toBeHidden();
  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("energy")).toBeVisible();
  await expect(page.getByTestId("player-hp")).toContainText("赵云");
  await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");
  await expect(page.getByTestId("combat-standee-player")).toHaveAttribute("src", /zhaoyun-standee-gpt-v2-cutout\.png$/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-ink-bandit-standee-cutout\.png$/);

  await winVisibleCombat(page);

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await expect(page.getByTestId("reward-combo-hint")).toContainText("招式回响");
  await expect(page.getByTestId("reward-card").first()).toHaveAttribute("data-combo-biased", "true");
  await expect(page.getByTestId("reward-reason").first()).toContainText("流派");
  await expect(page.getByTestId("reward-archetype-role").first()).toContainText(/主线强化|副线补强|通用补短/);
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

test("elite victories can award and persist a heart method", async ({ page }) => {
  test.setTimeout(60_000);
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-battle-1").click();
  await winVisibleCombat(page);
  await page.getByTestId("reward-card").first().click();

  await page.getByTestId("map-node-shop-1").click();
  await page.getByTestId("shop-leave").click();
  await page.getByTestId("map-node-elite-1").click();
  await winVisibleCombat(page, 120, "screen-method-reward");

  await expect(page.getByTestId("screen-method-reward")).toBeVisible();
  await expect(page.locator("[data-testid^='method-choice-']")).toHaveCount(2);
  await page.locator("[data-testid^='method-choice-']").first().click();

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await expect(page.getByTestId("run-methods")).not.toContainText("未定");
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-method-summary")).not.toContainText("未定");
  await page.getByTestId("deck-close").click();
});

test("event route can upgrade a deck card at rest", async ({ page }) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-event-1").click();
  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-hero")).toBeVisible();
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--changban/);
  await expect(page.locator("[data-testid^='event-choice-']")).toHaveCount(2);
  await expect(page.getByTestId("event-choice-guard_cry")).toBeVisible();
  await page.getByTestId("event-choice-carve_names").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText("长坂回声：刻下无名者")).toBeVisible();
  await expect(page.getByTestId("run-mind-tendencies")).toContainText("宁1");
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

test("logbook opens from run status and shows unlocked story fragments", async ({ page }) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-event-1").click();
  await page.getByTestId("event-choice-carve_names").click();

  await expect(page.getByTestId("run-logbook")).toContainText("1");
  await page.getByTestId("logbook-open").click();

  await expect(page.getByTestId("screen-logbook")).toBeVisible();
  await expect(page.getByTestId("logbook-entry").first()).toContainText(/长坂|洛水|黑雨|无名/);
  await page.getByTestId("logbook-back").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
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

test("Diao Chan sees palace role choices on the first event route", async ({ page }) => {
  await startRun(page, "diaochan");
  await page.getByTestId("map-node-event-1").click();

  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-choice-dance_again")).toBeVisible();
  await expect(page.getByTestId("event-choice-guard_cry")).toBeHidden();
});

test("Cai Wenji can be selected and enters combat with sound resource visible", async ({ page }) => {
  await startRun(page, "caiwenji");
  await expect(page.getByTestId("run-relics")).toContainText("青玉琴徽");

  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("player-hp")).toContainText("蔡文姬");
  await expect(page.getByText(/音律\s+0\/10/)).toBeVisible();
  await expect(page.locator(".combat-card").filter({ hasText: /拂弦|宫音|清心曲/ }).first()).toBeVisible();
});

test("Zhuge Liang can be selected and enters combat with strategy resource visible", async ({ page }) => {
  await startRun(page, "zhugeliang");
  await expect(page.getByTestId("run-relics")).toContainText("白羽扇");

  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("player-hp")).toContainText("诸葛亮");
  await expect(page.getByText(/筹策\s+1\/9|筹策\s+2\/9/)).toBeVisible();
  await expect(page.locator(".combat-card").filter({ hasText: /羽扇|守势|观星|八阵/ }).first()).toBeVisible();
});

test("can continue a saved combat after a page reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("continue-run")).toBeDisabled();

  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");

  await page.reload();
  await expect(page.getByText("云水江湖")).toBeVisible();
  await expect(page.getByTestId("continue-run")).toBeEnabled();
  await page.getByTestId("continue-run").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("enemy-hp")).toContainText("墨化山贼");
  await expect(page.getByTestId("energy")).toBeVisible();
});

test("can complete the first chapter through the event and rest route", async ({ page }) => {
  test.setTimeout(60_000);
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-event-1").click();
  await page.getByTestId("event-choice-carve_names").click();

  await page.getByTestId("map-node-rest-1").click();
  await page.getByTestId("rest-upgrade-card").click();

  await page.getByTestId("map-node-battle-3").click();
  await winVisibleCombat(page, 80);
  await page.getByTestId("reward-card").first().click();

  await page.getByTestId("map-node-boss").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-ink-dongzhuo-boss-standee-cutout\.png$/);
  await expect(page.getByTestId("intent")).toContainText("宫宴压迫");
  await page.getByTestId("end-turn").click();
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCSS("background-image", /ink-dongzhuo-boss-attack-strip-gpt-v2\.png/);
  await expect(page.getByTestId("combat-log")).toContainText("宫宴压迫");
  await expect(page.getByTestId("player-status")).toContainText("墨痕 1");
  await winVisibleCombat(page, 140, "screen-method-reward");
  await expect(page.getByTestId("screen-method-reward")).toBeVisible();
  await page.locator("[data-testid^='method-choice-']").first().click();
  await expect(page.getByTestId("screen-chapter-reward")).toBeVisible();
  await expect(page.getByTestId("chapter-reward-choice")).toHaveCount(3);
  await expect(page.getByTestId("advanced-reward-choice")).toHaveCount(4);
  await page.getByTestId("advanced-reward-choice").first().click();
  await expect(page.getByTestId("run-archetype")).toBeVisible();
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toContainText(/七星枪影|单骑救主|七进七出|枪围如墙/);
  await page.getByTestId("deck-close").click();
  await page.getByTestId("chapter-reward-choice").first().click();
  await expect(page.getByTestId("screen-boss-reward")).toBeVisible();
  await page.getByTestId("boss-reward-continue").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-chapter")).toContainText("竹林听雨");
  await expect(page.getByTestId("map-node-boss")).toContainText("琴魔");
});

test("can enter a second chapter combat and see status-card pressure", async ({ page }) => {
  test.setTimeout(80_000);
  await startRun(page, "zhaoyun");
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
  await expect(page.getByTestId("enemy-hp")).toContainText(/雨竹幽魂|断笔书生/);
  await page.getByTestId("end-turn").click();
  await expect(page.getByTestId("combat-log")).toContainText(/雨竹寒声|断笔污卷/);
  await expect(page.getByTestId("combat-floats")).toContainText(/入弃牌|虚弱|易伤/);
});

async function startRun(page: Page, characterId: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang"): Promise<void> {
  await page.goto("/");
  await expect(page.getByText("云水江湖")).toBeVisible();
  await page.getByTestId(`character-${characterId}`).click();
  await page.getByTestId("start-run").click();
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
