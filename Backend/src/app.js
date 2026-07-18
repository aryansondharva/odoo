import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import rentalPeriodRoutes from "./modules/rental-period/rentalPeriod.routes.js";
import variantRoutes from "./modules/variant/variant.routes.js";
import addressRoutes from "./modules/users/address.routes.js";
import profileRoutes from "./modules/users/profile.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import quotationRoutes from "./modules/quotation/quotation.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import depositRoutes from "./modules/deposit/deposit.routes.js";
import pickupRoutes from "./modules/pickup/pickup.routes.js";
import returnRoutes from "./modules/return/return.routes.js";
import invoiceRoutes from "./modules/invoice/invoice.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import couponRoutes from "./modules/coupon/coupon.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/rental-periods", rentalPeriodRoutes);
app.use("/api/v1/variants", variantRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/deposits", depositRoutes);
app.use("/api/v1/pickups", pickupRoutes);
app.use("/api/v1/returns", returnRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/coupons", couponRoutes);

app.use(errorHandler);
app.use((req, res) => res.status(404).json({ status: "error", message: "Route not found" }));

export default app;
