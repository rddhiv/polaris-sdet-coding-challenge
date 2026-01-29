import { Page, Locator, expect } from '@playwright/test';

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly paymentSelect: Locator;
  readonly proceedButton: Locator;
  readonly placeOrderButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.street = page.locator('input[data-test="street"]');
    this.city = page.locator('input[data-test="city"]');
    this.state = page.locator('input[data-test="state"]');
    this.country = page.locator('input[data-test="country"]');
    this.postalCode = page.locator('input[data-test="postal_code"]');
    this.paymentSelect = page.locator('select[data-test="payment-method"]');
    this.proceedButton = page.locator('button:has-text(" Proceed to checkout ")');
    this.placeOrderButton = page.locator('button:has-text("Place order"), button:has-text("Pay"), button:has-text("Confirm")');
    this.successMessage = page.locator('[data-test="payment-success-message"]');
  }

  async gotoCheckout() {
    // direct nav fallback to checkout page
    await this.page.goto('https://practicesoftwaretesting.com/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async fillAddress(address: Address) {
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    if (address.state) await this.state.fill(address.state);
    await this.country.fill(address.country);
    await this.postalCode.fill(address.postal_code);

    // blur final field to trigger validations
    await this.postalCode.evaluate((el: HTMLInputElement) => el.blur()).catch(() => null);
    await this.page.waitForTimeout(300);


  }

  async selectPaymentMethod(value: string) {
    // value should be one of option values e.g. 'credit-card', 'bank-transfer'
    await this.paymentSelect.selectOption({ value }).catch(async () => {
      // fallback: choose by visible text
      await this.paymentSelect.selectOption({ label: value }).catch(() => null);
    });
    await this.page.waitForTimeout(200);
  }

  async clickProceed() {
    if (await this.proceedButton.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.proceedButton.click().catch(() => null)
      ]);
    }
  }

  async placeOrder() {
    if (await this.placeOrderButton.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.placeOrderButton.click().catch(() => null)
      ]);
    }
  }

  async expectPaymentSuccess(timeout = 5000) {
    await expect(this.successMessage).toBeVisible({ timeout });
    const txt = (await this.successMessage.textContent()) ?? '';
    expect(txt.trim().length).toBeGreaterThan(0);
    return txt.trim();
  }
}