import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getStoreStockByProductSlugController,
  getStoreStocksController,
} from "./stock.controller.js";
import {
  getStoreStocksQuerySchema,
  storeProductStockParamSchema,
  storeStockParamSchema,
} from "./stock.schemas.js";

const stockRoutes = Router();

stockRoutes.get(
  "/store/:storeId",
  validateSchema(storeStockParamSchema, "params"),
  validateSchema(getStoreStocksQuerySchema, "query"),
  getStoreStocksController,
);

stockRoutes.get(
  "/store/:storeId/product/:slug",
  validateSchema(storeProductStockParamSchema, "params"),
  getStoreStockByProductSlugController,
);

export default stockRoutes;
