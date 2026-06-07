import type {
  CategoryOrderByWithRelationInput,
  CategoryWhereInput,
} from "../../../generated/prisma/models.js";
import type { TGetCategoriesQuery } from "./category.schemas.js";

export const buildCategoryWhere = (
  query: TGetCategoriesQuery,
): CategoryWhereInput => {
  const where: CategoryWhereInput = {
    deletedAt: null,
  };

  const andConditions: CategoryWhereInput[] = [];

  if (query.q) {
    andConditions.push({
      name: { contains: query.q, mode: "insensitive" },
    });
  }

  if (query.name) {
    andConditions.push({
      name: { contains: query.name, mode: "insensitive" },
    });
  }

  if (andConditions.length) where.AND = andConditions;

  return where;
};

export const buildCategoryOrderBy = (
  query: TGetCategoriesQuery,
): CategoryOrderByWithRelationInput => {
  return { [query.sortBy]: query.sortOrder };
};
