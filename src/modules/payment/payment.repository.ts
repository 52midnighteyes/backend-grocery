import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

// --------------------------------------------------------
// MANUAL TRANSFER
// --------------------------------------------------------

export const findTransactionForPayment = async (
  orderId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findFirst({
    where: { id: orderId, deletedAt: null },
  });
};

export const updatePaymentProof = async (
  orderId: string,
  paymentProof: string,
  paymentProofPublicId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.update({
    where: { id: orderId },
    data: {
      paymentProof,
      paymentProofPublicId,
      paymentType: "manual_transfer",
      transactionStatus: "waitingConfirmation",
    },
  });
};

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

export const updateSnapToken = async (
  orderId: string,
  snapToken: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.update({
    where: { id: orderId },
    data: {
      snapToken,
      paymentType: "midtrans",
    },
  });
};

export const updateMidtransStatus = async (
  orderId: string,
  midtransStatus: string,
  transactionStatus: string,
  paidAt: Date | null,
  db: TPrisma = prisma,
) => {
  return db.transaction.update({
    where: { id: orderId },
    data: {
      midtransStatus,
      transactionStatus: transactionStatus as never,
      ...(paidAt ? { paidAt } : {}),
    },
  });
};

export const findTransactionByOrderId = async (
  orderId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findFirst({
    where: { id: orderId, deletedAt: null },
    include: {
      items: {
        where: { deletedAt: null },
        include: { product: true },
      },
      customer: true,
    },
  });
};