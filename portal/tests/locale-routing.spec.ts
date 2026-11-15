import { expect, test } from '@playwright/test';

test('English keeps its current unprefixed routes and Arabic remains unavailable', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.goto('/packages');
  await expect(page).toHaveURL(/\/packages$/);

  const response = await page.goto('/ar');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /language|english|arabic/i })).toHaveCount(0);
});

test('current route layouts remain usable when rendered with right-to-left direction', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/packages',
    '/docs',
    '/docs/getting-started',
    '/guides',
    '/changelog',
    '/community',
  ]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    });

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.content,
      `${route} should not overflow horizontally in RTL`,
    ).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.locator('#main')).toBeVisible();
  }
});
