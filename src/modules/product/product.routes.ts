import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getProductBySlugController,
  getProductsController,
} from "./product.controller.js";
import {
  getProductBySlugQuerySchema,
  getProductsQuerySchema,
  productSlugParamSchema,
} from "./product.schemas.js";

const productRoutes = Router();

productRoutes.get(
  "/",
  validateSchema(getProductsQuerySchema, "query"),
  getProductsController,
);

productRoutes.get(
  "/:slug",
  validateSchema(productSlugParamSchema, "params"),
  validateSchema(getProductBySlugQuerySchema, "query"),
  getProductBySlugController,
);

export default productRoutes;
