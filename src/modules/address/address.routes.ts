import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { getAddressesController } from "./address.controller.js";

const router = Router();

// GET /api/addresses - ambil list address milik user yang sedang login
router.get("/", verifyAccessToken, getAddressesController);

export default router;