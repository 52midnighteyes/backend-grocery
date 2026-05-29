import * as zod from "zod";

export const createProductSchema = zod.object({
  name: zod.string().nonempty("Product name is required").trim(),
  categoryId: zod
    .uuid({ error: "Category ID is invalid" })
    .nonempty("Category ID is required"),
  brand: zod.string().trim().nullish(),
  description: zod.string().trim().nullish(),
  variant: zod.string().trim().nullish(),
  size: zod.string().trim().nullish(),
  price: zod.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    zod
      .number({ error: "Price must be a number" })
      .positive("Price must be a positive number")
  ),
});

export type TCreateProductParams = zod.infer<typeof createProductSchema>;
