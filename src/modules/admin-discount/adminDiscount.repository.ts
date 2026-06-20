import type {
  DiscountCreateInput,
  DiscountUpdateInput,
  DiscountWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import { discountInclude } from "./adminDiscount.helper.js";
import type { TFindManyDiscountOptions } from "./adminDiscount.models.js";

export const findDiscounts = async (
  where: DiscountWhereInput,
  options: TFindManyDiscountOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.discount.findMany({
    where,
    include: discountInclude,
    ...options,
  });
};

export const countDiscounts = async (
  where: DiscountWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.discount.count({ where });
};

export const findDiscountById = async (id: string, db: TPrisma = prisma) => {
  return await db.discount.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: discountInclude,
  });
};

export const findActiveDiscountOverlap = async (
  params: {
    productId: string;
    storeId: string;
    startDate: Date;
    endDate: Date;
    excludeId?: string;
  },
  db: TPrisma = prisma,
) => {
  return await db.discount.findFirst({
    where: {
      deletedAt: null,
      productId: params.productId,
      storeId: params.storeId,
      id: params.excludeId
        ? {
            not: params.excludeId,
          }
        : undefined,
      startDate: {
        lte: params.endDate,
      },
      endDate: {
        gte: params.startDate,
      },
    },
  });
};

export const createDiscount = async (
  data: DiscountCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.discount.create({
    data,
    include: discountInclude,
  });
};

export const updateDiscount = async (
  id: string,
  data: DiscountUpdateInput,
  db: TPrisma = prisma,
) => {
  return await db.discount.update({
    where: {
      id,
    },
    data,
    include: discountInclude,
  });
};

export const softDeleteDiscount = async (id: string, db: TPrisma = prisma) => {
  return await db.discount.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: discountInclude,
  });
};
