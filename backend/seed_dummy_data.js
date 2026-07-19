const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Starting database seeding of 100+ records...");

    // Clean up old transactions
    await prisma.invoice.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    // Keep admin, delete other users
    await prisma.user.deleteMany({
        where: { email: { not: 'admin@rentflow.com' } }
    });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Vendors (15)
    const vendorNames = [
        "TechRentals India", "Urban Living Furniture", "Vanguard Camera Gear", 
        "ElectroRent Solutions", "GreenCamping Gear", "Symphony Sound & Light", 
        "Classic Appliance Rental", "Elite Sports Equip", "HomeSpace Rentals",
        "Dynamic Tools & Machinery", "Prism AV Rentals", "Mobility Solutions",
        "Comfort Zone HVAC Rentals", "Prime Party Decor", "Future Labs Research"
    ];
    const categories = ["Electronics", "Furniture", "Camera Gear", "Appliances", "Camping Gear", "Audio & Visual"];

    const vendors = [];
    for (let i = 0; i < vendorNames.length; i++) {
        const vendor = await prisma.user.create({
            data: {
                name: `Vendor ${i + 1}`,
                email: `vendor${i + 1}@rentflow.com`,
                password: hashedPassword,
                role: 'VENDOR',
                companyName: vendorNames[i],
                gstin: `27AAAAA0000A1Z${i}`,
                vendorCategory: categories[i % categories.length],
                phone: `98765432${i.toString().padStart(2, '0')}`,
                address: `${100 + i}, Commercial Lane, Mumbai`,
                emailVerified: true
            }
        });
        vendors.push(vendor);
    }
    console.log(`Created ${vendors.length} vendors.`);

    // 2. Create Customers (50)
    const customers = [];
    for (let i = 1; i <= 50; i++) {
        const customer = await prisma.user.create({
            data: {
                name: `Customer Client ${i}`,
                email: `customer${i}@gmail.com`,
                password: hashedPassword,
                role: 'CUSTOMER',
                phone: `91234567${i.toString().padStart(2, '0')}`,
                address: `Apartment ${200 + i}, Sector ${i % 10 + 1}, Bengaluru`,
                emailVerified: true
            }
        });
        customers.push(customer);
    }
    console.log(`Created ${customers.length} customers.`);

    // 3. Create Products (60)
    const productTemplates = [
        // Electronics
        { name: "MacBook Pro M3 Max", category: "Electronics", brand: "Apple", color: "Space Black", price: 2500, lateFeeRate: 500, desc: "High performance rendering and development machine." },
        { name: "iPad Pro 12.9 Inch", category: "Electronics", brand: "Apple", color: "Space Gray", price: 1200, lateFeeRate: 200, desc: "Liquid Retina XDR screen with Apple Pencil support." },
        { name: "Sony WH-1000XM5 Headphones", category: "Electronics", brand: "Sony", color: "Silver", price: 400, lateFeeRate: 100, desc: "Industry-leading noise cancelling wireless headphones." },
        { name: "Dell XPS 15 Laptop", category: "Electronics", brand: "Dell", color: "Platinum", price: 1800, lateFeeRate: 350, desc: "Intel Core i9 developer powerhouse laptop." },
        { name: "Lenovo ThinkPad X1 Carbon", category: "Electronics", brand: "Lenovo", color: "Matte Black", price: 1600, lateFeeRate: 300, desc: "Ultra-lightweight business class developer laptop." },
        
        // Furniture
        { name: "Ergonomic Office Chair v2", category: "Furniture", brand: "Herman Miller", color: "Midnight Charcoal", price: 600, lateFeeRate: 150, desc: "Fully adjustable lumbar support executive mesh chair." },
        { name: "Minimalist Birch Desk", category: "Furniture", brand: "IKEA", color: "Natural Wood", price: 300, lateFeeRate: 80, desc: "Solid timber workstation with built-in cable storage." },
        { name: "L-Shaped Sectional Sofa", category: "Furniture", brand: "Urban Ladder", color: "Beige Gray", price: 1500, lateFeeRate: 400, desc: "Ultra premium fabric linen couch for lounges." },
        { name: "Standing Adjustable Desk", category: "Furniture", brand: "FlowDesk", color: "White Wood", price: 800, lateFeeRate: 200, desc: "Dual-motor smart sit-to-stand table top desk." },
        { name: "Comfort Plus Accent Armchair", category: "Furniture", brand: "Woodcraft", color: "Amber Yellow", price: 400, lateFeeRate: 100, desc: "Retro warm accent single sofa chair." },

        // Camera Gear
        { name: "Sony Alpha 7R V Camera", category: "Camera Gear", brand: "Sony", color: "Black", price: 3000, lateFeeRate: 600, desc: "61MP Full-Frame mirrorless camera body." },
        { name: "Canon EOS R5 Mirrorless", category: "Camera Gear", brand: "Canon", color: "Black", price: 2800, lateFeeRate: 500, desc: "8K raw video recording body with custom focus." },
        { name: "DJI Mavic 3 Pro Drone", category: "Camera Gear", brand: "DJI", color: "Slate Gray", price: 2500, lateFeeRate: 500, desc: "Triple camera Hasselblad aerial recording drone." },
        { name: "Sony FE 24-70mm f/2.8 GM II", category: "Camera Gear", brand: "Sony", color: "Black", price: 1200, lateFeeRate: 250, desc: "G Master series professional standard zoom lens." },
        { name: "Gimbal Stabilizer DJI RS 3", category: "Camera Gear", brand: "DJI", color: "Black", price: 600, lateFeeRate: 150, desc: "Handheld smart 3-axis active camera stabilizer." },

        // Appliances
        { name: "Portable Air Conditioner 1.5T", category: "Appliances", brand: "Voltas", color: "White", price: 1000, lateFeeRate: 200, desc: "Quick cooling portable AC unit with wheel rollers." },
        { name: "Dyson V15 Cordless Vacuum", category: "Appliances", brand: "Dyson", color: "Purple/Nickel", price: 700, lateFeeRate: 150, desc: "Laser slim fluffy vacuum clean tool with mounts." },
        { name: "French Door Smart Refrigerator", category: "Appliances", brand: "Samsung", color: "Black Stainless Steel", price: 2200, lateFeeRate: 450, desc: "Triple cooling double-compartment smart home fridge." },
        { name: "Countertop Microwave Oven", category: "Appliances", brand: "LG", color: "Silver", price: 350, lateFeeRate: 90, desc: "Smart inverter convection micro heating oven." },

        // Camping Gear
        { name: "4-Person Waterproof Tent", category: "Camping Gear", brand: "Decathlon", color: "Forest Green", price: 500, lateFeeRate: 120, desc: "Blackout ventilation double-walled camping tent." },
        { name: "Smart Gas Camping Stove", category: "Camping Gear", brand: "Coleman", color: "Red/Steel", price: 200, lateFeeRate: 50, desc: "Dual fuel portable cooking stove burner." },
        { name: "Trekking Backpack 70L", category: "Camping Gear", brand: "Quechua", color: "Navy Blue", price: 250, lateFeeRate: 60, desc: "Heavy duty ergonomic carrying mount mountain pack." }
    ];

    const products = [];
    for (let i = 0; i < 60; i++) {
        const template = productTemplates[i % productTemplates.length];
        const vendor = vendors[i % vendors.length];
        
        const nameSuffix = ` (Batch ${Math.floor(i / productTemplates.length) + 1})`;
        
        const product = await prisma.product.create({
            data: {
                name: template.name + nameSuffix,
                category: template.category,
                brand: template.brand,
                color: template.color,
                description: template.desc,
                price: template.price + (i % 5) * 50, // vary prices slightly
                lateFeeRate: template.lateFeeRate,
                stock: 5 + (i % 10),
                quantityOnHand: 5 + (i % 10),
                durationType: "DAY",
                isPublished: true,
                vendorId: vendor.id
            }
        });
        products.push(product);
    }
    console.log(`Created ${products.length} products.`);

    // 4. Create Orders representing diverse penalty states (40 orders)
    console.log("Generating dummy orders with active/overdue/returned statuses...");
    
    // Helper to generate dates
    const daysAgo = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    };

    const orderStatuses = [
        "QUOTATION", "SALES_ORDER", "CONFIRMED", "PAID", 
        "ACTIVE", "OVERDUE", "RETURNED", "COMPLETED"
    ];

    for (let i = 1; i <= 40; i++) {
        const status = orderStatuses[i % orderStatuses.length];
        const customer = customers[i % customers.length];
        const product1 = products[(i * 3) % products.length];
        const product2 = products[(i * 7) % products.length];

        const daysStartOffset = 10 + (i % 5) * 5; // e.g. started 10, 15, 20, 25 days ago
        const rentalPeriodDays = 5 + (i % 3) * 2; // e.g. 5, 7, 9 days rental duration
        
        const startDate = daysAgo(daysStartOffset);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + rentalPeriodDays);

        const orderNumber = `SO${100000 + i}`;
        
        // Calculate original rent total
        const p1Rate = Number(product1.price);
        const p2Rate = Number(product2.price);
        const rentalDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
        const rentAmount = (p1Rate * 1 + p2Rate * 1) * rentalDays;

        // Calculate dynamic penalty if overdue or returned late
        let lateFee = 0;
        let finalTotal = rentAmount;
        const now = new Date();

        if ((status === 'OVERDUE' || status === 'RETURNED' || status === 'COMPLETED') && now > endDate) {
            const diffTime = now - endDate;
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            if (diffDays > 0) {
                const f1 = Number(product1.lateFeeRate || 0);
                const f2 = Number(product2.lateFeeRate || 0);
                lateFee = (f1 + f2) * diffDays;
                finalTotal = rentAmount + lateFee;
            }
        }

        const order = await prisma.order.create({
            data: {
                userId: customer.id,
                orderNumber,
                status: status,
                totalAmount: finalTotal,
                untaxedAmount: rentAmount,
                discountAmount: i % 4 === 0 ? 200 : 0,
                deliveryAddress: `${i * 12}, Residency Road, Bangalore`,
                billingAddress: `${i * 12}, Residency Road, Bangalore`,
                lateFee: lateFee,
                note: `Dummy generated order #${i} - Status ${status}`,
                createdAt: startDate,
                items: {
                    create: [
                        {
                            productId: product1.id,
                            quantity: 1,
                            price: product1.price,
                            startDate: startDate,
                            endDate: endDate
                        },
                        {
                            productId: product2.id,
                            quantity: 1,
                            price: product2.price,
                            startDate: startDate,
                            endDate: endDate
                        }
                    ]
                }
            }
        });

        // Add corresponding invoices for Paid, Active, Overdue, Returned, Completed
        if (['PAID', 'ACTIVE', 'OVERDUE', 'RETURNED', 'COMPLETED'].includes(status)) {
            await prisma.invoice.create({
                data: {
                    orderId: order.id,
                    amount: finalTotal,
                    status: ['PAID', 'ACTIVE', 'OVERDUE'].includes(status) ? 'UNPAID' : 'PAID',
                    method: 'ONLINE',
                    paymentDate: status === 'COMPLETED' ? endDate : null
                }
            });
        }
    }

    console.log("Seeding complete! Successfully created 100+ database records with diverse test scenarios.");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
