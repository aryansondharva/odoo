# RentFlow Backend: Architecture and Route Guide

This document explains how the RentFlow backend works, how requests move through the codebase, and how to present it clearly in a mentor review.

## 1. Project purpose

RentFlow is a rental-management application. It supports three roles:

- `CUSTOMER`: browses products, manages a cart, places orders, pays invoices, and tracks rentals.
- `VENDOR`: creates products, manages rental orders, creates invoices, and views vendor reports.
- `ADMIN`: views platform statistics, users, and manages rental periods and product attributes.

The backend is a REST API built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma**. Authentication uses **JWT** tokens; password hashing uses **bcrypt**; outgoing verification/reset emails use **Nodemailer**.

## 2. High-level request flow

```text
Next.js frontend
       |
       | HTTP request to http://localhost:5000/api/...
       v
Express app (src/app.js)
       |
       v
Route file (src/routes/*.js)
       |
       | optional: protect / role middleware
       v
Controller (src/controllers/*.js)
       |
       | optional: business service
       v
Prisma Client (src/config/db.js)
       |
       v
PostgreSQL database (rentflow)
       |
       v
JSON response back to the frontend
```

Example: a customer adds an item to their cart.

1. The frontend sends `POST /api/cart/add` with a JWT in `Authorization: Bearer <token>`.
2. `cartRoutes.js` runs the `protect` middleware.
3. The middleware verifies the JWT and saves its payload in `req.user`.
4. `cartController.addToCart` validates the request body.
5. `cartService.addToCart` checks product stock and rental-date availability through Prisma.
6. Prisma writes the `CartItem` row and returns the refreshed cart.
7. The API responds with `{ success: true, data: cart }`.

## 3. Folder structure and responsibility

```text
backend/
├── prisma/
│   ├── schema.prisma          # Database models, enums, and relations
│   ├── migrations/            # Versioned SQL changes to PostgreSQL
│   └── seed.js                # Sample coupons and products
├── src/
│   ├── app.js                 # Express application entry point
│   ├── config/db.js           # Shared Prisma Client
│   ├── routes/                # URL + HTTP method definitions
│   ├── controllers/           # Request/response handling
│   ├── services/              # Reusable business logic
│   ├── middlewares/           # JWT and role checks
│   └── utils/                 # JWT, password, and email utilities
├── uploads/                   # Uploaded profile images served publicly
├── .env                       # Local secrets and runtime configuration; never commit
└── .env.example               # Safe template for required environment variables
```

### Why controllers and services are separate

Controllers deal with HTTP concerns: `req`, `res`, status codes, and error responses. Services hold reusable business logic, such as cart calculations, coupon validation, and product availability. This keeps routes thin and makes business rules easier to test and reuse.

## 4. Application startup

`src/app.js` does the following:

1. Loads variables from `.env` with `dotenv.config()`.
2. Creates an Express app.
3. Enables CORS.
4. Enables JSON and URL-encoded request bodies up to 50 MB.
5. Mounts each API router under an `/api/...` prefix.
6. Serves files in `uploads/` through `/uploads/...`.
7. Exposes `GET /health` for a simple health check.
8. Starts the server on `process.env.PORT` or port `5000`.

Useful command:

```bash
cd backend
npm run dev
```

Health check:

```http
GET http://localhost:5000/health
```

Expected response:

```json
{ "status": "OK" }
```

## 5. Environment variables

The backend reads these values from `backend/.env`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL used by Prisma. |
| `JWT_SECRET` | Secret used to sign and verify access/reset tokens. |
| `PORT` | Express server port; normally `5000`. |
| `BACKEND_URL` | Base backend URL when constructing server URLs. |
| `SMTP_HOST` | SMTP hostname, for example `smtp.gmail.com`. |
| `SMTP_PORT` | SMTP port, normally `587` for STARTTLS or `465` for TLS. |
| `SMTP_SECURE` | `false` for port 587; `true` for port 465. |
| `SMTP_EMAIL` | Mailbox username. |
| `SMTP_PASSWORD` | SMTP password or provider app password. |
| `FROM_NAME` / `FROM_EMAIL` | Sender shown to the recipient. |

Never put real credentials in Git, README files, screenshots, or chat messages. Use `.env.example` as the safe configuration template.

## 6. Authentication and authorization

### Passwords

Passwords are hashed with bcrypt before they are stored. The API never intentionally returns a password hash in its normal user responses.

### JWT access token

After successful login and email verification, `utils/auth.js` creates a JWT with:

