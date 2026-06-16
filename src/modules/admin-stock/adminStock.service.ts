import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { findAdminAccountById } from "../user/user.repository.js";
import { findStoreById } from "../store/store.repository.js";
import {
  buildStoreStockOrderBy,
  buildStoreStockWhere,
} from "../stock/stock.helper.js";
import {
  countStoreStocks,
  countStockHistories,
  createStockHistory,
  findStockHistories,
  findStockHistoryById,
  findStoreStockByProductId,
  findStoreStockByProductSlug,
  findStoreStocks,
  updateStoreStockQuantity,
} from "../stock/stock.repository.js";
import type { StockMovement } from "../../../generated/prisma/enums.js";
import type {
  StockHistoryOrderByWithRelationInput,
  StockHistoryWhereInput,
} from "../../../generated/prisma/models.js";
import type {
  TClearStockBody,
  TCreateStockMovementBody,
  TGetStockMovementsQuery,
  TGetStoreStocksQuery,
} from "./adminStock.schemas.js";

const stockIncreaseTypes = new Set<StockMovement>([
  "purchase",
  "returnIn",
  "adjustmentIn",
  "transferIn",
]);

const assertStoreStockAccess = async (storeId: string, requesterId: string) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const requester = await findAdminAccountById(requesterId);
  if (!requester) throw new AppError(401, "Unauthorized");

  if (requester.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Store was not found");
  }

  return requester;
};

const buildStockHistoryWhere = (
  storeId: string,
  params: TGetStockMovementsQuery,
): StockHistoryWhereInput => {
  return {
    storeId,
    productId: params.productId,
    type: params.type,
    deletedAt: null,
    createdAt:
      params.startDate || params.endDate
        ? {
            gte: params.startDate,
            lte: params.endDate,
          }
        : undefined,
  };
};

const buildStockHistoryOrderBy = (
  params: TGetStockMovementsQuery,
): StockHistoryOrderByWithRelationInput[] => {
  const sortOrder = params.sortOrder;
  const fallbackOrder: StockHistoryOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const orderBy: StockHistoryOrderByWithRelationInput =
    params.sortBy === "productName"
      ? { product: { name: sortOrder } }
      : params.sortBy === "storeName"
        ? { store: { name: sortOrder } }
        : params.sortBy === "adminName"
          ? { admin: { name: sortOrder } }
          : { [params.sortBy]: sortOrder };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, fallbackOrder];
};

export const getStoreStocksService = async (
  storeId: string,
  params: TGetStoreStocksQuery,
  requesterId: string,
) => {
  await assertStoreStockAccess(storeId, requesterId);

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
  await assertStoreStockAccess(storeId, requesterId);

  const stock = await findStoreStockByProductSlug(storeId, slug);
  if (!stock) throw new AppError(404, "Product stock was not found");

  return stock;
};

export const getStoreStockMovementsService = async (
  storeId: string,
  params: TGetStockMovementsQuery,
  requesterId: string,
) => {
  await assertStoreStockAccess(storeId, requesterId);

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStockHistoryWhere(storeId, params);
  const orderBy = buildStockHistoryOrderBy(params);

  const [histories, total] = await Promise.all([
    findStockHistories(where, { skip, take: limit, orderBy }),
    countStockHistories(where),
  ]);

  return {
    data: histories,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStoreStockMovementByIdService = async (
  storeId: string,
  historyId: string,
  requesterId: string,
) => {
  await assertStoreStockAccess(storeId, requesterId);

  const history = await findStockHistoryById(storeId, historyId);
  if (!history) throw new AppError(404, "Stock history was not found");

  return history;
};

export const getStoreProductStockMovementsService = async (
  storeId: string,
  productId: string,
  params: TGetStockMovementsQuery,
  requesterId: string,
) => {
  await assertStoreStockAccess(storeId, requesterId);

  const stock = await findStoreStockByProductId(storeId, productId);
  if (!stock) throw new AppError(404, "Product stock was not found");

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStockHistoryWhere(storeId, { ...params, productId });
  const orderBy = buildStockHistoryOrderBy(params);

  const [histories, total] = await Promise.all([
    findStockHistories(where, { skip, take: limit, orderBy }),
    countStockHistories(where),
  ]);

  return {
    data: histories,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const createStockMovementService = async (
  storeId: string,
  productId: string,
  params: TCreateStockMovementBody,
  requesterId: string,
) => {
  const requester = await assertStoreStockAccess(storeId, requesterId);

  return await prisma.$transaction(async (tx) => {
    const stock = await findStoreStockByProductId(storeId, productId, tx);
    if (!stock) throw new AppError(404, "Product stock was not found");

    const stockBefore = stock.stock;
    const quantityChange = stockIncreaseTypes.has(params.type)
      ? params.quantity
      : -params.quantity;
    const stockAfter = stockBefore + quantityChange;

    if (stockAfter < 0) {
      throw new AppError(400, "Stock cannot be less than zero");
    }

    const history = await createStockHistory(
      {
        name: stock.product.name,
        quantity: params.quantity,
        stockBefore,
        stockAfter,
        product: {
          connect: {
            id: productId,
          },
        },
        store: {
          connect: {
            id: storeId,
          },
        },
        admin: {
          connect: {
            id: requester.id,
          },
        },
        type: params.type,
        notes: params.notes,
      },
      tx,
    );

    const updatedStock = await updateStoreStockQuantity(
      stock.id,
      stockAfter,
      tx,
    );

    return {
      stock: updatedStock,
      history,
    };
  });
};

export const clearStoreProductStockService = async (
  storeId: string,
  productId: string,
  params: TClearStockBody,
  requesterId: string,
) => {
  const requester = await assertStoreStockAccess(storeId, requesterId);

  return await prisma.$transaction(async (tx) => {
    const stock = await findStoreStockByProductId(storeId, productId, tx);
    if (!stock) throw new AppError(404, "Product stock was not found");

    if (stock.stock === 0) {
      return {
        stock,
        history: null,
      };
    }

    const history = await createStockHistory(
      {
        name: stock.product.name,
        quantity: stock.stock,
        stockBefore: stock.stock,
        stockAfter: 0,
        product: {
          connect: {
            id: productId,
          },
        },
        store: {
          connect: {
            id: storeId,
          },
        },
        admin: {
          connect: {
            id: requester.id,
          },
        },
        type: "adjustmentOut",
        notes: params.notes,
      },
      tx,
    );

    const updatedStock = await updateStoreStockQuantity(stock.id, 0, tx);

    return {
      stock: updatedStock,
      history,
    };
  });
};
