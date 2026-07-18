# Rental Management System

Backend-first rental platform for the Odoo × KSV hackathon. The Express and Prisma API handles catalog management, rental orders, deposits, pickup/return operations, invoices, reporting, and notifications.

## Stack

- Node.js, Express, PostgreSQL, Prisma
- JWT authentication and bcrypt password hashing
- Zod request validation, Helmet, CORS, PDFKit

## API

Base URL: `/api/v1`

All authenticated endpoints use `Authorization: Bearer <accessToken>`. Catalog reads and registration/login are public. Management, operational, reporting, settings, and coupon management endpoints require `ADMIN`.

| Resource | Base route |
| --- | --- |
| Authentication | `/auth` |
| Users / profile / addresses | `/users`, `/profile`, `/addresses` |
| Catalog | `/categories`, `/products`, `/variants`, `/rental-periods` |
| Rental flow | `/cart`, `/quotations`, `/orders`, `/payments`, `/deposits` |
| Operations | `/pickups`, `/returns`, `/invoices` |
| Administration | `/notifications`, `/settings`, `/dashboard`, `/reports`, `/coupons` |

The endpoint paths follow Master Document 3. For example:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/products/search?q=camera
POST   /api/v1/cart/items
POST   /api/v1/orders
POST   /api/v1/payments/create
POST   /api/v1/pickups/schedule
GET    /api/v1/invoices/:id/download
GET    /api/v1/dashboard
```

## Local setup

```powershell
cd Backend
Copy-Item .env.example .env
# Set DATABASE_URL, JWT_SECRET, and JWT_REFRESH_SECRET in .env
npm.cmd install
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

The API runs on `http://localhost:3000` unless `PORT` is set. Use `npm.cmd` in PowerShell environments where script execution is disabled.

## Seed accounts

After `npm.cmd run db:seed`:

- `admin@rental.local` / `password123`
- `operations@rental.local` / `password123`
- `customer@rental.local` / `password123`

The seed also creates 10 categories, 50 products, 5 rental periods, default settings, and two sample coupons.

## Database lifecycle

The current repository contains a clean rental baseline migration at [migration.sql](Backend/prisma/migrations/20260718000000_initial_rental_schema/migration.sql). It replaces the previous HRMS-specific migration history. Apply it only to a new or intentionally reset rental database.

```powershell
cd Backend
npm.cmd run db:migrate
```

`db:push` is useful for a disposable development database but should not be used as the production migration workflow.