```json
{
  "userId": "user UUID",
  "role": "CUSTOMER | VENDOR | ADMIN"
}
```

The access token expires after one day. The frontend sends it with each protected request:

```http
Authorization: Bearer <access-token>
```

### Middleware

`middlewares/authMiddleware.js` contains these checks:

| Middleware | What it does |
| --- | --- |
| `protect` | Requires a valid Bearer JWT and attaches its decoded payload to `req.user`. Invalid or absent token returns `401`. |
| `authorize(...roles)` | Allows only one of the named roles. |
| `requireVendor` | Allows `VENDOR` and `ADMIN`. |
| `requireCustomer` | Allows only `CUSTOMER`. |
| `requireAdmin` | Allows only `ADMIN`. |

### Email OTP verification flow

The first valid login for an unverified user follows this flow:

```text
POST /api/auth/login (email + password)
       |
       | password is valid, but emailVerified is false
       v
Generate a random six-digit OTP
       |
       | store only SHA-256 hash + 10-minute expiry in User table
       v
Send OTP with Nodemailer
       |
       v
Return HTTP 403 + requiresEmailVerification: true
       |
       v
POST /api/auth/verify-email (email + code)
       |
       v
Compare hashed code, mark emailVerified=true, clear OTP fields
       |
       v
User signs in again and receives a JWT
```

The plaintext OTP is sent only in the email. The database stores a hash, not the code itself.

## 7. Database design

Prisma describes the database in `prisma/schema.prisma`; each migration in `prisma/migrations/` is the SQL history used to reach the current schema.

### Core entities

| Model | Main responsibility | Important relations |
| --- | --- | --- |
| `User` | Customer, vendor, or admin account. | Has one cart, many orders, coupon usages, and vendor products. |
| `Product` | A rentable item created by a vendor. | Has variants, cart items, order items, and optional vendor owner. |
| `ProductVariant` | Option values such as color or size. | Belongs to one product. |
| `Cart` | One current cart per user. | Belongs to one user and has many cart items. |
| `CartItem` | Product, quantity, variants, and rental dates in a cart. | Belongs to a cart and product. |
| `Coupon` | Discount rule with expiry and usage limit. | Has many coupon-usage records. |
| `CouponUsage` | Audit record of a user using a coupon. | Links a user and coupon. |
| `Order` | Rental quotation/order and its lifecycle status. | Belongs to a user; has order items and optional invoice. |
| `OrderItem` | Snapshot of rented product, price, quantity, and dates. | Belongs to an order and product. |
| `Invoice` | Payment document for one order. | One-to-one with an order. |
| `RentalPeriod` | Admin-configured duration such as daily or weekly. | Standalone settings data. |
| `Attribute` / `AttributeValue` | Admin-configured product attributes and allowed values. | Attribute has many values. |

### Important enums

`Role`:

```text
ADMIN, VENDOR, CUSTOMER
```

`DurationType`:

```text
HOUR, DAY, WEEK, MONTH, YEAR
```

`OrderStatus`:

```text
QUOTATION → QUOTATION_SENT → SALES_ORDER → PAID → PICKED_UP → RETURNED
```

Other allowed status values are `CONFIRMED`, `COMPLETED`, and `CANCELLED`.

### Rental lifecycle

```text
Customer/Vendor creates quotation
            ↓
Vendor sends quotation (optional)
            ↓
Vendor confirms it: availability is checked
            ↓
Order becomes SALES_ORDER
            ↓
Vendor creates invoice (UNPAID)
            ↓
Customer pays: invoice and order become PAID
            ↓
Vendor marks pickup: stock-on-hand decreases
            ↓
Vendor marks return: stock-on-hand increases; late fee is calculated
```

## 8. Complete API route map

All responses generally use this shape:

```json
{ "success": true, "data": {} }
```

Errors generally use:

```json
{ "success": false, "message": "Explanation of the problem" }
```

### 8.1 Authentication — `/api/auth`

| Method and endpoint | Access | Controller behavior |
| --- | --- | --- |
| `POST /signup` | Public | Creates a user, hashes password, handles optional customer signup coupon. New account starts unverified. |
| `POST /login` | Public | Validates password. Unverified user receives emailed OTP flow; verified user receives JWT and public user data. |
| `POST /verify-email` | Public | Accepts `email` and six-digit `code`; verifies hash/expiry and enables login. |
| `POST /forgot-password` | Public | Creates a 15-minute reset JWT and sends/logs a reset URL. |
| `POST /reset-password` | Public | Validates reset JWT and writes a new bcrypt password hash. |
| `GET /me` | JWT | Returns the current user without the password. |

