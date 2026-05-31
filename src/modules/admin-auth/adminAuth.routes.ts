import { Router } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
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

adminAuthRoutes.post("/logout", verifyAccessToken, logoutAdminController);
adminAuthRoutes.post("/refresh", refreshAdminTokenController);
adminAuthRoutes.get("/me", verifyAccessToken, getAdminProfileController);

export default adminAuthRoutes;
