import { AppError } from "../../class/appError.js";
import { STORE_MAX_RADIUS_KM } from "../../config/config.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import {
  countStores,
  findMainStore,
  findStoreById,
  findStoreOptions,
  findStores,
  findStoresWithCoordinates,
} from "./store.repository.js";
import type { TGetStoresQuery } from "./store.schemas.js";
import {
  buildStoreOrderBy,
  buildStoreWhere,
  pickNearestStore,
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

export const getStoreOptionsService = async () => {
  return await findStoreOptions();
};

export const getStoreByIdService = async (id: string) => {
  const store = await findStoreById(id);
  if (!store) throw new AppError(404, "Store was not found");

  return store;
};

export const getNearestStoreService = async (lat: number, lng: number) => {
  const stores = await findStoresWithCoordinates();
  const nearest = pickNearestStore(stores, lat, lng); //pertimbangan pengelolaan pakai store procedure/dari prisma level
  if (!nearest) throw new AppError(404, "No store with coordinates was found");

  return {
    store: nearest.store,
    distanceKm: nearest.distanceKm,
    outOfRange: nearest.distanceKm > STORE_MAX_RADIUS_KM,
  };
};

export const getMainStoreService = async () => {
  // Prefer the flagged main store; if none is flagged yet, fall back to the
  // oldest store so the homepage still has something to show.
  const [fallback] = await findStores(
    { deletedAt: null },
    { orderBy: { createdAt: "asc" }, take: 1 }
  );
  const store = (await findMainStore()) ?? fallback;
  if (!store) throw new AppError(404, "Main store has not been configured");

  return store;
};
