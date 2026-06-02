import {
  StoreFindManyArgs,
  StoreWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";

type TFindManyStoreOptions = Pick<
  StoreFindManyArgs,
  "orderBy" | "skip" | "take"
>;

export const findStoreById = async (id: string, db: TPrisma = prisma) => {
  return await db.store.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const findStores = async (
  where: StoreWhereInput = { deletedAt: null },
  options: TFindManyStoreOptions = {},
  db: TPrisma = prisma
) => {
  return await db.store.findMany({
    where,
    ...options,
  });
};

export const findStoreOptions = async (db: TPrisma = prisma) => {
  return await db.store.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const countStores = async (
  where: StoreWhereInput,
  db: TPrisma = prisma
) => {
  return await db.store.count({ where });
};
