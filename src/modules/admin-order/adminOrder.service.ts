import { getAdminOrderScope } from "./adminOrder.helper.js";
import { findAdminTransactionById, findAdminTransactions } from "./adminOrder.repository.js";
import { TAdminGetOrderQuerySchema } from "./adminOrder.schemas.js";
import { AppError } from "../../class/appError.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { updateTransactionStatus } from "../order/order.repository.js";
import {
  createStockHistory,
  findStoreStockByProductId,
  updateStoreStockQuantity,
} from "../stock/stock.repository.js";
import {
  sendPaymentConfirmedEmail,
  sendPaymentRejectedEmail,
  sendOrderShippedEmail,
  sendOrderAdminCancelledEmail,
} from "../order/order.mailer.js";

export const getAdminOrderService = async (
  requesterId: string,
  query: TAdminGetOrderQuerySchema,
) => {
  const scope = await getAdminOrderScope(requesterId);
  const { data, total } = await findAdminTransactions(query, scope);
  const { page, limit } = query;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminOrderDetailService = async (
  requesterId: string,
  orderId: string,
) => {
  const scope = await getAdminOrderScope(requesterId);
  const order = await findAdminTransactionById(orderId);

  if (!order) throw new AppError(404, "Order not found");

  if (scope.storeId && order.storeId !== scope.storeId) {
    throw new AppError(403, "Forbidden");
  }

  return order;
};

export const confirmPaymentService = async (
  requesterId: string,
  orderId: string,
  action: "approve" | "reject",
) => {
  const scope = await getAdminOrderScope(requesterId);

  const order = await prisma.$transaction(async (tx) => {
    const order = await findAdminTransactionById(orderId, tx);

    if (!order) throw new AppError(404, "Order not found");

    if (scope.storeId && order.storeId !== scope.storeId) {
      throw new AppError(403, "Forbidden");
    }

    if (order.transactionStatus !== "waitingConfirmation") {
      throw new AppError(400, "Order is not awaiting payment confirmation");
    }

    const nextStatus = action === "approve" ? "process" : "waitingPayment";
    await updateTransactionStatus(orderId, nextStatus, tx);

    return order;
  });

  if (action === "approve") {
    sendPaymentConfirmedEmail({
      email: order.customer.email,
      name: order.customer.name,
      orderId: order.id,
    }).catch(console.error);
  } else {
    sendPaymentRejectedEmail({
      email: order.customer.email,
      name: order.customer.name,
      orderId: order.id,
    }).catch(console.error);
  }
};

export const shipOrderService = async (
  requesterId: string,
  orderId: string,
) => {
  const scope = await getAdminOrderScope(requesterId);

  const order = await prisma.$transaction(async (tx) => {
    const order = await findAdminTransactionById(orderId, tx);

    if (!order) throw new AppError(404, "Order not found");

    if (scope.storeId && order.storeId !== scope.storeId) {
      throw new AppError(403, "Forbidden");
    }

    if (order.transactionStatus !== "process") {
      throw new AppError(400, "Order must be in 'process' status to be shipped");
    }

    await updateTransactionStatus(orderId, "onDelivery", tx);

    return order;
  });

  sendOrderShippedEmail({
    email: order.customer.email,
    name: order.customer.name,
    orderId: order.id,
    shippingVendor: order.shipping_vendor,
  }).catch(console.error);
};

// Admin dapat membatalkan pesanan sampai sebelum status onDelivery.
// Saat dibatalkan, stok dikembalikan dan stock history dicatat.
export const cancelOrderByAdminService = async (
  requesterId: string,
  orderId: string,
) => {
  const scope = await getAdminOrderScope(requesterId);

  const order = await prisma.$transaction(async (tx) => {
    const order = await findAdminTransactionById(orderId, tx);

    if (!order) throw new AppError(404, "Order not found");

    if (scope.storeId && order.storeId !== scope.storeId) {
      throw new AppError(403, "Forbidden");
    }

    const cancellableStatuses = ["waitingPayment", "waitingConfirmation", "paid", "process"];
    if (!cancellableStatuses.includes(order.transactionStatus)) {
      throw new AppError(400, "Order cannot be cancelled at this stage");
    }

    await updateTransactionStatus(orderId, "cancel", tx);

    for (const item of order.items) {
      // Skip fulfillment items — stok toko terdekat tidak pernah di-decrement
      // untuk item ini saat order dibuat, jadi tidak perlu di-restore.
      if (item.requiresFulfillment) continue;

      const stock = await findStoreStockByProductId(order.storeId, item.productId, tx);
      if (!stock) continue;

      const stockBefore = stock.stock;
      const stockAfter = stockBefore + item.quantity;

      await updateStoreStockQuantity(stock.id, stockAfter, tx);
      await createStockHistory(
        {
          name: item.name,
          quantity: item.quantity,
          stockBefore,
          stockAfter,
          product: { connect: { id: item.productId } },
          store: { connect: { id: order.storeId } },
          admin: { connect: { id: requesterId } },
          transaction: { connect: { id: orderId } },
          type: "returnIn",
          notes: "Order cancelled by admin",
        },
        tx,
      );
    }

    return order;
  });

  sendOrderAdminCancelledEmail({
    email: order.customer.email,
    name: order.customer.name,
    orderId: order.id,
  }).catch(console.error);
};