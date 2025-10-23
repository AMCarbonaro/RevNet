import { test, expect } from '@playwright/test';

test.describe('Anthony Letters System', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with demo user before each test
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-signin"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display letters list page', async ({ page }) => {
    await page.goto('/letters');
    
    // Check if letters page is visible
    await expect(page.locator('[data-testid="letters-page"]')).toBeVisible();
    
    // Check for letters list
    await expect(page.locator('[data-testid="letters-list"]')).toBeVisible();
  });

  test('should show first letter as available', async ({ page }) => {
    await page.goto('/letters');
    
    // First letter should be available
    const firstLetter = page.locator('[data-testid="letter-1"]');
    await expect(firstLetter).toBeVisible();
    
    // Should show as available (not locked)
    await expect(firstLetter.locator('[data-testid="letter-status"]')).toHaveText('Available');
  });

  test('should show subsequent letters as locked', async ({ page }) => {
    await page.goto('/letters');
    
    // Second letter should be locked
    const secondLetter = page.locator('[data-testid="letter-2"]');
    await expect(secondLetter).toBeVisible();
    
    // Should show as locked
    await expect(secondLetter.locator('[data-testid="letter-status"]')).toHaveText('Locked');
  });

  test('should allow reading first letter', async ({ page }) => {
    await page.goto('/letters');
    
    // Click on first letter
    await page.click('[data-testid="letter-1"]');
    
    // Should navigate to letter detail page
    await expect(page).toHaveURL('/letters/1');
    
    // Should show letter content
    await expect(page.locator('[data-testid="letter-content"]')).toBeVisible();
    
    // Should show letter title
    await expect(page.locator('[data-testid="letter-title"]')).toContainText('Letter 1');
  });

  test('should allow completing first letter', async ({ page }) => {
    await page.goto('/letters/1');
    
    // Should show complete button
    await expect(page.locator('[data-testid="complete-letter-btn"]')).toBeVisible();
    
    // Click complete button
    await page.click('[data-testid="complete-letter-btn"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
    
    // Should show completion status
    await expect(page.locator('[data-testid="letter-status"]')).toHaveText('Completed');
  });

  test('should unlock next letter after completion', async ({ page }) => {
    // First complete the first letter
    await page.goto('/letters/1');
    await page.click('[data-testid="complete-letter-btn"]');
    
    // Navigate back to letters list
    await page.goto('/letters');
    
    // Second letter should now be available
    const secondLetter = page.locator('[data-testid="letter-2"]');
    await expect(secondLetter.locator('[data-testid="letter-status"]')).toHaveText('Available');
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/letters');
    
    // Should show progress bar
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Should show progress percentage
    await expect(page.locator('[data-testid="progress-percentage"]')).toContainText('0%');
  });

  test('should update progress after completion', async ({ page }) => {
    // Complete first letter
    await page.goto('/letters/1');
    await page.click('[data-testid="complete-letter-btn"]');
    
    // Navigate back to letters list
    await page.goto('/letters');
    
    // Progress should be updated
    await expect(page.locator('[data-testid="progress-percentage"]')).toContainText('3.3%'); // 1/30 letters
  });

  test('should prevent access to locked letters', async ({ page }) => {
    // Try to access locked letter directly
    await page.goto('/letters/2');
    
    // Should show access denied message
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    
    // Should show requirement to complete previous letters
    await expect(page.locator('[data-testid="unlock-requirement"]')).toBeVisible();
  });
});
