import * as z from "zod";
import { StockMovement } from "../../../generated/prisma/enums.js";

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

export const storeProductStockMovementParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
  productId: z.uuid({ error: "Product ID is invalid" }),
});

export const storeStockMovementDetailParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
  historyId: z.uuid({ error: "Stock history ID is invalid" }),
});

export const stockMovementSchema = z.enum([
  StockMovement.purchase,
  StockMovement.sale,
  StockMovement.returnIn,
  StockMovement.returnOut,
  StockMovement.adjustmentIn,
  StockMovement.adjustmentOut,
  StockMovement.transferIn,
  StockMovement.transferOut,
  StockMovement.damaged,
  StockMovement.expired,
  StockMovement.lost,
]);

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

export const getStockMovementsQuerySchema = z
  .object({
    productId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Product ID is invalid" }).optional(),
    ),
    type: z.preprocess(emptyStringToUndefined, stockMovementSchema.optional()),
    startDate: z.preprocess(
      emptyStringToUndefined,
      z.coerce.date().optional(),
    ),
    endDate: z.preprocess(emptyStringToUndefined, z.coerce.date().optional()),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "type",
        "quantity",
        "stockBefore",
        "stockAfter",
        "productName",
        "storeName",
        "adminName",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(
    (data) =>
      data.startDate === undefined ||
      data.endDate === undefined ||
      data.startDate <= data.endDate,
    {
      message: "Start date cannot be greater than end date",
      path: ["startDate"],
    },
  )
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export const createStockMovementBodySchema = z.object({
  type: stockMovementSchema,
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  notes: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
});

export const clearStockBodySchema = z.object({
  notes: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
});

export type TStoreStockParam = z.infer<typeof storeStockParamSchema>;
export type TStoreProductStockParam = z.infer<
  typeof storeProductStockParamSchema
>;
export type TStoreProductStockMovementParam = z.infer<
  typeof storeProductStockMovementParamSchema
>;
export type TStoreStockMovementDetailParam = z.infer<
  typeof storeStockMovementDetailParamSchema
>;
export type TGetStoreStocksQuery = z.infer<typeof getStoreStocksQuerySchema>;
export type TGetStockMovementsQuery = z.infer<
  typeof getStockMovementsQuerySchema
>;
export type TCreateStockMovementBody = z.infer<
  typeof createStockMovementBodySchema
>;
export type TClearStockBody = z.infer<typeof clearStockBodySchema>;
