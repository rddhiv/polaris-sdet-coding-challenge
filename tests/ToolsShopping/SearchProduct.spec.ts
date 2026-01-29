import { test, expect,Page } from '@playwright/test';
import { ShopPage } from '../../Page_Objects/ShopPage';
import {ProductPage} from '../../Page_Objects/ProductPage';

test.describe('UserStory 003: Search for a product - visitor', () => 
  {

 let shop: ShopPage;

test.beforeEach(async ({ page }: { page: Page }) =>
   {
  shop =  new ShopPage(page);
  await page.context().clearCookies();
  await page.addInitScript(() => localStorage.clear());
  await page.goto(process.env.BASE_URL!);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500); 
});

  test('search bar is available on the shop page', async ({ page }) => 
   {
    expect(await shop.hasSearchBar()).toBeTruthy();
  });

  test('entering a product name shows matching results', async ({ page }) => {
    // Use a known product name present on the site 
    const query = 'Sledgehammer';
    await shop.searchFor(query);

    const results = await shop.getSearchResults();
    //console.log('Search results:', results);
    expect(results.length).toBeGreaterThan(0);

    // ensure at least one result contains the query (case-insensitive)
    const match = results.some(r => r.name.toLowerCase().includes(query.toLowerCase()));
    expect(match).toBeTruthy();

    // open first result and verify product page shows name
    await shop.openProductByIndex(0);
    const product = new ProductPage(page);
    await product.waitForLoad();
    const name = await product.getName();
    expect(name).toBeTruthy();
  });

  test('non-matching searches show a no results found message', async ({ page }) => {
 
    const uniqueQuery = `no-such-product-${Date.now()}`;
    await shop.searchFor(uniqueQuery);

    const results = await shop.getSearchResults();
    const noResults = await shop.isNoResultsVisible();

    // Accept either explicit no-results message or zero results
    expect(results.length === 0 || noResults).toBeTruthy();
  });
});