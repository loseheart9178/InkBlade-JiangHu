import { expect, type Locator, type Page, type TestInfo, test } from "@playwright/test";

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

test("challenge profile can be selected before starting a run", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("challenge-inkRising").click();
  await expect(page.getByTestId("challenge-inkRising")).toHaveClass(/is-selected/);
  await page.getByTestId("start-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-challenge")).toContainText("墨潮压境");
});

test("settings persist reduced motion, mute, and volume controls after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("settings-open").click();
  await page.getByTestId("setting-reduced-motion").check();
  await page.getByTestId("setting-fast-combat-text").check();
  await page.getByTestId("setting-muted").check();
  await page.getByTestId("setting-master-volume").fill("17");
  await page.getByTestId("setting-music-volume").fill("29");
  await page.getByTestId("setting-sfx-volume").fill("41");

  await expect(page.locator("#hud-host")).toHaveClass(/prefers-reduced-motion/);
  await page.reload();

  await expect(page.locator("#hud-host")).toHaveClass(/prefers-reduced-motion/);
  await page.getByTestId("settings-open").click();
  await expect(page.getByTestId("setting-reduced-motion")).toBeChecked();
  await expect(page.getByTestId("setting-fast-combat-text")).toBeChecked();
  await expect(page.getByTestId("setting-muted")).toBeChecked();
  await expect(page.getByTestId("setting-master-volume")).toHaveValue("17");
  await expect(page.getByTestId("setting-music-volume")).toHaveValue("29");
  await expect(page.getByTestId("setting-sfx-volume")).toHaveValue("41");
  await expect(page.getByTestId("continue-run")).toBeDisabled();
});

test("compendium 墨录图鉴 opens from title and filters cards", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("compendium-title-open").click();
  await expect(page.getByTestId("screen-compendium")).toBeVisible();
  await expect(page.getByTestId("screen-compendium")).toContainText("墨录图鉴");
  await expect(page.getByTestId("screen-compendium")).toHaveAttribute("data-unlocked-count", "0");
  const lockedCount = Number(await page.getByTestId("screen-compendium").getAttribute("data-locked-count"));
  const referenceCount = Number(await page.getByTestId("screen-compendium").getAttribute("data-reference-count"));
  expect(lockedCount).toBeGreaterThan(0);
  expect(referenceCount).toBeGreaterThan(0);

  await page.getByTestId("compendium-tab-story").click();
  await expect(page.getByTestId("compendium-item").first()).toHaveAttribute("data-unlock-state", "locked");
  await expect(page.getByTestId("compendium-unlock-badge").first()).toContainText("未录");
  await page.getByTestId("compendium-filter-unlock").selectOption("locked");
  await expect(page.getByTestId("compendium-item").first()).toHaveAttribute("data-unlock-state", "locked");
  await page.getByTestId("compendium-filter-unlock").selectOption("reference");
  await expect(page.getByTestId("compendium-empty")).toBeVisible();

  await page.getByTestId("compendium-tab-cards").click();
  await expect(page.getByTestId("compendium-item").first()).toHaveAttribute("data-unlock-state", "reference");
  await page.getByTestId("compendium-filter-character").selectOption("zhaoyun");
  await page.getByTestId("compendium-filter-rarity").selectOption("starter");

  await expect(page.getByTestId("compendium-item").first()).toContainText(/枪击|架枪|龙胆/);
  await expect(page.getByTestId("screen-compendium")).not.toContainText("素刃");

  await page.getByTestId("compendium-back").click();
  await expect(page.getByTestId("screen-title")).toBeVisible();
});

test("public playable surface hides internal debug shortcuts by default", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByTestId("screen-title")).toBeVisible();
  await expect(page.getByTestId("debug-run-summary")).toHaveCount(0);
  await expect(page.getByTestId("debug-ending-summary")).toHaveCount(0);
  await expect(page.getByTestId("debug-final-route")).toHaveCount(0);

  await page.getByTestId("character-zhaoyun").click();
  await page.getByTestId("start-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("debug-skip-chapter")).toHaveCount(0);
});

test("run summary shell opens from the title debug entry", async ({ page }) => {
  await page.goto("/?debug=1");

  await page.getByTestId("debug-run-summary").click();
  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  const statCount = await page.getByTestId("run-summary-stat").count();
  expect(statCount).toBeGreaterThan(2);
});

test("profile goals surface opens from the title debug profile shell", async ({ page }) => {
  await page.goto("/?debug=1");

  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("profile-goals-list")).toBeVisible();
  await expect(page.getByTestId("profile-goal-item").first()).toContainText(/初入江湖|一卷定尘/);
});

test("run ledger appears in the title debug profile shell", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("debug-ending-summary").click();

  await expect(page.getByTestId("profile-run-ledger")).toBeVisible();
  await expect(page.getByTestId("profile-run-record").first()).toContainText(/赵云|胜利|清悟|封印/);

  await page.reload();
  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("profile-run-ledger")).toBeVisible();
  await expect(page.getByTestId("profile-best-run")).toContainText(/赵云|4/);
});

