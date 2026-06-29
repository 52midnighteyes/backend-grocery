import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { verifyAccessToken, verifyRefreshToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { uploadAvatar } from "../../middlewares/multer.middleware.js";
import {
    registerBodySchema,
    verifyEmailBodySchema,
    verifyEmailQuerySchema,
    loginBodySchema,
    forgotPasswordBodySchema,
    resetPasswordBodySchema,
    resetPasswordQuerySchema,
    updateProfileBodySchema,
    changeEmailBodySchema,
    changePasswordBodySchema,
    googleAuthBodySchema,
} from "./auth.validation.js";
import {
    register,
    verifyEmail,
    verifyEmailChange,
    resendVerification,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changeEmail,
    changePassword,
    refreshToken,
    googleAuth,
    getUserVouchers,
} from "./auth.controller.js";

const router = Router();

router.post("/register", validateSchema(registerBodySchema, "body"), register);
router.post("/verification", validateSchema(verifyEmailQuerySchema, "query"), validateSchema(verifyEmailBodySchema, "body"), verifyEmail);
router.patch("/verification", validateSchema(verifyEmailQuerySchema, "query"), verifyEmailChange);
router.post("/resend-verification", validateSchema(forgotPasswordBodySchema, "body"), resendVerification);
router.post("/login", validateSchema(loginBodySchema, "body"), login);
router.post("/logout", verifyAccessToken, logout);
router.post("/forgot-password", validateSchema(forgotPasswordBodySchema, "body"), forgotPassword);
router.post("/reset-password", validateSchema(resetPasswordQuerySchema, "query"), validateSchema(resetPasswordBodySchema, "body"), resetPassword);
router.get("/me", verifyAccessToken, getProfile);
router.get("/vouchers", verifyAccessToken, getUserVouchers);
router.patch("/profile", verifyAccessToken, uploadAvatar.single("avatar"), validateSchema(updateProfileBodySchema, "body"), updateProfile);
router.patch("/email", verifyAccessToken, validateSchema(changeEmailBodySchema, "body"), changeEmail);
router.patch("/password", verifyAccessToken, validateSchema(changePasswordBodySchema, "body"), changePassword);
router.post("/refresh", verifyRefreshToken, refreshToken);
router.post("/google", validateSchema(googleAuthBodySchema, "body"), googleAuth);

export default router;
