const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Wait for server to be ready
  await page.goto('http://localhost:3000/token-cnx.html');
  await page.waitForTimeout(2000); // Wait for animations/rendering

  // Take screenshot of the whole page
  await page.screenshot({ path: '/home/jules/verification/token_page_updated.png', fullPage: true });

  // Verify CTA text
  const ctaText = await page.textContent('#cnx-cta');
  console.log('CTA Text content:', ctaText);

  await browser.close();
})();
