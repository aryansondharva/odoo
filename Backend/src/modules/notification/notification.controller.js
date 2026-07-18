import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const owned = (id, user) => prisma.notification.findFirstOrThrow({ where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) } });
export const listNotifications = async (req, res, next) => { try { const notifications = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } }); res.json({ status: "success", data: notifications }); } catch (error) { next(error); } };
export const createNotification = async (req, res, next) => { try { const notification = await prisma.notification.create({ data: req.body }); res.status(201).json({ status: "success", data: notification }); } catch (error) { next(error); } };
export const readNotification = async (req, res, next) => { try { const notification = await owned(req.params.id, req.user); const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } }); res.json({ status: "success", data: updated }); } catch (error) { next(error); } };
export const deleteNotification = async (req, res, next) => { try { const notification = await owned(req.params.id, req.user); await prisma.notification.delete({ where: { id: notification.id } }); res.status(204).send(); } catch (error) { next(error); } };
