import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = ["Cameras", "Lenses", "Lighting", "Audio", "Projectors", "Laptops", "Tools", "Furniture", "Event Equipment", "Outdoor Gear"];
const products = ["Mirrorless Camera", "Cinema Camera", "Prime Lens", "Zoom Lens", "LED Panel", "Studio Flash", "Wireless Microphone", "Shotgun Microphone", "HD Projector", "4K Projector", "MacBook Pro", "Gaming Laptop", "Power Drill", "Circular Saw", "Office Chair", "Folding Table", "PA Speaker", "Party Tent", "Mountain Bike", "Camping Tent", "Action Camera", "Tripod", "Ring Light", "DJ Controller", "Coffee Machine"];

async function main() {
  const password = await bcrypt.hash("password123", 10);
  await Promise.all([
    prisma.user.upsert({ where: { email: "admin@rental.local" }, update: {}, create: { name: "Rental Admin", email: "admin@rental.local", password, role: "ADMIN", isVerified: true, phone: "+919000000001" } }),
    prisma.user.upsert({ where: { email: "operations@rental.local" }, update: {}, create: { name: "Operations Admin", email: "operations@rental.local", password, role: "ADMIN", isVerified: true, phone: "+919000000002" } }),
    prisma.user.upsert({ where: { email: "customer@rental.local" }, update: {}, create: { name: "Demo Customer", email: "customer@rental.local", password, role: "CUSTOMER", isVerified: true, phone: "+919000000003" } }),
  ]);

  const seededCategories = await Promise.all(categories.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name, description: `Rental products in the ${name} category` } })));
  const rentalPeriods = [
    ["Hourly", 1, "HOUR"], ["Daily", 1, "DAY"], ["Weekend", 3, "DAY"], ["Weekly", 1, "WEEK"], ["Monthly", 1, "MONTH"],
  ];
  await Promise.all(rentalPeriods.map(([name, duration, unit]) => prisma.rentalPeriod.upsert({ where: { name }, update: { duration, unit }, create: { name, duration, unit } })));

  for (let index = 0; index < 50; index += 1) {
    const name = `${products[index % products.length]} ${String(Math.floor(index / products.length) + 1).padStart(2, "0")}`;
    await prisma.product.upsert({
      where: { sku: `RENT-${String(index + 1).padStart(4, "0")}` },
      update: {},
      create: {
        categoryId: seededCategories[index % seededCategories.length].id,
        name,
        description: `Professionally maintained ${name.toLowerCase()} available for rent.`,
        sku: `RENT-${String(index + 1).padStart(4, "0")}`,
        brand: "RentalPro",
        manufacturer: "RentalPro Equipment",
        pricePerHour: 100 + index * 10,
        pricePerDay: 500 + index * 25,
        pricePerWeek: 2500 + index * 100,
        pricePerMonth: 7500 + index * 250,
        depositAmount: 1000 + index * 100,
        stock: 5 + (index % 8),
        availableStock: 5 + (index % 8),
        status: "AVAILABLE",
      },
    });
  }

  const settings = await prisma.settings.findFirst();
  if (!settings) await prisma.settings.create({ data: { defaultDepositType: "PERCENTAGE", defaultDepositValue: 20, lateFeeType: "FIXED", lateFeeValue: 100, gracePeriod: 1, maxLateFee: 5000, currency: "INR", taxPercentage: 18 } });

  const now = new Date();
  const endDate = new Date(now); endDate.setFullYear(endDate.getFullYear() + 1);
  await Promise.all([
    prisma.coupon.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, minimumAmount: 1000, startDate: now, endDate } }),
    prisma.coupon.upsert({ where: { code: "RENT500" }, update: {}, create: { code: "RENT500", discountType: "FIXED", discountValue: 500, minimumAmount: 5000, startDate: now, endDate } }),
  ]);
  console.log("Rental Management seed data created.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
