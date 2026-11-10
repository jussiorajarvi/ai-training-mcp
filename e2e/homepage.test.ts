import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check if page title is correct
    await expect(page).toHaveTitle('React Petstore Project');
  });

  test('should display pet list', async ({ page }) => {
    await page.goto('/');

    // Check if at least one pet card is displayed
    const petCards = page.locator('[data-testid="pet-card"]');
    const count = await petCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display pet details in cards', async ({ page }) => {
    await page.goto('/');

    // Check if first pet card contains expected elements
    const firstPetCard = page.locator('[data-testid="pet-card"]').first();
    await expect(firstPetCard.locator('[data-testid="pet-name"]')).toBeVisible();
    await expect(firstPetCard.locator('[data-testid="pet-price"]')).toBeVisible();
    await expect(firstPetCard.locator('[data-testid="pet-description"]')).toBeVisible();
  });

  test('should have add to cart button on pet cards', async ({ page }) => {
    await page.goto('/');

    const addButton = page.locator('[data-testid="add-to-cart-btn"]').first();
    await expect(addButton).toBeVisible();
  });
});
