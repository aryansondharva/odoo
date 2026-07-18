import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const safeUser = { id: true, name: true, email: true, phone: true, avatar: true, role: true, isVerified: true, createdAt: true, updatedAt: true };
export const getProfile = async (req, res, next) => { try { const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id }, select: safeUser }); res.json({ status: "success", data: user }); } catch (error) { next(error); } };
export const updateProfile = async (req, res, next) => { try { const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body, select: safeUser }); res.json({ status: "success", data: user }); } catch (error) { next(error); } };
export const updateAvatar = async (req, res, next) => { try { const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatar: req.body.avatar }, select: safeUser }); res.json({ status: "success", data: user }); } catch (error) { next(error); } };
