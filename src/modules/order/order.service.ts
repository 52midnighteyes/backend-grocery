import { prisma } from "../../libs/prisma/prisma.lib.js";
import { AppError } from "../../class/appError.js";
import type { TCreateOrderInput } from "./order.types.js";
import type { TGetOrdersQuerySchema } from "./order.schemas.js";
import type { VoucherDiscountType } from "../../../generated/prisma/enums.js";
import {
  findAddressById,
  findStoreById,
  findProductById,
  findProductStockByStore,
  sumProductStockAcrossStores,
  findVoucherByIdAndType,
  findDiscountById,
  createTransaction,
  decrementVoucherQuantity,
  incrementDiscountUsedQuota,
  createVoucherHistory,
  findTransactionById,
  findTransactionsByCustomer,
  updateTransactionStatus,
  findUserVoucherByUserAndVoucher,
  markUserVoucherAsUsed,
  voucherHasAnyOwner,
} from "./order.repository.js";
import {
  createStockHistory,
  findStoreStockByProductId,
  updateStoreStockQuantity,
} from "../stock/stock.repository.js";
import { hardDeleteCartItemsByUserId } from "../cart/cart.repository.js";
import {
  type ItemWithPrice,
  calcProductDiscount,
  calcVoucherDiscount,
  recordSaleHistory,
} from "./order.helper.js";

