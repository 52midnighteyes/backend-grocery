import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import {
  countStores,
  findStoreById,
  findStoreOptions,
  findStores,
} from "./store.repository.js";
import type { TGetStoresQuery } from "./store.schemas.js";
import { buildStoreOrderBy, buildStoreWhere } from "./store.helper.js";

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
