import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import rentalPeriodRoutes from "./routes/rentalPeriod.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import addressRoutes from "./routes/address.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import userRoutes from "./routes/user.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import depositRoutes from "./routes/deposit.routes.js";
import pickupRoutes from "./routes/pickup.routes.js";
import returnRoutes from "./routes/return.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
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

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Rental API running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});
