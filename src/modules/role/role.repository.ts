import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

const roleSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

const rolePermissionSelect = {
  permission: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
};

export const findRoles = async (db: TPrisma = prisma) => {
  return await db.role.findMany({
    where: {
      deletedAt: null,
    },
    select: roleSelect,
    orderBy: {
      name: "asc",
    },
  });
};

export const findRoleById = async (id: string, db: TPrisma = prisma) => {
  return await db.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      ...roleSelect,
      rolePermissions: {
        where: {
          deletedAt: null,
          permission: {
            deletedAt: null,
          },
        },
        select: rolePermissionSelect,
        orderBy: {
          permission: {
            name: "asc",
          },
        },
      },
    },
  });
};
