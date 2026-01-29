import { test, expect,Page } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';


test.describe('Userstory 002 : View Product Details - visitor', () => {
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

  test('clicking a product opens detail page with name, description, price, image and enabled Add to Cart', async ({ page }) => {
    const products = await shop.getVisibleProducts();

    expect(products.length).toBeGreaterThan(0);

    const firstName = products[0].name;
    const firstImage = products[0].image;
    const firstPrice = products[0].price;
    await shop.openProductByIndex(0);

    const product = new ProductPage(page);
    await product.waitForLoad();

    const title = await product.getName();
    expect(title).toContain(firstName);

    const price = await product.getPrice(); // e.g., "14.15" or "$14.15"
    const priceWithDollar = price.toString().trim().startsWith('$')? price.toString().trim(): `$${price.toString().trim()}`;
    expect(priceWithDollar).toContain(firstPrice);

    const imageUrl = await product.getImageUrl();
    expect(imageUrl).toContain(firstImage);

    const name = await product.getName();
    expect(name).toBeTruthy();

    const description = await product.getDescription();
    expect(description).toBeTruthy();
    
    const addVisible = await product.isAddToCartVisible();
    expect(addVisible).toBeTruthy();

    const addEnabled = await product.isAddToCartEnabled();
    expect(addEnabled).toBeTruthy();
  });
});