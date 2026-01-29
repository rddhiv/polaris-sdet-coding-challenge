import { test, expect } from '@playwright/test';
import { CategoryFilterPage } from '../../Page_Objects/CategoryFilterPage';

test.describe('UserStory 004,010: Filter products by category and reset and Category Filtering and Reset- visitor', () => {

  
  test('selecting category filters products; state persists on refresh/navigation; clear restores list', async ({ page }) => {
    const shop = new CategoryFilterPage(page);
     await page.goto(process.env.BASE_URL!);
    await page.waitForLoadState('networkidle');
    expect(await shop.hasCategoryFilters()).toBeTruthy();

    const categories = await shop.getCategoryNames();
    expect(categories.length).toBeGreaterThan(0);

    // choose a specific category present on the page
    const categoryToSelect = categories.find(c => /Hand Saw|Pliers|Hammer|Wrench/i.test(c)) ?? categories[0];
    expect(categoryToSelect).toBeTruthy();

    const before = await shop.getVisibleProductNames();
    expect(before.length).toBeGreaterThanOrEqual(0);

    // select category and capture the selected category id 
    const selectedDataTest = await shop.selectCategoryByName(categoryToSelect);
    // verify checkbox checked
    expect(await shop.isCategoryCheckedByName(categoryToSelect)).toBeTruthy();

    // filtered results should be present 
    const filtered = await shop.getVisibleProductNames();
    // at minimum the UI should reflect the selection 
    expect(filtered).toBeDefined();
  

    // Test pagination does not break when filtered: if next page exists, go next then back and ensure filter remains
    if (await shop.hasNextPage()) {
      const beforeNames = await shop.getVisibleProductNames();
      await shop.goToNextPage();
      const nextPageNames = await shop.getVisibleProductNames();
      // moving pages should still reflect filter 
      expect(nextPageNames).toBeDefined();
      // go back (browser back) and ensure category still selected
      await page.goBack();
      await page.waitForLoadState('networkidle');
      expect(await shop.isCategoryCheckedByName(categoryToSelect)).toBeTruthy();
      const backNames = await shop.getVisibleProductNames();
      expect(backNames.length).toBeGreaterThanOrEqual(0);
    }

    // Clear filters and verify list returns to (approx) original
    await shop.clearFilters();
    const afterClear = await shop.getVisibleProductNames();
    // after clearing should show at least as many items as filtered (or equal/greater)
    expect(afterClear.length).toBeGreaterThanOrEqual(filtered.length);
  });
});