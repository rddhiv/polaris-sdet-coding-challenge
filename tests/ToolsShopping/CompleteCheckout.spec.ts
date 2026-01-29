import { test, expect } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';
import { CartPage } from '../../Page_Objects/CartPage';
import { ToolsLoginPage } from '../../Page_Objects/ToolsLoginPage';
import { CheckoutPage } from '../../Page_Objects/CheckoutPage';


test.describe('Userstory 008 : Complete Checkout - logged in user', () => {
  test('fill shipping, select payment and verify success message', async ({ page }) => {
    // login
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
     await login.login(process.env.validUsername as string,process.env.validPassword as string);
     await page.waitForTimeout(2000);
    expect(await login.isLoggedIn()).toBeTruthy();

    // add a product to cart (Pliers)
    const shop = new ShopPage(page);
     await page.goto(process.env.BASE_URL!);
    await shop.openProductByName('Pliers');

    const product = new ProductPage(page);
    await product.waitForLoad();
    expect(await product.isAddToCartVisible()).toBeTruthy();
    await product.clickAddToCart();
    await page.waitForTimeout(2000);
    // go to cart and proceed to checkout
    const cart = new CartPage(page);
    await cart.gotoCart();
    await page.waitForTimeout(2000);
    // click checkout button if present on cart page
    const checkoutButton = page.locator('button[data-test="proceed-1"]');
 if (await checkoutButton.isVisible().catch(() => false)) {
      await Promise.all([page.waitForLoadState('networkidle'), checkoutButton.click().catch(() => null)]);
    } 
     const checkout = new CheckoutPage(page);
  const checkoutButton2 = page.locator('button[data-test="proceed-2"]');
 if (await checkoutButton2.isVisible().catch(() => false)) {
      await Promise.all([page.waitForLoadState('networkidle'), checkoutButton2.click().catch(() => null)]);
    } 
   
    await page.waitForTimeout(2000);
    // fill checkout form
   
    await checkout.fillAddress({
      street: '123 Test St',
      city: 'Testville',
      state: 'TS',
      country: 'Testland',
      postal_code: '12345'
    });
    const checkoutButton3 = page.locator('button[data-test="proceed-3"]');
 if (await checkoutButton3.isVisible().catch(() => false)) {
      await Promise.all([page.waitForLoadState('networkidle'), checkoutButton3.click().catch(() => null)]);
    } 
     await page.waitForTimeout(2000);
    // choose payment method and proceed
    await checkout.selectPaymentMethod('cash-on-delivery'); 
    const checkoutButton4 = page.locator('button[data-test="proceed-4"]');
 if (await checkoutButton4.isVisible().catch(() => false)) {
      await Promise.all([page.waitForLoadState('networkidle'), checkoutButton4.click().catch(() => null)]);
    } 
     await page.waitForTimeout(2000);

    // place order / finalize payment
    await checkout.placeOrder();
     await page.waitForTimeout(2000);

    // verify success message
    const msg = await checkout.expectPaymentSuccess(8000);
    expect(msg.toLowerCase()).toContain('payment');
  });
});