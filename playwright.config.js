// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests sequentially for WhatsApp automation */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries for manual WhatsApp tests */
  retries: 0,
  /* Single worker for WhatsApp automation */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  /* Timeout for WhatsApp automation (5 minutes) */
  timeout: 300000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace on failure for debugging */
    trace: 'on-first-retry',
    /* Screenshots for all tests */
    screenshot: 'only-on-failure',
    /* Video recording for all tests */
    video: 'on',
    /* Longer timeout for actions */
    actionTimeout: 60000,
    /* Longer timeout for navigation */
    navigationTimeout: 60000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-whatsapp',
      use: { 
        ...devices['Desktop Chrome'],
        /* Launch browser in headed mode for QR scanning */
        headless: false,
        /* Larger viewport for WhatsApp Web */
        viewport: { width: 1400, height: 900 },
        /* Launch options with anti-detection settings */
        launchOptions: {
          args: [
            '--no-first-run',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox'
          ]
        }
      },
    },

    // Commented out other browsers as WhatsApp automation typically uses Chrome
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
