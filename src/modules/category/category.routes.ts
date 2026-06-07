import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getCategoriesController,
  getCategoryByIdController,
} from "./category.controller.js";
import {
  categoryIdParamSchema,
  getCategoriesQuerySchema,
} from "./category.schemas.js";

const categoryRoutes = Router();

categoryRoutes.get(
  "/",
  validateSchema(getCategoriesQuerySchema, "query"),
  getCategoriesController,
);

categoryRoutes.get(
  "/:id",
  validateSchema(categoryIdParamSchema, "params"),
  getCategoryByIdController,
);

export default categoryRoutes;
