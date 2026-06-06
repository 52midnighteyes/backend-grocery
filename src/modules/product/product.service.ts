import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import {
  buildProductOrderBy,
  buildProductWhere,
} from "./product.helper.js";
import {
  countProducts,
  findAdminProductBySlug,
  findProductBySlug,
  findProducts,
} from "./product.repository.js";
import type {
  TGetProductBySlugQuery,
  TGetProductsQuery,
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

export const getAdminProductBySlugService = async (slug: string) => {
  const product = await findAdminProductBySlug(slug);
  if (!product) throw new AppError(404, "Product was not found");

  return product;
};
