import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  approveStockTransferRequestController,
  cancelStockTransferRequestController,
  createStockTransferRequestController,
  getStoreStockTransferRequestByIdController,
  getStoreStockTransferRequestsController,
  getStockTransferRequestByIdController,
  getStockTransferRequestsController,
  getStockTransferSourcesController,
  receiveStockTransferRequestController,
  rejectStockTransferRequestController,
} from "./stockTransfer.controller.js";
import {
  cancelStockTransferRequestBodySchema,
  createStockTransferRequestBodySchema,
  getStockTransferRequestsQuerySchema,
  getStockTransferSourcesQuerySchema,
  receiveStockTransferRequestBodySchema,
  respondStockTransferRequestBodySchema,
  stockTransferStoreParamSchema,
  stockTransferStoreRequestParamSchema,
  stockTransferRequestParamSchema,
} from "./stockTransfer.schemas.js";

const stockTransferRoutes = Router();

stockTransferRoutes.use(verifyAdminAccessToken);

stockTransferRoutes.get(
  "/sources",
  permissionGuard("product:read"),
  validateSchema(getStockTransferSourcesQuerySchema, "query"),
  getStockTransferSourcesController,
);

stockTransferRoutes.post(
  "/requests",
  permissionGuard("stock:update"),
  validateSchema(createStockTransferRequestBodySchema, "body"),
  createStockTransferRequestController,
);

stockTransferRoutes.get(
  "/requests",
  permissionGuard("product:read"),
  validateSchema(getStockTransferRequestsQuerySchema, "query"),
  getStockTransferRequestsController,
);

stockTransferRoutes.get(
  "/store/:storeId/requests",
  permissionGuard("product:read"),
  validateSchema(stockTransferStoreParamSchema, "params"),
  validateSchema(getStockTransferRequestsQuerySchema, "query"),
  getStoreStockTransferRequestsController,
);

stockTransferRoutes.get(
  "/store/:storeId/requests/:id",
  permissionGuard("product:read"),
  validateSchema(stockTransferStoreRequestParamSchema, "params"),
  getStoreStockTransferRequestByIdController,
);

stockTransferRoutes.get(
  "/requests/:id",
  permissionGuard("product:read"),
  validateSchema(stockTransferRequestParamSchema, "params"),
  getStockTransferRequestByIdController,
);

stockTransferRoutes.post(
  "/requests/:id/approve",
  permissionGuard("stock:update"),
  validateSchema(stockTransferRequestParamSchema, "params"),
  validateSchema(respondStockTransferRequestBodySchema, "body"),
  approveStockTransferRequestController,
);

stockTransferRoutes.post(
  "/requests/:id/reject",
  permissionGuard("stock:update"),
  validateSchema(stockTransferRequestParamSchema, "params"),
  validateSchema(respondStockTransferRequestBodySchema, "body"),
  rejectStockTransferRequestController,
);

stockTransferRoutes.post(
  "/requests/:id/receive",
  permissionGuard("stock:update"),
  validateSchema(stockTransferRequestParamSchema, "params"),
  validateSchema(receiveStockTransferRequestBodySchema, "body"),
  receiveStockTransferRequestController,
);

stockTransferRoutes.post(
  "/requests/:id/cancel",
  permissionGuard("stock:update"),
  validateSchema(stockTransferRequestParamSchema, "params"),
  validateSchema(cancelStockTransferRequestBodySchema, "body"),
  cancelStockTransferRequestController,
);

export default stockTransferRoutes;
