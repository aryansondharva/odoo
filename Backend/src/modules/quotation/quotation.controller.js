import { Prisma, PrismaClient } from "@prisma/client";
import { createOrderFromCart } from "../services/order.service.js";
const prisma = new PrismaClient();
const money = (value) => new Prisma.Decimal(value);
const visibleQuotation = (user) => user.role === "ADMIN" ? {} : { userId: user.id };
const cartInclude = { items: { include: { product: true } } };
const quotationNumber = () => `QT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
export const listQuotations = async (req, res, next) => { try { const quotations = await prisma.quotation.findMany({ where: visibleQuotation(req.user), orderBy: { createdAt: "desc" } }); res.json({ status: "success", data: quotations }); } catch (error) { next(error); } };
export const getQuotation = async (req, res, next) => { try { const quotation = await prisma.quotation.findFirstOrThrow({ where: { id: req.params.id, ...visibleQuotation(req.user) } }); res.json({ status: "success", data: quotation }); } catch (error) { next(error); } };
export const createQuotation = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: cartInclude });
    if (!cart?.items.length) throw Object.assign(new Error("Cart is empty"), { statusCode: 422 });
    const subtotal = cart.items.reduce((sum, item) => sum.plus(money(item.price).mul(item.quantity)), money(0));
    const deposit = cart.items.reduce((sum, item) => sum.plus(money(item.product.depositAmount).mul(item.quantity)), money(0));
    const settings = await prisma.settings.findFirst();
    const tax = settings ? subtotal.mul(settings.taxPercentage).div(100) : money(0);
    const quotation = await prisma.quotation.create({ data: { userId: req.user.id, quotationNumber: quotationNumber(), subtotal, deposit, tax, total: subtotal.plus(deposit).plus(tax), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    res.status(201).json({ status: "success", data: quotation });
  } catch (error) { next(error); }
};
export const updateQuotation = async (req, res, next) => { try { const quotation = await prisma.quotation.findFirstOrThrow({ where: { id: req.params.id, ...visibleQuotation(req.user) } }); if (req.user.role !== "ADMIN") throw Object.assign(new Error("Only an admin can update a quotation"), { statusCode: 403 }); const updated = await prisma.quotation.update({ where: { id: quotation.id }, data: req.body }); res.json({ status: "success", data: updated }); } catch (error) { next(error); } };
export const deleteQuotation = async (req, res, next) => { try { const quotation = await prisma.quotation.findFirstOrThrow({ where: { id: req.params.id, ...visibleQuotation(req.user) } }); await prisma.quotation.delete({ where: { id: quotation.id } }); res.status(204).send(); } catch (error) { next(error); } };
const setQuotationStatus = (status) => async (req, res, next) => { try { const quotation = await prisma.quotation.findFirstOrThrow({ where: { id: req.params.id, ...visibleQuotation(req.user) } }); const updated = await prisma.quotation.update({ where: { id: quotation.id }, data: { status } }); res.json({ status: "success", data: updated }); } catch (error) { next(error); } };
export const sendQuotation = setQuotationStatus("PENDING_PAYMENT");
export const approveQuotation = setQuotationStatus("CONFIRMED");
export const rejectQuotation = setQuotationStatus("CANCELLED");
export const convertQuotation = async (req, res, next) => { try { const quotation = await prisma.quotation.findFirstOrThrow({ where: { id: req.params.id, ...visibleQuotation(req.user) } }); if (quotation.status !== "CONFIRMED") throw Object.assign(new Error("Only an approved quotation can be converted"), { statusCode: 422 }); if (quotation.expiresAt < new Date()) throw Object.assign(new Error("Quotation has expired"), { statusCode: 422 }); const order = await prisma.$transaction((tx) => createOrderFromCart(tx, { ...req.body, quotationId: quotation.id, userId: req.user.id })); res.status(201).json({ status: "success", data: order }); } catch (error) { next(error); } };
