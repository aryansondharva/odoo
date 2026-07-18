import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case");
const money = z.coerce.number().nonnegative();

export const categorySchema = z.object({ body: z.object({ name: z.string().min(2).max(100), slug: slug.optional(), description: z.string().max(1000).optional(), imageUrl: z.string().url().optional(), isActive: z.boolean().optional() }) });
export const productSchema = z.object({ body: z.object({ categoryId: z.string().uuid(), name: z.string().min(2).max(180), slug: slug.optional(), description: z.string().max(5000).optional(), brand: z.string().max(100).optional(), images: z.array(z.string().url()).max(10).default([]), securityDeposit: money, status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(), isFeatured: z.boolean().optional() }) });
export const variantSchema = z.object({ body: z.object({ sku: z.string().min(2).max(80), name: z.string().min(1).max(120), attributes: z.record(z.string()).optional(), stockQuantity: z.coerce.number().int().nonnegative().default(0), isActive: z.boolean().optional(), prices: z.array(z.object({ rentalPeriodId: z.string().uuid(), price: money })).optional() }) });
export const rentalPeriodSchema = z.object({ body: z.object({ name: z.string().min(2).max(80), unit: z.enum(["HOUR", "DAY", "WEEK", "MONTH"]), duration: z.coerce.number().int().positive(), isActive: z.boolean().optional(), sortOrder: z.coerce.number().int().optional() }) });
