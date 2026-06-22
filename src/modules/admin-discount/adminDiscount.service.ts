import { Prisma } from "../../../generated/prisma/client.js";
import type {
  DiscountCreateInput,
  DiscountUpdateInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import { getAdminRequester } from "../admin-auth/adminRequester.service.js";
import { findStoreStockByProductId } from "../stock/stock.repository.js";
import {
  assertDiscountStoreAccess,
  buildDiscountOrderBy,
  buildDiscountTypeData,
  buildDiscountWhere,
  resolveDiscountStoreId,
} from "./adminDiscount.helper.js";
import {
  countDiscounts,
  createDiscount,
  findActiveDiscountOverlap,
  findDiscountById,
  findDiscounts,
  softDeleteDiscount,
  updateDiscount,
} from "./adminDiscount.repository.js";
import type {
  TCreateDiscountBody,
  TGetDiscountsQuery,
  TUpdateDiscountBody,
} from "./adminDiscount.schemas.js";

const assertStoreProductStockExists = async (
  storeId: string,
  productId: string,
  db: TPrisma = prisma
) => {
  const stock = await findStoreStockByProductId(storeId, productId, db);
  if (!stock) throw new AppError(404, "Product stock was not found");

  return stock;
};

const assertNoDiscountOverlap = async (
  params: {
    productId: string;
    storeId: string;
    startDate: Date;
    endDate: Date;
    excludeId?: string;
  },
  db: TPrisma = prisma
) => {
  const overlap = await findActiveDiscountOverlap(params, db);
  if (overlap) {
    throw new AppError(
      400,
      "Discount overlaps with another active discount for this product and store"
    );
  }
};

const assertDiscountQuotaValid = (
  quota: number | null | undefined,
  usedQuota: number
) => {
  if (quota !== undefined && quota !== null && quota < usedQuota) {
    throw new AppError(400, "Discount quota cannot be less than used quota");
  }
};

export const getDiscountsService = async (
  params: TGetDiscountsQuery,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const scopedStoreId =
    requester.role.name === "storeAdmin" ? requester.storeId ?? "" : undefined;

  if (requester.role.name === "storeAdmin" && !scopedStoreId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildDiscountWhere(params, scopedStoreId);
  const orderBy = buildDiscountOrderBy(params);

  const [discounts, total] = await Promise.all([
    findDiscounts(where, { skip, take: limit, orderBy }),
    countDiscounts(where),
  ]);

  return {
    data: discounts,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getDiscountService = async (id: string, requesterId: string) => {
  const requester = await getAdminRequester(requesterId);
  const discount = await findDiscountById(id);
  if (!discount) throw new AppError(404, "Discount was not found");

  assertDiscountStoreAccess(requester, discount.storeId);

  return discount;
};

export const createDiscountService = async (
  params: TCreateDiscountBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const storeId = resolveDiscountStoreId(requester, params.storeId);

  const typeData = buildDiscountTypeData(params);
  assertDiscountQuotaValid(params.quota, 0);

  const data: DiscountCreateInput = {
    name: params.name,
    type: params.type,
    ...typeData,
    quota: params.quota,
    startDate: params.startDate,
    endDate: params.endDate,
    product: {
      connect: {
        id: params.productId,
      },
    },
    store: {
      connect: {
        id: storeId,
      },
    },
  };

  return await prisma.$transaction(
    async (tx) => {
      await assertStoreProductStockExists(storeId, params.productId, tx);
      await assertNoDiscountOverlap(
        {
          productId: params.productId,
          storeId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
        tx
      );

      return await createDiscount(data, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};

export const updateDiscountService = async (
  id: string,
  params: TUpdateDiscountBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const discount = await findDiscountById(id);
  if (!discount) throw new AppError(404, "Discount was not found");

  assertDiscountStoreAccess(requester, discount.storeId);

  const nextStoreId =
    requester.role.name === "storeAdmin"
      ? discount.storeId
      : params.storeId ?? discount.storeId;
  const nextProductId = params.productId ?? discount.productId;
  const nextStartDate = params.startDate ?? discount.startDate;
  const nextEndDate = params.endDate ?? discount.endDate;
  const nextType = params.type ?? discount.type;
  const nextTypeValues = {
    type: nextType,
    value: params.type
      ? params.value
      : params.value ?? discount.value ?? undefined,
    buyQuantity: params.type
      ? params.buyQuantity
      : params.buyQuantity ?? discount.buyQuantity ?? undefined,
    getQuantity: params.type
      ? params.getQuantity
      : params.getQuantity ?? discount.getQuantity ?? undefined,
  };

  if (nextStartDate > nextEndDate) {
    throw new AppError(400, "Start date cannot be after end date");
  }

  const typeData = buildDiscountTypeData(nextTypeValues);
  assertDiscountQuotaValid(params.quota, discount.usedQuota);

  const data: DiscountUpdateInput = {
    name: params.name,
    type: params.type,
    ...typeData,
    quota: params.quota,
    startDate: params.startDate,
    endDate: params.endDate,
    product: params.productId
      ? {
          connect: {
            id: params.productId,
          },
        }
      : undefined,
    store:
      requester.role.name === "superAdmin" && params.storeId
        ? {
            connect: {
              id: params.storeId,
            },
          }
        : undefined,
  };

  return await prisma.$transaction(
    async (tx) => {
      await assertStoreProductStockExists(nextStoreId, nextProductId, tx);
      await assertNoDiscountOverlap(
        {
          productId: nextProductId,
          storeId: nextStoreId,
          startDate: nextStartDate,
          endDate: nextEndDate,
          excludeId: id,
        },
        tx
      );

      return await updateDiscount(id, data, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};

export const deleteDiscountService = async (
  id: string,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const discount = await findDiscountById(id);
  if (!discount) throw new AppError(404, "Discount was not found");

  assertDiscountStoreAccess(requester, discount.storeId);

  return await softDeleteDiscount(id);
};
