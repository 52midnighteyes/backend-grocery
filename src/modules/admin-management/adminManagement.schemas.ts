import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalNumberQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional()
);

const optionalBooleanQuery = z.preprocess((value) => {
  if (value === "") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.coerce.boolean().optional());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const adminAccountIdParamSchema = z.object({
  id: z.uuid({ error: "Admin account ID is invalid" }),
});

export const getAdminAccountsQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    email: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    roleName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
    ),
    roleId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Role ID is invalid" }).optional()
    ),
    storeName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
    ),
    storeId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Store ID is invalid" }).optional()
    ),
    isVerified: optionalBooleanQuery,
    sortBy: z
      .enum([
        "name",
        "email",
        "roleName",
        "storeName",
        "createdAt",
        "updatedAt",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: optionalNumberQuery.default(1),
    limit: optionalNumberQuery.default(10),
  })
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export const createAdminAccountBodySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Email format is invalid"),
  password: passwordSchema,
  roleId: z.uuid({ error: "Role ID is invalid" }),
  storeId: z.uuid({ error: "Store ID is invalid" }).optional(),
});

export const updateAdminAccountBodySchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    email: z.email("Email format is invalid").optional(),
    password: passwordSchema.optional(),
    roleId: z.uuid({ error: "Role ID is invalid" }).optional(),
    storeId: z.uuid({ error: "Store ID is invalid" }).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type TAdminAccountIdParam = z.infer<typeof adminAccountIdParamSchema>;
export type TGetAdminAccountsQuery = z.infer<
  typeof getAdminAccountsQuerySchema
>;
export type TCreateAdminAccountBody = z.infer<
  typeof createAdminAccountBodySchema
>;
export type TUpdateAdminAccountBody = z.infer<
  typeof updateAdminAccountBodySchema
>;