export const createOrderService = async (userId: string, payload: TCreateOrderInput) => {
  const productIds = new Set<string>();
  for (const item of payload.items) {
    if (productIds.has(item.productId)) {
      throw new AppError(400, "Duplicate products are not allowed in one order");
    }
    productIds.add(item.productId);
  }

  const address = await findAddressById(payload.addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  const store = await findStoreById(payload.storeId);
  if (!store) throw new AppError(404, "Store not found");

  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsWithPrice: ItemWithPrice[] = [];

    for (const item of payload.items) {
      const [stock, product, totalStock] = await Promise.all([
        findProductStockByStore(item.productId, payload.storeId, tx),
        findProductById(item.productId, tx),
        sumProductStockAcrossStores(item.productId, tx),
      ]);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      if (totalStock < item.quantity) {
        throw new AppError(400, `Insufficient stock for product: ${product.name}`);
      }

      const storeStockAtOrder = stock?.stock ?? 0;
      const shortageQuantity = Math.max(item.quantity - storeStockAtOrder, 0);
      const requiresFulfillment = shortageQuantity > 0;

      let itemTotal = product.price * item.quantity;
      let discountSnapshot: ItemWithPrice["discountSnapshot"];
      let discountQuota: number | null = null;

      if (item.discountId) {
        const discount = await findDiscountById(item.discountId, payload.storeId, tx);
        if (!discount || discount.productId !== item.productId) {
          throw new AppError(400, `Invalid discount for product: ${product.name}`);
        }

        const discountCalculation = calcProductDiscount({
          type: discount.type,
          value: discount.value,
          buyQuantity: discount.buyQuantity,
          getQuantity: discount.getQuantity,
          price: product.price,
          quantity: item.quantity,
        });

        if (
          discount.quota !== null &&
          discountCalculation.quotaUsage > 0 &&
          discount.usedQuota + discountCalculation.quotaUsage > discount.quota
        ) {
          throw new AppError(400, `Discount quota is insufficient for product: ${product.name}`);
        }

        itemTotal = discountCalculation.itemTotal;
        discountQuota = discount.quota;
        discountSnapshot = {
          discountId: discount.id,
          discountName: discount.name,
          discountType: discount.type,
          discountValue: discount.value,
          buyQuantity: discount.buyQuantity,
          getQuantity: discount.getQuantity,
          discountAmount: discountCalculation.discountAmount,
          quotaUsage: discountCalculation.quotaUsage,
        };
      }

      subtotal += itemTotal;
      itemsWithPrice.push({
        productId: item.productId,
        quantity: item.quantity,
        discountId: item.discountId,
        name: product.name,
        totalPrice: itemTotal,
        stockId: stock?.id,
        stockBefore: storeStockAtOrder,
        requiresFulfillment,
        storeStockAtOrder,
        shortageQuantity,
        discountSnapshot,
        discountQuota,
      });
    }

    let voucherDiscount = 0;
    let voucherHistoryData: {
      voucherId: string;
      voucherName: string;
      voucherCode: string;
      voucherDiscountType: VoucherDiscountType;
      voucherDiscountValue: number;
      voucherDiscountAmount: number;
    } | null = null;

    let isPersonalVoucher = false;
    if (payload.voucherId) {
      const v = await findVoucherByIdAndType(payload.voucherId, "transaction", payload.storeId, tx);
      if (!v) throw new AppError(400, "Voucher is invalid or expired");
      const hasOwner = await voucherHasAnyOwner(v.id, tx);
      if (hasOwner) {
        const uv = await findUserVoucherByUserAndVoucher(userId, v.id, tx);
        if (!uv) throw new AppError(403, "Voucher ini bukan milikmu");
        if (uv.isUsed) throw new AppError(400, "Voucher sudah pernah digunakan");
        if (uv.expiresAt && uv.expiresAt < new Date()) throw new AppError(400, "Voucher sudah kadaluarsa");
        isPersonalVoucher = true;
      }
      if (v.minimumTransaction !== null && subtotal < v.minimumTransaction) {
        throw new AppError(400, `Minimum transaction for this voucher is ${v.minimumTransaction}`);
      }
      voucherDiscount = calcVoucherDiscount(v.discountType, v.value, subtotal, v.maxDiscount);
      voucherHistoryData = {
        voucherId: v.id,
        voucherName: v.name,
        voucherCode: v.code,
        voucherDiscountType: v.discountType,
        voucherDiscountValue: v.value,
        voucherDiscountAmount: voucherDiscount,
      };
    }

    let deliveryDiscount = 0;
    let deliveryVoucherHistoryData: {
      deliveryVoucherId: string;
      deliveryVoucherName: string;
      deliveryVoucherCode: string;
      deliveryVoucherDiscountType: VoucherDiscountType;
      deliveryVoucherValue: number;
      deliveryVoucherAmount: number;
    } | null = null;

    let isPersonalDeliveryVoucher = false;
    if (payload.deliveryVoucherId) {
      const dv = await findVoucherByIdAndType(payload.deliveryVoucherId, "delivery", payload.storeId, tx);
      if (!dv) throw new AppError(400, "Delivery voucher is invalid or expired");
      const hasOwner = await voucherHasAnyOwner(dv.id, tx);
      if (hasOwner) {
        const uv = await findUserVoucherByUserAndVoucher(userId, dv.id, tx);
        if (!uv) throw new AppError(403, "Voucher pengiriman ini bukan milikmu");
        if (uv.isUsed) throw new AppError(400, "Voucher pengiriman sudah pernah digunakan");
        if (uv.expiresAt && uv.expiresAt < new Date()) throw new AppError(400, "Voucher pengiriman sudah kadaluarsa");
        isPersonalDeliveryVoucher = true;
      }
      if (dv.minimumTransaction !== null && payload.deliveryFee < dv.minimumTransaction) {
        throw new AppError(400, `Minimum delivery fee for this voucher is ${dv.minimumTransaction}`);
      }
      deliveryDiscount = calcVoucherDiscount(dv.discountType, dv.value, payload.deliveryFee, dv.maxDiscount);
      deliveryVoucherHistoryData = {
        deliveryVoucherId: dv.id,
        deliveryVoucherName: dv.name,
        deliveryVoucherCode: dv.code,
        deliveryVoucherDiscountType: dv.discountType,
        deliveryVoucherValue: dv.value,
        deliveryVoucherAmount: deliveryDiscount,
      };
    }

    const finalDeliveryFee = Math.max(0, payload.deliveryFee - deliveryDiscount);
    const totalPrice = Math.max(0, subtotal - voucherDiscount) + finalDeliveryFee;

    const transaction = await createTransaction(
      {
        customerId: userId,
        storeId: payload.storeId,
        addressId: payload.addressId,
        shippingVendor: payload.shippingVendor,
        deliveryFee: finalDeliveryFee,
        totalPrice,
        voucherId: payload.voucherId,
        deliveryVoucherId: payload.deliveryVoucherId,
        items: itemsWithPrice,
      },
      tx,
    );

    for (const item of itemsWithPrice) {
      if (!item.discountSnapshot || item.discountSnapshot.quotaUsage <= 0) continue;

      const result = await incrementDiscountUsedQuota(
        {
          discountId: item.discountSnapshot.discountId,
          quotaUsage: item.discountSnapshot.quotaUsage,
          quota: item.discountQuota,
        },
        tx,
      );

      if (result.count === 0) {
        throw new AppError(400, `Discount quota is insufficient for product: ${item.name}`);
      }
    }

    await recordSaleHistory(itemsWithPrice, payload.storeId, transaction.id, transaction.items, tx);

    if (payload.voucherId || payload.deliveryVoucherId) {
      if (payload.voucherId) {
        if (isPersonalVoucher) {
          await markUserVoucherAsUsed(userId, payload.voucherId, tx);
        } else {
          const result = await decrementVoucherQuantity(payload.voucherId, tx);
          if (result.count === 0) throw new AppError(400, "Voucher is invalid or expired");
        }
      }
      if (payload.deliveryVoucherId) {
        if (isPersonalDeliveryVoucher) {
          await markUserVoucherAsUsed(userId, payload.deliveryVoucherId, tx);
        } else {
          const result = await decrementVoucherQuantity(payload.deliveryVoucherId, tx);
          if (result.count === 0) throw new AppError(400, "Delivery voucher is invalid or expired");
        }
      }

      await createVoucherHistory(
        {
          transactionId: transaction.id,
          storeId: payload.storeId,
          voucherId: voucherHistoryData?.voucherId ?? null,
          voucherName: voucherHistoryData?.voucherName ?? null,
          voucherCode: voucherHistoryData?.voucherCode ?? null,
          voucherDiscountType: voucherHistoryData?.voucherDiscountType ?? null,
          voucherDiscountValue: voucherHistoryData?.voucherDiscountValue ?? null,
          voucherDiscountAmount: voucherHistoryData?.voucherDiscountAmount ?? null,
          deliveryVoucherId: deliveryVoucherHistoryData?.deliveryVoucherId ?? null,
          deliveryVoucherName: deliveryVoucherHistoryData?.deliveryVoucherName ?? null,
          deliveryVoucherCode: deliveryVoucherHistoryData?.deliveryVoucherCode ?? null,
          deliveryVoucherDiscountType:
            deliveryVoucherHistoryData?.deliveryVoucherDiscountType ?? null,
          deliveryVoucherValue: deliveryVoucherHistoryData?.deliveryVoucherValue ?? null,
          deliveryVoucherAmount: deliveryVoucherHistoryData?.deliveryVoucherAmount ?? null,
        },
        tx,
      );
    }

    return transaction;
  });

  await hardDeleteCartItemsByUserId(userId);
  return order;
};

