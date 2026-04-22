import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE error:', err.message));
  await page.goto('http://127.0.0.1:4201', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const overlay = document.querySelector('.safety-overlay ion-button');
    if (overlay) overlay.click();
  });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('ion-chip'));
    const target = chips.find(c => c.textContent?.trim().includes('Other'));
    if (!target) return { found: false, total: chips.length };
    const before = target.className;
    target.click();
    return {
      found: true,
      total: chips.length,
      classname: before,
      afterClass: target.className,
      textareaCount: document.querySelectorAll('ion-textarea').length,
      otherText: target.textContent
    };
  });
  console.log('EVAL result', result);
  await browser.close();
})().catch(e => {
  console.error('ERR', e);
  process.exit(1);
});
