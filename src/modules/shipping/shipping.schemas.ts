import * as z from "zod";

export const shippingCostQuerySchema = z.object({
  addressId: z.string().uuid("Address ID is not valid"),
});

export type TShippingCostQuery = z.infer<typeof shippingCostQuerySchema>;