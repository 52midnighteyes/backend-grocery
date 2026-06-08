import * as z from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

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

export const productImageParamSchema = z.object({
  slug: z.string().min(1, "Product slug is required").trim(),
  imageId: z.uuid({ error: "Product image ID is invalid" }),
});

export type TPatchProductImagesBody = z.infer<
  typeof patchProductImagesBodySchema
>;
export type TProductImageParam = z.infer<typeof productImageParamSchema>;
