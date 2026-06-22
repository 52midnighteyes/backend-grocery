import { AppError } from "../../class/appError.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import {
  findStoreById,
  findStoreByName,
  findStoreByNameExceptId,
  createStore,
  updateStore,
  softDeleteStore,
  unassignAdminsByStoreId,
  findAllActiveProductIds,
  seedStoreProductStocks,
} from "./adminStore.repository.js";
import type { TCreateStoreBody, TUpdateStoreBody } from "./adminStore.schemas.js";

export const createStoreService = async (params: TCreateStoreBody) => {
  const existing = await findStoreByName(params.name);
  if (existing) throw new AppError(400, "Store name is already in use");

  return prisma.$transaction(async (tx) => {
    const store = await createStore(
      { name: params.name, latitude: params.latitude ?? null, longitude: params.longitude ?? null },
      tx,
    );

    const products = await findAllActiveProductIds(tx);
    if (products.length > 0) {
      await seedStoreProductStocks(store.id, products.map((p) => p.id), tx);
    }

    return store;
  });
};

export const updateStoreService = async (id: string, params: TUpdateStoreBody) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  if (params.name && params.name !== store.name) {
    const conflict = await findStoreByNameExceptId(params.name, id);
    if (conflict) throw new AppError(400, "Store name is already in use");
  }

  return updateStore(id, {
    name: params.name,
    latitude: params.latitude,
    longitude: params.longitude,
  });
};

export const deleteStoreService = async (id: string) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  await unassignAdminsByStoreId(id);
  await softDeleteStore(id);
  return store;
};
