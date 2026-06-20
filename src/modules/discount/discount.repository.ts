import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

const publicDiscountSelect = {
  name: true,
  type: true,
  value: true,
  buyQuantity: true,
  getQuantity: true,
  quota: true,
  usedQuota: true,
  productId: true,
  startDate: true,
  endDate: true,
} as const;

export const findActiveDiscountsByStoreAndProductIds = async (
  params: {
    storeId: string;
    productIds: string[];
    now?: Date;
  },
  db: TPrisma = prisma,
) => {
  if (params.productIds.length === 0) return [];

  const now = params.now ?? new Date();

  return await db.discount.findMany({
    where: {
      deletedAt: null,
      storeId: params.storeId,
      productId: {
        in: params.productIds,
      },
      startDate: {
        lte: now,
      },
      endDate: {
        gte: now,
      },
    },
    select: publicDiscountSelect,
    orderBy: {
      startDate: "desc",
    },
  });
};
