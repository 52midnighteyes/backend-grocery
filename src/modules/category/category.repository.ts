import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findCategoryById = async (id: string, db: TPrisma = prisma) => {
  return db.category.findUnique({
    where: {
      id,
    },
  });
};
