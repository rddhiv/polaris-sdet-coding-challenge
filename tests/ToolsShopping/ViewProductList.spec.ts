import { test, expect,Page } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';


 test.describe('UserStoy 001 : Shop - View Product List - visitor', () => {
  let shop: ShopPage;

    test.beforeEach(async ({ page }: { page: Page }) =>
     {
       shop = new ShopPage(page);
        await page.context().clearCookies();
        await page.addInitScript(() => localStorage.clear());
        await page.goto(process.env.BASE_URL!);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); 
      });

  test('homepage shows a list of products with name and link', async ({ page }) => {
      const products = await shop.getVisibleProducts();

    expect(products.length).toBeGreaterThan(0);

    const sample = products.slice(0, Math.min(5, products.length));
    for (const p of sample) {
      expect(p.name).toBeTruthy();
      expect(p.url).toBeTruthy();
    }
  }); 

   test('clicking a product opens its detail page', async ({ page }) => {

    const products = await shop.getVisibleProducts();

    expect(products.length).toBeGreaterThan(0);

    const firstName = products[0].name;
    await shop.openProductByIndex(0);

    const product = new ProductPage(page);
    await product.waitForLoad();

    const title = await product.getName();
   
    expect(title).toContain(firstName);
  }); 

  test('pagination or scrolling works correctly to show more products', async ({ page }) => {

    const productsName = await shop.getVisibleProducts();
    const firstName = productsName[0].name;

    if (await shop.hasNextPage()) {
      await shop.goToNextPage();
      await page.waitForTimeout(1500); 
      const productsName = await shop.getVisibleProducts();
      const firstNameNextPage = productsName[0].name;
      expect(firstName).not.toBe(firstNameNextPage);
      return;
    }
    await shop.scrollToLoadMore();
    // Locator for the demo end block
const endDiv = page.locator('div.container-fluid.text-center.bg-light.p-5.mt-4');

// Wait for it to become visible (adjust timeout if needed)
await endDiv.waitFor({ state: 'visible', timeout: 15000 });

//  explicit assertion that it's visible
await expect(endDiv).toBeVisible();

// verify the inner paragraph text contains expected content
const paragraph = endDiv.locator('p');
await expect(paragraph).toBeVisible();
const text = await paragraph.innerText();
expect(text).toContain('This is a DEMO application');

  }); 
});