import {
  UserOrderByWithRelationInput,
  UserUpdateInput,
  UserWhereInput,
} from "../../../generated/prisma/models.js";
import type {
  TGetAdminAccountsQuery,
  TUpdateAdminAccountBody,
} from "./adminManagement.schemas.js";
import type { TAdminAccountWithSensitiveFields } from "./adminManagement.models.js";

export const sanitizeAdminAccount = <
  TAdminAccount extends TAdminAccountWithSensitiveFields | null
>(
  adminAccount: TAdminAccount
) => {
  if (!adminAccount) return null;

  const { password, roleId, storeId, ...safeAdminAccount } = adminAccount;
  return safeAdminAccount;
};

export const buildAdminAccountUpdateData = (
  params: TUpdateAdminAccountBody,
  hashedPassword?: string
): UserUpdateInput => {
  return {
    name: params.name,
    email: params.email,
    password: hashedPassword,
    ...(params.roleId
      ? {
          role: {
            connect: {
              id: params.roleId,
            },
          },
        }
      : {}),
    ...(params.storeId === null
      ? {
          store: {
            disconnect: true,
          },
        }
      : params.storeId
      ? {
          store: {
            connect: {
              id: params.storeId,
            },
          },
        }
      : {}),
  };
};

export const buildAdminAccountWhere = (
  query: TGetAdminAccountsQuery
): UserWhereInput => {
  const where: UserWhereInput = {
    deletedAt: null,
    role: {
      deletedAt: null,
      OR: [{ name: "storeAdmin" }, { name: "superAdmin" }],
    },
  };

  const andConditions: UserWhereInput[] = [];

  if (query.id) andConditions.push({ id: query.id });
  if (query.roleId) andConditions.push({ roleId: query.roleId });
  if (query.storeId) andConditions.push({ storeId: query.storeId });

  if (query.q) {
    andConditions.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
        { role: { name: { contains: query.q, mode: "insensitive" } } },
        { store: { name: { contains: query.q, mode: "insensitive" } } },
      ],
    });
  }

  if (query.name) {
    andConditions.push({
      name: { contains: query.name, mode: "insensitive" },
    });
  }

  if (query.email) {
    andConditions.push({
      email: { contains: query.email, mode: "insensitive" },
    });
  }

  if (query.roleName) {
    andConditions.push({
      role: { name: { contains: query.roleName, mode: "insensitive" } },
    });
  }

  if (query.storeName) {
    andConditions.push({
      store: { name: { contains: query.storeName, mode: "insensitive" } },
    });
  }

  if (typeof query.isVerified === "boolean") {
    andConditions.push({ isVerified: query.isVerified });
  }

  if (query.createdFrom || query.createdTo) {
    andConditions.push({
      createdAt: {
        gte: query.createdFrom,
        lte: query.createdTo,
      },
    });
  }

  if (query.updatedFrom || query.updatedTo) {
    andConditions.push({
      updatedAt: {
        gte: query.updatedFrom,
        lte: query.updatedTo,
      },
    });
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  return where;
};

export const buildAdminAccountOrderBy = (
  query: TGetAdminAccountsQuery
): UserOrderByWithRelationInput => {
  if (query.sortBy === "roleName") {
    return { role: { name: query.sortOrder } };
  }

  if (query.sortBy === "storeName") {
    return { store: { name: query.sortOrder } };
  }

  return {
    [query.sortBy]: query.sortOrder,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
