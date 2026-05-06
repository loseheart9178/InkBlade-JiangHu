import { characterList } from "../game/content/characters";

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
}

export function createAppShell(root: HTMLElement): AppShell {
  root.innerHTML = "";
  root.className = "inkblade-app";

  const phaserHost = document.createElement("div");
  phaserHost.id = "phaser-host";
  phaserHost.className = "phaser-host";

  const hudHost = document.createElement("div");
  hudHost.id = "hud-host";
  hudHost.className = "hud-host";

  const menu = document.createElement("section");
  menu.className = "title-screen";
  menu.setAttribute("aria-label", "主菜单");

  const title = document.createElement("h1");
  title.textContent = "云水江湖";

  const subtitle = document.createElement("p");
  subtitle.textContent = "以墨为刃，以心为牌";

  const kicker = document.createElement("p");
  kicker.className = "title-kicker";
  kicker.dataset.testid = "title-kicker";
  kicker.textContent = "水墨武侠卡牌构筑 Roguelike";

  const characterSelect = document.createElement("div");
  characterSelect.className = "character-select";

  for (const [index, character] of characterList.entries()) {
    const characterButton = document.createElement("button");
    characterButton.type = "button";
    characterButton.dataset.characterId = character.id;
    characterButton.dataset.testid = `character-${character.id}`;
    characterButton.className = index === 0 ? "character-choice is-selected" : "character-choice";

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

  const titleActions = document.createElement("div");
  titleActions.className = "title-actions";
  titleActions.append(startButton, continueButton, clearSaveButton);

  menu.append(kicker, title, subtitle, characterSelect, titleActions);
  hudHost.append(menu);
  root.append(phaserHost, hudHost);

  return {
    root,
    phaserHost,
    hudHost,
    startButton,
    continueButton,
    clearSaveButton
  };
}