### 8.2 Products — `/api/products`

| Method and endpoint | Access | Controller/service behavior |
| --- | --- | --- |
| `GET /` | Public | Lists products; supports `brand`, `color`, `durationType`, `minPrice`, `maxPrice`, and `vendorId` query filters. Includes variants. |
| `POST /` | Vendor/Admin | Creates a product and assigns `vendorId` from the JWT user. |
| `PUT /:id` | Vendor/Admin | Updates product details, price, stock, publication state, and attributes. |
| `GET /:id` | Public | Returns one product and variants. |
| `GET /:id/availability` | Public | Uses `startDate` and `endDate` to calculate reserved quantity and available units. |

### 8.3 Cart — `/api/cart`

Every cart endpoint requires a JWT.

| Method and endpoint | Controller/service behavior |
| --- | --- |
| `GET /` | Finds or creates the caller's cart, including product details and calculated total. |
| `POST /add` | Adds a product; validates stock and, when dates are supplied, overlapping-rental availability. |
| `PATCH /item/:id` | Updates a cart item quantity; quantity zero removes it. |
| `DELETE /item/:id` | Removes the caller's cart item. |
| `POST /apply-coupon` | Validates coupon and stores its code/discount percentage on the cart. |

### 8.4 Orders — `/api/orders`

All order routes require a JWT.

| Method and endpoint | Intended behavior |
| --- | --- |
| `POST /` | Creates an order as a `QUOTATION` with nested order items. Vendor/admin can supply `customerId` to create for another user. Deletes caller cart when the caller owns the order. |
| `GET /` | Customer sees own orders; vendor/admin currently see all orders. |
| `GET /export` | Exports the caller's orders to CSV. Must appear before `/:id` in the router. |
| `GET /:id` | Returns an order; current implementation permits owner or admin. |
| `POST /:id/send` | Moves `QUOTATION` to `QUOTATION_SENT`; email sending is currently only a console placeholder. |
| `POST /:id/confirm` | Checks overlapping rental stock and moves a quotation to `SALES_ORDER`. |
| `POST /:id/pay` | Requires an existing unpaid invoice; marks order and invoice `PAID`. Payment gateway is currently mocked. |
| `POST /:id/pickup` | Reduces `quantityOnHand` and sets status to `PICKED_UP`. |
| `POST /:id/return` | Restores `quantityOnHand`, sets `RETURNED`, and calculates a simple late fee. |

### 8.5 Fulfillment — `/api/fulfillment`

| Method and endpoint | Access | Behavior |
| --- | --- | --- |
| `PUT /:id/pickup` | Vendor/Admin | Alternate pickup workflow. Requires a paid invoice and paid order, then sets `PICKED_UP`. |
| `PUT /:id/return` | Vendor/Admin | Alternate return workflow. Requires `PICKED_UP`, checks late return, then sets `RETURNED`. |

The order routes and fulfillment routes overlap. The order-controller version also updates `quantityOnHand`; the fulfillment-controller version does not. Pick one workflow before production so stock behavior is consistent.

### 8.6 Invoices — `/api/invoice`

| Method and endpoint | Access | Behavior |
| --- | --- | --- |
| `POST /create/:orderId` | Vendor/Admin | Creates a single `UNPAID` invoice for an order. |
| `GET /:id` | JWT | Looks up invoice by invoice ID, then by order ID, and returns customer/order/items. |
| `GET /:id/pdf` | JWT | Placeholder response; PDF generation is not yet implemented. |
| `PATCH /:id/void` | Vendor/Admin | Changes invoice status to `VOID`. |

### 8.7 Users — `/api/users`

Every user route requires a JWT.

| Method and endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /profile` | JWT | Gets the caller's profile fields. |
| `PUT /profile` | JWT | Updates caller profile; accepts optional `profileImage` upload up to 5 MB. Image is saved in `backend/uploads`. |
| `PUT /password` | JWT | Verifies current password and writes a bcrypt hash of the new password. |
| `GET /customers` | JWT | Returns users with `CUSTOMER` role. |
| `GET /` | Admin | Returns all users without password hashes. |

### 8.8 Admin settings — `/api/settings`

| Method and endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /periods` | Public | Lists rental periods sorted by duration. |
| `POST /periods` | Admin | Creates a rental period. |
| `DELETE /periods/:id` | Admin | Deletes a rental period. |
| `GET /attributes` | Public | Lists product attributes with their values. |
| `POST /attributes` | Admin | Creates an attribute and optional nested values. |
| `POST /attributes/:attributeId/values` | Admin | Adds a value to an existing attribute. |

