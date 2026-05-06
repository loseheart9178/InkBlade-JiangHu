import { describe, expect, it } from "vitest";
import playwrightConfig from "../playwright.config";

function getSingleWebServer() {
  const webServer = playwrightConfig.webServer;
  return Array.isArray(webServer) ? webServer[0] : webServer;
}

describe("playwright web server runtime", () => {
  it("launches vite with the same node runtime used by the test runner", () => {
    const webServer = getSingleWebServer();

    expect(webServer).toBeDefined();
    expect(webServer?.command).toContain(process.execPath);
    expect(webServer?.command).toContain("node_modules/vite/bin/vite.js");
    expect(webServer?.command).toContain("--host 127.0.0.1");
    expect(webServer?.command).toContain("--port 5173");
    expect(webServer?.command).not.toContain("npm run dev");
    expect(webServer?.url).toBe("http://127.0.0.1:5173");
    expect(webServer?.reuseExistingServer).toBe(true);
  });
});
