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

export const findStoreStockByProductId = async (
  storeId: string,
  productId: string,
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
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
  db: TPrisma = prisma,
) => {
  return await db.stockHistory.count({ where });
};
