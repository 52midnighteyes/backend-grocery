import type {
  VoucherGetPayload,
  VoucherWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TFindPublicVouchersOptions } from "./voucher.models.js";

export const publicVoucherSelect = {
  id: true,
  name: true,
  code: true,
  quantity: true,
  storeId: true,
  minimumTransaction: true,
  maxDiscount: true,
  discountType: true,
  voucherType: true,
  value: true,
  startDate: true,
  endDate: true,
} as const;

export type TPublicVoucherRecord = VoucherGetPayload<{
  select: typeof publicVoucherSelect;
}>;

export const findPublicVouchers = async (
  where: VoucherWhereInput,
  options: TFindPublicVouchersOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.voucher.findMany({
    where,
    select: publicVoucherSelect,
    ...options,
  });
};
