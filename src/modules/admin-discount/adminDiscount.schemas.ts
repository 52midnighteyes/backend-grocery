import * as z from "zod";
import { DiscountType } from "../../../generated/prisma/enums.js";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const dateOnlyToStartOfDay = (value: unknown) => {
  if (typeof value === "string" && dateOnlyPattern.test(value)) {
    return `${value}T00:00:00.000Z`;
  }

  return value;
};

const dateOnlyToEndOfDay = (value: unknown) => {
  if (typeof value === "string" && dateOnlyPattern.test(value)) {
    return `${value}T23:59:59.999Z`;
  }

  return value;
};

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

const optionalUuidQuery = (message: string) =>
  z.preprocess(
    emptyStringToUndefined,
    z.uuid({ error: message }).optional(),
  );

const optionalStartDateQuery = z.preprocess(
  (value) => dateOnlyToStartOfDay(emptyStringToUndefined(value)),
  z.coerce.date().optional(),
);

const optionalEndDateQuery = z.preprocess(
  (value) => dateOnlyToEndOfDay(emptyStringToUndefined(value)),
  z.coerce.date().optional(),
);

const discountTypeSchema = z.enum([
  DiscountType.percentage,
  DiscountType.nominal,
  DiscountType.buyXGetY,
]);

const discountBodyBaseSchema = z.object({
  name: z.string().trim().min(1, "Discount name is required"),
  type: discountTypeSchema,
  value: z.coerce.number().int().positive().optional(),
  buyQuantity: z.coerce.number().int().positive().optional(),
  getQuantity: z.coerce.number().int().positive().optional(),
  quota: z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.number().int().positive().nullable().optional(),
  ),
  productId: z.uuid({ error: "Product ID is invalid" }),
  storeId: z.preprocess(
    emptyStringToUndefined,
    z.uuid({ error: "Store ID is invalid" }).optional(),
  ),
  startDate: z.preprocess(dateOnlyToStartOfDay, z.coerce.date()),
  endDate: z.preprocess(dateOnlyToEndOfDay, z.coerce.date()),
});

export const discountIdParamSchema = z.object({
  id: z.uuid({ error: "Discount ID is invalid" }),
});

export const getDiscountsQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    productId: optionalUuidQuery("Product ID is invalid"),
    storeId: optionalUuidQuery("Store ID is invalid"),
    type: z.preprocess(emptyStringToUndefined, discountTypeSchema.optional()),
    startDate: optionalStartDateQuery,
    endDate: optionalEndDateQuery,
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "type",
        "startDate",
        "endDate",
        "productName",
        "storeName",
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
      message: "Start date cannot be after end date",
      path: ["startDate"],
    },
  )
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export const createDiscountBodySchema = discountBodyBaseSchema.refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  },
);

export const updateDiscountBodySchema = discountBodyBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      data.startDate === undefined ||
      data.endDate === undefined ||
      data.startDate <= data.endDate,
    {
      message: "Start date cannot be after end date",
      path: ["startDate"],
    },
  );

export type TDiscountIdParam = z.infer<typeof discountIdParamSchema>;
export type TGetDiscountsQuery = z.infer<typeof getDiscountsQuerySchema>;
export type TCreateDiscountBody = z.infer<typeof createDiscountBodySchema>;
export type TUpdateDiscountBody = z.infer<typeof updateDiscountBodySchema>;
