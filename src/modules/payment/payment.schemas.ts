import * as z from "zod";

// --------------------------------------------------------
// MANUAL TRANSFER
// --------------------------------------------------------

export const paymentProofParamsSchema = z.object({
  orderId: z.string().uuid("Order ID is not valid"),
});

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

export const snapTokenParamsSchema = z.object({
  orderId: z.string().uuid("Order ID is not valid"),
});

export type TPaymentProofParamsSchema = z.infer<typeof paymentProofParamsSchema>;
export type TSnapTokenParamsSchema = z.infer<typeof snapTokenParamsSchema>;