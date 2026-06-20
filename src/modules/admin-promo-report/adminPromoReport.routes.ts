import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getDiscountReportsController,
  getVoucherReportsController,
} from "./adminPromoReport.controller.js";
import {
  getDiscountReportsQuerySchema,
  getVoucherReportsQuerySchema,
} from "./adminPromoReport.schemas.js";

const adminPromoReportRoutes = Router();

adminPromoReportRoutes.use(verifyAdminAccessToken);

adminPromoReportRoutes.get(
  "/discounts",
  permissionGuard("promoReport:read"),
  validateSchema(getDiscountReportsQuerySchema, "query"),
  getDiscountReportsController,
);

adminPromoReportRoutes.get(
  "/vouchers",
  permissionGuard("promoReport:read"),
  validateSchema(getVoucherReportsQuerySchema, "query"),
  getVoucherReportsController,
);

export default adminPromoReportRoutes;
