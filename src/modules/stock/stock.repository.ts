import {
  ProductStockWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TFindManyStoreStockOptions } from "./stock.models.js";

export const findStoreStocks = async (
  where: ProductStockWhereInput,
  options: TFindManyStoreStockOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.productStock.findMany({
    where,
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              image: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    ...options,
  });
};

export const countStoreStocks = async (
  where: ProductStockWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.productStock.count({ where });
};

export const findStoreStockByProductSlug = async (
  storeId: string,
  slug: string,
  db: TPrisma = prisma,
) => {
  return await db.productStock.findFirst({
    where: {
      storeId,
      deletedAt: null,
      store: {
        deletedAt: null,
      },
      product: {
        slug,
        deletedAt: null,
      },
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
        },
      },
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              image: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
};
