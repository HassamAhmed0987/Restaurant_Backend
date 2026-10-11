# Restaurant Backend Bruno collection

Open `bruno-tests` as a collection directory in Bruno, then select the **Local** environment. Start the API only after configuring the project's own `.env`; this collection does not start the server, seed MongoDB, or make database changes on your behalf.

## Environment and setup

`baseUrl` defaults to `http://localhost:3001`, derived from `server.js` (`PORT_NUMBER`, falling back to `3001`). Set customer, admin, and super-admin credentials to real, non-production test accounts. No secrets or working IDs are included. Replace the 24-character zero placeholders for `restaurantId`, `categoryId`, `menuItemId`, `orderId`, and `adminId` with IDs returned by your test database.

The only included seed script creates `superadmin@system.com` with a hard-coded password, but this collection deliberately does **not** run it because it writes to MongoDB. If you have already run it in a disposable database, set `superAdminPassword` to that password; otherwise create a super-admin by your approved process.

## Tokens

Run the appropriate login request first. The post-response scripts use Bruno's `res.getStatus()`, `res.getBody()`, and `bru.setEnvVar()` APIs. A successful response with `data.accessToken` saves `customerToken`, `adminToken`, or `superAdminToken`. Failed responses and responses without that field only log a message, leaving an existing token intact. Protected customer requests send `Bearer {{customerToken}}`; admin-management and super-admin requests use their matching variables.

## Recommended safe order

1. Configure the environment and run the three login requests that correspond to accounts you have.
2. Run public restaurant and category retrieval. The category URLs here are the **actual mounted URLs**, not the controller comments.
3. Use an existing active restaurant/category/menu item from a disposable database to fill ID variables, then exercise cart requests with a customer token. For the unavailable-menu negative test, temporarily set `menuItemId` to a known unavailable test item.
4. Run negative tests. Requests labelled `DONT-RUN` are intentionally state-changing. Create/update/delete and checkout requests can mutate data; run only against a dedicated test database.

An admin can be created by a super admin with `08-admin-operations/01`, but it requires an existing restaurant. Restaurant and category creation return their documents in `data`, from which IDs can be copied into the Local environment. Because of the menu-routing conflict described below, the implemented menu controller cannot currently create menu items via HTTP; obtain a menu item ID from existing controlled data.

## Auth roles and known blockers from the current code

The User schema stores roles exactly as `super_admin`, `admin`, and `customer`. Restaurant, category, and user-admin routes use lowercase role checks and can be tested when prerequisites are met. Order routes instead authorize uppercase `CUSTOMER`, `ADMIN`, and `SUPER_ADMIN`, while the schema/login create lowercase roles. Consequently, every normal customer/admin/super-admin token is rejected by the order authorization middleware before checkout, order history, status update, and restaurant-order logic. The marked order requests assert that present behavior rather than pretending checkout works.

`GET /api/users/admins/:id` has a controller defect (`req.param.id` instead of `req.params.id`) and currently returns 500 for an authenticated super admin.

There is no application-level error middleware; controllers handle their own errors, often as 500. Invalid Mongo ObjectIds can therefore produce a 500 rather than a validation status.

## Exact route conflicts

`app.js` mounts RestaurantRoute, CategoryRoute, then MenuRoutes all at `/api/restaurants`. Express checks them in that order:

- `GET /api/restaurants` is handled by the restaurant list route, so the menu list route is never reached.
- `GET /api/restaurants/:id` is handled by restaurant detail, so menu-item detail is never reached.
- `POST /api/restaurants` is handled by restaurant creation before menu creation; an admin receives the restaurant route's 403, and a super admin reaches restaurant creation with the menu-shaped body.
- `PUT /api/restaurants/:id` reaches restaurant update before menu update.
- `DELETE /api/restaurants/:id` has no restaurant route, then does not match CategoryRoute, then reaches MenuRoutes' delete handler.
- Category controller paths become `/api/restaurants/categories/:categoryId` and `/api/restaurants/restaurants/:restaurantId/categories` because the category router itself includes `categories` and `restaurants` segments.

The menu delete route is destructive and should be run only on test data. The current request file does not execute it automatically.

## Validation notes

Cart prices, subtotal, and total are server-derived from the menu item and cart. The tampering request includes client totals only to show that checkout ignores them; due to the role-casing blocker it cannot reach checkout today. Order creation itself accepts only `deliveryAddress`, `phone`, optional `paymentMethod`, and optional `notes`; `paymentMethod` has no schema enum. Order statuses are `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, and `rejected`; payment statuses are `pending`, `paid`, `failed`, and `refunded`.
