import { VoucherType } from "../../../generated/prisma/enums.js";
import type { VoucherWhereInput } from "../../../generated/prisma/models.js";
import type { TPublicVoucherRecord } from "./voucher.repository.js";

export const buildPublicVoucherWhere = (
  storeId: string,
  now = new Date(),
): VoucherWhereInput => {
  return {
    deletedAt: null,
    quantity: {
      gt: 0,
    },
    startDate: {
      lte: now,
    },
    endDate: {
      gte: now,
    },
    OR: [
      {
        storeId: null,
      },
      {
        storeId,
      },
    ],
  };
};

export const buildPublicVoucher = (voucher: TPublicVoucherRecord) => {
  return {
    ...voucher,
    scope: voucher.storeId ? "store" : "global",
  };
};

export const groupPublicVouchers = (vouchers: TPublicVoucherRecord[]) => {
  const publicVouchers = vouchers.map(buildPublicVoucher);

  return {
    vouchers: publicVouchers.filter(
      (voucher) => voucher.voucherType === VoucherType.transaction,
    ),
    deliveryVouchers: publicVouchers.filter(
      (voucher) => voucher.voucherType === VoucherType.delivery,
    ),
  };
};
