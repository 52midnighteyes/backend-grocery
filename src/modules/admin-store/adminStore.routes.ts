import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createStoreController,
  updateStoreController,
  deleteStoreController,
} from "./adminStore.controller.js";
import {
  adminStoreIdParamSchema,
  createStoreBodySchema,
  updateStoreBodySchema,
} from "./adminStore.schemas.js";

const adminStoreRoutes = Router();

adminStoreRoutes.use(verifyAdminAccessToken);

adminStoreRoutes.post(
  "/",
  permissionGuard("store:create"),
  validateSchema(createStoreBodySchema, "body"),
  createStoreController,
);

adminStoreRoutes.patch(
  "/:id",
  permissionGuard("store:update"),
  validateSchema(adminStoreIdParamSchema, "params"),
  validateSchema(updateStoreBodySchema, "body"),
  updateStoreController,
);

adminStoreRoutes.delete(
  "/:id",
  permissionGuard("store:delete"),
  validateSchema(adminStoreIdParamSchema, "params"),
  deleteStoreController,
);

export default adminStoreRoutes;
