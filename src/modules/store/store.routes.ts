import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getStoreScopedProductBySlugController,
  getStoreScopedProductsController,
} from "../product/product.controller.js";
import {
  getStoreScopedProductsQuerySchema,
  storeProductSlugParamSchema,
  storeProductsParamSchema,
} from "../product/product.schemas.js";
import {
  getMainStoreController,
  getNearestStoreController,
  getStoreByIdController,
  getStoreOptionsController,
  getStoresController,
} from "./store.controller.js";
import {
  getNearestStoreQuerySchema,
  getStoresQuerySchema,
  storeIdParamSchema,
} from "./store.schemas.js";

const storeRoutes = Router();

storeRoutes.get(
  "/",
  validateSchema(getStoresQuerySchema, "query"),
  getStoresController
);

storeRoutes.get("/options", getStoreOptionsController);

// Static segments must be declared before the dynamic "/:id" route, otherwise
// Express would treat "nearest-store" / "mainStore" as an :id value.
storeRoutes.get(
  "/nearest-store",
  validateSchema(getNearestStoreQuerySchema, "query"),
  getNearestStoreController
);

storeRoutes.get("/mainStore", getMainStoreController);

storeRoutes.get(
  "/:storeId/products",
  validateSchema(storeProductsParamSchema, "params"),
  validateSchema(getStoreScopedProductsQuerySchema, "query"),
  getStoreScopedProductsController
);

storeRoutes.get(
  "/:storeId/products/:slug",
  validateSchema(storeProductSlugParamSchema, "params"),
  getStoreScopedProductBySlugController
);

storeRoutes.get(
  "/:id",
  validateSchema(storeIdParamSchema, "params"),
  getStoreByIdController
);

export default storeRoutes;
