import {
  UserOrderByWithRelationInput,
  UserUpdateInput,
  UserWhereInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import { hasPermission } from "../admin-auth/adminAuth.helper.js";
import { findRoleByIdWithPermissions } from "../admin-auth/adminAuth.repository.js";
import { findStoreById } from "../store/store.repository.js";
import type {
  TGetAdminAccountsQuery,
  TUpdateAdminAccountBody,
} from "./adminManagement.schemas.js";
import type { TAdminAccountWithSensitiveFields } from "./adminManagement.models.js";

export const sanitizeAdminAccount = <
  TAdminAccount extends TAdminAccountWithSensitiveFields | null,
>(
  adminAccount: TAdminAccount,
) => {
  if (!adminAccount) return null;

  const { password, roleId, storeId, ...safeAdminAccount } = adminAccount;
  return safeAdminAccount;
};

export const buildAdminAccountUpdateData = (
  params: TUpdateAdminAccountBody,
  hashedPassword?: string,
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
  query: TGetAdminAccountsQuery,
): UserWhereInput => {
  const where: UserWhereInput = {
    deletedAt: null,
    role: {
      deletedAt: null,
      rolePermissions: {
        some: {
          deletedAt: null,
          permission: {
            deletedAt: null,
            name: "admin:login",
          },
        },
      },
    },
  };

  const andConditions: UserWhereInput[] = [];

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

  if (andConditions.length) {
    where.AND = andConditions;
  }

  return where;
};

export const buildAdminAccountOrderBy = (
  query: TGetAdminAccountsQuery,
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

export const assertAdminRole = async (roleId: string) => {
  const role = await findRoleByIdWithPermissions(roleId);
  if (!role) throw new AppError(404, "Role was not found");

  if (!hasPermission(role, "admin:login")) {
    throw new AppError(400, "Role is not allowed for admin account");
  }

  return role;
};

export const assertStoreExists = async (storeId: string) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  return store;
};
