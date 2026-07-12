import { test, expect } from '@playwright/test';

test('admin login page loads properly', async ({ page }) => {
  await page.goto('/admin/login');
  
  // Verify that the login form is rendered
  await expect(page.locator('form')).toBeVisible();
  
  // Check for the inputs
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
