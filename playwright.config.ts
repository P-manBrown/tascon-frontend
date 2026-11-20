import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "yarn start",
    url: "http://127.0.0.1:3000/login",
    reuseExistingServer: !process.env.CI,
  },
});
