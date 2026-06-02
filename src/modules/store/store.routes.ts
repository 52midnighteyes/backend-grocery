import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createStoreController,
  deleteStoreController,
  getStoreByIdController,
  getStoreOptionsController,
  getStoresController,
  updateStoreController,
} from "./store.controller.js";
import {
  createStoreBodySchema,
  getStoresQuerySchema,
  storeIdParamSchema,
  updateStoreBodySchema,
} from "./store.schemas.js";

const storeRoutes = Router();

storeRoutes.get(
  "/",
  validateSchema(getStoresQuerySchema, "query"),
  getStoresController
);

storeRoutes.get("/options", getStoreOptionsController);

storeRoutes.get(
  "/:id",
  validateSchema(storeIdParamSchema, "params"),
  getStoreByIdController
);

storeRoutes.post(
  "/",
  verifyAdminAccessToken,
  permissionGuard("store:create"),
  validateSchema(createStoreBodySchema, "body"),
  createStoreController
);

storeRoutes.patch(
  "/:id",
  verifyAdminAccessToken,
  permissionGuard("store:update"),
  validateSchema(storeIdParamSchema, "params"),
  validateSchema(updateStoreBodySchema, "body"),
  updateStoreController
);

storeRoutes.delete(
  "/:id",
  verifyAdminAccessToken,
  permissionGuard("store:delete"),
  validateSchema(storeIdParamSchema, "params"),
  deleteStoreController
);

export default storeRoutes;
