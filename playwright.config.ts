import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4173", viewport: { width: 390, height: 844 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "PORT=4173 npm start",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "ignore",
  },
});
