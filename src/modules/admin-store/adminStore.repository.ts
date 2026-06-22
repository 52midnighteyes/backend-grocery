import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findStoreById = async (id: string, db: TPrisma = prisma) =>
  db.store.findFirst({ where: { id, deletedAt: null } });

export const findStoreByName = async (name: string, db: TPrisma = prisma) =>
  db.store.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, deletedAt: null },
  });

export const findStoreByNameExceptId = async (
  name: string,
  id: string,
  db: TPrisma = prisma,
) =>
  db.store.findFirst({
    where: {
      id: { not: id },
      name: { equals: name, mode: "insensitive" },
      deletedAt: null,
    },
  });

export const createStore = async (
  data: { name: string; latitude?: string | null; longitude?: string | null },
  db: TPrisma = prisma,
) => db.store.create({ data });

export const updateStore = async (
  id: string,
  data: { name?: string; latitude?: string | null; longitude?: string | null },
  db: TPrisma = prisma,
) => db.store.update({ where: { id }, data });

export const softDeleteStore = async (id: string, db: TPrisma = prisma) =>
  db.store.update({ where: { id }, data: { deletedAt: new Date() } });

export const countStoreAdminsByStoreId = async (
  storeId: string,
  db: TPrisma = prisma,
) => db.user.count({ where: { storeId, deletedAt: null } });

export const unassignAdminsByStoreId = async (
  storeId: string,
  db: TPrisma = prisma,
) => db.user.updateMany({ where: { storeId, deletedAt: null }, data: { storeId: null } });

export const findAllActiveProductIds = async (db: TPrisma = prisma) =>
  db.product.findMany({ where: { deletedAt: null }, select: { id: true } });

export const seedStoreProductStocks = async (
  storeId: string,
  productIds: string[],
  db: TPrisma = prisma,
) =>
  db.productStock.createMany({
    data: productIds.map((productId) => ({ productId, storeId, stock: 0 })),
    skipDuplicates: true,
  });
