import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createProductController,
  deleteProductImageController,
  deleteProductController,
  getAdminProductsController,
  getAdminProductBySlugController,
  patchProductImagesController,
  updateProductController,
  updateProductImagePositionsController,
} from "./adminProduct.controller.js";
import {
  createProductBodySchema,
  getProductsQuerySchema,
  productSlugParamSchema,
  updateProductBodySchema,
  updateProductImagePositionsBodySchema,
} from "../product/product.schemas.js";
import {
  patchProductImagesBodySchema,
  productImageParamSchema,
} from "./adminProduct.schemas.js";

const adminProductRoutes = Router();

adminProductRoutes.use(verifyAdminAccessToken);

adminProductRoutes.post(
  "/",
  permissionGuard("product:create"),
  upload.array("images", 5),
  validateSchema(createProductBodySchema, "body"),
  createProductController,
);

adminProductRoutes.get(
  "/",
  permissionGuard("product:read"),
  validateSchema(getProductsQuerySchema, "query"),
  getAdminProductsController,
);

adminProductRoutes.patch(
  "/:slug/images/positions",
  permissionGuard("productImage:update"),
  validateSchema(productSlugParamSchema, "params"),
  validateSchema(updateProductImagePositionsBodySchema, "body"),
  updateProductImagePositionsController,
);

adminProductRoutes.patch(
  "/:slug/images",
  permissionGuard("productImage:update"),
  upload.array("images", 5),
  validateSchema(productSlugParamSchema, "params"),
  validateSchema(patchProductImagesBodySchema, "body"),
  patchProductImagesController,
);

adminProductRoutes.patch(
  "/:slug",
  permissionGuard("product:update"),
  validateSchema(productSlugParamSchema, "params"),
  validateSchema(updateProductBodySchema, "body"),
  updateProductController,
);

adminProductRoutes.get(
  "/:slug",
  permissionGuard("product:read"),
  validateSchema(productSlugParamSchema, "params"),
  getAdminProductBySlugController,
);

adminProductRoutes.delete(
  "/:slug/images/:imageId",
  permissionGuard("productImage:delete"),
  validateSchema(productImageParamSchema, "params"),
  deleteProductImageController,
);

adminProductRoutes.delete(
  "/:slug",
  permissionGuard("product:delete"),
  validateSchema(productSlugParamSchema, "params"),
  deleteProductController,
);

export default adminProductRoutes;