test("challenge goal completes from selected debug ending and persists", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("challenge-inkRising").click();
  await page.getByTestId("debug-ending-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  const challengeGoal = page.locator('[data-testid="profile-goal-item"][data-profile-goal-id="goal_ink_rising_clear"]');
  await expect(challengeGoal).toHaveClass(/is-complete/);
  await expect(challengeGoal).toHaveClass(/is-new/);

  await page.reload();
  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(challengeGoal).toHaveClass(/is-complete/);
});

test("debug skip advances to the next chapter and refreshes the map backdrop", async ({ page }) => {
  await startRun(page, "zhaoyun", { debugTools: true });

  await expect(page.getByTestId("screen-map")).toHaveAttribute("data-battlefield", "luoshui");
  await page.getByTestId("debug-skip-chapter").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("screen-map")).toHaveAttribute("data-battlefield", "bamboo");
  await expect(page.getByTestId("screen-map")).toHaveClass(/chapter-panel--bamboo/);
  await expect(page.getByTestId("run-chapter")).toContainText("竹林听雨");
  await expect(page.getByText("调试跳章：竹林听雨已展开。")).toBeVisible();

  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toHaveAttribute("data-battlefield", "bamboo");
  await expect(page.getByTestId("onboarding-hint-combat-energy")).toBeVisible();
  const dismissedHints = await page.evaluate(() => {
    const raw = window.localStorage.getItem("inkblade-jianghu:desktop-settings:v1");
    return raw ? JSON.parse(raw).settings?.dismissedOnboardingHintIds ?? [] : [];
  });
  expect(dismissedHints).toEqual([]);
});

test("first combat onboarding hints are compact, dismissible, and persisted", async ({ page }) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-battle-1").click();

  await expect(page.getByTestId("onboarding-hint-combat-energy")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-combat-hand")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-combat-intent")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-combat-block")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-combat-end-turn")).toBeVisible();
  await expect(page.getByTestId("end-turn")).toBeEnabled();
  await expect(page.locator(".combat-card:not([disabled])").first()).toBeEnabled();

  await page.getByTestId("onboarding-dismiss-combat-energy").click();

  await expect(page.getByTestId("onboarding-hint-combat-energy")).toBeHidden();
  await expect(page.getByTestId("onboarding-hint-combat-hand")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("continue-run")).toBeEnabled();
  await page.getByTestId("continue-run").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-combat-energy")).toBeHidden();
  await expect(page.getByTestId("onboarding-hint-combat-hand")).toBeVisible();
});

test("map and reward tutorial hints render, dismiss, and persist through continue", async ({ page }) => {
  await startRun(page, "zhaoyun");

  await expect(page.getByTestId("surface-hint-map-route")).toBeVisible();
  await expect(page.getByTestId("surface-hint-map-mind")).toBeVisible();
  await expect(page.getByTestId("surface-hint-map-ink")).toBeVisible();

  await page.getByTestId("surface-hint-dismiss-map-route").click();
  await expect(page.getByTestId("surface-hint-map-route")).toHaveCount(0);
  await expect(page.getByTestId("surface-hint-map-mind")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("continue-run")).toBeEnabled();
  await page.getByTestId("continue-run").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("surface-hint-map-route")).toHaveCount(0);
  await expect(page.getByTestId("surface-hint-map-mind")).toBeVisible();
  await expect(page.getByTestId("surface-hint-map-ink")).toBeVisible();

  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("onboarding-hint-character-zhaoyun")).toBeVisible();

  await winVisibleCombat(page);

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await expect(page.getByTestId("surface-hint-reward-choice")).toBeVisible();
});

test("method reward onboarding hint appears after the first elite victory", async ({ page }) => {
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
  await expect(page.getByTestId("surface-hint-method-overview")).toBeVisible();
});

