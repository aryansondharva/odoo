import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const listVariants = async (req, res, next) => { try { const variants = await prisma.productVariant.findMany({ include: { product: { select: { id: true, name: true, sku: true } } }, orderBy: { productId: "asc" } }); res.json({ status: "success", data: variants }); } catch (error) { next(error); } };
export const createVariant = async (req, res, next) => { try { const variant = await prisma.productVariant.create({ data: req.body }); res.status(201).json({ status: "success", data: variant }); } catch (error) { next(error); } };
export const updateVariant = async (req, res, next) => { try { const variant = await prisma.productVariant.update({ where: { id: req.params.id }, data: req.body }); res.json({ status: "success", data: variant }); } catch (error) { next(error); } };
export const deleteVariant = async (req, res, next) => { try { await prisma.productVariant.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); } };
