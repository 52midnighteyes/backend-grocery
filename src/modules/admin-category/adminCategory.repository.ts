import type { CategoryCreateInput, CategoryUpdateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findCategoryById = async (id: string, db: TPrisma = prisma) => {
  return await db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const findCategoryByName = async (
  name: string,
  db: TPrisma = prisma,
) => {
  return await db.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

export const findCategoriesByName = async (
  name: string,
  db: TPrisma = prisma,
) => {
  return await db.category.findMany({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

export const findCategoryByNameExceptId = async (
  name: string,
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.category.findFirst({
    where: {
      id: {
        not: id,
      },
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

export const countActiveProductsByCategoryId = async (
  categoryId: string,
  db: TPrisma = prisma,
) => {
  return await db.product.count({
    where: {
      categoryId,
      deletedAt: null,
    },
  });
};

export const createCategory = async (
  data: CategoryCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.category.create({ data });
};

export const updateCategory = async (
  id: string,
  data: CategoryUpdateInput,
  db: TPrisma = prisma,
) => {
  return await db.category.update({
    where: {
      id,
    },
    data,
  });
};

export const softDeleteCategory = async (
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.category.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const restoreCategory = async (
  id: string,
  data: CategoryUpdateInput,
  db: TPrisma = prisma,
) => {
  return await db.category.update({
    where: {
      id,
    },
    data: {
      ...data,
      deletedAt: null,
    },
  });
};
