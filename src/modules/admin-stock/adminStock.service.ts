import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { findAdminAccountById } from "../user/user.repository.js";
import { findStoreById } from "../store/store.repository.js";
import {
  buildStoreStockOrderBy,
  buildStoreStockWhere,
} from "../stock/stock.helper.js";
import {
  countStoreStocks,
  findStoreStockByProductSlug,
  findStoreStocks,
} from "../stock/stock.repository.js";
import type { TGetStoreStocksQuery } from "./adminStock.schemas.js";

export const getStoreStocksService = async (
  storeId: string,
  params: TGetStoreStocksQuery,
  requesterId: string,
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const requester = await findAdminAccountById(requesterId);
  if (requester?.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Store was not found");
  }

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStoreStockWhere(storeId, params);
  const orderBy = buildStoreStockOrderBy(params);

  const [stocks, total] = await Promise.all([
    findStoreStocks(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countStoreStocks(where),
  ]);

  return {
    data: stocks,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStoreStockByProductSlugService = async (
  storeId: string,
  slug: string,
  requesterId: string,
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const requester = await findAdminAccountById(requesterId);
  if (requester?.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Store was not found");
  }

  const stock = await findStoreStockByProductSlug(storeId, slug);
  if (!stock) throw new AppError(404, "Product stock was not found");

  return stock;
};
