import type {
  ProductFindManyArgs,
  ProductWhereInput,
} from "../../../generated/prisma/models.js";

export type TFindManyProductOptions = Pick<
  ProductFindManyArgs,
  "orderBy" | "skip" | "take"
>;

export type TProductStockFilterQuery = {
  storeId?: string;
  minStock?: number;
  maxStock?: number;
  inStock?: boolean;
};

export type TProductStockWhere = NonNullable<
  ProductWhereInput["stocks"]
>["some"];
