import { Page } from '@playwright/test';

export class BasePageShop {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page, baseUrl = 'https://practicesoftwaretesting.com/') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async goto(path = '') {
    const url = path.startsWith('http') ? path : new URL(path, this.baseUrl).toString();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}