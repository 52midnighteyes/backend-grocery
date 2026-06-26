import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value: string) => {
  if (!dateOnlyPattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const optionalUuidQuery = (message: string) =>
  z.preprocess(
    emptyStringToUndefined,
    z.uuid({ error: message }).optional(),
  );

const optionalDateQuery = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .refine(isValidDateOnly, "Date must use YYYY-MM-DD format")
    .optional(),
);

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

const optionalBooleanQuery = z.preprocess((value) => {
  if (value === "") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const optionalSearchQuery = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const salesReportQueryBaseSchema = z.object({
  granularity: z
    .enum(["daily", "monthly", "yearly"])
    .optional()
    .default("monthly"),
  storeId: optionalUuidQuery("Store ID is invalid"),
  startDate: optionalDateQuery,
  endDate: optionalDateQuery,
});

const dateRangeRefinement = (data: {
  startDate?: string;
  endDate?: string;
}) =>
  data.startDate === undefined ||
  data.endDate === undefined ||
  data.startDate <= data.endDate;

export const salesReportQuerySchema = salesReportQueryBaseSchema.refine(
  dateRangeRefinement,
  {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  },
);

export const salesReportProductTrendQuerySchema = salesReportQueryBaseSchema
  .extend({
    categoryId: optionalUuidQuery("Category ID is invalid"),
    q: optionalSearchQuery,
    limit: optionalNumberQuery.default(8),
    includeOthers: optionalBooleanQuery.default(true),
  })
  .refine(dateRangeRefinement, {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 50),
  }));

export const salesReportProductRankingQuerySchema = salesReportQueryBaseSchema
  .extend({
    categoryId: optionalUuidQuery("Category ID is invalid"),
    q: optionalSearchQuery,
    sortBy: z
      .enum(["productName", "totalItemsSold", "productSales"])
      .optional()
      .default("productSales"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(dateRangeRefinement, {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export const salesReportProductIdParamSchema = z.object({
  productId: z.uuid({ error: "Product ID is invalid" }),
});

export const salesReportCategoryIdParamSchema = z.object({
  categoryId: z.uuid({ error: "Category ID is invalid" }),
});

export const salesReportTransactionQuerySchema = salesReportQueryBaseSchema
  .extend({
    status: z
      .enum(["paid", "process", "onDelivery", "confirmed"])
      .optional(),
    q: optionalSearchQuery,
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(dateRangeRefinement, {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TSalesReportQuery = z.infer<typeof salesReportQuerySchema>;
export type TSalesReportProductTrendQuery = z.infer<
  typeof salesReportProductTrendQuerySchema
>;
export type TSalesReportProductRankingQuery = z.infer<
  typeof salesReportProductRankingQuerySchema
>;
export type TSalesReportProductIdParam = z.infer<
  typeof salesReportProductIdParamSchema
>;
export type TSalesReportCategoryIdParam = z.infer<
  typeof salesReportCategoryIdParamSchema
>;
export type TSalesReportTransactionQuery = z.infer<
  typeof salesReportTransactionQuerySchema
>;
