import {
  DiscountType,
  StockMovement,
  VoucherDiscountType,
} from "../../../generated/prisma/enums.js";
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

export const findStoreById = async (storeId: string, db: TPrisma = prisma) => {
  return db.store.findFirst({
    where: { id: storeId, deletedAt: null },
  });
};

export const findProductById = async (
  productId: string,
  db: TPrisma = prisma,
) => {
  return db.product.findFirst({
    where: { id: productId, deletedAt: null },
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

export const sumProductStockAcrossStores = async (
  productId: string,
  db: TPrisma = prisma,
) => {
  const aggregate = await db.productStock.aggregate({
    where: {
      productId,
      deletedAt: null,
      store: { deletedAt: null },
      product: { deletedAt: null },
    },
    _sum: {
      stock: true,
    },
  });

  return aggregate._sum.stock ?? 0;
};

// storeId dipakai untuk validasi store-scope:
// voucher global (storeId null) bisa dipakai di mana saja,
// voucher store-scope hanya bisa dipakai di toko yang bersangkutan.
export const findVoucherByIdAndType = async (
  voucherId: string,
  voucherType: "transaction" | "delivery",
  storeId: string,
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
      OR: [
        { storeId: null },
        { storeId },
      ],
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
      addressId: payload.addressId,
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
          requiresFulfillment: item.requiresFulfillment,
          storeStockAtOrder: item.storeStockAtOrder,
          shortageQuantity: item.shortageQuantity,
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

export const decrementProductStockByStockId = async (
  stockId: string,
  quantity: number,
  db: TPrisma = prisma,
) => {
  return db.productStock.updateMany({
    where: {
      id: stockId,
      deletedAt: null,
      stock: { gte: quantity },
    },
    data: {
      stock: {
        decrement: quantity,
      },
    },
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
  return db.voucher.updateMany({
    where: { id: voucherId, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });
};

export const incrementDiscountUsedQuota = async (
  params: {
    discountId: string;
    quotaUsage: number;
    quota: number | null;
  },
  db: TPrisma = prisma,
) => {
  if (params.quotaUsage <= 0) return { count: 1 };

  return db.discount.updateMany({
    where: {
      id: params.discountId,
      ...(params.quota === null
        ? {}
        : { usedQuota: { lte: params.quota - params.quotaUsage } }),
    },
    data: {
      usedQuota: {
        increment: params.quotaUsage,
      },
    },
  });
};

export const createVoucherHistory = async (
  data: {
    transactionId: string;
    storeId: string;
    voucherId?: string | null;
    deliveryVoucherId?: string | null;
    voucherName?: string | null;
    voucherCode?: string | null;
    voucherDiscountType?: VoucherDiscountType | null;
    voucherDiscountValue?: number | null;
    voucherDiscountAmount?: number | null;
    deliveryVoucherName?: string | null;
    deliveryVoucherCode?: string | null;
    deliveryVoucherDiscountType?: VoucherDiscountType | null;
    deliveryVoucherValue?: number | null;
    deliveryVoucherAmount?: number | null;
  },
  db: TPrisma = prisma,
) => {
  return db.voucherHistory.create({ data });
};

export const createDiscountHistory = async (
  data: {
    transactionId: string;
    transactionItemId: string;
    discountId: string;
    productId: string;
    storeId: string;
    discountName: string;
    discountType: DiscountType;
    discountValue: number | null;
    buyQuantity: number | null;
    getQuantity: number | null;
    discountAmount: number;
  },
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
  const { page, limit, status, startDate, endDate, search } = query;

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    customerId,
    deletedAt: null,
  };

  if (status) where.transactionStatus = status;
  if (search) where.id  = { contains: search, mode: "insensitive"};
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
      customer: {
        select: { name: true, email: true },
      },
    },
  });
};