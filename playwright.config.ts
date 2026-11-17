import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { perfectoWsEndpoint } from './perfecto';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  // Remote sessions take a while to allocate.
  timeout: 3 * 60 * 1000,
  expect: { timeout: 30 * 1000 },
  // Each worker opens its own Perfecto session; keep it to one so we
  // don't use up the license's concurrent sessions.
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Playwright opens the browser on Perfecto instead of locally.
    connectOptions: {
      wsEndpoint: perfectoWsEndpoint(),
      timeout: 2 * 60 * 1000,
    },
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'perfecto', use: { browserName: 'chromium' } }],
});
