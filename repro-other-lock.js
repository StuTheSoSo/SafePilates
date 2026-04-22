const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE error:', err.message));
  page.on('requestfailed', req => console.log('PAGE requestfailed:', req.url(), req.failure()?.errorText));
  await page.goto('http://127.0.0.1:4201', { waitUntil: 'networkidle' });
  await page.waitForSelector('ion-chip >> text=Other', { timeout: 10000 });
  const chip = page.locator('ion-chip', { hasText: 'Other' }).first();
  console.log('Clicking Other chip');
  await chip.click();
  await page.waitForTimeout(3000);
  console.log('Completed click wait');
  await page.screenshot({ path: 'repro-other-lock.png', fullPage: true });
  console.log('screenshot saved');
  await browser.close();
})();
