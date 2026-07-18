import { Prisma } from "@prisma/client";

const cartInclude = { items: { include: { product: true, variant: true, rentalPeriod: true } } };
const money = (value) => new Prisma.Decimal(value);

export const createOrderFromCart = async (tx, { userId, addressId, rentalPeriodId, pickupType, startDate, endDate, quotationId = null }) => {
  if (new Date(endDate) <= new Date(startDate)) throw Object.assign(new Error("endDate must be after startDate"), { statusCode: 422 });
  const [cart, address] = await Promise.all([
    tx.cart.findUnique({ where: { userId }, include: cartInclude }),
    tx.address.findFirst({ where: { id: addressId, userId } }),
  ]);
  if (!address) throw Object.assign(new Error("Address not found"), { statusCode: 404 });
  if (!cart?.items.length) throw Object.assign(new Error("Cart is empty"), { statusCode: 422 });
  if (cart.items.some((item) => item.rentalPeriodId !== rentalPeriodId)) throw Object.assign(new Error("All cart items must use the selected rental period"), { statusCode: 422 });

  let subtotal = money(0);
  let deposit = money(0);
  for (const item of cart.items) {
    const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
    if (product.availableStock < item.quantity) throw Object.assign(new Error(`${product.name} no longer has sufficient availability`), { statusCode: 422 });
    subtotal = subtotal.plus(money(item.price).mul(item.quantity));
    deposit = deposit.plus(money(product.depositAmount).mul(item.quantity));
    await tx.product.update({ where: { id: product.id }, data: { availableStock: { decrement: item.quantity } } });
  }
  const settings = await tx.settings.findFirst();
  const tax = settings ? subtotal.mul(settings.taxPercentage).div(100) : money(0);
  const total = subtotal.plus(deposit).plus(tax);
  const order = await tx.order.create({
    data: {
      userId, addressId, quotationId, rentalPeriodId, pickupType,
      startDate: new Date(startDate), endDate: new Date(endDate),
      subtotal, deposit, tax, total,
      items: { create: cart.items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, price: item.price, deposit: money(item.product.depositAmount).mul(item.quantity) })) },
      securityDeposit: { create: { amount: deposit } },
    },
    include: { items: { include: { product: true, variant: true } }, securityDeposit: true, rentalPeriod: true },
  });
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  return order;
};
