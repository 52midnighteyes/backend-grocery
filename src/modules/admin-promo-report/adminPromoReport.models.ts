import type {
  DiscountHistoryFindManyArgs,
  DiscountHistoryOrderByWithRelationInput,
  VoucherHistoryFindManyArgs,
  VoucherHistoryOrderByWithRelationInput,
} from "../../../generated/prisma/models.js";

export type TFindManyDiscountReportOptions = Pick<
  DiscountHistoryFindManyArgs,
  "skip" | "take"
> & {
  orderBy?: DiscountHistoryOrderByWithRelationInput[];
};

export type TFindManyVoucherReportOptions = Pick<
  VoucherHistoryFindManyArgs,
  "skip" | "take"
> & {
  orderBy?: VoucherHistoryOrderByWithRelationInput[];
};
