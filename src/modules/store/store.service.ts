import { AppError } from "../../class/appError.js";
import {
  countStores,
  createStore,
  findStoreById,
  findStoreByName,
  findStoreByNameExceptId,
  findStores,
  softDeleteStore,
  updateStore,
} from "./store.repository.js";
import type {
  TCreateStoreBody,
  TGetStoresQuery,
  TUpdateStoreBody,
} from "./store.schemas.js";
import {
  buildPaginationMeta,
  buildStoreOrderBy,
  buildStoreWhere,
} from "./store.helper.js";

export const getStoresService = async (params: TGetStoresQuery) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStoreWhere(params);
  const orderBy = buildStoreOrderBy(params);

  const [stores, total] = await Promise.all([
    findStores(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countStores(where),
  ]);

  return {
    data: stores,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStoreByIdService = async (id: string) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  return store;
};

export const createStoreService = async (params: TCreateStoreBody) => {
  const existingStore = await findStoreByName(params.name);
  if (existingStore) throw new AppError(400, "Store name is already in use");

  return await createStore({
    name: params.name,
    latitude: params.latitude,
    longitude: params.longitude,
  });
};

export const updateStoreService = async (
  id: string,
  params: TUpdateStoreBody
) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  if (params.name) {
    const existingStore = await findStoreByNameExceptId(params.name, id);
    if (existingStore) throw new AppError(400, "Store name is already in use");
  }

  return await updateStore(id, {
    name: params.name,
    latitude: params.latitude,
    longitude: params.longitude,
  });
};

export const deleteStoreService = async (id: string) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  await softDeleteStore(id);
};