test("route map shows risk and reward previews before choosing nodes", async ({ page }, testInfo) => {
  await startRun(page, "zhaoyun", { debugTools: true });

  await expect(page.getByTestId("route-cinematic-header")).toBeVisible();
  await expect(page.getByTestId("route-cinematic-header")).toContainText("洛水残照");
  await expect(page.getByTestId("route-cinematic-header")).toContainText(/行旅线报|第1幕|下一卷|竹林听雨/);
  await expect(page.getByTestId("route-journey-strip")).toBeVisible();
  await expect(page.locator(".route-journey-step").first()).toHaveAttribute("data-route-step-state", "current");
  await expect(page.getByTestId("route-journey-strip")).toContainText(/落脚|可选|首领幕/);
  await expect(page.getByTestId("route-signal-stack")).toContainText(/当前|可行|下一卷/);
  const currentNode = page.getByTestId("map-node-start");
  await expect(currentNode).toHaveAttribute("data-route-state", "current");
  await expect(currentNode.getByTestId("map-node-state-start")).toContainText("当前");
  await expect(page.getByTestId("route-connectors")).toBeVisible();
  await expect(page.getByTestId("route-connector-start-battle-1")).toHaveAttribute("data-route-connector-state", "available");
  await expect(page.getByTestId("route-connector-start-event-1")).toHaveAttribute("data-route-connector-state", "available");
  await expect(page.getByTestId("route-connector-battle-1-shop-1")).toHaveAttribute("data-route-connector-state", "locked");

  const battleNode = page.getByTestId("map-node-battle-1");
  await expect(battleNode).toHaveAttribute("data-route-state", "available");
  await expect(battleNode.getByTestId("map-node-state-battle-1")).toContainText("可走");
  await expect(page.getByTestId("map-node-preview-battle-1")).toContainText(/最高攻势8|金币\+12/);
  await expect(page.getByTestId("map-node-reward-battle-1")).toContainText("金币+12 / 三选一武学");
  await expect(page.getByTestId("map-node-preview-event-1")).toContainText(/护住哭声|心境/);
  await expect(page.getByTestId("map-node-reward-event-1")).toContainText("事件收益 / 代价");
  await expect(page.getByTestId("map-node-preview-shop-1")).toContainText("当前铜钱99");
  await expect(page.getByTestId("map-node-reward-shop-1")).toContainText("消费铜钱 / 调整牌组");
  await expect(page.getByTestId("map-node-preview-rest-1")).toContainText("回复约30%生命");
  await capturePlaytestScreenshot(page, testInfo, "wave32-route-map-surface.png");

  await page.getByTestId("debug-skip-chapter").click();

  await expect(page.getByTestId("route-cinematic-header")).toContainText("竹林听雨");
  await expect(page.getByTestId("route-cinematic-header")).toContainText(/第2幕|下一卷|长安墨城/);
  await expect(page.locator(".route-journey-step").first()).toHaveAttribute("data-route-step-state", "current");
  await expect(page.getByTestId("route-journey-strip")).toContainText(/落脚|可选|首领幕/);
  await expect(page.getByTestId("map-node-preview-battle-1")).toContainText(/最高攻势|金币\+12/);
  await expect(page.getByTestId("map-node-preview-event-1")).toContainText(/荒寺夜琴|心境/);
});

test("ending summary records and persists profile summary", async ({ page }, testInfo) => {
  await page.goto("/?debug=1");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("debug-ending-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("run-summary-dossier")).toContainText("隐藏清悟");
  await expect(page.getByTestId("run-summary-scroll")).toBeVisible();
  await expect(page.getByTestId("run-summary-restart")).toBeVisible();
  await expect(page.getByTestId("ending-summary")).toBeVisible();
  await expect(page.getByTestId("ending-id")).toContainText("ending_hidden_wu");
  await expect(page.getByTestId("ending-title")).toContainText("隐藏清悟");
  await expect(page.getByTestId("character-epilogue-title")).toContainText("长坂无名");
  await expect(page.getByTestId("run-build-recap")).toBeVisible();
  await expect(page.getByTestId("run-build-primary")).toContainText(/尚未成型|流/);
  await expect(page.getByTestId("run-build-signature-card").first()).toContainText(/枪击|架枪|龙胆|突刺/);
  await expect(page.getByTestId("run-summary-character")).toContainText("赵云");
  await expect(page.getByTestId("run-summary-chapters")).toContainText("4");
  await expect(page.getByTestId("profile-total-runs")).toContainText("1");
  await expect(page.getByTestId("profile-unlocked-endings")).toContainText("隐藏清悟");
  await expect(page.getByTestId("profile-unlocked-epilogues")).toContainText("长坂无名");
  await capturePlaytestScreenshot(page, testInfo, "ending-profile-summary-desktop.png");

  await page.reload();
  await page.getByTestId("debug-run-summary").click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("profile-total-runs")).toContainText("1");
  await expect(page.getByTestId("profile-unlocked-endings")).toContainText("隐藏清悟");
  await expect(page.getByTestId("profile-unlocked-epilogues")).toContainText("长坂无名");
});

