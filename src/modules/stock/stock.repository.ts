import {
  ProductStockWhereInput,
  StockHistoryCreateInput,
  StockHistoryOrderByWithRelationInput,
  StockHistoryWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TFindManyStoreStockOptions } from "./stock.models.js";

export const findStoreStocks = async (
  where: ProductStockWhereInput,
  options: TFindManyStoreStockOptions = {},
  db: TPrisma = prisma
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
  db: TPrisma = prisma
) => {
  return await db.productStock.count({ where });
};

export const findStoreStockByProductSlug = async (
  storeId: string,
  slug: string,
  db: TPrisma = prisma
) => {
  return await db.productStock.findFirst({
    where: {
      storeId,
      deletedAt: null,
      store: {
        deletedAt: null,
      },
      product: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
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

export const findStoreStockByProductId = async (
  storeId: string,
  productId: string,
  db: TPrisma = prisma
) => {
  return await db.productStock.findFirst({
    where: {
      productId,
      storeId,
      deletedAt: null,
      store: {
        deletedAt: null,
      },
      product: {
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

export const upsertStoreStock = async (
  storeId: string,
  productId: string,
  db: TPrisma = prisma
) => {
  return await db.productStock.upsert({
    where: {
      productId_storeId: {
        productId,
        storeId,
      },
    },
    update: {
      deletedAt: null,
    },
    create: {
      productId,
      storeId,
      stock: 0,
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

export const updateStoreStockQuantity = async (
  stockId: string,
  stock: number,
  db: TPrisma = prisma
) => {
  return await db.productStock.update({
    where: {
      id: stockId,
    },
    data: {
      stock,
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

export const createStockHistory = async (
  data: StockHistoryCreateInput,
  db: TPrisma = prisma
) => {
  return await db.stockHistory.create({
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          category: {
            select: {
              id: true,
              name: true,
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
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transaction: {
        select: {
          id: true,
          totalPrice: true,
          transactionStatus: true,
        },
      },
    },
  });
};

export const findStockHistories = async (
  where: StockHistoryWhereInput,
  options: {
    skip?: number;
    take?: number;
    orderBy?:
      | StockHistoryOrderByWithRelationInput
      | StockHistoryOrderByWithRelationInput[];
  } = {},
  db: TPrisma = prisma
) => {
  return await db.stockHistory.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          category: {
            select: {
              id: true,
              name: true,
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
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transaction: {
        select: {
          id: true,
          totalPrice: true,
          transactionStatus: true,
        },
      },
    },
    orderBy: options.orderBy ?? { createdAt: "desc" },
    ...options,
  });
};

export const findStockHistoryById = async (
  storeId: string,
  historyId: string,
  db: TPrisma = prisma
) => {
  return await db.stockHistory.findFirst({
    where: {
      id: historyId,
      storeId,
      deletedAt: null,
    },
    include: {
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
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transaction: {
        select: {
          id: true,
          totalPrice: true,
          transactionStatus: true,
        },
      },
    },
  });
};

export const countStockHistories = async (
  where: StockHistoryWhereInput,
  db: TPrisma = prisma
) => {
  return await db.stockHistory.count({ where });
};

export const getStockEndingSnapshot = async (
  endDate: Date,
  filters: {
    storeId?: string;
    productId?: string;
    categoryId?: string;
    q?: string;
  } = {}
) => {
  const storeFilter = filters.storeId ?? null;
  const productFilter = filters.productId ?? null;
  const categoryFilter = filters.categoryId ?? null;
  const search = filters.q ? `%${filters.q}%` : null;

  const rows = await prisma.$queryRaw<
    Array<{
      endingStock: bigint | number | null;
      totalProducts: bigint | number | null;
    }>
  >`
    SELECT
      COALESCE(SUM(stock_after), 0)::bigint AS "endingStock",
      COUNT(*)::bigint AS "totalProducts"
    FROM (
      SELECT DISTINCT ON (sh.product_id, sh.store_id)
        sh.product_id,
        sh.store_id,
        sh.stock_after
      FROM stock_history sh
      JOIN product p ON p.id = sh.product_id
      JOIN category c ON c.id = p.category_id
      JOIN store s ON s.id = sh.store_id
      WHERE sh.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND s.deleted_at IS NULL
        AND sh.stock_after IS NOT NULL
        AND sh.created_at < ${endDate}
        AND (${storeFilter}::text IS NULL OR sh.store_id = ${storeFilter}::text)
        AND (${productFilter}::text IS NULL OR sh.product_id = ${productFilter}::text)
        AND (${categoryFilter}::text IS NULL OR c.id = ${categoryFilter}::text)
        AND (${search}::text IS NULL OR p.name ILIKE ${search} OR p.sku ILIKE ${search})
      ORDER BY sh.product_id, sh.store_id, sh.created_at DESC, sh.id DESC
    ) latest_rows
  `;

  return rows[0] ?? { endingStock: 0, totalProducts: 0 };
};
