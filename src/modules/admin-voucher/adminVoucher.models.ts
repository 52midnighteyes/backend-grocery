import type {
  VoucherFindManyArgs,
  VoucherOrderByWithRelationInput,
} from "../../../generated/prisma/models.js";

export type TFindManyVoucherOptions = Pick<
  VoucherFindManyArgs,
  "skip" | "take"
> & {
  orderBy?: VoucherOrderByWithRelationInput[];
};
