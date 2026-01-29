import { Page, Locator } from '@playwright/test';

export interface OrderListRow {
  invoiceId: string;
  address: string;
  date: string;
  total: number;
  detailsHref?: string;
  row: Locator;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  linePrice?: number;
}

export class OrdersPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly rows: Locator;
  readonly name: Locator;

  constructor(page: Page, baseUrl = 'https://practicesoftwaretesting.com') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.rows = page.locator('tbody tr');
    this.name = page.locator('h1');
  }

  async gotoOrders() {
    await this.page.goto(`${this.baseUrl}/account/invoices`);
    await this.page.waitForLoadState('networkidle');
  }

  private parsePrice(text: string | null): number {
    const cleaned = (text ?? '').replace(/[^0-9.\-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  async getOrderList(): Promise<OrderListRow[]> {
    const list: OrderListRow[] = [];
    const count = await this.rows.count();
    for (let i = 0; i < 1; i++) {
      const row = this.rows.nth(i);
      const td1 = (await row.locator('td').nth(0).textContent().catch(() => ''))?.trim() ?? '';
      const td2 = (await row.locator('td').nth(1).textContent().catch(() => ''))?.trim() ?? '';
      const td3 = (await row.locator('td').nth(2).textContent().catch(() => ''))?.trim() ?? '';
      const td4 = (await row.locator('td').nth(3).textContent().catch(() => ''))?.trim() ?? '';
      const detailsLoc = row.locator('td').nth(4).locator('a');
      const href = (await detailsLoc.getAttribute('href').catch(() => null)) ?? undefined;

      list.push({
        invoiceId: td1,
        address: td2,
        date: td3,
        total: this.parsePrice(td4),
        detailsHref: href,
        row
      });
    }
    
    return list;
  }

  async openDetailsByInvoice(invoiceId: string) {
    const rows = await this.getOrderList();
    const target = rows.find(r => r.invoiceId === invoiceId);
    if (!target || !target.detailsHref) {
      throw new Error(`Order with invoice ${invoiceId} not found or no details link`);
    }
    // navigate via href to ensure full page load
    const href = target.detailsHref.startsWith('http') ? target.detailsHref : new URL(target.detailsHref, this.baseUrl).toString();
    await this.page.goto(href);
    await this.page.waitForLoadState('networkidle');
  }

  // On order details page: parse items table (common pattern: table tbody tr)
  async getOrderDetailsItems(): Promise<OrderItem[]> {
    const items: OrderItem[] = [];
    const rows = this.page.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const r = rows.nth(i);
      // Try common columns: name in first td, qty in input or td, unit price and line price in later tds
      const name = (await r.locator('td').nth(0).textContent().catch(() => '') )?.trim() ?? '';
      // quantity: try input[data-test="product-quantity"] or second/third td
      let qtyText = (await r.locator('input[data-test="product-quantity"]').inputValue().catch(() => '') )?.trim() ?? '';
      if (!qtyText) {
        qtyText = (await r.locator('td').nth(1).textContent().catch(() => '') )?.trim() ?? '1';
      }
      const unitPriceText = (await r.locator('[data-test="product-price"], td').filter({ hasText: '$' }).first().textContent().catch(() => '')) ?? '';
      const linePriceText = (await r.locator('[data-test="line-price"], td').filter({ hasText: '$' }).nth(0).textContent().catch(() => '')) ?? '';

      const unitPrice = this.parsePrice(unitPriceText);
      const linePrice = this.parsePrice(linePriceText);
      const quantity = parseInt(qtyText.replace(/[^0-9]/g, ''), 10) || 0;

      items.push({ name, quantity, unitPrice, linePrice: linePrice || undefined });
    }
    return items;
  }
}