import { Router } from "express";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { getAdminProductBySlugController } from "./product.controller.js";
import { productSlugParamSchema } from "./product.schemas.js";

const adminProductRoutes = Router();

adminProductRoutes.use(verifyAdminAccessToken);

adminProductRoutes.get(
  "/:slug",
  permissionGuard("product:read"),
  validateSchema(productSlugParamSchema, "params"),
  getAdminProductBySlugController,
);

export default adminProductRoutes;
