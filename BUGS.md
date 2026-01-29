Bug Report Summary – Practice Software Testing (Buggy Site)

1. Product Listing Inconsistency

Steps to Reproduce
	1.	Navigate to https://with-bugs.practicesoftwaretesting.com
	2.	Scroll or paginate through the product list

Expected Behavior
	•	Products should load consistently with correct names, images, and prices.
	•	Pagination should load the next set of products with correct names alignment, images, and prices.

Actual Behavior
	•	Some products are missing images or prices.
	•	Pagination intermittently fails or does not load new products with correct names alignment, images, and prices.
	•	UI layout breaks for certain product cards.

⸻----------------------------------------------------------------------------------------------------------

2. Add to Cart Failure

Steps to Reproduce
	1.	Open any product detail page
	2.	Click Add to Cart
	3.	Navigate to the cart

Expected Behavior
	•	Selected product should be added to the cart with correct quantity and price.

Actual Behavior
	•	Product is not added to the cart,
	•	Oeps, something went wrong messgae is displaying with spelling mistake.

⸻----------------------------------------------------------------------------------------------------------

3. Product Details Page Errors

Steps to Reproduce
	1.	Click on a product from the product list
	2.	Observe the product detail page

Expected Behavior
	•	Product details (name, description, price, availability) should display correctly.

Actual Behavior
	•	Price does not shown on product details page.
	•	Add to cart button overlapped with Add to favorites button
	•	Tool Shopping header image is missing
	•	Contact menu name is misspelled with contakt
	

⸻----------------------------------------------------------------------------------------------------------

4. Filter / Search Malfunction

Steps to Reproduce
	1.	Use category filters or search on the Shop page
	2.	Apply multiple filters

Expected Behavior
	•	Product list should update according to selected filters/search term, if not available should throw no found error.

Actual Behavior
	•	Filters apply correctly.
	•	Results changing accordingly to list but no error message throw if no product found.
	
⸻----------------------------------------------------------------------------------------------------------
5. Misspelling in Sort by Name / Search by Name UI labels

Steps to Reproduce

1.Navigate to https://with-bugs.practicesoftwaretesting.com
2.Observe the labels used for sorting  and search

Expected Behavior
The labels should read clearly and correctly, for example:
"Sort"
"Search" (with proper capitalization)

Actual Behavior
The UI displays misspelled text for these controls.the labels appear as "Sorth and Serch ".Please correct all occurrences to the proper phrasing above.
⸻----------------------------------------------------------------------------------------------------------
6. Username not displayed correctly after login with username/password
Steps to Reproduce

1.Navigate to https://with-bugs.practicesoftwaretesting.com
2.Sign in with a valid username and password

Expected Behavior
After successful login, the UI should display the signed-in username (e.g., in the header or user/profile area).

Actual Behavior
The username is not displayed. Instead, a "user data not found" error is shown.
⸻----------------------------------------------------------------------------------------------------------
7. Cart update and checkout flow failing: cart updates not applied, delete not working, totals reset to 0, and payment steps blocked

Steps to Reproduce

Navigate to https://with-bugs.practicesoftwaretesting.com
Sign in with a valid username and password
Click on Cart
Update the cart (e.g., change quantity or add items)
Observe the total value calculation
Delete an item by clicking the Delete button
Proceed to Billing Info
Fill out Billing Info and proceed to Payment
Attempt to complete checkout

Expected Behavior
Cart updates should be applied and totals should recalculate correctly
Deleting an item should remove it from the cart
Billing Info and Payment steps should accept input
Checkout should complete and show a confirmation message

Actual Behavior
After login, updating the cart fails
Deleting an item does not remove it from the cart
Total value remains 0
Proceeding to Billing Info button name is missing and Payment is blocked; checkout cannot be completed
In Payment details, fields such as Account Name and Account Number are required across all payment types, preventing progress if left empty

⸻----------------------------------------------------------------------------------------------------------
8. View order history: Invoice details not displaying correctly in Details view
Steps to Reproduce

Navigate to https://with-bugs.practicesoftwaretesting.com
Sign in with valid username and password
Open Order History (or Invoices) and select an invoice
Click Details
Observe the billing info displayed (invoice number, billing address, payment method)

Expected Behavior
The Details view should show accurate and complete billing information, including:
Invoice number
Billing address
Payment method

Actual Behavior
Billing information is not displayed correctly in Details. Some fields may be missing or undefined (invoice number, address, or payment method).

⸻----------------------------------------------------------------------------------------------------------