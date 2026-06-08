import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  updateCategoryController,
} from "./adminCategory.controller.js";
import {
  adminCategoryIdParamSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from "./adminCategory.schemas.js";

const adminCategoryRoutes = Router();

adminCategoryRoutes.use(verifyAdminAccessToken);

adminCategoryRoutes.post(
  "/",
  permissionGuard("category:create"),
  validateSchema(createCategoryBodySchema, "body"),
  createCategoryController,
);

adminCategoryRoutes.patch(
  "/:id",
  permissionGuard("category:update"),
  validateSchema(adminCategoryIdParamSchema, "params"),
  validateSchema(updateCategoryBodySchema, "body"),
  updateCategoryController,
);

adminCategoryRoutes.delete(
  "/:id",
  permissionGuard("category:delete"),
  validateSchema(adminCategoryIdParamSchema, "params"),
  deleteCategoryController,
);

export default adminCategoryRoutes;
