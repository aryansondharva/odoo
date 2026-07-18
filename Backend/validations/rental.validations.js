import { z } from "zod";

const money = z.coerce.number().nonnegative();

export const categorySchema = z.object({ body: z.object({ name: z.string().min(2).max(100), description: z.string().max(1000).optional(), image: z.string().url().optional() }) });
export const productSchema = z.object({ body: z.object({ categoryId: z.string().uuid(), name: z.string().min(2).max(180), description: z.string().max(5000).optional(), sku: z.string().min(2).max(80), brand: z.string().max(100).optional(), manufacturer: z.string().max(100).optional(), pricePerHour: money, pricePerDay: money, pricePerWeek: money, pricePerMonth: money, depositAmount: money, stock: z.coerce.number().int().nonnegative(), availableStock: z.coerce.number().int().nonnegative(), status: z.enum(["AVAILABLE", "RESERVED", "RENTED", "UNDER_REPAIR", "OUT_OF_STOCK"]).optional(), thumbnail: z.string().url().optional() }) });
export const variantSchema = z.object({ body: z.object({ color: z.string().max(50).optional(), size: z.string().max(50).optional(), serialNumber: z.string().max(100).optional(), barcode: z.string().max(100).optional(), condition: z.enum(["GOOD", "DAMAGED", "MISSING_PARTS", "REPAIR_REQUIRED"]).optional(), status: z.enum(["AVAILABLE", "RESERVED", "RENTED", "UNDER_REPAIR", "OUT_OF_STOCK"]).optional() }) });
export const rentalPeriodSchema = z.object({ body: z.object({ name: z.string().min(2).max(80), unit: z.enum(["HOUR", "DAY", "WEEK", "MONTH"]), duration: z.coerce.number().int().positive() }) });