test("final boss route reaches ending and profile summary", async ({ page }) => {
  test.setTimeout(80_000);
  await page.goto("/?debug=1");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("debug-final-route").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-chapter")).toContainText("墨渊照心");
  await expect(page.getByText("黑水镜尽头只余无名史官")).toBeVisible();
  await expect(page.getByTestId("map-node-boss")).toContainText("无名史官");
  await page.getByTestId("map-node-boss").click();

  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("enemy-hp")).toContainText("无名史官");

  await winVisibleCombat(page, 120, "screen-chapter-reward");

  await expect(page.getByTestId("screen-chapter-reward")).toBeVisible();
  await expect(page.getByTestId("chapter-transition-hero")).toContainText("墨渊照心");
  await expect(page.getByTestId("transition-cinematic-rail")).toBeVisible();
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText("墨渊照心");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText(/章末悟境|终局选择/);
  await expect(page.getByTestId("chapter-spoils-dossier")).toContainText(/铜钱|战利/);
  await page.getByTestId("chapter-reward-choice").first().click();
  await expect(page.getByTestId("screen-boss-reward")).toBeVisible();
  await expect(page.getByTestId("boss-transition-hero")).toContainText("终页将启");
  await expect(page.getByTestId("transition-next-chapter")).toContainText("终局选择");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText("终局选择");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText(/墨渊照心|换幕战利/);
  await page.getByTestId("boss-reward-continue").click();

  await expect(page.getByTestId("screen-final-choice")).toBeVisible();
  await expect(page.getByTestId("final-choice-ritual")).toContainText("墨书终页");
  await expect(page.getByTestId("final-choice-eligible-count")).toContainText(/1\/4|2\/4|3\/4|4\/4/);
  await expect(page.getByTestId("chapter-transition-progress")).toContainText("墨渊照心");
  await expect(page.getByTestId("screen-final-choice")).toHaveAttribute("data-final-choice-count", "4");
  await expect(page.getByTestId("final-choice-option")).toContainText(["封印墨渊", "焚毁墨书", "接管墨书", "与心魔合一"]);
  await expect(page.getByTestId("final-choice-option").filter({ hasText: "封印墨渊" })).toHaveAttribute("data-choice-eligible", "true");
  await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toHaveAttribute("data-choice-eligible", "false");
  await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toHaveAttribute("data-choice-requirement", /怒意足够/);
  await expect(page.getByTestId("final-choice-option").filter({ hasText: "焚毁墨书" })).toContainText("未满足");
  await expect(page.getByTestId("final-choice-option").filter({ hasText: "放下笔" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("continue-run")).toBeEnabled();
  await page.getByTestId("continue-run").click();
  await expect(page.getByTestId("screen-final-choice")).toBeVisible();
  await page.getByTestId("logbook-open").click();
  await expect(page.getByTestId("screen-logbook")).toBeVisible();
  await page.getByTestId("logbook-back").click();
  await expect(page.getByTestId("screen-final-choice")).toBeVisible();
  await page.getByTestId("final-choice-option").filter({ hasText: "封印墨渊" }).click();

  await expect(page.getByTestId("screen-run-summary")).toBeVisible();
  await expect(page.getByTestId("run-summary-dossier")).toContainText("清明封印");
  await expect(page.getByTestId("run-summary-scroll")).toBeVisible();
  await expect(page.getByTestId("ending-summary")).toBeVisible();
  await expect(page.getByTestId("ending-title")).toContainText("清明封印");
  await expect(page.getByTestId("character-epilogue-title")).toContainText("白龙归阵");
  await expect(page.getByTestId("run-summary-character")).toContainText("赵云");
  await expect(page.getByTestId("run-summary-chapters")).toContainText("4");
  await expect(page.getByTestId("profile-total-runs")).toContainText("1");
  await expect(page.getByTestId("profile-unlocked-endings")).not.toContainText("未解锁");
  await expect(page.getByTestId("profile-unlocked-epilogues")).toContainText("白龙归阵");
});

test("defeat result presents a dossier and clears saved continue", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("start-run").click();
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();

  for (let turn = 0; turn < 24; turn += 1) {
    if (await page.getByTestId("screen-defeat").isVisible().catch(() => false)) {
      break;
    }

    await page.getByTestId("end-turn").click();
  }

  await expect(page.getByTestId("screen-defeat")).toBeVisible();
  await expect(page.getByTestId("result-dossier")).toContainText("梦醒卷宗");
  await expect(page.getByTestId("result-character")).toContainText("赵云");
  await expect(page.getByTestId("result-chapter")).toContainText("洛水残照");
  await expect(page.getByTestId("result-restart")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("continue-run")).toBeDisabled();
});

