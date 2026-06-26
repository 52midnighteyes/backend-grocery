import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getCategorySalesReportController,
  getCategoryTrendReportController,
  getProductRankingSalesReportController,
  getProductSalesReportController,
  getProductTrendReportController,
  getSalesReportController,
  getTransactionSalesReportController,
} from "./adminSalesReport.controller.js";
import {
  salesReportCategoryIdParamSchema,
  salesReportProductIdParamSchema,
  salesReportProductRankingQuerySchema,
  salesReportProductTrendQuerySchema,
  salesReportQuerySchema,
  salesReportTransactionQuerySchema,
} from "./adminSalesReport.schemas.js";

const adminSalesReportRoutes = Router();

adminSalesReportRoutes.use(verifyAdminAccessToken);
adminSalesReportRoutes.use(permissionGuard("salesReport:read"));

adminSalesReportRoutes.get(
  "/",
  validateSchema(salesReportQuerySchema, "query"),
  getSalesReportController,
);

adminSalesReportRoutes.get(
  "/categories",
  validateSchema(salesReportQuerySchema, "query"),
  getCategorySalesReportController,
);

adminSalesReportRoutes.get(
  "/categories/:categoryId",
  validateSchema(salesReportCategoryIdParamSchema, "params"),
  validateSchema(salesReportQuerySchema, "query"),
  getCategoryTrendReportController,
);

adminSalesReportRoutes.get(
  "/transactions",
  validateSchema(salesReportTransactionQuerySchema, "query"),
  getTransactionSalesReportController,
);

adminSalesReportRoutes.get(
  "/products",
  validateSchema(salesReportProductTrendQuerySchema, "query"),
  getProductSalesReportController,
);

adminSalesReportRoutes.get(
  "/products/ranking",
  validateSchema(salesReportProductRankingQuerySchema, "query"),
  getProductRankingSalesReportController,
);

adminSalesReportRoutes.get(
  "/products/:productId/trend",
  validateSchema(salesReportProductIdParamSchema, "params"),
  validateSchema(salesReportQuerySchema, "query"),
  getProductTrendReportController,
);

adminSalesReportRoutes.get(
  "/products/:productId",
  validateSchema(salesReportProductIdParamSchema, "params"),
  validateSchema(salesReportQuerySchema, "query"),
  getProductTrendReportController,
);

export default adminSalesReportRoutes;
