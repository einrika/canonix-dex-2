const { test, expect } = require('@playwright/test');

test('Landing page loads and shows premium design', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');

  // Check Title
  await expect(page).toHaveTitle(/Canonix - Premium DEX/);

  // Check Hero Section
  const h1 = page.locator('h1');
  await expect(h1).toContainText('The Future of');

  // Check if grid background is applied
  const body = page.locator('body');
  const bgImage = await body.evaluate(el => window.getComputedStyle(el).backgroundImage);
  expect(bgImage).toContain('linear-gradient');

  // Check Token Market
  const marketGrid = page.locator('#marketGrid');
  await expect(marketGrid).toBeVisible();

  // Check search bar
  const searchInput = page.locator('#marketSearch');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('PAXI');

  // Check AI section
  const aiContent = page.locator('#index-ai-content');
  await expect(aiContent).toBeVisible();
});
