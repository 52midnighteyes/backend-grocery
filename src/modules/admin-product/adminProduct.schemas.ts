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

const optionalStringBody = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().optional(),
);

const optionalNullableStringBody = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().nullable().optional(),
);

const positionsBody = z.preprocess((value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return trimmed.split(",").map((position) => position.trim());
    }
  }

  return value;
}, z.array(z.coerce.number().int().positive()).min(1).max(5));

const imagePositionSchema = z.object({
  id: z.uuid({ error: "Product image ID is invalid" }),
  position: z.coerce.number().int().positive(),
});

const existingImagesBody = z.preprocess((value) => {
  if (value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}, z.array(imagePositionSchema).max(5).default([]));

const imagePositionsBody = z.preprocess((value) => {
  if (value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return trimmed.split(",").map((position) => position.trim());
    }
  }

  return value;
}, z.array(z.coerce.number().int().positive()).max(5).default([]));

export const patchProductImagesBodySchema = z.object({
  existingImages: existingImagesBody,
  newImagePositions: imagePositionsBody,
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1, "Product slug is required").trim(),
});

export const productImageParamSchema = z.object({
  slug: z.string().min(1, "Product slug is required").trim(),
  imageId: z.uuid({ error: "Product image ID is invalid" }),
});

export const getAdminProductsQuerySchema = z
  .object({
    q: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    name: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    slug: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    sku: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    brand: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    variant: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    size: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    categoryName: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
    categoryId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Category ID is invalid" }).optional(),
    ),
    storeId: z.preprocess(
      emptyStringToUndefined,
      z.uuid({ error: "Store ID is invalid" }).optional(),
    ),
    minPrice: optionalNonNegativeNumberQuery,
    maxPrice: optionalNonNegativeNumberQuery,
    minStock: optionalNonNegativeNumberQuery,
    maxStock: optionalNonNegativeNumberQuery,
    inStock: optionalBooleanQuery,
    sortBy: z
      .enum([
        "name",
        "slug",
        "sku",
        "brand",
        "price",
        "categoryName",
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
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"],
    },
  )
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

export const createProductBodySchema = z.object({
  name: z.string().min(1, "Product name is required").trim(),
  categoryId: z.uuid({ error: "Category ID is invalid" }),
  brand: optionalStringBody,
  variant: optionalStringBody,
  size: optionalStringBody,
  description: optionalStringBody,
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  weight: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive("Weight must be greater than 0").optional(),
  ),
  positions: positionsBody,
});

export const updateProductBodySchema = z
  .object({
    name: z.string().min(1, "Product name is required").trim().optional(),
    categoryId: z.uuid({ error: "Category ID is invalid" }).optional(),
    brand: optionalNullableStringBody,
    variant: optionalNullableStringBody,
    size: optionalNullableStringBody,
    description: optionalNullableStringBody,
    price: z.coerce
      .number()
      .int()
      .positive("Price must be greater than 0")
      .optional(),
    weight: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().positive("Weight must be greater than 0").optional(),
    ),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const updateProductImagePositionsBodySchema = z.object({
  images: z
    .array(
      z.object({
        id: z.uuid({ error: "Product image ID is invalid" }),
        position: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "At least one product image position is required")
    .max(5, "Product images cannot be more than 5"),
});

export type TProductSlugParam = z.infer<typeof productSlugParamSchema>;
export type TGetAdminProductsQuery = z.infer<
  typeof getAdminProductsQuerySchema
>;
export type TCreateProductBody = z.infer<typeof createProductBodySchema>;
export type TUpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type TUpdateProductImagePositionsBody = z.infer<
  typeof updateProductImagePositionsBodySchema
>;
export type TPatchProductImagesBody = z.infer<
  typeof patchProductImagesBodySchema
>;
export type TProductImageParam = z.infer<typeof productImageParamSchema>;