test("boots, enters a Zhao Yun battle, wins, and returns to the route map", async ({ page }, testInfo) => {
  await startRun(page, "zhaoyun");

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-archetype")).toContainText("流派");
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toBeVisible();
  await expect(page.getByTestId("deck-archetype-summary")).toContainText("当前流派");
  await expect(page.getByTestId("deck-build-compass")).toBeVisible();
  await expect(page.getByTestId("deck-build-primary")).toContainText(/当前流派|尚未成型|流/);
  await expect(page.getByTestId("deck-build-signature-card").first()).toContainText(/枪击|架枪|龙胆/);
  await expect(page.getByTestId("deck-card")).toHaveCount(10);
  await expect(page.getByTestId("deck-card").first().getByTestId("card-cost")).toBeVisible();
  await expectCardArtWindowClear(page.getByTestId("deck-card").first());
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
  await expect(page.getByTestId("combat-intent-title")).toContainText("杀意");
  await expect(page.getByTestId("combat-intent-detail")).toContainText("造成6点伤害。");
  await expect(page.getByTestId("combat-intent-chip").first()).toContainText("伤害 6");
  await expect(page.getByTestId("combat-build-readout")).toContainText("法宝 白龙枪缨");
  await expect(page.getByTestId("combat-build-readout")).toContainText("心法 未定");
  await capturePlaytestScreenshot(page, testInfo, "wave33-combat-readability.png");

  await winVisibleCombat(page);

  await expect(page.getByTestId("screen-reward")).toBeVisible();
  await expect(page.getByTestId("reward-combo-hint")).toContainText("招式回响");
  await expect(page.getByTestId("reward-card").first()).toHaveAttribute("data-combo-biased", "true");
  await expect(page.getByTestId("reward-card").first().getByTestId("card-cost")).toBeVisible();
  await expect(page.getByTestId("reward-card").first()).toHaveClass(/reward-card--kit/);
  await expect(page.getByTestId("reward-card").first()).toHaveAttribute("style", /--ui-kit-card-frame/);
  await expect(page.getByTestId("reward-card").first().locator(".card-art")).toHaveClass(/card-art--kit/);
  await expectCardArtWindowClear(page.getByTestId("reward-card").first());
  await expect(page.getByTestId("reward-reason").first()).toContainText("流派");
  await expect(page.getByTestId("reward-archetype-role").first()).toContainText(/主线强化|副线补强|通用补短/);
  await expect(page.getByTestId("reward-build-fit").first()).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
  await expect(page.getByTestId("reward-build-fit-detail").first()).toContainText(/流|技法|攻击|墨痕|成型|短板/);
  await expect(page.getByTestId("reward-stage")).toBeVisible();
  await expect(page.getByTestId("reward-stage").getByTestId("reward-scene-header")).toBeVisible();
  await expect(page.getByTestId("reward-scene-header")).toContainText("战利落定");
  await expect(page.getByTestId("reward-card-case")).toBeVisible();
  await expect(page.getByTestId("reward-footer")).toBeVisible();
  await expect(page.getByTestId("screen-reward").locator(".game-message")).not.toHaveCSS("position", "absolute");
  await expectVerticalGap(page.getByTestId("spoils-summary"), page.getByTestId("reward-card").first(), 8);
  await expectVerticalGap(page.getByTestId("reward-card").first(), page.getByTestId("reward-footer"), 8);
  await page.getByTestId("reward-card").first().click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toBeVisible();
  await expect(page.getByTestId("deck-card")).toHaveCount(11);
  await expect(page.getByTestId("deck-viewer")).toContainText(/凡|奇|绝/);
  await expect(page.getByTestId("deck-build-compass")).toBeVisible();
  await expect(page.getByTestId("deck-build-signature-card").first()).toBeVisible();
  await page.getByTestId("deck-close").click();
});

