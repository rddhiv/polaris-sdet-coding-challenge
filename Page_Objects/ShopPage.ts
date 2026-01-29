import { Locator, Page, expect } from '@playwright/test';
import type { Product } from '../models/Product';
import { BasePageShop } from './BasePageShop';

export class ShopPage  {
  readonly page: Page;
  readonly productCards: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;
  readonly searchInput: Locator;
   readonly searchButton: Locator;
  readonly noResultsLocator: Locator;
    readonly categoryItems: Locator;
  readonly clearFilterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Adjust selectors to match your app. Prefer data-test attributes.
    this.productCards = page.locator('.container a.card');
    this.productName = page.locator('[data-test="product-name"]');
    this.productPrice = page.locator('[data-test="product-price"]');
    this.productImage = page.locator('[data-test="product-image"]');
    this.paginationNext = page.locator('a[aria-label="Next"]');
    this.paginationPrev = page.locator('a[aria-label="Previous"]');
    this.searchInput = page.locator('#search-query');
    this.searchButton = page.locator('[data-test="search-submit"]');
    this.noResultsLocator = page.locator('text="There are no products found."');
    this.categoryItems = page.locator('fieldset:has(legend:text("Categories"))');
    this.clearFilterButton = page.locator('a:has-text("All"), a:has-text("Clear"), button:has-text("Clear filters"), a:has-text("Show all")').first();

  }


  async gotoShop(path = 'shop') {
    // await this.page.goto(process.env.BASE_URL!);
    await this.page.waitForLoadState('networkidle');
  }

  async getVisibleProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = (await card.locator('[data-test="product-name"]').innerText()).trim();
      const price = (await card.locator('[data-test="product-price"]').innerText()).trim();
      const img = (await card.locator('img').getAttribute('src')) || '';
      const href = (await card.getAttribute('href')) || '';
      products.push({ name, price, image: img, url: href });
    }
    return products;
  }


  async openProductByName(name: string) {
    const target = this.productName.filter({ hasText: name }).first();
    await expect(target).toBeVisible();
    await target.click();
  }

  // Pagination: next/prev buttons
  async hasNextPage(): Promise<boolean> {
    return await this.paginationNext.isVisible();
  }

  async goToNextPage() {
    if (await this.hasNextPage()) {
      await this.paginationNext.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getFirstProductIndexWithName(): Promise<number> {
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const nameLocator = card.locator('[data-test="product-name"], h2 a, h3 a, .entry-title a, .card-title');
      const txt = await nameLocator.first().textContent().catch(() => null);
      if (txt && txt.trim().length > 0) return i;
    }
    return -1;
  }

  async openProductByIndex(index: number) {
    const card = this.productCards.nth(index);
    const link = card.first();
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Fallback: scroll to trigger infinite scroll
  async scrollToLoadMore() {
    const before = await this.productName.count();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
     
  }

    async hasSearchBar(): Promise<boolean> {
    return await this.searchInput.isVisible().catch(() => false);
  }

  async searchFor(query: string) {
    // prefer typing and submitting; fallback to clicking search button
    await this.searchInput.fill('');
    await this.searchInput.fill(query);
    // If there's a search button, click it; otherwise press Enter
    if (await this.searchButton.isVisible().catch(() => false)) {
      await this.searchButton.click();
    } else {
      await this.searchInput.press('Enter');
    }
    // Wait for results or no-results to appear
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // small debounce for dynamic sites
  }

  async getSearchResults(): Promise<{ name: string; url?: string }[]> {
    const results: { name: string; url?: string }[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const nameLocator = card.locator('[data-test="product-name"], h2 a, h3 a, .entry-title a, .card-title, a').first();
      const nameText = await nameLocator.textContent().catch(() => '');
      const url = await nameLocator.getAttribute('href').catch(() => '') || undefined;
      const name = nameText?.trim() ?? '';
      if (name) results.push({ name, url });
    }
    return results;
  }

  async isNoResultsVisible(): Promise<boolean> {
    return await this.noResultsLocator.isVisible().catch(() => false);
  }
async hasCategoryFilters(): Promise<boolean> {
    return (await this.categoryItems.count()) > 0;
  }

  async getCategoryNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.categoryItems.count();
    for (let i = 0; i < count; i++) {
      const text = await this.categoryItems.nth(i).innerText().catch(() => '');
      if (text) names.push(text.trim());
    }
    return names;
  }

  async clearFilters() {
       await this.gotoShop('/');
  }

  async getVisibleProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const nameLocator = card.locator('[data-test="product-name"], h2 a, h3 a, .entry-title a, .card-title, a').first();
      const txt = await nameLocator.textContent().catch(() => '');
      if (txt) names.push(txt.trim());
    }
    return names;
  }

  async checkCategoryByDataTest(dataTestId: string) {
   // const input = this.page.locator('label:has-text("${dataTestId}")');
    const checkbox = this.page.locator('input[type="checkbox"]');
    //await checkbox.scrollIntoViewIfNeeded();
    console.log(checkbox);
    await checkbox.waitFor({ state: 'attached', timeout: 3000 });

    // Prefer .check() for form semantics; fallback to clicking the label if input is hidden
    try {
      await checkbox.check();
    } catch {
       const label = this.page.locator('label:has-text("${dataTestId}")');
      if (await label.count() > 0) {
        await label.first().click();
      } else {
        await checkbox.click({ force: true });
      }
    }

    // small wait for UI update
    await this.page.waitForLoadState('networkidle').catch(() => null);
  }
  
}