import { StockMovement } from "../../../generated/prisma/enums.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TCreateOrderPayload, TGetOrdersQueryType } from "./order.types.js";

export const findAddressById = async (
  addressId: string,
  userId: string,
  db: TPrisma = prisma,
) => {
  return db.address.findFirst({
    where: { id: addressId, userId, deletedAt: null },
  });
};

// findNearestStore tidak terima TransactionClient karena pakai $queryRaw
// yang hanya ada di PrismaClient. Dipanggil di service sebelum transaction dimulai.
export const findNearestStore = async (latitude: string, longitude: string) => {
  const stores = await prisma.$queryRaw<
    { id: string; name: string; distance: number }[]
  >`
    SELECT
      id,
      name,
      (
        6371 * acos(
          cos(radians(${parseFloat(latitude)}))
          * cos(radians(CAST(latitude AS DOUBLE PRECISION)))
          * cos(radians(CAST(longitude AS DOUBLE PRECISION)) - radians(${parseFloat(longitude)}))
          + sin(radians(${parseFloat(latitude)}))
          * sin(radians(CAST(latitude AS DOUBLE PRECISION)))
        )
      ) AS distance
    FROM store
    WHERE deleted_at IS NULL
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    ORDER BY distance ASC
    LIMIT 1
  `;

  return stores[0] ?? null;
};

export const findProductStockByStore = async (
  productId: string,
  storeId: string,
  db: TPrisma = prisma,
) => {
  return db.productStock.findFirst({
    where: { productId, storeId, deletedAt: null },
    include: { product: true },
  });
};

export const findVoucherByIdAndType = async (
  voucherId: string,
  voucherType: "transaction" | "delivery",
  db: TPrisma = prisma,
) => {
  return db.voucher.findFirst({
    where: {
      id: voucherId,
      voucherType,
      deletedAt: null,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
      quantity: { gt: 0 },
    },
  });
};

export const findDiscountById = async (
  discountId: string,
  storeId: string,
  db: TPrisma = prisma,
) => {
  return db.discount.findFirst({
    where: {
      id: discountId,
      storeId,
      deletedAt: null,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });
};

export const createTransaction = async (
  payload: TCreateOrderPayload,
  db: TPrisma = prisma,
) => {
  // Set paymentExpiredAt 1 jam dari sekarang sesuai spec
  const paymentExpiredAt = new Date(Date.now() + 60 * 60 * 1000);

  return db.transaction.create({
    data: {
      customerId: payload.customerId,
      storeId: payload.storeId,
      deliveryFee: payload.deliveryFee,
      shipping_vendor: payload.shippingVendor,
      totalPrice: payload.totalPrice,
      voucherId: payload.voucherId ?? null,
      deliveryVoucherId: payload.deliveryVoucherId ?? null,
      transactionStatus: "waitingPayment",
      paymentExpiredAt,
      items: {
        create: payload.items.map((item) => ({
          name: item.name,
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          discountId: item.discountId ?? null,
        })),
      },
    },
    include: { items: true },
  });
};

export const decrementProductStock = async (
  productId: string,
  storeId: string,
  quantity: number,
  db: TPrisma = prisma,
) => {
  return db.productStock.updateMany({
    where: { productId, storeId, deletedAt: null },
    data: { stock: { decrement: quantity } },
  });
};

export const incrementProductStock = async (
  productId: string,
  storeId: string,
  quantity: number,
  db: TPrisma = prisma,
) => {
  return db.productStock.updateMany({
    where: { productId, storeId, deletedAt: null },
    data: { stock: { increment: quantity } },
  });
};

export const createStockHistory = async (
  data: {
    name: string;
    productId: string;
    storeId: string;
    type: StockMovement;
    transactionId?: string;
    quantity?: number;
  },
  db: TPrisma = prisma,
) => {
  return db.stockHistory.create({ data });
};

export const decrementVoucherQuantity = async (
  voucherId: string,
  db: TPrisma = prisma,
) => {
  return db.voucher.update({
    where: { id: voucherId },
    data: { quantity: { decrement: 1 } },
  });
};

export const createVoucherHistory = async (
  data: {
    transactionId: string;
    voucherId?: string;
    deliveryVoucherId?: string;
  },
  db: TPrisma = prisma,
) => {
  return db.voucherHistory.create({ data });
};

export const createDiscountHistory = async (
  data: { transactionId: string; discountId: string },
  db: TPrisma = prisma,
) => {
  return db.discountHistory.create({ data });
};

export const findTransactionById = async (
  transactionId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findFirst({
    where: { id: transactionId, deletedAt: null },
    include: {
      items: {
        where: { deletedAt: null },
        include: {
          product: {
            include: {
              images: {
                where: { deletedAt: null },
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
          discount: true,
        },
      },
      store: true,
      voucher: true,
      deliveryVoucher: true,
    },
  });
};

export const findTransactionsByCustomer = async (
  customerId: string,
  query: TGetOrdersQueryType,
  db: TPrisma = prisma,
) => {
  const { page, limit, status, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    customerId,
    deletedAt: null,
  };

  if (status) where.transactionStatus = status;
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  const [data, total] = await Promise.all([
    db.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            product: {
              include: {
                images: {
                  where: { deletedAt: null },
                  orderBy: { position: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
        store: true,
      },
    }),
    db.transaction.count({ where }),
  ]);

  return { data, total };
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.update({
    where: { id: transactionId },
    data: { transactionStatus: status as never },
  });
};

// Dipakai oleh cron job auto cancel
export const findExpiredOrders = async (db: TPrisma = prisma) => {
  return db.transaction.findMany({
    where: {
      transactionStatus: "waitingPayment",
      paymentExpiredAt: { lte: new Date() },
      deletedAt: null,
    },
    include: {
      items: {
        where: { deletedAt: null },
      },
    },
  });
};