import { ProductWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TFindManyProductOptions } from "./product.models.js";
import type { TGetProductBySlugQuery } from "./product.schemas.js";
import { buildProductStocksWhere } from "./product.helper.js";

const productListInclude = {
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
      position: "asc" as const,
    },
  },
};

const storeScopedProductInclude = (storeId: string) => ({
  ...productListInclude,
  stocks: {
    where: {
      storeId,
      deletedAt: null,
    },
    select: {
      id: true,
      productId: true,
      storeId: true,
      stock: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 1,
  },
});

export const findProducts = async (
  where: ProductWhereInput = { deletedAt: null },
  options: TFindManyProductOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.product.findMany({
    where,
    include: productListInclude,
    ...options,
  });
};

export const findStoreScopedProducts = async (
  storeId: string,
  where: ProductWhereInput = { deletedAt: null },
  options: TFindManyProductOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.product.findMany({
    where,
    include: storeScopedProductInclude(storeId),
    ...options,
  });
};

export const countProducts = async (
  where: ProductWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.product.count({ where });
};

export const findProductBySlug = async (
  slug: string,
  query: TGetProductBySlugQuery,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      ...productListInclude,
      ...(query.includeStocks
        ? {
            stocks: {
              where: buildProductStocksWhere(query),
              select: {
                id: true,
                productId: true,
                storeId: true,
                stock: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                  },
                },
                createdAt: true,
                updatedAt: true,
              },
              orderBy: {
                store: {
                  name: "asc" as const,
                },
              },
            },
          }
        : {}),
    },
  });
};

export const findStoreScopedProductBySlug = async (
  storeId: string,
  slug: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      stocks: {
        some: {
          storeId,
          deletedAt: null,
        },
      },
    },
    include: storeScopedProductInclude(storeId),
  });
};
