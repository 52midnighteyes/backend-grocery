import type {
  DiscountHistoryWhereInput,
  VoucherHistoryWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import {
  discountReportInclude,
  voucherReportInclude,
} from "./adminPromoReport.helper.js";
import type {
  TFindManyDiscountReportOptions,
  TFindManyVoucherReportOptions,
} from "./adminPromoReport.models.js";

export const findDiscountReports = async (
  where: DiscountHistoryWhereInput,
  options: TFindManyDiscountReportOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.discountHistory.findMany({
    where,
    include: discountReportInclude,
    ...options,
  });
};

export const countDiscountReports = async (
  where: DiscountHistoryWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.discountHistory.count({ where });
};

export const aggregateDiscountReports = async (
  where: DiscountHistoryWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.discountHistory.aggregate({
    where,
    _sum: {
      discountAmount: true,
    },
  });
};

export const findVoucherReports = async (
  where: VoucherHistoryWhereInput,
  options: TFindManyVoucherReportOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.voucherHistory.findMany({
    where,
    include: voucherReportInclude,
    ...options,
  });
};

export const countVoucherReports = async (
  where: VoucherHistoryWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.voucherHistory.count({ where });
};

export const aggregateVoucherReports = async (
  where: VoucherHistoryWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.voucherHistory.aggregate({
    where,
    _sum: {
      voucherDiscountAmount: true,
      deliveryVoucherAmount: true,
    },
  });
};
