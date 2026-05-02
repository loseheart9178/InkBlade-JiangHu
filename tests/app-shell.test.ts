import { createAppShell } from "../src/app/appShell";

describe("app shell", () => {
  it("creates the canvas host, HUD host, and primary action", () => {
    const root = document.createElement("div");

    const shell = createAppShell(root);

    expect(shell.phaserHost.id).toBe("phaser-host");
    expect(shell.hudHost.id).toBe("hud-host");
    expect(root.querySelector('[data-testid="start-run"]')).not.toBeNull();
    expect(root.textContent).toContain("云水江湖");
  });
});

