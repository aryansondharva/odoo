import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const belongsToUser = (id, userId) => prisma.address.findFirstOrThrow({ where: { id, userId } });

export const listAddresses = async (req, res, next) => { try { const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }); res.json({ status: "success", data: addresses }); } catch (error) { next(error); } };
export const createAddress = async (req, res, next) => {
  try {
    const address = await prisma.$transaction(async (tx) => {
      if (req.body.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
      return tx.address.create({ data: { ...req.body, userId: req.user.id } });
    });
    res.status(201).json({ status: "success", data: address });
  } catch (error) { next(error); }
};
export const updateAddress = async (req, res, next) => {
  try {
    await belongsToUser(req.params.id, req.user.id);
    const address = await prisma.$transaction(async (tx) => {
      if (req.body.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
      return tx.address.update({ where: { id: req.params.id }, data: req.body });
    });
    res.json({ status: "success", data: address });
  } catch (error) { next(error); }
};
export const deleteAddress = async (req, res, next) => { try { await belongsToUser(req.params.id, req.user.id); await prisma.address.delete({ where: { id: req.params.id } }); res.status(204).send(); } catch (error) { next(error); } };