### 8.9 Dashboard and reports

| Method and endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /api/dashboard/stats` | Admin | Platform totals: revenue, active rentals, users, vendors, products, recent activity, and top vendors. |
| `GET /api/reports/vendor` | Vendor/Admin | Vendor revenue for six months, top products, total orders, and active rentals. |

### 8.10 Static uploaded files

```http
GET /uploads/<file-name>
```

Images uploaded through the profile route are served by Express from `backend/uploads`.

## 9. Important business logic

### Product availability

Availability checks count all `OrderItem` rows for the same product whose rental dates overlap the requested dates and whose order status is active/reserved. The overlap rule is:

```text
requested start <= existing end
AND
requested end >= existing start
```

Reserved quantity is subtracted from `Product.stock` to calculate available units.

### Cart totals

The cart service returns calculated values rather than permanently storing totals:

```text
subtotal = sum(product price × quantity)
discount amount = subtotal × discount percent / 100
total = max(0, subtotal - discount amount)
```

### Coupon checks

Coupon validation checks that the coupon:

1. Exists.
2. Is active.
3. Has not expired.
4. Has not reached `usageLimit`.

At customer signup, coupon application increments `usedCount` and creates a `CouponUsage` record inside a Prisma transaction.

### Transactions

Prisma transactions are used where several database writes must succeed together:

- Creating an order and clearing the caller cart.
- Updating an order and invoice on payment.
- Updating order status and stock on pickup/return.
- Increasing coupon count and recording coupon usage.

## 10. Current implementation notes and improvements

This section is useful in a mentor review because it shows that you understand the current state and production next steps.

### Security and authorization

- Product update currently allows any vendor/admin; it should verify that a vendor owns the product before allowing update.
- Several order action routes use `protect` but do not currently enforce `requireVendor` or customer ownership. Add role and ownership checks before production.
- `GET /api/users/customers` currently allows any authenticated user; it should normally be vendor/admin-only.
- `GET /api/invoice/:id` allows any authenticated user. It should verify that the caller owns the order or is the vendor/admin.
- Global `cors()` accepts all origins. Production should use an allowlist of the deployed frontend domain.
- The password-reset flow writes a reset URL to `reset-link.txt` and console for development convenience. Disable this behavior in production.
- `sendEmail.js` uses `rejectUnauthorized: false`, which weakens TLS certificate validation. Remove it for production SMTP.

### Reliability and consistency

- Prefer the shared Prisma instance from `src/config/db.js` everywhere. Several controllers create their own `new PrismaClient()`, which can create unnecessary connection pools.
- The code has two pickup/return implementations. Consolidate them so both stock and status updates follow one source of truth.
- The dashboard currently uses random values for some top-vendor rental/revenue fields; replace them with real aggregation queries.
- Payment and invoice PDF generation are placeholders. Integrate a payment gateway and PDF service before calling them complete features.
- Some error responses include `error.stack` during order creation. Never expose stack traces in production API responses.
- Add request validation with a library such as Zod/Joi/express-validator for body, parameter, and date validation.
- Add rate limiting to login, OTP verification, and password reset routes.

## 11. Commands for database maintenance

```bash
# Apply committed migrations to the configured database
npx prisma migrate deploy

# Generate the Prisma client after schema changes
npx prisma generate

# Open the database UI locally
npx prisma studio

# Seed sample products and coupons
npx prisma db seed
```

## 12. Mentor presentation script

You can say:

> “The backend is an Express REST API connected to PostgreSQL through Prisma. We use a layered structure: routes define endpoints, middleware verifies JWT and roles, controllers manage HTTP responses, and services hold reusable business rules. The main domain is rental management: products can be reserved for dates, carts validate availability, orders move from quotation through payment, pickup, and return, and invoices track settlement. Prisma migrations keep database changes versioned. We also added email OTP verification, where a six-digit code is hashed in the database, expires after ten minutes, and must be verified before the first login can create a JWT session.”

If asked about improvements:

> “The prototype has the core workflow working. For production, I would enforce ownership checks consistently, replace mock payment/PDF/report values, add validation and rate limiting, restrict CORS, and consolidate the duplicate fulfillment workflows.”
