import * as z from "zod";
import { VoucherType } from "../../../generated/prisma/enums.js";

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

const reportDateRangeRefinement = <
  T extends { startDate?: Date; endDate?: Date },
>(
  data: T,
) =>
  data.startDate === undefined ||
  data.endDate === undefined ||
  data.startDate <= data.endDate;

export const getDiscountReportsQuerySchema = z
  .object({
    storeId: optionalUuidQuery("Store ID is invalid"),
    productId: optionalUuidQuery("Product ID is invalid"),
    discountId: optionalUuidQuery("Discount ID is invalid"),
    startDate: optionalStartDateQuery,
    endDate: optionalEndDateQuery,
    sortBy: z
      .enum(["createdAt", "discountName", "discountAmount"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(reportDateRangeRefinement, {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export const getVoucherReportsQuerySchema = z
  .object({
    storeId: optionalUuidQuery("Store ID is invalid"),
    voucherId: optionalUuidQuery("Voucher ID is invalid"),
    voucherType: z.preprocess(
      emptyStringToUndefined,
      z.enum([VoucherType.transaction, VoucherType.delivery]).optional(),
    ),
    startDate: optionalStartDateQuery,
    endDate: optionalEndDateQuery,
    sortBy: z
      .enum([
        "createdAt",
        "voucherName",
        "voucherDiscountAmount",
        "deliveryVoucherName",
        "deliveryVoucherAmount",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .refine(reportDateRangeRefinement, {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TGetDiscountReportsQuery = z.infer<
  typeof getDiscountReportsQuerySchema
>;
export type TGetVoucherReportsQuery = z.infer<
  typeof getVoucherReportsQuerySchema
>;
