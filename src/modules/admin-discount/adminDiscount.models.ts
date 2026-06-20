import type {
  DiscountFindManyArgs,
  DiscountOrderByWithRelationInput,
} from "../../../generated/prisma/models.js";

export type TFindManyDiscountOptions = Pick<
  DiscountFindManyArgs,
  "skip" | "take"
> & {
  orderBy?: DiscountOrderByWithRelationInput[];
};
