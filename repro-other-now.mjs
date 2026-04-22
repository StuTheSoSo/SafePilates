import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR', err.message));
  await page.goto('http://127.0.0.1:4201', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const overlay = await page.evaluate(() => {
    const el = document.querySelector('.safety-overlay');
    if (!el) return false;
    return window.getComputedStyle(el).display !== 'none';
  });
  console.log('overlay visible', overlay);
  if (overlay) {
    await page.evaluate(() => { const btn = document.querySelector('.safety-overlay ion-button'); if (btn) btn.click(); });
    await page.waitForTimeout(500);
  }
  const found = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent && c.textContent.trim() === 'Other');
    return !!chip;
  });
  console.log('found other chip', found);
  const clicked = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent && c.textContent.trim() === 'Other');
    if (!chip) return false;
    chip.click();
    return true;
  });
  console.log('attempted click', clicked);
  await page.waitForTimeout(1000);
  const state = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent && c.textContent.trim() === 'Other');
    const item = document.querySelector('ion-item.other-details');
    const note = document.querySelector('ion-note.other-note');
    const overlayEl = document.querySelector('.safety-overlay');
    return {
      chipClass: chip ? chip.className : null,
      itemExists: !!item,
      noteExists: !!note,
      textareaCount: document.querySelectorAll('ion-textarea').length,
      overlayVisible: overlayEl ? window.getComputedStyle(overlayEl).display !== 'none' : false,
      bodyText: document.body.textContent ? document.body.textContent.slice(0, 400) : null
    };
  });
  console.log('state after click', state);
  await browser.close();
})();