test("shops can add relics after the first battle", async ({ page }, testInfo) => {
  await startRun(page, "zhaoyun");
  await page.getByTestId("map-node-battle-1").click();
  await winVisibleCombat(page);
  await expect(page.getByTestId("reward-skip")).toBeVisible();
  await page.getByTestId("reward-card").first().click();

  await page.getByTestId("map-node-shop-1").click();
  await expect(page.getByTestId("screen-shop")).toBeVisible();
  await expect(page.getByTestId("shop-scene")).toBeVisible();
  await expect(page.getByTestId("shop-scene").getByTestId("shop-scene-header")).toBeVisible();
  await expect(page.getByTestId("shop-scene-header")).toContainText("茶亭游商");
  await expect(page.getByTestId("shop-marquee")).toContainText("铜钱");
  await expect(page.getByTestId("shop-section-cards")).toBeVisible();
  await expect(page.getByTestId("shop-section-relics")).toBeVisible();
  await expect(page.getByTestId("shop-section-services")).toBeVisible();
  await expectVerticalGap(page.getByTestId("shop-section-cards"), page.getByTestId("shop-section-relics"), 8);
  await expectVerticalGap(page.getByTestId("shop-section-relics"), page.getByTestId("shop-section-services"), 8);
  const travelCard = page.getByTestId("shop-card-travel");
  await expect(travelCard).toHaveClass(/shop-item--card/);
  await expect(travelCard).toHaveClass(/shop-item--kit/);
  await expect(travelCard).toHaveAttribute("style", /--ui-kit-card-frame/);
  await expect(travelCard.locator(".card-art")).toHaveClass(/card-art--kit/);
  await expect(travelCard).toContainText("行旅常备");
  await expect(travelCard).toContainText("补气护身");
  await expect(travelCard.locator(".card-art")).toBeVisible();
  await expect(travelCard.locator(".card-chrome-row")).toBeVisible();
  await expect(travelCard.locator(".card-keyword-row")).toBeVisible();
  await expect(travelCard.getByTestId("card-cost")).toBeVisible();
  await expectCardArtWindowClear(travelCard);
  await expect(travelCard.locator(".shop-price-chip")).toContainText("35");
  await expect(travelCard.getByTestId("shop-build-fit")).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
  await expect(travelCard.getByTestId("shop-build-fit-detail")).toContainText(/流|技法|攻击|墨痕|成型|短板/);
  await expect(travelCard).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);

  const roleCard = page.getByTestId("shop-card-role");
  await expect(roleCard).toContainText("门路秘招");
  await expect(roleCard.locator(".shop-slot-note")).toContainText("当前角色");
  await expect(roleCard.getByTestId("shop-build-fit")).toContainText(/顺势精进|另开支路|补足周旋|墨灾取势|开局定向/);
  await expect(roleCard.getByTestId("shop-build-fit-detail")).toContainText(/流|技法|攻击|墨痕|成型|短板/);
  await expect(roleCard).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);

  const inkCard = page.getByTestId("shop-card-ink");
  await expect(inkCard).toContainText("偏门异货");
  await expect(inkCard.locator(".shop-slot-note")).toContainText("更冒险");
  await expect(inkCard.getByTestId("shop-build-fit")).toContainText("墨灾取势");
  await expect(inkCard.getByTestId("shop-build-fit-detail")).toContainText("墨痕");
  await expect(inkCard).toHaveAttribute("data-build-fit-tone", "risk");

  const roleRelic = page.getByTestId("shop-relic-role");
  await expect(roleRelic).toHaveClass(/shop-item--relic/);
  await expect(roleRelic).not.toHaveClass(/shop-item--kit/);
  await expect(roleRelic).toContainText("角色法门");
  await expect(roleRelic).toContainText(/凡|奇|绝/);
  await expect(roleRelic.locator(".shop-slot-note")).toContainText("流派");
  await expect(roleRelic.locator(".shop-price-chip")).toContainText(/铜钱/);
  await expect(page.getByTestId("shop-relic-fit")).toHaveCount(3);
  await expect(roleRelic.getByTestId("shop-relic-fit")).toContainText(/流派共鸣|本命支路|开局法门|通用稳固|墨灾奇物|心境辅佐/);
  await expect(roleRelic.getByTestId("shop-relic-fit-detail")).toContainText(/流|墨痕|心境|所有流派|长期/);
  await expect(roleRelic).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);

  const premiumRelic = page.getByTestId("shop-relic-premium");
  await expect(premiumRelic).toContainText("压箱珍藏");
  await expect(premiumRelic.locator(".shop-slot-note")).toContainText("值得围着它构筑");
  await expect(premiumRelic.getByTestId("shop-relic-fit")).toContainText(/流派共鸣|本命支路|开局法门|通用稳固|墨灾奇物|心境辅佐/);
  await expect(premiumRelic.getByTestId("shop-relic-fit-detail")).toContainText(/流|墨痕|心境|所有流派|长期/);
  await expect(premiumRelic).toHaveAttribute("data-build-fit-tone", /main|branch|utility|risk/);

  const removeService = page.getByTestId("shop-remove-card");
  await expect(removeService).toHaveClass(/shop-item--service/);
  await expect(removeService).not.toHaveClass(/shop-item--kit/);
  await expect(removeService.locator(".shop-service-target")).toContainText("枪击");
  await expect(removeService.locator(".shop-price-chip")).toContainText("50");
  await capturePlaytestScreenshot(page, testInfo, "wave31-shop-surface.png");

  await page.getByTestId("shop-relic-role").click();

  await expect(page.getByText(/^购得法宝：/)).toBeVisible();
  await expect(page.getByTestId("shop-relic-role")).toBeDisabled();
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
  await expect(page.getByTestId("event-layout")).toBeVisible();
  await expect(page.getByTestId("event-layout").getByTestId("event-scene-header")).toBeVisible();
  await expect(page.getByTestId("event-scene-header")).toContainText("长坂回声");
  await expect(page.getByTestId("event-hero")).toBeVisible();
  await expect(page.getByTestId("event-choices")).toBeVisible();
  await expectNoOverlap(page.getByTestId("event-hero"), page.getByTestId("event-choices"));
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--changban/);
  await expect(page.locator("[data-testid^='event-choice-']")).toHaveCount(2);
  await expect(page.getByTestId("event-choice-guard_cry")).toBeVisible();
  await page.getByTestId("event-choice-carve_names").click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText("长坂回声：刻下无名者")).toBeVisible();
  await expect(page.getByTestId("run-mind-tendencies")).toContainText("宁1");
  await page.getByTestId("map-node-rest-1").click();
  await expect(page.getByTestId("screen-rest")).toBeVisible();
  await expect(page.getByTestId("rest-scene")).toBeVisible();
  await expect(page.getByTestId("rest-scene").getByTestId("rest-scene-header")).toBeVisible();
  await expect(page.getByTestId("rest-scene-header")).toContainText("废寺静修");
  await expect(page.getByTestId("rest-hero")).toBeVisible();
  await expect(page.getByTestId("rest-actions")).toBeVisible();
  await expectNoOverlap(page.getByTestId("rest-hero"), page.getByTestId("rest-actions"));
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

