import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { findActiveDiscountsByStoreAndProductIds } from "../discount/discount.repository.js";
import { findStoreById } from "../store/store.repository.js";
import {
  buildAvailableStoreStockWhere,
  buildInventoryProductCards,
  buildStoreStockOrderBy,
  buildStoreStockWhere,
  buildUnavailableStoreStockWhere,
} from "./stock.helper.js";
import {
  countStoreStocks,
  findStoreStockByProductSlug,
  findStoreStocks,
} from "./stock.repository.js";
import type { TGetStoreStocksQuery } from "./stock.schemas.js";

export const getStoreStocksService = async (
  storeId: string,
  params: TGetStoreStocksQuery
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStoreStockWhere(storeId, params);
  const orderBy = buildStoreStockOrderBy(params);

  if (params.inStock === undefined) {
    const availableWhere = buildAvailableStoreStockWhere(storeId, params);
    const unavailableWhere = buildUnavailableStoreStockWhere(storeId, params);

    const [availableTotal, total] = await Promise.all([
      countStoreStocks(availableWhere),
      countStoreStocks(where),
    ]);

    const stocks = [];

    if (skip < availableTotal) {
      const availableTake = Math.min(limit, availableTotal - skip);
      const availableStocks = await findStoreStocks(availableWhere, {
        skip,
        take: availableTake,
        orderBy,
      });

      stocks.push(...availableStocks);
    }

    if (stocks.length < limit) {
      const unavailableSkip = Math.max(0, skip - availableTotal);
      const unavailableStocks = await findStoreStocks(unavailableWhere, {
        skip: unavailableSkip,
        take: limit - stocks.length,
        orderBy,
      });

      stocks.push(...unavailableStocks);
    }

    const discounts = await findActiveDiscountsByStoreAndProductIds({
      storeId,
      productIds: stocks.map((stock) => stock.product.id),
    });

    return {
      data: buildInventoryProductCards(stocks, discounts),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  const [stocks, total] = await Promise.all([
    findStoreStocks(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countStoreStocks(where),
  ]);
  const discounts = await findActiveDiscountsByStoreAndProductIds({
    storeId,
    productIds: stocks.map((stock) => stock.product.id),
  });

  return {
    data: buildInventoryProductCards(stocks, discounts),
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStoreStockByProductSlugService = async (
  storeId: string,
  slug: string
) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const stock = await findStoreStockByProductSlug(storeId, slug);
  if (!stock) throw new AppError(404, "Product stock was not found");
  const discounts = await findActiveDiscountsByStoreAndProductIds({
    storeId,
    productIds: [stock.product.id],
  });

  return buildInventoryProductCards([stock], discounts)[0];
};
