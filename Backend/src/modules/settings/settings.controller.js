import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const defaults = { defaultDepositType: "PERCENTAGE", defaultDepositValue: 0, lateFeeType: "FIXED", lateFeeValue: 0, gracePeriod: 0, currency: "INR", taxPercentage: 0 };
const getOrCreate = async () => { const existing = await prisma.settings.findFirst(); return existing || prisma.settings.create({ data: defaults }); };
export const getSettings = async (req, res, next) => { try { res.json({ status: "success", data: await getOrCreate() }); } catch (error) { next(error); } };
export const updateSettings = async (req, res, next) => { try { const settings = await getOrCreate(); const updated = await prisma.settings.update({ where: { id: settings.id }, data: req.body }); res.json({ status: "success", data: updated }); } catch (error) { next(error); } };
