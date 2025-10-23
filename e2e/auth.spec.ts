import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display terminal interface on first visit', async ({ page }) => {
    await page.goto('/');
    
    // Check if terminal interface is visible
    await expect(page.locator('[data-testid="terminal-interface"]')).toBeVisible();
    
    // Check for Matrix rain effect
    await expect(page.locator('[data-testid="matrix-rain"]')).toBeVisible();
  });

  test('should redirect to sign in when clicking red pill', async ({ page }) => {
    await page.goto('/');
    
    // Click the red pill
    await page.click('[data-testid="red-pill"]');
    
    // Should redirect to sign in page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should show welcome screen when clicking blue pill', async ({ page }) => {
    await page.goto('/');
    
    // Click the blue pill
    await page.click('[data-testid="blue-pill"]');
    
    // Should show welcome screen
    await expect(page.locator('[data-testid="welcome-screen"]')).toBeVisible();
  });

  test('should handle Google OAuth sign in', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click Google sign in button
    await page.click('[data-testid="google-signin"]');
    
    // Should redirect to Google OAuth
    // Note: In actual tests, you'd mock the OAuth response
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });

  test('should handle demo mode sign in', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click demo mode button
    await page.click('[data-testid="demo-signin"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show dashboard content
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test('should handle sign out', async ({ page }) => {
    // First sign in with demo mode
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-signin"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
    
    // Click sign out
    await page.click('[data-testid="signout-button"]');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });

  test('should protect admin routes', async ({ page }) => {
    // Try to access admin route without authentication
    await page.goto('/admin');
    
    // Should redirect to sign in
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should allow admin access with admin user', async ({ page }) => {
    // Sign in as demo admin user
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-admin-signin"]');
    
    // Should be able to access admin dashboard
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });
});
