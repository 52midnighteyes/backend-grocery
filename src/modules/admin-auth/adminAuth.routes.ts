import { Router } from "express";
import {
  verifyAdminAccessToken,
  verifyAdminRefreshToken,
} from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getAdminProfileController,
  loginAdminController,
  logoutAdminController,
  refreshAdminTokenController,
} from "./adminAuth.controller.js";
import { adminLoginBodySchema } from "./adminAuth.schemas.js";

const adminAuthRoutes = Router();

adminAuthRoutes.post(
  "/login",
  validateSchema(adminLoginBodySchema, "body"),
  loginAdminController,
);

adminAuthRoutes.post("/logout", verifyAdminAccessToken, logoutAdminController);
adminAuthRoutes.post(
  "/refresh",
  verifyAdminRefreshToken,
  refreshAdminTokenController,
);
adminAuthRoutes.get("/me", verifyAdminAccessToken, getAdminProfileController);

export default adminAuthRoutes;
