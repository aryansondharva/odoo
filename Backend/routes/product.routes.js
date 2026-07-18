import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productSchema, variantSchema } from "../validations/rental.validations.js";
import { listProducts, getProduct, createProduct, updateProduct, addVariant } from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", listProducts);
router.get("/:productId", getProduct);
router.post("/", authenticate, authorize("ADMIN"), validate(productSchema), createProduct);
router.patch("/:productId", authenticate, authorize("ADMIN"), validate(productSchema.partial()), updateProduct);
router.post("/:productId/variants", authenticate, authorize("ADMIN"), validate(variantSchema), addVariant);
export default router;
