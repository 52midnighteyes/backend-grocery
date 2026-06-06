import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findRoleByName = async (name: string, db: TPrisma = prisma) => {
  return await db.role.findFirst({
    where: {
      name,
      deletedAt: null,
    },
  });
};

export const findRoleById = async (id: string, db: TPrisma = prisma) => {
  return await db.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const findRoleByIdWithPermissions = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      rolePermissions: {
        where: {
          deletedAt: null,
          permission: {
            deletedAt: null,
          },
        },
        include: {
          permission: true,
        },
      },
    },
  });
};
