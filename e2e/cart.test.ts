import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test('should add pet to cart', async ({ page }) => {
    await page.goto('/');

    // Get initial cart count
    const cartIcon = page.locator('[data-testid="cart-icon"]');

    // Click add to cart button on first pet
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Cart count should increase
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto('/');

    // Add item to cart first
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Click on cart icon
    await page.locator('[data-testid="cart-icon"]').click();

    // Cart sidebar should be visible
    const cartSidebar = page.locator('[data-testid="cart-sidebar"]');
    await expect(cartSidebar).toBeVisible();
  });

  test('should display cart items in sidebar', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Open cart sidebar
    await page.locator('[data-testid="cart-icon"]').click();

    // Verify cart item is displayed
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await expect(cartItem).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Open cart sidebar
    await page.locator('[data-testid="cart-icon"]').click();

    // Remove item
    await page.locator('[data-testid="remove-from-cart-btn"]').first().click();

    // Cart should be empty
    const cartItems = page.locator('[data-testid="cart-item"]');
    expect(await cartItems.count()).toBe(0);
  });

  test('should show total price in cart', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Open cart sidebar
    await page.locator('[data-testid="cart-icon"]').click();

    // Check if total is displayed
    const total = page.locator('[data-testid="cart-total"]');
    await expect(total).toBeVisible();
  });

  test('should persist cart data in localStorage', async ({ page }) => {
    await page.goto('/');

    // Add item to cart
    const petName = await page.locator('[data-testid="pet-name"]').first().textContent();
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // Wait for cart badge to show the item
    await page.locator('[data-testid="cart-badge"]').waitFor({ state: 'visible' });

    // Reload page
    await page.reload();

    // Cart should still have the item after reload
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');
  });
});
