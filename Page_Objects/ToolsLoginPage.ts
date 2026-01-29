import { Page, Locator } from '@playwright/test';

export class ToolsLoginPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMessage: Locator;
  readonly accountName: Locator;
  readonly logoutLink: Locator;
  readonly signin: Locator;
  readonly accountTitle: Locator;

  constructor(page: Page, baseUrl = 'https://practicesoftwaretesting.com') {
    this.page = page;
    this.baseUrl = baseUrl;
    // Login form fields (multiple fallbacks)
    this.signin = page.locator('[data-test="nav-sign-in"]');
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitBtn = page.locator('input[type="submit"]');
    this.errorMessage = page.locator('[data-test="login-error"]');
    // Account indicators / logout (fallbacks)
    this.accountName = page.locator('[data-test="nav-menu"]');
    this.accountTitle = page.locator('[data-test="page-title"]');
    this.logoutLink = page.locator('[data-test="nav-sign-out"]');
  }

  async gotoLogin() {
    // common account/login path for WooCommerce sites
    //await this.page.goto(process.env.urlToolsShopping!);
    await this.page.goto(process.env.BASE_URL!);
    await this.signin.click();
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 3000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.submitBtn.click(),
      this.page.waitForLoadState('networkidle')
    
    ]);
    // brief wait for UI changes (error or success)
    await this.page.waitForTimeout(5000);
  }

  async getErrorText(): Promise<string> {
    const txt = await this.errorMessage.textContent().catch(() => '');
    return (txt ?? '').trim();
  }

  async isLoggedIn(): Promise<boolean> {
    // presence of logout link or account name indicates logged-in state
    if (await this.accountTitle.isVisible().catch(() => false)) return true;
    return await this.accountName.isVisible().catch(() => false);
  }

  async getUserName(): Promise<string> {
    const txt = await this.accountName.textContent().catch(() => '');
    return (txt ?? '').trim();
  }

  async logout() {

    if (await this.accountName.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.accountName.click(),
        this.page.waitForLoadState('networkidle'),
        this.logoutLink.click()
      ]);
    } else {
      // fallback: navigate to my-account and try logout link again
      await this.gotoLogin();
      if (await this.accountName.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.accountName.click(),
        this.page.waitForLoadState('networkidle'),
        this.logoutLink.click()
      ]);
    }
  }
    await this.page.waitForTimeout(400);
  }
}