export const getOrdersService = async (userId: string, query: TGetOrdersQuerySchema) => {
  const { data, total } = await findTransactionsByCustomer(userId, query);
  const { page, limit } = query;
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getOrderDetailService = async (userId: string, orderId: string) => {
  const order = await findTransactionById(orderId);
  if (!order) throw new AppError(404, "Order not found");
  if (order.customerId !== userId) throw new AppError(403, "Forbidden");
  return order;
};

// Status yang diizinkan untuk diubah oleh user: "cancel" dan "confirmed".
export const updateOrderStatusService = async (
  userId: string,
  orderId: string,
  status: "cancel" | "confirmed",
) => {
  return prisma.$transaction(async (tx) => {
    const order = await findTransactionById(orderId, tx);
    if (!order) throw new AppError(404, "Order not found");
    if (order.customerId !== userId) throw new AppError(403, "Forbidden");

    if (status === "cancel") {
      if (order.transactionStatus !== "waitingPayment") {
        throw new AppError(400, "Order can only be cancelled before uploading payment proof");
      }
      await updateTransactionStatus(orderId, "cancel", tx);

      for (const item of order.items) {
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
            transaction: { connect: { id: orderId } },
            type: "returnIn",
            notes: "Order cancelled by user",
          },
          tx,
        );
      }
    }

    if (status === "confirmed") {
      if (order.transactionStatus !== "onDelivery") {
        throw new AppError(400, "Order can only be confirmed after it has been shipped");
      }
      await updateTransactionStatus(orderId, "confirmed", tx);
    }
  });
};