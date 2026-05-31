import {
  StoreOrderByWithRelationInput,
  StoreWhereInput,
} from "../../../generated/prisma/models.js";
import type { TGetStoresQuery } from "./store.schemas.js";

export const buildStoreWhere = (query: TGetStoresQuery): StoreWhereInput => {
  const where: StoreWhereInput = {
    deletedAt: null,
  };

  const andConditions: StoreWhereInput[] = [];

  if (query.id) {
    andConditions.push({ id: query.id });
  }

  if (query.q) {
    andConditions.push({
      OR: [{ name: { contains: query.q, mode: "insensitive" } }],
    });
  }

  if (query.name) {
    andConditions.push({
      name: { contains: query.name, mode: "insensitive" },
    });
  }

  if (query.createdFrom || query.createdTo) {
    andConditions.push({
      createdAt: {
        gte: query.createdFrom,
        lte: query.createdTo,
      },
    });
  }

  if (query.updatedFrom || query.updatedTo) {
    andConditions.push({
      updatedAt: {
        gte: query.updatedFrom,
        lte: query.updatedTo,
      },
    });
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  return where;
};

export const buildStoreOrderBy = (
  query: TGetStoresQuery
): StoreOrderByWithRelationInput => {
  return {
    [query.sortBy]: query.sortOrder,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
