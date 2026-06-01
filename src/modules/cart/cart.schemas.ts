import * as z from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Product ID is not valid"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  storeId: z.string().uuid("Store ID is not valid"),
});

export const updateCartSchema = z.object({
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const cartItemParamsSchema = z.object({
  cartItemId: z.string().uuid("Cart item ID is not valid"),
});

export type TAddToCartSchema = z.infer<typeof addToCartSchema>;
export type TUpdateCartSchema = z.infer<typeof updateCartSchema>;
export type TCartItemParams = z.infer<typeof cartItemParamsSchema>;