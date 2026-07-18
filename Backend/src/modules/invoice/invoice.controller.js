import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const scope = (user) => user.role === "ADMIN" ? {} : { order: { userId: user.id } };
const invoiceInclude = { order: { include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } } } };
export const listInvoices = async (req, res, next) => { try { const invoices = await prisma.invoice.findMany({ where: scope(req.user), include: invoiceInclude, orderBy: { generatedAt: "desc" } }); res.json({ status: "success", data: invoices }); } catch (error) { next(error); } };
export const getInvoice = async (req, res, next) => { try { const invoice = await prisma.invoice.findFirstOrThrow({ where: { id: req.params.id, ...scope(req.user) }, include: invoiceInclude }); res.json({ status: "success", data: invoice }); } catch (error) { next(error); } };
export const downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirstOrThrow({ where: { id: req.params.id, ...scope(req.user) }, include: invoiceInclude });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    const pdf = new PDFDocument({ margin: 48 });
    pdf.pipe(res);
    pdf.fontSize(20).text("Rental Management System", { align: "right" });
    pdf.moveDown().fontSize(14).text(`Invoice: ${invoice.invoiceNumber}`);
    pdf.fontSize(10).text(`Generated: ${invoice.generatedAt.toLocaleDateString()}`);
    pdf.moveDown().text(`Bill to: ${invoice.order.user.name}`);
    pdf.text(invoice.order.user.email);
    pdf.moveDown();
    invoice.order.items.forEach((item) => pdf.text(`${item.product.name} × ${item.quantity}  —  ${item.price}`));
    pdf.moveDown().text(`Subtotal: ${invoice.subtotal}`);
    pdf.text(`Security deposit: ${invoice.deposit}`);
    pdf.text(`Late fee: ${invoice.lateFee}`);
    pdf.text(`Tax: ${invoice.tax}`);
    pdf.text(`Discount: ${invoice.discount}`);
    pdf.fontSize(13).text(`Total: ${invoice.total}`);
    pdf.end();
  } catch (error) { next(error); }
};
