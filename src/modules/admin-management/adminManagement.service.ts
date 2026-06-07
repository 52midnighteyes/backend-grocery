import argon2 from "argon2";
import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import {
  countAdminAccounts,
  createAdminAccount,
  findAdminAccountById,
  findAdminAccounts,
  findUserByEmail,
  findUserByEmailExceptId,
  softDeleteAdminAccount,
  updateAdminAccount,
} from "../user/user.repository.js";
import {
  assertAdminRole,
  assertStoreExists,
  buildAdminAccountOrderBy,
  buildAdminAccountUpdateData,
  buildAdminAccountWhere,
  sanitizeAdminAccount,
} from "./adminManagement.helper.js";
import type {
  TCreateAdminAccountBody,
  TGetAdminAccountsQuery,
  TUpdateAdminAccountBody,
} from "./adminManagement.schemas.js";

export const createAdminAccountService = async (
  params: TCreateAdminAccountBody,
) => {
  const existingUser = await findUserByEmail(params.email);
  if (existingUser) throw new AppError(400, "Email is already in use");

  const role = await assertAdminRole(params.roleId);
  const isStoreAdmin = role.name === "storeAdmin";

  if (isStoreAdmin && !params.storeId) {
    throw new AppError(400, "Store ID is required for store admin");
  }

  const store =
    isStoreAdmin && params.storeId
      ? await assertStoreExists(params.storeId)
      : null;

  const hashedPassword = await argon2.hash(params.password);
  const adminAccount = await createAdminAccount({
    name: params.name,
    email: params.email,
    password: hashedPassword,
    isVerified: true,
    role: {
      connect: {
        id: role.id,
      },
    },
    ...(store
      ? {
          store: {
            connect: {
              id: store.id,
            },
          },
        }
      : {}),
  });

  return sanitizeAdminAccount(adminAccount);
};

export const getAdminAccountsService = async (
  params: TGetAdminAccountsQuery,
  requesterId: string,
) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  let where = buildAdminAccountWhere(params);

  const requester = await findAdminAccountById(requesterId);
  if (requester?.role.name === "storeAdmin" && requester.storeId) {
    where = {
      ...where,
      storeId: requester.storeId,
    };
  }

  const orderBy = buildAdminAccountOrderBy(params);

  const [adminAccounts, total] = await Promise.all([
    findAdminAccounts(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countAdminAccounts(where),
  ]);

  return {
    data: adminAccounts.map((adminAccount) =>
      sanitizeAdminAccount(adminAccount),
    ),
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getAdminAccountService = async (
  id: string,
  requesterId: string,
) => {
  const adminAccount = await findAdminAccountById(id);
  if (!adminAccount) throw new AppError(404, "Admin account was not found");

  const requester = await findAdminAccountById(requesterId);
  if (
    requester?.role.name === "storeAdmin" &&
    requester.storeId &&
    adminAccount.storeId !== requester.storeId
  ) {
    throw new AppError(404, "Admin account was not found");
  }

  return sanitizeAdminAccount(adminAccount);
};

export const updateAdminAccountService = async (
  id: string,
  params: TUpdateAdminAccountBody,
) => {
  const adminAccount = await findAdminAccountById(id);
  if (!adminAccount) throw new AppError(404, "Admin account was not found");

  if (params.email) {
    const existingUser = await findUserByEmailExceptId(params.email, id);
    if (existingUser) throw new AppError(400, "Email is already in use");
  }

  const role = params.roleId ? await assertAdminRole(params.roleId) : null;
  const nextRoleName = role?.name ?? adminAccount.role.name;

  if (params.storeId) {
    await assertStoreExists(params.storeId);
  }

  if (
    nextRoleName === "storeAdmin" &&
    params.storeId !== null &&
    !params.storeId &&
    !adminAccount.storeId
  ) {
    throw new AppError(400, "Store ID is required for store admin");
  }

  const hashedPassword = params.password
    ? await argon2.hash(params.password)
    : undefined;
  const data = buildAdminAccountUpdateData(
    {
      ...params,
      storeId: nextRoleName === "superAdmin" ? null : params.storeId,
    },
    hashedPassword,
  );

  const updatedAdminAccount = await updateAdminAccount(id, data);
  return sanitizeAdminAccount(updatedAdminAccount);
};

export const deleteAdminAccountService = async (id: string) => {
  const adminAccount = await findAdminAccountById(id);
  if (!adminAccount) throw new AppError(404, "Admin account was not found");

  const user = await softDeleteAdminAccount(id);

  return sanitizeAdminAccount(user);
};
