import {
  ProductStockOrderByWithRelationInput,
  ProductStockWhereInput,
} from "../../../generated/prisma/models.js";
import {
  attachPublicDiscountPreview,
  hasAvailableDiscountQuota,
} from "../discount/discount.helper.js";
import type { TPublicDiscountCandidate } from "../discount/discount.models.js";
import type { TGetStoreStocksQuery } from "./stock.schemas.js";

export const buildStoreStockWhere = (
  storeId: string,
  query: TGetStoreStocksQuery,
): ProductStockWhereInput => {
  const where: ProductStockWhereInput = {
    storeId,
    deletedAt: null,
    store: {
      deletedAt: null,
    },
    product: {
      deletedAt: null,
    },
  };

  const andConditions: ProductStockWhereInput[] = [];

  if (query.q) {
    andConditions.push({
      OR: [
        { product: { name: { contains: query.q, mode: "insensitive" } } },
        { product: { slug: { contains: query.q, mode: "insensitive" } } },
        { product: { sku: { contains: query.q, mode: "insensitive" } } },
        { product: { brand: { contains: query.q, mode: "insensitive" } } },
        {
          product: {
            category: { name: { contains: query.q, mode: "insensitive" } },
          },
        },
      ],
    });
  }

  if (query.productName) {
    andConditions.push({
      product: { name: { contains: query.productName, mode: "insensitive" } },
    });
  }

  if (query.sku) {
    andConditions.push({
      product: { sku: { contains: query.sku, mode: "insensitive" } },
    });
  }

  if (query.brand) {
    andConditions.push({
      product: { brand: { contains: query.brand, mode: "insensitive" } },
    });
  }

  if (query.categoryId) {
    andConditions.push({
      product: { categoryId: query.categoryId },
    });
  }

  if (query.categoryName) {
    andConditions.push({
      product: {
        category: {
          name: { contains: query.categoryName, mode: "insensitive" },
        },
      },
    });
  }

  if (query.minStock !== undefined || query.maxStock !== undefined) {
    andConditions.push({
      stock: {
        gte: query.minStock,
        lte: query.maxStock,
      },
    });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    andConditions.push({
      product: {
        price: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
      },
    });
  }

  if (query.inStock === true) {
    andConditions.push({ stock: { gt: 0 } });
  }

  if (query.inStock === false) {
    andConditions.push({ stock: { lte: 0 } });
  }

  if (andConditions.length) where.AND = andConditions;

  return where;
};

const appendStoreStockWhereCondition = (
  where: ProductStockWhereInput,
  condition: ProductStockWhereInput,
): ProductStockWhereInput => {
  const existingAnd = where.AND;
  const andConditions = Array.isArray(existingAnd)
    ? existingAnd
    : existingAnd
      ? [existingAnd]
      : [];

  return {
    ...where,
    AND: [...andConditions, condition],
  };
};

export const buildAvailableStoreStockWhere = (
  storeId: string,
  query: TGetStoreStocksQuery,
) =>
  appendStoreStockWhereCondition(
    buildStoreStockWhere(storeId, {
      ...query,
      inStock: undefined,
    }),
    { stock: { gt: 0 } },
  );

export const buildUnavailableStoreStockWhere = (
  storeId: string,
  query: TGetStoreStocksQuery,
) =>
  appendStoreStockWhereCondition(
    buildStoreStockWhere(storeId, {
      ...query,
      inStock: undefined,
    }),
    { stock: { lte: 0 } },
  );

export const buildStoreStockOrderBy = (
  query: TGetStoreStocksQuery,
): ProductStockOrderByWithRelationInput => {
  if (query.sortBy === "productName") {
    return { product: { name: query.sortOrder } };
  }

  if (query.sortBy === "sku") {
    return { product: { sku: query.sortOrder } };
  }

  if (query.sortBy === "brand") {
    return { product: { brand: query.sortOrder } };
  }

  if (query.sortBy === "price") {
    return { product: { price: query.sortOrder } };
  }

  if (query.sortBy === "categoryName") {
    return { product: { category: { name: query.sortOrder } } };
  }

  return { [query.sortBy]: query.sortOrder };
};

export const buildInventoryProductCards = <
  TStock extends {
    id: string;
    storeId: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    product: { id: string; price: number };
    store: {
      id: string;
      name: string;
      latitude?: unknown;
      longitude?: unknown;
    };
  },
>(
  stocks: TStock[],
  discounts: TPublicDiscountCandidate[],
) => {
  const discountByProductId = new Map(
    discounts
      .filter(hasAvailableDiscountQuota)
      .map((discount) => [discount.productId, discount]),
  );

  return stocks.map((stock) => {
    const productWithDiscount = attachPublicDiscountPreview(
      stock.product,
      discountByProductId.get(stock.product.id),
    );

    return {
      ...productWithDiscount,
      storeStock: {
        productStockId: stock.id,
        storeId: stock.storeId,
        stock: stock.stock,
        isAvailable: stock.stock > 0,
        store: {
          id: stock.store.id,
          name: stock.store.name,
          latitude: stock.store.latitude,
          longitude: stock.store.longitude,
        },
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
      },
    };
  });
};
