import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderParamsSchema,
} from "./order.schemas.js";
import {
  createOrderController,
  getOrdersController,
  getOrderDetailController,
  cancelOrderController,
  confirmOrderController,
} from "./order.controller.js";

const router = Router();

// GET /api/orders - ambil list order milik user
router.get(
  "/",
  verifyAccessToken,
  validateSchema(getOrdersQuerySchema, "query"),
  getOrdersController,
);

// GET /api/orders/:orderId - ambil detail order
router.get(
  "/:orderId",
  verifyAccessToken,
  validateSchema(orderParamsSchema, "params"),
  getOrderDetailController,
);

// POST /api/orders - buat order baru
router.post(
  "/",
  verifyAccessToken,
  validateSchema(createOrderSchema, "body"),
  createOrderController,
);

// PATCH /api/orders/:orderId/cancel - user cancel order
router.patch(
  "/:orderId/cancel",
  verifyAccessToken,
  validateSchema(orderParamsSchema, "params"),
  cancelOrderController,
);

// PATCH /api/orders/:orderId/confirm - user konfirmasi pesanan diterima
router.patch(
  "/:orderId/confirm",
  verifyAccessToken,
  validateSchema(orderParamsSchema, "params"),
  confirmOrderController,
);

export default router;