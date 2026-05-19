import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  registerUserSchema,
  tokenParamsSchema,
  updatePasswordSchema,
  verifyParamsSchema,
} from "./auth.schemas.js";
import {
  checkResetTokenController,
  forgotPasswordController,
  forgotPasswordRequestController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationEmailController,
  updatePasswordController,
  verifyUserController,
} from "./auth.controller.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";

const router = Router();
router.get(
  "/token/:token",
  validateSchema(tokenParamsSchema, "params"),
  checkResetTokenController
);

router.post(
  "/register",
  validateSchema(registerUserSchema, "body"),
  registerController
);

router.post("/login", validateSchema(loginSchema, "body"), loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);

router.post(
  "/verify/:token",
  validateSchema(verifyParamsSchema, "params"),
  verifyUserController
);

router.post(
  "/update-password",
  verifyAccessToken,
  validateSchema(updatePasswordSchema, "body"),
  updatePasswordController
);

router.post(
  "/request-forgot-password",
  validateSchema(emailSchema, "body"),
  forgotPasswordRequestController
);

router.post(
  "/forgot-password/:token",
  validateSchema(forgotPasswordSchema, "body"),
  validateSchema(tokenParamsSchema, "params"),
  forgotPasswordController
);

router.post(
  "/resend-verification-email",
  verifyAccessToken,
  resendVerificationEmailController
);

export default router;
