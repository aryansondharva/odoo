import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listInvoices, getInvoice, downloadInvoice } from "../controllers/invoice.controller.js";
const router = express.Router();
router.use(authenticate);
router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.get("/:id/download", downloadInvoice);
export default router;
