import { defineConfig, devices } from "@playwright/test";

// Run against a real environment via BASE_URL (e.g. BASE_URL=https://staging.flairsync.com
// npm run test:e2e), per KAN-71 round 5's "the E2E suite can run against staging" requirement.
// Falls back to a locally-run dev server (npm run dev) for local iteration.
const baseURL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 7"] },
        },
    ],
    // Only start a local dev server when no external BASE_URL was given — against
    // staging, Playwright should talk to the real deployment, not spawn one locally.
    webServer: process.env.BASE_URL
        ? undefined
        : {
              command: "npm run dev",
              url: baseURL,
              reuseExistingServer: true,
              timeout: 120_000,
          },
});
