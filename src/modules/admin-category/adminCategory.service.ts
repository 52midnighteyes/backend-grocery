import { AppError } from "../../class/appError.js";
import {
  countActiveProductsByCategoryId,
  createCategory,
  findCategoriesByName,
  findCategoryById,
  findCategoryByNameExceptId,
  restoreCategory,
  softDeleteCategory,
  updateCategory,
} from "./adminCategory.repository.js";
import { normalizeCategoryName } from "./adminCategory.helper.js";
import type {
  TCreateCategoryBody,
  TUpdateCategoryBody,
} from "./adminCategory.schemas.js";

export const createCategoryService = async (params: TCreateCategoryBody) => {
  const name = normalizeCategoryName(params.name);
  const existingCategories = await findCategoriesByName(name);
  const activeCategory = existingCategories.find(
    (category) => category.deletedAt === null,
  );

  if (activeCategory) {
    throw new AppError(400, "Category name is already in use");
  }

  const deletedCategory =
    existingCategories.find((category) => category.name === name) ??
    existingCategories[0];

  if (deletedCategory) {
    return await restoreCategory(deletedCategory.id, {
      name,
    });
  }

  return await createCategory({
    name,
  });
};

export const updateCategoryService = async (
  id: string,
  params: TUpdateCategoryBody,
) => {
  const category = await findCategoryById(id);
  if (!category) throw new AppError(404, "Category was not found");

  const name = params.name ? normalizeCategoryName(params.name) : undefined;

  if (name && name !== category.name) {
    const existingCategory = await findCategoryByNameExceptId(name, id);
    if (existingCategory) {
      throw new AppError(400, "Category name is already in use");
    }
  }

  return await updateCategory(id, {
    name,
  });
};

export const deleteCategoryService = async (id: string) => {
  const category = await findCategoryById(id);
  if (!category) throw new AppError(404, "Category was not found");

  const activeProductCount = await countActiveProductsByCategoryId(id);
  if (activeProductCount > 0) {
    throw new AppError(400, "Category is still used by active products");
  }

  await softDeleteCategory(id);

  return category;
};
