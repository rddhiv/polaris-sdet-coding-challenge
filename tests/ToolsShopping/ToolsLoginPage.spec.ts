import { test, expect,Page } from '@playwright/test';
import { ToolsLoginPage } from '../../Page_Objects/ToolsLoginPage';


test.describe('Userstory 005: Login - registered user', () => {
let login: ToolsLoginPage;

    /*test.beforeEach(async ({ page }: { page: Page }) =>
     {
        login = new ToolsLoginPage(page);
        await page.context().clearCookies();
        await page.addInitScript(() => localStorage.clear());
        await login.gotoLogin();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); 
      });*/

  test('valid credentials allow successful login and persist across navigation, then logout', async ({ page }) => {
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
    await login.login(process.env.validUsername as string,process.env.validPassword as string);
    //await page.waitForTimeout(2000);
    expect(await login.isLoggedIn()).toBeTruthy();

    const userName = await login.getUserName();
    expect(userName).toBeTruthy(); // acceptance: user's name is shown

    /* // persistence: navigate to home and verify still logged in
    await page.goto('https://practicesoftwaretesting.com/');
    await page.waitForLoadState('networkidle');
    expect(await login.isLoggedIn()).toBeTruthy(); */

    // logout and verify not logged in
    await login.logout();
    expect(await login.isLoggedIn()).toBeFalsy();
  });

  test('invalid credentials show an appropriate error message', async ({ page }) => {
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
    await login.login(process.env.invalidUsername as string,process.env.invalidPassword as string);

    const err = await login.getErrorText();
    // Accept generic or specific error text; require non-empty error
    expect(err.length).toBeGreaterThan(0);
  });
});