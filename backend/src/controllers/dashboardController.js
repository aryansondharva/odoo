const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (from PAID/COMPLETED orders)
        const header = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ['PAID', 'PICKED_UP', 'COMPLETED', 'CONFIRMED'] }
            }
        });
        const totalRevenue = header._sum.totalAmount || 0;

        // 2. Active Rentals
        const activeRentals = await prisma.order.count({
            where: {
                status: { in: ['CONFIRMED', 'PAID', 'PICKED_UP'] }
            }
        });

        // 3. Total Orders
        const totalOrders = await prisma.order.count();

        // 4. User Counts
        const totalUsers = await prisma.user.count();
        const activeVendors = await prisma.user.count({ where: { role: 'VENDOR' } });

        // 5. Products
        const totalProducts = await prisma.product.count();

        // 6. Recent Activity (from latest DB entries)
        const latestUsers = await prisma.user.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
        const latestProducts = await prisma.product.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { vendor: { select: { name: true } } }
        });
        const latestOrders = await prisma.order.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, totalAmount: true, status: true, createdAt: true, user: { select: { name: true } } }
        });

        const activity = [
            ...latestUsers.map(u => ({ type: 'USER', title: 'New User Registered', meta: `${u.name} joined`, time: u.createdAt })),
            ...latestProducts.map(p => ({ type: 'PRODUCT', title: 'New Product Listed', meta: `${p.name} by ${p.vendor?.name || 'Unknown'}`, time: p.createdAt })),
            ...latestOrders.map(o => ({ type: 'ORDER', title: 'New Order', meta: `Order #${o.id.substring(0, 8)} - ₹${o.totalAmount}`, time: o.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

        // 7. Top Vendors — real aggregated data
        const topVendorsRaw = await prisma.product.groupBy({
            by: ['vendorId'],
            _count: { id: true },
            where: { vendorId: { not: null } },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        const topVendors = await Promise.all(topVendorsRaw.map(async (item) => {
            const vendor = await prisma.user.findUnique({ where: { id: item.vendorId } });

            // Real rental count: orders that contain this vendor's products
            const vendorProductIds = await prisma.product.findMany({
                where: { vendorId: item.vendorId },
                select: { id: true }
            });
            const productIds = vendorProductIds.map(p => p.id);

            const rentalCount = await prisma.orderItem.count({
                where: {
                    productId: { in: productIds },
                    order: { status: { in: ['CONFIRMED', 'PAID', 'PICKED_UP'] } }
                }
            });

            // Real revenue: sum of order item prices for this vendor's products
            const revenueAgg = await prisma.orderItem.aggregate({
                _sum: { price: true },
                where: {
                    productId: { in: productIds },
                    order: { status: { in: ['PAID', 'PICKED_UP', 'COMPLETED', 'CONFIRMED'] } }
                }
            });

            return {
                name: vendor?.companyName || vendor?.name || 'Unknown',
                products: item._count.id,
                rentals: rentalCount,
                revenue: Number(revenueAgg._sum.price || 0)
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: Number(totalRevenue),
                activeRentals,
                totalOrders,
                totalUsers,
                activeVendors,
                totalProducts,
                activity,
                topVendors
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};

module.exports = { getDashboardStats };

