import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

const optionalNonNegativeNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().nonnegative().optional(),
);

const optionalBooleanQuery = z.preprocess((value) => {
  if (value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const storeStockParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
});

export const storeProductStockParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
  slug: z.string().min(1, "Product slug is required").trim(),
});

export const getStoreStocksQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    productName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
    sku: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    brand: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    categoryId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Category ID is invalid" }).optional(),
    ),
    categoryName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
    minStock: optionalNonNegativeNumberQuery,
    maxStock: optionalNonNegativeNumberQuery,
    inStock: optionalBooleanQuery,
    sortBy: z
      .enum([
        "stock",
        "productName",
        "sku",
        "brand",
        "categoryName",
        "createdAt",
        "updatedAt",
      ])
      .optional()
      .default("productName"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(
    (data) =>
      data.minStock === undefined ||
      data.maxStock === undefined ||
      data.minStock <= data.maxStock,
    {
      message: "Minimum stock cannot be greater than maximum stock",
      path: ["minStock"],
    },
  )
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TStoreStockParam = z.infer<typeof storeStockParamSchema>;
export type TStoreProductStockParam = z.infer<
  typeof storeProductStockParamSchema
>;
export type TGetStoreStocksQuery = z.infer<typeof getStoreStocksQuerySchema>;
