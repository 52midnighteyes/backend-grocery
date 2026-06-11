import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import {
  attachStoreStock,
  buildProductOrderBy,
  buildProductWhere,
  buildStoreScopedAvailableProductWhere,
  buildStoreScopedProductWhere,
  buildStoreScopedUnavailableProductWhere,
} from "./product.helper.js";
import {
  countProducts,
  findProductBySlug,
  findProducts,
  findStoreScopedProductBySlug,
  findStoreScopedProducts,
} from "./product.repository.js";
import { findStoreById } from "../store/store.repository.js";
import type {
  TGetProductBySlugQuery,
  TGetProductsQuery,
  TGetStoreScopedProductsQuery,
} from "./product.schemas.js";

export const getProductsService = async (params: TGetProductsQuery) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildProductWhere(params);
  const orderBy = buildProductOrderBy(params);

  const [products, total] = await Promise.all([
    findProducts(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countProducts(where),
  ]);

  return {
    data: products,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getProductBySlugService = async (
  slug: string,
  query: TGetProductBySlugQuery,
) => {
  const product = await findProductBySlug(slug, query);
  if (!product) throw new AppError(404, "Product was not found");

  return product;
};

export const getStoreScopedProductsService = async (
  storeId: string,
  params: TGetStoreScopedProductsQuery,
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStoreScopedProductWhere(storeId, params);
  const orderBy = buildProductOrderBy(params);

  if (params.inStock === undefined) {
    const availableWhere = buildStoreScopedAvailableProductWhere(storeId, params);
    const unavailableWhere = buildStoreScopedUnavailableProductWhere(
      storeId,
      params,
    );

    const [availableTotal, total] = await Promise.all([
      countProducts(availableWhere),
      countProducts(where),
    ]);

    const products = [];

    if (skip < availableTotal) {
      const availableTake = Math.min(limit, availableTotal - skip);
      const availableProducts = await findStoreScopedProducts(
        storeId,
        availableWhere,
        {
          skip,
          take: availableTake,
          orderBy,
        },
      );

      products.push(...availableProducts);
    }

    if (products.length < limit) {
      const unavailableSkip = Math.max(0, skip - availableTotal);
      const unavailableProducts = await findStoreScopedProducts(
        storeId,
        unavailableWhere,
        {
          skip: unavailableSkip,
          take: limit - products.length,
          orderBy,
        },
      );

      products.push(...unavailableProducts);
    }

    return {
      data: products.map((product) => attachStoreStock(product, store)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  const [products, total] = await Promise.all([
    findStoreScopedProducts(storeId, where, {
      skip,
      take: limit,
      orderBy,
    }),
    countProducts(where),
  ]);

  return {
    data: products.map((product) => attachStoreStock(product, store)),
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStoreScopedProductBySlugService = async (
  storeId: string,
  slug: string,
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const product = await findStoreScopedProductBySlug(storeId, slug);
  if (!product) throw new AppError(404, "Product was not found");

  return attachStoreStock(product, store);
};
