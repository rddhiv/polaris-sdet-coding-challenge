import { test, expect } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';
import { CartPage } from '../../Page_Objects/CartPage';
import { ToolsLoginPage } from '../../Page_Objects/ToolsLoginPage';


test.describe('Userstory 007 : Update / Remove from Cart - logged in user', () => {
  
  test('increase quantity updates line price and total; removing item updates cart', async ({ page }) => {
    // login
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
    await login.login(process.env.validUsername as string,process.env.validPassword as string);
    expect(await login.isLoggedIn()).toBeTruthy();

    // navigate to shop and add known product "Pliers"
    const shop = new ShopPage(page);
    await page.goto(process.env.BASE_URL!);
    await shop.openProductByName('Pliers');

    const product = new ProductPage(page);
    await product.waitForLoad();

    // add to cart
    expect(await product.isAddToCartVisible()).toBeTruthy();
    await product.clickAddToCart();
    await page.waitForTimeout(2000);        
    // open cart
    const cart = new CartPage(page);
    await cart.gotoCart();
    await page.waitForTimeout(2000);
    // sanity: find the item
    const itemsBefore = await cart.getCartItems();
    const item = itemsBefore.find(i => i.title.toLowerCase().includes('pliers'));
    expect(item).toBeTruthy();

    if (!item) return;

    const beforeTotal = await cart.getCartTotal();

    // update quantity to 2
    await cart.updateQuantityByTitle(item.title, 2);

    // re-read cart item and total
    const itemsAfterUpdate = await cart.getCartItems();
    const updated = itemsAfterUpdate.find(i => i.title === item.title);
    expect(updated).toBeTruthy();
    expect(updated!.quantity).toBe(2);

    // unitPrice * quantity == linePrice (allow tiny rounding)
    const expectedLine = updated!.unitPrice * updated!.quantity;
    expect(Math.abs(updated!.linePrice - expectedLine)).toBeLessThan(0.01);

    const afterTotal = await cart.getCartTotal();
    expect(afterTotal).toBeGreaterThanOrEqual(beforeTotal);

    // now remove the item
    await cart.removeItemByTitle(item.title);

    // ensure item no longer present and total updated
    const itemsAfterRemove = await cart.getCartItems();
    const found = itemsAfterRemove.find(i => i.title === item.title);
    expect(found).toBeUndefined();

    const finalTotal = await cart.getCartTotal();
    expect(finalTotal).toBeLessThanOrEqual(afterTotal);
  });
});