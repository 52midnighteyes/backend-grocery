import type { Request, Response, NextFunction } from "express";
import type {
  TPaymentProofParamsSchema,
  TSnapTokenParamsSchema,
} from "./payment.schemas.js";
import {
  uploadPaymentProofService,
  getSnapTokenService,
  handleMidtransWebhookService,
} from "./payment.service.js";

// --------------------------------------------------------
// MANUAL TRANSFER
// --------------------------------------------------------

export const uploadPaymentProofController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TPaymentProofParamsSchema;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "Payment proof file is required" });
      return;
    }

    await uploadPaymentProofService(userId, orderId, file);

    res.status(200).json({ message: "Payment proof uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

export const getSnapTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TSnapTokenParamsSchema;

    const result = await getSnapTokenService(userId, orderId);

    res.status(200).json({ message: "Snap token generated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const handleMidtransWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleMidtransWebhookService(req.body);

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    next(error);
  }
};