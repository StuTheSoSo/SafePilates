import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'subscription-image.html');
const outPath = resolve(__dirname, '../subscription-image.png');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1024, height: 1024 });

  // Load the HTML file (fonts fetched from Google CDN)
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Extra wait for web fonts to paint
  await page.waitForTimeout(800);

  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: 1024, height: 1024 },
  });

  await browser.close();
  console.log(`✓ Written: ${outPath}`);
})();
