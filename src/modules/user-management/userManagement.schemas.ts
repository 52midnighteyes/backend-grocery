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

export const managedUserIdParamSchema = z.object({
  id: z.uuid({ error: "User ID is invalid" }),
});

export const getManagedUsersQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    email: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    roleName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
    ),
    storeName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional()
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

export type TManagedUserIdParam = z.infer<typeof managedUserIdParamSchema>;
export type TGetManagedUsersQuery = z.infer<typeof getManagedUsersQuerySchema>;
