import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html'],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        suiteTitle: true,
        categories: [
          {
            name: 'Ignored tests',
            matchedStatuses: ['skipped'],
          },
          {
            name: 'Infrastructure problems',
            matchedStatuses: ['broken', 'failed'],
            messageRegex: '.*timeout.*',
          },
          {
            name: 'Outdated tests',
            matchedStatuses: ['broken'],
            traceRegex: '.*FileNotFound.*',
          },
          {
            name: 'Product defects',
            matchedStatuses: ['failed'],
          },
        ],
      },
    ],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  // Shared settings for all tests
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Global test timeout
    actionTimeout: 10000,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on first retry
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // API Testing project
    {
      name: 'api-tests',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.example.com',
      },
    },
  ],

  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests
  webServer:
    process.env.START_LOCAL_SERVER === 'true'
      ? {
          command: 'npm run dev',
          port: 3000,
          reuseExistingServer: !process.env.CI,
        }
      : undefined,
});
