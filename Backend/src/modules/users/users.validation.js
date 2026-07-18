import { z } from "zod";

const optionalUrl = z.string().url().optional();
export const addressSchema = z.object({ body: z.object({ fullName: z.string().min(2).max(120), phone: z.string().min(10).max(20), addressLine1: z.string().min(4).max(200), addressLine2: z.string().max(200).optional(), city: z.string().min(2).max(100), state: z.string().min(2).max(100), country: z.string().min(2).max(100), postalCode: z.string().min(3).max(20), isDefault: z.boolean().optional() }) });
export const profileSchema = z.object({ body: z.object({ name: z.string().min(2).max(120).optional(), email: z.string().email().optional(), phone: z.string().min(10).max(20).nullable().optional(), avatar: optionalUrl.nullable() }).refine((value) => Object.keys(value).length > 0, "Provide at least one field") });
export const avatarSchema = z.object({ body: z.object({ avatar: z.string().url() }) });
export const userUpdateSchema = z.object({ body: z.object({ name: z.string().min(2).max(120).optional(), email: z.string().email().optional(), phone: z.string().min(10).max(20).nullable().optional(), avatar: optionalUrl.nullable(), role: z.enum(["ADMIN", "CUSTOMER"]).optional(), isVerified: z.boolean().optional() }).refine((value) => Object.keys(value).length > 0, "Provide at least one field") });
