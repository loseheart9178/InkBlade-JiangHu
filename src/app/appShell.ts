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

  const zhaoButton = document.createElement("button");
  zhaoButton.type = "button";
  zhaoButton.dataset.characterId = "zhaoyun";
  zhaoButton.dataset.testid = "character-zhaoyun";
  zhaoButton.className = "character-choice is-selected";
  zhaoButton.textContent = "赵云";

  const diaoButton = document.createElement("button");
  diaoButton.type = "button";
  diaoButton.dataset.characterId = "diaochan";
  diaoButton.dataset.testid = "character-diaochan";
  diaoButton.className = "character-choice";
  diaoButton.textContent = "貂蝉";

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

  characterSelect.append(zhaoButton, diaoButton);
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
