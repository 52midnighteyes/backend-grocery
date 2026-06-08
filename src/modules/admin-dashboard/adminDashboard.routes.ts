import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getAdminDashboardSummaryController,
  getStoreDashboardSummaryController,
} from "./adminDashboard.controller.js";
import { dashboardStoreIdParamSchema } from "./adminDashboard.schemas.js";

const adminDashboardRoutes = Router();

adminDashboardRoutes.use(verifyAdminAccessToken);

adminDashboardRoutes.get(
  "/summary",
  permissionGuard("dashboard:read"),
  getAdminDashboardSummaryController
);

adminDashboardRoutes.get(
  "/stores/:id/summary",
  permissionGuard(["dashboard:read", "store:read"], { mode: "some" }),
  validateSchema(dashboardStoreIdParamSchema, "params"),
  getStoreDashboardSummaryController
);

export default adminDashboardRoutes;
