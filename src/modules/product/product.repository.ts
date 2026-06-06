import {
  ProductFindManyArgs,
  ProductWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TGetProductBySlugQuery } from "./product.schemas.js";
import { buildProductStocksWhere } from "./product.helper.js";

type TFindManyProductOptions = Pick<
  ProductFindManyArgs,
  "orderBy" | "skip" | "take"
>;

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

export const findAdminProductBySlug = async (
  slug: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      category: true,
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: "asc",
        },
      },
      stocks: {
        where: {
          deletedAt: null,
          store: {
            deletedAt: null,
          },
        },
        include: {
          store: true,
        },
        orderBy: {
          store: {
            name: "asc",
          },
        },
      },
      stockHistories: {
        where: {
          deletedAt: null,
        },
        include: {
          store: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      discounts: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};
