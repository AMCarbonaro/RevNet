import { test, expect } from '@playwright/test';

test.describe('Payment System', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with demo user before each test
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-signin"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display donation form', async ({ page }) => {
    // Navigate to a project
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    
    // Click donate button
    await page.click('[data-testid="donate-btn"]');
    
    // Should show donation modal
    await expect(page.locator('[data-testid="donation-modal"]')).toBeVisible();
    
    // Should show donation amount input
    await expect(page.locator('[data-testid="donation-amount"]')).toBeVisible();
    
    // Should show payment method options
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
  });

  test('should validate donation amount', async ({ page }) => {
    // Navigate to donation form
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    await page.click('[data-testid="donate-btn"]');
    
    // Try to enter invalid amount
    await page.fill('[data-testid="donation-amount"]', '0');
    
    // Should show validation error
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
    
    // Try to enter negative amount
    await page.fill('[data-testid="donation-amount"]', '-10');
    
    // Should show validation error
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
  });

  test('should process donation with valid amount', async ({ page }) => {
    // Navigate to donation form
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    await page.click('[data-testid="donate-btn"]');
    
    // Enter valid donation amount
    await page.fill('[data-testid="donation-amount"]', '50');
    
    // Select payment method
    await page.click('[data-testid="payment-method-stripe"]');
    
    // Click donate button
    await page.click('[data-testid="confirm-donate-btn"]');
    
    // Should redirect to payment page
    await expect(page).toHaveURL(/\/donate\/\d+/);
    
    // Should show payment form
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
  });

  test('should handle payment success', async ({ page }) => {
    // Mock successful payment
    await page.route('**/api/payments/process', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, transactionId: 'test-tx-123' })
      });
    });
    
    // Navigate to payment page
    await page.goto('/donate/1');
    
    // Fill payment form
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', 'Test User');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
    
    // Should show transaction ID
    await expect(page.locator('[data-testid="transaction-id"]')).toContainText('test-tx-123');
  });

  test('should handle payment failure', async ({ page }) => {
    // Mock failed payment
    await page.route('**/api/payments/process', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Payment failed' })
      });
    });
    
    // Navigate to payment page
    await page.goto('/donate/1');
    
    // Fill payment form with invalid card
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', 'Test User');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
  });

  test('should show donation history', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on donations section
    await page.click('[data-testid="donations-section"]');
    
    // Should show donation history
    await expect(page.locator('[data-testid="donation-history"]')).toBeVisible();
    
    // Should show donation list
    await expect(page.locator('[data-testid="donations-list"]')).toBeVisible();
  });

  test('should handle refund request', async ({ page }) => {
    // Navigate to donation history
    await page.goto('/dashboard');
    await page.click('[data-testid="donations-section"]');
    
    // Click on a donation
    await page.click('[data-testid="donation-item-0"]');
    
    // Should show refund button
    await expect(page.locator('[data-testid="refund-btn"]')).toBeVisible();
    
    // Click refund button
    await page.click('[data-testid="refund-btn"]');
    
    // Should show refund confirmation
    await expect(page.locator('[data-testid="refund-confirmation"]')).toBeVisible();
  });

  test('should show payment security features', async ({ page }) => {
    await page.goto('/donate/1');
    
    // Should show security badges
    await expect(page.locator('[data-testid="security-badges"]')).toBeVisible();
    
    // Should show SSL indicator
    await expect(page.locator('[data-testid="ssl-indicator"]')).toBeVisible();
    
    // Should show encryption notice
    await expect(page.locator('[data-testid="encryption-notice"]')).toBeVisible();
  });

  test('should handle payment method selection', async ({ page }) => {
    // Navigate to donation form
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    await page.click('[data-testid="donate-btn"]');
    
    // Should show multiple payment methods
    await expect(page.locator('[data-testid="payment-method-stripe"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-paypal"]')).toBeVisible();
    
    // Select Stripe
    await page.click('[data-testid="payment-method-stripe"]');
    
    // Should show Stripe form
    await expect(page.locator('[data-testid="stripe-form"]')).toBeVisible();
    
    // Select PayPal
    await page.click('[data-testid="payment-method-paypal"]');
    
    // Should show PayPal form
    await expect(page.locator('[data-testid="paypal-form"]')).toBeVisible();
  });
});
