import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR', err.message));
  await page.goto('http://127.0.0.1:4201', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('ion-chip');
  await page.evaluate(() => {
    const overlay = document.querySelector('.safety-overlay ion-button');
    if (overlay) {
      overlay.click();
    }
  });
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent?.trim().includes('Other'));
    return {
      found: !!chip,
      display: chip?.textContent?.trim(),
      classes: chip?.className
    };
  });
  console.log('BEFORE', before);
  await page.click('ion-chip:has-text("Other")');
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('ion-chip')).find(c => c.textContent?.trim().includes('Other'));
    const item = document.querySelector('ion-item.other-details');
    const note = document.querySelector('ion-note.other-note');
    return {
      chipClasses: chip?.className,
      itemExists: !!item,
      noteExists: !!note,
      textareaCount: document.querySelectorAll('ion-textarea').length,
      bodyText: document.body.textContent?.slice(0, 500)
    };
  });
  console.log('AFTER', after);
  await browser.close();
})();
