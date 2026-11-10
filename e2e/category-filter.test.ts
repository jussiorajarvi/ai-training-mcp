import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test('should filter pets by Dogs category', async ({ page }) => {
    await page.goto('/');

    // Click on Dogs category button
    await page.locator('[data-testid="category-btn"][data-category="Dogs"]').click();

    // Verify all displayed pets are Dogs
    const petCategories = page.locator('[data-testid="pet-category"]');
    const categoryCount = await petCategories.count();

    for (let i = 0; i < categoryCount; i++) {
      const categoryText = await petCategories.nth(i).textContent();
      expect(categoryText).toBe('Dogs');
    }
  });

  test('should filter pets by Cats category', async ({ page }) => {
    await page.goto('/');

    // Click on Cats category button
    await page.locator('[data-testid="category-btn"][data-category="Cats"]').click();

    // Verify all displayed pets are Cats
    const petCategories = page.locator('[data-testid="pet-category"]');
    const categoryCount = await petCategories.count();

    for (let i = 0; i < categoryCount; i++) {
      const categoryText = await petCategories.nth(i).textContent();
      expect(categoryText).toBe('Cats');
    }
  });

  test('should filter pets by Fish category', async ({ page }) => {
    await page.goto('/');

    // Click on Fish category button
    await page.locator('[data-testid="category-btn"][data-category="Fish"]').click();

    // Verify all displayed pets are Fish
    const petCategories = page.locator('[data-testid="pet-category"]');
    const categoryCount = await petCategories.count();

    for (let i = 0; i < categoryCount; i++) {
      const categoryText = await petCategories.nth(i).textContent();
      expect(categoryText).toBe('Fish');
    }
  });

  test('should show all pets when selecting All category', async ({ page }) => {
    await page.goto('/');

    // First filter by a specific category
    await page.locator('[data-testid="category-btn"][data-category="Dogs"]').click();
    const filteredCount = await page.locator('[data-testid="pet-card"]').count();

    // Then click All
    await page.locator('[data-testid="category-btn"][data-category="All"]').click();
    const allCount = await page.locator('[data-testid="pet-card"]').count();

    // All should show more or equal pets than filtered
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});
