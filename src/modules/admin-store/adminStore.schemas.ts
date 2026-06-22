import * as z from "zod";

export const adminStoreIdParamSchema = z.object({
  id: z.uuid({ error: "Store ID is invalid" }),
});

const coordinateField = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || (!isNaN(Number(v)) && isFinite(Number(v))),
    { message: "Must be a valid decimal number" },
  )
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

export const createStoreBodySchema = z.object({
  name: z.string().min(1, "Store name is required").trim(),
  latitude: coordinateField,
  longitude: coordinateField,
});

export const updateStoreBodySchema = z
  .object({
    name: z.string().min(1, "Store name is required").trim().optional(),
    latitude: coordinateField,
    longitude: coordinateField,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type TAdminStoreIdParam = z.infer<typeof adminStoreIdParamSchema>;
export type TCreateStoreBody = z.infer<typeof createStoreBodySchema>;
export type TUpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
