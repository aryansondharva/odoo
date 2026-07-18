import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productSchema, variantSchema } from "../validations/rental.validations.js";
import { listProducts, getProduct, createProduct, updateProduct, addVariant, searchProducts, getProductsByCategory, getAvailability, deleteProduct } from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/availability/:id", getAvailability);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:productId", getProduct);
router.post("/", authenticate, authorize("ADMIN"), validate(productSchema), createProduct);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(productSchema.partial()), updateProduct);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProduct);
router.post("/:id/variants", authenticate, authorize("ADMIN"), validate(variantSchema), addVariant);
export default router;
