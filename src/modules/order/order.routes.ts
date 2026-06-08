import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderParamsSchema,
  updateOrderStatusSchema,
} from "./order.schemas.js";
import {
  createOrderController,
  getOrdersController,
  getOrderDetailController,
  updateOrderStatusController,
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

// PATCH /api/orders/:orderId - update status order oleh user (cancel / confirmed)
router.patch(
  "/:orderId",
  verifyAccessToken,
  validateSchema(orderParamsSchema, "params"),
  validateSchema(updateOrderStatusSchema, "body"),
  updateOrderStatusController,
);

export default router;