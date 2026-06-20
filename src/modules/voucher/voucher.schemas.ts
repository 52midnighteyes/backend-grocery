import * as z from "zod";

export const storeVoucherParamSchema = z.object({
  storeId: z.uuid({ error: "Store ID is invalid" }),
});

export type TStoreVoucherParam = z.infer<typeof storeVoucherParamSchema>;
