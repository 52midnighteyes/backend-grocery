import * as z from "zod";

export const dashboardStoreIdParamSchema = z.object({
  id: z.uuid({ error: "Store ID is invalid" }),
});

export type TDashboardStoreIdParam = z.infer<
  typeof dashboardStoreIdParamSchema
>;
