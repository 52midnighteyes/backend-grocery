import {
  UserCreateInput,
  UserFindManyArgs,
  UserUpdateInput,
  UserWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";

type TFindManyUserOptions = Pick<UserFindManyArgs, "orderBy" | "skip" | "take">;

export const findUserByEmail = async (email: string, db: TPrisma = prisma) => {
  return await db.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
};

export const findUserByEmailWithRolePermissions = async (
  email: string,
  db: TPrisma = prisma
) => {
  return await db.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    include: {
      store: true,
      role: {
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
      },
    },
  });
};

export const findUserByIdWithRolePermissions = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      store: true,
      role: {
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
      },
    },
  });
};

export const findUserByEmailExceptId = async (
  email: string,
  id: string,
  db: TPrisma = prisma
) => {
  return await db.user.findFirst({
    where: {
      email,
      id: {
        not: id,
      },
      deletedAt: null,
    },
  });
};

export const createUserByAdmin = async (
  params: UserCreateInput,
  db: TPrisma = prisma
) => {
  return await db.user.create({
    data: params,
    include: {
      role: true,
      store: true,
    },
  });
};

export const findUsers = async (
  where: UserWhereInput,
  options: TFindManyUserOptions = {},
  db: TPrisma = prisma
) => {
  return await db.user.findMany({
    where,
    include: {
      role: true,
      store: true,
    },
    ...options,
  });
};

export const countUsers = async (
  where: UserWhereInput,
  db: TPrisma = prisma
) => {
  return await db.user.count({ where });
};

export const findUserById = async (id: string, db: TPrisma = prisma) => {
  return await db.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      role: true,
      store: true,
    },
  });
};

export const updateUserByAdmin = async (
  id: string,
  data: UserUpdateInput,
  db: TPrisma = prisma
) => {
  return await db.user.update({
    where: {
      id,
    },
    data,
    include: {
      role: true,
      store: true,
    },
  });
};

export const softDeleteUserByAdmin = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.user.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const createAdminAccount = async (
  params: UserCreateInput,
  db: TPrisma = prisma
) => {
  return await db.user.create({
    data: params,
    include: {
      role: true,
      store: true,
    },
  });
};

export const findAdminAccounts = async (
  where: UserWhereInput,
  options: TFindManyUserOptions = {},
  db: TPrisma = prisma
) => {
  return await db.user.findMany({
    where,
    include: {
      role: true,
      store: true,
    },
    ...options,
  });
};

export const findStoreDashboardAdmins = async (
  where: UserWhereInput,
  db: TPrisma = prisma
) => {
  return await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isVerified: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const countAdminAccounts = async (
  where: UserWhereInput,
  db: TPrisma = prisma
) => {
  return await db.user.count({ where });
};

export const findAdminAccountById = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.user.findFirst({
    where: {
      id,
      deletedAt: null,
      role: {
        deletedAt: null,
        OR: [
          { name: "storeAdmin" },
          { name: "superAdmin" },
        ],
      },
    },
    include: {
      role: true,
      store: true,
    },
  });
};

export const updateAdminAccount = async (
  id: string,
  data: UserUpdateInput,
  db: TPrisma = prisma
) => {
  return await db.user.update({
    where: {
      id,
    },
    data,
    include: {
      role: true,
      store: true,
    },
  });
};

export const softDeleteAdminAccount = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.user.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
