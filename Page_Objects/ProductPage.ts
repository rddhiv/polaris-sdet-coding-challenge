import { Page, Locator } from '@playwright/test';
import { BasePageShop } from './BasePageShop';

export class ProductPage extends BasePageShop {
  readonly page: Page;
  readonly name: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartBtn: Locator;
  readonly description: Locator;

  constructor(page: Page, basePath = '/') {
    super(page, basePath);
    this.page = page;
    this.name = page.locator('[data-test="product-detail-name"], h1');
    this.price = page.locator('[data-test="unit-price"]');
    this.image = page.locator('//img[@class="figure-img img-fluid"]');
    this.description = page.locator('[data-test="product-description"]');
    this.addToCartBtn = page.locator('[data-test="add-to-cart"]');
  }

  async waitForLoad() {
    await this.name.waitFor({ state: 'visible' });
  }

  async getName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async getPrice(): Promise<string> {
    return (await this.price.innerText()).trim();
  }

  async getImageUrl(): Promise<string> {
    return (await this.image.getAttribute('src')) || '';
  }

   async getDescription(): Promise<string> {
    const txt = await this.description.textContent();
    return txt?.trim() ?? '';
  }
async isAddToCartVisible(): Promise<boolean> {
    return await this.addToCartBtn.isVisible().catch(() => false);
  }

  async isAddToCartEnabled(): Promise<boolean> {
    return await this.addToCartBtn.isEnabled().catch(() => false);
  }

  async clickAddToCart() {
    await this.addToCartBtn.click();
  }
  async addToCart() {
    await this.addToCartBtn.click();
  }
}