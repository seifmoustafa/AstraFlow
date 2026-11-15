import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3110';
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir =
  'C:/Users/seifmoustafa/.codex/visualizations/2026/11/14/01a1d77d-6eee-7f20-a7bd-5b3a74964c78/portal-playwright-baseline';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: 'line',
  outputDir,
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'desktop-chrome-installed',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { executablePath },
      },
    },
    {
      name: 'mobile-chrome-installed',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        launchOptions: { executablePath },
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER
    ? undefined
    : {
        command: 'npm run start -- -p 3110 -H 127.0.0.1',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
