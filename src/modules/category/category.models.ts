import type { CategoryFindManyArgs } from "../../../generated/prisma/models.js";

export type TFindManyCategoryOptions = Pick<
  CategoryFindManyArgs,
  "orderBy" | "skip" | "take"
>;
