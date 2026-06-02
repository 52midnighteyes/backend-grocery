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

const latitudeSchema = z.coerce
  .number()
  .min(-90, "Latitude is too small")
  .max(90, "Latitude is too large");

const longitudeSchema = z.coerce
  .number()
  .min(-180, "Longitude is too small")
  .max(180, "Longitude is too large");

export const getStoresQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
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

export const createStoreBodySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
});

export const updateStoreBodySchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    latitude: latitudeSchema.nullable().optional(),
    longitude: longitudeSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type TStoreIdParam = z.infer<typeof storeIdParamSchema>;
export type TGetStoresQuery = z.infer<typeof getStoresQuerySchema>;
export type TCreateStoreBody = z.infer<typeof createStoreBodySchema>;
export type TUpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
