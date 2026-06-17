import {
  ProductStockWhereInput,
  StockTransferRequestCreateInput,
  StockTransferRequestOrderByWithRelationInput,
  StockTransferRequestUncheckedUpdateManyInput,
  StockTransferRequestWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import {
  stockTransferRequestInclude,
  stockTransferSourceInclude,
} from "./stockTransfer.helper.js";

export const findStockTransferSources = async (
  where: ProductStockWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.productStock.findMany({
    where,
    include: stockTransferSourceInclude,
    orderBy: [{ stock: "desc" }, { store: { name: "asc" } }],
  });
};

export const createStockTransferRequest = async (
  data: StockTransferRequestCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.stockTransferRequest.create({
    data,
    include: stockTransferRequestInclude,
  });
};

export const findStockTransferRequests = async (
  where: StockTransferRequestWhereInput,
  options: {
    skip?: number;
    take?: number;
    orderBy?:
      | StockTransferRequestOrderByWithRelationInput
      | StockTransferRequestOrderByWithRelationInput[];
  } = {},
  db: TPrisma = prisma,
) => {
  return await db.stockTransferRequest.findMany({
    where,
    include: stockTransferRequestInclude,
    orderBy: options.orderBy ?? { createdAt: "desc" },
    ...options,
  });
};

export const countStockTransferRequests = async (
  where: StockTransferRequestWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.stockTransferRequest.count({ where });
};

export const findStockTransferRequestById = async (
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.stockTransferRequest.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: stockTransferRequestInclude,
  });
};

export const updateStockTransferRequestStatus = async (
  id: string,
  currentStatus: "pending" | "approved",
  data: StockTransferRequestUncheckedUpdateManyInput,
  db: TPrisma = prisma,
) => {
  return await db.stockTransferRequest.updateMany({
    where: {
      id,
      status: currentStatus,
      deletedAt: null,
    },
    data,
  });
};
