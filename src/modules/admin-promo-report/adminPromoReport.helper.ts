import type {
  DiscountHistoryOrderByWithRelationInput,
  DiscountHistoryWhereInput,
  VoucherHistoryOrderByWithRelationInput,
  VoucherHistoryWhereInput,
} from "../../../generated/prisma/models.js";
import type {
  TGetDiscountReportsQuery,
  TGetVoucherReportsQuery,
} from "./adminPromoReport.schemas.js";

export const discountReportInclude = {
  discount: {
    select: {
      id: true,
      name: true,
      type: true,
      value: true,
      buyQuantity: true,
      getQuantity: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
    },
  },
  transaction: {
    select: {
      id: true,
      totalPrice: true,
      createdAt: true,
    },
  },
  transactionItem: {
    select: {
      id: true,
      name: true,
      quantity: true,
      totalPrice: true,
    },
  },
} as const;

export const voucherReportInclude = {
  voucher: {
    select: {
      id: true,
      name: true,
      code: true,
      voucherType: true,
      discountType: true,
      value: true,
    },
  },
  deliveryVoucher: {
    select: {
      id: true,
      name: true,
      code: true,
      voucherType: true,
      discountType: true,
      value: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
    },
  },
  transaction: {
    select: {
      id: true,
      totalPrice: true,
      deliveryFee: true,
      createdAt: true,
    },
  },
} as const;

export const buildDiscountReportWhere = (
  params: TGetDiscountReportsQuery,
  storeId?: string,
): DiscountHistoryWhereInput => {
  return {
    deletedAt: null,
    storeId,
    productId: params.productId,
    discountId: params.discountId,
    createdAt:
      params.startDate || params.endDate
        ? {
            gte: params.startDate,
            lte: params.endDate,
          }
        : undefined,
  };
};

export const buildVoucherReportWhere = (
  params: TGetVoucherReportsQuery,
  storeId?: string,
): VoucherHistoryWhereInput => {
  return {
    deletedAt: null,
    storeId,
    ...(params.voucherType === "transaction"
      ? {
          voucherId: params.voucherId
            ? params.voucherId
            : {
                not: null,
              },
        }
      : params.voucherType === "delivery"
        ? {
            deliveryVoucherId: params.voucherId
              ? params.voucherId
              : {
                  not: null,
                },
          }
        : params.voucherId
          ? {
              OR: [
                {
                  voucherId: params.voucherId,
                },
                {
                  deliveryVoucherId: params.voucherId,
                },
              ],
            }
          : {}),
    createdAt:
      params.startDate || params.endDate
        ? {
            gte: params.startDate,
            lte: params.endDate,
          }
        : undefined,
  };
};

export const buildDiscountReportOrderBy = (
  params: TGetDiscountReportsQuery,
): DiscountHistoryOrderByWithRelationInput[] => {
  const orderBy: DiscountHistoryOrderByWithRelationInput = {
    [params.sortBy]: params.sortOrder,
  };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, { createdAt: "desc" }];
};

export const buildVoucherReportOrderBy = (
  params: TGetVoucherReportsQuery,
): VoucherHistoryOrderByWithRelationInput[] => {
  const orderBy: VoucherHistoryOrderByWithRelationInput = {
    [params.sortBy]: params.sortOrder,
  };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, { createdAt: "desc" }];
};
