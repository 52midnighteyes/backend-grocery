import { findManyCategories } from "./category.repository.js";

export const getCategoriesService = async () => {
  return await findManyCategories();
};
