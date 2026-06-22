import * as z from "zod";
import {
  VoucherDiscountType,
  VoucherType,
} from "../../../generated/prisma/enums.js";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const emptyStringToNull = (value: unknown) => (value === "" ? null : value);

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

const voucherDiscountTypeSchema = z.enum([
  VoucherDiscountType.percentage,
  VoucherDiscountType.nominal,
]);

const voucherTypeSchema = z.enum([VoucherType.transaction, VoucherType.delivery]);

const nullableOptionalNumberBody = z.preprocess(
  emptyStringToNull,
  z.coerce.number().int().nonnegative().nullable().optional(),
);

const nullableOptionalUuidBody = z.preprocess(
  emptyStringToNull,
  z.uuid({ error: "Store ID is invalid" }).nullable().optional(),
);

const voucherBodyBaseSchema = z.object({
  name: z.string().trim().min(1, "Voucher name is required"),
  code: z.string().trim().min(1, "Voucher code is required"),
  quantity: z.coerce.number().int().nonnegative(),
  storeId: nullableOptionalUuidBody,
  minimumTransaction: nullableOptionalNumberBody,
  maxDiscount: nullableOptionalNumberBody,
  discountType: voucherDiscountTypeSchema,
  voucherType: voucherTypeSchema,
  value: z.coerce.number().int().positive(),
  startDate: z.preprocess(dateOnlyToStartOfDay, z.coerce.date()),
  endDate: z.preprocess(dateOnlyToEndOfDay, z.coerce.date()),
});

export const voucherIdParamSchema = z.object({
  id: z.uuid({ error: "Voucher ID is invalid" }),
});

export const getVouchersQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    code: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    storeId: optionalUuidQuery("Store ID is invalid"),
    discountType: z.preprocess(
      emptyStringToUndefined,
      voucherDiscountTypeSchema.optional(),
    ),
    voucherType: z.preprocess(emptyStringToUndefined, voucherTypeSchema.optional()),
    startDate: optionalStartDateQuery,
    endDate: optionalEndDateQuery,
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "code",
        "quantity",
        "startDate",
        "endDate",
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

export const createVoucherBodySchema = voucherBodyBaseSchema.refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  },
);

export const updateVoucherBodySchema = voucherBodyBaseSchema
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

export type TVoucherIdParam = z.infer<typeof voucherIdParamSchema>;
export type TGetVouchersQuery = z.infer<typeof getVouchersQuerySchema>;
export type TCreateVoucherBody = z.infer<typeof createVoucherBodySchema>;
export type TUpdateVoucherBody = z.infer<typeof updateVoucherBodySchema>;
