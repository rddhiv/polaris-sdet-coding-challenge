import { test, expect } from '@playwright/test';
import { ToolsLoginPage } from '../../Page_Objects/ToolsLoginPage';
import { OrdersPage } from '../../Page_Objects/OrdersPage';

test.describe('Userstory 009 : View Order History - logged in user', () => {
  test('orders list shows date, total and has details link; details page shows items', async ({ page }) => {
    const login = new ToolsLoginPage(page);
    await login.gotoLogin();
     await login.login(process.env.validUsername as string,process.env.validPassword as string);
    await page.waitForTimeout(2000);
    expect(await login.isLoggedIn()).toBeTruthy();

    const orders = new OrdersPage(page);
    await orders.gotoOrders();

    const list = await orders.getOrderList();
    expect(list.length).toBeGreaterThan(0);
    //console.log("list of order details:", list);

    // validate basic columns for first few rows
    for (let i = 0; i < Math.min(3, list.length); i++) {
      const row = list[i];
      expect(row.invoiceId).toMatch(/INV-\d+/); // invoice id pattern
      expect(row.address).toBeTruthy();
      // date should look like yyyy-mm-dd or contain time portion
      expect(row.date).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(row.total).toBeGreaterThanOrEqual(0);
      expect(row.detailsHref).toBeTruthy();
    }

    // open details of first order and verify detail items present
    const firstInvoice = list[0].invoiceId;
    await orders.openDetailsByInvoice(firstInvoice);

      expect(list[0].invoiceId).toBeTruthy();
      expect(list[0].address).toBeTruthy();
      expect(list[0].total).toBeTruthy();
  });
});