import type { CategoryWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TFindManyCategoryOptions } from "./category.models.js";

export const findCategories = async (
  where: CategoryWhereInput,
  options: TFindManyCategoryOptions = {},
  db: TPrisma = prisma,
) => {
  return await db.category.findMany({
    where,
    ...options,
  });
};

export const countCategories = async (
  where: CategoryWhereInput,
  db: TPrisma = prisma,
) => {
  return await db.category.count({ where });
};

export const findCategoryById = async (
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};
