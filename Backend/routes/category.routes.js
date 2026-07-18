import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { categorySchema } from "../validations/rental.validations.js";
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();
router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", authenticate, authorize("ADMIN"), validate(categorySchema), createCategory);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(categorySchema.partial()), updateCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory);
export default router;
