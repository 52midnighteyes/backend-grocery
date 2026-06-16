import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { uploadPaymentProof } from "../../middlewares/multer.middleware.js";
import {
  paymentProofParamsSchema,
  snapTokenParamsSchema,
} from "./payment.schemas.js";
import {
  uploadPaymentProofController,
  getSnapTokenController,
  handleMidtransWebhookController,
} from "./payment.controller.js";

const router = Router();

// --------------------------------------------------------
// MANUAL TRANSFER
// --------------------------------------------------------

// POST /api/payment/:orderId/proof - upload bukti pembayaran manual transfer
router.post(
  "/:orderId/proof",
  verifyAccessToken,
  validateSchema(paymentProofParamsSchema, "params"),
  uploadPaymentProof.single("paymentProof"),
  uploadPaymentProofController,
);

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

// POST /api/payment/:orderId/snap-token - request Snap Token untuk pembayaran Midtrans
router.post(
  "/:orderId/snap-token",
  verifyAccessToken,
  validateSchema(snapTokenParamsSchema, "params"),
  getSnapTokenController,
);

// POST /api/payment/webhook/midtrans - endpoint untuk notifikasi dari Midtrans
// Tidak pakai verifyAccessToken karena dipanggil langsung oleh server Midtrans
router.post(
  "/webhook/midtrans",
  handleMidtransWebhookController,
);

export default router;