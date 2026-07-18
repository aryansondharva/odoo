import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listRentalPeriods = async (req, res, next) => {
  try {
    const periods = await prisma.rentalPeriod.findMany({ orderBy: { duration: "asc" } });
    res.json({ status: "success", data: periods });
  } catch (error) { next(error); }
};

export const createRentalPeriod = async (req, res, next) => {
  try { const period = await prisma.rentalPeriod.create({ data: req.body }); res.status(201).json({ status: "success", data: period }); }
  catch (error) { next(error); }
};

export const updateRentalPeriod = async (req, res, next) => {
  try { const period = await prisma.rentalPeriod.update({ where: { id: req.params.rentalPeriodId }, data: req.body }); res.json({ status: "success", data: period }); }
  catch (error) { next(error); }
};
