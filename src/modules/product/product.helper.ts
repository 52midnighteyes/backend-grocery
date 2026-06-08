import {
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from "../../../generated/prisma/models.js";
import type {
  TProductStockFilterQuery,
  TProductStockWhere,
} from "./product.models.js";
import type {
  TGetProductBySlugQuery,
  TGetProductsQuery,
} from "./product.schemas.js";

const buildStockWhere = (query: TProductStockFilterQuery) => {
  const where: TProductStockWhere = {
    deletedAt: null,
  };

  if (query.storeId) where.storeId = query.storeId;

  const stockFilter: { gte?: number; lte?: number; gt?: number } = {};
  if (query.minStock !== undefined) stockFilter.gte = query.minStock;
  if (query.maxStock !== undefined) stockFilter.lte = query.maxStock;
  if (query.inStock === true) stockFilter.gt = 0;
  if (query.inStock === false) stockFilter.lte = 0;
  if (Object.keys(stockFilter).length) where.stock = stockFilter;

  return where;
};

export const buildProductWhere = (
  query: TGetProductsQuery,
): ProductWhereInput => {
  const where: ProductWhereInput = {
    deletedAt: null,
  };

  const andConditions: ProductWhereInput[] = [];

  if (query.q) {
    andConditions.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
        { sku: { contains: query.q, mode: "insensitive" } },
        { brand: { contains: query.q, mode: "insensitive" } },
        { variant: { contains: query.q, mode: "insensitive" } },
        { size: { contains: query.q, mode: "insensitive" } },
        { category: { name: { contains: query.q, mode: "insensitive" } } },
      ],
    });
  }

  if (query.name) {
    andConditions.push({
      name: { contains: query.name, mode: "insensitive" },
    });
  }

  if (query.slug) {
    andConditions.push({
      slug: { contains: query.slug, mode: "insensitive" },
    });
  }

  if (query.sku) {
    andConditions.push({
      sku: { contains: query.sku, mode: "insensitive" },
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: { contains: query.brand, mode: "insensitive" },
    });
  }

  if (query.variant) {
    andConditions.push({
      variant: { contains: query.variant, mode: "insensitive" },
    });
  }

  if (query.size) {
    andConditions.push({
      size: { contains: query.size, mode: "insensitive" },
    });
  }

  if (query.categoryName) {
    andConditions.push({
      category: { name: { contains: query.categoryName, mode: "insensitive" } },
    });
  }

  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    andConditions.push({
      price: {
        gte: query.minPrice,
        lte: query.maxPrice,
      },
    });
  }

  if (
    query.storeId ||
    query.minStock !== undefined ||
    query.maxStock !== undefined ||
    typeof query.inStock === "boolean"
  ) {
    andConditions.push({
      stocks: {
        some: buildStockWhere(query),
      },
    });
  }

  if (andConditions.length) where.AND = andConditions;

  return where;
};

export const buildProductOrderBy = (
  query: TGetProductsQuery,
): ProductOrderByWithRelationInput => {
  if (query.sortBy === "categoryName") {
    return { category: { name: query.sortOrder } };
  }

  return { [query.sortBy]: query.sortOrder };
};

export const buildProductStocksWhere = (
  query: TGetProductBySlugQuery,
) => {
  const where: TProductStockWhere = {
    deletedAt: null,
    store: {
      deletedAt: null,
    },
  };

  if (query.storeId) where.storeId = query.storeId;
  if (query.inStock === true) where.stock = { gt: 0 };
  if (query.inStock === false) where.stock = { lte: 0 };

  return where;
};
