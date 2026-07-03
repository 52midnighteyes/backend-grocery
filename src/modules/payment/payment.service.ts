import { AppError } from "../../class/appError.js";
import { cloudinaryUpload, cloudinaryDelete } from "../../libs/cloudinary/cloudinary.lib.js";
import { createMidtransTransaction } from "../../libs/midtrans/midtrans.lib.js";
import {
  findTransactionForPayment,
  updatePaymentProof,
  updateSnapToken,
  updateMidtransStatus,
  findTransactionByOrderId,
} from "./payment.repository.js";
import { findUserById } from "../user/user.repository.js";
import {
  sendPaymentConfirmedEmail,
  sendOrderMidtransCancelledEmail,
} from "../order/order.mailer.js";

// --------------------------------------------------------
// MANUAL TRANSFER
// --------------------------------------------------------

export const uploadPaymentProofService = async (
  userId: string,
  orderId: string,
  file: Express.Multer.File,
) => {
  const order = await findTransactionForPayment(orderId);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (order.transactionStatus !== "waitingPayment") {
    throw new AppError(400, "Payment proof can only be uploaded when order is waiting for payment");
  }

  // Hapus bukti bayar lama di Cloudinary kalau sudah pernah upload sebelumnya
  if (order.paymentProofPublicId) {
    await cloudinaryDelete(order.paymentProofPublicId);
  }

  const uploaded = await cloudinaryUpload({
    file,
    id: orderId,
    type: "PAYMENT_PROOF",
  });

  await updatePaymentProof(orderId, uploaded.secure_url, uploaded.public_id);
};

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

export const getSnapTokenService = async (
  userId: string,
  orderId: string,
) => {
  const order = await findTransactionByOrderId(orderId);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (order.transactionStatus !== "waitingPayment") {
    throw new AppError(400, "Snap token can only be requested when order is waiting for payment");
  }

  // Kalau snap token sudah pernah dibuat untuk order ini, return yang tersimpan.
  // Ini mencegah duplikasi transaksi di Midtrans kalau endpoint dipanggil
  // lebih dari sekali (misal React Strict Mode double-invocation di development).
  if (order.snapToken) {
    return { snapToken: order.snapToken };
  }

  const snapToken = await createMidtransTransaction({
    orderId: order.id,
    totalPrice: order.totalPrice,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    items: [
      ...order.items.map((item) => ({
        id: item.productId,
        name: item.name,
        // Math.round untuk antisipasi harga ganjil yang tidak habis dibagi quantity
        price: Math.round(item.totalPrice / item.quantity),
        quantity: item.quantity,
      })),
      // Ongkir harus ikut masuk item_details supaya totalnya match dengan gross_amount
      {
        id: "delivery-fee",
        name: "Ongkos Kirim",
        price: order.deliveryFee,
        quantity: 1,
      },
    ],
  });

  await updateSnapToken(orderId, snapToken);

  return { snapToken };
};

export const handleMidtransWebhookService = async (
  notification: Record<string, string>,
) => {
  const { order_id, transaction_status, fraud_status } = notification;

  const order = await findTransactionForPayment(order_id);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Mapping status Midtrans ke status transaksi kita
  // Referensi: https://docs.midtrans.com/docs/status-cycle
  const previousStatus = order.transactionStatus as string;
  let newStatus = previousStatus;
  let paidAt: Date | null = null;

  if (transaction_status === "capture") {
    if (fraud_status === "accept") {
      newStatus = "process";
      paidAt = new Date();
    }
  } else if (transaction_status === "settlement") {
    newStatus = "process";
    paidAt = new Date();
  } else if (
    transaction_status === "cancel" ||
    transaction_status === "deny" ||
    transaction_status === "expire"
  ) {
    newStatus = "cancel";
  } else if (transaction_status === "pending") {
    newStatus = "waitingPayment";
  }

  await updateMidtransStatus(order_id, transaction_status, newStatus, paidAt);

  // Kirim email hanya jika status benar-benar berubah ke process atau cancel
  // supaya tidak ada duplikasi email kalau Midtrans retry webhook
  if (newStatus !== previousStatus && (newStatus === "process" || newStatus === "cancel")) {
    findUserById(order.customerId).then((user) => {
      if (!user) return;
      if (newStatus === "process") {
        sendPaymentConfirmedEmail({
          email: user.email,
          name: user.name,
          orderId: order.id,
        }).catch(console.error);
      } else {
        sendOrderMidtransCancelledEmail({
          email: user.email,
          name: user.name,
          orderId: order.id,
        }).catch(console.error);
      }
    }).catch(console.error);
  }
};