test("墨录图鉴 compendium opens from map and returns to the previous run screen", async ({ page }) => {
  await startRun(page, "zhaoyun");

  await expect(page.getByTestId("screen-map")).toBeVisible();
  const savedRunBefore = await page.evaluate(() => JSON.stringify(JSON.parse(window.localStorage.getItem("inkblade-jianghu:run-save:v1") ?? "{}").state.run));
  await page.getByTestId("compendium-open").click();

  await expect(page.getByTestId("screen-compendium")).toBeVisible();
  await expect(page.getByTestId("screen-compendium")).toContainText("招式链");
  await page.getByTestId("compendium-tab-enemies").click();
  await page.getByTestId("compendium-filter-chapter").selectOption("luoshui");
  await expect(page.getByTestId("screen-compendium")).toContainText("墨影董卓");

  await page.getByTestId("compendium-back").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("run-chapter")).toContainText("洛水残照");
  const savedRunAfter = await page.evaluate(() => JSON.stringify(JSON.parse(window.localStorage.getItem("inkblade-jianghu:run-save:v1") ?? "{}").state.run));
  expect(savedRunAfter).toBe(savedRunBefore);
});

test("Diao Chan starting relic applies charm and weak at combat start", async ({ page }) => {
  await startRun(page, "diaochan");
  await expect(page.getByTestId("run-relics")).toContainText("闭月香囊");
  await page.getByTestId("map-node-battle-1").click();
  await expect(page.getByTestId("screen-combat")).toBeVisible();
  await expect(page.getByTestId("combat-log")).toContainText("闭月香囊");
  await expect(page.getByTestId("combat-floats")).toContainText("闭月香囊");
  await expect(page.getByTestId("combat-build-readout")).toContainText("法宝 闭月香囊");
  await expect(page.getByTestId("combat-intent-detail")).toBeVisible();
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

test("Cai Wenji event route presents polished choice effects and logbook feedback", async ({ page }, testInfo) => {
  await startRun(page, "caiwenji");
  await page.getByTestId("map-node-event-1").click();

  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--score/);
  await expect(page.getByTestId("event-kicker")).toContainText("蔡文姬");
  await expect(page.getByTestId("event-effect-chip").first()).toBeVisible();
  await expect(page.getByTestId("event-effect-chip").first()).toHaveAttribute("data-effect-tone", /gain|mind|ink|cost/);
  await expect(page.locator("[data-testid='event-effect-chip']").filter({ hasText: /获得|心境|墨灾|生命|铜钱/ }).first()).toBeVisible();

  await capturePlaytestScreenshot(page, testInfo, "wave30-caiwenji-event-surface.png");
  await page.locator("[data-testid^='event-choice-']").first().click();

  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByText(/墨录 \+1/)).toBeVisible();
  await expect(page.getByTestId("run-logbook")).toContainText("1");
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

test("Zhuge Liang event route uses a distinct star-board event scene", async ({ page }, testInfo) => {
  await startRun(page, "zhugeliang");
  await page.getByTestId("map-node-event-1").click();

  await expect(page.getByTestId("screen-event")).toBeVisible();
  await expect(page.getByTestId("event-scene")).toHaveClass(/event-scene--stars/);
  await expect(page.getByTestId("event-kicker")).toContainText("诸葛亮");
  await expect(page.locator("[data-testid='event-effect-chip']").filter({ hasText: /星门|悟|墨灾/ }).first()).toBeVisible();

  await capturePlaytestScreenshot(page, testInfo, "wave30-zhugeliang-event-surface.png");
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
  await expect(page.locator(".combat-standee--enemy")).toHaveClass(/is-attacking/);
  await expect(page.getByTestId("combat-standee-enemy")).toHaveAttribute("src", /gpt2-ink-dongzhuo-boss-standee-cutout\.png$/);
  await expect(page.getByTestId("combat-sprite-enemy")).toHaveCSS("background-image", /ink-dongzhuo-boss-attack-strip-gpt-v2\.png/);
  await expect(page.getByTestId("combat-sprite-enemy")).not.toHaveCSS("background-image", /enemy-slash-strip\.svg/);
  await expect(page.getByTestId("combat-log")).toContainText("宫宴压迫");
  await expect(page.getByTestId("player-status")).toContainText("墨痕 1");
  await winVisibleCombat(page, 140, "screen-method-reward");
  await expect(page.getByTestId("screen-method-reward")).toBeVisible();
  await page.locator("[data-testid^='method-choice-']").first().click();
  await expect(page.getByTestId("screen-chapter-reward")).toBeVisible();
  await expect(page.getByTestId("chapter-transition-hero")).toContainText("洛水残照");
  await expect(page.getByTestId("chapter-transition-progress")).toContainText("竹林听雨");
  await expect(page.getByTestId("transition-cinematic-rail")).toBeVisible();
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText("洛水残照");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText(/章末悟境|竹林听雨/);
  await expect(page.getByTestId("chapter-spoils-dossier")).toContainText(/铜钱|战利/);
  await expect(page.getByTestId("chapter-reward-choice")).toHaveCount(3);
  await expect(page.getByTestId("advanced-reward-choice")).toHaveCount(4);
  await page.getByTestId("advanced-reward-choice").first().click();
  await expect(page.getByTestId("run-archetype")).toBeVisible();
  await page.getByTestId("deck-open").click();
  await expect(page.getByTestId("deck-viewer")).toContainText(/七星枪影|单骑救主|七进七出|枪围如墙/);
  await page.getByTestId("deck-close").click();
  await page.getByTestId("chapter-reward-choice").first().click();
  await expect(page.getByTestId("screen-boss-reward")).toBeVisible();
  await expect(page.getByTestId("boss-transition-hero")).toContainText("洛水残照");
  await expect(page.getByTestId("transition-next-chapter")).toContainText("第二章 · 竹林听雨");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText("洛水残照");
  await expect(page.getByTestId("transition-cinematic-rail")).toContainText(/换幕战利|竹林听雨/);
  await page.getByTestId("boss-reward-continue").click();
  await expect(page.getByTestId("screen-map")).toBeVisible();
  await expect(page.getByTestId("screen-map")).toHaveAttribute("data-battlefield", "bamboo");
  await expect(page.getByTestId("screen-map")).toHaveClass(/chapter-panel--bamboo/);
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

async function startRun(
  page: Page,
  characterId: "zhaoyun" | "diaochan" | "caiwenji" | "zhugeliang",
  options: { debugTools?: boolean } = {}
): Promise<void> {
  await page.goto(options.debugTools ? "/?debug=1" : "/");
  await expect(page.getByText("云水江湖")).toBeVisible();
  await page.getByTestId(`character-${characterId}`).click();
  const start = page.getByTestId("start-run");
  await expect(start).toBeEnabled();
  await start.click();
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
  expect(screenshot.byteLength).toBeLessThan(5 * 1024 * 1024);
  await testInfo.attach(fileName, { path, contentType: "image/png" });
}

async function expectVerticalGap(upper: Locator, lower: Locator, minimumGap: number): Promise<void> {
  const upperBox = await upper.boundingBox();
  const lowerBox = await lower.boundingBox();

  expect(upperBox).not.toBeNull();
  expect(lowerBox).not.toBeNull();
  expect(lowerBox!.y - (upperBox!.y + upperBox!.height)).toBeGreaterThanOrEqual(minimumGap);
}

async function expectCardArtWindowClear(card: Locator): Promise<void> {
  const metrics = await card.evaluate((item) => {
    const readRect = (element: Element | null) => {
      if (!element) {
        return undefined;
      }
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
      };
    };
    const overlaps = (first?: ReturnType<typeof readRect>, second?: ReturnType<typeof readRect>) =>
      Boolean(first && second
        && first.x < second.right
        && first.right > second.x
        && first.y < second.bottom
        && first.bottom > second.y);

    const art = readRect(item.querySelector(".card-art"));
    const image = item.querySelector<HTMLImageElement>(".card-art img");
    const cardRect = readRect(item);
    const naturalRatio = image && image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : 1;
    const artRatio = art ? art.height / art.width : 0;
    const controls = [
      item.querySelector(".card-cost"),
      item.querySelector("strong"),
      item.querySelector(".card-chrome-row"),
      item.querySelector(".card-type-line"),
      item.querySelector(".card-keyword-row"),
      item.querySelector(".card-description")
    ];

    return {
      artRatio,
      artHeightShare: art && cardRect ? art.height / cardRect.height : 0,
      objectFit: image ? getComputedStyle(image).objectFit : "",
      portraitWindowForPortraitImage: naturalRatio > 1.25 ? artRatio > 1 : true,
      overlapsArt: controls.some((control) => overlaps(readRect(control), art))
    };
  });

  expect(metrics.objectFit).toBe("contain");
  expect(metrics.portraitWindowForPortraitImage).toBe(true);
  expect(metrics.artHeightShare).toBeGreaterThanOrEqual(0.25);
  expect(metrics.overlapsArt).toBe(false);
}

async function expectNoOverlap(first: Locator, second: Locator): Promise<void> {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(rectsOverlap(firstBox!, secondBox!)).toBe(false);
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
