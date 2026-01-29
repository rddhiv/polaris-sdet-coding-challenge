# Playwright-Polaris SDET Take Home Coding Challenge (ToolsShopping)

Playwright automated test suite project containing UI tests for the ToolsShopping sample Website.

## Prerequisites
- Node.js v18+ (or compatible)
- npm
- Playwright browsers: `npx playwright install`
- Git bash (for windows)

## Install
```bash
#cd to project/workspace folder
cd /Playwright-POC
npm ci
npx playwright install
```

## Environment
Create a `.env` or export env vars used by tests:
Note:  BASE_URL is used to defined the web application to switch between the **main** and **buggy** site URLs. Default is main webapplication, it can be overide by passing BASE_URL argument in the command line.
```
validUsername=you@example.com
validPassword=yourPassword
invalidUsername=bad@example.com
invalidPassword=badpass
BASE_URL=https://practicesoftwaretesting.com
```
Playwright will pick env vars via process.env in tests.

## Project config pointers
- Playwright config: `playwright.config.ts`
- Tests folder: `tests/ToolsShopping`
- Page objects: `Page_Objects/`
- npm scripts in `package.json`:
  - `npm run test:tools` — run ToolsShopping tests


## Tests (brief)
- SearchProduct.spec.ts  
  - Purpose: Verify search returns relevant results and handles no-match.  
  - Key checks (short): input visible, returns matches, at least one result contains query, opens product detail, shows "no results" for non-matches.
- ToolsLoginPage.spec.ts  
  - Purpose: Validate login/logout and session behavior.  
  - Key checks (short): login form visible, valid login shows user, logout clears session, persistence across navigation (optional), invalid creds show error.
- CategoryFilterAndReset.spec.ts  
  - Purpose: Verify category filters apply and can be cleared.  
  - Key checks (short): categories listed, selecting filters results, checkbox shows checked, clear restores list, filters persist across pagination/navigation.
- UpdateProductToCart.spec.ts  
  - Purpose: Verify add/update/remove cart workflows and pricing.  
  - Key checks (short): adding updates cart count and shows item, quantity changes update line/total prices, removing updates count and shows empty state, cart persistence as expected, handle quantity/stock edge cases.
- ViewProductList.spec.ts  
  - Purpose: Verify product listing page shows the expected list of products and pagination.  
  - Key checks: product cards are visible, product names and prices present, product images load, pagination next/prev behave, list updates when filters/search applied.
- ViewProductDetails.spec.ts  
  - Purpose: Verify product detail page displays correct information for a selected product.  
  - Key checks: product name, description, price, images, SKU/ID (if present), "Add to cart" control enabled, related products or breadcrumbs visible; navigation back to list works.
- ViewOrderHistory.spec.ts  
  - Purpose: Verify logged-in user's order history page shows past orders and details.  
  - Preconditions: user must be logged in.  
  - Key checks: list of orders present, each order shows date/total/status, clicking an order shows line items and totals, pagination or filters for history work.
- CompleteCheckout.spec.ts  
  - Purpose: End-to-end checkout flow from cart to order confirmation.  
  - Preconditions: cart contains at least one purchasable product and user is logged in (or guest checkout allowed).  
  - Key checks: shipping/payment form validation, successful submission shows order confirmation and order id, totals and tax calculations correct, post-order cart cleared.
- AddProductToCart.spec.ts  
  - Purpose: Verify adding products to cart and cart behavior.  
  - Key checks: add single and multiple quantities, quantity updates reflect in line price and cart total, increasing/decreasing quantity updates totals, removing item empties it from cart, cart badge/count updates, persistence across navigation (if expected).


## How to run
- Run entire ToolsShopping testcase for main web application:
```bash
npx playwright test tests/ToolsShopping --workers=1 --trace=on --reporter=list,html
```
- Run entire ToolsShopping testcase for buggy web application:
```bash
BASE_URL=https://with-bugs.practicesoftwaretesting.com npx playwright test tests/ToolsShopping --reporter=list,html
```

- Run entire ToolsShopping folder:
```bash
npx playwright test tests/ToolsShopping
```
- Run with single worker and tracing (useful for debugging concurrency issues):
```bash
npx playwright test tests/ToolsShopping --workers=1 --trace=on
```
- Run a single spec:
```bash
npx playwright test tests/ToolsShopping/SearchProduct.spec.ts
```
- Run a specific test by title:
```bash
npx playwright test -g "entering a product name shows matching results"
```

## HTML report (generate & open)
```bash
# generate HTML report
npx playwright test tests/ToolsShopping --workers=1 --trace=on --reporter=list,html
npx playwright test tests/ToolsShopping --reporter=list,html
npx playwright show-report   # opens last HTML report


## Common failure mode when running full suite
If tests pass individually but fail as a group, likely causes:
- Parallelism causing shared-state interference (cart, single account, cookies, localStorage).
- Tests not fully isolating state or reusing shared resources.

Quick checks:
- Run with `--workers=1` to see if failures disappear.
- Use `--trace=on` and open trace with `npx playwright show-trace <trace.zip>`.
Eg : npx playwright test tests/ToolsShopping --workers=1 --trace=on --reporter=list,html


## Debugging tips
- Re-run failing suite with:
```bash
npx playwright test tests/ToolsShopping --workers=1 --trace=on
```
- Inspect trace with:
```bash
npx playwright show-trace path/to/trace.zip
```
- Use console logs or temporary `test.info()` to capture state.

##  Quick troubleshooting checklist:
Confirm env vars present
Run with --workers=1
Enable trace and open trace.zip
Re-run failing test individually
