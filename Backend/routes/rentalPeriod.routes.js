import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { rentalPeriodSchema } from "../validations/rental.validations.js";
import { listRentalPeriods, createRentalPeriod, updateRentalPeriod } from "../controllers/rentalPeriod.controller.js";

const router = express.Router();
router.get("/", listRentalPeriods);
router.post("/", authenticate, authorize("ADMIN"), validate(rentalPeriodSchema), createRentalPeriod);
router.patch("/:rentalPeriodId", authenticate, authorize("ADMIN"), validate(rentalPeriodSchema.partial()), updateRentalPeriod);
export default router;
