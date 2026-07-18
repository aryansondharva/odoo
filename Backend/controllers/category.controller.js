import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slug.utils.js";

const prisma = new PrismaClient();

export const listCategories = async (req, res, next) => {
  try {
    const where = req.query.includeInactive === "true" ? {} : { isActive: true };
    const categories = await prisma.category.findMany({ where, orderBy: { name: "asc" } });
    res.json({ status: "success", data: categories });
  } catch (error) { next(error); }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, ...data } = req.body;
    const category = await prisma.category.create({ data: { name, slug: slug || slugify(name), ...data } });
    res.status(201).json({ status: "success", data: category });
  } catch (error) { next(error); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, ...data } = req.body;
    const category = await prisma.category.update({ where: { id: req.params.categoryId }, data: { ...data, ...(name && { name }), ...(slug && { slug }) } });
    res.json({ status: "success", data: category });
  } catch (error) { next(error); }
};
