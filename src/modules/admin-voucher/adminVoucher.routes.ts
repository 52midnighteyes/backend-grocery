import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createVoucherController,
  deleteVoucherController,
  getVoucherController,
  getVouchersController,
  updateVoucherController,
} from "./adminVoucher.controller.js";
import {
  createVoucherBodySchema,
  getVouchersQuerySchema,
  updateVoucherBodySchema,
  voucherIdParamSchema,
} from "./adminVoucher.schemas.js";

const adminVoucherRoutes = Router();

adminVoucherRoutes.use(verifyAdminAccessToken);

adminVoucherRoutes.get(
  "/",
  permissionGuard("voucher:read"),
  validateSchema(getVouchersQuerySchema, "query"),
  getVouchersController,
);

adminVoucherRoutes.get(
  "/:id",
  permissionGuard("voucher:read"),
  validateSchema(voucherIdParamSchema, "params"),
  getVoucherController,
);

adminVoucherRoutes.post(
  "/",
  permissionGuard("voucher:create"),
  validateSchema(createVoucherBodySchema, "body"),
  createVoucherController,
);

adminVoucherRoutes.patch(
  "/:id",
  permissionGuard("voucher:update"),
  validateSchema(voucherIdParamSchema, "params"),
  validateSchema(updateVoucherBodySchema, "body"),
  updateVoucherController,
);

adminVoucherRoutes.delete(
  "/:id",
  permissionGuard("voucher:delete"),
  validateSchema(voucherIdParamSchema, "params"),
  deleteVoucherController,
);

export default adminVoucherRoutes;
