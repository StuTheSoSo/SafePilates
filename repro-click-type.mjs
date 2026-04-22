import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE', msg.type(), msg.text()));
  await page.goto('http://127.0.0.1:4201', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('ion-chip');
  const result = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent?.includes('Other'));
    if (!chip) return { found: false };
    const inner = chip.querySelector('ion-label');
    const before = chip.className;
    if (inner) inner.click(); else chip.click();
    return { found: true, before, after: chip.className, innerTag: inner?.tagName };
  });
  console.log('result', result);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
