import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should navigate to checkout page', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Open cart sidebar
    await page.locator('[data-testid="cart-icon"]').click();

    // Click checkout button
    await page.locator('[data-testid="checkout-btn"]').click();

    // Should be on checkout page
    const checkoutHeading = page.locator('[data-testid="checkout-heading"]');
    await expect(checkoutHeading).toBeVisible();
  });

  test('should display order summary on checkout', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Navigate to checkout
    await page.locator('[data-testid="cart-icon"]').click();
    await page.locator('[data-testid="checkout-btn"]').click();

    // Verify order summary section
    const orderSummary = page.locator('[data-testid="order-summary"]');
    await expect(orderSummary).toBeVisible();

    // Verify cart items are shown
    const cartItem = page.locator('[data-testid="checkout-item"]');
    expect(await cartItem.count()).toBeGreaterThan(0);
  });

  test('should display confirm order button', async ({ page }) => {
    await page.goto('/');

    // Add item and navigate to checkout
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.locator('[data-testid="cart-icon"]').click();
    await page.locator('[data-testid="checkout-btn"]').click();

    // Verify confirm order button is visible
    await expect(page.locator('[data-testid="confirm-order"]')).toBeVisible();
  });

  test('should return to home page from checkout', async ({ page }) => {
    await page.goto('/');

    // Add item and navigate to checkout
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.locator('[data-testid="cart-icon"]').click();
    await page.locator('[data-testid="checkout-btn"]').click();

    // Click back to shopping button
    await page.locator('[data-testid="back-to-shopping-btn"]').click();

    // Should be back on home page
    const petList = page.locator('[data-testid="pet-card"]');
    expect(await petList.count()).toBeGreaterThan(0);
  });
});
