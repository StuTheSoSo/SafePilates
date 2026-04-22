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
    chip.addEventListener('click', () => console.log('HOST click fired'), { once: true });
    const inner = chip.querySelector('ion-label');
    if (inner) inner.click(); else chip.click();
    return { found: true, innerTag: inner?.tagName, classBefore: chip.className, classAfter: chip.className };
  });
  console.log('RESULT', result);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
