import argon2 from "argon2";
import { AppError } from "../../class/appError.js";
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import { findUserByEmailWithRolePermissions } from "../user/user.repository.js";
import type { TAdminLoginBody } from "./adminAuth.schemas.js";
import {
  buildAdminSession,
  buildAdminTokenPayload,
  hasAdminLoginPermission,
  assertAdminAccess,
} from "./adminAuth.helper.js";
import type { TAdminSession } from "./adminAuth.models.js";

type TAdminAuthResult = {
  tokenPayload: TJwtTokenPayload;
  session: TAdminSession;
};

export const loginAdminService = async (
  params: TAdminLoginBody,
): Promise<TAdminAuthResult> => {
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

  return {
    tokenPayload: buildAdminTokenPayload(user),
    session: buildAdminSession(user),
  };
};

export const refreshAdminTokenService = async (
  userId: string,
): Promise<TAdminAuthResult> => {
  const user = await assertAdminAccess(userId);

  return {
    tokenPayload: buildAdminTokenPayload(user),
    session: buildAdminSession(user),
  };
};

export const getAdminProfileService = async (
  userId: string,
): Promise<TAdminSession> => {
  const user = await assertAdminAccess(userId);

  return buildAdminSession(user);
};
