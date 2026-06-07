import type { ProductStockFindManyArgs } from "../../../generated/prisma/models.js";

export type TFindManyStoreStockOptions = Pick<
  ProductStockFindManyArgs,
  "orderBy" | "skip" | "take"
>;
