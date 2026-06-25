import { Router } from "express";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  clearStoreProductStockController,
  createStockMovementController,
  getStoreProductStockMovementsController,
  getStockReportController,
  getStoreStockMovementByIdController,
  getStoreStockByProductSlugController,
  getStoreStockMovementsController,
  getStoreStocksController,
} from "./adminStock.controller.js";
import {
  clearStockBodySchema,
  createStockMovementBodySchema,
  getStockReportQuerySchema,
  getStockMovementsQuerySchema,
  getStoreStocksQuerySchema,
  storeStockMovementDetailParamSchema,
  storeProductStockMovementParamSchema,
  storeProductStockParamSchema,
  storeStockParamSchema,
} from "./adminStock.schemas.js";

const adminStockRoutes = Router();

adminStockRoutes.use(verifyAdminAccessToken);

adminStockRoutes.get(
  "/reports",
  permissionGuard("stockReport:read"),
  validateSchema(getStockReportQuerySchema, "query"),
  getStockReportController,
);

adminStockRoutes.get(
  "/store/:storeId",
  permissionGuard("product:read"),
  validateSchema(storeStockParamSchema, "params"),
  validateSchema(getStoreStocksQuerySchema, "query"),
  getStoreStocksController,
);

adminStockRoutes.get(
  "/store/:storeId/movements",
  permissionGuard("product:read"),
  validateSchema(storeStockParamSchema, "params"),
  validateSchema(getStockMovementsQuerySchema, "query"),
  getStoreStockMovementsController,
);

adminStockRoutes.get(
  "/store/:storeId/movements/:historyId",
  permissionGuard("product:read"),
  validateSchema(storeStockMovementDetailParamSchema, "params"),
  getStoreStockMovementByIdController,
);

adminStockRoutes.get(
  "/store/:storeId/product/:productId/movements",
  permissionGuard("product:read"),
  validateSchema(storeProductStockMovementParamSchema, "params"),
  validateSchema(getStockMovementsQuerySchema, "query"),
  getStoreProductStockMovementsController,
);

adminStockRoutes.post(
  "/store/:storeId/product/:productId/movements",
  permissionGuard("stock:update"),
  validateSchema(storeProductStockMovementParamSchema, "params"),
  validateSchema(createStockMovementBodySchema, "body"),
  createStockMovementController,
);

adminStockRoutes.post(
  "/store/:storeId/product/:productId/clear",
  permissionGuard("stock:update"),
  validateSchema(storeProductStockMovementParamSchema, "params"),
  validateSchema(clearStockBodySchema, "body"),
  clearStoreProductStockController,
);

adminStockRoutes.get(
  "/store/:storeId/product/:slug",
  permissionGuard("product:read"),
  validateSchema(storeProductStockParamSchema, "params"),
  getStoreStockByProductSlugController,
);

export default adminStockRoutes;
