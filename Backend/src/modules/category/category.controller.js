import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ status: "success", data: categories });
  } catch (error) { next(error); }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ status: "success", data: category });
  } catch (error) { next(error); }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.findUniqueOrThrow({ where: { id: req.params.id }, include: { _count: { select: { products: true } } } });
    res.json({ status: "success", data: category });
  } catch (error) { next(error); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    res.json({ status: "success", data: category });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req, res, next) => {
  try { await prisma.category.delete({ where: { id: req.params.id } }); res.status(204).send(); }
  catch (error) { next(error); }
};
