import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { shippingCostQuerySchema } from "./shipping.schemas.js";
import { getShippingCostController } from "./shipping.controller.js";

const router = Router();

// GET /api/shipping/cost?addressId=xxx
// Hitung ongkir dari toko terdekat ke alamat user yang dipilih
router.get(
  "/cost",
  verifyAccessToken,
  validateSchema(shippingCostQuerySchema, "query"),
  getShippingCostController,
);

export default router;