import { Router } from "express";
import { permissionGuard } from "../../middlewares/roleGuard/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createAdminAccountController,
  deleteAdminAccountController,
  getAdminAccountController,
  getAdminAccountsController,
  updateAdminAccountController,
} from "./adminManagement.controller.js";
import {
  adminAccountIdParamSchema,
  createAdminAccountBodySchema,
  getAdminAccountsQuerySchema,
  updateAdminAccountBodySchema,
} from "./adminManagement.schemas.js";

const adminManagementRoutes = Router();

adminManagementRoutes.use(verifyAccessToken);

adminManagementRoutes.post(
  "/",
  permissionGuard("adminAccount:create"),
  validateSchema(createAdminAccountBodySchema, "body"),
  createAdminAccountController
);

adminManagementRoutes.get(
  "/",
  permissionGuard("adminAccount:read"),
  validateSchema(getAdminAccountsQuerySchema, "query"),
  getAdminAccountsController
);

adminManagementRoutes.get(
  "/:id",
  permissionGuard("adminAccount:read"),
  validateSchema(adminAccountIdParamSchema, "params"),
  getAdminAccountController
);

adminManagementRoutes.patch(
  "/:id",
  permissionGuard("adminAccount:update"),
  validateSchema(adminAccountIdParamSchema, "params"),
  validateSchema(updateAdminAccountBodySchema, "body"),
  updateAdminAccountController
);

adminManagementRoutes.delete(
  "/:id",
  permissionGuard("adminAccount:delete"),
  validateSchema(adminAccountIdParamSchema, "params"),
  deleteAdminAccountController
);

export default adminManagementRoutes;
