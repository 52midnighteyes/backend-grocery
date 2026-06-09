import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional()
);

export const storeIdParamSchema = z.object({
  id: z.uuid({ error: "Store ID is invalid" }),
});

export const getNearestStoreQuerySchema = z.object({
  lat: z.coerce
    .number({ error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce
    .number({ error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export const getStoresQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    sortBy: z
      .enum(["name", "createdAt", "updatedAt"])
      .optional()
      .default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TStoreIdParam = z.infer<typeof storeIdParamSchema>;
export type TGetStoresQuery = z.infer<typeof getStoresQuerySchema>;
export type TGetNearestStoreQuery = z.infer<typeof getNearestStoreQuerySchema>;
