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

const optionalDateQuery = z.preprocess(
  emptyStringToUndefined,
  z.coerce.date().optional()
);

export const managedUserIdParamSchema = z.object({
  id: z.uuid({ error: "User ID is invalid" }),
});

export const getManagedUsersQuerySchema = z
  .object({
    id: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "User ID is invalid" }).optional()
    ),
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    email: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    roleId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Role ID is invalid" }).optional()
    ),
    roleName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
    ),
    storeId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Store ID is invalid" }).optional()
    ),
    storeName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
    ),
    isVerified: optionalBooleanQuery,
    createdFrom: optionalDateQuery,
    createdTo: optionalDateQuery,
    updatedFrom: optionalDateQuery,
    updatedTo: optionalDateQuery,
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
  .refine(
    (data) =>
      !data.createdFrom ||
      !data.createdTo ||
      data.createdFrom <= data.createdTo,
    {
      message: "createdFrom must be before createdTo",
      path: ["createdFrom"],
    }
  )
  .refine(
    (data) =>
      !data.updatedFrom ||
      !data.updatedTo ||
      data.updatedFrom <= data.updatedTo,
    {
      message: "updatedFrom must be before updatedTo",
      path: ["updatedFrom"],
    }
  )
  .transform((data) => ({
    ...data,
    limit: Math.min(data.limit, 100),
  }));

export type TManagedUserIdParam = z.infer<typeof managedUserIdParamSchema>;
export type TGetManagedUsersQuery = z.infer<typeof getManagedUsersQuerySchema>;
