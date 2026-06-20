import type {
  VoucherCreateInput,
  VoucherUpdateInput,
  VoucherWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import { voucherInclude } from "./adminVoucher.helper.js";
import type { TFindManyVoucherOptions } from "./adminVoucher.models.js";

export const findVouchers = async (
  where: VoucherWhereInput,
  options: TFindManyVoucherOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.voucher.findMany({
    where,
    include: voucherInclude,
    ...options,
  });
};

export const countVouchers = async (
  where: VoucherWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.voucher.count({ where });
};

export const findVoucherById = async (id: string, db: TPrisma = prisma) => {
  return await db.voucher.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: voucherInclude,
  });
};

export const findVoucherByCode = async (code: string, db: TPrisma = prisma) => {
  return await db.voucher.findUnique({
    where: {
      code,
    },
  });
};

export const findVoucherByCodeExceptId = async (
  code: string,
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.voucher.findFirst({
    where: {
      code,
      id: {
        not: id,
      },
    },
  });
};

export const createVoucher = async (
  data: VoucherCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.voucher.create({
    data,
    include: voucherInclude,
  });
};

export const updateVoucher = async (
  id: string,
  data: VoucherUpdateInput,
  db: TPrisma = prisma,
) => {
  return await db.voucher.update({
    where: {
      id,
    },
    data,
    include: voucherInclude,
  });
};

export const softDeleteVoucher = async (id: string, db: TPrisma = prisma) => {
  return await db.voucher.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: voucherInclude,
  });
};
