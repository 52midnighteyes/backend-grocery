import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createDiscountController,
  deleteDiscountController,
  getDiscountController,
  getDiscountsController,
  updateDiscountController,
} from "./adminDiscount.controller.js";
import {
  createDiscountBodySchema,
  discountIdParamSchema,
  getDiscountsQuerySchema,
  updateDiscountBodySchema,
} from "./adminDiscount.schemas.js";

const adminDiscountRoutes = Router();

adminDiscountRoutes.use(verifyAdminAccessToken);

adminDiscountRoutes.get(
  "/",
  permissionGuard("discount:read"),
  validateSchema(getDiscountsQuerySchema, "query"),
  getDiscountsController,
);

adminDiscountRoutes.get(
  "/:id",
  permissionGuard("discount:read"),
  validateSchema(discountIdParamSchema, "params"),
  getDiscountController,
);

adminDiscountRoutes.post(
  "/",
  permissionGuard("discount:create"),
  validateSchema(createDiscountBodySchema, "body"),
  createDiscountController,
);

adminDiscountRoutes.patch(
  "/:id",
  permissionGuard("discount:update"),
  validateSchema(discountIdParamSchema, "params"),
  validateSchema(updateDiscountBodySchema, "body"),
  updateDiscountController,
);

adminDiscountRoutes.delete(
  "/:id",
  permissionGuard("discount:delete"),
  validateSchema(discountIdParamSchema, "params"),
  deleteDiscountController,
);

export default adminDiscountRoutes;
