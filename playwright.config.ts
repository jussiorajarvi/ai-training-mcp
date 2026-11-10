import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for e2e tests
 * See https://playwright.dev/docs/intro
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the system-installed Chrome on Windows and macOS instead of
        // Playwright's bundled Chromium download, which hangs during install
        // on some Windows machines. On Linux (CI, Docker Sandboxes, dev
        // containers) Google Chrome is often missing, so use the bundled one.
        channel: isCI || process.platform === 'linux' ? undefined : 'chrome',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
