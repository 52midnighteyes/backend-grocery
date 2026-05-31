import argon2 from "argon2";
import { AppError } from "../../class/appError.js";
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import { findUserByEmailWithRolePermissions } from "../user/user.repository.js";
import type { TAdminLoginBody } from "./adminAuth.schemas.js";
import {
  buildAdminTokenPayload,
  hasAdminLoginPermission,
  sanitizeAdminAuthUser,
  assertAdminAccess,
} from "./adminAuth.helper.js";

export const loginAdminService = async (
  params: TAdminLoginBody,
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

export const refreshAdminTokenService = async (
  userId: string,
): Promise<TJwtTokenPayload> => {
  const user = await assertAdminAccess(userId);

  return buildAdminTokenPayload(user);
};

export const getAdminProfileService = async (userId: string) => {
  const user = await assertAdminAccess(userId);

  return sanitizeAdminAuthUser(user);
};
