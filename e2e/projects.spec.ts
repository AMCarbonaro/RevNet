import { test, expect } from '@playwright/test';

test.describe('Project Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with demo user before each test
    await page.goto('/auth/signin');
    await page.click('[data-testid="demo-signin"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display projects list page', async ({ page }) => {
    await page.goto('/projects');
    
    // Check if projects page is visible
    await expect(page.locator('[data-testid="projects-page"]')).toBeVisible();
    
    // Check for projects list
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  });

  test('should allow creating new project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click create project button
    await page.click('[data-testid="create-project-btn"]');
    
    // Should navigate to project creation wizard
    await expect(page).toHaveURL('/projects/create');
    
    // Should show step 1 of the wizard
    await expect(page.locator('[data-testid="project-wizard-step-1"]')).toBeVisible();
  });

  test('should complete project creation wizard', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Step 1: Basic Information
    await page.fill('[data-testid="project-title"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'This is a test project description');
    await page.selectOption('[data-testid="project-category"]', 'Political Campaign');
    
    // Click next
    await page.click('[data-testid="next-step-btn"]');
    
    // Step 2: Funding Details
    await expect(page.locator('[data-testid="project-wizard-step-2"]')).toBeVisible();
    await page.fill('[data-testid="funding-goal"]', '10000');
    await page.fill('[data-testid="funding-deadline"]', '2024-12-31');
    
    // Click next
    await page.click('[data-testid="next-step-btn"]');
    
    // Step 3: Project Details
    await expect(page.locator('[data-testid="project-wizard-step-3"]')).toBeVisible();
    await page.fill('[data-testid="project-story"]', 'This is the project story');
    await page.fill('[data-testid="project-tags"]', 'activism, politics, change');
    
    // Click next
    await page.click('[data-testid="next-step-btn"]');
    
    // Step 4: Review and Submit
    await expect(page.locator('[data-testid="project-wizard-step-4"]')).toBeVisible();
    
    // Submit project
    await page.click('[data-testid="submit-project-btn"]');
    
    // Should redirect to project detail page
    await expect(page).toHaveURL(/\/projects\/\d+/);
    
    // Should show project created successfully
    await expect(page.locator('[data-testid="project-created"]')).toBeVisible();
  });

  test('should display project details', async ({ page }) => {
    // First create a project
    await page.goto('/projects/create');
    await page.fill('[data-testid="project-title"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'Test description');
    await page.selectOption('[data-testid="project-category"]', 'Political Campaign');
    await page.click('[data-testid="next-step-btn"]');
    
    await page.fill('[data-testid="funding-goal"]', '10000');
    await page.fill('[data-testid="funding-deadline"]', '2024-12-31');
    await page.click('[data-testid="next-step-btn"]');
    
    await page.fill('[data-testid="project-story"]', 'Test story');
    await page.fill('[data-testid="project-tags"]', 'test');
    await page.click('[data-testid="next-step-btn"]');
    
    await page.click('[data-testid="submit-project-btn"]');
    
    // Should show project details
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Test Project');
    await expect(page.locator('[data-testid="project-description"]')).toContainText('Test description');
    await expect(page.locator('[data-testid="funding-goal"]')).toContainText('$10,000');
  });

  test('should allow editing project', async ({ page }) => {
    // Navigate to a project (assuming one exists)
    await page.goto('/projects');
    
    // Click on first project
    await page.click('[data-testid="project-item-0"]');
    
    // Click edit button
    await page.click('[data-testid="edit-project-btn"]');
    
    // Should navigate to edit page
    await expect(page).toHaveURL(/\/projects\/\d+\/edit/);
    
    // Should show edit form
    await expect(page.locator('[data-testid="edit-project-form"]')).toBeVisible();
  });

  test('should allow donating to project', async ({ page }) => {
    // Navigate to a project
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    
    // Click donate button
    await page.click('[data-testid="donate-btn"]');
    
    // Should show donation modal
    await expect(page.locator('[data-testid="donation-modal"]')).toBeVisible();
    
    // Enter donation amount
    await page.fill('[data-testid="donation-amount"]', '50');
    
    // Click donate button in modal
    await page.click('[data-testid="confirm-donate-btn"]');
    
    // Should redirect to payment page
    await expect(page).toHaveURL(/\/donate\/\d+/);
  });

  test('should show project progress', async ({ page }) => {
    // Navigate to a project
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    
    // Should show funding progress
    await expect(page.locator('[data-testid="funding-progress"]')).toBeVisible();
    
    // Should show progress bar
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Should show funding statistics
    await expect(page.locator('[data-testid="funding-stats"]')).toBeVisible();
  });

  test('should allow project discovery', async ({ page }) => {
    await page.goto('/projects');
    
    // Should show discovery filters
    await expect(page.locator('[data-testid="discovery-filters"]')).toBeVisible();
    
    // Should allow filtering by category
    await page.selectOption('[data-testid="category-filter"]', 'Political Campaign');
    
    // Should update results
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
    
    // Should allow sorting
    await page.selectOption('[data-testid="sort-filter"]', 'newest');
    
    // Should update results
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  });

  test('should handle project status changes', async ({ page }) => {
    // Navigate to a project
    await page.goto('/projects');
    await page.click('[data-testid="project-item-0"]');
    
    // Should show project status
    await expect(page.locator('[data-testid="project-status"]')).toBeVisible();
    
    // Status should be one of the expected values
    const status = await page.locator('[data-testid="project-status"]').textContent();
    expect(['draft', 'active', 'completed', 'cancelled']).toContain(status?.toLowerCase());
  });
});
