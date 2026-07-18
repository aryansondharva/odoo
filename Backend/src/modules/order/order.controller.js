import { PrismaClient } from "@prisma/client";
import { createOrderFromCart } from "../services/order.service.js";
const prisma = new PrismaClient();
const fullOrder = { items: { include: { product: true, variant: true } }, payments: true, securityDeposit: true, pickup: true, returnRecord: true, invoice: true, rentalPeriod: true, address: true };
const visibleOrder = (user) => user.role === "ADMIN" ? {} : { userId: user.id };
export const listOrders = async (req, res, next) => { try { const orders = await prisma.order.findMany({ where: visibleOrder(req.user), include: fullOrder, orderBy: { createdAt: "desc" } }); res.json({ status: "success", data: orders }); } catch (error) { next(error); } };
export const getOrder = async (req, res, next) => { try { const order = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) }, include: fullOrder }); res.json({ status: "success", data: order }); } catch (error) { next(error); } };
export const createOrder = async (req, res, next) => { try { const order = await prisma.$transaction((tx) => createOrderFromCart(tx, { ...req.body, userId: req.user.id })); res.status(201).json({ status: "success", data: order }); } catch (error) { next(error); } };
export const updateOrder = async (req, res, next) => { try { const current = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) } }); if (current.status !== "DRAFT" && current.status !== "PENDING_PAYMENT") throw Object.assign(new Error("Only draft or pending orders can be updated"), { statusCode: 422 }); const order = await prisma.order.update({ where: { id: current.id }, data: req.body, include: fullOrder }); res.json({ status: "success", data: order }); } catch (error) { next(error); } };
export const deleteOrder = async (req, res, next) => { try { const order = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) }, include: { items: true } }); if (order.status !== "DRAFT" && order.status !== "PENDING_PAYMENT") throw Object.assign(new Error("Only draft or pending orders can be deleted"), { statusCode: 422 }); await prisma.$transaction(async (tx) => { await Promise.all(order.items.map((item) => tx.product.update({ where: { id: item.productId }, data: { availableStock: { increment: item.quantity } } }))); await tx.order.delete({ where: { id: order.id } }); }); res.status(204).send(); } catch (error) { next(error); } };
const transition = (status) => async (req, res, next) => { try { const order = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) } }); const updated = await prisma.order.update({ where: { id: order.id }, data: { status }, include: fullOrder }); res.json({ status: "success", data: updated }); } catch (error) { next(error); } };
export const confirmOrder = transition("CONFIRMED");
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) }, include: { items: true } });
    if (["COMPLETED", "CANCELLED"].includes(order.status)) throw Object.assign(new Error("This order cannot be cancelled"), { statusCode: 422 });
    const updated = await prisma.$transaction(async (tx) => { await Promise.all(order.items.map((item) => tx.product.update({ where: { id: item.productId }, data: { availableStock: { increment: item.quantity } } }))); return tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" }, include: fullOrder }); });
    res.json({ status: "success", data: updated });
  } catch (error) { next(error); }
};
export const completeOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirstOrThrow({ where: { id: req.params.id, ...visibleOrder(req.user) }, include: { items: true } });
    if (order.status !== "RETURNED") throw Object.assign(new Error("Only returned orders can be completed"), { statusCode: 422 });
    const updated = await prisma.$transaction(async (tx) => {
      await Promise.all(order.items.map((item) => tx.product.update({ where: { id: item.productId }, data: { availableStock: { increment: item.quantity } } })));
      const value = await tx.order.update({ where: { id: order.id }, data: { status: "COMPLETED" }, include: fullOrder });
      await tx.invoice.upsert({ where: { orderId: order.id }, update: {}, create: { orderId: order.id, invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`, subtotal: value.subtotal, deposit: value.deposit, lateFee: value.lateFee, tax: value.tax, discount: value.discount, total: value.total } });
      return value;
    });
    res.json({ status: "success", data: updated });
  } catch (error) { next(error); }
};
