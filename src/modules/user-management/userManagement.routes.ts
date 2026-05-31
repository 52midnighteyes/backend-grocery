import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getManagedUserByIdController,
  getManagedUsersController,
} from "./userManagement.controller.js";
import {
  getManagedUsersQuerySchema,
  managedUserIdParamSchema,
} from "./userManagement.schemas.js";

const userManagementRoutes = Router();

userManagementRoutes.use(verifyAccessToken);

userManagementRoutes.get(
  "/",
  permissionGuard("user:read"),
  validateSchema(getManagedUsersQuerySchema, "query"),
  getManagedUsersController,
);

userManagementRoutes.get(
  "/:id",
  permissionGuard("user:read"),
  validateSchema(managedUserIdParamSchema, "params"),
  getManagedUserByIdController,
);

export default userManagementRoutes;
