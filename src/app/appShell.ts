import { characterList } from "../game/content/characters";

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

  const characterSelect = document.createElement("div");
  characterSelect.className = "character-select";

  for (const [index, character] of characterList.entries()) {
    const characterButton = document.createElement("button");
    characterButton.type = "button";
    characterButton.dataset.characterId = character.id;
    characterButton.dataset.testid = `character-${character.id}`;
    characterButton.className = index === 0 ? "character-choice is-selected" : "character-choice";
    characterButton.textContent = character.name;
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

  menu.append(title, subtitle, characterSelect, titleActions);
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
