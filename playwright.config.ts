import { defineConfig, devices } from "@playwright/test";

function quoteCommandPart(value: string): string {
  return `"${value.replace(/"/g, "\\\"")}"`;
}

const viteWebServerCommand = `${quoteCommandPart(process.execPath)} ${quoteCommandPart("./node_modules/vite/bin/vite.js")} --host 127.0.0.1 --port 5173`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: viteWebServerCommand,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
