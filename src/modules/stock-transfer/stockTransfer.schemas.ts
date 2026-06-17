import * as z from "zod";
import { StockTransferStatus } from "../../../generated/prisma/enums.js";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

const optionalDateQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.date().optional(),
);

export const stockTransferRequestParamSchema = z.object({
  id: z.uuid({ error: "Stock transfer request ID is invalid" }),
});

export const stockTransferStoreParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
});

export const stockTransferStoreRequestParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
  id: z.uuid({ error: "Stock transfer request ID is invalid" }),
});

export const getStockTransferSourcesQuerySchema = z.object({
  productId: z.uuid({ error: "Product ID is invalid" }),
  excludeStoreId: z.preprocess(
    emptyStringToUndefined,
    z.uuid({ error: "Excluded store ID is invalid" }).optional(),
  ),
});

export const stockTransferStatusSchema = z.enum([
  StockTransferStatus.pending,
  StockTransferStatus.approved,
  StockTransferStatus.rejected,
  StockTransferStatus.received,
  StockTransferStatus.cancelled,
]);

export const getStockTransferRequestsQuerySchema = z
  .object({
    status: z.preprocess(
      emptyStringToUndefined,
      stockTransferStatusSchema.optional(),
    ),
    productId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Product ID is invalid" }).optional(),
    ),
    storeId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Store ID is invalid" }).optional(),
    ),
    fromStoreId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Source store ID is invalid" }).optional(),
    ),
    toStoreId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Destination store ID is invalid" }).optional(),
    ),
    direction: z
      .preprocess(emptyStringToUndefined, z.enum(["incoming", "outgoing"]).optional()),
    startDate: optionalDateQuery,
    endDate: optionalDateQuery,
    sortBy: z
      .enum(["createdAt", "updatedAt", "productName", "quantity", "status"])
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

export const createStockTransferRequestBodySchema = z.object({
  productId: z.uuid({ error: "Product ID is invalid" }),
  fromStoreId: z.uuid({ error: "Source store ID is invalid" }),
  toStoreId: z.preprocess(
    emptyStringToUndefined,
    z.uuid({ error: "Destination store ID is invalid" }).optional(),
  ),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  notes: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  requestNotes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().optional(),
  ),
});

export const respondStockTransferRequestBodySchema = z.object({
  responseNotes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().optional(),
  ),
});

export const receiveStockTransferRequestBodySchema = z.object({
  receivedNotes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().optional(),
  ),
});

export const cancelStockTransferRequestBodySchema = z.object({
  cancelledNotes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().optional(),
  ),
});

export type TStockTransferRequestParam = z.infer<
  typeof stockTransferRequestParamSchema
>;
export type TStockTransferStoreParam = z.infer<
  typeof stockTransferStoreParamSchema
>;
export type TStockTransferStoreRequestParam = z.infer<
  typeof stockTransferStoreRequestParamSchema
>;
export type TGetStockTransferSourcesQuery = z.infer<
  typeof getStockTransferSourcesQuerySchema
>;
export type TGetStockTransferRequestsQuery = z.infer<
  typeof getStockTransferRequestsQuerySchema
>;
export type TCreateStockTransferRequestBody = z.infer<
  typeof createStockTransferRequestBodySchema
>;
export type TRespondStockTransferRequestBody = z.infer<
  typeof respondStockTransferRequestBodySchema
>;
export type TReceiveStockTransferRequestBody = z.infer<
  typeof receiveStockTransferRequestBodySchema
>;
export type TCancelStockTransferRequestBody = z.infer<
  typeof cancelStockTransferRequestBodySchema
>;
