import { prisma } from "../../libs/prisma/prisma.lib.js";
import { AppError } from "../../class/appError.js";
import type { TCreateOrderInput } from "./order.types.js";
import type { TGetOrdersQuerySchema } from "./order.schemas.js";
import {
  findAddressById,
  findNearestStore,
  findProductStockByStore,
  findVoucherByIdAndType,
  findDiscountById,
  createTransaction,
  decrementVoucherQuantity,
  createVoucherHistory,
  findTransactionById,
  findTransactionsByCustomer,
  updateTransactionStatus,
} from "./order.repository.js";
import {
  createStockHistory,
  findStoreStockByProductId,
  updateStoreStockQuantity,
} from "../stock/stock.repository.js";
import { hardDeleteCartItemsByUserId } from "../cart/cart.repository.js";
import { DiscountType } from "../../../generated/prisma/enums.js";
import {
  type ItemWithPrice,
  calcVoucherDiscount,
  recordSaleHistory,
} from "./order.helper.js";

export const createOrderService = async (userId: string, payload: TCreateOrderInput) => {
  const address = await findAddressById(payload.addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  const nearestStore = await findNearestStore(address.latitude, address.longitude);
  if (!nearestStore) throw new AppError(404, "No store available near your address");

  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsWithPrice: ItemWithPrice[] = [];

    for (const item of payload.items) {
      const stock = await findProductStockByStore(item.productId, nearestStore.id, tx);
      if (!stock) {
        const product = await tx.product.findFirst({
          where: { id: item.productId },
          select: { name: true },
        });
        throw new AppError(
          404,
          `Produk "${product?.name ?? "yang dipilih"}" tidak tersedia di toko terdekat`,
        );
      }
      if (stock.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for product: ${stock.product.name}`);
      }

      let itemTotal = stock.product.price * item.quantity;
      if (item.discountId) {
        const discount = await findDiscountById(item.discountId, nearestStore.id, tx);
        if (!discount || discount.productId !== item.productId) {
          throw new AppError(400, `Invalid discount for product: ${stock.product.name}`);
        }
        if (discount.type === DiscountType.percentage && discount.value) {
          itemTotal -= Math.floor((itemTotal * discount.value) / 100);
        } else if (discount.type === DiscountType.nominal && discount.value) {
          itemTotal = Math.max(0, itemTotal - discount.value * item.quantity);
        } else if (discount.type === DiscountType.buyXGetY) {
          const buyQty = discount.buyQuantity ?? 1;
          const getQty = discount.getQuantity ?? 1;
          const sets = Math.floor(item.quantity / (buyQty + getQty));
          const paidQty = sets * buyQty + Math.min(item.quantity % (buyQty + getQty), buyQty);
          itemTotal = stock.product.price * paidQty;
        }
      }

      subtotal += itemTotal;
      itemsWithPrice.push({
        productId: item.productId,
        quantity: item.quantity,
        discountId: item.discountId,
        name: stock.product.name,
        totalPrice: itemTotal,
        stockId: stock.id,
        stockBefore: stock.stock,
      });
    }

    let voucherDiscount = 0;
    if (payload.voucherId) {
      const v = await findVoucherByIdAndType(payload.voucherId, "transaction", tx);
      if (!v) throw new AppError(400, "Voucher is invalid or expired");
      if (v.minimumTransaction && subtotal < v.minimumTransaction) {
        throw new AppError(400, `Minimum transaction for this voucher is ${v.minimumTransaction}`);
      }
      voucherDiscount = calcVoucherDiscount(v.discountType, v.value, subtotal, v.maxDiscount);
    }
    let deliveryDiscount = 0;
    if (payload.deliveryVoucherId) {
      const dv = await findVoucherByIdAndType(payload.deliveryVoucherId, "delivery", tx);
      if (!dv) throw new AppError(400, "Delivery voucher is invalid or expired");
      deliveryDiscount = calcVoucherDiscount(dv.discountType, dv.value, payload.deliveryFee, dv.maxDiscount);
    }
    const finalDeliveryFee = Math.max(0, payload.deliveryFee - deliveryDiscount);
    const totalPrice = Math.max(0, subtotal - voucherDiscount) + finalDeliveryFee;

    const transaction = await createTransaction(
      {
        customerId: userId,
        storeId: nearestStore.id,
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

    await recordSaleHistory(itemsWithPrice, nearestStore.id, transaction.id, tx);
    if (payload.voucherId || payload.deliveryVoucherId) {
      if (payload.voucherId) await decrementVoucherQuantity(payload.voucherId, tx);
      if (payload.deliveryVoucherId) await decrementVoucherQuantity(payload.deliveryVoucherId, tx);
      await createVoucherHistory(
        {
          transactionId: transaction.id,
          voucherId: payload.voucherId,
          deliveryVoucherId: payload.deliveryVoucherId,
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
      if (!["waitingPayment", "waitingConfirmation"].includes(order.transactionStatus)) {
        throw new AppError(400, "Order can only be cancelled before payment is confirmed by admin");
      }
      await updateTransactionStatus(orderId, "cancel", tx);

      for (const item of order.items) {
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
            notes: "Pembatalan pesanan oleh user",
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