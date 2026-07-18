import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { categorySchema } from "../validations/rental.validations.js";
import { listCategories, createCategory, updateCategory } from "../controllers/category.controller.js";

const router = express.Router();
router.get("/", listCategories);
router.post("/", authenticate, authorize("ADMIN"), validate(categorySchema), createCategory);
router.patch("/:categoryId", authenticate, authorize("ADMIN"), validate(categorySchema.partial()), updateCategory);
export default router;
