import {
  UserOrderByWithRelationInput,
  UserWhereInput,
} from "../../../generated/prisma/models.js";
import type { TUserWithSensitiveFields } from "./userManagement.models.js";
import type { TGetManagedUsersQuery } from "./userManagement.schemas.js";

export const sanitizeManagedUser = <
  TUser extends TUserWithSensitiveFields | null
>(
  user: TUser
) => {
  if (!user) return null;

  const { password, roleId, storeId, ...safeUser } = user;
  return safeUser;
};

export const buildManagedUserWhere = (
  query: TGetManagedUsersQuery
): UserWhereInput => {
  const where: UserWhereInput = {
    deletedAt: null,
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

export const buildManagedUserOrderBy = (
  query: TGetManagedUsersQuery
): UserOrderByWithRelationInput => {
  if (query.sortBy === "roleName") {
    return { role: { name: query.sortOrder } };
  }

  if (query.sortBy === "storeName") {
    return { store: { name: query.sortOrder } };
  }

  return { [query.sortBy]: query.sortOrder };
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
