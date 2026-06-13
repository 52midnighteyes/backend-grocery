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
  decrementProductStock,
  createStockHistory,
  decrementVoucherQuantity,
  createVoucherHistory,
  createDiscountHistory,
  findTransactionById,
  findTransactionsByCustomer,
  updateTransactionStatus,
  incrementProductStock,
} from "./order.repository.js";
import { hardDeleteCartItemsByUserId } from "../cart/cart.repository.js";
import { DiscountType } from "../../../generated/prisma/enums.js";

export const createOrderService = async (
  userId: string,
  payload: TCreateOrderInput,
) => {
  // Ambil alamat dulu di luar transaction untuk validasi awal
  const address = await findAddressById(payload.addressId, userId);
  if (!address) {
    throw new AppError(404, "Address not found");
  }

  // Cari toko terdekat di luar transaction karena pakai $queryRaw
  const nearestStore = await findNearestStore(address.latitude, address.longitude);
  if (!nearestStore) {
    throw new AppError(404, "No store available near your address");
  }

  const order = await prisma.$transaction(async (tx) => {
    // Validasi stok setiap item dan hitung total harga
    let subtotal = 0;
    const itemsWithPrice: Array<{
      productId: string;
      quantity: number;
      discountId?: string;
      name: string;
      totalPrice: number;
    }> = [];

    for (const item of payload.items) {
      const stock = await findProductStockByStore(item.productId, nearestStore.id, tx);

      if (!stock) {
        throw new AppError(
          404,
          `Product ${item.productId} is not available in the nearest store`,
        );
      }

      if (stock.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for product: ${stock.product.name}`);
      }

      let itemTotal = stock.product.price * item.quantity;

      if (item.discountId) {
        const discount = await findDiscountById(item.discountId, tx);

        if (!discount || discount.productId !== item.productId) {
          throw new AppError(400, `Invalid discount for product: ${stock.product.name}`);
        }

        if (discount.type === DiscountType.percentage && discount.value) {
          itemTotal = itemTotal - Math.floor((itemTotal * discount.value) / 100);
        } else if (discount.type === DiscountType.nominal && discount.value) {
          itemTotal = Math.max(0, itemTotal - discount.value * item.quantity);
        } else if (discount.type === DiscountType.buyXGetY) {
          const buyQty = discount.buyQuantity ?? 1;
          const getQty = discount.getQuantity ?? 1;
          const sets = Math.floor(item.quantity / (buyQty + getQty));
          const remainder = item.quantity % (buyQty + getQty);
          const paidQty = sets * buyQty + Math.min(remainder, buyQty);
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
      });
    }

    // Validasi dan hitung voucher belanja
    let voucherDiscount = 0;
    if (payload.voucherId) {
      const voucher = await findVoucherByIdAndType(payload.voucherId, "transaction", tx);

      if (!voucher) {
        throw new AppError(400, "Voucher is invalid or expired");
      }

      if (voucher.minimumTransaction && subtotal < voucher.minimumTransaction) {
        throw new AppError(
          400,
          `Minimum transaction for this voucher is ${voucher.minimumTransaction}`,
        );
      }

      if (voucher.discountType === "percentage") {
        voucherDiscount = Math.floor((subtotal * voucher.value) / 100);
        if (voucher.maxDiscount) {
          voucherDiscount = Math.min(voucherDiscount, voucher.maxDiscount);
        }
      } else {
        voucherDiscount = voucher.value;
      }
    }

    // Validasi dan hitung voucher ongkir
    let deliveryDiscount = 0;
    if (payload.deliveryVoucherId) {
      const deliveryVoucher = await findVoucherByIdAndType(
        payload.deliveryVoucherId,
        "delivery",
        tx,
      );

      if (!deliveryVoucher) {
        throw new AppError(400, "Delivery voucher is invalid or expired");
      }

      if (deliveryVoucher.discountType === "percentage") {
        deliveryDiscount = Math.floor((payload.deliveryFee * deliveryVoucher.value) / 100);
        if (deliveryVoucher.maxDiscount) {
          deliveryDiscount = Math.min(deliveryDiscount, deliveryVoucher.maxDiscount);
        }
      } else {
        deliveryDiscount = deliveryVoucher.value;
      }
    }

    const finalDeliveryFee = Math.max(0, payload.deliveryFee - deliveryDiscount);
    const totalPrice = Math.max(0, subtotal - voucherDiscount) + finalDeliveryFee;

    // Buat transaksi beserta semua item-nya
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

    // Kurangi stok dan catat jurnal untuk setiap item
    for (const item of itemsWithPrice) {
      await decrementProductStock(item.productId, nearestStore.id, item.quantity, tx);
      await createStockHistory(
        {
          name: `Sale - Order ${transaction.id}`,
          productId: item.productId,
          storeId: nearestStore.id,
          type: "sale",
        },
        tx,
      );

      if (item.discountId) {
        await createDiscountHistory(
          { transactionId: transaction.id, discountId: item.discountId },
          tx,
        );
      }
    }

    // Kurangi kuantitas voucher dan catat history jika ada
    if (payload.voucherId || payload.deliveryVoucherId) {
      if (payload.voucherId) {
        await decrementVoucherQuantity(payload.voucherId, tx);
      }
      if (payload.deliveryVoucherId) {
        await decrementVoucherQuantity(payload.deliveryVoucherId, tx);
      }
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

  // Hard delete cart items setelah order berhasil — di luar transaction
  // supaya gagalnya cart clear tidak rollback order yang sudah dibuat.
  await hardDeleteCartItemsByUserId(userId);

  return order;
};

export const getOrdersService = async (
  userId: string,
  query: TGetOrdersQuerySchema,
) => {
  const { data, total } = await findTransactionsByCustomer(userId, query);
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

export const getOrderDetailService = async (
  userId: string,
  orderId: string,
) => {
  const order = await findTransactionById(orderId);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return order;
};

// Menggabungkan cancel dan confirm menjadi satu service.
// Status yang diizinkan untuk diubah oleh user: "cancel" dan "confirmed".
// Backend yang handle validasi transisi status — bukan frontend.
export const updateOrderStatusService = async (
  userId: string,
  orderId: string,
  status: "cancel" | "confirmed",
) => {
  return prisma.$transaction(async (tx) => {
    const order = await findTransactionById(orderId, tx);

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.customerId !== userId) {
      throw new AppError(403, "Forbidden");
    }

    if (status === "cancel") {
      // User boleh cancel selama belum dikonfirmasi admin (waitingPayment atau waitingConfirmation)
      const cancellableStatuses = ["waitingPayment", "waitingConfirmation"];
      if (!cancellableStatuses.includes(order.transactionStatus)) {
        throw new AppError(400, "Order can only be cancelled before payment is confirmed by admin");
      }

      await updateTransactionStatus(orderId, "cancel", tx);

      // Kembalikan stok dan catat jurnal untuk setiap item
      for (const item of order.items) {
        await incrementProductStock(item.productId, order.storeId, item.quantity, tx);
        await createStockHistory(
          {
            name: `Return - Order ${orderId} cancelled`,
            productId: item.productId,
            storeId: order.storeId,
            type: "returnOut",
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