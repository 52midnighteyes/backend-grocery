import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createStoreController,
  deleteStoreController,
  getStoreByIdController,
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
  getStoresController,
);

storeRoutes.get(
  "/:id",
  validateSchema(storeIdParamSchema, "params"),
  getStoreByIdController,
);

storeRoutes.post(
  "/",
  verifyAccessToken,
  permissionGuard("store:create"),
  validateSchema(createStoreBodySchema, "body"),
  createStoreController,
);

storeRoutes.patch(
  "/:id",
  verifyAccessToken,
  permissionGuard("store:update"),
  validateSchema(storeIdParamSchema, "params"),
  validateSchema(updateStoreBodySchema, "body"),
  updateStoreController,
);

storeRoutes.delete(
  "/:id",
  verifyAccessToken,
  permissionGuard("store:delete"),
  validateSchema(storeIdParamSchema, "params"),
  deleteStoreController,
);

export default storeRoutes;
