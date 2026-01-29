import { test, expect } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';
import { CartPage } from '../../Page_Objects/CartPage';
import { ToolsLoginPage } from '../../Page_Objects/ToolsLoginPage';


test.describe('Userstory 006 : Add Product to Cart - logged in user', () => {

  test('adding a product updates cart count and shows correct quantity & prices in cart', async ({ page }) => {
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
    await login.login(process.env.validUsername as string,process.env.validPassword as string);
    await page.waitForTimeout(2000);
    expect(await login.isLoggedIn()).toBeTruthy();

    const shop = new ShopPage(page);
    await page.goto(process.env.BASE_URL!);

    // Open product by name (use a product e.g., "Pliers")
    const productName = 'Pliers';
    await shop.openProductByName(productName);

    const product = new ProductPage(page);
    await product.waitForLoad();

    // Ensure Add to Cart is visible and enabled
    expect(await product.isAddToCartVisible()).toBeTruthy();
    expect(await product.isAddToCartEnabled()).toBeTruthy();

    // Capture unit price shown on product page if available
    const unitPriceFromProduct = await product.getPrice();

    // Add to cart
    await product.clickAddToCart();
    await page.waitForTimeout(2000);
    
    // Navigate to cart and verify
    const cart = new CartPage(page);
    await cart.gotoCart();
    await page.waitForTimeout(2000);
  
    
    // Get cart items and find the one we added
    const items = await cart.getCartItems();
    expect(items.length).toBeGreaterThan(0);

    const found = items.find(i => i.title.toLowerCase().includes(productName.toLowerCase()));
    expect(found).toBeTruthy();

    if (found) {
      // Default quantity should be at least 1
      expect(found.quantity).toBeGreaterThanOrEqual(1);

      // Unit price and line price should be numeric and consistent
      expect(found.unitPrice).toBeGreaterThan(0);
      expect(found.linePrice).toBeGreaterThan(0);

      // linePrice should equal unitPrice * quantity (allow small float rounding)
      const expectedLine = found.unitPrice * found.quantity;
      expect(Math.abs(found.linePrice - expectedLine)).toBeLessThan(0.01);

      // If product page showed a price, compare it to cart unit price
      if (unitPriceFromProduct) {
        const numericFromProduct = parseFloat((unitPriceFromProduct.replace(/[^0-9.]/g, '')) || '0');
        if (numericFromProduct > 0) {
          expect(Math.abs(found.unitPrice - numericFromProduct)).toBeLessThan(0.01);
        }
      }
    }

    // try to click remove buttons if present
    for (const item of items) {
      const removeBtn = item.row.locator('a.btn-danger, button.remove, a.remove');
      if (await removeBtn.count() > 0) {
        await removeBtn.first().click().catch(() => null);
        await page.waitForLoadState('networkidle').catch(() => null);
      }
    }
  });
});