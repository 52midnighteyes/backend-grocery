import * as z from "zod";

export const adminCategoryIdParamSchema = z.object({
  id: z.uuid({ error: "Category ID is invalid" }),
});

export const createCategoryBodySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
});

export const updateCategoryBodySchema = z
  .object({
    name: z.string().min(1, "Category name is required").trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type TAdminCategoryIdParam = z.infer<typeof adminCategoryIdParamSchema>;
export type TCreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
export type TUpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
