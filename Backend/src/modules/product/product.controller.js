import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const detailInclude = { category: true, variants: true };

export const listProducts = async (req, res, next) => {
  try {
    const { categoryId, search, page = "1", limit = "20" } = req.query;
    const where = { ...(categoryId && { categoryId }), ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { brand: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] }) };
    const [data, total] = await prisma.$transaction([prisma.product.findMany({ where, include: detailInclude, skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: "desc" } }), prisma.product.count({ where })]);
    res.json({ status: "success", data, meta: { page: Number(page), limit: Number(limit), total } });
  } catch (error) { next(error); }
};

export const getProduct = async (req, res, next) => { try { const product = await prisma.product.findUniqueOrThrow({ where: { id: req.params.productId }, include: detailInclude }); res.json({ status: "success", data: product }); } catch (error) { next(error); } };

export const createProduct = async (req, res, next) => {
  try { const product = await prisma.product.create({ data: req.body, include: detailInclude }); res.status(201).json({ status: "success", data: product }); }
  catch (error) { next(error); }
};

export const updateProduct = async (req, res, next) => { try { const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body, include: detailInclude }); res.json({ status: "success", data: product }); } catch (error) { next(error); } };

export const addVariant = async (req, res, next) => {
  try { const variant = await prisma.productVariant.create({ data: { ...req.body, productId: req.params.id } }); res.status(201).json({ status: "success", data: variant }); }
  catch (error) { next(error); }
};

export const searchProducts = async (req, res, next) => {
  try {
    const q = req.query.q?.trim() || "";
    const products = await prisma.product.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }, include: detailInclude, take: 50 });
    res.json({ status: "success", data: products });
  } catch (error) { next(error); }
};

export const getProductsByCategory = async (req, res, next) => {
  try { const products = await prisma.product.findMany({ where: { categoryId: req.params.categoryId }, include: detailInclude }); res.json({ status: "success", data: products }); }
  catch (error) { next(error); }
};

export const getAvailability = async (req, res, next) => {
  try { const product = await prisma.product.findUniqueOrThrow({ where: { id: req.params.id }, select: { id: true, sku: true, stock: true, availableStock: true, status: true } }); res.json({ status: "success", data: product }); }
  catch (error) { next(error); }
};

export const deleteProduct = async (req, res, next) => { try { await prisma.product.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); } };
