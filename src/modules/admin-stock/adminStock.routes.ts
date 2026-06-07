import { Router } from "express";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getStoreStockByProductSlugController,
  getStoreStocksController,
} from "./adminStock.controller.js";
import {
  getStoreStocksQuerySchema,
  storeProductStockParamSchema,
  storeStockParamSchema,
} from "./adminStock.schemas.js";

const adminStockRoutes = Router();

adminStockRoutes.use(verifyAdminAccessToken);

adminStockRoutes.get(
  "/store/:storeId",
  permissionGuard("product:read"),
  validateSchema(storeStockParamSchema, "params"),
  validateSchema(getStoreStocksQuerySchema, "query"),
  getStoreStocksController,
);

adminStockRoutes.get(
  "/store/:storeId/product/:slug",
  permissionGuard("product:read"),
  validateSchema(storeProductStockParamSchema, "params"),
  getStoreStockByProductSlugController,
);

export default adminStockRoutes;
