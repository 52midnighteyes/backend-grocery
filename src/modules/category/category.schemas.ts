import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

export const categoryIdParamSchema = z.object({
  id: z.uuid({ error: "Category ID is invalid" }),
});

export const getCategoriesQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional().default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TCategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type TGetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
