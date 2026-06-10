import {
  StoreOrderByWithRelationInput,
  StoreWhereInput,
} from "../../../generated/prisma/models.js";
import { haversineDistanceKm } from "../../helper/geo.js";
import type { findStoresWithCoordinates } from "./store.repository.js";
import type { TGetStoresQuery } from "./store.schemas.js";

// Infer the store shape straight from the repository return type, so this
// helper stays in sync if the query's selected fields ever change.
type TStoreWithCoordinates = Awaited<
  ReturnType<typeof findStoresWithCoordinates>
>[number];

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

// Given the user's coordinates, return the closest store and its distance (km).
// latitude/longitude are Prisma Decimal, so we convert them with Number().
export const pickNearestStore = (
  stores: TStoreWithCoordinates[],
  lat: number,
  lng: number
) => {
  let nearest: { store: TStoreWithCoordinates; distanceKm: number } | null =
    null;

  for (const store of stores) {
    const distanceKm = haversineDistanceKm(
      lat,
      lng,
      Number(store.latitude),
      Number(store.longitude)
    );

    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { store, distanceKm };
    }
  }

  return nearest;
};
