-- Initial schema for the Rental Management System.
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'UNDER_REPAIR', 'OUT_OF_STOCK');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'ACTIVE', 'RETURN_REQUESTED', 'RETURNED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND');
CREATE TYPE "DepositStatus" AS ENUM ('HELD', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FORFEITED');
CREATE TYPE "ReturnCondition" AS ENUM ('GOOD', 'DAMAGED', 'MISSING_PARTS', 'REPAIR_REQUIRED');
CREATE TYPE "PickupType" AS ENUM ('STORE_PICKUP', 'HOME_DELIVERY');
CREATE TYPE "FeeType" AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL,
  "phone" TEXT, "avatar" TEXT, "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER', "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL, "token" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Address" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "addressLine1" TEXT NOT NULL, "addressLine2" TEXT,
  "city" TEXT NOT NULL, "state" TEXT NOT NULL, "country" TEXT NOT NULL, "postalCode" TEXT NOT NULL, "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Category" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "image" TEXT,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
  "id" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "sku" TEXT NOT NULL, "brand" TEXT, "manufacturer" TEXT,
  "pricePerHour" DECIMAL(12,2) NOT NULL, "pricePerDay" DECIMAL(12,2) NOT NULL, "pricePerWeek" DECIMAL(12,2) NOT NULL, "pricePerMonth" DECIMAL(12,2) NOT NULL,
  "depositAmount" DECIMAL(12,2) NOT NULL, "stock" INTEGER NOT NULL DEFAULT 0, "availableStock" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE', "thumbnail" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "color" TEXT, "size" TEXT, "serialNumber" TEXT, "barcode" TEXT,
  "condition" "ReturnCondition" NOT NULL DEFAULT 'GOOD', "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RentalPeriod" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "duration" INTEGER NOT NULL, "unit" TEXT NOT NULL,
  CONSTRAINT "RentalPeriod_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Cart" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CartItem" (
  "id" TEXT NOT NULL, "cartId" TEXT NOT NULL, "productId" TEXT NOT NULL, "variantId" TEXT, "rentalPeriodId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1, "price" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Quotation" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "quotationNumber" TEXT NOT NULL, "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
  "subtotal" DECIMAL(12,2) NOT NULL, "deposit" DECIMAL(12,2) NOT NULL, "tax" DECIMAL(12,2) NOT NULL DEFAULT 0, "total" DECIMAL(12,2) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Order" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "addressId" TEXT, "quotationId" TEXT, "rentalPeriodId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT', "pickupType" "PickupType" NOT NULL, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL, "deposit" DECIMAL(12,2) NOT NULL, "lateFee" DECIMAL(12,2) NOT NULL DEFAULT 0, "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "discount" DECIMAL(12,2) NOT NULL DEFAULT 0, "total" DECIMAL(12,2) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "variantId" TEXT, "quantity" INTEGER NOT NULL,
  "price" DECIMAL(12,2) NOT NULL, "deposit" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "method" TEXT NOT NULL, "transactionId" TEXT, "amount" DECIMAL(12,2) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING', "paidAt" TIMESTAMP(3),
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SecurityDeposit" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "amount" DECIMAL(12,2) NOT NULL, "deductedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "refundAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "status" "DepositStatus" NOT NULL DEFAULT 'HELD', "processedAt" TIMESTAMP(3),
  CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Pickup" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "pickupDate" TIMESTAMP(3) NOT NULL, "actualPickupDate" TIMESTAMP(3), "employeeName" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'READY_FOR_PICKUP', "notes" TEXT,
  CONSTRAINT "Pickup_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Return" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "returnDate" TIMESTAMP(3) NOT NULL, "actualReturnDate" TIMESTAMP(3),
  "condition" "ReturnCondition" NOT NULL DEFAULT 'GOOD', "damageReport" TEXT, "missingAccessories" TEXT, "lateFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" "OrderStatus" NOT NULL DEFAULT 'RETURN_REQUESTED',
  CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "invoiceNumber" TEXT NOT NULL, "subtotal" DECIMAL(12,2) NOT NULL, "deposit" DECIMAL(12,2) NOT NULL,
  "lateFee" DECIMAL(12,2) NOT NULL DEFAULT 0, "tax" DECIMAL(12,2) NOT NULL DEFAULT 0, "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL, "pdfUrl" TEXT, "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Settings" (
  "id" TEXT NOT NULL, "defaultDepositType" "FeeType" NOT NULL DEFAULT 'PERCENTAGE', "defaultDepositValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "lateFeeType" "FeeType" NOT NULL DEFAULT 'FIXED', "lateFeeValue" DECIMAL(12,2) NOT NULL DEFAULT 0, "gracePeriod" INTEGER NOT NULL DEFAULT 0,
  "maxLateFee" DECIMAL(12,2), "currency" TEXT NOT NULL DEFAULT 'INR', "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "discountType" "DiscountType" NOT NULL, "discountValue" DECIMAL(12,2) NOT NULL,
  "minimumAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE INDEX "Category_name_idx" ON "Category"("name");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE UNIQUE INDEX "ProductVariant_serialNumber_key" ON "ProductVariant"("serialNumber");
CREATE UNIQUE INDEX "ProductVariant_barcode_key" ON "ProductVariant"("barcode");
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "ProductVariant_barcode_idx" ON "ProductVariant"("barcode");
CREATE UNIQUE INDEX "RentalPeriod_name_key" ON "RentalPeriod"("name");
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");
CREATE INDEX "Quotation_userId_idx" ON "Quotation"("userId");
CREATE UNIQUE INDEX "Order_quotationId_key" ON "Order"("quotationId");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_addressId_idx" ON "Order"("addressId");
CREATE INDEX "Order_rentalPeriodId_idx" ON "Order"("rentalPeriodId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");
CREATE UNIQUE INDEX "SecurityDeposit_orderId_key" ON "SecurityDeposit"("orderId");
CREATE UNIQUE INDEX "Pickup_orderId_key" ON "Pickup"("orderId");
CREATE UNIQUE INDEX "Return_orderId_key" ON "Return"("orderId");
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_rentalPeriodId_fkey" FOREIGN KEY ("rentalPeriodId") REFERENCES "RentalPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_rentalPeriodId_fkey" FOREIGN KEY ("rentalPeriodId") REFERENCES "RentalPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Return" ADD CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
