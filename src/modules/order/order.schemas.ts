import * as z from "zod";

export const orderItemSchema = z.object({
  productId: z.string().uuid("Product ID is not valid"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  discountId: z.string().uuid("Discount ID is not valid").optional(),
});

export const createOrderSchema = z.object({
  storeId: z.string().uuid("Store ID is not valid"),
  addressId: z.string().uuid("Address ID is not valid"),
  shippingVendor: z.string().nonempty("Shipping vendor is required"),
  deliveryFee: z
    .number({ error: "Delivery fee must be a number" })
    .int("Delivery fee must be a whole number")
    .min(0, "Delivery fee cannot be negative"),
  voucherId: z.string().uuid("Voucher ID is not valid").optional(),
  deliveryVoucherId: z
    .string()
    .uuid("Delivery voucher ID is not valid")
    .optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
});

export const getOrdersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .pipe(z.number().int().min(1, "Page must be at least 1")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .pipe(z.number().int().min(1).max(100)),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const orderParamsSchema = z.object({
  orderId: z.string().uuid("Order ID is not valid"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["cancel", "confirmed"], {
    error: "Status must be either 'cancel' or 'confirmed'",
  }),
});

export type TCreateOrderSchema = z.infer<typeof createOrderSchema>;
export type TGetOrdersQuerySchema = z.infer<typeof getOrdersQuerySchema>;
export type TOrderParamsSchema = z.infer<typeof orderParamsSchema>;
export type TUpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;