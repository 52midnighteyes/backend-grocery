import { AppError } from "../../class/appError.js";
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import { findUserByIdWithRolePermissions } from "../user/user.repository.js";
import type { TAdminAuthUserWithSensitiveFields } from "./adminAuth.models.js";
import type { TAdminAuthTokenPayloadSource } from "./adminAuth.models.js";
import type { TAdminSession } from "./adminAuth.models.js";
import Jwt from "jsonwebtoken";
import {
  ADMIN_ACCESS_TOKEN_SECRET,
  ADMIN_REFRESH_TOKEN_SECRET,
} from "../../config/config.js";
import type { Response } from "express";
import {
  accessTokenConfig,
  refreshTokenConfig,
} from "../../constant/cookie-options.constant.js";

export const hasAdminLoginPermission = (user: {
  role: {
    rolePermissions: {
      permission: {
        name: string;
      };
    }[];
  };
}) => {
  return user.role.rolePermissions.some(
    (rolePermission) => rolePermission.permission.name === "admin:login"
  );
};

export const hasPermission = (
  subject: {
    rolePermissions: {
      permission: {
        name: string;
      };
    }[];
  },
  permissionName: string
) => {
  return subject.rolePermissions.some(
    (rolePermission) => rolePermission.permission.name === permissionName
  );
};

export const assertAdminAccess = async (userId: string) => {
  const user = await findUserByIdWithRolePermissions(userId);
  if (!user) throw new AppError(401, "Unauthorized");

  if (!hasAdminLoginPermission(user)) {
    throw new AppError(403, "Only admin users can access the admin dashboard");
  }

  return user;
};

export const buildAdminTokenPayload = (
  user: TAdminAuthTokenPayloadSource
): TJwtTokenPayload => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name as TJwtTokenPayload["role"],
    avatarUrl: user.avatar,
    isVerified: user.isVerified,
  };
};

export const buildAdminSession = (
  user: TAdminAuthTokenPayloadSource
): TAdminSession => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isVerified: user.isVerified,
    role: user.role.name,
    roleId: user.roleId,
    store: user.store
      ? {
          id: user.store.id,
          name: user.store.name,
          latitude: user.store.latitude,
          longitude: user.store.longitude,
        }
      : null,
  };
};

export const sanitizeAdminAuthUser = <
  TUser extends TAdminAuthUserWithSensitiveFields | null
>(
  user: TUser
) => {
  if (!user) return null;

  const { password, roleId, storeId, ...safeUser } = user;
  return safeUser;
};

export const setAdminAuthCookies = (
  res: Response,
  payload: TJwtTokenPayload
): void => {
  const accessToken = Jwt.sign(payload, ADMIN_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = Jwt.sign(payload, ADMIN_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("adminAccessToken", accessToken, accessTokenConfig);
  res.cookie("adminRefreshToken", refreshToken, refreshTokenConfig);
};
