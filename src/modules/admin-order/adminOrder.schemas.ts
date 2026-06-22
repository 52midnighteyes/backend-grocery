import * as z from "zod";

export  const adminGetOrdersQuerySchema = z.object({
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
    storeId: z.string().uuid("Store ID is not valid").optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
});

export const adminOrderParamsSchema = z.object({
    orderId: z.string().uuid("Order Id is not valid"),
});

export const confirmPaymentBodySchema = z.object({
    action: z.enum(["approve", "reject"], {
        error: "Action must be either 'approve' or 'reject'",
    }),
});

export type TAdminGetOrderQuerySchema = z.infer<typeof adminGetOrdersQuerySchema>;
export type TAdminOrderParamsSchema = z.infer<typeof adminOrderParamsSchema>;
export type TConfirmPaymentBodySchema = z.infer<typeof confirmPaymentBodySchema>;