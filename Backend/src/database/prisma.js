import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis;

export const prisma =
  prismaGlobal.__rentalPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.__rentalPrisma = prisma;
}
