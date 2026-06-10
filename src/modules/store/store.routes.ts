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
  getStoreByIdController,
  getStoreOptionsController,
  getStoresController,
} from "./store.controller.js";
import {
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

storeRoutes.get(
  "/:storeId/products",
  validateSchema(storeProductsParamSchema, "params"),
  validateSchema(getStoreScopedProductsQuerySchema, "query"),
  getStoreScopedProductsController,
);

storeRoutes.get(
  "/:storeId/products/:slug",
  validateSchema(storeProductSlugParamSchema, "params"),
  getStoreScopedProductBySlugController,
);

storeRoutes.get(
  "/:id",
  validateSchema(storeIdParamSchema, "params"),
  getStoreByIdController
);

export default storeRoutes;
