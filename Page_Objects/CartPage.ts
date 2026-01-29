import { Page, Locator } from '@playwright/test';

export interface CartItem {
  title: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
  row: Locator;
}

export class CartPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly rows: Locator;
  readonly cartCountLocator: Locator;
  readonly cartShopping: Locator;

  constructor(page: Page, baseUrl = 'https://practicesoftwaretesting.com') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.cartShopping = page.locator('[data-test="nav-cart"]');
    this.rows = page.locator('tbody tr');
    this.cartCountLocator = page.locator('[data-test="cart-quantity"]');
  }

  async gotoCart() {
    await this.cartShopping.click();
    await this.page.waitForLoadState('networkidle');
  }

  private parsePrice(text: string | null): number {
    if (!text) return 0;
    const cleaned = text.replace(/[^0-9.\-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  async getCartCount(): Promise<number> {
    const txt = (await this.cartCountLocator.textContent().catch(() => '')) ?? '';
    const num = txt.replace(/[^0-9]/g, '');
    console.log(`Cart count text: "${txt}", parsed number: "${num}"`);
    return num ? parseInt(num, 10) : (await this.rows.count());
  }

  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const count = await this.rows.count();
    for (let i = 0; i < count; i++) {
      const row = this.rows.nth(i);
      const titleRaw = await row.locator('[data-test="product-title"]').textContent().catch(() => null);
      const qtyRaw = await row.locator('input[data-test="product-quantity"]').inputValue().catch(() => null);
      const unitPriceRaw = await row.locator('[data-test="product-price"]').textContent().catch(() => null);
      const linePriceRaw = await row.locator('[data-test="line-price"]').textContent().catch(() => null);
      const title = (titleRaw ?? '').trim();
      const qtyText = (qtyRaw ?? '').trim();
      const unitPriceText = (unitPriceRaw ?? '').trim();
      const linePriceText = (linePriceRaw ?? '').trim();

      const quantity = qtyText ? parseInt(qtyText, 10) || 0 : 0;
      const unitPrice = this.parsePrice(unitPriceText);
      const linePrice = this.parsePrice(linePriceText);

      items.push({ title, quantity, unitPrice, linePrice, row });
    }
    return items;
  }

   async getCartTotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((sum, it) => sum + it.linePrice, 0);
  }

  // Update quantity for the first row that matches the title (case-insensitive)
  async updateQuantityByTitle(titlePartial: string, newQuantity: number) {
    const matching = this.rows.filter({ hasText: titlePartial }).first();
    const exists = (await matching.count()) > 0;
    if (!exists) throw new Error(`No cart row found containing: ${titlePartial}`);

    const linePriceLocator = matching.locator('[data-test="line-price"]').first();
    const previousLine = (await linePriceLocator.textContent().catch(() => ''))?.trim() ?? '';

    const qtyInput = matching.locator('input[data-test="product-quantity"]').first();
    await qtyInput.waitFor({ state: 'visible', timeout: 3000 });

    // set new quantity
    await qtyInput.fill(String(newQuantity));
    // trigger update - try Enter or blur
    await qtyInput.press('Enter').catch(() => null);
    await qtyInput.evaluate((el: HTMLInputElement) => el.blur()).catch(() => null);

    // determine selector for this line-price element to wait for change
    const index = await matching.evaluate((el) =>
      Array.prototype.indexOf.call(el.parentElement!.children, el)
    );
    const selector = `tbody tr:nth-child(${index + 1}) [data-test="line-price"]`;

    // wait until line-price text changes from previousLine (timeout tolerant)
    // wait until line-price text changes from previousLine using Playwright expect (safer & typed)
    const linePriceLocatorForWait = this.page.locator(selector);
    //await expect(linePriceLocatorForWait).not.toHaveText(previousLine, { timeout: 5000 }).catch(() => null);

    // small settle
    await this.page.waitForLoadState('networkidle').catch(() => null);
  }

  async removeItemByTitle(titlePartial: string) {
    const matching = this.rows.filter({ hasText: titlePartial }).first();
    const count = await matching.count();
    if (count === 0) throw new Error(`No cart row found containing: ${titlePartial}`);

    // wait for remove button, click and wait for row to be removed
    const removeBtn = matching.locator('a.btn-danger, button.remove, a.remove').first();
    await removeBtn.waitFor({ state: 'visible', timeout: 3000 });
    await Promise.all([
      this.page.waitForResponse((resp) => resp.ok(), { timeout: 5000 }).catch(() => null),
      removeBtn.click().catch(() => null)
    ]);
    // wait for the row to be detached from DOM
    await matching.waitFor({ state: 'detached', timeout: 5000 }).catch(() => null);
    await this.page.waitForLoadState('networkidle').catch(() => null);
  }

}