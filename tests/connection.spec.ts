import { test, expect } from '@playwright/test';
import { perfectoCapabilities } from '../perfecto';

test.describe('Perfecto connection', () => {
  test('connects to a remote browser on Perfecto', async ({ browser }) => {
    const caps = perfectoCapabilities();
    test.info().annotations.push({
      type: 'perfecto',
      description: `${caps.browserName} ${caps.browserVersion} on ${caps.platformName} ${caps.platformVersion}`,
    });

    // If we got this far, the WebSocket handshake with Perfecto succeeded.
    expect(browser.isConnected()).toBe(true);
    console.log(`Connected to Perfecto. Remote browser version: ${browser.version()}`);
  });

  test('can open a page and read it', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Example Domain');
  });

  test('reports the remote user agent', async ({ page }) => {
    await page.goto('https://example.com');
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`Remote user agent: ${userAgent}`);
    expect(userAgent).toBeTruthy();
  });
});
