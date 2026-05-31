import argon2 from "argon2";
import type { Response } from "express";
import { AppError } from "../../class/appError.js";
import { clearAuthCookies } from "../auth/auth.helper.js";
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import {
  findUserByEmailWithRolePermissions,
  findUserByIdWithRolePermissions,
} from "../user/user.repository.js";
import type { TAdminLoginBody } from "./adminAuth.schemas.js";
import {
  hasAdminLoginPermission,
  sanitizeAdminAuthUser,
} from "./adminAuth.helper.js";

const buildAdminTokenPayload = (user: {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
  role: {
    name: string;
  };
}): TJwtTokenPayload => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name as "superAdmin" | "storeAdmin",
    avatarUrl: user.avatar,
    isVerified: user.isVerified,
  };
};

const assertAdminAccess = async (userId: string) => {
  const user = await findUserByIdWithRolePermissions(userId);
  if (!user) throw new AppError(401, "Unauthorized");

  if (!hasAdminLoginPermission(user)) {
    throw new AppError(403, "Only admin users can access the admin dashboard");
  }

  return user;
};

export const loginAdminService = async (
  params: TAdminLoginBody
): Promise<TJwtTokenPayload> => {
  const user = await findUserByEmailWithRolePermissions(params.email);
  if (!user || !user.password) {
    throw new AppError(401, "Email or password is incorrect");
  }

  const isPasswordMatch = await argon2.verify(user.password, params.password);
  if (!isPasswordMatch) {
    throw new AppError(401, "Email or password is incorrect");
  }

  if (!hasAdminLoginPermission(user)) {
    throw new AppError(403, "Only admin users can access the admin dashboard");
  }

  return buildAdminTokenPayload(user);
};

export const logoutAdminService = (res: Response) => {
  clearAuthCookies(res);
};

export const refreshAdminTokenService = async (
  userId: string
): Promise<TJwtTokenPayload> => {
  const user = await assertAdminAccess(userId);

  return buildAdminTokenPayload(user);
};

export const getAdminProfileService = async (userId: string) => {
  const user = await assertAdminAccess(userId);

  return sanitizeAdminAuthUser(user);
};
