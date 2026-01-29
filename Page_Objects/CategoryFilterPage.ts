import { Page, Locator, expect } from '@playwright/test';

export class CategoryFilterPage {
  readonly page: Page;
  readonly categoryCheckboxes: Locator;
  readonly clearFilterButton: Locator;
  readonly productCards: Locator;
  readonly nextPageButton: Locator;
  readonly productNameLocator = '[data-test="product-name"], .card-title, h2 a, h3 a, .entry-title a';

  constructor(page: Page) {
    this.page = page;
    // checkboxes under the categories fieldset
    this.categoryCheckboxes = page.locator('input[name="category_id"]');
    this.clearFilterButton = page.locator('a:has-text("All"), a:has-text("Clear"), button:has-text("Clear filters")').first();
    this.productCards = page.locator('article.post, .card, [data-test="product-card"], tbody tr');
    this.nextPageButton = page.locator('a[rel="next"], .pagination a.next, button:has-text("Next")').first();
  }

  async gotoHome() {
    await this.page.goto('https://practicesoftwaretesting.com/');
    await this.page.waitForLoadState('networkidle');
  }

  async hasCategoryFilters(): Promise<boolean> {
    return (await this.categoryCheckboxes.count()) > 0;
  }

  // returns list of visible category labels
  async getCategoryNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.categoryCheckboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = this.categoryCheckboxes.nth(i);
      // label is parent <label> textContent
      const label = await checkbox.evaluate((el) => {
        const lab = el.closest('label');
        return lab ? lab.textContent || '' : '';
      }).catch(() => '');
      const txt = (label ?? '').trim();
      if (txt) names.push(txt);
    }
    return Array.from(new Set(names));
  }

  // select by visible label text; returns the data-test value (category id) if found
  async selectCategoryByName(name: string): Promise<string | undefined> {
    const count = await this.categoryCheckboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = this.categoryCheckboxes.nth(i);
      const label = (await cb.evaluate((el) => {
        const lab = el.closest('label');
        return lab ? lab.textContent || '' : '';
      }).catch(() => '')).trim();
      if (label.toLowerCase().includes(name.toLowerCase())) {
        const dataTest = (await cb.getAttribute('data-test')) ?? undefined;
        // Use check() for semantics; fallback to click
        try {
          await cb.check();
        } catch {
          const labEl = this.page.locator(`label:has-text("${label.trim()}")`).first();
          await labEl.click();
        }
        // wait for products to update (cards count change or network)
        await this.waitForProductsUpdate();
        return dataTest;
      }
    }
    return undefined;
  }

  async isCategoryCheckedByName(name: string): Promise<boolean> {
    const count = await this.categoryCheckboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = this.categoryCheckboxes.nth(i);
      const label = (await cb.evaluate((el) => {
        const lab = el.closest('label');
        return lab ? lab.textContent || '' : '';
      }).catch(() => '')).trim();
      if (label.toLowerCase().includes(name.toLowerCase())) {
        return await cb.isChecked().catch(() => false);
      }
    }
    return false;
  }

  async clearFilters() {
    if (await this.clearFilterButton.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.clearFilterButton.click().catch(() => null)
      ]);
    } else {
      // fallback: uncheck all checkboxes
      const count = await this.categoryCheckboxes.count();
      for (let i = 0; i < count; i++) {
        const cb = this.categoryCheckboxes.nth(i);
        if (await cb.isChecked().catch(() => false)) {
          try {
            await cb.uncheck();
          } catch {
            const lab = cb.locator('xpath=..');
            await lab.click();
          }
        }
      }
      await this.waitForProductsUpdate();
    }
  }

  async getVisibleProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = (await card.locator(this.productNameLocator).first().textContent().catch(() => '')) ?? '';
      if (name.trim()) names.push(name.trim());
    }
    return names;
  }

  async openProductByIndex(index: number) {
    const card = this.productCards.nth(index);
    await card.locator('a').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForProductsUpdate(timeout = 5000) {
    // wait for either network fetch(s) to complete or change in product count
    const initial = await this.productCards.count();
    await this.page.waitForResponse((resp) => {
      const url = resp.url();
      return /\/api\/|\/products|\/search/i.test(url) && resp.request().method() === 'GET';
    }, { timeout }).catch(() => null);
    // additionally wait until product count stabilizes (changed or same after short delay)
   // try to catch a relevant network response first (best-effort)
    await this.page.waitForResponse(
      (resp) => /\/api\/|\/products|\/search/i.test(resp.url()) && resp.request().method() === 'GET',
      { timeout }
    ).catch(() => null);

    // Poll for a change in visible product card count until timeout (avoids waitForFunction selector issues)
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const current = await this.productCards.count();
      if (current !== initial) return;
      await this.page.waitForTimeout(200);
    }

    // small settle even if count didn't change
    await this.page.waitForTimeout(300);
  }

  async hasNextPage(): Promise<boolean> {
    return await this.nextPageButton.isVisible().catch(() => false);
  }

  async goToNextPage() {
    if (await this.hasNextPage()) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.nextPageButton.click()
      ]);
      await this.page.waitForTimeout(300);
    }
  }
}