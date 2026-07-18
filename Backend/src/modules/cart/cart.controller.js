import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const cartInclude = { items: { include: { product: true, variant: true, rentalPeriod: true } } };
const priceForPeriod = (product, period) => {
  const rates = { HOUR: product.pricePerHour, DAY: product.pricePerDay, WEEK: product.pricePerWeek, MONTH: product.pricePerMonth };
  const rate = rates[period.unit];
  if (rate === undefined) throw Object.assign(new Error("Unsupported rental period unit"), { statusCode: 422 });
  return rate.mul(period.duration);
};
const getCart = (userId) => prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: cartInclude });
const ownedItem = (id, userId) => prisma.cartItem.findFirstOrThrow({ where: { id, cart: { userId } }, include: { cart: true } });

export const getMyCart = async (req, res, next) => { try { res.json({ status: "success", data: await getCart(req.user.id) }); } catch (error) { next(error); } };
export const addCartItem = async (req, res, next) => {
  try {
    const [cart, product, period] = await Promise.all([getCart(req.user.id), prisma.product.findUniqueOrThrow({ where: { id: req.body.productId } }), prisma.rentalPeriod.findUniqueOrThrow({ where: { id: req.body.rentalPeriodId } })]);
    if (product.availableStock < req.body.quantity) throw Object.assign(new Error("Insufficient product availability"), { statusCode: 422 });
    if (req.body.variantId) await prisma.productVariant.findFirstOrThrow({ where: { id: req.body.variantId, productId: product.id, status: "AVAILABLE" } });
    const item = await prisma.cartItem.create({ data: { ...req.body, cartId: cart.id, price: priceForPeriod(product, period) } });
    res.status(201).json({ status: "success", data: item });
  } catch (error) { next(error); }
};
export const updateCartItem = async (req, res, next) => {
  try {
    const item = await ownedItem(req.params.id, req.user.id);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: item.productId } });
    if (req.body.quantity && product.availableStock < req.body.quantity) throw Object.assign(new Error("Insufficient product availability"), { statusCode: 422 });
    let price;
    if (req.body.rentalPeriodId) { const period = await prisma.rentalPeriod.findUniqueOrThrow({ where: { id: req.body.rentalPeriodId } }); price = priceForPeriod(product, period); }
    const updated = await prisma.cartItem.update({ where: { id: item.id }, data: { ...req.body, ...(price && { price }) } });
    res.json({ status: "success", data: updated });
  } catch (error) { next(error); }
};
export const deleteCartItem = async (req, res, next) => { try { const item = await ownedItem(req.params.id, req.user.id); await prisma.cartItem.delete({ where: { id: item.id } }); res.status(204).send(); } catch (error) { next(error); } };
export const clearCart = async (req, res, next) => { try { const cart = await getCart(req.user.id); await prisma.cartItem.deleteMany({ where: { cartId: cart.id } }); res.status(204).send(); } catch (error) { next(error); } };
