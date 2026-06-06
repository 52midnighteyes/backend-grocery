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

  if (query.q) {
    andConditions.push({
      OR: [{ name: { contains: query.q, mode: "insensitive" } }],
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
