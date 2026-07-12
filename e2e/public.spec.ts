import { test, expect } from '@playwright/test';

test('homepage loads properly', async ({ page }) => {
  await page.goto('/');
  
  // Wait for network to be idle to ensure the splash screen logic completes
  await page.waitForLoadState('networkidle');

  // Verify the page title contains 'Talukder'
  await expect(page).toHaveTitle(/Talukder/i);
});
