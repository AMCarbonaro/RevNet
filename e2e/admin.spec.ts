import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin user before each test
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-admin-signin"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show admin dashboard
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    
    // Should show admin navigation
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    
    // Should show key metrics
    await expect(page.locator('[data-testid="admin-metrics"]')).toBeVisible();
  });

  test('should navigate to user management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on users section
    await page.click('[data-testid="admin-nav-users"]');
    
    // Should navigate to user management
    await expect(page).toHaveURL('/admin/users');
    
    // Should show user management interface
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible();
    
    // Should show users list
    await expect(page.locator('[data-testid="users-list"]')).toBeVisible();
  });

  test('should allow user search and filtering', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show search input
    await expect(page.locator('[data-testid="user-search"]')).toBeVisible();
    
    // Should show filter options
    await expect(page.locator('[data-testid="user-filters"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="user-search"]', 'test');
    
    // Should update results
    await expect(page.locator('[data-testid="users-list"]')).toBeVisible();
    
    // Test filter functionality
    await page.selectOption('[data-testid="role-filter"]', 'user');
    
    // Should update results
    await expect(page.locator('[data-testid="users-list"]')).toBeVisible();
  });

  test('should allow user actions', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Click on a user
    await page.click('[data-testid="user-item-0"]');
    
    // Should show user actions
    await expect(page.locator('[data-testid="user-actions"]')).toBeVisible();
    
    // Should show ban/unban button
    await expect(page.locator('[data-testid="ban-user-btn"]')).toBeVisible();
    
    // Should show promote button
    await expect(page.locator('[data-testid="promote-user-btn"]')).toBeVisible();
  });

  test('should navigate to project management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on projects section
    await page.click('[data-testid="admin-nav-projects"]');
    
    // Should navigate to project management
    await expect(page).toHaveURL('/admin/projects');
    
    // Should show project management interface
    await expect(page.locator('[data-testid="project-management"]')).toBeVisible();
    
    // Should show projects list
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  });

  test('should allow project approval', async ({ page }) => {
    await page.goto('/admin/projects');
    
    // Click on a project
    await page.click('[data-testid="project-item-0"]');
    
    // Should show project actions
    await expect(page.locator('[data-testid="project-actions"]')).toBeVisible();
    
    // Should show approve button
    await expect(page.locator('[data-testid="approve-project-btn"]')).toBeVisible();
    
    // Should show reject button
    await expect(page.locator('[data-testid="reject-project-btn"]')).toBeVisible();
  });

  test('should navigate to content moderation', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on moderation section
    await page.click('[data-testid="admin-nav-moderation"]');
    
    // Should navigate to content moderation
    await expect(page).toHaveURL('/admin/moderation');
    
    // Should show moderation interface
    await expect(page.locator('[data-testid="content-moderation"]')).toBeVisible();
    
    // Should show moderation queue
    await expect(page.locator('[data-testid="moderation-queue"]')).toBeVisible();
  });

  test('should allow content moderation actions', async ({ page }) => {
    await page.goto('/admin/moderation');
    
    // Click on a moderation item
    await page.click('[data-testid="moderation-item-0"]');
    
    // Should show moderation actions
    await expect(page.locator('[data-testid="moderation-actions"]')).toBeVisible();
    
    // Should show approve button
    await expect(page.locator('[data-testid="approve-content-btn"]')).toBeVisible();
    
    // Should show reject button
    await expect(page.locator('[data-testid="reject-content-btn"]')).toBeVisible();
    
    // Should show escalate button
    await expect(page.locator('[data-testid="escalate-content-btn"]')).toBeVisible();
  });

  test('should navigate to analytics dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on analytics section
    await page.click('[data-testid="admin-nav-analytics"]');
    
    // Should navigate to analytics dashboard
    await expect(page).toHaveURL('/admin/analytics');
    
    // Should show analytics interface
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    
    // Should show charts
    await expect(page.locator('[data-testid="analytics-charts"]')).toBeVisible();
  });

  test('should allow data export', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Should show export button
    await expect(page.locator('[data-testid="export-data-btn"]')).toBeVisible();
    
    // Click export button
    await page.click('[data-testid="export-data-btn"]');
    
    // Should show export options
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible();
    
    // Should allow selecting date range
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on settings section
    await page.click('[data-testid="admin-nav-settings"]');
    
    // Should navigate to settings
    await expect(page).toHaveURL('/admin/settings');
    
    // Should show settings interface
    await expect(page.locator('[data-testid="admin-settings"]')).toBeVisible();
    
    // Should show settings sections
    await expect(page.locator('[data-testid="settings-sections"]')).toBeVisible();
  });

  test('should allow settings modification', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Should show platform settings
    await expect(page.locator('[data-testid="platform-settings"]')).toBeVisible();
    
    // Should show security settings
    await expect(page.locator('[data-testid="security-settings"]')).toBeVisible();
    
    // Should show email settings
    await expect(page.locator('[data-testid="email-settings"]')).toBeVisible();
    
    // Should show save button
    await expect(page.locator('[data-testid="save-settings-btn"]')).toBeVisible();
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show bulk action checkboxes
    await expect(page.locator('[data-testid="bulk-select-all"]')).toBeVisible();
    
    // Select multiple users
    await page.check('[data-testid="user-checkbox-0"]');
    await page.check('[data-testid="user-checkbox-1"]');
    
    // Should show bulk actions
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    
    // Should show bulk ban button
    await expect(page.locator('[data-testid="bulk-ban-btn"]')).toBeVisible();
    
    // Should show bulk promote button
    await expect(page.locator('[data-testid="bulk-promote-btn"]')).toBeVisible();
  });

  test('should show system health monitoring', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show system health section
    await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
    
    // Should show health metrics
    await expect(page.locator('[data-testid="health-metrics"]')).toBeVisible();
    
    // Should show status indicators
    await expect(page.locator('[data-testid="status-indicators"]')).toBeVisible();
  });
});
