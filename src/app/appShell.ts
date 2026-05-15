import { characterList } from "../game/content/characters";
import { challengeProfiles, type ChallengeProfileId } from "../game/content/challenges";

const characterChoiceCopy: Record<string, { role: string; mechanic: string; motif: string }> = {
  zhaoyun: {
    role: "白龙枪胆",
    mechanic: "破阵连攻",
    motif: "孤勇护主"
  },
  diaochan: {
    role: "闭月舞影",
    mechanic: "魅惑闪避",
    motif: "宫灯离间"
  },
  caiwenji: {
    role: "胡笳琴心",
    mechanic: "净化余韵",
    motif: "琴音续势"
  },
  zhugeliang: {
    role: "卧龙星盘",
    mechanic: "观星布阵",
    motif: "借风控局"
  }
};

export interface AppShell {
  root: HTMLElement;
  phaserHost: HTMLDivElement;
  hudHost: HTMLDivElement;
  startButton: HTMLButtonElement;
  continueButton: HTMLButtonElement;
  clearSaveButton: HTMLButtonElement;
  challengeButtons: HTMLButtonElement[];
}

export function createAppShell(root: HTMLElement): AppShell {
  root.innerHTML = "";
  root.className = "inkblade-app";

  const phaserHost = document.createElement("div");
  phaserHost.id = "phaser-host";
  phaserHost.className = "phaser-host";

  const hudHost = document.createElement("div");
  hudHost.id = "hud-host";
  hudHost.className = "hud-host ui-kit-visual-qa";
  hudHost.dataset.uiKitGates = "3-8";

  const menu = document.createElement("section");
  menu.className = "title-screen title-screen--kit";
  menu.setAttribute("aria-label", "主菜单");

  const title = document.createElement("h1");
  title.textContent = "云水江湖";

  const subtitle = document.createElement("p");
  subtitle.textContent = "以墨为刃，以心为牌";

  const titleSeal = document.createElement("div");
  titleSeal.className = "title-seal";
  titleSeal.setAttribute("aria-hidden", "true");
  titleSeal.textContent = "墨";

  const kicker = document.createElement("p");
  kicker.className = "title-kicker";
  kicker.dataset.testid = "title-kicker";
  kicker.textContent = "水墨武侠卡牌构筑 Roguelike";

  const titleLedger = document.createElement("div");
  titleLedger.className = "title-route-ledger title-route-ledger--kit";
  titleLedger.dataset.testid = "title-route-ledger";
  const titleLedgerItems = [
    { label: "执笔者", value: "四位侠客" },
    { label: "江湖卷", value: "四章墨雨" },
    { label: "战斗核", value: "牌组构筑" },
    { label: "终局", value: "心境定稿" }
  ];
  for (const item of titleLedgerItems) {
    const entry = document.createElement("span");
    const label = document.createElement("small");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    entry.append(label, value);
    titleLedger.append(entry);
  }

  const characterSelect = document.createElement("div");
  characterSelect.className = "character-select character-select--kit";

  for (const [index, character] of characterList.entries()) {
    const characterButton = document.createElement("button");
    characterButton.type = "button";
    characterButton.dataset.characterId = character.id;
    characterButton.dataset.testid = `character-${character.id}`;
    characterButton.className = index === 0 ? "character-choice character-choice--kit is-selected" : "character-choice character-choice--kit";
    characterButton.dataset.characterRole = character.id;
    characterButton.setAttribute("aria-pressed", index === 0 ? "true" : "false");

    const copy = characterChoiceCopy[character.id];
    const name = document.createElement("span");
    name.className = "character-choice-name";
    name.dataset.testid = `character-name-${character.id}`;
    name.textContent = character.name;

    const role = document.createElement("span");
    role.className = "character-choice-role";
    role.textContent = copy.role;

    const resource = document.createElement("span");
    resource.className = "character-choice-resource";
    resource.dataset.testid = `character-resource-${character.id}`;
    resource.textContent = `${character.resource.name} ${character.resource.initial}/${character.resource.max}`;

    const mechanic = document.createElement("span");
    mechanic.className = "character-choice-mechanic";
    mechanic.dataset.testid = `character-mechanic-${character.id}`;
    mechanic.textContent = `${copy.mechanic} · ${copy.motif}`;

    const stats = document.createElement("span");
    stats.className = "character-choice-stats";
    stats.dataset.testid = `character-stats-${character.id}`;
    stats.textContent = `生命 ${character.maxHp} · 牌组 ${character.starterDeck.length}`;

    characterButton.setAttribute(
      "aria-label",
      `${character.name}，${copy.role}，${character.resource.name}，${copy.mechanic}`
    );
    characterButton.replaceChildren(name, role, resource, mechanic, stats);
    characterSelect.append(characterButton);
  }

  const challengeSelect = document.createElement("div");
  challengeSelect.className = "challenge-select challenge-select--kit";
  challengeSelect.dataset.testid = "challenge-select";
  const challengeButtons: HTMLButtonElement[] = [];

  for (const [index, challenge] of challengeProfiles.entries()) {
    const challengeButton = document.createElement("button");
    challengeButton.type = "button";
    challengeButton.dataset.challengeId = challenge.id satisfies ChallengeProfileId;
    challengeButton.dataset.testid = `challenge-${challenge.id}`;
    challengeButton.className = index === 0 ? "challenge-choice challenge-choice--kit is-selected" : "challenge-choice challenge-choice--kit";
    challengeButton.setAttribute("aria-pressed", index === 0 ? "true" : "false");

    const name = document.createElement("span");
    name.textContent = challenge.name;

    const summary = document.createElement("small");
    summary.textContent = challenge.summary;

    challengeButton.setAttribute("aria-label", `${challenge.name}，${challenge.summary}`);
    challengeButton.replaceChildren(name, summary);
    challengeSelect.append(challengeButton);
    challengeButtons.push(challengeButton);
  }

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.dataset.testid = "start-run";
  startButton.textContent = "入江湖";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.dataset.testid = "continue-run";
  continueButton.textContent = "继续行旅";

  const clearSaveButton = document.createElement("button");
  clearSaveButton.type = "button";
  clearSaveButton.dataset.testid = "clear-save";
  clearSaveButton.textContent = "清除存档";
  clearSaveButton.style.display = "none"; // Hidden in UI but kept for logic

  const titleActions = document.createElement("div");
  titleActions.className = "title-actions title-actions--kit";
  titleActions.append(startButton, continueButton, clearSaveButton);

  menu.append(titleSeal, kicker, title, subtitle, titleLedger, characterSelect, challengeSelect, titleActions);

  // Create Immersive Character Showcase for the right side
  const characterShowcase = document.createElement("div");
  characterShowcase.className = "character-showcase";

  for (const [index, character] of characterList.entries()) {
    const card = document.createElement("div");
    card.className = `character-showcase-card ${index === 0 ? "is-active" : ""}`;
    card.dataset.characterId = character.id;

    const img = document.createElement("img");
    let standeeSrc = "";
    if (character.id === "zhaoyun") standeeSrc = "/assets/generated/zhaoyun-standee-gpt-v2-cutout.png";
    else if (character.id === "diaochan") standeeSrc = "/assets/generated/diaochan-standee-gpt-v2-cutout.png";
    else if (character.id === "caiwenji") standeeSrc = "/assets/generated/gpt2-caiwenji-standee-cutout.png";
    else if (character.id === "zhugeliang") standeeSrc = "/assets/generated/gpt2-zhugeliang-standee-cutout.png";

    img.src = standeeSrc;
    img.alt = character.name;

    const nameLabel = document.createElement("div");
    nameLabel.className = "character-showcase-card-name";
    nameLabel.textContent = character.name;

    card.append(img, nameLabel);

    // Add click forwarding to original button
    card.addEventListener("click", () => {
      const btn = characterSelect.querySelector(`[data-character-id="${character.id}"]`) as HTMLButtonElement;
      if (btn) btn.click();
    });

    characterShowcase.append(card);
  }

  hudHost.append(menu, characterShowcase);
  root.append(phaserHost, hudHost);

  return {
    root,
    phaserHost,
    hudHost,
    startButton,
    continueButton,
    clearSaveButton,
    challengeButtons
  };
}
