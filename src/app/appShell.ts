export interface AppShell {
  root: HTMLElement;
  phaserHost: HTMLDivElement;
  hudHost: HTMLDivElement;
  startButton: HTMLButtonElement;
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

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.dataset.testid = "start-run";
  startButton.textContent = "入江湖";

  menu.append(title, subtitle, startButton);
  hudHost.append(menu);
  root.append(phaserHost, hudHost);

  return {
    root,
    phaserHost,
    hudHost,
    startButton
  };
}

