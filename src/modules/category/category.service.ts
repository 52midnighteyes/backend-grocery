import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { buildCategoryOrderBy, buildCategoryWhere } from "./category.helper.js";
import {
  countCategories,
  findCategories,
  findCategoryById,
} from "./category.repository.js";
import type { TGetCategoriesQuery } from "./category.schemas.js";

export const getCategoriesService = async (params: TGetCategoriesQuery) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildCategoryWhere(params);
  const orderBy = buildCategoryOrderBy(params);

  const [categories, total] = await Promise.all([
    findCategories(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countCategories(where),
  ]);

  return {
    data: categories,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getCategoryByIdService = async (id: string) => {
  const category = await findCategoryById(id);
  if (!category) throw new AppError(404, "Category was not found");

  return category;
};
